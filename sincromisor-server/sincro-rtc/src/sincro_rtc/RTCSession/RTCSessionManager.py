import logging
import traceback
from logging import Logger
from multiprocessing import Pipe, Value
from multiprocessing.connection import Connection
from multiprocessing.sharedctypes import Synchronized

from ulid import ULID

from ..models import RTCSessionOffer
from .RTCSessionProcess import RTCSessionProcess


class RTCProcessDescription:
    def __init__(
        self,
        process: RTCSessionProcess,
        pipe: Connection,
        rtc_session_status: Synchronized,
    ):
        self.process: RTCSessionProcess = process
        self.pipe: Connection = pipe
        self.rtc_session_status: Synchronized = rtc_session_status

    def close(self, join_timeout: int = 10) -> None:
        self.pipe.close()
        self.process.join(join_timeout)
        self.process.close()


class RTCSessionManager:
    def __init__(self, consul_agent_host: str, consul_agent_port: int):
        self.__logger: Logger = logging.getLogger(__name__)
        self.__processes: dict = {}
        self.__join_timeout: int = 10
        self.__consul_agent_host = consul_agent_host
        self.__consul_agent_port = consul_agent_port

    # WebRTCのセッションを持つプロセスを新たに生成し、
    # そのプロセスが持つセッションのSDPをdictとして返す。
    def create_session(self, offer: RTCSessionOffer) -> dict:
        # session_idはここで生成し、
        # RTCVoiceChatSessionを持つRTCSessionProcessと共有する。
        session_id: str = str(ULID())
        sv_pipe: Connection
        cl_pipe: Connection
        sv_pipe, cl_pipe = Pipe()
        rtc_session_status: Synchronized = Value("b", 1)
        ps: RTCSessionProcess = RTCSessionProcess(
            session_id=session_id,
            request_sdp=offer.sdp,
            request_type=offer.type,
            request_talk_mode=offer.talk_mode,
            sdp_pipe=cl_pipe,
            rtc_session_status=rtc_session_status,
            consul_agent_host=self.__consul_agent_host,
            consul_agent_port=self.__consul_agent_port,
        )
        ps.start()

        self.__processes[session_id] = RTCProcessDescription(
            process=ps,
            pipe=sv_pipe,
            rtc_session_status=rtc_session_status,
        )
        return sv_pipe.recv()

    def session_count(self) -> int:
        return len(self.__processes)

    def cleanup_sessions(self) -> list[str]:
        session_id: str
        ps_desc: RTCProcessDescription
        for session_id, ps_desc in list(self.__processes.items()):
            if ps_desc.rtc_session_status.value <= -1:
                ps_desc.close(self.__join_timeout)
                del self.__processes[session_id]
        return list(self.__processes.keys())

    def shutdown(self) -> None:
        session_id: str
        ps_desc: RTCProcessDescription
        for session_id, ps_desc in self.__processes.items():
            try:
                ps_desc.rtc_session_status.value = -1
            except Exception:
                self.__logger.error(
                    f"[{session_id}] Change session status: UnknownError - {traceback.format_exc()}",
                )
                traceback.print_exc()

        for session_id, ps_desc in self.__processes.items():
            try:
                ps_desc.close(self.__join_timeout)
            except Exception:
                self.__logger.error(
                    f"[{session_id}] RTC session close: UnknownError - {traceback.format_exc()}",
                )
                traceback.print_exc()
