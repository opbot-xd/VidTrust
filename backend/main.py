
from functools import wraps
from flask import Flask, request, redirect, jsonify, make_response
from flask_cors import CORS
import os
from dotenv import load_dotenv
from routes import configure_routes
from urllib.parse import urlencode
import logging
load_dotenv()  

app = Flask(__name__)

logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

CORS(app, supports_credentials=True, origins="http://localhost:3000")

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


configure_routes(app)


if __name__ == '__main__':
    app.run(debug=True)
