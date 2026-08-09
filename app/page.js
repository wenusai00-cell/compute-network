"use client";
import { useState, useRef, useEffect } from "react";

export default function Home() {
  const [contributing, setContributing] = useState(false);
  const [units, setUnits] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const workerRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem("totalEarned");
    if (saved) setTotalEarned(parseFloat(saved));
  }, []);

  const startContributing = () => {
    workerRef.current = new Worker(
      new URL("../lib/computeWorker.js", import.meta.url)
    );
    workerRef.current.onmessage = (e) => {
      if (e.data.type === "progress") {
        setUnits(e.data.hashCount);
      }
    };
    workerRef.current.postMessage({ command: "start" });
    setContributing(true);
  };

  const stopContributing = async () => {
    if (workerRef.current) {
      workerRef.current.postMessage({ command: "stop" });
      workerRef.current.onmessage = async (e) => {
        if (e.data.type === "stopped") {
          const earned = e.data.hashCount * 0.0001; // demo rate
          const newTotal = totalEarned + earned;
          setTotalEarned(newTotal);
          localStorage.setItem("totalEarned", newTotal.toString());

          // Report to backend
          await fetch("/api/contribute", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ units: e.data.hashCount, earned }),
          });
        }
        workerRef.current.terminate();
      };
    }
    setContributing(false);
  };

  return (
    <main style={{ padding: 40, fontFamily: "sans-serif", textAlign: "center" }}>
      <h1>⚡ Compute Network</h1>
      <p>Apna idle device power share karo, points kamao</p>

      <div style={{ margin: "30px 0", fontSize: 24 }}>
        {contributing ? `Compute units: ${units}` : "Idle"}
      </div>

      <div style={{ marginBottom: 30 }}>
        Total earned: ₹{totalEarned.toFixed(4)}
      </div>

      {!contributing ? (
        <button onClick={startContributing} style={btnStyle}>
          Start Contributing
        </button>
      ) : (
        <button onClick={stopContributing} style={{ ...btnStyle, background: "#c0392b" }}>
          Stop
        </button>
      )}
    </main>
  );
}

const btnStyle = {
  padding: "14px 28px",
  fontSize: 18,
  borderRadius: 8,
  border: "none",
  background: "#2ecc71",
  color: "white",
  cursor: "pointer",
};