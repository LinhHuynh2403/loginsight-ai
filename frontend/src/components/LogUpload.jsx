// LogUpload.jsx
import { useState } from "react"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"

// Mock data directly matching your test_server.log profile
const SAMPLE_LOG_DATA = `2026-06-29 10:00:00 [INFO] Connection to gateway established successfully.
2026-06-29 10:01:15 [ERROR] OperationalError: (psycopg2.OperationalError) FATAL: password authentication failed for user "admin"
2026-06-29 10:02:30 [INFO] Refreshing connection pool tokens.
2026-06-29 10:05:12 [WARN] High memory usage detected on node-2.`

export default function LogUpload({ setLogs, setLoading }) {
    const [error, setError] = useState(null)

    async function processLogPayload(fileOrString, isRawString = false) {
        setLoading(true)
        setLogs([])
        setError(null)

        try {
            let res;
            if (isRawString) {
                // Convert string to a Blob to safely mimic an UploadFile object for FastAPI
                const blob = new Blob([fileOrString], { type: 'text/plain' })
                const form = new FormData()
                form.append("file", blob, "sample_server.log")
                res = await fetch(`${API_URL}/api/logs/upload`, { method: "POST", body: form })
            } else {
                const form = new FormData()
                form.append("file", fileOrString)
                res = await fetch(`${API_URL}/api/logs/upload`, { method: "POST", body: form })
            }

            if (!res.ok) {
                const detail = await res.json().catch(() => ({}))
                throw new Error(detail.detail || `Upload failed (${res.status})`)
            }
            const data = await res.json()
            setLogs(data)
        } catch (err) {
            console.error(err)
            setError(err.message || "Something went wrong processing the log telemetry.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="relative">
                <input 
                    type="file" 
                    id="file-upload"
                    accept=".log,.txt" 
                    onChange={(e) => e.target.files[0] && processLogPayload(e.target.files[0], false)}
                    className="hidden" 
                />
                <label 
                    htmlFor="file-upload" 
                    className="cursor-pointer bg-gray-900 border border-gray-800 hover:border-gray-700 hover:bg-gray-800 text-gray-300 font-mono text-xs px-4 py-2 rounded transition-all block"
                >
                    📁 Upload Log File
                </label>
            </div>

            <button 
                onClick={() => processLogPayload(SAMPLE_LOG_DATA, true)}
                className="bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 hover:border-purple-500/30 font-mono text-xs px-4 py-2 rounded transition-all"
            >
                ⚡ Load Sample Telemetry
            </button>

            {error && <p className="text-xs text-red-400 font-mono">{error}</p>}
        </div>
    )
}