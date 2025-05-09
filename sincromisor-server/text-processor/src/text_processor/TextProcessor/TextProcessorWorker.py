import logging
from collections.abc import Generator
from logging import Logger
from time import perf_counter

from fastapi import WebSocket
from sincro_models import TextProcessorRequest, TextProcessorResult


# 対話ごとにテキスト処理を行うための基底クラス
# 新しい対話が始まるたびにインスタンスを生成する
class TextProcessorWorker:
    def __init__(self):
        self.logger: Logger = logging.getLogger("sincro." + self.__class__.__name__)

        self.message_type: str = "system"
        self.speaker_id: str = "system"
        self.speaker_name: str = "Glorious AI"

    async def communicate(self, ws: WebSocket) -> None:
        pack: bytes
        while pack := await ws.receive_bytes():
            request: TextProcessorRequest = TextProcessorRequest.from_msgpack(pack=pack)
            # 現状では、requestのテキストが完全に認識できたタイミングで処理をする
            if not request.confirmed:
                continue

            start_t: float = perf_counter()
            response_t: float = -1
            self.logger.info(["process_request", request])
            for response in self.process(request=request):
                self.logger.info(["send_response", response])
                await ws.send_bytes(response.to_msgpack())
                # 最初のレスポンスがあった時刻を記録
                if response_t < 0:
                    response_t = perf_counter()
            self.logger.info(
                {
                    "session_id": request.session_id,
                    "speech_id": request.speech_id,
                    "response_time": response_t - start_t,
                    "query_time": perf_counter() - start_t,
                }
            )

    def process(
        self,
        request: TextProcessorRequest,
    ) -> Generator[TextProcessorResult, None, None]:
        response: TextProcessorResult = TextProcessorResult.from_request(
            message_type=self.message_type,
            speaker_id=self.speaker_id,
            speaker_name=self.speaker_name,
            request=request,
        )
        response.append_response_message(request.request_message.message)
        yield response
        response.finalize()
        yield response
