import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/api";
import { Phone, CheckCircle, Clock, Hash, AlertCircle, Users, Activity } from "lucide-react";

export default function BookToken() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // FIX: Changed from "qr_key" to "qrKey" to exactly match the DoctorProfile URL parameter
    const qrKey = searchParams.get("qrKey");

    const [mobileNumber, setMobileNumber] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [tokenDetails, setTokenDetails] = useState(null);

    useEffect(() => {
        if (!qrKey) {
            setError("Invalid QR Code: Missing QR Key in URL.");
        }
    }, [qrKey]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!mobileNumber || mobileNumber.length !== 10 || isNaN(mobileNumber)) {
            setError("Please enter a valid 10-digit mobile number.");
            return;
        }

        setLoading(true);

        try {
            // Append +91 for Twilio before sending to the backend!
            const formattedMobileNumber = `+91${mobileNumber}`;

            const response = await api.post("/api/queue/token", {
                qrKey: qrKey,
                mobileNumber: formattedMobileNumber
            });

            setTokenDetails(response.data);

        } catch (err) {
            console.error("Booking error:", err);
            const errorMessage = err.response?.data?.message
                || err.response?.data
                || "Failed to book token. Please try again.";

            setError(typeof errorMessage === 'string' ? errorMessage : "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    // If token is successfully generated, show the Ticket UI
    if (tokenDetails) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
                <div className="bg-white max-w-sm w-full rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="bg-emerald-500 p-8 text-center relative overflow-hidden">
                        <div className="mx-auto bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm relative z-10">
                            <CheckCircle size={32} className="text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-white relative z-10">Token Issued!</h2>
                        <p className="text-emerald-50 mt-2 font-medium relative z-10">Your place in queue is confirmed</p>

                        {/* Decorative background circles */}
                        <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                        <div className="absolute -left-8 -bottom-8 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                    </div>

                    <div className="p-8">
                        <div className="flex flex-col gap-6">
                            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                                <span className="text-gray-500 flex items-center gap-2 font-medium">
                                    <Hash size={18} className="text-emerald-500" />
                                    Token Number
                                </span>
                                <span className="text-4xl font-black text-gray-800">
                                    {tokenDetails.tokenNumber}
                                </span>
                            </div>

                            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                                <span className="text-gray-500 flex items-center gap-2 font-medium">
                                    <Clock size={18} className="text-indigo-500" />
                                    Est. Wait Time
                                </span>
                                <span className="text-xl font-bold text-gray-800">
                                    {tokenDetails.estimatedArrivalMinutes} mins
                                </span>
                            </div>

                            <div className="flex justify-between items-center pb-2">
                                <span className="text-gray-500 flex items-center gap-2 font-medium">
                                    <Users size={18} className="text-blue-500" />
                                    Current Position
                                </span>
                                <span className="text-xl font-bold text-gray-800">
                                    {tokenDetails.position}
                                </span>
                            </div>
                        </div>

                        <div className="mt-8 bg-blue-50 border border-blue-100 text-blue-800 p-4 rounded-xl text-center text-sm font-medium">
                            Please arrive 10 minutes before your estimated time. You will receive an SMS confirmation shortly.
                        </div>

                        <button
                            onClick={() => navigate(`/queue-status/${qrKey}`)}
                            className="mt-6 w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 focus:ring-4 focus:ring-indigo-100 transition-all flex justify-center items-center gap-2"
                        >
                            <Activity size={20} />
                            Check Live Queue Status
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Default Registration UI
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
            <div className="bg-white max-w-md w-full rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                <div className="bg-indigo-600 p-8 text-center">
                    <h1 className="text-3xl font-bold text-white tracking-tight">Join the Queue</h1>
                    <p className="text-indigo-100 mt-2">Enter your mobile number to get your consultation token</p>
                </div>

                <div className="p-8">
                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-start gap-3 text-sm shadow-sm">
                            <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-500" />
                            <p className="font-medium">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Mobile Number
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                                    <Phone size={18} />
                                </div>
                                <input
                                    type="tel"
                                    maxLength="10"
                                    value={mobileNumber}
                                    onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))} // Ensures only numbers are typed
                                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                    placeholder="Enter 10-digit number"
                                    disabled={!qrKey}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !qrKey}
                            className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 focus:ring-4 focus:ring-indigo-100 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                                    Processing...
                                </>
                            ) : "Get Token"}
                        </button>
                    </form>

                    {!qrKey && (
                        <div className="mt-6 text-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <p className="text-sm font-medium text-gray-600">
                                Scan the QR code at the clinic desk to activate this page.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}