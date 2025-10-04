import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaFileUpload, FaSpinner, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import SidebarEnseignant from './SidebarEnseignant';
import TopbarEnseignant from './TopbarEnseignant';

const UploadDocumentEnseignants = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    type: 'cours',
    file: null,
    annee_academique_id: '',
    matiere_id: '',
    salle_ids: [],
    raison: '',
  });
  const [anneesAcademiques, setAnneesAcademiques] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [salles, setSalles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Utilisateur non authentifié');
      toast.error(
        <div className="flex items-center gap-2">
          <FaExclamationTriangle className="w-5 h-5" />
          Utilisateur non authentifié
        </div>,
        { position: 'top-right', autoClose: 5000, toastId: 'auth-error', className: 'toast-error' }
      );
      return;
    }

    // Fetch années académiques, matières, et salles
    const fetchData = async () => {
      try {
        const [anneesResponse, matieresResponse, sallesResponse] = await Promise.all([
          axios.get('http://127.0.0.1:8000/api/showyearschool', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://127.0.0.1:8000/api/showmatiere', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://127.0.0.1:8000/api/showclasse', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setAnneesAcademiques(anneesResponse.data);
        setMatieres(matieresResponse.data);
        setSalles(sallesResponse.data);
      } catch (err) {
        setError('Erreur lors du chargement des données');
        toast.error(
          <div className="flex items-center gap-2">
            <FaExclamationTriangle className="w-5 h-5" />
            Erreur lors du chargement des données
          </div>,
          { position: 'top-right', autoClose: 5000, toastId: 'data-error', className: 'toast-error' }
        );
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, file: e.target.files[0] }));
  };

  const handleSalleChange = (e) => {
    const selectedSalles = Array.from(e.target.selectedOptions, (option) => parseInt(option.value));
    setFormData((prev) => ({ ...prev, salle_ids: selectedSalles }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    toast.dismiss();

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Utilisateur non authentifié');
      toast.error(
        <div className="flex items-center gap-2">
          <FaExclamationTriangle className="w-5 h-5" />
          Utilisateur non authentifié
        </div>,
        { position: 'top-right', autoClose: 5000, toastId: 'auth-error-submit', className: 'toast-error' }
      );
      setLoading(false);
      return;
    }

    const form = new FormData();
    form.append('nom', formData.nom);
    form.append('type', formData.type);
    form.append('file', formData.file);
    form.append('annee_academique_id', formData.annee_academique_id);
    if (formData.matiere_id) form.append('matiere_id', formData.matiere_id);
    if (formData.raison) form.append('raison', formData.raison);
    formData.salle_ids.forEach((salle_id, index) => {
      form.append(`salle_ids[${index}]`, salle_id);
    });

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/documents/enseignants', form, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success(
        <div className="flex items-center gap-2">
          <FaCheckCircle className="w-5 h-5" />
          Document téléversé avec succès
        </div>,
        { position: 'top-right', autoClose: 3000, toastId: 'upload-success', className: 'toast-success' }
      );

      // Réinitialiser le formulaire
      setFormData({
        nom: '',
        type: 'cours',
        file: null,
        annee_academique_id: '',
        matiere_id: '',
        salle_ids: [],
        raison: '',
      });
    } catch (error) {
      let errorMessage = 'Erreur lors du téléversement du document';
      if (error.response) {
        switch (error.response.status) {
          case 401:
            errorMessage = 'Utilisateur non authentifié';
            break;
          case 403:
            errorMessage = error.response.data.message || 'Action non autorisée';
            break;
          case 422:
            errorMessage = Object.values(error.response.data.errors).flat().join(', ');
            break;
          case 500:
            errorMessage = error.response.data.error || 'Erreur serveur interne';
            break;
          default:
            errorMessage = 'Erreur inconnue';
        }
      } else {
        errorMessage = error.message || 'Erreur réseau';
      }
      setError(errorMessage);
      toast.error(
        <div className="flex items-center gap-2">
          <FaExclamationTriangle className="w-5 h-5" />
          {errorMessage}
        </div>,
        { position: 'top-right', autoClose: 5000, toastId: 'upload-error', className: 'toast-error' }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F7F9FC] font-poppins">
      <style>
        {`
          .input-container {
            position: relative;
            margin-bottom: 1.5rem;
          }
          .input-container label {
            position: absolute;
            top: 0.5rem;
            left: 0.75rem;
            font-size: 0.875rem;
            color: #093A5D;
            transition: all 0.2s ease-in-out;
            pointer-events: none;
          }
          .input-container input:focus + label,
          .input-container input:not(:placeholder-shown) + label,
          .input-container select:focus + label,
          .input-container select:not(:placeholder-shown) + label,
          .input-container textarea:focus + label,
          .input-container textarea:not(:placeholder-shown) + label {
            top: -1rem;
            font-size: 0.75rem;
            color: #F49100;
          }
          .input-field {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid #d1d5db;
            border-radius: 0.5rem;
            transition: all 0.2s ease-in-out;
          }
          .input-field:focus {
            outline: none;
            border-color: #093A5D;
            box-shadow: 0 0 0 3px rgba(9, 58, 93, 0.1);
          }
          .btn-primary {
            background: #093A5D;
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            transition: all 0.3s ease;
          }
          .btn-primary:hover {
            background: #072c47;
            transform: scale(1.05);
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
          }
          .btn-primary:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
          .toast-success {
            background: #27AE60 !important;
            color: #FFFFFF !important;
            border-radius: 0.5rem !important;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2) !important;
            font-family: 'Poppins', sans-serif !important;
            font-size: 0.875rem !important;
            animation: slideIn 0.3s ease-out !important;
          }
          .toast-error {
            background: #E74C3C !important;
            color: #FFFFFF !important;
            border-radius: 0.5rem !important;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2) !important;
            font-family: 'Poppins', sans-serif !important;
            font-size: 0.875rem !important;
            animation: slideIn 0.3s ease-out !important;
          }
          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
        `}
      </style>
      <SidebarEnseignant
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      <div className="flex-1 flex flex-col">
        <TopbarEnseignant toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 p-4 sm:p-6 md:p-8 md:pl-56 bg-[#F7F9FC]">
          <h1 className="text-xl sm:text-2xl font-bold text-[#093A5D] mb-6 flex items-center gap-2">
            <FaFileUpload className="w-6 h-6" />
            Téléverser un document pour les enseignants
          </h1>
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6">
              <p>{error}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="max-w-lg mx-auto">
            <div className="input-container">
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleInputChange}
                className="input-field"
                placeholder=" "
                aria-label="Nom du document"
              />
              <label>Nom du document</label>
            </div>
            <div className="input-container">
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="input-field"
                aria-label="Type de document"
              >
                <option value="cours">Cours</option>
                <option value="rapport">Rapport</option>
                <option value="autre">Autre</option>
              </select>
              <label>Type de document</label>
            </div>
            <div className="input-container">
              <input
                type="file"
                name="file"
                onChange={handleFileChange}
                className="input-field"
                accept=".pdf,.doc,.docx"
                aria-label="Fichier du document"
              />
              <label>Fichier (PDF, DOC, DOCX)</label>
            </div>
            <div className="input-container">
              <select
                name="annee_academique_id"
                value={formData.annee_academique_id}
                onChange={handleInputChange}
                className="input-field"
                aria-label="Année académique"
              >
                <option value="">Sélectionner une année académique</option>
                {anneesAcademiques.map((annee) => (
                  <option key={annee.id} value={annee.id}>
                    {annee.annee}
                  </option>
                ))}
              </select>
              <label>Année académique</label>
            </div>
            <div className="input-container">
              <select
                name="matiere_id"
                value={formData.matiere_id}
                onChange={handleInputChange}
                className="input-field"
                aria-label="Matière"
              >
                <option value="">Aucune matière</option>
                {matieres.map((matiere) => (
                  <option key={matiere.id} value={matiere.id}>
                    {matiere.nom}
                  </option>
                ))}
              </select>
              <label>Matière (optionnel)</label>
            </div>
            <div className="input-container">
              <select
                multiple
                name="salle_ids"
                value={formData.salle_ids}
                onChange={handleSalleChange}
                className="input-field"
                aria-label="Salles de classe"
              >
                {salles.map((salle) => (
                  <option key={salle.id} value={salle.id}>
                    {salle.nom}
                  </option>
                ))}
              </select>
              <label>Salles de classe (optionnel, maintenir Ctrl pour sélection multiple)</label>
            </div>
            <div className="input-container">
              <textarea
                name="raison"
                value={formData.raison}
                onChange={handleInputChange}
                className="input-field"
                placeholder=" "
                aria-label="Raison du document"
              />
              <label>Raison (optionnel)</label>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
              aria-label={loading ? 'Téléversement en cours' : 'Téléverser le document'}
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin w-5 h-5" />
                  Téléversement...
                </>
              ) : (
                <>
                  <FaFileUpload className="w-5 h-5" />
                  Téléverser
                </>
              )}
            </button>
          </form>
        </main>
      </div>
    </div>
  );
};

export default UploadDocumentEnseignants;