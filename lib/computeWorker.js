// This runs in a separate thread so it doesn't freeze the UI
let running = false;
let hashCount = 0;

async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  return hashBuffer;
}

async function computeLoop() {
  while (running) {
    await sha256("task-" + Date.now() + "-" + Math.random());
    hashCount++;
    if (hashCount % 100 === 0) {
      self.postMessage({ type: "progress", hashCount });
    }
    // Yield every 50 hashes so the device doesn't overheat
    if (hashCount % 50 === 0) {
      await new Promise((r) => setTimeout(r, 10));
    }
  }
}

self.onmessage = (e) => {
  if (e.data.command === "start") {
    running = true;
    hashCount = 0;
    computeLoop();
  } else if (e.data.command === "stop") {
    running = false;
    self.postMessage({ type: "stopped", hashCount });
  }
};