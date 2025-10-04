import React, { useState, useEffect } from 'react';
import { FaCheck, FaEye, FaBook, FaSearch, FaTimes } from 'react-icons/fa';
import Sidebar_RA from '../pages/Sidebar_RA';
import Topbar from '../pages/Topbar';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const Appel_RA = () => {
  const [appels, setAppels] = useState([]);
  const [cours, setCours] = useState([]);
  const [selectedCours, setSelectedCours] = useState('');
  const [loading, setLoading] = useState({ appels: true, cours: true });
  const [error, setError] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [modal, setModal] = useState({ isOpen: false, type: '', data: null });
  const [user, setUser] = useState({
    nom: 'Tchamgoue',
    prenom: 'Jean',
    role: 'Responsable Académique',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Utilisateur non authentifié', {
        position: 'top-right',
        autoClose: 3000,
        style: { backgroundColor: '#E74C3C', color: '#FFFFFF', fontSize: '0.875rem' },
      });
      setLoading({ appels: false, cours: false });
      return;
    }

    const fetchData = async () => {
      try {
        const [coursResponse, appelsResponse] = await Promise.all([
          axios.get('http://127.0.0.1:8000/api/cours', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(
            selectedCours ? `http://127.0.0.1:8000/api/appels/cours/${selectedCours}` : 'http://127.0.0.1:8000/api/appels',
            { headers: { Authorization: `Bearer ${token}` } }
          ),
        ]);

        const fetchedCours = Array.isArray(coursResponse.data) ? coursResponse.data : [];
        const fetchedAppels = Array.isArray(appelsResponse.data) ? appelsResponse.data : [];

        setCours(fetchedCours);
        setAppels(fetchedAppels);

        // Log pour débogage
        fetchedAppels.forEach((appel, index) => {
          if (!appel.cours) {
            console.warn(`Appel #${index + 1} (ID: ${appel.id}) n'a pas de cours associé`);
            toast.warn(`Appel ID ${appel.id} sans cours associé`, {
              position: 'top-right',
              autoClose: 3000,
              style: { backgroundColor: '#E74C3C', color: '#FFFFFF', fontSize: '0.875rem' },
            });
          }
        });
      } catch (err) {
        const errorMsg = err.response?.data?.message || 'Erreur lors de la récupération des données';
        setError(errorMsg);
        console.error('Fetch error:', err);
        toast.error(errorMsg, {
          position: 'top-right',
          autoClose: 3000,
          style: { backgroundColor: '#E74C3C', color: '#FFFFFF', fontSize: '0.875rem' },
        });
      } finally {
        setLoading({ appels: false, cours: false });
      }
    };

    fetchData();
  }, [selectedCours]);

  const handleValiderAppel = async (id) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Utilisateur non authentifié', {
        position: 'top-right',
        autoClose: 3000,
        style: { backgroundColor: '#E74C3C', color: '#FFFFFF', fontSize: '0.875rem' },
      });
      return;
    }

    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/api/appels/${id}/valider`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAppels(appels.map((appel) => (appel.id === id ? { ...appel, etat: 'valide' } : appel)));
      const appel = appels.find((a) => a.id === id);
      const notificationMessage = `Appel validé pour le cours ${appel?.cours?.matiere?.nom || 'N/A'}`;
      await axios.post(
        'http://127.0.0.1:8000/api/notifications',
        { message: notificationMessage, is_read: false },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications([...notifications, { id: Date.now(), message: notificationMessage, date: new Date().toLocaleString(), is_read: false }]);
      toast.success('Appel validé', {
        position: 'top-right',
        autoClose: 3000,
        style: { backgroundColor: '#27AE60', color: '#FFFFFF', fontSize: '0.875rem' },
      });
      setError('');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Erreur lors de la validation';
      setError(errorMsg);
      toast.error(errorMsg, {
        position: 'top-right',
        autoClose: 3000,
        style: { backgroundColor: '#E74C3C', color: '#FFFFFF', fontSize: '0.875rem' },
      });
      console.error('Validation error:', err);
    }
  };

  const openModal = (type, data = null) => {
    setModal({ isOpen: true, type, data });
    setError('');
  };

  const closeModal = () => {
    setModal({ isOpen: false, type: '', data: null });
    setError('');
  };

  return (
    <>
      <style>
        {`
          .appel-card {
            transition: all 0.3s ease;
          }
          .appel-card:hover {
            transform: scale(1.02);
            box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
          }
          .modal {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(16px);
            border-radius: 16px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          }
          @media (max-width: 640px) {
            .appel-card {
              padding: 1rem;
            }
            .modal {
              max-width: 95vw;
              padding: 1rem;
            }
            .modal h3 {
              font-size: 1rem;
            }
            .modal p, .modal select, .modal button {
              font-size: 0.75rem;
            }
            .table-container {
              display: none;
            }
            .card-container {
              display: flex;
              flex-direction: column;
              gap: 1rem;
            }
          }
          @media (min-width: 641px) {
            .card-container {
              display: none;
            }
            .table-container {
              display: block;
            }
          }
          @media (min-width: 1024px) {
            .appel-card {
              max-width: 80rem;
            }
          }
        `}
      </style>
      <div className="flex min-h-screen bg-gradient-to-b from-[#F7F9FC] to-[#E5E9F0] font-poppins">
        <Sidebar_RA isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <div className="flex-1 flex flex-col pt-16">
          <Topbar user={user} setNotifications={setNotifications} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
          <div className="flex-1 p-4 sm:p-6 md:p-8">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
              className="text-xl sm:text-2xl font-bold text-[#093A5D] mb-6 sm:mb-8 flex items-center gap-3"
            >
              <FaBook className="w-5 h-5 sm:w-6 sm:h-6" /> Valider les Appels
            </motion.h1>
            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[#E74C3C] text-xs sm:text-sm mb-4 max-w-4xl xl:max-w-5xl mx-auto"
              >
                {error}
              </motion.p>
            )}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.15 }}
              className="bg-white/95 backdrop-blur-md rounded-xl shadow-xl p-4 sm:p-6 appel-card max-w-4xl xl:max-w-5xl mx-auto"
            >
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <FaBook className="text-[#093A5D] w-5 h-5 sm:w-6 sm:h-6" />
                  <h2 className="text-lg sm:text-xl font-semibold text-[#093A5D]">Filtrer par cours</h2>
                </div>
                <div className="relative w-full sm:w-64">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#093A5D]/50 w-4 h-4 sm:w-5 sm:h-5" />
                  <select
                    value={selectedCours}
                    onChange={(e) => setSelectedCours(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#F49100] focus:border-transparent transition-all"
                  >
                    <option value="">Tous les cours</option>
                    {cours.map((cours) => (
                      <option key={cours.id} value={cours.id}>
                        {cours.matiere?.nom || 'N/A'} - {cours.salle?.nom || 'N/A'} ({cours.semestre?.libelle || 'N/A'}, {cours.anneeAcademique?.annee || 'N/A'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {loading.appels ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-10 sm:h-12 bg-gray-200 rounded-lg"></div>
                  <div className="h-10 sm:h-12 bg-gray-200 rounded-lg"></div>
                </div>
              ) : appels.length ? (
                <>
                  <div className="table-container overflow-x-auto">
                    <table className="w-full text-xs sm:text-sm">
                      <thead>
                        <tr className="bg-[#093A5D]/10">
                          <th className="p-2 sm:p-3 text-left">Cours</th>
                          <th className="p-2 sm:p-3 text-left hidden sm:table-cell">Enseignant</th>
                          <th className="p-2 sm:p-3 text-left hidden md:table-cell">Date</th>
                          <th className="p-2 sm:p-3 text-left hidden lg:table-cell">État</th>
                          <th className="p-2 sm:p-3 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {appels.map((appel) => (
                          <motion.tr
                            key={appel.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.15 }}
                            className="border-b border-gray-200 hover:bg-[#093A5D]/5"
                          >
                            <td className="p-2 sm:p-3">
                              {appel.cours
                                ? `${appel.cours.matiere?.nom || 'N/A'} - ${appel.cours.salle?.nom || 'N/A'} (${appel.cours.semestre?.libelle || 'N/A'})`
                                : 'Cours non trouvé'}
                            </td>
                            <td className="p-2 sm:p-3 hidden sm:table-cell">
                              {(appel.enseignant?.utilisateur?.nom || '') + ' ' + (appel.enseignant?.utilisateur?.prenom || 'N/A')}
                            </td>
                            <td className="p-2 sm:p-3 hidden md:table-cell">
                              {appel.created_at
                                ? new Date(appel.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
                                : 'N/A'}
                            </td>
                            <td className="p-2 sm:p-3 hidden lg:table-cell">{appel.etat}</td>
                            <td className="p-2 sm:p-3 flex gap-2 sm:gap-3">
                              {appel.etat === 'brouillon' && (
                                <button
                                  onClick={() => handleValiderAppel(appel.id)}
                                  className="text-[#F49100] hover:text-[#e07b00] hover:scale-110 transition-all duration-200"
                                  title="Valider l'appel"
                                >
                                  <FaCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                                </button>
                              )}
                              <button
                                onClick={() => openModal('detailsAppel', appel)}
                                className="text-[#093A5D] hover:text-[#F49100] hover:scale-110 transition-all duration-200"
                                title="Voir les détails"
                              >
                                <FaEye className="w-4 h-4 sm:w-5 sm:h-5" />
                              </button>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="card-container">
                    {appels.map((appel) => (
                      <motion.div
                        key={appel.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.15 }}
                        className="bg-white/90 rounded-lg p-4 shadow-md border border-gray-200"
                      >
                        <div className="flex flex-col gap-2">
                          <div>
                            <span className="font-semibold text-[#093A5D] text-xs">Cours:</span>{' '}
                            {appel.cours
                              ? `${appel.cours.matiere?.nom || 'N/A'} - ${appel.cours.salle?.nom || 'N/A'} (${appel.cours.semestre?.libelle || 'N/A'}, ${appel.cours.anneeAcademique?.annee || 'N/A'})`
                              : 'Cours non trouvé'}
                          </div>
                          <div>
                            <span className="font-semibold text-[#093A5D] text-xs">Enseignant:</span>{' '}
                            {(appel.enseignant?.utilisateur?.nom || '') + ' ' + (appel.enseignant?.utilisateur?.prenom || 'N/A')}
                          </div>
                          <div>
                            <span className="font-semibold text-[#093A5D] text-xs">Date:</span>{' '}
                            {appel.created_at
                              ? new Date(appel.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
                              : 'N/A'}
                          </div>
                          <div>
                            <span className="font-semibold text-[#093A5D] text-xs">État:</span> {appel.etat}
                          </div>
                          <div className="flex gap-3 mt-2">
                            {appel.etat === 'brouillon' && (
                              <button
                                onClick={() => handleValiderAppel(appel.id)}
                                className="text-[#F49100] hover:text-[#e07b00] hover:scale-110 transition-all duration-200"
                                title="Valider l'appel"
                              >
                                <FaCheck className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => openModal('detailsAppel', appel)}
                              className="text-[#093A5D] hover:text-[#F49100] hover:scale-110 transition-all duration-200"
                              title="Voir les détails"
                            >
                              <FaEye className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-xs sm:text-sm text-[#093A5D]/70 text-center">Aucun appel disponible.</p>
              )}
            </motion.div>

            {/* Modal */}
            <AnimatePresence>
              {modal.isOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="fixed inset-0 flex items-center justify-center z-50 backdrop-filter backdrop-blur-md bg-gray-900 bg-opacity-20"
                >
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="modal max-w-[95vw] sm:max-w-md md:max-w-lg w-full p-4 sm:p-6"
                  >
                    {modal.type === 'detailsAppel' && (
                      <>
                        <div className="flex justify-between items-center mb-4 sm:mb-6">
                          <h3 className="text-base sm:text-xl font-semibold text-[#093A5D]">Détails de l'Appel</h3>
                          <button
                            onClick={closeModal}
                            className="text-[#093A5D]/60 hover:text-[#E74C3C] hover:rotate-90 transition-all duration-200"
                          >
                            <FaTimes className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                        </div>
                        {error && (
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-[#E74C3C] text-xs sm:text-sm mb-4"
                          >
                            {error}
                          </motion.p>
                        )}
                        <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm">
                          <p>
                            <span className="font-semibold text-[#093A5D]">Cours:</span>{' '}
                            {modal.data?.cours
                              ? `${modal.data.cours.matiere?.nom || 'N/A'} - ${modal.data.cours.salle?.nom || 'N/A'} (${modal.data.cours.semestre?.libelle || 'N/A'}, ${modal.data.cours.anneeAcademique?.annee || 'N/A'})`
                              : 'Cours non trouvé'}
                          </p>
                          <p>
                            <span className="font-semibold text-[#093A5D]">Enseignant:</span>{' '}
                            {(modal.data?.enseignant?.utilisateur?.nom || '') + ' ' + (modal.data?.enseignant?.utilisateur?.prenom || 'N/A')}
                          </p>
                          <p>
                            <span className="font-semibold text-[#093A5D]">Date:</span>{' '}
                            {modal.data?.created_at
                              ? new Date(modal.data.created_at).toLocaleDateString('fr-FR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : 'N/A'}
                          </p>
                          <p>
                            <span className="font-semibold text-[#093A5D]">État:</span> {modal.data?.etat || 'N/A'}
                          </p>
                          <p>
                            <span className="font-semibold text-[#093A5D]">Étudiants:</span>{' '}
                            {modal.data?.etudiants?.length
                              ? modal.data.etudiants.map((etudiant) => `${etudiant.utilisateur?.nom || 'N/A'} (${etudiant.present ? 'Présent' : 'Absent'})`).join(', ')
                              : 'Aucune donnée sur les étudiants'}
                          </p>
                        </div>
                        <div className="flex justify-end mt-4 sm:mt-6">
                          <button
                            onClick={closeModal}
                            className="bg-gray-200 text-[#093A5D]/90 p-2 sm:p-3 rounded-lg hover:bg-gray-300 hover:scale-105 transition-all duration-200 text-xs sm:text-sm"
                          >
                            Fermer
                          </button>
                        </div>
                      </>
                    )}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
};

export default Appel_RA;