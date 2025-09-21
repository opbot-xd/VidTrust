from functools import wraps
from flask import Flask, request, redirect, jsonify, make_response
from flask_cors import CORS
import os
from dotenv import load_dotenv
import jwt

load_dotenv()

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


def auth_middleware(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.cookies.get('token')
        if not token:
            return jsonify({'message': 'Unauthorized'}), 401
        try:
            jwt.decode(token, config['token_secret'], algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid token'}), 401
        return f(*args, **kwargs)
    return decorated








