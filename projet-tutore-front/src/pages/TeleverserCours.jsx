import React, { useState, useEffect } from 'react';
import { FaUpload, FaFileAlt, FaSpinner, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import SidebarEnseignant from './SidebarEnseignant';
import TopbarEnseignant from './TopbarEnseignant';

const TeleverserCours = () => {
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
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error(
        <div className="flex items-center gap-2">
          <FaExclamationTriangle className="w-5 h-5" />
          Utilisateur non authentifié
        </div>,
        {
          position: 'top-right',
          autoClose: 5000,
          toastId: 'auth-error',
          className: 'toast-error',
        }
      );
      return;
    }

    // Fetch années académiques
    axios
      .get(`http://127.0.0.1:8000/api/showyearschool?page=${page}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setAnneesAcademiques(response.data.data || response.data);
        setTotalPages(response.data.last_page || 1);
      })
      .catch((error) => {
        console.error('Erreur lors du chargement des années académiques', error);
        toast.error(
          <div className="flex items-center gap-2">
            <FaExclamationTriangle className="w-5 h-5" />
            Erreur lors du chargement des années académiques
          </div>,
          {
            position: 'top-right',
            autoClose: 5000,
            toastId: 'annees-error',
            className: 'toast-error',
          }
        );
      });

    // Fetch matières
    axios
      .get('http://127.0.0.1:8000/api/showmatiere', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => setMatieres(response.data))
      .catch((error) => {
        console.error('Erreur lors du chargement des matières', error);
        toast.error(
          <div className="flex items-center gap-2">
            <FaExclamationTriangle className="w-5 h-5" />
            Erreur lors du chargement des matières
          </div>,
          {
            position: 'top-right',
            autoClose: 5000,
            toastId: 'matieres-error',
            className: 'toast-error',
          }
        );
      });

    // Fetch salles
    axios
      .get('http://127.0.0.1:8000/api/showclasse', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => setSalles(response.data))
      .catch((error) => {
        console.error('Erreur lors du chargement des salles', error);
        toast.error(
          <div className="flex items-center gap-2">
            <FaExclamationTriangle className="w-5 h-5" />
            Erreur lors du chargement des salles
          </div>,
          {
            position: 'top-right',
            autoClose: 5000,
            toastId: 'salles-error',
            className: 'toast-error',
          }
        );
      });

    // Fetch documents
    axios
      .get('http://127.0.0.1:8000/api/documents', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => setDocuments(response.data))
      .catch((error) => {
        console.error('Erreur lors du chargement des documents', error);
        toast.error(
          <div className="flex items-center gap-2">
            <FaExclamationTriangle className="w-5 h-5" />
            Erreur lors du chargement des documents
          </div>,
          {
            position: 'top-right',
            autoClose: 5000,
            toastId: 'documents-error',
            className: 'toast-error',
          }
        );
      });
  }, [page]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, file: e.target.files[0] });
  };

  const handleSalleChange = (e) => {
    const selected = Array.from(e.target.selectedOptions, (option) => option.value);
    setFormData({ ...formData, salle_ids: selected });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Clear previous toasts
    toast.dismiss();

    // Show uploading toast
    const uploadToastId = toast.info(
      <div className="flex items-center gap-2">
        <FaSpinner className="animate-spin w-5 h-5" />
        Téléversement en cours...
      </div>,
      {
        position: 'top-right',
        autoClose: false,
        toastId: 'upload-progress',
        className: 'toast-info',
      }
    );

    const token = localStorage.getItem('token');
    if (!token) {
      toast.dismiss(uploadToastId);
      toast.error(
        <div className="flex items-center gap-2">
          <FaExclamationTriangle className="w-5 h-5" />
          Utilisateur non authentifié
        </div>,
        {
          position: 'top-right',
          autoClose: 5000,
          toastId: 'auth-error-submit',
          className: 'toast-error',
        }
      );
      setLoading(false);
      return;
    }

    const data = new FormData();
    data.append('nom', formData.nom);
    data.append('type', formData.type);
    data.append('file', formData.file);
    data.append('annee_academique_id', formData.annee_academique_id);
    if (formData.matiere_id) data.append('matiere_id', formData.matiere_id);
    if (formData.salle_ids.length) data.append('salle_ids', JSON.stringify(formData.salle_ids));
    if (formData.raison) data.append('raison', formData.raison);

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/documents', data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.dismiss(uploadToastId);
      toast.success(
        <div className="flex items-center gap-2">
          <FaCheckCircle className="w-5 h-5" />
          Document téléversé avec succès : {response.data.document.nom}
        </div>,
        {
          position: 'top-right',
          autoClose: 3000,
          toastId: 'upload-success',
          className: 'toast-success',
        }
      );
      setDocuments([...documents, response.data.document]);
      setFormData({
        nom: '',
        type: 'cours',
        file: null,
        annee_academique_id: '',
        matiere_id: '',
        salle_ids: [],
        raison: '',
      });
      document.getElementById('file-input').value = null;
    } catch (error) {
      toast.dismiss(uploadToastId);
      let errorMessage = 'Erreur lors du téléversement';
      if (error.response) {
        switch (error.response.status) {
          case 401:
            errorMessage = 'Utilisateur non authentifié';
            break;
          case 403:
            errorMessage = 'Action non autorisée';
            break;
          case 422:
            const errors = error.response.data.errors;
            errorMessage = Object.values(errors).flat().join(', ');
            break;
          case 500:
            errorMessage = error.response.data.error || 'Erreur serveur';
            break;
          default:
            errorMessage = 'Erreur inconnue';
        }
      }
      toast.error(
        <div className="flex items-center gap-2">
          <FaExclamationTriangle className="w-5 h-5" />
          {errorMessage}
        </div>,
        {
          position: 'top-right',
          autoClose: 5000,
          toastId: 'upload-error',
          className: 'toast-error',
        }
      );
      console.error('Erreur lors de l’upload', error);
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
          .input-container select:not([value=""]) + label,
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
          .document-card {
            background: white;
            padding: 1rem;
            border-radius: 0.5rem;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
          }
          .document-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
          }
          .btn-secondary {
            color: #F49100;
            padding: 0.5rem 1rem;
            border-radius: 0.375rem;
            transition: all 0.3s ease;
          }
          .btn-secondary:hover {
            background: rgba(244, 145, 0, 0.1);
            transform: scale(1.05);
          }
          .pagination-btn {
            padding: 0.5rem 1rem;
            border: 1px solid #d1d5db;
            border-radius: 0.375rem;
            transition: all 0.3s ease;
          }
          .pagination-btn:hover {
            background: #F49100;
            color: white;
            border-color: #F49100;
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
          .toast-info {
            background: #3498DB !important;
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
        <main className="flex-1 p-4 sm:p-6 md:p-8 md:pl-56 bg-[#F7F9FC] shadow-inner">
          <h1 className="text-xl sm:text-2xl font-bold text-[#093A5D] mb-6 flex items-center gap-3">
            <FaUpload className="w-6 h-6" />
            Téléverser un cours
          </h1>
          <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-md">
            <form onSubmit={handleSubmit} className="space-y-6" aria-label="Formulaire de téléversement">
              <div className="input-container">
                <input
                  type="text"
                  name="nom"
                  id="nom"
                  value={formData.nom}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder=" "
                  required
                  aria-required="true"
                  aria-label="Nom du document"
                />
                <label htmlFor="nom">Nom du document</label>
              </div>
              <div className="input-container">
                <select
                  name="type"
                  id="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                  aria-required="true"
                  aria-label="Type de document"
                >
                  <option value="cours">Cours</option>
                  <option value="rapport">Rapport</option>
                  <option value="autre">Autre</option>
                </select>
                <label htmlFor="type">Type de document</label>
              </div>
              <div className="input-container">
                <input
                  type="file"
                  name="file"
                  id="file-input"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="input-field"
                  required
                  aria-required="true"
                  aria-label="Fichier à téléverser"
                />
                <label htmlFor="file-input">Fichier (PDF, DOC, DOCX)</label>
              </div>
              <div className="input-container">
                <select
                  name="annee_academique_id"
                  id="annee_academique_id"
                  value={formData.annee_academique_id}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                  aria-required="true"
                  aria-label="Année académique"
                >
                  <option value="">Sélectionner une année</option>
                  {anneesAcademiques.map((annee) => (
                    <option key={annee.id} value={annee.id}>
                      {annee.annee || annee.nom}
                    </option>
                  ))}
                </select>
                <label htmlFor="annee_academique_id">Année académique</label>
              </div>
              <div className="input-container">
                <select
                  name="matiere_id"
                  id="matiere_id"
                  value={formData.matiere_id}
                  onChange={handleInputChange}
                  className="input-field"
                  aria-label="Matière (optionnel)"
                >
                  <option value="">Sélectionner une matière</option>
                  {matieres.map((matiere) => (
                    <option key={matiere.id} value={matiere.id}>
                      {matiere.nom} ({matiere.code})
                    </option>
                  ))}
                </select>
                <label htmlFor="matiere_id">Matière (optionnel)</label>
              </div>
              <div className="input-container">
                <select
                  name="salle_ids"
                  id="salle_ids"
                  multiple
                  value={formData.salle_ids}
                  onChange={handleSalleChange}
                  className="input-field"
                  aria-label="Salles (optionnel)"
                >
                  {salles.map((salle) => (
                    <option key={salle.id} value={salle.id}>
                      {salle.nom}
                    </option>
                  ))}
                </select>
                <label htmlFor="salle_ids">Salles (optionnel)</label>
              </div>
              <div className="input-container">
                <textarea
                  name="raison"
                  id="raison"
                  value={formData.raison}
                  onChange={handleInputChange}
                  className="input-field"
                  rows="4"
                  placeholder=" "
                  aria-label="Raison (optionnel)"
                />
                <label htmlFor="raison">Raison (optionnel)</label>
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
                    <FaUpload className="w-5 h-5" />
                    Téléverser
                  </>
                )}
              </button>
            </form>
          </div>
          <div className="mt-8 max-w-7xl mx-auto">
            <h2 className="text-lg font-semibold text-[#093A5D] mb-4 flex items-center gap-3">
              <FaFileAlt className="w-5 h-5" />
              Documents téléversés
            </h2>
            {documents.length ? (
              <>
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {documents.map((doc) => (
                    <div key={doc.id} className="document-card">
                      <p className="text-sm font-medium text-[#093A5D]">{doc.nom}</p>
                      <p className="text-xs text-gray-600">Type: {doc.type}</p>
                      <p className="text-xs text-gray-600">Date: {new Date(doc.date_upload).toLocaleDateString()}</p>
                      <p className="text-xs text-gray-600">
                        Matière: {doc.matiere ? `${doc.matiere.nom} (${doc.matiere.code})` : 'N/A'}
                      </p>
                      <div className="mt-2 flex gap-2">
                        <a
                          href={`http://127.0.0.1:8000/storage/${doc.url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-secondary"
                          aria-label={`Voir le document ${doc.nom}`}
                        >
                          Voir
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-center gap-2">
                  <button
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                    className="pagination-btn"
                    aria-label="Page précédente"
                  >
                    Précédent
                  </button>
                  <span className="text-sm text-[#093A5D]" aria-label={`Page actuelle ${page} sur ${totalPages}`}>
                    Page {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={page === totalPages}
                    className="pagination-btn"
                    aria-label="Page suivante"
                  >
                    Suivant
                  </button>
                </div>
              </>
            ) : (
              <p className="text-gray-600">Aucun document téléversé.</p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default TeleverserCours;