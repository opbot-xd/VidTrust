from cryptography.hazmat.primitives.asymmetric import rsa,padding
from cryptography.hazmat.primitives import serialization,hashes
from cryptography.exceptions import InvalidSignature
from cryptography.hazmat.backends import default_backend
import cv2
import json
import base64
import ffmpeg
import os
import sys
import requests
from supabase import create_client,Client
import subprocess
from dotenv import load_dotenv
import zlib
load_dotenv()

supabase_url = os.environ['SUPABASE_URL']
supabase_anon_key = os.environ['SUPABASE_ANON_KEY']
client:Client = create_client(supabase_url, supabase_anon_key)

base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
print(base_dir)
sys.path.append(base_dir)
from backend.firestore_connection.firestore import connect_signature_database

def generate_key():
    private_key = rsa.generate_private_key(
        public_exponent=65537, 
        key_size=2048
        )
    private_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.TraditionalOpenSSL,
        encryption_algorithm=serialization.NoEncryption()
        )

    public_key = private_key.public_key()
    public_pem = public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    )

    print("Public and Private keys generated successfully.", private_pem,public_pem)
    return private_pem,public_pem

# def frame_capture(path):
#     cap=cv2.VideoCapture(path)
#     fps=cap.get(cv2.CAP_PROP_FPS)
#     frame_interval=int(fps)
#     frames=[]
#     frame_idx=0

#     while True:
#         cap.set(cv2.CAP_PROP_POS_FRAMES,frame_idx)
#         ret,frame=cap.read()
#         if not ret:
#             break

#         frames.append(frame)
#         frame_idx+=frame_interval

#     cap.release()
#     return frames

def frame_capture(path: str) -> List:
    """
    Captures frames from a video file at intervals based on the video's frames per second (FPS).
    
    Args:
        path (str): The file path of the video to be processed.

    Returns:
        List: A list of frames captured from the video with a rate 1 frame per second. 
    """
    cap = cv2.VideoCapture(path)
    fps = cap.get(cv2.CAP_PROP_FPS)
    frame_interval = int(fps)
    frames: List = []
    frame_idx = 0

    while True:
        cap.set(cv2.CAP_PROP_POS_FRAMES, frame_idx)
        ret, frame = cap.read()
        if not ret:
            break

        frames.append(frame)
        frame_idx += frame_interval

    cap.release()
    return frames


def encode_frame_to_base64(frame):
    frame_resized = cv2.resize(frame, (640, 360), interpolation=cv2.INTER_AREA)
    is_success, buffer = cv2.imencode(".jpg", frame_resized, [int(cv2.IMWRITE_JPEG_QUALITY), 50])
    frame_base64 = base64.b64encode(buffer).decode('utf-8')
    return frame_base64

def extract_metadata(video_path):
    probe=ffmpeg.probe(video_path,cmd="C:/ffmpeg/bin/ffprobe.exe")
    video_stream=next((stream for stream in probe['streams'] if stream['codec_type']=='video'),None)
    print("this is the verifier's video's metadata",video_stream)
    return video_stream

def extract_signature_and_public_key(video_path):
    ffmpeg_command=['C:/ffmpeg/bin/ffprobe','-v','quiet','-print_format','json','-show_format' ,video_path]
    result = subprocess.run(ffmpeg_command,capture_output=True,text=True)
    metadata=json.loads(result.stdout)
    print("this might be your metadata\n\n\n\n",metadata)
    tags = metadata['format']['tags']["['SIGNATURE"]
    values=tags.split("', 'public_key=")

    signature_b64=values[0]
    public_key_b64=values[1].rstrip("']")

    print(signature_b64)
    print(public_key_b64)

    signature = base64.b64decode(signature_b64)
    public_key = base64.b64decode(public_key_b64)

    print("Signature:", signature)
    print("Public Key:", public_key)

    return public_key,signature


def set_signature_and_public_key(local_video_path,output_video_path, signature, public_pem):
    signature_b64 = base64.b64encode(signature).decode('utf-8')
    public_pem_b64 = base64.b64encode(public_pem).decode('utf-8')
    print(signature_b64,"\n\n",public_pem_b64)

    metadata_args = {
        'metadata': [
            f'signature={signature_b64}',
            f'public_key={public_pem_b64}',
        ]
    }
    print(metadata_args)
    input_stream=ffmpeg.input(local_video_path)
    output_stream=input_stream.output(output_video_path,vcodec='copy',acodec='copy', **metadata_args)
    output_stream.run(overwrite_output=True)


def update_video_on_supabase(local_file_path, remote_file_name):
    with open(local_file_path, "rb") as file:
        client.storage.from_("video").update(remote_file_name, file)

def upload_video_to_supabase(local_file_path,remote_file_name):
    with open(local_file_path,"rb") as file:
        client.storage.from_("video").upload(remote_file_name,file)

def remove_video_from_supabase(local_file_path):
    client.storage.from_('video').remove(local_file_path)    


def load_public_key(pem_data):
    return serialization.load_pem_public_key(
        pem_data, 
        backend=default_backend()
    )

def combine_data(user_data,metadata,frames):
    encoded_frames=[encode_frame_to_base64(frame) for frame in frames]
    compressed_frames = zlib.compress(''.join(encoded_frames).encode('utf-8'))

    combined_data={
        "user_data":user_data,
        "metadata":metadata,
        "frames":base64.b64encode(compressed_frames).decode('utf-8')
    } 
    
    combined_data_str=json.dumps(combined_data)
    return combined_data_str


def sign_combined_data(private_pem,user_data,metadata,frames):
    private_key=serialization.load_pem_private_key(private_pem,password=None)
    combined_data=combine_data(user_data,metadata,frames)
    signature=private_key.sign(
        combined_data.encode('utf-8'),
        padding.PSS(
            mgf=padding.MGF1(hashes.SHA256()),
            salt_length=padding.PSS.MAX_LENGTH
        ),
        hashes.SHA256()
    )

    print(signature)
    return signature,combined_data

def verify_signature(user_data,metadata,frames,signature,public_pem,metadata_original):
    public_key = load_public_key(public_pem)  
    combined_data=combine_data(user_data,metadata,frames)
    print(signature,public_key)
    print("ye hai tumhara original metadata",metadata_original)
    print("ye hai tumhara naya metadata",metadata)
    try:
        public_key.verify(
            signature,
            combined_data.encode('utf-8'),
            padding.PSS(
                mgf=padding.MGF1(hashes.SHA256()),
                salt_length=padding.PSS.MAX_LENGTH
            ),
            hashes.SHA256()
        )
        print("authentic")
        return "The video is authentic."
    except InvalidSignature:
        print("not authentic")
        return "The video has been tampered with or is not authentic."

def download_video(url, local_path):
    response = requests.get(url)
    with open(local_path, 'wb') as file:
        file.write(response.content)

def upload_signed_video(user_data,video_url):
    local_video_path = 'local_video_sign.mkv'
    output_video_path='output_video_sign.mkv'
    split_url=video_url.split("/")
    remote_file=split_url[len(split_url)-1]
    print("ye hai tumhari remote file",remote_file)
    download_video(video_url, local_video_path)
    signature_ref=connect_signature_database()
    private_pem,public_pem=generate_key()
    print(local_video_path)
    metadata=extract_metadata(local_video_path)
    frames=frame_capture(local_video_path)
    signature,combined_data=sign_combined_data  (private_pem,user_data,metadata,frames)
    data={
    "private_pem":private_pem,
    "public_pem":public_pem,
    "signature":signature,
    "combined_data":combined_data,
    "video_url":video_url
    }
    query = signature_ref.where('signature', '==', signature)
    docs = query.stream()
    results = []
    for doc in docs:
        data = doc.to_dict()
        results.append({
            'combined_data':data.get('combined_data'),
            'video_url': data.get('video_url')
        })
    if len(results) == 0:
        signature_ref.add(data)
        set_signature_and_public_key(local_video_path,output_video_path,signature,public_pem)
        update_video_on_supabase(output_video_path,remote_file)
        # os.remove(local_video_path)
        os.remove(output_video_path)
        return {'already_uploaded':False}
    elif len(results) != 0:
        return {'already_uploaded':True}

def verify_signed_video(video_url):
    local_video_path='local_video_check.mkv'
    download_video(video_url, local_video_path)
    public_key, signature = extract_signature_and_public_key(local_video_path)
    metadata = extract_metadata(local_video_path)
    frames = frame_capture(local_video_path)
    user_data, original_video_url, metadata_original = get_user_and_video_data(signature)
    # Check if it's a short clip
    is_short_clip = metadata['tags']['DURATION'] < metadata_original['tags']['DURATION']
    if is_short_clip:
        signature_verification_result = verify_shorts(local_video_path, public_key, signature, user_data, metadata, metadata_original)
        is_video = False
    else:
        
        metadata['start_pts'] = metadata_original['start_pts']
        metadata['start_time'] = metadata_original['start_time']
        metadata['tags']['DURATION'] = metadata_original['tags']['DURATION']
        signature_verification_result = verify_signature(user_data, metadata, frames, signature, public_key, metadata_original)
        is_video = True
    os.remove(local_video_path)
    return signature_verification_result, original_video_url, is_video, frames
def verify_shorts(local_video_path, public_key, signature, user_data, metadata, metadata_original):
    watermark = extract_watermark(local_video_path)
    is_signature_valid = verify_watermark_signature(watermark, signature, public_key)
    is_metadata_consistent = check_metadata_consistency(metadata, metadata_original)
    verification_result = {
        "signature_valid": is_signature_valid,
        "metadata_consistent": is_metadata_consistent,
        "overall_result": is_signature_valid and is_metadata_consistent
    }
    return verification_result


def convert_mp4_to_mkv(video_url,input_file, output_file):
    download_video(video_url,input_file)
    ffmpeg.input(input_file).output(output_file).run()
    upload_video_to_supabase(output_file,output_file)
    remove_video_from_supabase(input_file)
    os.remove(input_file)
    os.remove(output_file)
    return video_url[:-4]+".mkv"

def get_user_and_video_data(signature):
    signature_ref = connect_signature_database()
    query = signature_ref.where('signature', '==', signature)
    docs = query.stream()
    results = []
    for doc in docs:
        data = doc.to_dict()
        results.append({
            'combined_data':data.get('combined_data'),
            'video_url': data.get('video_url')
        })
    user_data=json.loads(results[0]['combined_data'])['user_data']
    video_url=results[0]['video_url']
    metadata=json.loads(results[0]['combined_data'])['metadata']

    print("ye rha tumhara user_data aur video_url",user_data,video_url)
    return user_data,video_url,metadata

