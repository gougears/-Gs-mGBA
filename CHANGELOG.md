## 2026-10-25 — 認証済み起動のちらつき修正

- パスワード画面を初期状態で非表示にし、認証記録がない場合だけ表示。
- 認証済みの起動・スクリプト読込中はパスワード画面を表示せず、読込失敗時は再読み込み案内を表示。

## 2026-10-25 — 更新通知と更新ボタン

- 新版のダウンロード完了時に更新通知・更新ボタンを表示。自動確認は継続し、開いている画面の再読込は利用者の確認後に実行。
- 通信中・配置編集中の更新を防止。複数画面が開いている場合は閉じるよう案内。

## 2026-10-25 — iOSホーム画面の上部バー

- 縦画面の上部バー背景をセーフエリアまで延長し、iOSの上端ぼかしへの回避策を追加（標準・ボール・自由配置）。
- iOS実機での効果は要確認。Safariの通常タブ、横画面、Delta配置は変更なし。

## 2026-10-24 — 配置選択の整理

- 選択肢を通常配置・自由配置に限定。片手配置の実装と保存設定は復活用に保持。

## 2026-10-24 — ボールスキンの自由配置

- ボール背景のままグリッドでボタンを移動、個別サイズ変更、表示切替。ボール別に保存。
- 自由配置は立体感のあるメタリックボタン。持ち方から通常・左持ち・右持ちへ戻せます。

## 2026-10-24 — 片手用ボールスキン・一覧整理

- 各ボールに通常／左持ち／右持ちの設定を追加し、ボール別に保存。片手配置は縦画面用（横画面は通常配置）。
- スキン一覧を種類別の折りたたみに整理。名前検索を維持。

## 2026-10-24 — ムーンボール装飾・設定名

- ムーンボールを丸みのある三日月と四方に光る星の装飾へ変更。
- 「画面・音量」を「一般」、「連射の設定」を「連射・マクロの設定」に変更。

## 2026-10-23 — マクロ操作位置・自動更新

- マクロ操作を画面下の重ね表示から上部の専用領域へ移動。縦横でコントローラーに重ならない配置に変更。
- 起動時・オンライン復帰時・表示復帰時と表示中5分ごとに更新を自動確認。
- 更新版は全ファイルの検証後に保存し、ゲーム開始前の単一画面で自動適用。プレイ中は強制再読込しません。

## 2026-10-23 — コントローラーマクロ

- 設定 → 画面・音量 → 連射・マクロに記録・再生・秒数指定の手動編集を追加。
- ROM・プレイヤーごとに4枠を端末内保存。1〜99回または停止するまで繰り返し。
- プレイ画面のマクロボタンと外部パッドへの再生・停止割当を追加。
- 設定を開く、一時停止、ROM切替、バックグラウンド移行時に停止。通信中は使用不可。

## 2026-10-23 — rom128-2・16MiBセーブ読込修正

- 新しいrom128-2コアを適用。HGZ1圧縮画像の処理に必要なzlibをブラウザ版で有効化。
- 16MiBセーブがサイズ判定で拒否される不具合を修正（RTC末尾情報付きも対応）。
- 添付16MiBセーブの読込・書出・リセット・クイックセーブ復元で全バイト一致を確認。従来6MiBセーブも検証。
- ソース参照、クレジット内の搭載バージョンとオフラインキャッシュを更新。

## 2026-10-23 — 128MiB ROM・HGX4対応

- rom128-1ソースを組み込み、同梱のHGX4更新と拡張描画を適用。
- ブラウザから128MiB ROMを読み込み・記憶・復元できるように変更。
- 128MiB ROMのバンク切替、クイックセーブ復元、従来ROMとセーブの互換性を検証。
- 使用コアの表示、固定ソース参照、再ビルド資料を更新。

## 2026-10-21 — HGX対応コア

- liru氏制作の rom64-hgx-1 ソースをブラウザ向けに適用。
- 対応ROMのHGX2背景描画を追加。通常ROMは従来の描画経路を使用。
- クレジットに「HGX版制作：liru氏」を追加。
- 初回パスワード、オンライン中の状態・部屋番号表示、既存の通信処理を維持。

## 2026-10-22 — rom64-netlink8 コア更新

- ももアイス氏の rom64-netlink-8 ソースをブラウザ向けに組み込み。
- 既存のセーブ・クイックセーブ・ネイティブチートAPIを維持。
- 通信処理は変更なし。
- コアの固定ソース参照と再ビルド手順を更新。

# 更新履歴

## 2026-10-20 公開版の更新

- 公開URLを https://gougears.github.io/-Gs-mGBA/ に統一。READMEの旧ユーザー名URLとソース案内を修正。
- GBA用Deltaスキンの読込・縦横配置・端末内復元。PDF.jsを分割同梱し、外部CDNなしで処理。
- iPhoneでDeltaファイルを選べるよう、ファイル選択時の形式フィルターを修正。
- 設定を8タブに整理し、各項目を白いカード表示に統一。ROM欄に保存済みROMの名前・容量・開く・削除を表示。
- 端末の表示領域への自動調整と、ブラウザのバー表示時のコントローラー配置を改善。
- 実画面でのグリッド自由配置、個別サイズ50〜200％、ボタン表示切替、ブルーメタリックの立体ボタンを追加。
- 読取専用メモリビューアーとmGBA標準処理による各種チートを追加。現行コアの追加ソースは tools/core/ に収録。
- 攻略サイト https://docs.pm-start.online をコントローラー領域で開閉するパネルを追加。
- mGBAなどの参考元、ももアイス氏、liru氏、くりーぱー氏、ユタコシ氏のクレジットを追加。
- 承認済みのGBAイラストをホーム画面アイコンに採用。追加用ページ add-to-home.html を公開。

以下は過去版の開発・検証記録です。現行仕様とソースの場所はREADMEを参照してください。過去のbuild番号やパスは当時の記録として残しています。

---

## 2026-10-19 撮影画質の改善

- スクリーンショットをドットを維持した6倍サイズ（1440×960）のPNGで保存。
- 動画を4倍サイズ（960×640）、最大60fps、映像8Mbps指定で録画。
- 録画用画面はゲーム描画に同期し、ゲーム画面と音声のみを収録。
- 実際のフレームレート・ビットレートは端末とブラウザに依存します。

# mGBA Celio Pocket — browser build 42

Built from the patches in the user's mGBA-celio-2.0.0-rom64-netlink6-win64.zip.
Base: Exormeter/mGBA_celio_edition commit 3da13060a586f2da8eb4ecbb167f642e2e4889c2.
License: MPL-2.0. Complete modified core and build instructions are in dist/source.zip.

## Changes
- Permanent game screen and controller. Uploaded Delta skin PDFs are rendered into five local PNG assets; hit areas use the supplied info.json coordinates. Built-in Poke Ball (default), Great Ball, Ultra Ball, Master Ball and Beast Ball skins; custom layout remains available. Portrait and landscape keep the whole 3:2 game image visible.
- Initial game screen has a direct ROM picker. ROM input filters remain unrestricted for iOS Files compatibility; extensions and sizes are checked after selection.
- Two independently instantiated WASM cores. Select Player 1 / Player 2 to operate. Player 1 keeps existing save keys; Player 2 uses a :player2 suffix for isolated .sav and four quick slots, even with the same ROM. ROMs can now be remembered in local IndexedDB and reloaded automatically.
- The local Celio relay remains available alongside restored optional online communication. Both games run at 1x while connected; only the selected side receives input and produces audio. Switching releases input and preserves both cores and the connection. While disconnected the inactive side is suspended.
- Local handshake/status coordination follows Celio-Server/src/session.ts. Fixed 32-word SIO payloads pass directly between independent WASM heaps. Local mode uses no network; online mode uses the Celio relay only on explicit create/join. This retains the uploaded core's Celio protocol, not a newly implemented generic GBA cable protocol.
- Audio: core default volume 256, browser volume 0-100%, gesture start/resume. Fast-forward PCM plays at 2x/3x/4x including matching pitch changes.
- Separate quick-save/load buttons and four persistent slots per player/ROM, including game save, RAM and XRAM. One .sav export action, native picker / iOS Save to Files sheet / download fallback. Player 2 exports include _P2 in filename.
- Settings include skins, custom button placement and size, volume, turbo and app cache cleanup. Cache cleanup preserves all saves and settings.

## Privacy and behavior
ROM and save files stay inside the browser, except explicitly exported files. Online mode sends SIO game communication through the Celio relay; no ROM or .sav file is uploaded. CSP connect-src permits only wss://celio-server.up.railway.app. No analytics or third-party scripts are loaded. Normal website and bundled image/script requests are needed to load the page. No user ROM is included in the site or source archive.

During local link sessions speed is fixed at 1x; quick save/load, .sav import and reset are disabled. Hiding or pausing the page and replacing a ROM closes the connection. Switching active player preserves local sessions and disconnects online sessions. Saves are isolated by player. Site access is unchanged.

## Verification
- Core boot, RGB framebuffer, 64MiB mapping, XRAM, 6MiB .sav tests passed.
- An emulated PSG tone reproduced peak 0 before the volume fix and peak 11520 afterward (32768Hz PCM).
- Named-state roundtrip restored WRAM, XRAM and 6MiB save data. State test size: 6,692,996 bytes.
- Device hook tests passed AwaitMode, HandshakeReceived and LinkConnected transitions.
- Actual relay accepted batch packet shape and rejected legacy single-packet shape. Two isolated test connections created/joined a room, received master/slave commands and exchanged synthetic 32-word data; both were closed afterward. No user ROM/save data used.
- UI logic tested with real WASM and mocked DOM/IndexedDB/AudioContext: four persistent slots, correct slot restore, 4x setting, audio gain/resume, button settings and cache cleanup preserving slots. Build 5 also checks separate quick-save/load actions, controls visibility, 4x audio source playback rate with nonzero gain, and exported .sav bytes.
- No control-browser skill is available, so actual iPhone/Safari visual, audio-output and touch QA is not performed. Real game battles/trades are not tested. Network UI labels this as experimental.

## Build 6 validation
Run `node tests/local-link.cjs` and `node tests/ui.cjs` from the repository root.
- Two real compiled WASM cores: independent memory, Celio handshake and exact 32-word forwarding to the other core's receive function passed.
- Real WASM with mocked browser UI: initial ROM picker, five skin hitmaps and diagonal touch, two same-ROM games with different .sav bytes, player-specific quick slots, export bytes, 4x audio source rate, and continued execution of both linked cores after switching passed. No networking was available in this test.
- All five PDF skin renders inspected. Original attached assets are preserved as rendered artwork with matching hit regions.
- Browser layout, physical iPhone audio/touch and real-game battle/trade have not been tested here. A successful protocol test does not establish game-level interoperability.

## Build 7 input and quick actions
- The old rectangular diagonal hit test could send left+up together. Direction input now uses mutually exclusive cardinal sectors, a 14% central neutral area and 1.3x axis hysteresis. Exactly one direction is sent, with pointer capture, single-pointer ownership, sliding transitions and release/cancel/blur resets.
- Settings selects the original d-pad or a fixed-base visual stick, both with four-direction input. Works with all five supplied skins and the custom layout. Other buttons still accept concurrent touches.
- Select slot 1-4 once in Settings. Q.SAVE overwrites that selected slot immediately; Q.LOAD restores it immediately. The same selection applies to both buttons and is remembered. Storage remains isolated per player/ROM. Empty-slot load reports an error and leaves the game intact. Slot manager remains available for selecting/deleting slots.
- Game notices report completed save/load without opening settings. Communication still blocks state saves and loads.
- CSS disables touch callouts, selection, dragging and game-surface browser gestures. Gesture/context-menu/selectstart handlers suppress page-level long press and zoom. Settings can still scroll. Browser/OS accessibility zoom may override page restrictions.
- Real-WASM mocked-UI test covers four directions, near-boundary hysteresis, stick neutral/motion/reset, second-pointer rejection, custom stick, and selected-slot save/overwrite/load with actual memory restoration. No physical iPhone browser was available for touch/gesture validation.

## Build 8 persistence, online link and gamepads
- Opaque stick housing covers the complete baked-in d-pad and its bottom shadow in every skin. Custom-layout d-pad is also obscured by the housing.
- Choose local or online communication in Settings. Online mode restores the original Engine.IO / Socket.IO transport and room create/join UI. Only the active core runs online; the second local core runs only during a local link. Mode changes and online player changes disconnect the old link.
- IndexedDB migration to version 3 adds roms and backups without removing existing saves/quick stores. Remember ROM defaults on, stores the latest ROM for each player, and reloads both on startup before selecting Player 1. User can disable remembering/autoload and remove each cached ROM independently. Removing a ROM cache does not remove saves/backups.
- Every five minutes while the page is open, clone available .sav data for each loaded player/ROM into an atomic history of at most ten entries. These are game-save backups, not snapshots of unsaved RAM. Hidden pages are skipped. Quota failures are reported. Settings lists timestamps and offers file export and confirmed restore via the existing .sav import flow.
- Standard Gamepad API mapping for already connected Bluetooth/USB controllers: physical bottom/right face buttons => GBA A/B, shoulders => L/R, buttons 8/9 => Select/Start, d-pad/left stick => exclusive cardinal movement with 25% stick dead zone. Input clears on disconnect and is suppressed while settings are open, paused or busy. Browsers and device hardware determine controller exposure; nonstandard layouts use standard indices as a fallback.
- Extended real-WASM mocked-browser test passes ROM persistence/reload, migration stores, 5-minute threshold, 12 snapshots retaining the newest 10, backup export/restore, gamepad direction/button/deadzone/disconnect and online transport initiation without any actual network connection.
- Actual iPhone layout and Bluetooth/USB hardware, and real game online battles/trades remain unverified. Existing earlier live relay checks are historical, not a new game-level test.

## Build 9 settings, same-name states and screen wake lock
- Removed the duplicate settings dashboard. Seven accessible tab panels group ROM, saves, controls, audio/speed, communication, device and information. Dialog routes automatically open the relevant tab. The tab navigation and close control stay together while scrolling.
- Quick-state keys now use player number and normalized ROM filename (NFKC, trim, lowercase). Existing hash-keyed states are copied into that namespace without deleting originals, using the current ROM hash and the previously cached same-name ROM hash. Saves/backups retain content-hash isolation. Each state records the normalized name and player; quick loading uses the named namespace.
- A real-WASM test migrates a legacy state, changes a byte of the same-name ROM, and restores the original RAM value successfully. Different builds of a game can still be incompatible with saved emulator state; this is not a guarantee for unrelated ROMs sharing a filename.
- Default-on Screen Wake Lock requests prevent display sleep in supporting browsers while the page is visible. The setting shows availability, success and failure, releases when disabled, and attempts reacquisition on visible/resume/user activity. This cannot stop OS browser termination or prevent users closing a tab. No window.close, automatic navigation or unload trap is added.
- Tests cover tab routing, preservation/migration of legacy states and mocked wake-lock request/release deduplication. Actual iPhone browser behavior remains unverified.

## Build 10 save layout, screenshots and second-player shutdown
- Save settings are separated into four cards: save files, quick states, automatic backups and screenshots. Paired actions use equal-width grids instead of wrapping inline. Import label is セーブ読込.
- The local-communication settings include an explicit Player 2 exit. It flushes the second player's .sav before stopping that core, disconnects a local session (or player-2 online session), selects Player 1, releases references, and retains saves, backups, quick slots and cached ROM. A closed flag prevents the retained second ROM from autostarting until it is opened again.
- A transparent no-text button matches the ball center on all five skins: center (160,139), diameter 34 in the 320x240 mapping. It captures only the 240x160 game canvas as PNG and offers file save through native picker, iOS file sheet, or download fallback. Custom layout shows a small ball-style target too. An accessible label is provided without adding visible text.
- Real-WASM mocked-browser tests pass Player 2 shutdown during communication, save retention, no automatic restart, screenshot hit target and exported File type/name/bytes, plus the PNG native-picker type filter. Browser-native canvas encoding, iOS Files and visual touch positioning were not exercised on physical hardware.

## Build 11 immediate save import and simplified audio settings
- Removed duplicate audio toggle and speed toggle buttons from settings. Volume, audio resume, speed selection and the controller TURBO action remain available. A status label reports the active speed.
- Selecting a valid .sav immediately imports it into the active core and reloads the game internally, persists the imported save, closes settings and resumes. No second confirmation, manual reset or browser restart is required. The game still returns to its title screen so Continue can read the new save; .sav does not contain live CPU/RAM state. Backup restoration retains its explicit confirmation.
- Real-WASM tests assert imported save bytes immediately after the file selection handler, cleared pending data, resumed execution and the retained 4x TURBO/audio behavior. Physical iPhone behavior remains unverified.

## Build 12 pause indicator
- Pausing displays a game-area overlay with 一時停止中 and tap-to-resume. The pause action dismisses settings so the indicator is visible. Tapping resumes only with a loaded game, no active data operation, and settings closed. The overlay is outside the framebuffer and is excluded from PNG screenshots.

## Build 13 screen layout regression fix
- Removed the build 12 relative-position override on game-frame. Its existing absolute inset layout fills game-stage and gives the canvas a nonzero height. Pause overlay remains positioned within that existing frame.

## Build 14 trainer-style settings
- Settings-only red/white ball motif, dark ink navigation, pale dotted background and framed menu cards. All seven category tabs fit a two-row mobile grid; landscape uses one row. Controls retain IDs and behavior, with readable light inputs, minimum 44px targets and visible focus. No game-frame or controller layout changes.

## Build 15 landscape and audio resume
- Five original edge-to-edge landscape skin PDFs rendered with alpha, with their exact 812x375 hit maps and A+B simultaneous input. Orientation changes rebuild controls and release keys. Central game framebuffer retains 3:2.
- Pause flushes queued audio without suspending the audio device; reset/import initiate audio within user interaction, and game taps retry audio activation. Browser autoplay restrictions still require an initial gesture; native game boot silence is not bypassed. Physical iPhone audio timing remains unverified.

## Build 16 task-switch recovery and ergonomic controls
- Backgrounding marks the AudioContext for replacement, clears queued sound and pauses the game. The resume gesture creates a new context and gain node; interrupted/closed contexts also recover, while stale context callbacks cannot change the replacement. Tests cover background/resume and interrupted-context replacement, volume retention and cleared timing.
- Portrait game-stage is exactly 3:2 with no inner border or vertical letterbox. The controller fills remaining space. Original vector skin paths are rebuilt with taller 320x320 composition, 10% larger controls, closer A/B, and matching hit maps. Vector artwork is retained as SVG rather than editing raster pictures.
- Landscape has L/MENU/d-pad/Q.SAVE/SELECT on the left and R/TURBO/A/B/A+B/Q.LOAD/START on the right. Its central framebuffer is 3:2. Screenshot remains a separate ball below the screen.
- D-pad input maps only the four visible cross arms, with neutral center, corners and outside bounds. Each arm has its own accessible button and highlight; the stick retains radial hysteresis. Tests cover individual arms, corner/center release, simultaneous A+B, and orientation changes. Native iPhone audio and browser layout are not directly exercised by the mocked-DOM tests.

## Build 17 additional skins and uniform controller scale
- Added Cobalt, Cherish, Dive, Luxury, Love, Moon and Quick to the existing five skins. Original ball PDF vector artwork is retained with standard 320x240 controls (99x99 direction pad and 48x48 A/B); the closer A/B placement remains. Uniform sizing replaces vertical stretching, with matching hit regions and fitting to available portrait space.
- Cobalt uses the supplied bitmap unchanged inside an SVG viewport, removing its redundant screen above the controller. It is scaled uniformly to the maximum available width/height. Its original SAVE, LOAD and FFW labels activate selected-slot quick-save, quick-load and turbo. Original visible controls are mapped; unsupported invisible combo regions are omitted. Landscape uses the established split-side arrangement in cobalt colors since this source supplies portrait only.
- Tests cover all twelve skin files, in-bounds mappings and uniform fit, and execute the Cobalt quick-save/load against real WASM memory plus turbo. Original vector previews were inspected; native iPhone browser rendering remains unverified.

## Build 18 responsive ball shells and external-controller settings
- Portrait ball skins fill the available controller height without stretching: the original top 188 design units and bottom 52 units retain their uniform scale, the original lower-body color fills the space between, and the lower action rows move with the bottom artwork. Screenshot and hit regions share the same logical-height mapping. Cobalt assets, sizing and mappings are unchanged.
- External-controller connect/disconnect notices use both events and polling so delayed browser discovery is handled. A dedicated external-pad tab offers ten GBA button mappings, press-to-assign, live button identification, axis selection/disable, axis inversion, deadzone adjustment and reset. Profiles are stored per controller ID on the device. Assignment mode suppresses gameplay and cancels when its settings page is left.
- Real-WASM/mock-DOM integration tests cover profile persistence, manual and learned remapping, suppression during assignment, deadzone/inversion/reset, connect/disconnect notices, and responsive two-slice layout with unchanged control scaling. Physical Bluetooth/USB hardware and native iPhone layout remain unverified.

## Build 19
- Portrait ball controls are separate original-vector layers: direction/A/B move to the middle, action rows rise by up to 18 design units. Geometry and hit targets share offsets; Cobalt and landscape are unchanged.
- Communication shortcut beside settings.
- Foreground return resumes only automatically paused sessions, rebuilding interrupted audio; manual pause remains paused. A timed recovery prompt enables gesture retry if automatic AudioContext resume is blocked. Native media metadata and play/pause actions added.
- Real WASM mocked UI regression tests cover foreground recovery, manual pause, shortcut, and art/hit geometry. Physical iOS output and background playback are not verified or guaranteed.

## Build 20
- Attempt audio activation immediately at startup, with existing gesture fallback for autoplay restrictions.
- Restore background pause: returning to the app leaves the pause overlay visible until the game screen is tapped. No automatic game resume.
- Mocked startup audio and background/foreground/tap-resume tests pass; iPhone hardware audio remains unverified.

## Build 21
- Startup gate: one explicit tap starts browser audio and releases gameplay. Remembered ROM loading occurs behind the gate; no emulated frames or audio run beforehand. No-ROM users proceed to the existing ROM picker.
- Background pause and tap-to-resume remain unchanged. Tests cover audio creation on start click; physical iPhone output remains unverified.

## Build 22
- External gamepad mappings add quick save/load, Home (settings toggle), and turbo toggle. New actions default to unassigned, preserve older profiles, and fire once per press. Capture/settings suppress gameplay actions. Quick actions use the selected slot and existing link restrictions.
- Real WASM regression test verifies mapped quick-state roundtrip, held-button suppression, turbo and Home toggles.

## Build 23
- Connected external pads in landscape hide touch controls and use the maximum aspect-correct 3:2 viewport by default. Optional 90/80/70% sizes persist in settings. Disconnect/portrait restores touch layout.
- Screen tap reveals a settings shortcut; mapped Home still toggles settings. Tests cover connection/orientation transitions, preference persistence and menu access. Full browser chrome hiding is not requested or guaranteed. Device visual QA remains unavailable.

## Build 24
- Controller settings navigation: directional movement with repeat delay, left/right select and range adjustment, A activation, B close, L/R tab cycling. Uses configured bindings and axes; visible focus highlight scrolls into view. Capturing bindings takes precedence.
- Settings inputs do not leak to gameplay, including the button used to close settings. OS file pickers and text entry still require touch.
- Mocked controller polling tests verify focus movement, select change, held-button suppression, A activation, R tab switching and B closing without game input. Physical device navigation is unverified.

## Build 25
- A on a controller binding field starts physical-button capture instead of cycling numeric IDs. The initiating held button is excluded until released. Focus returns to the assigned field after redraw, allowing successive assignments without touch.
- Add mapped screenshot capture; retain the local PNG until the user taps Save Image (needed for native file/share gesture). L/R now follows the rendered tab order. Tests cover capture without repeat, PNG export, and full forward/backward tab cycles.

## Build 26
- External-controller settings use separate navigation and content scroll areas: landscape sidebar, compact portrait header. Tabs never overlap selected rows.
- Controller focus scrolls the complete field/assignment row into view only when needed; highlighted rows improve label visibility. Tab changes reset content to the top.

## Build 27
- Screenshot save notification dismisses after 6 seconds, via X, or when opening the save sheet (including cancellation). The latest unsaved image remains available in Settings > Saves until replaced or the page closes. Tests cover dismissal, cancellation retention and later export.

## Build 28
- Explicit controller tab/content navigation: open settings on the active tab, A enters its fields, B returns to tabs then closes. All eight tabs are reachable by directions or L/R.
- A on non-binding selects opens a custom option list. Up/down chooses, A commits, B cancels without modifying the value. Mapping fields retain physical-button capture.
- Regression tests cover all eight tab-to-field routes using the real target selector and controller-driven choice-list open, change, commit, cancel and focus restoration. Physical iPhone/controller testing remains unperformed.

## Build 29
- Mitigation for reported iPhone screen-recording distortion: default playback latency hint with an 80ms initial scheduling cushion; optional low-latency mode remains. No OS recording detection or guaranteed fix claimed.
- Keep PCM chunks contiguous instead of repeatedly adding a new minimum delay when queued sound is still valid. Bounded queue and late-buffer recovery retained. Repair/restart audio rebuilds only the AudioContext, preserving core state.
- Tests cover output mode selection, sequential scheduling, underrun/queue limits and audio repair without game reset. Actual iPhone recordings are unverified.

## Build 30
- Capture button opens screenshot/video choice, touch or controller navigable. A second capture press stops an active recording, including while paused/settings open.
- Records only the 240x160 game canvas at up to 30fps plus the existing gain output via MediaStreamDestination. No display capture, microphone, camera, ROM transfer or upload. MP4 preferred; WebM fallback with capability detection.
- Local video is exported through a touch Save action or Settings > Saves. Background/audio-engine replacement ends recording; tracks and audio branch are cleaned up. Memory protection stops above 256MiB. Unsaved media is lost on reload.
- Real WASM plus mocked media tests cover touch/controller choice, video-only canvas source with audio branch, stop while paused, MP4 save, cancellation retention, background/audio-repair cleanup and unsupported feature messaging. Actual iPhone video encoding/output is not verified.

## Build 31
- Ball skins: proportional larger D-pad/stick and A/B with matching non-overlapping hit areas, portrait and landscape. Lower portrait action rows have 17px vertical spacing (previously 9px), with outer columns shifted outward. Cobalt is unchanged.

## Build 32
- Larger proportional ball controls and lower action buttons; portrait action row gap increased to 25.3 design pixels. Cobalt unchanged.
- Controller .sav export uses a direct download instead of a gesture-gated native share/file picker. Touch export retains native file saving.
- Deferred scripts and reduced repeated startup storage reads: quick-save migration is remembered per ROM hash/name/player; slot thumbnails load when management is opened; remembered-ROM restoration avoids a duplicate ROM read/hash.

## Build 33
- Start can be tapped during preparation; audio unlocks in that gesture and the game begins when ready without a second tap. Hidden pages do not auto-start.
- Remembered ROM reads overlap engine preparation. Restore reuses bytes and the atomically stored digest instead of File/ArrayBuffer round trips and repeated hashing; legacy ROM records still hash safely. Engine script preloads from the document head.

## Build 34
- Embed the existing stylesheet in the initial HTML with an exact SHA-256 CSP allowlist. The first frame no longer waits for a separate render-blocking CSS fetch. No unsafe-inline permission is added. Early dark color-scheme/theme metadata matches the start screen.
- This removes one initial render dependency; hosting/browser navigation latency before HTML delivery remains outside this change. The reported six-second video was unavailable locally, so no before/after device timing is claimed.

## Build 35
- Merge operation, audio/speed, and device tabs into General Settings with category buttons; dedicated external-controller page retains its fields and duplicate IDs are removed.
- Live draggable free-layout preview with synchronized sliders and persistent positions.
- Ball skins: MENU replaces header GBA SP label. SELECT / RAPID / START occupy the first lower row, with quick save / speed / quick load below. Cobalt assets remain unchanged.
- Rapid fire: arm then press a target button; toggle again to stop. Auto-latch and held-only modes, 5/8/12 Hz. Pause, settings and focus loss clear rapid input.
- Core compatibility tests confirm 64MiB ROM, XRAM and 6MiB save round-trip. The supplied game warning about adventure slot 2 is not reproduced; no guessed ROM patch or warning bypass is applied. Game/hack name and version are needed to identify its compatibility probe.

## Build 36
- Free layout now independently places SELECT, START, HOME, TURBO, RAPID, Q.SAVE and Q.LOAD, with draggable previews and persisted positions. Legacy combined menu coordinates migrate to separate positions; unchanged old shoulder defaults move out of the new lower action row.
- Re-downloaded the original Windows ZIP: all eight supplied patches match the browser source archive byte-for-byte. Additional real-WASM tests pass the CPU mGBA identity handshake (0xC0DE / 0x1DEA), independent flash banks 0/1/2/95, full XRAM range, and 6MiB save export. The game-specific adventure-slot warning is still unreproduced; no guessed core or game patch is applied.

## Build 37
- Reproduced PokemonSTART v0.45.0's adventure-slot warning with the shipped WASM core. Its flash-alias predicate compares contents of different banks: fully erased banks all read FF, causing a false unsupported result. The supplied Android reference also implements independent expanded banks; replacing the core does not solve this ambiguous content check.
- Compatibility detects the known predicate and its comparison helper structurally, with PKSJ/BPRJ + PKSPICS1 + 64MiB guards, exact non-relocation instructions/literals, resolved branch targets, helper thunk and unique match. No version, filename, hash or fixed address restriction: relocated code with the same verified structure is accepted. Changed or ambiguous routines are left untouched; unprovided future ROM implementations are not guaranteed.
- Only the loaded execution copy receives the capability-return correction on this verified 96-bank core. Original files, remembered ROM bytes, digests and save keys stay intact. No save bytes are seeded/rewritten by this correction. No supplied ROM, save or extracted game assets are included in distribution.
- Tests: original warning reproduced; corrected two-slot menu pixel hash and second-slot start; original digest preserved; simulated relocated/revision-changed matching; changed/ambiguous/unrelated ROM rejection; core bank 0/1/2/95 and UI/save regressions. Real iPhone QA, later ROM releases and a full game/save playthrough are not performed. Reopen ROM after updating; quick-load of an old warning-screen state needs reset.

## Build 38
- Portrait free-layout controls fill the player's width and remaining height below the 3:2 game frame, instead of the old fixed 248px panel. All controls scale uniformly from a 320px baseline with a height fit, retaining saved percentage positions and the size slider. Screenshot control stays circular.
- Placement preview grows with the controller aspect ratio (280–460px), using proportional button geometry without the settings button minimum-height interference. Built-in skin geometry is unchanged.

## Build 39 — reference ball layout
- Portrait ball skins: SELECT and START in a centered two-button row, Q.SAVE / TURBO / Q.LOAD spread below. Rapid fire stays available in the top toolbar; removed the duplicate portrait RAPID button.
- Action artwork and hitboxes match, with uniform button proportions and the existing directional/A/B geometry. Cobalt, landscape and custom layout unchanged.
- Skin bounds/overlap checks and initial-render checks passed; no physical iPhone visual QA.

## Build 40 — restart game from settings
- Game restart available in General Settings and ROM. Confirm or cancel with touch/gamepad; restart the active core, retain game save and quick slots, close settings and resume. No browser reload. Link sessions must be ended first.

## Build 41 — free-layout preview visibility
- Skip placement on zero-sized or hidden surfaces. Refresh after opening settings, switching tabs and resizing the preview/controller; retain saved normalized positions.

## Build 42 — inline restart confirmation
- ROM and General Settings show restart/cancel directly beneath the selected restart button, without switching to the saves tab. Gamepad can confirm in place. Closing settings or changing tabs cancels pending confirmation.
