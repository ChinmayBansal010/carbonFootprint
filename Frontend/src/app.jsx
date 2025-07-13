import React from "react";
import { BrowserRouter as Router, Routes, Route, BrowserRouter } from "react-router-dom";
import Home from "./home.jsx";
import Signup from "./signup.jsx";
import Login from "./login.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Dashboard from "./dashboard.jsx"; //
import ReactDOM from 'react-dom/client';
import EDProfile from "./EDProfile.jsx";
import DebugData from "./DebugData.jsx"; 


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        {/* Pass a key to force re-render when the path is dashboard. 
            However, the main fix will be in Dashboard's useEffect dependencies. */}
        <Route path="/dashboard" element={<Dashboard />} /> 
        <Route path="/edit-profile" element={<EDProfile />} />
        <Route path="/debug-data" element={<DebugData />} />
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        toastClassName="bg-white text-base font-semibold rounded-xl shadow-xl border-l-4 border-green-400 px-6 py-4"
        bodyClassName="text-gray-800 text-lg text-left"
        icon={false}
      />
    </BrowserRouter>
  );
}

export default App;