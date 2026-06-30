// LogTable.jsx
import { useState } from "react"
import AIModal from "./AIModal"

const LEVEL_COLORS = { ERROR: "text-red-400", CRITICAL: "text-purple-400", WARN: "text-yellow-400", INFO: "text-blue-400" }

export default function LogTable({ logs }) {
    const [selected, setSelected] = useState(null)

    return (
        <>
            <table className="w-full text-sm border-collapse mt-4">
                <thead>
                    <tr className="text-left text-gray-500 border-b border-gray-800">
                        <th className="py-2 pr-4">Timestamp</th>
                        <th className="py-2 pr-4">Level</th>
                        <th className="py-2">Message</th>
                    </tr>
                </thead>
                <tbody>
                    {logs.map((log, i) => (
                        <tr key={i} onClick={() => log.ai_analysis && setSelected(log)}
                            className={`border-b border-gray-800 hover:bg-gray-900 ${log.ai_analysis ? "cursor-pointer" : ""}`}>
                            <td className="py-2 pr-4 text-gray-500 whitespace-nowrap">{log.timestamp}</td>
                            <td className={`py-2 pr-4 font-medium ${LEVEL_COLORS[log.level] || "text-gray-400"}`}>{log.level}</td>
                            <td className="py-2 text-gray-300">{log.message}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {selected && <AIModal log={selected} onClose={() => setSelected(null)} />}
        </>
    )
}