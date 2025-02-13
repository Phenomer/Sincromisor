import logging
import logging.config
import traceback
from logging import Logger
from threading import Event

import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse
from setproctitle import setproctitle
from sincro_config import ServiceDiscoveryReporter, SincromisorLoggerConfig
from voice_synthesizer.models import VoiceSynthesizerProcessArgument
from voice_synthesizer.VoiceSynthesizer import VoiceSynthesizerWorker

setproctitle("VSynthesizer")

args: VoiceSynthesizerProcessArgument = VoiceSynthesizerProcessArgument.argparse()
logging.config.dictConfig(
    SincromisorLoggerConfig.generate(log_file=args.log_file, stdout=True),
)


class VoiceSynthesizerProcess:
    def __init__(self, args: VoiceSynthesizerProcessArgument):
        self.__logger: Logger = logging.getLogger("sincro." + self.__class__.__name__)
        self.__logger.info("===== Starting VoiceSynthesizerProcess =====")
        self.__args: VoiceSynthesizerProcessArgument = args
        self.__sessions: int = 0

    def start(self):
        app: FastAPI = FastAPI()
        event: Event = Event()
        self.sd_reporter: ServiceDiscoveryReporter = ServiceDiscoveryReporter(
            worker_type="VoiceSynthesizer",
            consul_host=self.__args.consul_agent_host,
            consul_port=self.__args.consul_agent_port,
            public_bind_host=self.__args.public_bind_host,
            public_bind_port=self.__args.public_bind_port,
        )
        self.sd_reporter.start()

        @app.get("/api/v1/statuses")
        async def get_status() -> JSONResponse:
            return JSONResponse({"worker_type": "VoiceSynthesizer", "sessions": self.__sessions})

        @app.websocket("/api/v1/VoiceSynthesizer")
        async def websocket_chat_endpoint(ws: WebSocket) -> None:
            self.__logger.info("Connected Websocket.")
            self.__sessions += 1
            try:
                await ws.accept()
                voice_synthesizer = VoiceSynthesizerWorker(
                    voicevox_host=self.__args.voicevox_host,
                    voicevox_port=self.__args.voicevox_port,
                    voicevox_style_id=self.__args.voicevox_default_style_id,
                    redis_host=self.__args.redis_host,
                    redis_port=self.__args.redis_port,
                )
                await voice_synthesizer.communicate(ws=ws)
            except WebSocketDisconnect:
                self.__logger.info("Disconnected WebSocket.")
            except Exception as e:
                self.__logger.error(
                    f"UnknownError: {repr(e)}\n{traceback.format_exc()}",
                )
            finally:
                self.__sessions -= 1
                try:
                    await ws.close()
                except RuntimeError:
                    self.__logger.warning(
                        "WebSocket is already closed.",
                    )
        try:
            uvicorn.run(app, host=self.__args.host, port=self.__args.port)
        except KeyboardInterrupt:
            pass
        finally:
            event.set()


if __name__ == "__main__":
    VoiceSynthesizerProcess(args=args).start()
