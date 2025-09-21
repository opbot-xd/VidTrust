import google.generativeai as genai
import os
from datetime import datetime

genai.configure(api_key=os.environ["GOOGLE_API_KEY"])
model = genai.GenerativeModel(model_name="gemini-1.5-flash")

def generate_report(report):
    current_date = datetime.now().strftime("%Y-%m-%d")
    report_format=f"""Video Tampering Detection Report
Date: {current_date}

1. Shot Change Analysis
Average Shot Duration: 'avg_shot_duration':.2f seconds
Number of Rapid Shot Changes: 'rapid_changes'
2. Object Tracking Analysis
Total Number of Objects Tracked: 'total_objects_tracked'

Number of Suspiciously Brief Object Appearances: 'len(suspicious_objects)'

Suspicious Objects Detected:
'if suspicious_objects:'

Object 'object.entity.description' with confidence 'object.confidence:.2f' . 'else:'
No suspicious objects detected.
3. Face Detection Analysis
Total Faces Detected: 'total_faces_detected'

Number of Suspiciously Brief Face Appearances: 'len(suspicious_faces)'

Suspicious Faces Detected:
'if suspicious_faces:'

Face detected briefly at 'face_time' with confidence 'face_confidence'. 'else:'
No suspicious faces detected.
4. Tampering Detection Summary
Tampering Detected: 'Possible'

Reasons for Potential Tampering Detection: 'if tampering_detected:'

'reason_1'
'reason_2' 'else:'
No clear signs of tampering detected."""

    formatted_report="\n".join(report)
    response = model.generate_content([f"Generate a report with the following data:{formatted_report} with the following format: {report_format} in json format"])
    print(response.text)
    return response.text
        