// Runs entirely off the main thread so the UI never freezes.
// This is Phase 1: proof-of-work style CPU hashing, used to measure and
// pay out "compute units". Phase 2 swaps this loop for real AI inference
// tasks (WebGPU/ONNX) pulled from a job queue.

let running = false;
let count = 0;

async function hashOnce() {
  const payload = "task-" + Date.now() + "-" + Math.random();
  const buf = new TextEncoder().encode(payload);
  await crypto.subtle.digest("SHA-256", buf);
}

async function loop() {
  while (running) {
    await hashOnce();
    count++;
    if (count % 20 === 0) {
      self.postMessage({ type: "progress", count });
    }
    // Yield every 40 hashes so the device stays responsive and doesn't overheat.
    if (count % 40 === 0) {
      await new Promise((r) => setTimeout(r, 8));
    }
  }
}

self.onmessage = (e) => {
  if (e.data.command === "start") {
    running = true;
    count = 0;
    loop();
  } else if (e.data.command === "stop") {
    running = false;
    self.postMessage({ type: "stopped", count });
  }
};
