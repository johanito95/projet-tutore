// Fichier : CoursPage.jsx
import React from 'react';
import { FaDownload, FaBook } from 'react-icons/fa';
import Sidebar from './SidebarEtudiant'; // Réutilise le composant Sidebar

// Composant pour une seule carte de cours
const CoursCard = ({ titre, enseignant }) => (
  <div className="bg-white p-4 rounded-2xl shadow w-full">
    <h3 className="text-lg font-bold mb-1">{titre}</h3>
    <p className="text-sm text-gray-700 mb-4">{enseignant}</p>
    <button className="flex items-center gap-2 text-blue-600 font-medium hover:underline">
      <FaDownload className="text-blue-600" />
      Telecharger le support
    </button>
  </div>
);

// Composant principal de la page cours
const CoursPage = () => {
  // Exemple de données statiques (à remplacer par API plus tard)
  const coursList = Array(6).fill({
    titre: 'securite informatique',
    enseignant: 'Mr Manga',
  });

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <Sidebar />
      <main className="flex-1 bg-gray-100 p-6">
        {/* En-tête */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-blue-800">Dashboard</h1>
          <div className="text-blue-800 font-semibold">name</div>
        </div>

        {/* Titre de la section */}
        <div className="flex items-center gap-3 mb-6">
          <FaBook className="text-green-600 text-4xl bg-white rounded p-1 shadow" />
          <h2 className="text-2xl font-bold">mes cours</h2>
        </div>

        {/* Message d'accueil */}
        <div className="bg-white rounded-xl shadow p-4 mb-6 text-gray-700">
          bienvenue dans cet espace dedie aux cours ou vous avez la possibilité de consulter et telecharger vos supports de cours
        </div>

        {/* Liste des cours */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {coursList.map((cours, index) => (
            <CoursCard key={index} {...cours} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default CoursPage;
