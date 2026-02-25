import { useEffect, useState } from "react";
import api from "../api/api";
import Navbar from "../components/Navbar";
import { Copy, RefreshCw, User, Clock, Phone, AlertCircle, CheckCircle, Activity, XOctagon, PauseCircle, PlayCircle, FileText } from "lucide-react";
import PrescriptionModal from "../components/PrescriptionModal";

export default function Dashboard() {
    const [queue, setQueue] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [callingNext, setCallingNext] = useState(false);
    const [markingMissedId, setMarkingMissedId] = useState(null);
    const [notification, setNotification] = useState("");

    // Emergency hold state
    const [isDoctorOnHold, setIsDoctorOnHold] = useState(() => {
        return sessionStorage.getItem("isDoctorOnHold") === "true";
    });
    const [togglingHold, setTogglingHold] = useState(false);

    // Prescription Modal state
    const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);

    // Track the active patient separately in case the queue API doesn't return ONGOING tokens
    const [activePatient, setActivePatient] = useState(() => {
        const savedPatient = sessionStorage.getItem("activePatient");
        return savedPatient ? JSON.parse(savedPatient) : null;
    });

    

    const fetchQueue = async () => {
        setLoading(true);
        setError("");
        try {
            const response = await api.get("/api/doctor/queue");
            const data = response.data;
            setQueue(data);

            // If the queue API does return the ONGOING patient, sync it with activePatient state
            const ongoing = data.find(p => p.status === "ONGOING");
            if (ongoing) {
                setActivePatient(ongoing);
            }
        } catch (err) {
            console.error("Error fetching queue:", err);
            setError("Failed to load patient queue. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQueue();
        const interval = setInterval(fetchQueue, 30000);
        return () => clearInterval(interval);
    }, []);

    // Sync activePatient with session storage
    useEffect(() => {
        if (activePatient) {
            sessionStorage.setItem("activePatient", JSON.stringify(activePatient));
        } else {
            sessionStorage.removeItem("activePatient");
        }
    }, [activePatient]);

    // Sync isDoctorOnHold with session storage
    useEffect(() => {
        sessionStorage.setItem("isDoctorOnHold", isDoctorOnHold);
    }, [isDoctorOnHold]);

    const getStatusColor = (status) => {
        switch (status) {
            case "ISSUED":
                return "bg-blue-100 text-blue-800 border-blue-200";
            case "ONGOING":
                return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "COMPLETED":
                return "bg-green-100 text-green-800 border-green-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    const handleCallNext = async () => {
        if (isDoctorOnHold) return; // Prevent calling if on hold

        setCallingNext(true);
        setError("");
        setNotification("");
        try {
            const response = await api.post("/api/doctor/queue/next");
            const token = response.data;
            setNotification(`Successfully called Token #${token.tokenNumber || ''}`);
            setActivePatient(token);
            fetchQueue();
        } catch (err) {
            console.error("Error calling next patient:", err);
            const errorMsg = err.response?.data?.message || err.response?.data || "Failed to call the next patient. Queue might be empty or on hold.";
            setError(typeof errorMsg === 'string' ? errorMsg : "Failed to call the next patient.");
        } finally {
            setCallingNext(false);
        }
    };

    const handleMarkMissed = async (patient) => {
        const targetId = patient.id || patient.tokenId;
        setMarkingMissedId(targetId);
        setError("");
        setNotification("");
        try {
            await api.post(`/api/doctor/queue/missed/${targetId}`);
            setNotification("Patient marked MISSED successfully");

            // Clear current active patient if it matches
            if (activePatient && (activePatient.id === targetId || activePatient.tokenId === targetId)) {
                setActivePatient(null);
            }

            fetchQueue();
        } catch (err) {
            console.error("Error marking patient missed:", err);
            const errorMsg = err.response?.data?.message || err.response?.data || "Failed to mark patient as missed.";
            setError(typeof errorMsg === 'string' ? errorMsg : "Failed to mark patient as missed.");
        } finally {
            setMarkingMissedId(null);
        }
    };

    const handleToggleHold = async () => {
        setTogglingHold(true);
        setError("");
        setNotification("");
        try {
            if (isDoctorOnHold) {
                await api.put("/api/doctor/queue/release-hold");
                setIsDoctorOnHold(false);
                setNotification("Doctor is now Available. Queue resumed.");
            } else {
                await api.put("/api/doctor/queue/hold");
                setIsDoctorOnHold(true);
                setNotification("Doctor placed on Emergency Hold. Queue is paused.");
            }
        } catch (err) {
            console.error("Error toggling hold status:", err);
            const errorMsg = err.response?.data?.message || err.response?.data || "Failed to complete hold action.";
            setError(typeof errorMsg === 'string' ? errorMsg : "Failed to complete hold action.");
        } finally {
            setTogglingHold(false);
        }
    };

    // Determine the current displaying patient: prefer from props if returned by API, otherwise from local state
    const currentPatient = queue.find(p => p.status === "ONGOING") || activePatient;
    const currentPatientId = currentPatient ? (currentPatient.id || currentPatient.tokenId) : null;

    const handlePrescriptionSuccess = (msg) => {
        setNotification(msg);
        fetchQueue();
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Navbar />

            <div className="max-w-7xl mx-auto p-6">
                {isDoctorOnHold && (
                    <div className="bg-red-500 text-white px-6 py-3 rounded-t-2xl font-bold flex items-center justify-center gap-2 animate-pulse mb-0">
                        <AlertCircle size={20} />
                        EMERGENCY HOLD ACTIVE: QUEUE IS PAUSED
                    </div>
                )}

                <header className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 shadow-sm border border-gray-100 ${isDoctorOnHold ? 'rounded-b-2xl mb-8' : 'rounded-2xl mb-8'}`}>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Doctor Dashboard</h1>
                        <p className="text-gray-500 mt-1">Manage your patient queue efficiently</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
                        <button
                            onClick={handleToggleHold}
                            disabled={togglingHold}
                            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${isDoctorOnHold
                                ? "bg-green-100 text-green-700 hover:bg-green-200 border border-green-300 focus:ring-green-500"
                                : "bg-red-100 text-red-700 hover:bg-red-200 border border-red-300 focus:ring-red-500"
                                } ${togglingHold ? "opacity-75 cursor-not-allowed" : ""}`}
                        >
                            {togglingHold ? (
                                <RefreshCw size={18} className="animate-spin" />
                            ) : isDoctorOnHold ? (
                                <PlayCircle size={18} />
                            ) : (
                                <PauseCircle size={18} />
                            )}
                            {isDoctorOnHold ? "Resume Queue" : "Emergency Hold"}
                        </button>

                        <button
                            onClick={handleCallNext}
                            disabled={callingNext || isDoctorOnHold}
                            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${callingNext || isDoctorOnHold
                                ? "bg-emerald-400 text-white cursor-not-allowed opacity-60"
                                : "bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-md focus:ring-emerald-500"
                                }`}
                        >
                            <Phone size={18} className={callingNext && !isDoctorOnHold ? "animate-pulse" : ""} />
                            {callingNext ? "Calling..." : "Call Next Patient"}
                        </button>

                        <button
                            onClick={fetchQueue}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                            Refresh Queue
                        </button>
                    </div>
                </header>

                {notification && (
                    <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 text-emerald-800 px-6 py-4 rounded-xl mb-6 shadow-sm">
                        <div className="flex items-center gap-3">
                            <CheckCircle size={20} className="text-emerald-600" />
                            <p className="font-medium">{notification}</p>
                        </div>
                        <button onClick={() => setNotification("")} className="text-emerald-500 hover:text-emerald-700 focus:outline-none">
                            ✕
                        </button>
                    </div>
                )}

                {error && (
                    <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6 shadow-sm">
                        <AlertCircle size={20} />
                        <p className="font-medium">{error}</p>
                    </div>
                )}

                {/* Active Consultation Card */}
                {currentPatient && (
                    <div className="bg-white rounded-2xl shadow-sm border-2 border-emerald-200 overflow-hidden mb-8 transform transition-all duration-300">
                        <div className="bg-emerald-50 px-6 py-4 border-b border-emerald-100 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-emerald-800 flex items-center gap-2">
                                <Activity size={20} className="animate-pulse" />
                                Current Consultation
                            </h2>
                            <span className="px-3 py-1 bg-emerald-200 text-emerald-800 text-xs font-bold rounded-full uppercase tracking-wider">
                                Ongoing
                            </span>
                        </div>
                        <div className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-2xl border-4 border-emerald-50 shadow-sm">
                                    {currentPatient.tokenNumber}
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-medium mb-1 border-b pb-1">Token Number</p>
                                    <h3 className="text-3xl font-extrabold text-gray-800">Token #{currentPatient.tokenNumber}</h3>
                                    <div className="flex items-center gap-4 mt-2">
                                        <div className="flex items-center gap-1.5 text-sm text-gray-600 font-medium">
                                            <Phone size={14} className="text-gray-400" />
                                            {currentPatient.mobileNumber || 'N/A'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 w-full sm:w-auto">
                                <button
                                    onClick={() => setIsPrescriptionModalOpen(true)}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-200 shadow-sm border border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                                >
                                    <FileText size={18} />
                                    Write Prescription
                                </button>

                                <button
                                    onClick={() => handleMarkMissed(currentPatient)}
                                    disabled={markingMissedId === currentPatientId}
                                    className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-200 shadow-sm border focus:outline-none focus:ring-2 focus:ring-offset-2 ${markingMissedId === currentPatientId
                                        ? "bg-red-50 text-red-300 border-red-100 cursor-not-allowed"
                                        : "bg-red-50 text-red-600 border-red-200 hover:bg-red-600 hover:text-white hover:shadow-md focus:ring-red-500"
                                        }`}
                                >
                                    <XOctagon size={18} className={markingMissedId === currentPatientId ? "animate-spin" : ""} />
                                    {markingMissedId === currentPatientId ? "Marking..." : "Mark Missed"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {loading && queue.length === 0 ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        {queue.length === 0 ? (
                            <div className="text-center py-20 bg-gray-50">
                                <User size={48} className="mx-auto text-gray-300 mb-4" />
                                <h3 className="text-xl font-medium text-gray-600">No patients in the queue</h3>
                                <p className="text-gray-400 mt-2">The queue is currently empty.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50/50 border-b border-gray-100">
                                            <th className="px-8 py-5 text-sm font-semibold text-gray-500 uppercase tracking-wider">Token</th>
                                            <th className="px-8 py-5 text-sm font-semibold text-gray-500 uppercase tracking-wider">Position</th>
                                            <th className="px-8 py-5 text-sm font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                                            <th className="px-8 py-5 text-sm font-semibold text-gray-500 uppercase tracking-wider">Arrival Est.</th>
                                            <th className="px-8 py-5 text-sm font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-8 py-5 text-sm font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {queue.map((patient) => {
                                            const patientId = patient.id || patient.tokenId;
                                            return (
                                                <tr key={patientId} className={`hover:bg-gray-50/50 transition-colors duration-150 ${patient.status === 'ONGOING' ? 'bg-emerald-50/30' : ''}`}>
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border ${patient.status === 'ONGOING' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
                                                                {patient.tokenNumber}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-2">
                                                            <span className={`inline-flex items-center justify-center h-6 w-6 rounded-full text-xs font-semibold
                                    ${patient.position === 1 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'}`}>
                                                                {patient.position}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-2 text-gray-700">
                                                            <Phone size={16} className="text-gray-400" />
                                                            <span className="font-medium">{patient.mobileNumber}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-2 text-gray-600">
                                                            <Clock size={16} className="text-gray-400" />
                                                            {patient.estimatedArrivalMinutes} mins
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <span className={`px-4 py-1.5 rounded-full text-xs font-semibold border ${getStatusColor(patient.status)}`}>
                                                            {patient.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-6 text-right">
                                                        {patient.status === 'ONGOING' ? (
                                                            <button
                                                                onClick={() => handleMarkMissed(patient)}
                                                                disabled={markingMissedId === patientId}
                                                                className={`text-sm font-medium transition-colors ${markingMissedId === patientId
                                                                    ? "text-red-300 cursor-not-allowed"
                                                                    : "text-red-600 hover:text-red-800 hover:underline"
                                                                    }`}
                                                            >
                                                                {markingMissedId === patientId ? "Marking..." : "Mark Missed"}
                                                            </button>
                                                        ) : (
                                                            <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium hover:underline">
                                                                View Details
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* Modals */}
                <PrescriptionModal
                    isOpen={isPrescriptionModalOpen}
                    onClose={() => setIsPrescriptionModalOpen(false)}
                    patient={currentPatient}
                    onSuccess={handlePrescriptionSuccess}
                />
            </div>
        </div>
    );
}
