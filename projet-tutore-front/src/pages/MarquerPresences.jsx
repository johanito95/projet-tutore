import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaCheck, FaTimes, FaSpinner, FaCheckCircle, FaExclamationTriangle, FaChalkboardTeacher } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import SidebarEnseignant from './SidebarEnseignant';
import TopbarEnseignant from './TopbarEnseignant';

const MarquerPresences = () => {
  const { appel_id } = useParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [etudiants, setEtudiants] = useState([]);
  const [presences, setPresences] = useState({});
  const [loading, setLoading] = useState(false);
  const [appel, setAppel] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Utilisateur non authentifié');
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

    // Fetch appel details
    setLoading(true);
    axios
      .get(`http://127.0.0.1:8000/api/appels/${appel_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setAppel(response.data);
        const salle_id = response.data.cours?.salle_id;
        const annee_academique_id = response.data.cours?.annee_academique_id;
        if (!salle_id || !annee_academique_id) {
          throw new Error('Données de salle ou d’année académique manquantes');
        }
        return axios.get(`http://127.0.0.1:8000/api/inscriptions-etudiants?salle_id=${salle_id}&annee_academique_id=${annee_academique_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      })
      .then((response) => {
        if (response.data.length === 0) {
          setError('Aucun étudiant inscrit dans cette salle pour cette année académique');
          toast.warn(
            <div className="flex items-center gap-2">
              <FaExclamationTriangle className="w-5 h-5" />
              Aucun étudiant trouvé
            </div>,
            {
              position: 'top-right',
              autoClose: 5000,
              toastId: 'no-students',
              className: 'toast-error',
            }
          );
        } else {
          setEtudiants(response.data);
          setPresences(
            response.data.reduce((acc, etudiant) => ({
              ...acc,
              [etudiant.id]: { etat: 'present', remarque: '' },
            }), {})
          );
        }
      })
      .catch((error) => {
        console.error('Erreur lors du chargement des données', error);
        let errorMessage = 'Erreur lors du chargement des étudiants ou de l’appel';
        if (error.response) {
          switch (error.response.status) {
            case 401:
              errorMessage = 'Utilisateur non authentifié';
              break;
            case 403:
              errorMessage = error.response.data.message || 'Action non autorisée';
              break;
            case 404:
              errorMessage = error.response.data.message || 'Appel ou données non trouvées';
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
          {
            position: 'top-right',
            autoClose: 5000,
            toastId: 'data-error',
            className: 'toast-error',
          }
        );
      })
      .finally(() => setLoading(false));
  }, [appel_id]);

  const handlePresenceChange = (etudiantId, field, value) => {
    setPresences((prev) => ({
      ...prev,
      [etudiantId]: { ...prev[etudiantId], [field]: value },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    toast.dismiss();

    const uploadToastId = toast.info(
      <div className="flex items-center gap-2">
        <FaSpinner className="animate-spin w-5 h-5" />
        Enregistrement des présences en cours...
      </div>,
      {
        position: 'top-right',
        autoClose: false,
        toastId: 'presence-progress',
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
      const promises = Object.entries(presences).map(([etudiantId, { etat, remarque }]) =>
        axios.post(
          'http://127.0.0.1:8000/api/presences',
          {
            appel_id,
            etudiant_id: etudiantId,
            etat,
            remarque: remarque || null,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        )
      );

      await Promise.all(promises);
      toast.dismiss(uploadToastId);
      toast.success(
        <div className="flex items-center gap-2">
          <FaCheckCircle className="w-5 h-5" />
          Présences enregistrées avec succès
        </div>,
        {
          position: 'top-right',
          autoClose: 3000,
          toastId: 'presence-success',
          className: 'toast-success',
        }
      );
      navigate('/faire-appel');
    } catch (error) {
      toast.dismiss(uploadToastId);
      let errorMessage = 'Erreur lors de l’enregistrement des présences';
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
          toastId: 'presence-error',
          className: 'toast-error',
        }
      );
      console.error('Erreur lors de l’enregistrement des présences', error);
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="flex min-h-screen bg-[#F7F9FC] font-poppins">
        <SidebarEnseignant
          isOpen={isSidebarOpen}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <div className="flex-1 flex flex-col">
          <TopbarEnseignant toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
          <main className="flex-1 p-4 sm:p-6 md:p-8 md:pl-56 bg-[#F7F9FC]">
            <h1 className="text-xl sm:text-2xl font-bold text-[#093A5D] mb-6 flex items-center gap-2">
              <FaChalkboardTeacher className="w-6 h-6" />
              Marquer les présences
            </h1>
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
              <p>{error}</p>
              <button
                onClick={() => navigate('/faire-appel')}
                className="mt-4 btn-primary"
              >
                Retourner à Faire l’appel
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

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
          .etudiant-card {
            background: white;
            padding: 1rem;
            border-radius: 0.5rem;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
          }
          .etudiant-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
          }
          .radio-group {
            display: flex;
            gap: 1rem;
            align-items: center;
          }
          .radio-label {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.875rem;
            color: #093A5D;
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
            Marquer les présences
          </h1>
          {loading && (
            <div className="flex justify-center items-center">
              <FaSpinner className="animate-spin w-8 h-8 text-[#093A5D]" />
            </div>
          )}
          {appel && !loading && (
            <div className="mb-6 bg-white p-4 rounded-xl shadow-md">
              <p className="text-sm font-medium text-[#093A5D]">
                Cours: {appel.cours?.matiere?.nom} ({appel.cours?.salle?.nom ?? 'N/A'})
              </p>
              <p className="text-xs text-gray-600">
                Date: {new Date(appel.date_heure).toLocaleString()}
              </p>
              <p className="text-xs text-gray-600">État: {appel.etat}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="max-w-7xl mx-auto">
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {etudiants.map((etudiant) => (
                <div key={etudiant.id} className="etudiant-card">
                  <p className="text-sm font-medium text-[#093A5D]">
                    {etudiant.prenom} {etudiant.nom}
                  </p>
                  <p className="text-xs text-gray-600">{etudiant.email}</p>
                  <div className="mt-2 radio-group">
                    <label className="radio-label">
                      <input
                        type="radio"
                        name={`etat-${etudiant.id}`}
                        value="present"
                        checked={presences[etudiant.id]?.etat === 'present'}
                        onChange={() => handlePresenceChange(etudiant.id, 'etat', 'present')}
                        aria-label={`Marquer ${etudiant.prenom} ${etudiant.nom} comme présent`}
                      />
                      <FaCheck className="w-4 h-4 text-green-600" />
                      Présent
                    </label>
                    <label className="radio-label">
                      <input
                        type="radio"
                        name={`etat-${etudiant.id}`}
                        value="absent"
                        checked={presences[etudiant.id]?.etat === 'absent'}
                        onChange={() => handlePresenceChange(etudiant.id, 'etat', 'absent')}
                        aria-label={`Marquer ${etudiant.prenom} ${etudiant.nom} comme absent`}
                      />
                      <FaTimes className="w-4 h-4 text-red-600" />
                      Absent
                    </label>
                  </div>
                  <div className="input-container mt-2">
                    <input
                      type="text"
                      value={presences[etudiant.id]?.remarque || ''}
                      onChange={(e) => handlePresenceChange(etudiant.id, 'remarque', e.target.value)}
                      className="input-field"
                      placeholder=" "
                      aria-label={`Remarque pour ${etudiant.prenom} ${etudiant.nom}`}
                    />
                    <label>Remarque (optionnel)</label>
                  </div>
                </div>
              ))}
            </div>
            <button
              type="submit"
              disabled={loading || etudiants.length === 0}
              className="btn-primary mt-6 w-full flex items-center justify-center gap-2"
              aria-label={loading ? 'Enregistrement des présences en cours' : 'Enregistrer les présences'}
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin w-5 h-5" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <FaCheckCircle className="w-5 h-5" />
                  Enregistrer les présences
                </>
              )}
            </button>
          </form>
        </main>
      </div>
    </div>
  );
};

export default MarquerPresences;