import os
from google.cloud import videointelligence

os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "b27project-e4206a0ff48a.json")

def analyze_video(video_uri):
    client = videointelligence.VideoIntelligenceServiceClient()
    features = [
        videointelligence.Feature.SHOT_CHANGE_DETECTION,
        videointelligence.Feature.OBJECT_TRACKING,
        videointelligence.Feature.FACE_DETECTION
    ]

    request = videointelligence.AnnotateVideoRequest(
        input_uri=video_uri,
        features=features
    )

    print("Processing video for shot change, face detection and object tracking")
    operation = client.annotate_video(request=request)
    result = operation.result(timeout=180)

    return result

def detect_potential_tampering(video_uri):
    result=analyze_video(video_uri)
    report=[]
    shot_changes = result.annotation_results[0].shot_annotations
    object_annotations = result.annotation_results[0].object_annotations
    face_annotations = result.annotation_results[0].face_detection_annotations

    shot_durations = [
        (shot.end_time_offset.seconds - shot.start_time_offset.seconds)
        for shot in shot_changes
    ]
    avg_shot_duration = sum(shot_durations) / len(shot_durations)
    rapid_changes = sum(1 for duration in shot_durations if duration < avg_shot_duration / 2)

    suspicious_objects = []
    for obj in object_annotations:
        obj_duration = obj.segment.end_time_offset.seconds - obj.segment.start_time_offset.seconds
        if obj_duration < 1:  
            suspicious_objects.append(obj)

    suspicious_faces = []
    for face in face_annotations:
        for track in face.tracks:
            face_duration = track.segment.end_time_offset.seconds - track.segment.start_time_offset.seconds
            if face_duration < 0.5:  
                suspicious_faces.append(face)

    report.append(f"Average shot duration: {avg_shot_duration:.2f} seconds")
    report.append(f"Number of rapid shot changes: {rapid_changes}")
    report.append(f"Number of suspiciously brief object appearances: {len(suspicious_objects)}")
    report.append(f"Number of suspiciously brief face appearances: {len(suspicious_faces)}")

    tampering_detected = False
    reasons = []

    if rapid_changes > len(shot_changes) / 4:
        tampering_detected = True
        reasons.append("High frequency of rapid shot changes")

    if suspicious_objects:
        tampering_detected = True
        reasons.append("Objects with unusually brief appearances detected")

    if suspicious_faces:
        tampering_detected = True
        reasons.append("Faces with unusually brief appearances detected")

    if tampering_detected:
        report.append("Potential video tampering detected.")
        report.append("Reasons:")
        for reason in reasons:
            report.append(f"- {reason}")
        
        if suspicious_objects:
            report.append("Suspicious objects:")
            for obj in suspicious_objects:
                report.append(f"  - {obj.entity.description} (confidence: {obj.confidence:.2f})")
        
        if suspicious_faces:
            report.append("Suspicious faces:")
            for face in suspicious_faces:
                report.append(f"  - Face detected at {face.tracks[0].segment.start_time_offset.seconds:.2f}s")
    else:
        report.append("No clear signs of tampering detected.")

    return report
# video_uri = "gs://deenank_bucket/clone8.mp4"
# result = analyze_video(video_uri)
# detect_potential_tampering(result)