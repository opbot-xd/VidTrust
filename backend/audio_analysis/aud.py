from moviepy.editor import VideoFileClip
import numpy as np
from pydub import AudioSegment
from opensimplex import OpenSimplex
import ffmpeg
import matplotlib.pyplot as plt
from scipy import signal

def extract_audio(video_path, output_audio_path):
    clip = VideoFileClip(video_path)
    clip.audio.write_audiofile(output_audio_path)

def generate_perlin_noise(num_samples, sample_rate=44100,seed = 42):
    noise_generator = OpenSimplex(seed)
    samples = np.array([noise_generator.noise2(i / sample_rate, 0) for i in range(num_samples)])
    return samples

def add_noise_to_audio(audio_path, output_audio_path, noise_level=0.1):  
    audio = AudioSegment.from_file(audio_path)
    
    if audio.channels > 1:
        audio = audio.set_channels(1)
    
    samples = np.array(audio.get_array_of_samples())
    
    noise = generate_perlin_noise(len(samples) , audio.frame_rate)
    
    max_audio_amplitude = np.max(np.abs(samples))
    noise = noise * max_audio_amplitude
    
    noisy_samples = (samples + noise_level * noise).astype(np.int16)
    
    noisy_audio = AudioSegment(
        noisy_samples.tobytes(), 
        frame_rate=audio.frame_rate, 
        sample_width=audio.sample_width, 
        channels=audio.channels
    )
    
    noisy_audio.export(output_audio_path, format="wav")



def replace_audio_in_video(video_path, new_audio_path, output_video_path):
    try:
        print(video_path)
        print(new_audio_path)
        video = ffmpeg.input(video_path)
        audio = ffmpeg.input(new_audio_path)
        (
            ffmpeg
            .output(video, audio, output_video_path, vcodec='copy', acodec='aac', strict='experimental')
            .run()
        )
    except Exception as e:
        print(e)



def plot_audio_waveforms(original_audio_path, new_audio_path):
    original_audio = AudioSegment.from_file(original_audio_path)
    new_audio = AudioSegment.from_file(new_audio_path)

    original_samples = np.array(original_audio.get_array_of_samples())
    new_samples = np.array(new_audio.get_array_of_samples())

    f_original, t_original, Sxx_original = signal.spectrogram(original_samples, fs=original_audio.frame_rate)
    f_new, t_new, Sxx_new = signal.spectrogram(new_samples, fs=new_audio.frame_rate)

    plt.figure(figsize=(12, 8))

    plt.subplot(2, 2, 1)
    plt.title("Original Audio Waveform")
    plt.plot(original_samples)
    plt.xlabel("Sample")
    plt.ylabel("Amplitude")

    plt.subplot(2, 2, 2)
    plt.title("New Audio Waveform (with noise)")
    plt.plot(new_samples)
    plt.xlabel("Sample")
    plt.ylabel("Amplitude")

    plt.subplot(2, 2, 3)
    plt.title("Original Audio Spectrogram")
    plt.pcolormesh(t_original, f_original, 10 * np.log10(Sxx_original), shading='gouraud')
    plt.ylabel('Frequency [Hz]')
    plt.xlabel('Time [sec]')
    plt.colorbar(label='Power/Frequency (dB/Hz)')

    plt.subplot(2, 2, 4)
    plt.title("New Audio Spectrogram (with noise)")
    plt.pcolormesh(t_new, f_new, 10 * np.log10(Sxx_new), shading='gouraud')
    plt.ylabel('Frequency [Hz]')
    plt.xlabel('Time [sec]')
    plt.colorbar(label='Power/Frequency (dB/Hz)')

    plt.tight_layout()
    plt.savefig('plot.png', bbox_inches='tight')


# extract_audio("test_video.mp4", "original_audio.wav")
# print("Now adding noise to the extracted audio")
# add_noise_to_audio("original_audio.wav", "noisy_audio.wav", 0.5)
# print("Noise addition done")
# print("Imposing onto original video and storing to new file")
# replace_audio_in_video("test_video.mp4", "noisy_audio.wav", "output_video_with_noisy_audio.mp4")
# plot_audio_waveforms("original_audio.wav", "noisy_audio.wav")