from firebase_admin import credentials, firestore, initialize_app
import firebase_admin 
import os
import sys
base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.append(base_dir)
credential_path = os.getenv('FIREBASE_CREDENTIAL_PATH', os.path.join(base_dir, 'backend', 'firestore_connection', 'b27project-31bde-firebase-adminsdk-ybhhu-2459f43c40.json'))
import logging



logger = logging.getLogger(__name__)

if not firebase_admin._apps:
  cred = credentials.Certificate(credential_path)
  default_app = initialize_app(cred)
db = firestore.client()


def connect_firebase():
  users_ref = db.collection('users')
  return users_ref

def video_url_to_firestore():
  video_ref = db.collection('videos')
  return video_ref

def connect_signature_database():
  signature_ref=db.collection('signature')
  return signature_ref


def temp_video_url_to_firestore():
  video_ref = db.collection('videos_to_test')
  return video_ref


