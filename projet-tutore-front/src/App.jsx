import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Register from './pages/Register';
import DashboardEtudiant from './pages/Dashboard_etudiant';
import DashboardEnseignant from './pages/DashboardEnseignant';
import Dashboard_RA from './pages/Dashboard_RA';
import CoursPage from './pages/CoursPage';
import LoginPage from './pages/Login';
import ConfigAcademique from './pages/ConfigAcademique';
import Filiere_RA from './pages/Filiere_RA';
import Gestion_UE from './pages/Gestion_UE';
import MesClasses from './pages/MesClasses';
import Cours_RA from './pages/Cours_RA';
import Appel_RA from './pages/Appel_RA';
import Presence_RA from './pages/Presence_RA';
import Document_RA from './pages/Document_RA';
import TeleverserCours from './pages/TeleverserCours';
import FaireAppel from './pages/FaireAppel';
import MarquerPresences from './pages/MarquerPresences';
import UploadDocumentEnseignants from './pages/UploadDocumentEnseignants';
import MesDocuments from './pages/MesDocuments';
import CoursEtudiant from './pages/CoursEtudiant';
import Rapport from './pages/RapportEtudiant';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import React from 'react';

const App = () => {
  return (
    <BrowserRouter>
      
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard_etudiant" element={<DashboardEtudiant />} />
        
        {/* Routes vers l'administration du RA */}
        <Route path="/dashboard_responsable" element={<Dashboard_RA />} />
        <Route path="/responsable/config-academique" element={<ConfigAcademique />} />
        <Route path="/responsable/filieres" element={<Filiere_RA />} />
        <Route path="/responsable/enseignement" element={<Gestion_UE />} />
        <Route path="/responsable/classes" element={<MesClasses />} />
        <Route path="/responsable/cours" element={<Cours_RA />} />
        <Route path="/responsable/appels/valider" element={<Appel_RA />} />
        <Route path="/responsable/presences/salle" element={<Presence_RA />} />
        <Route path="/responsable/documents" element={<Document_RA />} />
        <Route path="/responsable/documents/enseignants" element={<UploadDocumentEnseignants />} />
        {/* Fin routes RA */}

        {/* Routes vers les enseignants */}
        <Route path="/dashboard_enseignant" element={<DashboardEnseignant />} />
        <Route path="/enseignant/televerser_cours" element={<TeleverserCours />} />
        <Route path="/enseignant/faire-appel" element={<FaireAppel />} />
        <Route path="/faire-appel/presences/:appel_id" element={<MarquerPresences />} />
        <Route path="/enseignant/mes-documents" element={<MesDocuments />} />
        {/* Fin routes enseignant */}

        {/* Routes vers les etudiants */}
        <Route path="/dashboard_etudiant" element={<DashboardEtudiant />} />
        <Route path="/etudiant/cours" element={<CoursEtudiant />} />
        <Route path="/etudiant/rapport" element={<Rapport />} />

        {/* <Route path="/etudiant/notes" element={<Notes />} />
        <Route path="/etudiant/requetes" element={<Requetes />} />
        <Route path="/etudiant/diplomation" element={<Diplomation />} />
        <Route path="/etudiant/notifications" element={<Notifications />} /> */}
        {/* Fin route etudiants */}

        <Route path="/cours" element={<CoursPage />} />
        <Route path="*" element={<div>Page non trouvée</div>} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;