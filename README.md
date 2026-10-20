# 94online-arena

A browser-based NHL '94 arena for NHL94Online.com Gaming. Players pick a system (Sega Genesis or
Super Nintendo), load **their own ROM** from their computer, then play a local match or host/join an
online match. The emulator boots the ROM from power-on, so teams, players and rules are all chosen in
the game's own menus. Custom ROMs and ROM hacks work.

For non-commercial use. **No ROMs are included or hosted; supply your own.**

## Run it

From this folder:

```
python3 -m http.server 8000
```

Open <http://localhost:8000/>. Any static web host works (it also runs from a sub-folder, for example GitHub Pages).

## Features

- Genesis (Genesis Plus GX) and SNES (Snes9x2010) cores compiled to WebAssembly
- Online play over WebRTC with rollback netcode (PeerJS signaling), 3-letter room codes
- ROMs compared by CRC32 when players connect; mismatched ROMs are blocked
- Host chooses Player 1 / Player 2 (controller port swap)
- Save and load states (`.state`, named after the ROM); online, only the host loads and the guest resyncs
- Direct vs TURN-relay indicator, ping / jitter / input-delay diagnostics, high-jitter notice
- Emulator volume slider and mute
- Username field (saved in the browser) shown next to your chat messages, with a Host or Guest tag
- Setup panel collapses when a game starts (Show setup button brings it back)
- EMULATOR CONTROL (under Play & Controls): **Reset emulator** restarts a local game from power-on; **RAM viewer** opens a separate window where you type work-RAM addresses to watch live values plus a 128-byte dump. It is read-only. **Load CSV** imports a watch list, one `Label,RAM address` per line (an optional header row is skipped)
- Online chat (Tab to jump to the chat box; in full screen, messages appear as an overlay and Tab opens a message line)
- Replays: **Save replay** records every button press by frame (both players, local or online) into a
  small `.replay` file; **Watch replay** plays it back exactly by booting the same ROM from power-on.
  Online matches record only inputs both sides have confirmed, so rollback corrections never end up in the file.
  Loading a save state mid-game is stored in the replay too. A replay only plays with the same ROM
  (CRC32) and emulator build it was recorded with.

See the notes in `docs/CHANGES.txt` for the full change history.

## Online play notes

Signaling uses PeerJS's free public server (`0.peerjs.com`) and its shared public TURN relays. For a
busy site, run your own signaling server and TURN server (for example coturn).

## Third-party code and licenses

- Genesis Plus GX: <https://github.com/ekeeke/Genesis-Plus-GX> (its own license; non-commercial use)
- Snes9x2010: <https://github.com/libretro/snes9x2010> (non-commercial license)
- PeerJS: <https://peerjs.com/> (MIT)

The bundled `game/core/*.wasm` files are prebuilt binaries of those emulators; refer to the
upstream projects for their licenses and source code. This arena is derived from a browser NHL '94
arena originally published at kingof94.web.app and has been heavily modified.
