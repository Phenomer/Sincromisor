#!/bin/sh

if [ -e "${HOME}/.cargo/bin" ]; then
    echo $PATH | grep -q -o "${HOME}/.cargo/bin"
    if ! $(echo "$PATH" | grep -q -o "${HOME}/.cargo/bin"); then
        PATH="$HOME/.cargo/bin:$PATH"
    fi
fi

cd "$(dirname "${0}")/sincromisor-server"
uv run python3 Launcher.py