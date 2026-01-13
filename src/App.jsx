import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function App() {
  const [phase, setPhase] = useState("idle"); // idle | thinking | done
  const [logs, setLogs] = useState([]);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  /* ---------------- VOICE SETUP ---------------- */
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const rec = new SpeechRecognition();
    rec.lang = "en-US";
    rec.continuous = false;

    rec.onresult = (e) => {
      const text = e.results[0][0].transcript;
      inputRef.current.value = text;
      speak(`Command received. ${text}`);
    };

    recognitionRef.current = rec;
  }, []);

  const speak = (text) => {
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.95;
    u.pitch = 1.1;
    speechSynthesis.speak(u);
  };

  const startVoice = () => {
    recognitionRef.current?.start();
  };

  /* ---------------- THINKING SIM ---------------- */
  useEffect(() => {
    if (phase !== "thinking") return;

    const steps = [
      "Embedding input vector…",
      "Querying vector memory…",
      "Executing tools…",
      "Fetching telemetry…",
      "Synthesizing response…",
    ];

    setLogs([]);
    let i = 0;

    const id = setInterval(() => {
      setLogs((p) => [...p, steps[i]]);
      i++;
      if (i === steps.length) {
        clearInterval(id);
        speak("Task completed. Dashboard ready.");
        setTimeout(() => setPhase("done"), 900);
      }
    }, 700);

    return () => clearInterval(id);
  }, [phase]);

  return (
    <div className="app-root">
      {/* BACKGROUND */}
      <div className="neon-bg">
        <div className="star pink" />
        <div className="star cyan delay1" />
        <div className="star violet delay2" />
      </div>

      <AnimatePresence mode="wait">
        {/* IDLE */}
        {phase === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="idle-screen"
          >
            <h1 className="idle-title neon-text">AuraOS</h1>

            <div className="command-box">
              <input
                ref={inputRef}
                className="command-input neon-border"
                placeholder="Ask Aura to build something..."
              />
              <button className="neon-btn" onClick={startVoice}>
                🎙
              </button>
              <button
                className="neon-btn"
                onClick={() => {
                  speak("Processing request");
                  setPhase("thinking");
                }}
              >
                RUN
              </button>
            </div>
          </motion.div>
        )}

        {/* THINKING */}
        {phase === "thinking" && (
          <motion.div
            key="thinking"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="thinking-container"
          >
            <h2 className="neon-text">Aura Thinking…</h2>

            <div className="thinking-box neon-border">
              {logs.map((l, i) => (
                <div key={i} className={`thinking-line color-${i % 3}`}>
                  {l}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* DASHBOARD */}
        {phase === "done" && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="dashboard"
          >
            <h2 className="neon-text">AuraOS Control Center</h2>

            <div className="stats-grid">
              <Stat title="CPU Usage" value="21.8%" />
              <Stat title="Latency" value="24 ms" />
              <Stat title="Database" value="Connected" />
            </div>

            <div className="graphs">
              <Wave title="CPU Load" />
              <Wave title="Network Traffic" />
            </div>

            <button
              className="neon-btn"
              onClick={() => setPhase("idle")}
            >
              New Command
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------------- COMPONENTS ---------------- */

function Stat({ title, value }) {
  return (
    <div className="stat-card neon-border">
      <div>{title}</div>
      <div className="neon-text">{value}</div>
    </div>
  );
}

function Wave({ title }) {
  return (
    <div className="wave-card neon-border">
      <div>{title}</div>
      <svg viewBox="0 0 100 30">
        <path
          d="M0 15 Q10 5 20 15 T40 15 T60 15 T80 15 T100 15"
          fill="none"
          stroke="url(#g)"
          strokeWidth="2"
          className="wave-path"
        />
        <defs>
          <linearGradient id="g">
            <stop offset="0%" stopColor="#ff4fa3" />
            <stop offset="100%" stopColor="#36e0ff" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
