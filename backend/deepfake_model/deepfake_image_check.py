from transformers import AutoImageProcessor, ViTForImageClassification
from PIL import Image
import logging

# Import torch lazily and handle import failures (e.g., missing DLLs) gracefully
try:
    import torch
    _TORCH_AVAILABLE = True
except Exception as e:
    torch = None  # type: ignore
    _TORCH_AVAILABLE = False
    logging.getLogger(__name__).warning("torch not available or failed to import: %s", e)


def check_deepfake_image(img: Image.Image) -> bool:
    '''
    This function returns a bool check on an image whether its a deepfake or not? Provide arguments in form of Image only
    '''
    if not isinstance(img, Image.Image):
        raise TypeError("The input must be a PIL Image.")

    # If torch isn't available, return False (safe fallback)
    if not _TORCH_AVAILABLE:
        logging.getLogger(__name__).warning(
            "check_deepfake_image called but torch is unavailable. Returning False.")
        return False

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

    return predicted_label == "Real"