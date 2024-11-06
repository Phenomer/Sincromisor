from pydantic import BaseModel
from argparse import ArgumentParser, Namespace


class VoiceSynthesizerProcessArgument(BaseModel):
    host: str
    port: int
    public_bind_host: str
    public_bind_port: int
    redis_host: str
    redis_port: int
    voicevox_host: str
    voicevox_port: int
    voicevox_default_style_id: int
    log_file: str | None

    @classmethod
    def __argparse(cls) -> Namespace:
        parser = ArgumentParser(
            description="Start the FastAPI application with custom options."
        )
        parser.add_argument(
            "--host",
            type=str,
            default="127.0.0.1",
            help="Host to bind to(default: 127.0.0.1)",
        )
        parser.add_argument(
            "--port", type=int, default=8005, help="Port to bind to(default: 8005)"
        )
        parser.add_argument(
            "--public-bind-host", type=str, help="Public bind address", required=True
        )
        parser.add_argument(
            "--public-bind-port",
            default=8005,
            type=int,
            help="Public bind port(default: 8005)",
            required=True,
        )
        parser.add_argument(
            "--redis-host",
            type=str,
            help="Redis address",
            required=True,
        )
        parser.add_argument(
            "--redis-port", type=int, default=6379, help="Redis port(default: 6379)"
        )
        parser.add_argument(
            "--voicevox-host",
            type=str,
            help="VOICEVOX address",
            required=True,
        )
        parser.add_argument(
            "--voicevox-port",
            type=int,
            default=50021,
            help="VOICEVOX port(default: 50021)",
        )
        parser.add_argument(
            "--voicevox-default-style-id",
            type=int,
            default=1,
            help="VOICEVOX Style ID(default: 1)",
        )
        parser.add_argument(
            "--log-file",
            type=str,
            default=None,
            help="log file path(default: None(to stdout))",
        )
        args: Namespace = parser.parse_args()
        return args

    @classmethod
    def argparse(cls) -> "VoiceSynthesizerProcessArgument":
        return cls.model_validate(vars(cls.__argparse()))
