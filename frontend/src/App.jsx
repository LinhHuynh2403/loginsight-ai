// App.jsx
import { useState, useEffect } from "react"
import LogUpload from "./components/LogUpload"
import ChartsPanel from "./components/ChartsPanel"
import LogTable from "./components/LogTable"
import EmptyState from "./components/EmptyState"

export default function App() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedMinute, setSelectedMinute] = useState(null)

  // Compute live KPIs metrics blocks
  const metrics = logs.reduce((acc, current) => {
    acc.total++
    if (["ERROR", "CRITICAL"].includes(current.level)) acc.anomalies++
    if (current.ai_analysis) acc.aiDiagnosed++
    return acc
  }, { total: 0, anomalies: 0, aiDiagnosed: 0 })

  const healthScore = metrics.total ? Math.max(0, 100 - Math.round((metrics.anomalies / metrics.total) * 100)) : 100;

  // A freshly loaded dataset shouldn't inherit a minute filter from the previous one.
  useEffect(() => { setSelectedMinute(null) }, [logs])

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-8 font-sans antialiased w-full max-w-7xl mx-auto">
      {/* Header Banner */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-900 pb-6 mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-white m-0 font-mono">LOGINSIGHT AI</h1>
            <span className="bg-purple-500/10 text-purple-300 text-xs px-2 py-0.5 rounded font-mono border border-purple-500/20">SRE Core v2.5</span>
          </div>
          <p className="text-sm text-gray-400 m-0">Autonomous production-grade metric parsing and diagnostic system architecture.</p>
        </div>
        <LogUpload setLogs={setLogs} setLoading={setLoading} />
      </header>

      {loading && (
        <div className="p-8 border border-gray-800 bg-gray-900/20 rounded-xl text-center text-gray-400 text-sm font-mono animate-pulse">
          ⚡ Ingesting telemetry data chunks and executing Gemini 2.5 Flash pipelines...
        </div>
      )}

      {logs.length > 0 && !loading && (
        <div className="space-y-6 animate-fade-in">
          {/* Real-time KPI Metric Cluster */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "TELEMETRY CHUNKS PASSED", value: metrics.total, color: "text-blue-400" },
              { label: "ANOMALOUS FAILURES", value: metrics.anomalies, color: metrics.anomalies > 0 ? "text-red-400" : "text-gray-400" },
              { label: "AI REMEDIATION TRIGGERS", value: metrics.aiDiagnosed, color: "text-purple-400" },
              { label: "SYSTEM OVERALL HEALTH", value: `${healthScore}%`, color: healthScore > 80 ? "text-green-400" : "text-yellow-400" }
            ].map((kpi, index) => (
              <div key={index} className="bg-gray-900/40 border border-gray-800 p-5 rounded-lg flex flex-col justify-center">
                <span className="text-xs font-mono tracking-wider text-gray-400 font-bold block mb-1.5">{kpi.label}</span>
                <span className={`text-3xl font-mono font-bold ${kpi.color}`}>{kpi.value}</span>
              </div>
            ))}
          </div>

          {/* Graphical Analytics Core Grid */}
          <div className="bg-gray-900/20 border border-gray-800 p-4 rounded-lg">
            <ChartsPanel logs={logs} onMinuteSelect={setSelectedMinute} selectedMinute={selectedMinute} />
          </div>

          {/* Interactive Inspection Feed */}
          <div>
            <h3 className="text-sm uppercase font-mono tracking-wider font-bold text-gray-300 mb-2">Structural Ingestion Stream</h3>
            <LogTable logs={logs} highlightMinute={selectedMinute} onClearHighlight={() => setSelectedMinute(null)} />
          </div>
        </div>
      )}

      {logs.length === 0 && !loading && (
        <EmptyState setLogs={setLogs} setLoading={setLoading} />
      )}
    </div>
  )
}