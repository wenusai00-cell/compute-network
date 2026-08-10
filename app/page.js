"use client";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const [running, setRunning] = useState(false);
  const [units, setUnits] = useState(0);
  const [earned, setEarned] = useState(0);
  const [rate, setRate] = useState(0);
  const [networkStats, setNetworkStats] = useState({
    devices: 0,
    units: 0,
    paid: 0,
  });

  const canvasRef = useRef(null);
  const workerRef = useRef(null);
  const historyRef = useRef(new Array(64).fill(0));
  const hashCountRef = useRef(0);
  const lastHashRef = useRef(0);
  const runningRef = useRef(false);
  const animRef = useRef(null);

  // Pull live-ish network totals on load
  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((data) => setNetworkStats(data))
      .catch(() => {});
  }, []);

  // Waveform animation loop — amplitude driven by real hash-rate delta
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    function resize() {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * devicePixelRatio;
      canvas.height = rect.height * devicePixelRatio;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(devicePixelRatio, devicePixelRatio);
    }
    resize();
    window.addEventListener("resize", resize);

    function draw() {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      ctx.clearRect(0, 0, w, h);

      const history = historyRef.current;
      history.shift();
      const delta = hashCountRef.current - lastHashRef.current;
      lastHashRef.current = hashCountRef.current;
      const target = runningRef.current
        ? Math.min(1, delta / 8 + Math.random() * 0.15)
        : 0;
      history.push(target);

      ctx.beginPath();
      const step = w / (history.length - 1);
      history.forEach((v, i) => {
        const x = i * step;
        const y = h / 2 - v * (h / 2 - 6) * Math.sin(i * 0.9 + Date.now() * 0.002);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = runningRef.current ? "#29D9FF" : "#232833";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.strokeStyle = "#1A1E28";
      ctx.lineWidth = 1;
      ctx.stroke();

      animRef.current = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  const start = () => {
    workerRef.current = new Worker("/worker.js");
    workerRef.current.onmessage = (e) => {
      if (e.data.type === "progress") {
        hashCountRef.current = e.data.count;
        setUnits(e.data.count);
        const newEarned = e.data.count * 0.00012;
        setEarned(newEarned);
        setRate(Math.round((e.data.count - lastHashRef.current) * 4));
      }
    };
    workerRef.current.postMessage({ command: "start" });
    runningRef.current = true;
    setRunning(true);
  };

  const stop = () => {
    if (workerRef.current) {
      workerRef.current.postMessage({ command: "stop" });
      workerRef.current.onmessage = async (e) => {
        if (e.data.type === "stopped") {
          const finalEarned = e.data.count * 0.00012;
          // Report the session to the backend
          fetch("/api/contribute", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ units: e.data.count, earned: finalEarned }),
          }).catch(() => {});
        }
        workerRef.current.terminate();
      };
    }
    runningRef.current = false;
    setRunning(false);
    setRate(0);
  };

  return (
    <>
      <nav>
        <div className="logo">
          <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
            <path
              d="M13 2L4 14h6l-1 8 9-12h-6l1-8z"
              stroke="#FFB627"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
          COMPUTE.NET
        </div>
        <div className="status-pill">
          <span className={`status-dot${running ? " live" : ""}`}></span>
          <span>{running ? "contributing" : "idle"}</span>
        </div>
      </nav>

      <div className="wrap">
        <section className="hero">
          <div className="eyebrow">Phase 1 · Live</div>
          <h1>
            Your device is
            <br />
            mostly <span className="accent">asleep.</span>
          </h1>
          <p className="sub">
            Share the cycles it isn&apos;t using. Get paid for compute you
            were never going to touch anyway.
          </p>

          <div className="scope">
            <div className="scope-top">
              <span className="scope-label">Signal</span>
              <span className="scope-rate">{rate} h/s</span>
            </div>
            <canvas id="wave" ref={canvasRef}></canvas>

            <div className="counter-row">
              <div className="counter-block">
                <div className="k">Units contributed</div>
                <div className="v units">{units.toLocaleString()}</div>
              </div>
              <div className="counter-block">
                <div className="k">Earned this session</div>
                <div className="v earn">₹{earned.toFixed(4)}</div>
              </div>
              <button
                id="toggle"
                className={running ? "active" : ""}
                onClick={running ? stop : start}
              >
                {running ? "Stop" : "Start contributing"}
              </button>
            </div>
          </div>
          <div className="hint">
            Runs a real background compute loop in your browser — nothing
            simulated.
          </div>
        </section>

        <div className="stats">
          <div className="stat">
            <div className="v">{networkStats.devices.toLocaleString()}</div>
            <div className="l">devices online now</div>
          </div>
          <div className="stat">
            <div className="v">{networkStats.units.toLocaleString()}</div>
            <div className="l">units shared today</div>
          </div>
          <div className="stat">
            <div className="v">₹{networkStats.paid.toLocaleString()}</div>
            <div className="l">paid out to date</div>
          </div>
        </div>

        <section>
          <div className="section-head">How it works</div>
          <h2 className="section-title">
            Three steps, no wallet lock-in, no app store required.
          </h2>
          <div className="loop">
            <div className="node">
              <div className="node-dot"></div>
              <h3>Contribute</h3>
              <p>
                Open the page on your phone or PC. Idle cycles get picked up
                automatically while you&apos;re not using the device hard.
              </p>
            </div>
            <div className="node">
              <div className="node-dot"></div>
              <h3>Verify</h3>
              <p>
                Work is checked against the task it was assigned, so payout
                is tied to real completed compute — not just uptime.
              </p>
            </div>
            <div className="node">
              <div className="node-dot"></div>
              <h3>Earn</h3>
              <p>
                Payout accrues per unit and settles to your account. Stop
                anytime — nothing runs without you starting it.
              </p>
            </div>
          </div>
        </section>
      </div>

      <footer>COMPUTE.NET — PHASE 1 PROTOTYPE</footer>
    </>
  );
}
