import { Hono } from "jsr:@hono/hono";
const app = new Hono();

const NOW_FILE = "./now.json";

app.get("/now", async (c) => {
  c.header("Cache-Control", "no-store, max-age=0");
  try {
    const data = await Deno.readTextFile(NOW_FILE);
    const j = JSON.parse(data);
    return c.json(j);
  } catch {
    return c.json({ path: null });
  }
});

app.get("/health", (c) => c.json({ ok: true }));

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>RADIO · EJFOX</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { background: #000; color: #fff; font-family: ui-monospace, 'JetBrains Mono', Menlo, monospace; }
  body { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 24px; gap: 28px; }
  h1 { font-size: clamp(2.5rem, 14vw, 7rem); letter-spacing: -0.04em; font-weight: 900; text-align: center; line-height: 0.95; }
  h1 .dot { color: #e60067; }
  .live { display: inline-flex; align-items: center; gap: 6px; color: #6eedf7; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.15em; }
  .live::before { content: ''; width: 8px; height: 8px; border-radius: 50%; background: #e60067; box-shadow: 0 0 12px #e60067; animation: pulse 1.4s ease-in-out infinite; }
  @keyframes pulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.3 } }
  audio { width: 100%; max-width: 520px; accent-color: #e60067; }
  .now {
    color: #fff;
    font-size: 0.95rem;
    text-align: center;
    min-height: 1.4em;
    max-width: 520px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .now .lbl { color: #735865; text-transform: uppercase; letter-spacing: 0.15em; font-size: 0.7rem; margin-right: 6px; }
  .now .track { color: #e60067; }
  .meta { color: #735865; font-size: 0.8rem; text-align: center; line-height: 1.7; }
  .meta a { color: #6eedf7; text-decoration: none; }
  .meta a:hover { color: #e60067; }
  code { color: #6eedf7; background: #0d0d0d; padding: 2px 6px; }
</style>
</head>
<body>
  <span class="live">on air</span>
  <h1>radio<span class="dot">.</span>ejfox</h1>
  <audio controls autoplay preload="auto" src="/radio"></audio>
  <div class="now"><span class="lbl">now playing</span><span class="track" id="track">…</span></div>
  <p class="meta">
    192 kbps mp3 · 24/7 · shuffle of <a href="https://music.tools.ejfox.com">music.tools.ejfox.com</a><br>
    tune in via terminal: <code>mpv https://radio.tools.ejfox.com/radio</code><br>
    cli: <a href="https://github.com/ejfox/music-cli">github.com/ejfox/music-cli</a>
  </p>
<script>
  const el = document.getElementById('track');
  async function tick() {
    try {
      const r = await fetch('/now', { cache: 'no-store' });
      const j = await r.json();
      const display = j.title || j.path || '—';
      el.textContent = display;
      document.title = display ? 'RADIO · ' + display : 'RADIO · EJFOX';
    } catch (e) { /* keep last value */ }
  }
  tick();
  setInterval(tick, 5000);
</script>
</body>
</html>`;

app.get("/", (c) => c.html(HTML));

export default app;
