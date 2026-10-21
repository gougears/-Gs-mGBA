# Browser core: rom64-hgx-1

Current upstream: [pm-start/mGBA_celio_edition](https://github.com/pm-start/mGBA_celio_edition/tree/e691a05b10e3ad1c6f95485ea3f539037519877a), tag `rom64-hgx-1`, commit `e691a05b10e3ad1c6f95485ea3f539037519877a` (HGX版制作：liru氏、ROM64版：ももアイス氏). The uploaded source archive was used for this build.

## Rebuild

1. Download and extract the source at the pinned upstream commit above (or the matching `mGBA_celio_edition-rom64-hgx-1.zip`).
2. Install/activate Emscripten **3.1.74**, CMake and Python 3.
3. From this repository run `bash tools/core/build-browser.sh /path/to/extracted-source /path/to/build`.
4. Copy the resulting `celio-web.js` to `docs/celio-web.js`, then run `python3 tools/build-offline.py docs`.

The script adds the browser target and disables pthread selection for Emscripten. `browser.c` and `browser-cheats.inc` retain the existing browser API, extended saves, quick states and native cheat engine. `browser-link.cpp` is the unchanged browser communication bridge from the previous source snapshot. The web communication protocol (`docs/link.js`, `docs/local-link.js`) is unchanged; this release does not add PC interoperability improvements.

Native cheats include encrypted PAR v3, GameShark/AR v1-v2, CodeBreaker, autodetection and VBA direct codes. A whole group is validated before installation. No ROMs or cheat codes are sent to a server.

The upstream experimental SuperCard path requires `MGBA_SCEMU=1`; it is not enabled in this browser build.

These source files are provided under MPL-2.0; see the repository LICENSE and upstream source headers. `docs/source.zip` remains an older baseline snapshot, not the current HGX source. Use the pinned upstream plus this directory for the current core, and `docs/` for the current browser interface.

HGX2 is opt-in through the ROM header. The software renderer supports raw/LZ77 resources and native fallback; see [upstream HGX documentation](https://github.com/pm-start/mGBA_celio_edition/blob/e691a05b10e3ad1c6f95485ea3f539037519877a/doc/hgx.md). Ordinary ROMs retain the native rendering path.
