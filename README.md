# music

Terminal CLI for managing audio in a Cloudflare R2 bucket, with a TP-7 import workflow.

Reads R2 directly for instant truth; writes go through wrangler. Powers [music.tools.ejfox.com](https://music.tools.ejfox.com).

## Install

```bash
mkdir -p ~/bin
curl -fsSL https://raw.githubusercontent.com/ejfox/music-cli/main/bin/music -o ~/bin/music
chmod +x ~/bin/music
~/bin/music setup
```

(Last line uses the absolute path so it works even if `~/bin` isn't on your `$PATH` yet.)

`music setup` will:
- Install missing deps via Homebrew (`ffmpeg`, `jq`, `awscli`, `node`)
- `npm install -g wrangler` and run `wrangler login` if needed
- Prompt for R2 credentials (pulls from 1Password automatically if `op` is signed in)
- Offer to install a LaunchAgent that auto-runs `music import` when a TP-7 mounts

Requires macOS + Homebrew. zsh.

## Quick reference

```
music                          list all tracks, grouped by album
music ls [filter]              list (optionally filter by substring)
music homeless                 tracks not in an album folder
music albums                   list album names only
music mv <track> [album]       move a track (fuzzy matched)
music rm <track>               delete (strong confirm: type filename)
music put <local> [album]      upload a local .mp3/.wav
music get <track> [out]        download a track
music convert <local.wav>      local WAV → MP3 (next to source, no R2)
music info <track>             ffprobe metadata for an R2 track
music import <dir>             walk a folder, ask category per file, tag + upload
music new-album <name>         create a new album folder

music setup                    install deps + LaunchAgent
music login                    store R2 credentials
music install-watcher          install just the TP-7 mount LaunchAgent
music uninstall-watcher        remove the LaunchAgent
music help                     this help
```

Flags: `-y/--yes` (skip confirms), `--json` (machine-readable output), `--mp3` (force convert on put), `--bitrate <rate>` (default 192k).

## TP-7 workflow

Plug in your TP-7. The LaunchAgent fires when a volume named `TP-7` (or similar) mounts under `/Volumes/`, sends a macOS notification, and opens Terminal with `music import /Volumes/TP-7/` running.

For each audio file the importer asks:

```
[1/12] REC_001.wav (2:34, 24.5 MB, 2026-05-17)
  [m]usic  [f]ield  [s]peech-archive  [k]eep-and-skip  (default m): m
  album [music/2026-spring-modular]:                                 ← enter to reuse, type new to switch
  plan: convert → tag → upload
    source: /Volumes/TP-7/REC_001.wav
    dest:   music/2026-spring-modular/REC_001.mp3
    tags:   title="REC 001" album="2026-spring-modular" date=2026-05-17 artist=ejfox
  go? [y/N]
```

| category | destination |
|---|---|
| **music** | `music/<album>/<name>.mp3` (album default = last used, persisted in `~/.config/music/state.json`) |
| **field** | `field-recordings/<name>.mp3` |
| **speech-archive** | local `mv` to `~/Music/voicememos/<date>-<original>.wav` (no R2 touch) |
| **keep-and-skip** | source file untouched, no upload |

Music + field files are converted WAV→MP3 with ID3 tags (title, album, date, artist) before upload.

## Files

| path | what |
|---|---|
| `~/bin/music` | the script |
| `~/.config/music/.env` | R2 credentials (chmod 600) |
| `~/.config/music/state.json` | last-used album, per-machine |
| `~/.local/share/music-cli/tp7-mount-handler.sh` | LaunchAgent payload |
| `~/Library/LaunchAgents/com.ejfox.music-tp7-watch.plist` | LaunchAgent plist |
| `~/Music/voicememos/` | local archive for speech-classified files |

## License

MIT.
