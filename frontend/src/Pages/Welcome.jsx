import React from 'react'
import { useNavigate } from 'react-router-dom';

const Welcome = () => {
    const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-10 rounded-xl shadow-md text-center max-w-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Welcome to Our Platform
        </h1>

        <p className="text-gray-600 mb-6">
          Smart, fast and reliable system to manage everything seamlessly.
        </p>

        <button
          onClick={() => navigate("/signup")}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-medium hover:bg-blue-700 transition"
        >
          Get Started
        </button>
      </div>
    </div>
  )
}

export default Welcome