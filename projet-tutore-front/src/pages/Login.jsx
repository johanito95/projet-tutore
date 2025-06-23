import React from "react";
import { FaUser, FaEnvelope, FaLock, FaKey } from "react-icons/fa";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-cyan-100 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white flex flex-col md:flex-row shadow-lg rounded-2xl overflow-hidden">
        {/* Left Side */}
        <div className="bg-blue-700 text-white p-8 md:w-1/2 flex flex-col justify-center relative">
          <div className="absolute top-0 left-0 w-0 h-0 border-b-[60px] border-l-[60px] border-b-white border-l-transparent" />
          <div className="z-10">
            <div className="flex items-center mb-8">
              <div className="w-10 h-10 bg-yellow-400 mr-2 rounded-sm flex items-center justify-center text-blue-700 font-bold text-lg">
                M
              </div>
              <div>
                <h1 className="text-2xl font-bold leading-none">ERP</h1>
                <p className="text-sm leading-none">IUT DOUALA</p>
              </div>
            </div>
            <h2 className="text-3xl font-bold mb-4">BON RETOUR PARMI NOUS !</h2>
            <p className="text-lg">Connectez-vous et prenez connaissance des dernières actualités</p>
          </div>
        </div>

        {/* Right Side */}
        <div className="p-8 md:w-1/2 w-full bg-white">
          <h2 className="text-blue-700 text-2xl font-semibold mb-6 text-center">connexion</h2>

          <form className="space-y-4">
            <div className="flex items-center border-b border-blue-700 py-2">
              <FaUser className="text-blue-700 mr-2" />
              <input
                type="text"
                placeholder="nom"
                className="w-full outline-none bg-transparent"
              />
            </div>

            <div className="flex items-center border-b border-blue-700 py-2">
              <FaEnvelope className="text-blue-700 mr-2" />
              <input
                type="email"
                placeholder="email"
                className="w-full outline-none bg-transparent"
              />
            </div>

            <div className="flex items-center border-b border-blue-700 py-2">
              <FaLock className="text-blue-700 mr-2" />
              <input
                type="password"
                placeholder="mot de passe"
                className="w-full outline-none bg-transparent"
              />
            </div>

            <div className="flex items-center border-b border-blue-700 py-2">
              <FaKey className="text-blue-700 mr-2" />
              <input
                type="text"
                placeholder="code de securite"
                className="w-full outline-none bg-transparent"
              />
            </div>

            <button
              type="submit"
              className="bg-blue-700 text-white font-semibold w-full py-3 rounded-full hover:bg-blue-800 transition"
            >
              se connecter
            </button>

            <div className="flex justify-between text-sm text-blue-600 mt-4">
              <a href="#">mot de passe oublié</a>
              <a href="#">s’inscrire</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
