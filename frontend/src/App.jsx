import { useState } from "react"
import LogUpload from "./components/LogUpload"
import ChartsPanel from "./components/ChartsPanel"
import LogTable from "./components/LogTable"

export default function App() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(false)

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <h1 className="text-2xl font-semibold mb-6">LogInsight AI</h1>
      <LogUpload setLogs={setLogs} setLoading={setLoading} />
      {loading && (
        <div className="mt-6 text-gray-400 text-sm animate-pulse">
          Parsing logs and running AI diagnostics — this may take a few seconds...
        </div>
      )}
      {logs.length > 0 && (
        <>
          <ChartsPanel logs={logs} />
          <LogTable logs={logs} />
        </>
      )}
    </div>
  )
}
