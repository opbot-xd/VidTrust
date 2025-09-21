import wave
import audioop
import os

def stereo_to_mono(input_file, output_file):
    with wave.open(input_file, 'rb') as stereo_file:
        # Get the parameters of the stereo file
        params = stereo_file.getparams()
        num_channels = stereo_file.getnchannels()
        sample_width = stereo_file.getsampwidth()
        frame_rate = stereo_file.getframerate()
        num_frames = stereo_file.getnframes()

        # Read all frames
        stereo_data = stereo_file.readframes(num_frames)

    # Convert to mono
    mono_data = audioop.tomono(stereo_data, sample_width, 1, 1)

    # Write mono data to a new file
    with wave.open(output_file, 'wb') as mono_file:
        mono_file.setnchannels(1)
        mono_file.setsampwidth(sample_width)
        mono_file.setframerate(frame_rate)
        mono_file.writeframes(mono_data)

    print(f"Converted {input_file} to mono. Saved as {output_file}")

# Example usage
# input_file = "original_audio.wav"
# output_file = "output_mono.wav"

# stereo_to_mono(input_file, output_file)