import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaSearch, FaArrowLeft, FaArrowRight, FaBook } from 'react-icons/fa';
import Sidebar_RA from '../pages/Sidebar_RA';
import Topbar from '../pages/Topbar';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const Classe_RA = () => {
  const [cours, setCours] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [enseignants, setEnseignants] = useState([]);
  const [salles, setSalles] = useState([]);
  const [semestres, setSemestres] = useState([]);
  const [annees, setAnnees] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [coursForm, setCoursForm] = useState({ matiere_id: '', enseignant_id: '', salle_id: '', semestre_id: '', annee_academique_id: '' });
  const [editCoursId, setEditCoursId] = useState(null);
  const [loading, setLoading] = useState({ cours: true, matieres: true, enseignants: true, salles: true, semestres: true, annees: true, notifications: true });
  const [error, setError] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, type: '', data: null });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('matiere');
  const [sortOrder, setSortOrder] = useState('asc');
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Utilisateur non authentifié', {
        position: 'top-right',
        autoClose: 3000,
        style: { backgroundColor: '#E74C3C', color: '#FFFFFF', fontSize: '0.875rem' },
      });
      setLoading({ cours: false, matieres: false, enseignants: false, salles: false, semestres: false, annees: false, notifications: false });
      return;
    }

    const fetchData = async () => {
      try {
        const [coursResponse, matieresResponse, enseignantsResponse, sallesResponse, semestresResponse, anneesResponse, notificationsResponse] = await Promise.all([
          axios.get('http://127.0.0.1:8000/api/cours', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://127.0.0.1:8000/api/showmatiere', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://127.0.0.1:8000/api/enseignants', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://127.0.0.1:8000/api/showclasse', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://127.0.0.1:8000/api/showsemestre', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://127.0.0.1:8000/api/showyearschool', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://127.0.0.1:8000/api/notifications', { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        setCours(Array.isArray(coursResponse.data) ? coursResponse.data : []);
        setMatieres(Array.isArray(matieresResponse.data) ? matieresResponse.data : []);
        setEnseignants(Array.isArray(enseignantsResponse.data) ? enseignantsResponse.data : []);
        setSalles(Array.isArray(sallesResponse.data) ? sallesResponse.data : []);
        setSemestres(Array.isArray(semestresResponse.data.data) ? semestresResponse.data.data : []);
        setAnnees(Array.isArray(anneesResponse.data.data) ? anneesResponse.data.data : []);
        setNotifications(Array.isArray(notificationsResponse.data) ? notificationsResponse.data : []);
      } catch (err) {
        setError('Erreur lors du chargement des données');
        console.error('Fetch error:', err);
        toast.error('Erreur lors du chargement des données', {
          position: 'top-right',
          autoClose: 3000,
          style: { backgroundColor: '#E74C3C', color: '#FFFFFF', fontSize: '0.875rem' },
        });
      } finally {
        setLoading({ cours: false, matieres: false, enseignants: false, salles: false, semestres: false, annees: false, notifications: false });
      }
    };

    fetchData();
  }, []);

  // Automatically set annee_academique_id when matiere_id changes
  useEffect(() => {
    if (coursForm.matiere_id) {
      const selectedMatiere = matieres.find((m) => m.id === parseInt(coursForm.matiere_id));
      if (selectedMatiere && selectedMatiere.uniteEnseignement?.annee_academique_id) {
        setCoursForm((prev) => ({ ...prev, annee_academique_id: selectedMatiere.uniteEnseignement.annee_academique_id }));
      } else {
        setCoursForm((prev) => ({ ...prev, annee_academique_id: '' }));
      }
    }
  }, [coursForm.matiere_id, matieres]);

  const openModal = (type, data = null) => {
    if (type === 'cours' && data) {
      setCoursForm({
        matiere_id: data.matiere_id || '',
        enseignant_id: data.enseignant_id || '',
        salle_id: data.salle_id || '',
        semestre_id: data.semestre_id || '',
        annee_academique_id: data.annee_academique_id || '',
      });
      setEditCoursId(data.id);
    } else {
      setCoursForm({ matiere_id: '', enseignant_id: '', salle_id: '', semestre_id: '', annee_academique_id: '' });
      setEditCoursId(null);
    }
    setModal({ isOpen: true, type, data });
    setError('');
  };

  const closeModal = () => {
    setModal({ isOpen: false, type: '', data: null });
    setCoursForm({ matiere_id: '', enseignant_id: '', salle_id: '', semestre_id: '', annee_academique_id: '' });
    setEditCoursId(null);
    setError('');
  };

  const sendNotification = async (message, token) => {
    try {
      const response = await axios.post(
        'http://127.0.0.1:8000/api/notifications',
        { message, is_read: false },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications((prev) => [...prev, response.data]);
    } catch (err) {
      console.error('Notification send error:', err);
      toast.error('Erreur lors de l’envoi de la notification', {
        position: 'top-right',
        autoClose: 3000,
        style: { backgroundColor: '#E74C3C', color: '#FFFFFF', fontSize: '0.875rem' },
      });
    }
  };

  const handleCoursSubmit = async (e) => {
    e.preventDefault();
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
      let response;
      if (editCoursId) {
        response = await axios.put(`http://127.0.0.1:8000/api/cours/${editCoursId}`, coursForm, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCours(cours.map((c) => (c.id === editCoursId ? response.data.cours : c)));
        toast.success(`Cours mis à jour`, {
          position: 'top-right',
          autoClose: 3000,
          style: { backgroundColor: '#27AE60', color: '#FFFFFF', fontSize: '0.875rem' },
        });
        await sendNotification(`Cours mis à jour`, token);
      } else {
        response = await axios.post('http://127.0.0.1:8000/api/cours', coursForm, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCours([...cours, response.data.cours]);
        toast.success(`Cours créé`, {
          position: 'top-right',
          autoClose: 3000,
          style: { backgroundColor: '#27AE60', color: '#FFFFFF', fontSize: '0.875rem' },
        });
        await sendNotification(`Cours créé`, token);
      }
      closeModal();
    } catch (err) {
      const errorMsg = err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat().join(', ')
        : 'Erreur lors de la soumission';
      setError(errorMsg);
      toast.error(errorMsg, {
        position: 'top-right',
        autoClose: 3000,
        style: { backgroundColor: '#E74C3C', color: '#FFFFFF', fontSize: '0.875rem' },
      });
      console.error('Submit cours error:', err);
    }
  };

  const handleDeleteCours = async (id, nomMatiere) => {
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
      await axios.delete(`http://127.0.0.1:8000/api/cours/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCours(cours.filter((c) => c.id !== id));
      toast.success(`Cours ${nomMatiere} supprimé`, {
        position: 'top-right',
        autoClose: 3000,
        style: { backgroundColor: '#27AE60', color: '#FFFFFF', fontSize: '0.875rem' },
      });
      await sendNotification(`Cours ${nomMatiere} supprimé`, token);
      closeModal();
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Erreur lors de la suppression';
      setError(errorMsg);
      toast.error(errorMsg, {
        position: 'top-right',
        autoClose: 3000,
        style: { backgroundColor: '#E74C3C', color: '#FFFFFF', fontSize: '0.875rem' },
      });
      console.error('Delete cours error:', err);
    }
  };

  const filteredCours = cours.filter((c) =>
    (c.matiere?.nom?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  const sortedCours = [...filteredCours].sort((a, b) => {
    let valA = sortBy === 'matiere' ? (a.matiere?.nom || '') : sortBy === 'enseignant' ? (a.enseignant?.utilisateur?.nom || '') : (a[sortBy] || '');
    let valB = sortBy === 'matiere' ? (b.matiere?.nom || '') : sortBy === 'enseignant' ? (b.enseignant?.utilisateur?.nom || '') : (b[sortBy] || '');
    if (typeof valA === 'string' && typeof valB === 'string') {
      valA = valA.toLowerCase();
      valB = valB.toLowerCase();
    }
    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const paginatedCours = sortedCours.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const totalPages = Math.ceil(filteredCours.length / itemsPerPage);

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return (
    <>
      <style>
        {`
          .cours-card {
            transition: all 0.3s ease;
          }
          .cours-card:hover {
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
            .cours-card {
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
            .cours-card {
              max-width: 80rem;
            }
          }
        `}
      </style>
      <div className="flex min-h-screen bg-gradient-to-b from-[#F7F9FC] to-[#E5E9F0] font-poppins">
        <Sidebar_RA isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <div className="flex-1 flex flex-col pt-16">
          <Topbar notifications={notifications} setNotifications={setNotifications} />
          <div className="flex-1 p-4 sm:p-6 md:p-8">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
              className="text-xl sm:text-2xl font-bold text-[#093A5D] mb-6 sm:mb-8 flex items-center gap-3"
            >
              <FaBook className="w-5 h-5 sm:w-6 sm:h-6" /> Gestion des Cours
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
              className="bg-white/95 backdrop-blur-md rounded-xl shadow-xl p-4 sm:p-6 cours-card max-w-4xl xl:max-w-5xl mx-auto"
            >
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <FaBook className="text-[#093A5D] w-5 h-5 sm:w-6 sm:h-6" />
                  <h2 className="text-lg sm:text-xl font-semibold text-[#093A5D]">Liste des Cours</h2>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <div className="relative w-full sm:w-64">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#093A5D]/50 w-4 h-4 sm:w-5 sm:h-5" />
                    <input
                      type="text"
                      placeholder="Rechercher par matière..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setPage(1);
                      }}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#F49100] focus:border-transparent transition-all"
                    />
                  </div>
                  <button
                    onClick={() => openModal('cours')}
                    className="bg-[#F49100] text-white p-2 sm:p-2.5 rounded-lg flex items-center gap-2 hover:bg-[#e07b00] hover:scale-105 transition-all duration-200 w-full sm:w-auto"
                  >
                    <FaPlus className="w-4 h-4" /> Ajouter
                  </button>
                </div>
              </div>
              {loading.cours ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-10 sm:h-12 bg-gray-200 rounded-lg"></div>
                  <div className="h-10 sm:h-12 bg-gray-200 rounded-lg"></div>
                </div>
              ) : paginatedCours.length ? (
                <>
                  <div className="table-container overflow-x-auto">
                    <table className="w-full text-xs sm:text-sm">
                      <thead>
                        <tr className="bg-[#093A5D]/10">
                          <th className="p-2 sm:p-3 text-left">
                            <button onClick={() => toggleSort('matiere')} className="flex items-center gap-2">
                              Matière {sortBy === 'matiere' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </button>
                          </th>
                          <th className="p-2 sm:p-3 text-left hidden sm:table-cell">
                            <button onClick={() => toggleSort('enseignant')} className="flex items-center gap-2">
                              Enseignant {sortBy === 'enseignant' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </button>
                          </th>
                          <th className="p-2 sm:p-3 text-left hidden md:table-cell">Salle</th>
                          <th className="p-2 sm:p-3 text-left hidden lg:table-cell">Semestre</th>
                          <th className="p-2 sm:p-3 text-left hidden xl:table-cell">Année</th>
                          <th className="p-2 sm:p-3 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedCours.map((cours) => (
                          <motion.tr
                            key={cours.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.15 }}
                            className="border-b border-gray-200 hover:bg-[#093A5D]/5"
                          >
                            <td className="p-2 sm:p-3">{cours.matiere?.nom || 'N/A'}</td>
                            <td className="p-2 sm:p-3 hidden sm:table-cell">
                              {(cours.enseignant?.utilisateur?.nom || '') + ' ' + (cours.enseignant?.utilisateur?.prenom || 'N/A')}
                            </td>
                            <td className="p-2 sm:p-3 hidden md:table-cell">{cours.salle?.nom || 'N/A'}</td>
                            <td className="p-2 sm:p-3 hidden lg:table-cell">{cours.semestre?.libelle || 'N/A'}</td>
                            <td className="p-2 sm:p-3 hidden xl:table-cell">{cours.anneeAcademique?.annee || 'N/A'}</td>
                            <td className="p-2 sm:p-3 flex gap-2 sm:gap-3">
                              <button
                                onClick={() => openModal('cours', cours)}
                                className="text-[#093A5D] hover:text-[#F49100] hover:scale-110 transition-all duration-200"
                              >
                                <FaEdit className="w-4 h-4 sm:w-5 sm:h-5" />
                              </button>
                              <button
                                onClick={() => openModal('deleteCours', cours)}
                                className="text-[#E74C3C] hover:text-red-700 hover:scale-110 transition-all duration-200"
                              >
                                <FaTrash className="w-4 h-4 sm:w-5 sm:h-5" />
                              </button>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="card-container">
                    {paginatedCours.map((cours) => (
                      <motion.div
                        key={cours.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.15 }}
                        className="bg-white/90 rounded-lg p-4 shadow-md border border-gray-200"
                      >
                        <div className="flex flex-col gap-2">
                          <div>
                            <span className="font-semibold text-[#093A5D] text-xs">Matière:</span> {cours.matiere?.nom || 'N/A'}
                          </div>
                          <div>
                            <span className="font-semibold text-[#093A5D] text-xs">Enseignant:</span>{' '}
                            {(cours.enseignant?.utilisateur?.nom || '') + ' ' + (cours.enseignant?.utilisateur?.prenom || 'N/A')}
                          </div>
                          <div>
                            <span className="font-semibold text-[#093A5D] text-xs">Salle:</span> {cours.salle?.nom || 'N/A'}
                          </div>
                          <div>
                            <span className="font-semibold text-[#093A5D] text-xs">Semestre:</span> {cours.semestre?.libelle || 'N/A'}
                          </div>
                          <div>
                            <span className="font-semibold text-[#093A5D] text-xs">Année:</span> {cours.anneeAcademique?.annee || 'N/A'}
                          </div>
                          <div className="flex gap-3 mt-2">
                            <button
                              onClick={() => openModal('cours', cours)}
                              className="text-[#093A5D] hover:text-[#F49100] hover:scale-110 transition-all duration-200"
                            >
                              <FaEdit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openModal('deleteCours', cours)}
                              className="text-[#E74C3C] hover:text-red-700 hover:scale-110 transition-all duration-200"
                            >
                              <FaTrash className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  {totalPages > 1 && (
                    <div className="flex justify-between items-center mt-4 sm:mt-6">
                      <button
                        onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                        disabled={page === 1}
                        className="bg-[#F49100] text-white p-2 sm:p-2.5 rounded-lg disabled:bg-gray-300 hover:bg-[#e07b00] transition-all duration-200 flex items-center gap-2"
                      >
                        <FaArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="text-xs sm:text-sm">Précédent</span>
                      </button>
                      <span className="text-xs sm:text-sm text-[#093A5D]">
                        Page {page} / {totalPages}
                      </span>
                      <button
                        onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={page === totalPages}
                        className="bg-[#F49100] text-white p-2 sm:p-2.5 rounded-lg disabled:bg-gray-300 hover:bg-[#e07b00] transition-all duration-200 flex items-center gap-2"
                      >
                        <span className="text-xs sm:text-sm">Suivant</span>
                        <FaArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-xs sm:text-sm text-[#093A5D]/70 text-center">Aucun cours disponible.</p>
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
                    {modal.type === 'cours' && (
                      <>
                        <div className="flex justify-between items-center mb-4 sm:mb-6">
                          <h3 className="text-base sm:text-xl font-semibold text-[#093A5D]">
                            {editCoursId ? 'Modifier Cours' : 'Ajouter Cours'}
                          </h3>
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
                        <form onSubmit={handleCoursSubmit} className="space-y-3 sm:space-y-4">
                          <select
                            value={coursForm.matiere_id}
                            onChange={(e) => setCoursForm({ ...coursForm, matiere_id: e.target.value })}
                            className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#F49100] focus:border-transparent transition-all"
                            required
                          >
                            <option value="">Sélectionner une matière</option>
                            {matieres.map((matiere) => (
                              <option key={matiere.id} value={matiere.id}>{matiere.nom}</option>
                            ))}
                          </select>
                          <select
                            value={coursForm.enseignant_id}
                            onChange={(e) => setCoursForm({ ...coursForm, enseignant_id: e.target.value })}
                            className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#F49100] focus:border-transparent transition-all"
                            required
                          >
                            <option value="">Sélectionner un enseignant</option>
                            {enseignants.map((enseignant) => (
                              <option key={enseignant.id} value={enseignant.id}>
                                {(enseignant.utilisateur?.nom || '') + ' ' + (enseignant.utilisateur?.prenom || 'N/A')}
                              </option>
                            ))}
                          </select>
                          <select
                            value={coursForm.salle_id}
                            onChange={(e) => setCoursForm({ ...coursForm, salle_id: e.target.value })}
                            className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#F49100] focus:border-transparent transition-all"
                            required
                          >
                            <option value="">Sélectionner une salle</option>
                            {salles.map((salle) => (
                              <option key={salle.id} value={salle.id}>{salle.nom}</option>
                            ))}
                          </select>
                          <select
                            value={coursForm.semestre_id}
                            onChange={(e) => setCoursForm({ ...coursForm, semestre_id: e.target.value })}
                            className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#F49100] focus:border-transparent transition-all"
                            required
                          >
                            <option value="">Sélectionner un semestre</option>
                            {semestres.map((semestre) => (
                              <option key={semestre.id} value={semestre.id}>{semestre.libelle}</option>
                            ))}
                          </select>
                          <select
                            value={coursForm.annee_academique_id}
                            onChange={(e) => setCoursForm({ ...coursForm, annee_academique_id: e.target.value })}
                            className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#F49100] focus:border-transparent transition-all"
                            required
                          >
                            <option value="">Sélectionner une année</option>
                            {annees.map((annee) => (
                              <option key={annee.id} value={annee.id}>{annee.annee}</option>
                            ))}
                          </select>
                          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                            <button
                              type="submit"
                              className="bg-[#F49100] text-white p-2 sm:p-3 rounded-lg flex-1 hover:bg-[#e07b00] hover:scale-105 transition-all duration-200 text-xs sm:text-sm"
                            >
                              {editCoursId ? 'Modifier' : 'Ajouter'}
                            </button>
                            <button
                              type="button"
                              onClick={closeModal}
                              className="bg-gray-200 text-[#093A5D]/90 p-2 sm:p-3 rounded-lg flex-1 hover:bg-gray-300 hover:scale-105 transition-all duration-200 text-xs sm:text-sm"
                            >
                              Annuler
                            </button>
                          </div>
                        </form>
                      </>
                    )}
                    {modal.type === 'deleteCours' && (
                      <>
                        <div className="flex justify-between items-center mb-4 sm:mb-6">
                          <h3 className="text-base sm:text-xl font-semibold text-[#093A5D]">Confirmer la suppression</h3>
                          <button
                            onClick={closeModal}
                            className="text-[#093A5D]/60 hover:text-[#E74C3C] hover:rotate-90 transition-all duration-200"
                          >
                            <FaTimes className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                        </div>
                        <p className="text-xs sm:text-sm text-[#093A5D]/90 mb-4 sm:mb-6">
                          Voulez-vous vraiment supprimer le cours <strong>{modal.data?.matiere?.nom || ''}</strong> ?
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                          <button
                            onClick={() => handleDeleteCours(modal.data?.id, modal.data?.matiere?.nom)}
                            className="bg-[#E74C3C] text-white p-2 sm:p-3 rounded-lg flex-1 hover:bg-red-700 hover:scale-105 transition-all duration-200 text-xs sm:text-sm"
                          >
                            Supprimer
                          </button>
                          <button
                            onClick={closeModal}
                            className="bg-gray-200 text-[#093A5D]/90 p-2 sm:p-3 rounded-lg flex-1 hover:bg-gray-300 hover:scale-105 transition-all duration-200 text-xs sm:text-sm"
                          >
                            Annuler
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

export default Classe_RA;