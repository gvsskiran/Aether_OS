import React, { useState, useEffect } from "react";
import { Sparkles, BrainCircuit, History, Cpu, Terminal, Shield, BarChart3, Play, Mic, MicOff, RefreshCw } from "lucide-react";

export default function App() {
  const [concept, setConcept] = useState("");
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [activeNode, setActiveNode] = useState("Generative_Artifact");

  const nodeConfig = {
    Technical_Architecture: { label: "TECH ARCHITECTURE", icon: <Terminal size={14}/>, color: "#00f0ff", class: "top-left" },
    Marketing_Strategy: { label: "MARKETING STRATEGY", icon: <BarChart3 size={14}/>, color: "#ff007f", class: "top-right" },
    Financial_Model: { label: "FINANCIAL MODEL", icon: <Shield size={14}/>, color: "#ffaa00", class: "bottom-left" },
    Generative_Artifact: { label: "LIVE ARTIFACT", icon: <Play size={14}/>, color: "#00ff66", class: "bottom-right" }
  };

  useEffect(() => {
    const saved = localStorage.getItem("aether_matrix_history");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  // API కీస్ ని క్లీన్ చేసే స్మార్ట్ ఫంక్షన్
  const getCleanKey = (data, keyVariants) => {
    for (const v of keyVariants) {
      if (data[v]) return data[v];
    }
    // స్పేస్‌లు, అండర్‌స్కోర్స్ తీసేసి మ్యాచ్ చేయడానికి ప్రయత్నం
    const searchKey = keyVariants[0].toLowerCase().replace(/_/g, "");
    for (const k in data) {
      if (k.toLowerCase().replace(/_/g, "").replace(/\s/g, "") === searchKey) {
        return data[k];
      }
    }
    return null;
  };

  const handleIgnite = async (targetConcept = concept) => {
    if (!targetConcept.trim()) return;
    setLoading(true);
    setOutput(null);

    const API_URL = window.location.hostname === "localhost" ? "http://127.0.0.1:8000/generate" : "/api/generate";

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ concept: targetConcept }),
      });
      
      if (!response.ok) throw new Error("Matrix generation failed");
      const data = await response.json();
      
      // అన్ని రకాల JSON ఫార్మాట్‌లను పట్టుకోవడానికి అప్‌గ్రేడెడ్ లాజిక్
      const cleanData = {
        Technical_Architecture: getCleanKey(data, ["Technical_Architecture", "Technical Architecture", "technical_architecture"]) || "Architecture log sequence missing.",
        Marketing_Strategy: getCleanKey(data, ["Marketing_Strategy", "Marketing Strategy", "marketing_strategy"]) || "Marketing strategy matrix missing.",
        Financial_Model: getCleanKey(data, ["Financial_Model", "Financial Model", "financial_model"]) || "Financial model projections missing.",
        Generative_Artifact: getCleanKey(data, ["Generative_Artifact", "Generative Artifact", "generative_artifact", "html", "Artifact"]) || ""
      };

      // ఒకవేళ ఆర్టిఫాక్ట్ లోపల బ్యాక్‌టిక్స్ (```html) ఉంటే క్లీన్ చేస్తుంది
      if (cleanData.Generative_Artifact.includes("```")) {
        cleanData.Generative_Artifact = cleanData.Generative_Artifact
          .replace(/```html/gi, "")
          .replace(/```/g, "")
          .trim();
      }

      setOutput(cleanData);
      setActiveNode("Generative_Artifact");

      const newHistory = [{ concept: targetConcept, data: cleanData }, ...history.filter(h => h.concept !== targetConcept)].slice(0, 10);
      setHistory(newHistory);
      localStorage.setItem("aether_matrix_history", JSON.stringify(newHistory));
    } catch (error) {
      console.error(error);
      alert("Aether OS Link Failure. Backend integration mismatch.");
    } finally {
      setLoading(false);
    }
  };

  const toggleSpeech = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Speech Recognition not supported in this browser.");
    
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    
    if (isListening) {
      setIsListening(false);
      return;
    }

    setIsListening(true);
    recognition.onresult = (e) => {
      const speechResult = e.results[0][0].transcript;
      setConcept(speechResult);
      handleIgnite(speechResult);
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.start();
  };

  return (
    <div className="aether-dashboard">
      {/* SIDEBAR */}
      <div className="aether-sidebar">
        <div className="sidebar-brand">
          <History className="neon-green-text icon-spin" size={14}/>
          <span>CORE_LOG_MATRIX</span>
        </div>
        <div className="sidebar-scroll-list">
          {history.length === 0 ? <div className="empty-log">// NO RECENT LOGS</div> : 
            history.map((h, i) => (
              <div key={i} className="sidebar-log-item" onClick={() => { setConcept(h.concept); setOutput(h.data); }}>
                <span className="cyan-prefix">&gt;</span> {h.concept}
              </div>
            ))
          }
        </div>
        <div className="sidebar-status">
          <Cpu className="neon-blue-text" size={12}/> SYSTEM STATUS // PROD_ACTIVE
        </div>
      </div>

      {/* CORE CONTROL AREA */}
      <div className="aether-core-pane">
        <div className="header-meta">
          <div className="neural-badge">
            <BrainCircuit className="icon-pulse" size={12}/> NEURAL ARCHITECTURE CONNECTED
          </div>
          <h1>AETHER_OS <span className="neon-text-glow">SUPREME</span></h1>
          <p className="subtitle">// EXPERIMENTAL DEPLOYMENT MATRIX v2.5</p>
        </div>

        {/* INPUT COMPONENT */}
        <div className="hardware-input-dock">
          <div className="input-glow-wrapper">
            <input
              type="text"
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              placeholder="Inject core objective matrix (e.g. 'Advanced Cyberpunk Tetris Arcade')..."
              onKeyDown={(e) => e.key === "Enter" && handleIgnite()}
            />
            <button className={`hardware-mic-btn ${isListening ? "listening" : ""}`} onClick={toggleSpeech}>
              {isListening ? <MicOff size={16}/> : <Mic size={16}/>}
            </button>
          </div>
          <button className="hardware-ignite-btn" onClick={() => handleIgnite()} disabled={loading}>
            {loading ? <RefreshCw className="icon-spin" size={14}/> : <Sparkles size={14}/>}
            {loading ? "COMPILING MESH..." : "IGNITE FRAMEWORK"}
          </button>
        </div>

        {/* LOADING SHIMMER */}
        {loading && (
          <div className="matrix-shimmer">
            <div className="glitch-spinner"></div>
            <span>DECODING AGENT FRAMEWORKS & INTERACTIVE ARTIFACTS...</span>
          </div>
        )}

        {/* WORKSPACE */}
        {output && !loading && (
          <div className="matrix-workspace-grid">
            
            {/* SPATIAL NODES */}
            <div className="spatial-network-node-box">
              <svg className="svg-network-vectors">
                <line x1="50%" y1="50%" x2="20%" y2="20%" className={`laser-vector ${activeNode==='Technical_Architecture'?'active':''}`} style={{stroke: nodeConfig.Technical_Architecture.color}}/>
                <line x1="50%" y1="50%" x2="80%" y2="20%" className={`laser-vector ${activeNode==='Marketing_Strategy'?'active':''}`} style={{stroke: nodeConfig.Marketing_Strategy.color}}/>
                <line x1="50%" y1="50%" x2="20%" y2="80%" className={`laser-vector ${activeNode==='Financial_Model'?'active':''}`} style={{stroke: nodeConfig.Financial_Model.color}}/>
                <line x1="50%" y1="50%" x2="80%" y2="80%" className={`laser-vector ${activeNode==='Generative_Artifact'?'active':''}`} style={{stroke: nodeConfig.Generative_Artifact.color}}/>
              </svg>

              <div className="spatial-core-orb">
                CORE MATRIX:<br/><span>{concept.substring(0, 12).toUpperCase()}</span>
              </div>

              {Object.entries(nodeConfig).map(([key, cfg]) => (
                <div 
                  key={key} 
                  onClick={() => setActiveNode(key)}
                  className={`spatial-node-point ${cfg.class} ${activeNode === key ? 'active-glow' : ''}`}
                  style={{ '--node-color': cfg.color }}
                >
                  {cfg.icon} {cfg.label}
                </div>
              ))}
            </div>

            {/* TERMINAL MONITOR */}
            <div className="workspace-terminal-monitor">
              <div className="monitor-top-bar" style={{borderBottom: `1px solid ${nodeConfig[activeNode].color}`}}>
                <div className="monitor-title" style={{color: nodeConfig[activeNode].color}}>
                  {nodeConfig[activeNode].icon} SYSTEM_DISPLAY // {activeNode.toUpperCase()}
                </div>
              </div>
              <div className="monitor-screen-body">
                {activeNode === "Generative_Artifact" && output.Generative_Artifact ? (
                  <iframe title="Aether Stream" srcDoc={output.Generative_Artifact} className="embedded-artifact-frame" sandbox="allow-scripts"/>
                ) : (
                  <div className="terminal-text-flow">
                    <span style={{color: nodeConfig[activeNode].color}}>&gt;&gt; LOG DATA INITIALIZED:</span>
                    <pre style={{fontFamily: 'inherit', whiteSpace: 'pre-wrap', margin: '10px 0 0 0'}}>{output[activeNode]}</pre>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}