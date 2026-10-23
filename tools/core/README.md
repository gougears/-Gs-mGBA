# Browser core: rom128-1

Current upstream: [pm-start/mGBA_celio_edition](https://github.com/pm-start/mGBA_celio_edition/tree/f9dc23efcf900787b0cdb9a480a5b41d8abc44cb), tag `rom128-1`, commit `f9dc23efcf900787b0cdb9a480a5b41d8abc44cb` (HGX版制作：liru氏、ROM64版：ももアイス氏). The uploaded source archive was used for this build.

## Rebuild

1. Download and extract the source at the pinned upstream commit above (or the matching `mGBA_celio_edition-rom128-1.zip`).
2. Install/activate Emscripten **3.1.74**, CMake and Python 3.
3. From this repository run `bash tools/core/build-browser.sh /path/to/extracted-source /path/to/build`.
4. Copy the resulting `celio-web.js` to `docs/celio-web.js`, then run `python3 tools/build-offline.py docs`.

The script adds the browser target and disables pthread selection for Emscripten. `browser.c` and `browser-cheats.inc` retain the existing browser API, extended saves, quick states and native cheat engine. `browser-link.cpp` is the unchanged browser communication bridge from the previous source snapshot. The web communication protocol (`docs/link.js`, `docs/local-link.js`) is unchanged; this release does not add PC interoperability improvements.

Native cheats include encrypted PAR v3, GameShark/AR v1-v2, CodeBreaker, autodetection and VBA direct codes. A whole group is validated before installation. No ROMs or cheat codes are sent to a server.

The upstream experimental SuperCard path requires `MGBA_SCEMU=1`; it is not enabled in this browser build.

These source files are provided under MPL-2.0; see the repository LICENSE and upstream source headers. `docs/source.zip` remains an older baseline snapshot, not the current ROM128/HGX4 source. Use the pinned upstream plus this directory for the current core, and `docs/` for the current browser interface.

HGX2 is opt-in through the ROM header. The software renderer supports raw/LZ77 resources and native fallback; see [upstream HGX documentation](https://github.com/pm-start/mGBA_celio_edition/blob/f9dc23efcf900787b0cdb9a480a5b41d8abc44cb/doc/hgx.md). Ordinary ROMs retain the native rendering path.


## October 23 update

The supplied `rom128-1` archive is the build base. It already contains HGX4 plus its later 8bpp/OBJ256 changes; do not overwrite these with the older `rom64-hgx4-1` renderer. The companion HGX4 archive was compared at [5d22519abe4d519f802387b9a6d2a44886e05c78](https://github.com/pm-start/mGBA_celio_edition/tree/5d22519abe4d519f802387b9a6d2a44886e05c78).

ROM sizes accepted by the browser are 192 bytes through 32 MiB, exactly 64 MiB, or exactly 128 MiB. For 128 MiB ROMs the lower 32 MiB remains fixed; banks 1–3 appear at 0x0A000000–0x0BFFFFFF. Games select a bank using the upstream four-halfword protocol at 0x0B7FFF00 (0xB128, 0x5A0E, bank, ~bank). Reset restores bank 1; quick states preserve the selected bank. Games must support this mapping to use the extra ROM capacity.

Validation: artificial 128 MiB ROM bank switching/state/reset, HGX4 raw4/raw8 rendering and state cache rebuild, previous HGX1 quick-state compatibility, native cheats, existing boot/audio/64 MiB/6 MiB save/XRAM checks, and upstream HGX regressions. These do not claim real-device or commercial-game coverage.
