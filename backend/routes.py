from google_video_api.google_api_video import detect_potential_tampering
from controllers.auth_controllers import get_auth_url, auth_token, check_logged_in as check_logged_in_controller, logged_out
from controllers.video_controllers import mp4_converter, video_url as video_url_controller
from controllers.video_controllers import video_fetch_url as video_fetch_url_controller
from middleware.auth_middleware import auth_middleware
from controllers.video_controllers import test_video
from controllers.video_controllers import delete_video

def configure_routes(app):
    @app.route('/auth/logged_in', methods=['GET'])
    def check_logged_in_route():
        return check_logged_in_controller()

    @app.route('/auth/video_url', methods=['POST'])
    @auth_middleware
    def video_url_route():
        return video_url_controller()

    @app.route('/auth/logout', methods=['POST'])
    @auth_middleware
    def logout_route():
        return logged_out()
    
    @app.route('/auth/video_fetch_url',methods=['GET'])
    @auth_middleware
    def video_fetch_url_route():
        return video_fetch_url_controller()
    
    @app.route('/auth/mp4_file_handler',methods=['POST'])
    # @auth_middleware
    def mp4_handler():
        return mp4_converter()
    

    app.route('/auth/url', methods=['GET'])(get_auth_url)
    app.route('/auth/token', methods=['GET'])(auth_token)
    app.route('/test_video_url', methods=['POST'])(test_video)
    app.route('/delete_video', methods=['POST'])(delete_video)
