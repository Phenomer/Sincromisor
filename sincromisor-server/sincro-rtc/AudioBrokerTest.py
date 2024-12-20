import signal
import sys
import time
from threading import Thread

from sincro_rtc.AudioBroker import AudioBroker
from ulid import ULID

ab = AudioBroker(session_id=ULID())


def audio_sender_t(ab: AudioBroker) -> None:
    print("start audio_sender_t")
    while ab.is_running():
        frame = sys.stdin.buffer.read(8000)
        ab.add_frame(frame=frame)
    print("stop audio_sender_t")


def text_channel_reader_t(ab: AudioBroker) -> None:
    print("start text_channel_reader_t")
    while ab.is_running():
        try:
            buffer = ab.text_channel_queue.popleft()
            print(f"text_channel: {buffer}")
        except IndexError:
            time.sleep(0.1)
    print("stop text_channel_reader_t")


def voice_frame_reader_t(ab: AudioBroker) -> None:
    print("start voice_frame_reader_t")
    while ab.is_running():
        try:
            buffer = ab.voice_frame_queue.popleft()
            print(f"voice_frame: {buffer}")
        except IndexError:
            time.sleep(0.1)
    print("stop voice_frame_reader_t")


as_t = Thread(target=audio_sender_t, args=(ab,))
tr_t = Thread(target=text_channel_reader_t, args=(ab,))
vr_t = Thread(target=voice_frame_reader_t, args=(ab,))


signal.signal(signal.SIGINT, lambda signum, frame: ab.close())
as_t.start()
tr_t.start()
vr_t.start()
as_t.join()
tr_t.join()
vr_t.join()
print("terminated.")
