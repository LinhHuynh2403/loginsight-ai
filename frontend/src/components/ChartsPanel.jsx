import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend, ResponsiveContainer } from "recharts"

const COLORS = { ERROR: "#ef4444", WARN: "#f59e0b", INFO: "#3b82f6", CRITICAL: "#a855f7" }

export default function ChartsPanel({ logs, onMinuteSelect, selectedMinute }) {
    // Errors per minute for line chart
    const byMinute = logs.reduce((acc, l) => {
        const min = l.timestamp.slice(0, 16)   // "2026-06-29 22:05"
        if (!acc[min]) acc[min] = { time: min.slice(11), minuteKey: min, errors: 0 }
        if (l.level === "ERROR" || l.level === "CRITICAL") acc[min].errors++
        return acc
    }, {})
    const lineData = Object.values(byMinute)

    function handleChartClick(e) {
        if (e?.activeIndex == null || !onMinuteSelect) return
        const point = lineData[Number(e.activeIndex)]
        if (!point) return
        onMinuteSelect(point.minuteKey === selectedMinute ? null : point.minuteKey)
    }

    // Level distribution for pie chart
    const levelCounts = logs.reduce((acc, l) => {
        acc[l.level] = (acc[l.level] || 0) + 1
        return acc
    }, {})
    const pieData = Object.entries(levelCounts).map(([name, value]) => ({ name, value }))

    return (
        <div className="flex gap-8 my-6 flex-wrap items-start">
            <div className="flex-1 min-w-[380px]">
                <p className="text-sm text-gray-300 mb-3">Error rate over time <span className="text-gray-500 text-xs">(click a point to filter the table)</span></p>
                <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={lineData} onClick={handleChartClick} style={{ cursor: onMinuteSelect ? "pointer" : "default" }} margin={{ top: 8, right: 16, left: -12, bottom: 0 }}>
                        <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="time" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                        <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} allowDecimals={false} />
                        <Tooltip contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: 8, fontSize: 13 }} labelStyle={{ color: "#e5e7eb" }} />
                        <Line
                            type="monotone"
                            dataKey="errors"
                            stroke="#ef4444"
                            strokeWidth={2.5}
                            dot={(props) => {
                                const isActive = props.payload.minuteKey === selectedMinute
                                return (
                                    <circle
                                        key={props.payload.minuteKey}
                                        cx={props.cx}
                                        cy={props.cy}
                                        r={isActive ? 6 : 3}
                                        fill={isActive ? "#c084fc" : "#ef4444"}
                                        stroke={isActive ? "#c084fc" : "none"}
                                    />
                                )
                            }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
            <div className="min-w-[280px]">
                <p className="text-sm text-gray-300 mb-3">Log level distribution</p>
                <ResponsiveContainer width={280} height={260}>
                    <PieChart>
                        <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={{ fontSize: 12, fill: "#d1d5db" }}>
                            {pieData.map((entry) => (
                                <Cell key={entry.name} fill={COLORS[entry.name] || "#6b7280"} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: 8, fontSize: 13 }} />
                        <Legend wrapperStyle={{ fontSize: 13 }} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}