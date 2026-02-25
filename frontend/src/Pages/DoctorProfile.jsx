import { useEffect, useState } from "react";
import api from "../api/api"; // Make sure this path is correct for your project
import { User, Mail, Clock, Activity, AlertCircle, QrCode } from "lucide-react";
import QRCode from "react-qr-code";

export default function DoctorProfile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get("/api/doctor/queue/profile");
                setProfile(response.data);
            } catch (err) {
                console.error("Error fetching profile:", err);
                setError("Failed to load profile data.");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-gray-50 p-6">
                <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl shadow-sm flex items-center gap-3">
                    <AlertCircle size={24} />
                    <span className="font-medium">{error}</span>
                </div>
            </div>
        );
    }

    // This dynamically creates the correct URL based on where your app is hosted
    // Ensure '/book' matches exactly what is in your React Router App.jsx file for the BookToken component
    // This safely checks both camelCase and snake_case so it never fails!
    const actualQrKey = profile?.qrKey || profile?.qr_key;
    
    // Ensure '/book' matches exactly what is in your React Router App.jsx file
    const bookingUrl = `${window.location.origin}/book-token?qrKey=${actualQrKey}`;
    // const bookingUrl = `${window.location.origin}/book-token?qrKey=${profile.qr_key}`;


    return (
        <div className="min-h-screen bg-gray-50 p-6 font-sans">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-indigo-600 h-32 relative">
                        <div className="absolute -bottom-16 left-8">
                            <div className="bg-white p-1 rounded-full shadow-lg">
                                <div className="w-32 h-32 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-500">
                                    <User size={64} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-20 px-8 pb-8">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">{profile.username}</h1>
                                <div className="flex items-center gap-2 text-gray-500 mt-1">
                                    <Mail size={16} />
                                    <span>{profile.email}</span>
                                </div>
                            </div>
                            <span className={`px-4 py-1.5 rounded-full text-sm font-semibold border 
                                ${profile.status === 'AVAILABLE' ? 'bg-green-100 text-green-800 border-green-200' :
                                    profile.status === 'BUSY' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                        'bg-gray-100 text-gray-800 border-gray-200'}`}>
                                {profile.status}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                            {/* Performance Metrics */}
                            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <Activity size={20} className="text-indigo-600" />
                                    Performance Metrics
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Patients Checked</span>
                                        <span className="font-semibold text-gray-900">{profile.checkedPatients}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Avg. Consultation Time</span>
                                        <span className="font-semibold text-gray-900">{profile.consultationAvgTime} mins</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Current Queue</span>
                                        <span className="font-semibold text-gray-900">{profile.patientInQueue}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Working Hours */}
                            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <Clock size={20} className="text-indigo-600" />
                                    Working Hours
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Start Time</span>
                                        <span className="font-semibold text-gray-900">{profile.workingStartTime}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">End Time</span>
                                        <span className="font-semibold text-gray-900">{profile.workingEndTime}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Member Since</span>
                                        <span className="font-semibold text-gray-900">
                                            {new Date(profile.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* QR Code Section */}
                            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm md:col-span-2 flex flex-col items-center text-center">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                                    <QrCode size={20} className="text-indigo-600" />
                                    Patient Registration QR Code
                                </h3>
                                <p className="text-gray-500 text-sm mb-6 max-w-md">
                                    Ask patients to scan this QR code to book a token.
                                </p>

                                {/* Use actualQrKey here to check if it exists */}
                                {actualQrKey ? (
                                    <div className="flex flex-col items-center">
                                        <div className="bg-white p-4 rounded-xl border-2 border-dashed border-gray-300 mb-4">
                                            <QRCode
                                                value={bookingUrl}
                                                size={200}
                                                level="H"
                                            />
                                        </div>
                                        <a 
                                            href={bookingUrl} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="text-indigo-500 hover:text-indigo-700 text-sm font-medium hover:underline"
                                        >
                                            Test Booking Link
                                        </a>
                                        <p className="mt-2 text-xs text-gray-400 font-mono">
                                            Key: {actualQrKey}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="bg-yellow-50 text-yellow-700 px-4 py-3 rounded-lg text-sm border border-yellow-200">
                                        QR Key not found in profile data.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}