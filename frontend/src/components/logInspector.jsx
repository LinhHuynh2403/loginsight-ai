// LogInspector.jsx
import { useState } from "react"
import { Clipboard, Check } from "lucide-react"

export default function LogInspector({ log, onClose }) {
    const [copied, setCopied] = useState(false)

    if (!log) return null;

    async function handleCopy() {
        await navigator.clipboard.writeText(log.ai_analysis)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
    }

    const LEVEL_BG = {
        ERROR: "bg-red-500/10 text-red-400 border-red-500/20", 
        CRITICAL: "bg-purple-500/10 text-purple-400 border-purple-500/20", 
        WARN: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" 
    };

    return (
        <div className="fixed inset-y-0 right-0 w-[450px] bg-gray-900 border-l border-gray-800 shadow-2xl p-6 z-50 flex flex-col justify-between animate-slide-in">
            <div>
                <div className="flex justify-between items-center mb-6">
                    <span className={`px-2.5 py-0.5 rounded text-xs font-mono border ${LEVEL_BG[log.level] || "bg-gray-800 text-gray-400"}`}>
                        {log.level}
                    </span>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-300 font-mono text-sm">
                        ✕ ESC
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <span className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold block mb-1">Timestamp</span>
                        <p className="text-sm font-mono text-gray-400">{log.timestamp}</p>
                    </div>

                    <div>
                        <span className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold block mb-1">Raw Log Payload</span>
                        <div className="p-3 bg-black/40 rounded border border-gray-800/80 font-mono text-xs text-gray-300 break-all leading-relaxed">
                            {log.message}
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-800/80">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
                                <span className="text-[10px] uppercase tracking-wider text-purple-400 font-bold">Autonomous SRE Diagnostics</span>
                            </div>
                            {log.ai_analysis && (
                                <button
                                    onClick={handleCopy}
                                    title="Copy fix to clipboard"
                                    className="flex items-center gap-1 text-[10px] font-mono text-gray-500 hover:text-purple-300 transition-colors px-1.5 py-0.5 rounded hover:bg-purple-500/10"
                                >
                                    {copied ? (
                                        <><Check size={11} /> Copied!</>
                                    ) : (
                                        <><Clipboard size={11} /> Copy</>
                                    )}
                                </button>
                            )}
                        </div>
                        <p className="text-sm text-gray-300 leading-relaxed bg-purple-505/5 p-3.5 rounded border border-purple-500/10">
                            {log.ai_analysis || "No anomalies flagged for this entry."}
                        </p>
                    </div>
                </div>
            </div>

            <button onClick={onClose} className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 font-mono text-xs rounded transition-colors">
                Dismiss Inspector
            </button>
        </div>
    )
}