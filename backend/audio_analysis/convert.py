"""Simple audio utilities.

This module previously used the standard library `audioop` module for
stereo->mono conversion. To avoid depending on any platform-specific
extensions or external packages, the conversion was reimplemented in
pure Python below. The helper supports common PCM widths (8/16/32-bit).
"""

import wave
import struct


def _mix_stereo_to_mono(stereo_data: bytes, sample_width: int) -> bytes:
    """Mix stereo PCM audio to mono.

    This function replaces the use of the stdlib `audioop` module to avoid
    depending on a specific binary or external package. It handles common
    PCM sample widths: 1 (8-bit unsigned), 2 (16-bit signed), and 4
    (32-bit signed). For other widths it will raise ValueError.
    """
    if sample_width not in (1, 2, 4):
        raise ValueError(f"Unsupported sample width: {sample_width}")

    mono_samples = []
    frame_size = sample_width * 2  # stereo: left+right
    for i in range(0, len(stereo_data), frame_size):
        frame = stereo_data[i:i+frame_size]
        if len(frame) < frame_size:
            break
        if sample_width == 1:
            # 8-bit PCM is unsigned
            left = frame[0]
            right = frame[1]
            mono = (left + right) // 2
            mono_samples.append(struct.pack('<B', mono))
        elif sample_width == 2:
            left, right = struct.unpack('<hh', frame)
            mono = (left + right) // 2
            mono_samples.append(struct.pack('<h', mono))
        else:  # sample_width == 4
            left, right = struct.unpack('<ii', frame)
            mono = (left + right) // 2
            mono_samples.append(struct.pack('<i', mono))

    return b''.join(mono_samples)

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

    if num_channels == 1:
        # Already mono - just copy
        mono_data = stereo_data
    else:
        mono_data = _mix_stereo_to_mono(stereo_data, sample_width)

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