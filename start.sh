#!/bin/sh

set -e

if [ -e "${HOME}/.rye/shims" ]; then
    grep -q -o "${HOME}/.rye/shims"
    if ! $(echo "$PATH" | grep -q -o "${HOME}/.rye/shims"); then
        PATH="$HOME/.rye/shims:$PATH"
    fi
fi

cd "$(dirname "${0}")/src"
rye run python3 Launcher.py
