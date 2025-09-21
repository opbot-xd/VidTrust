export type Report = {
    'Signature verification result': string,
    'Tampering Detection result': VideoTamperingDetectionReport,
    'Audio analysis result':string,
    'Audio similarity percentage':string,
    'deepfake chances' : number, 
}

export type Shorts_Report = {
  'Signature verification result': string,
  'Tampering Detection result': VideoTamperingDetectionReport,
  'deepfake chances' : number, 
}

export type VideoTamperingDetectionReport={
    "Video Tampering Detection Report": {
        Date: string;
        "1. Shot Change Analysis": {
          "Average Shot Duration": string;
          "Number of Rapid Shot Changes": string;
        };
        "2. Object Tracking Analysis": {
          "Total Number of Objects Tracked": string;
          "Number of Suspiciously Brief Object Appearances": string;
          "Suspicious Objects Detected": Array<{
            Object: string;
            Confidence: string;
          }>;
        };
        "3. Face Detection Analysis": {
          "Total Faces Detected": string;
          "Number of Suspiciously Brief Face Appearances": string;
          "Suspicious Faces Detected": string;
        };
        "4. Tampering Detection Summary": {
          "Tampering Detected": string;
          "Reasons for Potential Tampering Detection": string[];
        };
      };
}