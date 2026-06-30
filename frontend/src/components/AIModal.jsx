// AIModal.jsx
export default function AIModal({ log, onClose }) {
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-lg w-full mx-4" onClick={e => e.stopPropagation()}>
                <p className="text-xs text-red-400 font-medium mb-1">{log.level} · {log.timestamp}</p>
                <p className="text-gray-200 mb-4">{log.message}</p>
                <hr className="border-gray-700 mb-4" />
                <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">AI Diagnosis</p>
                <p className="text-gray-300 text-sm leading-relaxed">{log.ai_analysis}</p>
                <button onClick={onClose} className="mt-5 text-xs text-gray-500 hover:text-gray-300">Close</button>
            </div>
        </div>
    )
}