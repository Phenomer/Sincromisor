FROM ubuntu:24.04

EXPOSE 50021

ARG VOICEVOX_VERSION=0.20.0

RUN apt-get update && \
    apt-get install -y curl p7zip libsndfile1 && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* && \
    useradd -s /bin/bash -d /opt/voicevox voicevox 

RUN --mount=type=cache,target=/mnt \
    cd /opt && \
    test -e /mnt/voicevox-${VOICEVOX_VERSION}.7z || \
    curl -L -o /mnt/voicevox-${VOICEVOX_VERSION}.7z \
      "https://github.com/VOICEVOX/voicevox_engine/releases/download/${VOICEVOX_VERSION}/voicevox_engine-linux-cpu-${VOICEVOX_VERSION}.7z.001" && \
    7zr x  /mnt/voicevox-${VOICEVOX_VERSION}.7z && \
    mv linux-cpu voicevox && \
    chmod +x /opt/voicevox/run && \
    mkdir /opt/voicevox/.local && \
    chown voicevox:voicevox /opt/voicevox/.local 
    
USER voicevox
CMD ["/opt/voicevox/run", "--host", "0.0.0.0", "--port", "50021", "--cors_policy_mode", "all"]
