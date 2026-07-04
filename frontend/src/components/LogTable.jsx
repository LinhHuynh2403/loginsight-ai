// LogTable.jsx
import { useState, useEffect, useRef } from "react"
import LogInspector from "./LogInspector"

const LEVEL_COLORS = { ERROR: "text-red-400", CRITICAL: "text-purple-400", WARN: "text-yellow-400", INFO: "text-blue-400" }

export default function LogTable({ logs, highlightMinute, onClearHighlight }) {
    const [selected, setSelected] = useState(null)
    const [activeFilter, setActiveFilter] = useState("ALL")
    const [searchQuery, setSearchQuery] = useState("")
    const tableRef = useRef(null)

    const filteredLogs = logs.filter(log => {
        if (highlightMinute && log.timestamp.slice(0, 16) !== highlightMinute) return false;

        const matchesLevel = activeFilter === "ALL" ? true
            : activeFilter === "ANOMALIES" ? ["ERROR", "CRITICAL", "WARN"].includes(log.level)
            : log.level === activeFilter;
        if (!matchesLevel) return false;

        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        return log.message.toLowerCase().includes(query)
            || log.level.toLowerCase().includes(query)
            || log.timestamp.toLowerCase().includes(query);
    });

    useEffect(() => {
        if (highlightMinute && tableRef.current) {
            tableRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
        }
    }, [highlightMinute])

    return (
        <div ref={tableRef} className="w-full mt-6 bg-gray-900/40 border border-gray-800 rounded-lg overflow-hidden">
            {/* Filter Navigation Bar */}
            <div className="flex flex-wrap items-center gap-2 border-b border-gray-800 bg-gray-900/60 p-3 px-4">
                {["ALL", "ANOMALIES", "ERROR", "WARN", "INFO"].map((filter) => (
                    <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`px-3 py-1 text-xs font-mono rounded transition-all ${
                            activeFilter === filter
                                ? "bg-gray-800 text-white border border-gray-700"
                                : "text-gray-500 hover:text-gray-300"
                        }`}
                    >
                        {filter}
                    </button>
                ))}

                {highlightMinute && (
                    <button
                        onClick={onClearHighlight}
                        className="px-3 py-1 text-xs font-mono rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 hover:bg-purple-500/20 transition-all"
                    >
                        ⏱ {highlightMinute.slice(11)} ✕
                    </button>
                )}

                <div className="relative ml-auto flex-1 min-w-[180px] max-w-xs">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search logs (e.g. timeout, psycopg2)..."
                        className="w-full bg-gray-950/60 border border-gray-800 rounded px-3 py-1.5 pl-7 text-xs font-mono text-gray-200 placeholder-gray-600 focus:outline-none focus:border-purple-500/40"
                    />
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-600 text-xs">⌕</span>
                </div>
            </div>

            {/* High Density Table */}
            <div className="overflow-x-auto max-h-[500px]">
                <table className="w-full text-xs font-mono text-left border-collapse">
                    <thead className="bg-gray-900/20 sticky top-0 backdrop-blur-sm border-b border-gray-800">
                        <tr className="text-gray-500">
                            <th className="p-3 pl-4 w-44">TIMESTAMP</th>
                            <th className="p-3 w-24">LEVEL</th>
                            <th className="p-3">LOG MESSAGE</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-900">
                        {filteredLogs.map((log, i) => (
                            <tr key={i} 
                                onClick={() => log.ai_analysis && setSelected(log)}
                                className={`hover:bg-gray-900/60 transition-colors ${log.ai_analysis ? "cursor-pointer group bg-purple-500/[0.01]" : "opacity-70"}`}
                            >
                                <td className="p-3 pl-4 text-gray-500 whitespace-nowrap">{log.timestamp}</td>
                                <td className={`p-3 font-semibold ${LEVEL_COLORS[log.level] || "text-gray-400"}`}>
                                    [{log.level}]
                                </td>
                                <td className="p-3 text-gray-300 truncate max-w-200 flex justify-between items-center">
                                    <span>{log.message}</span>
                                    {log.ai_analysis && (
                                        <span className="text-[10px] text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap ml-2">
                                            View SRE Diagnostic →
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <LogInspector log={selected} onClose={() => setSelected(null)} />
        </div>
    )
}