from flask import jsonify,request,make_response
import os
from dotenv import load_dotenv
from urllib.parse import urlencode
import jwt
import requests
import uuid
from firestore_connection.firestore import connect_firebase

load_dotenv()

config = {
    'client_id': os.getenv('GOOGLE_CLIENT_ID'),
    'client_secret': os.getenv('GOOGLE_CLIENT_SECRET'),
    'auth_url': os.getenv('GOOGLE_AUTH_URL', 'https://accounts.google.com/o/oauth2/v2/auth'),
    'token_url': os.getenv('GOOGLE_TOKEN_URL', 'https://oauth2.googleapis.com/token'),
    'redirect_url': os.getenv('REDIRECT_URL'),
    'client_url': os.getenv('CLIENT_URL'),
    'token_secret': os.getenv('TOKEN_SECRET'),
    'token_expiration': int(os.getenv('TOKEN_EXPIRATION', '36000')),
    'post_url': os.getenv('POST_URL', 'https://jsonplaceholder.typicode.com/posts'),
}

def get_auth_params():
    return urlencode({
        'client_id': config['client_id'],
        'redirect_uri': config['redirect_url'],
        'response_type': 'code',
        'scope': 'openid profile email',
        'access_type': 'offline',
        'state': 'standard_oauth',
        'prompt': 'consent',
    })

def get_token_params(code):
    return urlencode({
        'client_id': config['client_id'],
        'client_secret': config['client_secret'],
        'code': code,
        'grant_type': 'authorization_code',
        'redirect_uri': config['redirect_url'],
    })



def get_auth_url():
    auth_url = f"{config['auth_url']}?{get_auth_params()}"
    return jsonify({'url': auth_url})


def auth_token():
    code = request.args.get('code')
    if not code:
        return jsonify({'message': 'Authorization code must be provided'}), 400
    
    try:
        token_params = get_token_params(code)
        token_response = requests.post(f"{config['token_url']}?{token_params}")
        token_data = token_response.json()
        
        id_token = token_data.get('id_token')
        if not id_token:
            return jsonify({'message': 'Auth error'}), 400
        

        user_info = jwt.decode(id_token, options={"verify_signature": False},algorithms=['HS256'])
        user = {
            'name': user_info.get('name'),
            'email': user_info.get('email'),
            'picture': user_info.get('picture')
        }



        token = jwt.encode({'user': user}, config['token_secret'], algorithm='HS256')
        
        response = make_response(jsonify({'user': user}))
        
        response.set_cookie('token', token, httponly=True, secure=True, 
                            samesite='None', max_age=config['token_expiration'])
        
   
        user_ref = connect_firebase()
        
        existing_user = user_ref.where('email', '==', user['email']).limit(1).get()
        if len(existing_user) == 0:
            id = str(uuid.uuid4())
            user_ref.document(id).set(user)
        
        return response
    
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'message': str(e) or 'Server error'}), 500


def check_logged_in():
    try:
        token = request.cookies.get('token')
        if not token:
            return jsonify({'loggedIn': False})
        
        payload = jwt.decode(token, config['token_secret'], algorithms=['HS256'])
        user = payload['user']
        
        new_token = jwt.encode({'user': user}, config['token_secret'], algorithm='HS256')
        
        response = make_response(jsonify({'loggedIn': True, 'user': user}))
        
        response.set_cookie('token', new_token, httponly=True, secure=True, 
                            samesite='None', max_age=config['token_expiration'])
        
        return response
    
    except jwt.ExpiredSignatureError:
        return jsonify({'loggedIn': False})
    except jwt.InvalidTokenError:
        return jsonify({'loggedIn': False})
    
def logged_out():
    response = make_response(jsonify({"message": "Logged out"}))
    response.set_cookie('token', '', expires=0) 
    return response
