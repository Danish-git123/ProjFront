import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

export default function ProfileCompletion() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        workingStartTime: "",
        workingEndTime: "",
        consultationAvgTime: "",
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        // Basic validation
        if (!form.workingStartTime || !form.workingEndTime || !form.consultationAvgTime) {
            setError("Please fill in all fields");
            return;
        }

        try {
            const payload = {
                workingStartTime: form.workingStartTime, // "HH:mm"
                workingEndTime: form.workingEndTime,     // "HH:mm"
                consultationAvgTime: parseInt(form.consultationAvgTime, 10),
            };

            await api.post("/api/profile-completion", payload);

            setSuccess("Profile completed successfully!");
            // Optional: Navigate to dashboard after a delay or immediately
            // setTimeout(() => navigate("/dashboard"), 2000); 
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Failed to complete profile");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold text-center mb-6">Complete Profile</h2>

                {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
                {success && <p className="text-green-600 text-sm mb-4">{success}</p>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Working Start Time
                        </label>
                        <input
                            type="time"
                            name="workingStartTime"
                            value={form.workingStartTime}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Working End Time
                        </label>
                        <input
                            type="time"
                            name="workingEndTime"
                            value={form.workingEndTime}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Consultation Average Time (minutes)
                        </label>
                        <input
                            type="number"
                            name="consultationAvgTime"
                            placeholder="e.g. 15"
                            value={form.consultationAvgTime}
                            onChange={handleChange}
                            required
                            min="1"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-200"
                    >
                        Save Profile
                    </button>
                </form>
            </div>
        </div>
    );
}
