export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"

export async function uploadLogFile(file) {
    const form = new FormData()
    form.append("file", file)
    const res = await fetch(`${API_URL}/api/logs/upload`, { method: "POST", body: form })
    if (!res.ok) {
        const detail = await res.json().catch(() => ({}))
        throw new Error(detail.detail || `Upload failed (${res.status})`)
    }
    return res.json()
}