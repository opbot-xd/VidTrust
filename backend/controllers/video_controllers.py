from flask import jsonify,request,make_response
import os
from dotenv import load_dotenv
from urllib.parse import urlencode
import jwt
import requests
import uuid
import time
from backend.audio_analysis.aud import add_noise_to_audio, extract_audio, plot_audio_waveforms, replace_audio_in_video
from backend.audio_analysis.audio_to_gemini_api import compare_transcript
from backend.audio_analysis.convert import stereo_to_mono
from backend.audio_analysis.gemini_api import gemini_insights
from backend.deepfake_model.deepfake_image_check import check_deepfake_image
from google_video_api.gemini_report_generation import generate_report
from google_video_api.google_api_video import detect_potential_tampering
from firestore_connection.firestore     import video_url_to_firestore,temp_video_url_to_firestore
import logging
from controllers.signature_controllers import convert_mp4_to_mkv, download_video, update_video_on_supabase,upload_signed_video,verify_signed_video
from google.cloud import storage
from datetime import timedelta
logger = logging.getLogger(__name__)

config = {
    'client_id': os.getenv('GOOGLE_CLIENT_ID'),
    'client_secret': os.getenv('GOOGLE_CLIENT_SECRET'),
    'auth_url': 'https://accounts.google.com/o/oauth2/v2/auth',
    'token_url': 'https://oauth2.googleapis.com/token',
    'redirect_url': os.getenv('REDIRECT_URL'),
    'client_url': os.getenv('CLIENT_URL'),
    'token_secret': os.getenv('TOKEN_SECRET'),
    'token_expiration': 36000,
    'post_url': 'https://jsonplaceholder.typicode.com/posts',
}



def video_url():
    data = request.json
    title = data.get('title')
    imageUrl = data.get('imageUrl')
    videoUrl = data.get('videoUrl')
    date = data.get('date')
    token = request.cookies.get('token')
    decoded_token = jwt.decode(token, config['token_secret'],algorithms=['HS256'])
    user_dictionary = decoded_token.get('user')
    email = user_dictionary.get('email')
    name = user_dictionary.get('name')
    video_struct = {
        "email" :email,
        "title":title,
        "imageUrl":imageUrl,
        "videoUrl":videoUrl,
        "date":date
    }
    user_data = {
        "email":email,
        "name":name
    }
    id = str(uuid.uuid4())
    video_ref = video_url_to_firestore()
    video_ref.document(id).set(video_struct)
    print("ye lo tumhare upload signed video function ke arguments",user_data,videoUrl)
    add_noise_to_video(videoUrl)
    already_uploaded = upload_signed_video(user_data,videoUrl)
    if already_uploaded == True:
        return jsonify({"status": "failure", "message": "Video already uploaded"}), 200
    elif already_uploaded == False:
        return jsonify({"status": "success", "message": "Data received and uploaded"}), 200


def video_fetch_url():
    logger.info("Entering video_fetch_url function")
    try:
        token = request.cookies.get('token')
        if not token:
            logger.error("No token found in cookies")
            return jsonify({"error": "No authentication token found"}), 401

        logger.info(f"Token received: {token[:10]}...")  

        try:
            decoded_token = jwt.decode(token, config['token_secret'], algorithms=["HS256"])
        except jwt.InvalidTokenError:
            logger.error("Invalid token")
            return jsonify({"error": "Invalid authentication token"}), 401

        user_dictionary = decoded_token.get('user')
        if not user_dictionary:
            logger.error("No user dictionary in decoded token")
            return jsonify({"error": "Invalid token structure"}), 401

        email = user_dictionary.get('email')
        if not email:
            logger.error("No email found in user dictionary")
            return jsonify({"error": "Email not found in token"}), 401

        logger.info(f"Fetching videos for email: {email}")

        video_ref = video_url_to_firestore()
        query = video_ref.where('email', '==', email)
        logger.info(f"Query created: {query._filters_pb}")

        docs = query.stream()
        results = []
        for doc in docs:
            data = doc.to_dict()
            results.append({
                'id': doc.id,
                'email': data.get('email'),
                'title': data.get('title'),
                'imageUrl': data.get('imageUrl'),
                'videoUrl': data.get('videoUrl')
            })
            logger.info(f"Document found: {doc.id}")

        logger.info(f"Total documents found: {len(results)}")

        if not results:
            logger.warning(f"No documents found for email: {email}")

        return jsonify(results)

    except Exception as e:
        logger.exception(f"An error occurred: {str(e)}")
        return jsonify({"error": "An internal error occurred"}), 500

def test_video():
    data = request.json
    name = data.get('name')
    videoUrl = data.get('videoUrl')
    # signedUrl=data.get('signedUrl')
    video_struct = {
        "name" :name,
        "videoUrl":videoUrl,
        # "signedUrl":signedUrl
    }
    id = str(uuid.uuid4())
    video_ref = video_url_to_firestore()
    video_ref.document(id).set(video_struct)
    def deepfake_checking(frames):
        deepfake_report=0
        deepfake_check_array=[]  #  array to store result of each frame
        for _ in frames:
            deepfake_check_array.append(check_deepfake_image(_))
        real=fake=0
        for _ in deepfake_check_array:
            if _:real+=1
            else:fake+=1
        deepfake_report=fake/(real+fake) #  % changes of being fake
        return deepfake_report

    # message = {
    #     'Signature verification result': signature_verification_result,
    #     'Tampering detection result': video_intelligence_report,
    #     'Audio analysis result':audio_analysis_report,
    #     'Audio similarity percentage':similarity_percentage,
    #     '% deepfake chances':deepfake_report
    # }
    signature_verification_result,original_video_url,is_video,frames=verify_signed_video(videoUrl)
    if is_video:
        signedUrl=upload_to_google_bucket(videoUrl)
        print("ye lo tumhari signedUrl",signedUrl)
        audio_analysis_report,similarity_percentage=audio_analysis(videoUrl,original_video_url)
        tampering_detection_result=detect_potential_tampering(signedUrl)
        video_intelligence_report=generate_report(tampering_detection_result)
        deepfake_value=deepfake_checking(frames)
        message = {
            'Signature verification result': signature_verification_result,
            'Tampering detection result': video_intelligence_report,
            'Audio analysis result':audio_analysis_report,
            'Audio similarity percentage':similarity_percentage,
            '% deepfake chances':deepfake_value
        }
        return jsonify({"status": "success", "message": message,"is_video":True}), 200
    elif not is_video:
        signedUrl=upload_to_google_bucket(videoUrl)
        print("ye lo tumhari signedUrl",signedUrl)
        tampering_detection_result=detect_potential_tampering(signedUrl)
        video_intelligence_report=generate_report(tampering_detection_result)
        deepfake_value=deepfake_checking(frames)
        message = {
            'Signature verification result': signature_verification_result,
            'Tampering detection result': video_intelligence_report,
            '% deepfake chances':deepfake_value
        }
        return jsonify({"status": "success", "message": message,"is_video":False}), 200
def delete_video():
    data = request.json
    name = data.get('name')
    
    if not name:
        return jsonify({"status": "error", "message": "Name is required"}), 400
    video_ref = temp_video_url_to_firestore()
    query = video_ref.where('name', '==', name)
    docs = query.stream()

    deleted = False
    for doc in docs:
        doc.reference.delete()
        deleted = True

    if deleted:
        return jsonify({"status": "success", "message": f"Video(s) with name '{name}' deleted successfully"}), 200
    else:
        return jsonify({"status": "not found", "message": f"No video found with name '{name}'"}), 404

def mp4_converter():
    data = request.json
    url = data.get('url')
    if not url:
        return jsonify({"status": "error", "message": "Url is required"}), 400
    print("ye hai tumhari url",url)
    input_file_name = url.split('/')[-1]
    output_file_name = input_file_name[:-4] + '.mkv'
    print("mai convert karne jaa rha hu",input_file_name,output_file_name)
    return_url = convert_mp4_to_mkv(url,input_file_name,output_file_name)
    print("maine return url dhoondh li",return_url)
    return jsonify({"data":f'{return_url}'})

def upload_to_google_bucket(video_url):
    filename=video_url.split("/")[-1]
    print("ye hai tumhara video url aur filename",video_url,filename)
    local_video_path='local_video_path.mkv'
    download_video(video_url,local_video_path)
    storage_client=storage.Client()
    storage_client.bucket("deenank_bucket").blob(filename).upload_from_filename(local_video_path)
    url = f'gs://deenank_bucket/{filename}'
    os.remove(local_video_path)
    return url


def add_noise_to_video(video_url):
    original_audio="original_audio.wav"
    noisy_audio="noisy_audio.wav"
    local_video_path="local_video.mkv"
    output_video_path="output_video.mkv"
    remote_file_path=video_url.split("/")[-1]
    download_video(video_url,local_video_path)
    extract_audio(local_video_path,original_audio)
    add_noise_to_audio(original_audio, noisy_audio, 0.5)
    replace_audio_in_video(local_video_path, noisy_audio, output_video_path)
    update_video_on_supabase(output_video_path,remote_file_path)
    time.sleep(10)
    # os.remove(local_video_path)
    os.remove(output_video_path)
    os.remove(original_audio)
    os.remove(noisy_audio)

def audio_analysis(test_video_url,original_video_url):
    original_audio="original_audio.wav"
    original_audio_mono="original_audio_mono.wav"
    test_audio="test_audio.wav"
    test_audio_mono="test_audio_mono.wav"
    graph="plot.png"
    extract_audio(test_video_url,test_audio)
    extract_audio(original_video_url,original_audio)
    plot_audio_waveforms(original_audio,test_audio)
    report=gemini_insights(graph)
    stereo_to_mono(original_audio,original_audio_mono)
    stereo_to_mono(test_audio,test_audio_mono)
    similarity_percentage=compare_transcript(original_audio_mono,test_audio_mono)
    os.remove(original_audio)
    os.remove(test_audio)
    os.remove(original_audio_mono)
    os.remove(test_audio_mono)
    os.remove(graph)
    return report,similarity_percentage


