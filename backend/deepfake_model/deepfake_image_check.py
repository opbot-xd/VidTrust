from transformers import AutoImageProcessor, ViTForImageClassification
from PIL import Image
import torch




def check_deepfake_image(img: Image.Image) -> bool:
    '''
    This function returns a bool check on an image whether its a deepfake or not? Provide arguments in form of Image only
    '''
    if not isinstance(img, Image.Image):
        raise TypeError("The input must be a PIL Image.")
    processor = AutoImageProcessor.from_pretrained("dima806/deepfake_vs_real_image_detection")
    model = ViTForImageClassification.from_pretrained("dima806/deepfake_vs_real_image_detection")
    

    image=img
    inputs = processor(images=image, return_tensors="pt")





    with torch.no_grad():
        outputs = model(**inputs)


    logits = outputs.logits
    predicted_class_idx = torch.argmax(logits, dim=-1).item()

    labels = model.config.id2label
    predicted_label = labels[predicted_class_idx]

    if predicted_label=="Real":return True
    return False