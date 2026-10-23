#!/usr/bin/env bash
set -eu
# Activate Emscripten 3.1.74 first. Pass an extracted, clean rom128-2 source directory.
source_dir=$(cd "${1:?Usage: bash tools/core/build-browser.sh SOURCE_DIR [BUILD_DIR]}" && pwd)
bridge_dir=$(cd "$(dirname "$0")" && pwd)
build_dir=${2:-build-rom128-2}
cp "$bridge_dir/browser.c" "$bridge_dir/browser-cheats.inc" "$bridge_dir/browser-link.cpp" "$source_dir/"
python3 - "$source_dir" "$bridge_dir" <<'PYCODE'
from pathlib import Path
import sys
source, bridge = map(Path, sys.argv[1:])
p = source / 'CMakeLists.txt'
s = p.read_text().replace('if(USE_PTHREADS)', 'if(USE_PTHREADS AND NOT EMSCRIPTEN)')
# LIBMGBA_ONLY disables dependencies; HGZ1 needs zlib in the web build.
if 'if(NOT EMSCRIPTEN)\n\t\tset(USE_ZLIB OFF)' not in s:
    s = s.replace('\tset(USE_ZLIB OFF)', '\tif(NOT EMSCRIPTEN)\n\t\tset(USE_ZLIB OFF)\n\tendif()')
if 'add_executable(celio-web ' not in s:
    s += '\n' + (bridge / 'browser-target.cmake').read_text()
p.write_text(s)
PYCODE
emcmake cmake -S "$source_dir" -B "$build_dir" -DCMAKE_POLICY_VERSION_MINIMUM=3.5 -DLIBMGBA_ONLY=ON -DM_CORE_GB=OFF -DENABLE_DEBUGGERS=OFF -DENABLE_SCRIPTING=OFF -DENABLE_GDB_STUB=OFF -DBUILD_GL=OFF -DBUILD_GLES2=OFF -DBUILD_GLES3=OFF -DUSE_ZLIB=ON -DUSE_LZMA=OFF -DUSE_LIBZIP=OFF -DUSE_MINIZIP=OFF -DUSE_ELF=OFF -DUSE_FFMPEG=OFF -DUSE_LUA=OFF -DBUILD_LTO=OFF '-DCMAKE_C_FLAGS=-DDISABLE_THREADING -D_GNU_SOURCE -DPATH_MAX=4096'
cmake --build "$build_dir" -j 8
