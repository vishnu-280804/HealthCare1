import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Home from "../components/Home.jsx";
import Signup from "../components/Signup.jsx";
import Login from "../components/Login.jsx";
import React from "react";
function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<Login />} />
        <Route path = "/doctos" element = {<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
