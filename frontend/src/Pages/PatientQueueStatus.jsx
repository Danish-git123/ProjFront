import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";
import { RefreshCcw, Activity, Clock, Hash, AlertCircle, ArrowLeft } from "lucide-react";

export default function PatientQueueStatus() {
    const { qrKey } = useParams();
    const navigate = useNavigate();
    const [queue, setQueue] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [refreshing, setRefreshing] = useState(false);

    const fetchQueueStatus = async () => {
        try {
            setRefreshing(true);
            const response = await api.get(`/api/queue/status/${qrKey}`);
            setQueue(response.data);
            setError("");
        } catch (err) {
            console.error("Error fetching queue status:", err);
            setError("Failed to load queue status. Please try again later.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (qrKey) {
            fetchQueueStatus();
            // Automatically refresh every 30 seconds
            const interval = setInterval(fetchQueueStatus, 30000);
            return () => clearInterval(interval);
        } else {
            setError("Invalid QR Key");
            setLoading(false);
        }
    }, [qrKey]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 font-sans">
            <div className="max-w-md mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 bg-white rounded-full shadow-sm text-gray-600 hover:text-indigo-600 transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-xl font-bold text-gray-800 tracking-tight">Live Queue Status</h1>
                    <button
                        onClick={fetchQueueStatus}
                        className={`p-2 bg-white rounded-full shadow-sm text-indigo-600 transition-all ${refreshing ? 'animate-spin' : 'hover:bg-indigo-50'}`}
                        disabled={refreshing}
                    >
                        <RefreshCcw size={20} />
                    </button>
                </div>

                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-4 rounded-2xl flex items-start gap-3 text-sm shadow-sm">
                        <AlertCircle size={20} className="mt-0.5 shrink-0 text-red-500" />
                        <p className="font-medium">{error}</p>
                    </div>
                )}

                {!error && queue.length === 0 && (
                    <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-gray-100 mt-8">
                        <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Activity size={28} className="text-gray-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">No Patients in Queue</h3>
                        <p className="text-gray-500 text-sm">The queue is currently empty.</p>
                    </div>
                )}

                {!error && queue.length > 0 && (
                    <div className="space-y-4">
                        <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-lg shadow-indigo-200 mb-6 relative overflow-hidden">
                            {/* Emergency Hold Banner Overlay */}
                            {queue.some(p => p.status === 'PAUSED' || p.queuePaused || p.isQueuePaused) && (
                                <div className="absolute inset-0 bg-red-600/95 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-center p-4">
                                    <AlertCircle size={32} className="mb-2 text-red-100 animate-pulse" />
                                    <h3 className="text-xl font-bold text-white mb-1">Queue Paused</h3>
                                    <p className="text-sm text-red-100 font-medium">Doctor is on an emergency hold. Please wait.</p>
                                </div>
                            )}

                            <div className="flex items-center gap-2 mb-2 text-indigo-100 relative z-0">
                                <Activity size={18} />
                                <span className="font-medium text-sm">Now Serving</span>
                            </div>
                            <div className="text-4xl font-black relative z-0">
                                {queue[0]?.tokenNumber}
                            </div>
                            <div className="mt-4 pt-4 border-t border-indigo-500/30 flex justify-between items-center text-sm relative z-0">
                                <span>Total Patients: {queue.length}</span>
                                <span className="bg-white/20 px-3 py-1 rounded-full">{queue[0]?.status}</span>
                            </div>
                        </div>

                        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider ml-2 mb-2">Upcoming Patients</h2>

                        {queue.slice(1).map((patient, index) => (
                            <div key={index} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between transition-all hover:shadow-md">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center font-bold text-gray-800 text-lg border border-gray-100">
                                        {patient.tokenNumber}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-gray-800 flex items-center gap-2">
                                            Place in queue: {patient.position}
                                        </div>
                                        <div className="text-xs text-gray-500 capitalize flex items-center gap-1 mt-1">
                                            <span className={`w-2 h-2 rounded-full ${patient.status === 'WAITING' ? 'bg-amber-400' : 'bg-blue-400'}`}></span>
                                            {patient.status.toLowerCase()}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-bold text-indigo-600 flex items-center justify-end gap-1">
                                        <Clock size={14} />
                                        {patient.estimatedArrivalMinutes}m
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1">Est. Wait</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
