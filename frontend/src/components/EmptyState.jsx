// EmptyState.jsx
import { useState } from "react"
import { UploadCloud, Zap } from "lucide-react"
import { uploadLogFile } from "../lib/uploadLog"

export default function EmptyState({ setLogs, setLoading }) {
    const [dragActive, setDragActive] = useState(false)
    const [error, setError] = useState(null)

    async function handleDrop(e) {
        e.preventDefault()
        setDragActive(false)
        const file = e.dataTransfer.files?.[0]
        if (!file) return

        setLoading(true)
        setError(null)
        try {
            const data = await uploadLogFile(file)
            setLogs(data)
        } catch (err) {
            setError(err.message || "Something went wrong uploading the file.")
        } finally {
            setLoading(false)
        }
    }

    async function loadSample() {
        setLoading(true)
        setError(null)
        try {
            const res = await fetch("/sample-logs.json")
            if (!res.ok) throw new Error("Could not load sample data.")
            const data = await res.json()
            setLogs(data)
        } catch (err) {
            setError(err.message || "Could not load sample data.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div
            onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center border border-dashed rounded-xl py-24 text-center transition-colors ${
                dragActive ? "border-purple-500/50 bg-purple-500/5" : "border-gray-800"
            }`}
        >
            <div className="w-12 h-12 rounded-lg bg-gray-900/60 border border-gray-800 flex items-center justify-center mb-4">
                <UploadCloud size={22} className="text-gray-600" />
            </div>
            <p className="text-sm font-mono text-gray-300 mb-1">Drag &amp; drop a .log or .txt file to begin</p>
            <p className="text-xs text-gray-600 max-w-sm mb-5">
                No active log streams mounted into pipeline. Drop a file anywhere in this zone, or browse from the header above.
            </p>
            <button
                onClick={loadSample}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-mono rounded border border-purple-500/30 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 transition-colors"
            >
                <Zap size={12} /> Load Sample server.log
            </button>
            {error && <p className="mt-3 text-xs text-red-400 font-mono">{error}</p>}
        </div>
    )
}
