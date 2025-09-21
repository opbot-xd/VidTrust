import wave
from google.cloud import speech_v1p1beta1 as speech
import os
import io
from google.oauth2 import service_account
from difflib import SequenceMatcher

client_file = "b27project-e4206a0ff48a.json"
credentials = service_account.Credentials.from_service_account_file(client_file)
client = speech.SpeechClient(credentials=credentials)

def get_transcript(url):
    with wave.open(url, 'rb') as audio_file:
        channels = audio_file.getnchannels()
        print(f"{url} has {channels} channel(s)")

    config = speech.RecognitionConfig(
        encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
        sample_rate_hertz=44100,
        language_code='en-US',
        model='video'
    )
    with io.open(url, "rb") as audio_file:
        content = audio_file.read()

    audio = speech.RecognitionAudio(content=content)
    operation = client.long_running_recognize(config=config, audio=audio)

    print("Waiting for operation to complete ...")
    response = operation.result(timeout=200)
    
    full_transcript = ""
    for result in response.results:
        full_transcript += result.alternatives[0].transcript + " "
    
    return full_transcript.strip()

def calculate_similarity(text1, text2):
    return SequenceMatcher(None, text1, text2).ratio()

def compare_transcript(url1, url2):
    print("Transcribing first audio...")
    t1 = get_transcript(url1)
    print("Transcribing second audio...")
    t2 = get_transcript(url2)
    
    similarity = calculate_similarity(t1, t2)
    similarity_percentage = similarity * 100
    
    print(f"Transcript 1: {t1}")
    print(f"Transcript 2: {t2}")
    print(f"Similarity: {similarity_percentage:.2f}%")
    
    return similarity_percentage

# # Example usage
# url1 = "gs://deenank_bucket/output_mono.wav"
# url2 = "gs://deenank_bucket/output_mono.wav"
# similarity = compare_transcript(url1, url2)