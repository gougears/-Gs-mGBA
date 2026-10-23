# Browser core: rom128-2

Current upstream: [pm-start/mGBA_celio_edition](https://github.com/pm-start/mGBA_celio_edition/tree/b3975350076fbd3d86e7dc6796cdadb0ccdb9a89), tag `rom128-2`, commit `b3975350076fbd3d86e7dc6796cdadb0ccdb9a89` (HGX版制作：liru氏、ROM64版：ももアイス氏). The uploaded source archive was used for this build.

## Rebuild

1. Download and extract the source at the pinned upstream commit above (or the matching `mGBA_celio_edition-rom128-2.zip`).
2. Install/activate Emscripten **3.1.74**, CMake and Python 3.
3. From this repository run `bash tools/core/build-browser.sh /path/to/extracted-source /path/to/build`.
4. Copy the resulting `celio-web.js` to `docs/celio-web.js`, then run `python3 tools/build-offline.py docs`.

The script adds the browser target, disables pthread selection for Emscripten, and enables bundled zlib for HGZ1 compressed resources. `browser.c` and `browser-cheats.inc` retain the existing browser API, extended saves, quick states and native cheat engine. `browser-link.cpp` is the unchanged browser communication bridge from the previous source snapshot. The web communication protocol (`docs/link.js`, `docs/local-link.js`) is unchanged; this release does not add PC interoperability improvements.

Native cheats include encrypted PAR v3, GameShark/AR v1-v2, CodeBreaker, autodetection and VBA direct codes. A whole group is validated before installation. No ROMs or cheat codes are sent to a server.

The upstream experimental SuperCard path requires `MGBA_SCEMU=1`; it is not enabled in this browser build.

These source files are provided under MPL-2.0; see the repository LICENSE and upstream source headers. `docs/source.zip` remains an older baseline snapshot, not the current ROM128/HGX4 source. Use the pinned upstream plus this directory for the current core, and `docs/` for the current browser interface.

HGX2 is opt-in through the ROM header. The software renderer supports raw/LZ77 resources and native fallback; see [upstream HGX documentation](https://github.com/pm-start/mGBA_celio_edition/blob/b3975350076fbd3d86e7dc6796cdadb0ccdb9a89/doc/hgx.md). Ordinary ROMs retain the native rendering path.


## October 23 update

The supplied `rom128-2` archive is the build base. It already contains HGX4 plus its later 8bpp/OBJ256 changes; do not overwrite these with the older `rom64-hgx4-1` renderer. The companion HGX4 archive was compared at [5d22519abe4d519f802387b9a6d2a44886e05c78](https://github.com/pm-start/mGBA_celio_edition/tree/5d22519abe4d519f802387b9a6d2a44886e05c78).

ROM sizes accepted by the browser are 192 bytes through 32 MiB, exactly 64 MiB, or exactly 128 MiB. For 128 MiB ROMs the lower 32 MiB remains fixed; banks 1–3 appear at 0x0A000000–0x0BFFFFFF. Games select a bank using the upstream four-halfword protocol at 0x0B7FFF00 (0xB128, 0x5A0E, bank, ~bank). Reset restores bank 1; quick states preserve the selected bank. Games must support this mapping to use the extra ROM capacity.

Validation: artificial 128 MiB ROM bank switching/state/reset, HGX4 raw4/raw8 rendering and state cache rebuild, previous HGX1 quick-state compatibility, native cheats, existing boot/audio/64 MiB/6 MiB save/XRAM checks, and upstream HGX regressions. These do not claim real-device or commercial-game coverage.

## rom128-2 save fix

The browser accepts 16 MiB `.sav` files (also with the optional 16-byte RTC footer). The attached save was verified byte-for-byte after import/export, reset and quick-state restoration, including banks up to 255. The file itself is not included in this repository. Older 6 MiB saves remain supported. Upstream HGX4 updates include HGZ1 resources, scaled tiles, night palettes and bank-aware resource caching.

rom128-2 validation: all 288 upstream HGX synthetic checks passed with zlib enabled, including HGZ1 decoding and malformed resource checks. Browser boot/audio/XRAM, 6 MiB saves and quick states also passed.
