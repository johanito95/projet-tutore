import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaEye, FaUserPlus, FaChalkboardTeacher, FaSearch, FaArrowLeft, FaArrowRight, FaTimes } from 'react-icons/fa';
import Sidebar_RA from '../pages/Sidebar_RA';
import Topbar from '../pages/Topbar';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const MesClasses = () => {
  const [salles, setSalles] = useState([]);
  const [filieres, setFilieres] = useState([]);
  const [etudiants, setEtudiants] = useState([]);
  const [enseignants, setEnseignants] = useState([]);
  const [annees, setAnnees] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [user, setUser] = useState(null);
  const [salleForm, setSalleForm] = useState({ nom: '', capacite: '', filiere_id: '' });
  const [affectationForm, setAffectationForm] = useState({ etudiant_id: '', enseignant_id: '', annee_academique_id: '' });
  const [editSalleId, setEditSalleId] = useState(null);
  const [modal, setModal] = useState({ isOpen: false, type: '', data: null, salleId: null });
  const [loading, setLoading] = useState({ salles: true, filieres: true, etudiants: true, enseignants: true, annees: true, user: true, notifications: true });
  const [error, setError] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('nom');
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
      setLoading({ salles: false, filieres: false, etudiants: false, enseignants: false, annees: false, user: false, notifications: false });
      return;
    }

    const fetchData = async () => {
      try {
        const [userResponse, filieresResponse, sallesResponse, etudiantsResponse, enseignantsResponse, anneesResponse, notificationsResponse] = await Promise.all([
          axios.get('http://127.0.0.1:8000/api/infos', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://127.0.0.1:8000/api/showfiliere', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://127.0.0.1:8000/api/showclasse', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://127.0.0.1:8000/api/etudiants', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://127.0.0.1:8000/api/enseignants', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://127.0.0.1:8000/api/showyearschool', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://127.0.0.1:8000/api/notifications', { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        setUser(userResponse.data);
        setFilieres(Array.isArray(filieresResponse.data) ? filieresResponse.data : []);
        setSalles(Array.isArray(sallesResponse.data) ? sallesResponse.data.map(salle => ({
          ...salle,
          etudiants: salle.etudiants || [],
          enseignants: salle.enseignants || [],
        })) : []);
        setEtudiants(Array.isArray(etudiantsResponse.data) ? etudiantsResponse.data : []);
        setEnseignants(Array.isArray(enseignantsResponse.data) ? enseignantsResponse.data : []);
        // Extraire le tableau 'data' de la réponse paginée pour les années académiques
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
        setLoading({ salles: false, filieres: false, etudiants: false, enseignants: false, annees: false, user: false, notifications: false });
      }
    };

    fetchData();
  }, []);

  const openModal = (type, data = null, salleId = null) => {
    if (type === 'salle' && data) {
      setSalleForm({ nom: data.nom || '', capacite: data.capacite || '', filiere_id: data.filiere_id || '' });
      setEditSalleId(data.id);
    } else if (type.includes('affecter')) {
      setAffectationForm({ etudiant_id: '', enseignant_id: '', annee_academique_id: '' });
    } else {
      setSalleForm({ nom: '', capacite: '', filiere_id: '' });
      setEditSalleId(null);
    }
    setModal({ isOpen: true, type, data, salleId });
    setError('');
  };

  const closeModal = () => {
    setModal({ isOpen: false, type: '', data: null, salleId: null });
    setSalleForm({ nom: '', capacite: '', filiere_id: '' });
    setAffectationForm({ etudiant_id: '', enseignant_id: '', annee_academique_id: '' });
    setEditSalleId(null);
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

  const handleSalleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token || !user?.id) {
      toast.error('Utilisateur non authentifié', {
        position: 'top-right',
        autoClose: 3000,
        style: { backgroundColor: '#E74C3C', color: '#FFFFFF', fontSize: '0.875rem' },
      });
      return;
    }

    const formData = { ...salleForm, responsable_id: user.id };

    try {
      let response;
      if (editSalleId) {
        response = await axios.put(`http://127.0.0.1:8000/api/updateclasse/${editSalleId}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSalles(salles.map((s) => (s.id === editSalleId ? { ...response.data.salle, etudiants: s.etudiants, enseignants: s.enseignants } : s)));
        toast.success(`Classe ${formData.nom} mise à jour`, {
          position: 'top-right',
          autoClose: 3000,
          style: { backgroundColor: '#27AE60', color: '#FFFFFF', fontSize: '0.875rem' },
        });
        await sendNotification(`Classe ${formData.nom} mise à jour`, token);
      } else {
        response = await axios.post('http://127.0.0.1:8000/api/createclasse', formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSalles([...salles, { ...response.data.salle, etudiants: [], enseignants: [] }]);
        toast.success(`Classe ${formData.nom} créée`, {
          position: 'top-right',
          autoClose: 3000,
          style: { backgroundColor: '#27AE60', color: '#FFFFFF', fontSize: '0.875rem' },
        });
        await sendNotification(`Classe ${formData.nom} créée`, token);
      }
      closeModal();
    } catch (err) {
      const errorMsg = err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat().join(', ')
        : err.response?.data?.message || 'Erreur lors de la soumission';
      setError(errorMsg);
      toast.error(errorMsg, {
        position: 'top-right',
        autoClose: 3000,
        style: { backgroundColor: '#E74C3C', color: '#FFFFFF', fontSize: '0.875rem' },
      });
    }
  };

  const handleDeleteSalle = async () => {
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
      await axios.delete(`http://127.0.0.1:8000/api/deleteclasse/${modal.data?.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSalles(salles.filter((s) => s.id !== modal.data?.id));
      toast.success(`Classe ${modal.data?.nom} supprimée`, {
        position: 'top-right',
        autoClose: 3000,
        style: { backgroundColor: '#27AE60', color: '#FFFFFF', fontSize: '0.875rem' },
      });
      await sendNotification(`Classe ${modal.data?.nom} supprimée`, token);
      closeModal();
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Erreur lors de la suppression';
      setError(errorMsg);
      toast.error(errorMsg, {
        position: 'top-right',
        autoClose: 3000,
        style: { backgroundColor: '#E74C3C', color: '#FFFFFF', fontSize: '0.875rem' },
      });
    }
  };

  const handleAffectationSubmit = async (e) => {
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

    const { type, salleId } = modal;
    const url = type === 'affecter-etudiant'
      ? `http://127.0.0.1:8000/api/salles-de-classe/${salleId}/affecter-etudiant`
      : `http://127.0.0.1:8000/api/salles-de-classe/${salleId}/affecter-enseignant`;

    try {
      const response = await axios.post(url, affectationForm, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const updatedSalles = salles.map((salle) => {
        if (salle.id === salleId) {
          if (type === 'affecter-etudiant') {
            const etudiant = etudiants.find((e) => e.id === parseInt(affectationForm.etudiant_id));
            return { ...salle, etudiants: [...(salle.etudiants || []), etudiant] };
          } else {
            const enseignant = enseignants.find((e) => e.id === parseInt(affectationForm.enseignant_id));
            return { ...salle, enseignants: [...(salle.enseignants || []), enseignant] };
          }
        }
        return salle;
      });

      setSalles(updatedSalles);
      toast.success(response.data.message, {
        position: 'top-right',
        autoClose: 3000,
        style: { backgroundColor: '#27AE60', color: '#FFFFFF', fontSize: '0.875rem' },
      });
      await sendNotification(response.data.message, token);
      closeModal();
    } catch (err) {
      const errorMsg = err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat().join(', ')
        : err.response?.data?.message || 'Erreur lors de l’affectation';
      setError(errorMsg);
      toast.error(errorMsg, {
        position: 'top-right',
        autoClose: 3000,
        style: { backgroundColor: '#E74C3C', color: '#FFFFFF', fontSize: '0.875rem' },
      });
    }
  };

  const filteredSalles = salles.filter((salle) =>
    (salle.nom?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  const sortedSalles = [...filteredSalles].sort((a, b) => {
    let valA = sortBy === 'filiere' ? (a.filiere?.nom || '') : (a[sortBy] || '');
    let valB = sortBy === 'filiere' ? (b.filiere?.nom || '') : (b[sortBy] || '');
    if (typeof valA === 'string' && typeof valB === 'string') {
      valA = valA.toLowerCase();
      valB = valB.toLowerCase();
    }
    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const paginatedSalles = sortedSalles.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const totalPages = Math.ceil(filteredSalles.length / itemsPerPage);

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
          .classe-card {
            transition: all 0.3s ease;
          }
          .classe-card:hover {
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
            .classe-card {
              padding: 1rem;
            }
            .modal {
              max-width: 95vw;
              padding: 1rem;
            }
            .modal h3 {
              font-size: 1rem;
            }
            .modal p, .modal input, .modal select, .modal button {
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
            .classe-card {
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
              <FaChalkboardTeacher className="w-5 h-5 sm:w-6 sm:h-6" /> Mes Classes
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
              className="bg-white/95 backdrop-blur-md rounded-xl shadow-xl p-4 sm:p-6 classe-card max-w-4xl xl:max-w-5xl mx-auto"
            >
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <FaChalkboardTeacher className="text-[#093A5D] w-5 h-5 sm:w-6 sm:h-6" />
                  <h2 className="text-lg sm:text-xl font-semibold text-[#093A5D]">Gestion des Classes</h2>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <div className="relative w-full sm:w-64">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#093A5D]/50 w-4 h-4 sm:w-5 sm:h-5" />
                    <input
                      type="text"
                      placeholder="Rechercher par nom..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setPage(1);
                      }}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#F49100] focus:border-transparent transition-all"
                    />
                  </div>
                  <button
                    onClick={() => openModal('salle')}
                    className="bg-[#F49100] text-white p-2 sm:p-2.5 rounded-lg flex items-center gap-2 hover:bg-[#e07b00] hover:scale-105 transition-all duration-200 w-full sm:w-auto"
                  >
                    <FaPlus className="w-4 h-4" /> Ajouter
                  </button>
                </div>
              </div>
              {loading.salles ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-10 sm:h-12 bg-gray-200 rounded-lg"></div>
                  <div className="h-10 sm:h-12 bg-gray-200 rounded-lg"></div>
                </div>
              ) : paginatedSalles.length ? (
                <>
                  <div className="table-container overflow-x-auto">
                    <table className="w-full text-xs sm:text-sm">
                      <thead>
                        <tr className="bg-[#093A5D]/10">
                          <th className="p-2 sm:p-3 text-left">
                            <button onClick={() => toggleSort('nom')} className="flex items-center gap-2">
                              Nom {sortBy === 'nom' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </button>
                          </th>
                          <th className="p-2 sm:p-3 text-left hidden sm:table-cell">
                            <button onClick={() => toggleSort('capacite')} className="flex items-center gap-2">
                              Capacité {sortBy === 'capacite' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </button>
                          </th>
                          <th className="p-2 sm:p-3 text-left hidden md:table-cell">
                            <button onClick={() => toggleSort('filiere')} className="flex items-center gap-2">
                              Filière {sortBy === 'filiere' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </button>
                          </th>
                          <th className="p-2 sm:p-3 text-left hidden lg:table-cell">Étudiants</th>
                          <th className="p-2 sm:p-3 text-left hidden xl:table-cell">Enseignants</th>
                          <th className="p-2 sm:p-3 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedSalles.map((salle) => (
                          <motion.tr
                            key={salle.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.15 }}
                            className="border-b border-gray-200 hover:bg-[#093A5D]/5"
                          >
                            <td className="p-2 sm:p-3">{salle.nom}</td>
                            <td className="p-2 sm:p-3 hidden sm:table-cell">{salle.capacite || 'N/A'}</td>
                            <td className="p-2 sm:p-3 hidden md:table-cell">{salle.filiere?.nom || 'N/A'}</td>
                            <td className="p-2 sm:p-3 hidden lg:table-cell">{salle.etudiants?.length || 0} étudiant(s)</td>
                            <td className="p-2 sm:p-3 hidden xl:table-cell">{salle.enseignants?.length || 0} enseignant(s)</td>
                            <td className="p-2 sm:p-3 flex gap-2 sm:gap-3 flex-wrap">
                              <button
                                onClick={() => openModal('details', salle, salle.id)}
                                className="text-[#27AE60] hover:text-green-700 hover:scale-110 transition-all duration-200"
                                title="Voir détails"
                              >
                                <FaEye className="w-4 h-4 sm:w-5 sm:h-5" />
                              </button>
                              <button
                                onClick={() => openModal('salle', salle)}
                                className="text-[#093A5D] hover:text-[#F49100] hover:scale-110 transition-all duration-200"
                                title="Modifier"
                              >
                                <FaEdit className="w-4 h-4 sm:w-5 sm:h-5" />
                              </button>
                              <button
                                onClick={() => openModal('deleteSalle', salle)}
                                className="text-[#E74C3C] hover:text-red-700 hover:scale-110 transition-all duration-200"
                                title="Supprimer"
                              >
                                <FaTrash className="w-4 h-4 sm:w-5 sm:h-5" />
                              </button>
                              <button
                                onClick={() => openModal('affecter-etudiant', salle, salle.id)}
                                className="text-[#093A5D] hover:text-[#F49100] hover:scale-110 transition-all duration-200"
                                title="Affecter étudiant"
                              >
                                <FaUserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                              </button>
                              <button
                                onClick={() => openModal('affecter-enseignant', salle, salle.id)}
                                className="text-[#093A5D] hover:text-[#F49100] hover:scale-110 transition-all duration-200"
                                title="Affecter enseignant"
                              >
                                <FaChalkboardTeacher className="w-4 h-4 sm:w-5 sm:h-5" />
                              </button>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="card-container">
                    {paginatedSalles.map((salle) => (
                      <motion.div
                        key={salle.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.15 }}
                        className="bg-white/90 rounded-lg p-4 shadow-md border border-gray-200"
                      >
                        <div className="flex flex-col gap-2">
                          <div>
                            <span className="font-semibold text-[#093A5D] text-xs">Nom:</span> {salle.nom}
                          </div>
                          <div>
                            <span className="font-semibold text-[#093A5D] text-xs">Capacité:</span> {salle.capacite || 'N/A'}
                          </div>
                          <div>
                            <span className="font-semibold text-[#093A5D] text-xs">Filière:</span> {salle.filiere?.nom || 'N/A'}
                          </div>
                          <div>
                            <span className="font-semibold text-[#093A5D] text-xs">Étudiants:</span> {salle.etudiants?.length || 0}
                          </div>
                          <div>
                            <span className="font-semibold text-[#093A5D] text-xs">Enseignants:</span> {salle.enseignants?.length || 0}
                          </div>
                          <div className="flex gap-3 mt-2 flex-wrap">
                            <button
                              onClick={() => openModal('details', salle, salle.id)}
                              className="text-[#27AE60] hover:text-green-700 hover:scale-110 transition-all duration-200"
                              title="Voir détails"
                            >
                              <FaEye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openModal('salle', salle)}
                              className="text-[#093A5D] hover:text-[#F49100] hover:scale-110 transition-all duration-200"
                              title="Modifier"
                            >
                              <FaEdit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openModal('deleteSalle', salle)}
                              className="text-[#E74C3C] hover:text-red-700 hover:scale-110 transition-all duration-200"
                              title="Supprimer"
                            >
                              <FaTrash className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openModal('affecter-etudiant', salle, salle.id)}
                              className="text-[#093A5D] hover:text-[#F49100] hover:scale-110 transition-all duration-200"
                              title="Affecter étudiant"
                            >
                              <FaUserPlus className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openModal('affecter-enseignant', salle, salle.id)}
                              className="text-[#093A5D] hover:text-[#F49100] hover:scale-110 transition-all duration-200"
                              title="Affecter enseignant"
                            >
                              <FaChalkboardTeacher className="w-4 h-4" />
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
                <p className="text-xs sm:text-sm text-[#093A5D]/70 text-center">Aucune classe disponible.</p>
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
                    {modal.type === 'salle' && (
                      <>
                        <div className="flex justify-between items-center mb-4 sm:mb-6">
                          <h3 className="text-base sm:text-xl font-semibold text-[#093A5D]">
                            {editSalleId ? 'Modifier Classe' : 'Ajouter Classe'}
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
                        <form onSubmit={handleSalleSubmit} className="space-y-3 sm:space-y-4">
                          <input
                            type="text"
                            placeholder="Nom (ex. Salle 101)"
                            value={salleForm.nom}
                            onChange={(e) => setSalleForm({ ...salleForm, nom: e.target.value })}
                            className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#F49100] focus:border-transparent transition-all"
                            required
                          />
                          <input
                            type="number"
                            placeholder="Capacité (ex. 50)"
                            value={salleForm.capacite}
                            onChange={(e) => setSalleForm({ ...salleForm, capacite: e.target.value })}
                            className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#F49100] focus:border-transparent transition-all"
                            min="1"
                            required
                          />
                          <select
                            value={salleForm.filiere_id}
                            onChange={(e) => setSalleForm({ ...salleForm, filiere_id: e.target.value })}
                            className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#F49100] focus:border-transparent transition-all"
                            required
                          >
                            <option value="">Sélectionner une filière</option>
                            {filieres.map((filiere) => (
                              <option key={filiere.id} value={filiere.id}>{filiere.nom}</option>
                            ))}
                          </select>
                          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                            <button
                              type="submit"
                              className="bg-[#F49100] text-white p-2 sm:p-3 rounded-lg flex-1 hover:bg-[#e07b00] hover:scale-105 transition-all duration-200 text-xs sm:text-sm"
                            >
                              {editSalleId ? 'Modifier' : 'Ajouter'}
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
                    {modal.type === 'details' && (
                      <>
                        <div className="flex justify-between items-center mb-4 sm:mb-6">
                          <h3 className="text-base sm:text-xl font-semibold text-[#093A5D]">Détails de la Classe</h3>
                          <button
                            onClick={closeModal}
                            className="text-[#093A5D]/60 hover:text-[#E74C3C] hover:rotate-90 transition-all duration-200"
                          >
                            <FaTimes className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                        </div>
                        <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm text-[#093A5D]">
                          <p><strong>Nom :</strong> {modal.data?.nom || 'N/A'}</p>
                          <p><strong>Capacité :</strong> {modal.data?.capacite || 'N/A'}</p>
                          <p><strong>Filière :</strong> {modal.data?.filiere?.nom || 'N/A'}</p>
                          <p>
                            <strong>Responsable :</strong>{' '}
                            {(modal.data?.responsable?.enseignant?.utilisateur?.nom || '') + ' ' +
                              (modal.data?.responsable?.enseignant?.utilisateur?.prenom || 'N/A')}
                          </p>
                          <p><strong>Étudiants :</strong> {modal.data?.etudiants?.length ? modal.data.etudiants.map(e => `${e.utilisateur?.nom} ${e.utilisateur?.prenom}`).join(', ') : 'Aucun'}</p>
                          <p><strong>Enseignants :</strong> {modal.data?.enseignants?.length ? modal.data.enseignants.map(e => `${e.utilisateur?.nom} ${e.utilisateur?.prenom}`).join(', ') : 'Aucun'}</p>
                        </div>
                        <button
                          onClick={closeModal}
                          className="mt-4 sm:mt-6 bg-gray-200 text-[#093A5D]/90 p-2 sm:p-3 rounded-lg w-full hover:bg-gray-300 hover:scale-105 transition-all duration-200 text-xs sm:text-sm"
                        >
                          Fermer
                        </button>
                      </>
                    )}
                    {modal.type === 'deleteSalle' && (
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
                          Voulez-vous vraiment supprimer la classe <strong>{modal.data?.nom || ''}</strong> ?
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                          <button
                            onClick={handleDeleteSalle}
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
                    {modal.type === 'affecter-etudiant' && (
                      <>
                        <div className="flex justify-between items-center mb-4 sm:mb-6">
                          <h3 className="text-base sm:text-xl font-semibold text-[#093A5D]">
                            Affecter un Étudiant
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
                        <form onSubmit={handleAffectationSubmit} className="space-y-3 sm:space-y-4">
                          <select
                            value={affectationForm.etudiant_id}
                            onChange={(e) => setAffectationForm({ ...affectationForm, etudiant_id: e.target.value })}
                            className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#F49100] focus:border-transparent transition-all"
                            required
                          >
                            <option value="">Sélectionner un étudiant</option>
                            {etudiants.map((etudiant) => (
                              <option key={etudiant.id} value={etudiant.id}>
                                {etudiant.utilisateur?.nom} {etudiant.utilisateur?.prenom}
                              </option>
                            ))}
                          </select>
                          <select
                            value={affectationForm.annee_academique_id}
                            onChange={(e) => setAffectationForm({ ...affectationForm, annee_academique_id: e.target.value })}
                            className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#F49100] focus:border-transparent transition-all"
                            required
                          >
                            <option value="">Sélectionner une année académique</option>
                            {annees.map((annee) => (
                              <option key={annee.id} value={annee.id}>{annee.annee}</option>
                            ))}
                          </select>
                          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                            <button
                              type="submit"
                              className="bg-[#F49100] text-white p-2 sm:p-3 rounded-lg flex-1 hover:bg-[#e07b00] hover:scale-105 transition-all duration-200 text-xs sm:text-sm"
                            >
                              Affecter
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
                    {modal.type === 'affecter-enseignant' && (
                      <>
                        <div className="flex justify-between items-center mb-4 sm:mb-6">
                          <h3 className="text-base sm:text-xl font-semibold text-[#093A5D]">
                            Affecter un Enseignant
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
                        <form onSubmit={handleAffectationSubmit} className="space-y-3 sm:space-y-4">
                          <select
                            value={affectationForm.enseignant_id}
                            onChange={(e) => setAffectationForm({ ...affectationForm, enseignant_id: e.target.value })}
                            className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#F49100] focus:border-transparent transition-all"
                            required
                          >
                            <option value="">Sélectionner un enseignant</option>
                            {enseignants.map((enseignant) => (
                              <option key={enseignant.id} value={enseignant.id}>
                                {enseignant.utilisateur?.nom} {enseignant.utilisateur?.prenom}
                              </option>
                            ))}
                          </select>
                          <select
                            value={affectationForm.annee_academique_id}
                            onChange={(e) => setAffectationForm({ ...affectationForm, annee_academique_id: e.target.value })}
                            className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#F49100] focus:border-transparent transition-all"
                            required
                          >
                            <option value="">Sélectionner une année académique</option>
                            {annees.map((annee) => (
                              <option key={annee.id} value={annee.id}>{annee.annee}</option>
                            ))}
                          </select>
                          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                            <button
                              type="submit"
                              className="bg-[#F49100] text-white p-2 sm:p-3 rounded-lg flex-1 hover:bg-[#e07b00] hover:scale-105 transition-all duration-200 text-xs sm:text-sm"
                            >
                              Affecter
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

export default MesClasses;