
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardEtudiant from "./pages/Login";
import Register from "./pages/register";
import React from "react";



const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardEtudiant />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
//                 placeholder="code d'accès"