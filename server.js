const express = require("express");
const path = require("path");

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// 5 December 2026, 14:00 Africa/Cairo (UTC+2 on that date).
const LAUNCH_AT = Date.UTC(2026, 11, 5, 12, 0, 0);
const ROOT = __dirname;

app.disable("x-powered-by");
app.set("trust proxy", 1);

app.get("/__launch-status", (_req, res) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.json({
    serverNow: Date.now(),
    launchAt: LAUNCH_AT,
    unlocked: Date.now() >= LAUNCH_AT
  });
});

function lockedPage() {
  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#101b36">
<title>كشكول | الموقع هيفتح قريبًا</title>
<style>
*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;padding:24px;background:radial-gradient(circle at 50% 0,#243b68,#101b36 58%);color:#fff;font-family:Tahoma,Arial,sans-serif;text-align:center}
main{width:min(100%,620px);padding:38px 24px;border:1px solid #ffffff24;border-radius:28px;background:#ffffff0b;box-shadow:0 24px 80px #0005}
img{width:82px;height:82px;object-fit:contain;margin-bottom:14px}small{color:#9db8ee;letter-spacing:2px;font-weight:bold}
h1{font-size:clamp(28px,6vw,44px);margin:18px 0 12px}p{color:#c4cde0;line-height:1.9}
.timer{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:28px 0}
.unit{padding:16px 5px;border-radius:16px;background:#ffffff12;border:1px solid #ffffff17}
.num{display:block;font-size:clamp(24px,6vw,38px);font-weight:bold;color:#fff;font-variant-numeric:tabular-nums}
.label{font-size:12px;color:#aebbd4}
.note{font-size:13px;color:#91a2c1}
@media(max-width:420px){.timer{gap:6px}.unit{padding:12px 2px}.label{font-size:10px}}
</style>
</head>
<body>
<main>
<img src="/assets/images/logo.svg" alt="Kshkooll" onerror="this.style.display='none'">
<small>EGYPTIAN BACCALAUREATE 2027</small>
<h1>الموقع هيفتح قريبًا</h1>
<p>كشكول بيجهزلك تجربة منظمة للدراسة والتعلم والتدريب في مكان واحد.</p>
<div class="timer" aria-live="polite">
<div class="unit"><span class="num" id="d">--</span><span class="label">يوم</span></div>
<div class="unit"><span class="num" id="h">--</span><span class="label">ساعة</span></div>
<div class="unit"><span class="num" id="m">--</span><span class="label">دقيقة</span></div>
<div class="unit"><span class="num" id="s">--</span><span class="label">ثانية</span></div>
</div>
<p class="note">موعد الإطلاق: 5 ديسمبر 2026 — الساعة 2:00 ظهرًا بتوقيت مصر</p>
</main>
<script>
(async function(){
 const ids=["d","h","m","s"];let launchAt=Date.UTC(2026,11,5,12,0,0),offset=0;
 try{const r=await fetch("/__launch-status",{cache:"no-store"});if(r.ok){const x=await r.json();offset=x.serverNow-Date.now();launchAt=x.launchAt;}}catch(e){}
 function tick(){
  const left=Math.max(0,launchAt-(Date.now()+offset));
  const values=[Math.floor(left/86400000),Math.floor(left/3600000)%24,Math.floor(left/60000)%60,Math.floor(left/1000)%60];
  ids.forEach((id,i)=>document.getElementById(id).textContent=String(values[i]).padStart(2,"0"));
  if(left<=0)location.reload();
 }
 tick();setInterval(tick,1000);
})();
</script>
</body>
</html>`;
}

app.use((req, res, next) => {
  if (req.path === "/__launch-status") return next();
  if (Date.now() < LAUNCH_AT) {
    res.status(200).set({
      "Cache-Control": "no-store, no-cache, must-revalidate, private",
      "X-Robots-Tag": "noindex, nofollow"
    }).type("html").send(lockedPage());
    return;
  }
  // Temporary destination while the repository is named Kshkooll20267.
  // Before launch, change this to /Kshkooll/ after restoring the repository name.
  res.set("Cache-Control", "no-store");
  res.redirect(302, "https://fareskhamesfa5.github.io/Kshkooll20267/");
});

// Never expose deployment metadata or server-side source files.
app.use((req, res, next) => {
  const blocked = new Set(["/server.js", "/package.json", "/package-lock.json", "/README.txt", "/README.md", "/railway.toml"]);
  if (blocked.has(req.path) || req.path.startsWith("/.git") || req.path.startsWith("/node_modules")) {
    return res.sendStatus(404);
  }
  next();
});

app.use(express.static(ROOT, {
  index: ["index.html"],
  dotfiles: "deny",
  fallthrough: true,
  etag: true,
  maxAge: "1h"
}));

app.use((_req, res) => res.status(404).send("Not Found"));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Kshkooll secure launch server listening on ${PORT}`);
});
