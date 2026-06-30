export default function LogUpload({ setLogs, setLoading }) {
    async function handleFile(e) {
        const file = e.target.files[0]
        if (!file) return
        const form = new FormData()
        form.append("file", file)
        setLoading(true)
        setLogs([])

        try {
            const res = await fetch("http://localhost:8000/api/logs/upload", { method: "POST", body: form })
            const data = await res.json()
            setLogs(data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <input type="file" accept=".log,.txt" onChange={handleFile}
            className="block border border-gray-700 rounded px-3 py-2 text-sm" />
    )
}