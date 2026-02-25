import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css'
import Welcome from './Pages/Welcome.jsx';
import Signup from './Pages/Signup.jsx';
import Signin from './Pages/Signin.jsx';
import ProfileCompletion from './Pages/ProfileCompletion.jsx';
import Dashboard from './Pages/Dashboard.jsx';
import DoctorProfile from './Pages/DoctorProfile.jsx';
import BookToken from './Pages/BookToken.jsx';
import PatientQueueStatus from './Pages/PatientQueueStatus.jsx';
function App() {


  return (

    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/profile-completion" element={<ProfileCompletion />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<DoctorProfile />} />
        <Route path="/book-token" element={<BookToken />} />
        <Route path="/queue-status/:qrKey" element={<PatientQueueStatus />} />
      </Routes>
    </BrowserRouter>

  )
}

export default App
