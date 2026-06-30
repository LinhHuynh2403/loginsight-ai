import { LineChart, Line, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from "recharts"

const COLORS = { ERROR: "#ef4444", WARN: "#f59e0b", INFO: "#3b82f6", CRITICAL: "#a855f7" }

export default function ChartsPanel({ logs }) {
    // Errors per minute for line chart
    const byMinute = logs.reduce((acc, l) => {
        const min = l.timestamp.slice(0, 16)   // "2026-06-29 22:05"
        if (!acc[min]) acc[min] = { time: min.slice(11), errors: 0 }
        if (l.level === "ERROR" || l.level === "CRITICAL") acc[min].errors++
        return acc
    }, {})
    const lineData = Object.values(byMinute)

    // Level distribution for pie chart
    const levelCounts = logs.reduce((acc, l) => {
        acc[l.level] = (acc[l.level] || 0) + 1
        return acc
    }, {})
    const pieData = Object.entries(levelCounts).map(([name, value]) => ({ name, value }))

    return (
        <div className="flex gap-8 my-8 flex-wrap">
            <div>
                <p className="text-sm text-gray-400 mb-2">Error rate over time</p>
                <LineChart width={420} height={220} data={lineData}>
                    <XAxis dataKey="time" stroke="#6b7280" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="errors" stroke="#ef4444" dot={false} />
                </LineChart>
            </div>
            <div>
                <p className="text-sm text-gray-400 mb-2">Log level distribution</p>
                <PieChart width={260} height={220}>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                        {pieData.map((entry) => (
                            <Cell key={entry.name} fill={COLORS[entry.name] || "#6b7280"} />
                        ))}
                    </Pie>
                    <Legend />
                </PieChart>
            </div>
        </div>
    )
}