import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock, FaKey } from "react-icons/fa";
import axios from "axios";

export default function LoginPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    code_securite: ""
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/auth/login", formData);
      const { access_token, utilisateur, role, redirect_url } = response.data;

      // Stocker le token et l'utilisateur
      localStorage.setItem("token", access_token);
      localStorage.setItem("user", JSON.stringify(utilisateur));
      localStorage.setItem("role", role);

      alert("Connexion réussie !");
      navigate(redirect_url);
    } catch (error) {
      console.error("Erreur lors de la connexion :", error.response?.data);
      alert(
        error.response?.data?.message || "Une erreur est survenue pendant la connexion."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cyan-100 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white flex flex-col md:flex-row shadow-lg rounded-2xl overflow-hidden">
        {/* Partie gauche */}
        <div className="bg-blue-700 text-white p-8 md:w-1/2 flex flex-col justify-center relative">
          <div className="absolute top-0 left-0 w-0 h-0 border-b-[60px] border-l-[60px] border-b-white border-l-transparent" />
          <div className="z-10">
            <div className="flex items-center mb-8">
              <div className="w-10 h-10 bg-yellow-400 mr-2 rounded-sm flex items-center justify-center text-blue-700 font-bold text-lg">M</div>
              <div>
                <h1 className="text-2xl font-bold leading-none">ERP</h1>
                <p className="text-sm leading-none">IUT DOUALA</p>
              </div>
            </div>
            <h2 className="text-3xl font-bold mb-4">BON RETOUR PARMI NOUS !</h2>
            <p className="text-lg">Connectez-vous et prenez connaissance des dernières actualités</p>
          </div>
        </div>

        {/* Partie droite */}
        <div className="p-8 md:w-1/2 w-full bg-white">
          <h2 className="text-blue-700 text-2xl font-semibold mb-6 text-center">connexion</h2>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="flex items-center border-b border-blue-700 py-2">
              <FaEnvelope className="text-blue-700 mr-2" />
              <input
                type="email"
                name="email"
                placeholder="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full outline-none bg-transparent"
              />
            </div>

            <div className="flex items-center border-b border-blue-700 py-2">
              <FaLock className="text-blue-700 mr-2" />
              <input
                type="password"
                name="password"
                placeholder="mot de passe"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full outline-none bg-transparent"
              />
            </div>

            <div className="flex items-center border-b border-blue-700 py-2">
              <FaKey className="text-blue-700 mr-2" />
              <input
                type="text"
                name="code_securite"
                placeholder="code de sécurité"
                value={formData.code_securite}
                onChange={handleChange}
                required
                className="w-full outline-none bg-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-blue-700 text-white font-semibold w-full py-3 rounded-full hover:bg-blue-800 transition"
            >
              {loading ? "Connexion..." : "se connecter"}
            </button>

            <div className="flex justify-between text-sm text-blue-600 mt-4">
              <a href="#">mot de passe oublié</a>
              <a href="/register">s’inscrire</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


