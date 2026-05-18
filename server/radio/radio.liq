#!/usr/bin/liquidsoap
%include "/etc/liquidsoap/schedule.liq"

radio = mksafe(scheduled)

# write current track to a file the smallweb radio app can read
def write_now(m) =
  fn = m["filename"] ?? ""
  ttl = m["title"] ?? ""
  artist = m["artist"] ?? ""
  album = m["album"] ?? ""

  # strip the mount prefix + extension to get a clean display path
  short = ref(fn)
  short := string.replace(pattern="^/mnt/r2-music/", (fun (_) -> ""), !short)
  short := string.replace(pattern="\\.(mp3|wav|m4a|aiff|flac)$", (fun (_) -> ""), !short)

  # JSON-escape: backslashes first, then quotes
  def jesc(s) =
    a = string.replace(pattern="\\\\", (fun (_) -> "\\\\\\\\"), s)
    string.replace(pattern="\"", (fun (_) -> "\\\""), a)
  end

  payload = "{\"path\": \"" ^ jesc(!short) ^ "\", " ^
            "\"title\": \"" ^ jesc(ttl) ^ "\", " ^
            "\"artist\": \"" ^ jesc(artist) ^ "\", " ^
            "\"album\": \"" ^ jesc(album) ^ "\", " ^
            "\"started_at\": " ^ string_of(int_of_float(time())) ^ "}"

  file.write(data=payload, "/data2/smallweb/data/radio/now.json")
  log(label="now", payload)
end

radio = source.on_track(radio, write_now)

output.harbor(
  %mp3(bitrate=192, samplerate=44100, stereo=true),
  id="harbor_out",
  port=8000,
  mount="/radio",
  radio
)
