import numpy as np
try:
    from pydub import AudioSegment
    _HAVE_PYDUB = True
except Exception:
    AudioSegment = None
    _HAVE_PYDUB = False

# The following heavy/optional libs are imported lazily inside functions so
# importing this module doesn't fail if they're not installed. Functions that
# require them will raise informative ImportError at call time.
_HAVE_MOVIEPY = None
_HAVE_OPEN_SIMPLEX = None
_HAVE_FFMPEG = None
_HAVE_MATPLOTLIB = None
_HAVE_SCIPY = None
import wave
import os


def _read_wav_file(path):
    """Read a WAV file into a numpy array and return (samples, frame_rate, sample_width, channels).

    Samples are returned as a 1-D numpy array for mono, or a 2-D array (n_frames, channels)
    for multi-channel audio. The dtype depends on sample_width.
    """
    with wave.open(path, 'rb') as wf:
        channels = wf.getnchannels()
        frame_rate = wf.getframerate()
        sample_width = wf.getsampwidth()
        n_frames = wf.getnframes()
        frames = wf.readframes(n_frames)

    if sample_width == 1:
        dtype = np.uint8
    elif sample_width == 2:
        dtype = np.int16
    elif sample_width == 4:
        dtype = np.int32
    else:
        raise ValueError(f"Unsupported sample width: {sample_width}")

    samples = np.frombuffer(frames, dtype=dtype)
    if channels > 1:
        samples = samples.reshape(-1, channels)

    return samples, frame_rate, sample_width, channels


def _write_wav_file(path, samples, frame_rate, sample_width, channels):
    """Write samples to a WAV file. Samples may be 1-D (mono) or 2-D (n_frames, channels).
    """
    # Ensure samples are in the expected dtype
    if sample_width == 1:
        dtype = np.uint8
        min_val, max_val = 0, 255
    elif sample_width == 2:
        dtype = np.int16
        min_val, max_val = -32768, 32767
    elif sample_width == 4:
        dtype = np.int32
        min_val, max_val = -2**31, 2**31 - 1
    else:
        raise ValueError(f"Unsupported sample width: {sample_width}")

    samples = np.asarray(samples)
    # Flatten interleaved channels if needed
    if samples.ndim == 2:
        interleaved = samples.flatten()
    else:
        interleaved = samples

    interleaved = np.clip(interleaved, min_val, max_val).astype(dtype)

    with wave.open(path, 'wb') as wf:
        wf.setnchannels(channels)
        wf.setsampwidth(sample_width)
        wf.setframerate(frame_rate)
        wf.writeframes(interleaved.tobytes())

def extract_audio(video_path, output_audio_path):
    global _HAVE_MOVIEPY
    if _HAVE_MOVIEPY is None:
        try:
            from moviepy.editor import VideoFileClip
            _HAVE_MOVIEPY = True
        except Exception as e:
            _HAVE_MOVIEPY = False
            raise ImportError('moviepy is required for extract_audio; install moviepy') from e

    from moviepy.editor import VideoFileClip
    clip = VideoFileClip(video_path)
    clip.audio.write_audiofile(output_audio_path)

def generate_perlin_noise(num_samples, sample_rate=44100,seed = 42):
    global _HAVE_OPEN_SIMPLEX
    if _HAVE_OPEN_SIMPLEX is None:
        try:
            from opensimplex import OpenSimplex
            _HAVE_OPEN_SIMPLEX = True
        except Exception as e:
            _HAVE_OPEN_SIMPLEX = False
            raise ImportError('opensimplex is required for generate_perlin_noise; install opensimplex') from e

    from opensimplex import OpenSimplex
    noise_generator = OpenSimplex(seed)
    samples = np.array([noise_generator.noise2(i / sample_rate, 0) for i in range(num_samples)])
    return samples

def add_noise_to_audio(audio_path, output_audio_path, noise_level=0.1):  
    if _HAVE_PYDUB:
        audio = AudioSegment.from_file(audio_path)

        if audio.channels > 1:
            audio = audio.set_channels(1)

        samples = np.array(audio.get_array_of_samples())

        noise = generate_perlin_noise(len(samples), audio.frame_rate)

        max_audio_amplitude = np.max(np.abs(samples))
        noise = noise * max_audio_amplitude

        noisy_samples = (samples + noise_level * noise).astype(np.int16)

        noisy_audio = AudioSegment(
            noisy_samples.tobytes(),
            frame_rate=audio.frame_rate,
            sample_width=audio.sample_width,
            channels=1,
        )

        noisy_audio.export(output_audio_path, format="wav")
    else:
        samples, frame_rate, sample_width, channels = _read_wav_file(audio_path)
        # If multi-channel, convert to mono by averaging channels
        if channels > 1:
            samples = samples.mean(axis=1).astype(samples.dtype)

        noise = generate_perlin_noise(len(samples), frame_rate)

        # Scale noise to the audio amplitude
        max_audio_amplitude = np.max(np.abs(samples).astype(np.float64))
        noise = noise * max_audio_amplitude

        # Mix and clip
        noisy = (samples.astype(np.float64) + noise_level * noise)
        # choose a conservative output width (16-bit)
        noisy_samples = noisy.clip(-32768, 32767).astype(np.int16)

        _write_wav_file(output_audio_path, noisy_samples, frame_rate, 2, 1)



def replace_audio_in_video(video_path, new_audio_path, output_video_path):
    try:
        print(video_path)
        print(new_audio_path)
        global _HAVE_FFMPEG
        if _HAVE_FFMPEG is None:
            try:
                import ffmpeg
                _HAVE_FFMPEG = True
            except Exception as e:
                _HAVE_FFMPEG = False
                raise ImportError('ffmpeg-python is required for replace_audio_in_video; install ffmpeg-python') from e

        import ffmpeg
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
    global _HAVE_MATPLOTLIB, _HAVE_SCIPY
    if _HAVE_MATPLOTLIB is None:
        try:
            import matplotlib.pyplot as plt
            _HAVE_MATPLOTLIB = True
        except Exception as e:
            _HAVE_MATPLOTLIB = False
            raise ImportError('matplotlib is required for plot_audio_waveforms; install matplotlib') from e
    if _HAVE_SCIPY is None:
        try:
            from scipy import signal
            _HAVE_SCIPY = True
        except Exception as e:
            _HAVE_SCIPY = False
            raise ImportError('scipy is required for plot_audio_waveforms; install scipy') from e

    import matplotlib.pyplot as plt
    from scipy import signal

    if _HAVE_PYDUB:
        original_audio = AudioSegment.from_file(original_audio_path)
        new_audio = AudioSegment.from_file(new_audio_path)

        original_samples = np.array(original_audio.get_array_of_samples())
        new_samples = np.array(new_audio.get_array_of_samples())

        f_original, t_original, Sxx_original = signal.spectrogram(original_samples, fs=original_audio.frame_rate)
        f_new, t_new, Sxx_new = signal.spectrogram(new_samples, fs=new_audio.frame_rate)
    else:
        original_samples, orig_rate, _, _ = _read_wav_file(original_audio_path)
        new_samples, new_rate, _, _ = _read_wav_file(new_audio_path)

        # If multi-channel, take first channel or average
        if original_samples.ndim > 1:
            original_samples = original_samples.mean(axis=1)
        if new_samples.ndim > 1:
            new_samples = new_samples.mean(axis=1)

        f_original, t_original, Sxx_original = signal.spectrogram(original_samples, fs=orig_rate)
        f_new, t_new, Sxx_new = signal.spectrogram(new_samples, fs=new_rate)

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