import React, { useState, useEffect } from 'react';
import { FaChalkboardTeacher, FaSpinner, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import SidebarEnseignant from './SidebarEnseignant';
import TopbarEnseignant from './TopbarEnseignant';

const FaireAppel = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [formData, setFormData] = useState({
    cours_id: '',
    date_heure: '',
    commentaire: '',
    etat: 'brouillon',
  });
  const [cours, setCours] = useState([]);
  const [appels, setAppels] = useState([]);
  const [selectedCours, setSelectedCours] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

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

    // Fetch user ID
    axios
      .get('http://127.0.0.1:8000/api/infos', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setUserId(response.data.id);
      })
      .catch((error) => {
        console.error('Erreur lors de la récupération de l’utilisateur', error);
        toast.error(
          <div className="flex items-center gap-2">
            <FaExclamationTriangle className="w-5 h-5" />
            Erreur lors de la récupération de l’utilisateur
          </div>,
          {
            position: 'top-right',
            autoClose: 5000,
            toastId: 'user-error',
            className: 'toast-error',
          }
        );
      });

    // Fetch tous les cours
    axios
      .get('http://127.0.0.1:8000/api/cours', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        const filteredCours = response.data.filter(
          (c) => c.enseignant?.utilisateur?.id === userId
        );
        setCours(filteredCours);
        if (filteredCours.length > 0) {
          setSelectedCours(filteredCours[0].id);
          setFormData((prev) => ({ ...prev, cours_id: filteredCours[0].id }));
        }
      })
      .catch((error) => {
        console.error('Erreur lors du chargement des cours', error);
        toast.error(
          <div className="flex items-center gap-2">
            <FaExclamationTriangle className="w-5 h-5" />
            Erreur lors du chargement des cours
          </div>,
          {
            position: 'top-right',
            autoClose: 5000,
            toastId: 'cours-error',
            className: 'toast-error',
          }
        );
      });
  }, [userId]);

  useEffect(() => {
    if (selectedCours) {
      const token = localStorage.getItem('token');
      axios
        .get(`http://127.0.0.1:8000/api/appels/cours/${selectedCours}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => setAppels(response.data))
        .catch((error) => {
          console.error('Erreur lors du chargement des appels', error);
          toast.error(
            <div className="flex items-center gap-2">
              <FaExclamationTriangle className="w-5 h-5" />
              Erreur lors du chargement des appels
            </div>,
            {
              position: 'top-right',
              autoClose: 5000,
              toastId: 'appels-error',
              className: 'toast-error',
            }
          );
        });
    }
  }, [selectedCours]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCoursChange = (e) => {
    setSelectedCours(e.target.value);
    setFormData({ ...formData, cours_id: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    toast.dismiss();

    const uploadToastId = toast.info(
      <div className="flex items-center gap-2">
        <FaSpinner className="animate-spin w-5 h-5" />
        Création de l'appel en cours...
      </div>,
      {
        position: 'top-right',
        autoClose: false,
        toastId: 'appel-progress',
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

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/appels', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      toast.dismiss(uploadToastId);
      toast.success(
        <div className="flex items-center gap-2">
          <FaCheckCircle className="w-5 h-5" />
          Appel créé avec succès
        </div>,
        {
          position: 'top-right',
          autoClose: 3000,
          toastId: 'appel-success',
          className: 'toast-success',
        }
      );
      setAppels([...appels, response.data.appel]);
      setFormData({
        cours_id: selectedCours,
        date_heure: '',
        commentaire: '',
        etat: 'brouillon',
      });
      navigate(`/faire-appel/presences/${response.data.appel.id}`);
    } catch (error) {
      toast.dismiss(uploadToastId);
      let errorMessage = 'Erreur lors de la création de l’appel';
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
          toastId: 'appel-error',
          className: 'toast-error',
        }
      );
      console.error('Erreur lors de la création de l’appel', error);
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
          .appel-card {
            background: white;
            padding: 1rem;
            border-radius: 0.5rem;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
          }
          .appel-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
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
        <main className="flex-1 p-4 sm:p-6 md:p-8 md:pl-56 bg-[#F7F9FC]">
          <h1 className="text-xl sm:text-2xl font-bold text-[#093A5D] mb-6 flex items-center gap-2">
            <FaChalkboardTeacher className="w-6 h-6" />
            Faire l’appel
          </h1>
          <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-md">
            <form onSubmit={handleSubmit} className="space-y-6" aria-label="Formulaire de création d’appel">
              <div className="input-container">
                <select
                  name="cours_id"
                  id="cours_id"
                  value={formData.cours_id}
                  onChange={handleCoursChange}
                  className="input-field"
                  required
                  aria-required="true"
                  aria-label="Cours"
                >
                  <option value="">Sélectionner un cours</option>
                  {cours.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.matiere?.nom} ({c.salle?.nom ?? 'N/A'}, {c.anneeAcademique?.annee ?? 'N/A'})
                    </option>
                  ))}
                </select>
                <label htmlFor="cours_id">Cours</label>
              </div>
              <div className="input-container">
                <input
                  type="datetime-local"
                  name="date_heure"
                  id="date_heure"
                  value={formData.date_heure}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                  aria-required="true"
                  aria-label="Date et heure"
                />
                <label htmlFor="date_heure">Date et heure</label>
              </div>
              <div className="input-container">
                <textarea
                  name="commentaire"
                  id="commentaire"
                  value={formData.commentaire}
                  onChange={handleInputChange}
                  className="input-field"
                  rows="4"
                  placeholder=" "
                  aria-label="Commentaire (optionnel)"
                />
                <label htmlFor="commentaire">Commentaire (optionnel)</label>
              </div>
              <div className="input-container">
                <select
                  name="etat"
                  id="etat"
                  value={formData.etat}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                  aria-required="true"
                  aria-label="État"
                >
                  <option value="brouillon">Brouillon</option>
                  <option value="valide">Valide</option>
                  <option value="verrouille">Verrouillé</option>
                </select>
                <label htmlFor="etat">État</label>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2"
                aria-label={loading ? 'Création de l’appel en cours' : 'Créer l’appel'}
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin w-5 h-5" />
                    Création...
                  </>
                ) : (
                  <>
                    <FaChalkboardTeacher className="w-5 h-5" />
                    Créer l’appel
                  </>
                )}
              </button>
            </form>
          </div>
          <div className="mt-8 max-w-7xl mx-auto">
            <h2 className="text-lg font-semibold text-[#093A5D] mb-4 flex items-center gap-2">
              <FaChalkboardTeacher className="w-5 h-5" />
              Appels effectués
            </h2>
            {appels.length ? (
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {appels.map((appel) => (
                  <div key={appel.id} className="appel-card">
                    <p className="text-sm font-medium text-[#093A5D]">
                      {appel.cours?.matiere?.nom} ({appel.cours?.salle?.nom ?? 'N/A'})
                    </p>
                    <p className="text-xs text-gray-600">
                      Date: {new Date(appel.date_heure).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-600">État: {appel.etat}</p>
                    <p className="text-xs text-gray-600">
                      Commentaire: {appel.commentaire || 'N/A'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">Aucun appel effectué pour ce cours.</p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default FaireAppel;