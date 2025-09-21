import google.generativeai as genai
import os

def gemini_insights(graph):
  genai.configure(api_key=os.environ["API_KEY"])
  myfile = genai.upload_file(graph)
  model = genai.GenerativeModel("gemini-1.5-flash")
  response = model.generate_content([myfile, "\n\n", "What are your insights of this image"])
  return response.text