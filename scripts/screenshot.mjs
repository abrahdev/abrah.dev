import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { createServer } from "node:net";

import { chromium } from "playwright";

const HOST = "127.0.0.1";
const TIMEOUT_MS = 30000;

function freePort() {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.unref();
    server.on("error", reject);
    server.listen(0, HOST, () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
  });
}

async function waitForServer(url) {
  const started = Date.now();
  while (Date.now() - started < TIMEOUT_MS) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // El servidor aún no escucha.
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`astro preview no respondió en ${TIMEOUT_MS} ms`);
}

const port = await freePort();
const server = spawn(
  "pnpm",
  ["exec", "astro", "preview", "--host", HOST, "--port", String(port)],
  { detached: true, stdio: ["ignore", "pipe", "pipe"] },
);

server.stdout.on("data", (chunk) => process.stdout.write(chunk));
server.stderr.on("data", (chunk) => process.stderr.write(chunk));

let browser;

try {
  await waitForServer(`http://${HOST}:${port}/`);

  browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    colorScheme: "light",
  });
  const page = await context.newPage();

  await page.goto(`http://${HOST}:${port}/`, { waitUntil: "networkidle" });
  await page.waitForFunction(() => document.fonts.status === "loaded");
  await page.waitForTimeout(800);

  await mkdir("public", { recursive: true });
  await page.screenshot({ path: "public/preview.png", fullPage: false });
  console.log("public/preview.png generado");
} finally {
  await browser?.close();
  try {
    process.kill(-server.pid, "SIGTERM");
  } catch {
    server.kill("SIGTERM");
  }
}
