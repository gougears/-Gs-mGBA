# Browser cheat bridge

The baseline core rebuilt from `docs/source.zip` with Emscripten 3.1.74 is byte-for-byte identical to the previously published `docs/celio-web.js` (SHA-256 `6f344e0c9e9fee630690c387e878807fa6afe579d03f1ff8e6e829502b7220df`).

To rebuild the current core:

1. Extract `docs/source.zip` into a separate build directory.
2. Copy this directory's `browser.c` and `browser-cheats.inc` into the extracted `core/` directory, replacing `browser.c`.
3. Activate Emscripten 3.1.74 and run the extracted `build-browser.sh` in that directory.
4. Copy `build/celio-web.js` into `docs/`, then run `python tools/build-offline.py docs` from the repository root.

The bridge exposes mGBA's native encrypted PAR v3, GameShark/AR v1-v2, CodeBreaker, autodetection and VBA direct codes. A whole group is validated before installation; malformed/incomplete groups are rejected. The native engine handles conditions, multi-line codes, encryption, master hooks and ROM patches. No ROMs or cheat codes are sent to a server.

The underlying core and Celio communication implementation are unchanged. These source files are provided under MPL-2.0; see the repository LICENSE and upstream source headers. `docs/source.zip` remains the baseline source snapshot; these files are its current build overrides.
