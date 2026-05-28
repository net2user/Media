const puppeteer = require("puppeteer");
const { execSync } = require("child_process");

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: { width: 1920, height: 1080 }
  });

  const page = await browser.newPage();
  await page.goto("file://" + __dirname + "/index.html", {
    waitUntil: "networkidle0"
  });

  console.log("Rendering 10‑second animation…");

  const frames = 300; // 30fps × 10 seconds
  const delay = 1000 / 30;

  for (let i = 0; i < frames; i++) {
    await page.screenshot({ path: `frames/frame_${String(i).padStart(4, "0")}.png` });
    await new Promise(r => setTimeout(r, delay));
  }

  await browser.close();

  console.log("Generating MP4…");
  execSync(
    `ffmpeg -y -framerate 30 -i frames/frame_%04d.png -c:v libx264 -pix_fmt yuv420p output.mp4`
  );

  console.log("Generating GIF…");
  execSync(
    `ffmpeg -y -i output.mp4 -vf "fps=15,scale=1080:-1:flags=lanczos" output.gif`
  );

  console.log("Done! Files created: output.mp4 and output.gif");
})();
