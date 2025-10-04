import React, { useState, useEffect, useRef } from 'react';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaSearch, FaCalendar } from 'react-icons/fa';
import Sidebar_RA from '../pages/Sidebar_RA';
import Topbar from '../pages/Topbar';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const ConfigAcademique = () => {
  const [annees, setAnnees] = useState([]);
  const [semestres, setSemestres] = useState([]);
  const [anneeForm, setAnneeForm] = useState({ annee: '', date_debut: '', date_fin: '' });
  const [semestreForm, setSemestreForm] = useState({ libelle: '', annee_academique_id: '' });
  const [editAnneeId, setEditAnneeId] = useState(null);
  const [editSemestreId, setEditSemestreId] = useState(null);
  const [loading, setLoading] = useState({ annees: true, semestres: true, user: true });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [modal, setModal] = useState({ isOpen: false, type: '', data: null });
  const [searchAnneeQuery, setSearchAnneeQuery] = useState('');
  const [searchSemestreQuery, setSearchSemestreQuery] = useState('');
  const [sortAnneeBy, setSortAnneeBy] = useState('annee');
  const [sortSemestreBy, setSortSemestreBy] = useState('libelle');
  const [sortAnneeOrder, setSortAnneeOrder] = useState('asc');
  const [sortSemestreOrder, setSortSemestreOrder] = useState('asc');
  const [anneePage, setAnneePage] = useState(1);
  const [semestrePage, setSemestrePage] = useState(1);
  const itemsPerPage = 5;
  const searchAnneeRef = useRef(null);
  const searchSemestreRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Utilisateur non authentifié', {
        position: 'top-right',
        autoClose: 3000,
        style: { backgroundColor: '#E74C3C', color: '#FFFFFF' },
      });
      setLoading({ annees: false, semestres: false, user: false });
      return;
    }

    const fetchData = async () => {
      try {
        const [userResponse, anneesResponse, semestresResponse] = await Promise.all([
          axios.get('http://127.0.0.1:8000/api/infos', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://127.0.0.1:8000/api/showyearschool', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://127.0.0.1:8000/api/showsemestre', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setUser(userResponse.data);
        setAnnees(Array.isArray(anneesResponse.data.data) ? anneesResponse.data.data : anneesResponse.data || []);
        setSemestres(Array.isArray(semestresResponse.data.data) ? semestresResponse.data.data : semestresResponse.data || []);
      } catch (err) {
        console.error('Fetch error:', err);
        toast.error('Erreur lors du chargement des données', {
          position: 'top-right',
          autoClose: 3000,
          style: { backgroundColor: '#E74C3C', color: '#FFFFFF' },
        });
      } finally {
        setLoading({ annees: false, semestres: false, user: false });
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (modal.isOpen) {
      if (modal.type === 'annee' && searchAnneeRef.current) searchAnneeRef.current.focus();
      if (modal.type === 'semestre' && searchSemestreRef.current) searchSemestreRef.current.focus();
    }
  }, [modal.isOpen, modal.type]);

  const openModal = (type, data = null) => {
    if (type === 'annee' && data) {
      setAnneeForm({ annee: data.annee || '', date_debut: data.date_debut || '', date_fin: data.date_fin || '' });
      setEditAnneeId(data.id);
    } else if (type === 'semestre' && data) {
      setSemestreForm({ libelle: data.libelle || '', annee_academique_id: data.annee_academique_id || '' });
      setEditSemestreId(data.id);
    } else {
      setAnneeForm({ annee: '', date_debut: '', date_fin: '' });
      setSemestreForm({ libelle: '', annee_academique_id: '' });
      setEditAnneeId(null);
      setEditSemestreId(null);
    }
    setModal({ isOpen: true, type, data });
  };

  const closeModal = () => {
    setModal({ isOpen: false, type: '', data: null });
    setAnneeForm({ annee: '', date_debut: '', date_fin: '' });
    setSemestreForm({ libelle: '', annee_academique_id: '' });
    setEditAnneeId(null);
    setEditSemestreId(null);
  };

  const handleAnneeSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Utilisateur non authentifié', {
        position: 'top-right',
        autoClose: 3000,
        style: { backgroundColor: '#E74C3C', color: '#FFFFFF' },
      });
      return;
    }
    try {
      let response;
      if (editAnneeId) {
        response = await axios.put(`http://127.0.0.1:8000/api/updateyearschool/${editAnneeId}`, anneeForm, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAnnees(annees.map((a) => (a.id === editAnneeId ? response.data.annee : a)));
        toast.success(`Année ${anneeForm.annee} mise à jour`, {
          position: 'top-right',
          autoClose: 3000,
          style: { backgroundColor: '#27AE60', color: '#FFFFFF' },
        });
      } else {
        response = await axios.post('http://127.0.0.1:8000/api/createyearschool', anneeForm, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAnnees([...annees, response.data.annee]);
        toast.success(`Année ${anneeForm.annee} créée`, {
          position: 'top-right',
          autoClose: 3000,
          style: { backgroundColor: '#27AE60', color: '#FFFFFF' },
        });
      }
      closeModal();
    } catch (err) {
      const errorMsg = err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat().join(', ')
        : 'Erreur lors de la soumission';
      toast.error(errorMsg, {
        position: 'top-right',
        autoClose: 3000,
        style: { backgroundColor: '#E74C3C', color: '#FFFFFF' },
      });
      console.error('Submit year error:', err);
    }
  };

  const handleSemestreSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Utilisateur non authentifié', {
        position: 'top-right',
        autoClose: 3000,
        style: { backgroundColor: '#E74C3C', color: '#FFFFFF' },
      });
      return;
    }
    try {
      let response;
      if (editSemestreId) {
        response = await axios.put(`http://127.0.0.1:8000/api/updatesemestre/${editSemestreId}`, semestreForm, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSemestres(semestres.map((s) => (s.id === editSemestreId ? response.data.semestre : s)));
        toast.success(`Semestre ${semestreForm.libelle} mis à jour`, {
          position: 'top-right',
          autoClose: 3000,
          style: { backgroundColor: '#27AE60', color: '#FFFFFF' },
        });
      } else {
        response = await axios.post('http://127.0.0.1:8000/api/createsemestre', semestreForm, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSemestres([...semestres, response.data.semestre]);
        toast.success(`Semestre ${semestreForm.libelle} créé`, {
          position: 'top-right',
          autoClose: 3000,
          style: { backgroundColor: '#27AE60', color: '#FFFFFF' },
        });
      }
      closeModal();
    } catch (err) {
      const errorMsg = err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat().join(', ')
        : 'Erreur lors de la soumission';
      toast.error(errorMsg, {
        position: 'top-right',
        autoClose: 3000,
        style: { backgroundColor: '#E74C3C', color: '#FFFFFF' },
      });
      console.error('Submit semester error:', err);
    }
  };

  const handleDeleteAnnee = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Utilisateur non authentifié', {
        position: 'top-right',
        autoClose: 3000,
        style: { backgroundColor: '#E74C3C', color: '#FFFFFF' },
      });
      return;
    }
    try {
      await axios.delete(`http://127.0.0.1:8000/api/deleteyearschool/${modal.data?.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAnnees(annees.filter((a) => a.id !== modal.data?.id));
      toast.success('Année académique supprimée', {
        position: 'top-right',
        autoClose: 3000,
        style: { backgroundColor: '#27AE60', color: '#FFFFFF' },
      });
      closeModal();
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Erreur lors de la suppression';
      toast.error(errorMsg, {
        position: 'top-right',
        autoClose: 3000,
        style: { backgroundColor: '#E74C3C', color: '#FFFFFF' },
      });
      console.error('Delete year error:', err);
    }
  };

  const handleDeleteSemestre = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Utilisateur non authentifié', {
        position: 'top-right',
        autoClose: 3000,
        style: { backgroundColor: '#E74C3C', color: '#FFFFFF' },
      });
      return;
    }
    try {
      await axios.delete(`http://127.0.0.1:8000/api/deletesemestre/${modal.data?.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSemestres(semestres.filter((s) => s.id !== modal.data?.id));
      toast.success('Semestre supprimé', {
        position: 'top-right',
        autoClose: 3000,
        style: { backgroundColor: '#27AE60', color: '#FFFFFF' },
      });
      closeModal();
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Erreur lors de la suppression';
      toast.error(errorMsg, {
        position: 'top-right',
        autoClose: 3000,
        style: { backgroundColor: '#E74C3C', color: '#FFFFFF' },
      });
      console.error('Delete semester error:', err);
    }
  };

  const filteredAnnees = annees.filter((annee) =>
    (annee.annee?.toLowerCase() || '').includes(searchAnneeQuery.toLowerCase())
  );

  const filteredSemestres = semestres.filter((semestre) =>
    (semestre.libelle?.toLowerCase() || '').includes(searchSemestreQuery.toLowerCase())
  );

  const sortedAnnees = [...filteredAnnees].sort((a, b) => {
    let valA = a[sortAnneeBy] || '';
    let valB = b[sortAnneeBy] || '';
    if (typeof valA === 'string' && typeof valB === 'string') {
      valA = valA.toLowerCase();
      valB = valB.toLowerCase();
    }
    if (valA < valB) return sortAnneeOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortAnneeOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const sortedSemestres = [...filteredSemestres].sort((a, b) => {
    let valA = sortSemestreBy === 'annee_academique' ? (a.annee_academique?.annee || '') : (a[sortSemestreBy] || '');
    let valB = sortSemestreBy === 'annee_academique' ? (b.annee_academique?.annee || '') : (b[sortSemestreBy] || '');
    if (typeof valA === 'string' && typeof valB === 'string') {
      valA = valA.toLowerCase();
      valB = valB.toLowerCase();
    }
    if (valA < valB) return sortSemestreOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortSemestreOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const paginatedAnnees = sortedAnnees.slice(
    (anneePage - 1) * itemsPerPage,
    anneePage * itemsPerPage
  );

  const paginatedSemestres = sortedSemestres.slice(
    (semestrePage - 1) * itemsPerPage,
    semestrePage * itemsPerPage
  );

  const totalAnneePages = Math.ceil(filteredAnnees.length / itemsPerPage);
  const totalSemestrePages = Math.ceil(filteredSemestres.length / itemsPerPage);

  const toggleAnneeSort = (field) => {
    if (sortAnneeBy === field) {
      setSortAnneeOrder(sortAnneeOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortAnneeBy(field);
      setSortAnneeOrder('asc');
    }
  };

  const toggleSemestreSort = (field) => {
    if (sortSemestreBy === field) {
      setSortSemestreOrder(sortSemestreOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortSemestreBy(field);
      setSortSemestreOrder('asc');
    }
  };

  return (
    <>
      <style>
        {`
          .config-card {
            transition: all 0.3s ease;
          }
          .config-card:hover {
            transform: scale(1.02);
            box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
          }
          .modal {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(16px);
            border-radius: 16px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          }
        `}
      </style>
      <div className="flex min-h-screen bg-gradient-to-b from-[#F7F9FC] to-[#E5E9F0] font-poppins">
        <Sidebar_RA isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <div className="flex-1 flex flex-col pt-16">
          <Topbar />
          <div className="flex-1 p-4 md:p-8">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-2xl font-bold text-[#093A5D] mb-8 flex items-center gap-3"
            >
              <FaCalendar className="w-6 h-6" /> Configuration Académique
            </motion.h1>
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 max-w-7xl mx-auto">
              {/* Années Académiques */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-white/95 backdrop-blur-md rounded-xl shadow-xl p-6 config-card"
              >
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <FaCalendar className="text-[#093A5D] w-6 h-6" />
                    <h2 className="text-xl font-semibold text-[#093A5D]">Années Académiques</h2>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                      <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#093A5D]/50" />
                      <input
                        ref={searchAnneeRef}
                        type="text"
                        placeholder="Rechercher par année..."
                        value={searchAnneeQuery}
                        onChange={(e) => {
                          setSearchAnneeQuery(e.target.value);
                          setAnneePage(1);
                        }}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F49100] focus:border-transparent transition-all"
                      />
                    </div>
                    <button
                      onClick={() => openModal('annee')}
                      className="bg-[#F49100] text-white p-2 rounded-lg flex items-center gap-2 hover:bg-[#e07b00] hover:scale-105 transition-all duration-200"
                    >
                      <FaPlus className="w-4 h-4" /> Ajouter
                    </button>
                  </div>
                </div>
                {loading.annees ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-12 bg-gray-200 rounded-lg"></div>
                    <div className="h-12 bg-gray-200 rounded-lg"></div>
                  </div>
                ) : paginatedAnnees.length ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-[#093A5D]/10">
                          <th className="p-3 text-left">
                            <button onClick={() => toggleAnneeSort('annee')} className="flex items-center gap-2">
                              Année {sortAnneeBy === 'annee' && (sortAnneeOrder === 'asc' ? '↑' : '↓')}
                            </button>
                          </th>
                          <th className="p-3 text-left">
                            <button onClick={() => toggleAnneeSort('date_debut')} className="flex items-center gap-2">
                              Début {sortAnneeBy === 'date_debut' && (sortAnneeOrder === 'asc' ? '↑' : '↓')}
                            </button>
                          </th>
                          <th className="p-3 text-left">
                            <button onClick={() => toggleAnneeSort('date_fin')} className="flex items-center gap-2">
                              Fin {sortAnneeBy === 'date_fin' && (sortAnneeOrder === 'asc' ? '↑' : '↓')}
                            </button>
                          </th>
                          <th className="p-3 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedAnnees.map((annee) => (
                          <motion.tr
                            key={annee.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.2 }}
                            className="border-b border-gray-200 hover:bg-[#093A5D]/5"
                          >
                            <td className="p-3">{annee.annee}</td>
                            <td className="p-3">{new Date(annee.date_debut).toLocaleDateString('fr-FR')}</td>
                            <td className="p-3">{new Date(annee.date_fin).toLocaleDateString('fr-FR')}</td>
                            <td className="p-3 flex gap-3">
                              <button
                                onClick={() => openModal('annee', annee)}
                                className="text-[#093A5D] hover:text-[#F49100] hover:scale-110 transition-all duration-200"
                              >
                                <FaEdit className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => openModal('deleteAnnee', annee)}
                                className="text-[#E74C3C] hover:text-red-700 hover:scale-110 transition-all duration-200"
                              >
                                <FaTrash className="w-5 h-5" />
                              </button>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                    {totalAnneePages > 1 && (
                      <div className="flex justify-between items-center mt-4">
                        <button
                          onClick={() => setAnneePage((prev) => Math.max(prev - 1, 1))}
                          disabled={anneePage === 1}
                          className="bg-[#F49100] text-white px-4 py-2 rounded-lg disabled:bg-gray-300 hover:bg-[#e07b00] transition-all duration-200"
                        >
                          Précédent
                        </button>
                        <span className="text-sm text-[#093A5D]">
                          Page {anneePage} sur {totalAnneePages}
                        </span>
                        <button
                          onClick={() => setAnneePage((prev) => Math.min(prev + 1, totalAnneePages))}
                          disabled={anneePage === totalAnneePages}
                          className="bg-[#F49100] text-white px-4 py-2 rounded-lg disabled:bg-gray-300 hover:bg-[#e07b00] transition-all duration-200"
                        >
                          Suivant
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-[#093A5D]/70 text-center">Aucune année académique disponible.</p>
                )}
              </motion.div>

              {/* Semestres */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-white/95 backdrop-blur-md rounded-xl shadow-xl p-6 config-card"
              >
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <FaCalendar className="text-[#093A5D] w-6 h-6" />
                    <h2 className="text-xl font-semibold text-[#093A5D]">Semestres</h2>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                      <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#093A5D]/50" />
                      <input
                        ref={searchSemestreRef}
                        type="text"
                        placeholder="Rechercher par libellé..."
                        value={searchSemestreQuery}
                        onChange={(e) => {
                          setSearchSemestreQuery(e.target.value);
                          setSemestrePage(1);
                        }}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F49100] focus:border-transparent transition-all"
                      />
                    </div>
                    <button
                      onClick={() => openModal('semestre')}
                      className="bg-[#F49100] text-white p-2 rounded-lg flex items-center gap-2 hover:bg-[#e07b00] hover:scale-105 transition-all duration-200"
                    >
                      <FaPlus className="w-4 h-4" /> Ajouter
                    </button>
                  </div>
                </div>
                {loading.semestres ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-12 bg-gray-200 rounded-lg"></div>
                    <div className="h-12 bg-gray-200 rounded-lg"></div>
                  </div>
                ) : paginatedSemestres.length ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-[#093A5D]/10">
                          <th className="p-3 text-left">
                            <button onClick={() => toggleSemestreSort('libelle')} className="flex items-center gap-2">
                              Libellé {sortSemestreBy === 'libelle' && (sortSemestreOrder === 'asc' ? '↑' : '↓')}
                            </button>
                          </th>
                          <th className="p-3 text-left">
                            <button onClick={() => toggleSemestreSort('annee_academique')} className="flex items-center gap-2">
                              Année {sortSemestreBy === 'annee_academique' && (sortSemestreOrder === 'asc' ? '↑' : '↓')}
                            </button>
                          </th>
                          <th className="p-3 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedSemestres.map((semestre) => (
                          <motion.tr
                            key={semestre.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.2 }}
                            className="border-b border-gray-200 hover:bg-[#093A5D]/5"
                          >
                            <td className="p-3">{semestre.libelle}</td>
                            <td className="p-3">{semestre.annee_academique?.annee || 'N/A'}</td>
                            <td className="p-3 flex gap-3">
                              <button
                                onClick={() => openModal('semestre', semestre)}
                                className="text-[#093A5D] hover:text-[#F49100] hover:scale-110 transition-all duration-200"
                              >
                                <FaEdit className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => openModal('deleteSemestre', semestre)}
                                className="text-[#E74C3C] hover:text-red-700 hover:scale-110 transition-all duration-200"
                              >
                                <FaTrash className="w-5 h-5" />
                              </button>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                    {totalSemestrePages > 1 && (
                      <div className="flex justify-between items-center mt-4">
                        <button
                          onClick={() => setSemestrePage((prev) => Math.max(prev - 1, 1))}
                          disabled={semestrePage === 1}
                          className="bg-[#F49100] text-white px-4 py-2 rounded-lg disabled:bg-gray-300 hover:bg-[#e07b00] transition-all duration-200"
                        >
                          Précédent
                        </button>
                        <span className="text-sm text-[#093A5D]">
                          Page {semestrePage} sur {totalSemestrePages}
                        </span>
                        <button
                          onClick={() => setSemestrePage((prev) => Math.min(prev + 1, totalSemestrePages))}
                          disabled={semestrePage === totalSemestrePages}
                          className="bg-[#F49100] text-white px-4 py-2 rounded-lg disabled:bg-gray-300 hover:bg-[#e07b00] transition-all duration-200"
                        >
                          Suivant
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-[#093A5D]/70 text-center">Aucun semestre disponible.</p>
                )}
              </motion.div>
            </div>

            {/* Modal */}
            <AnimatePresence>
              {modal.isOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="fixed inset-0 flex items-center justify-center z-50 backdrop-filter backdrop-blur-md bg-gray-900 bg-opacity-20"
                >
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="modal max-w-[90vw] sm:max-w-lg w-full p-6"
                  >
                    {modal.type === 'annee' && (
                      <>
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="text-xl font-semibold text-[#093A5D]">
                            {editAnneeId ? 'Modifier Année' : 'Ajouter Année'}
                          </h3>
                          <button
                            onClick={closeModal}
                            className="text-[#093A5D]/60 hover:text-[#E74C3C] hover:rotate-90 transition-all duration-200"
                          >
                            <FaTimes className="w-5 h-5" />
                          </button>
                        </div>
                        <form onSubmit={handleAnneeSubmit} className="space-y-4">
                          <input
                            ref={searchAnneeRef}
                            type="text"
                            placeholder="Année (ex. 2024-2025)"
                            value={anneeForm.annee}
                            onChange={(e) => setAnneeForm({ ...anneeForm, annee: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F49100] focus:border-transparent transition-all"
                            required
                          />
                          <input
                            type="date"
                            value={anneeForm.date_debut}
                            onChange={(e) => setAnneeForm({ ...anneeForm, date_debut: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F49100] focus:border-transparent transition-all"
                            required
                          />
                          <input
                            type="date"
                            value={anneeForm.date_fin}
                            onChange={(e) => setAnneeForm({ ...anneeForm, date_fin: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F49100] focus:border-transparent transition-all"
                            required
                          />
                          <div className="flex gap-4">
                            <button
                              type="submit"
                              className="bg-[#F49100] text-white p-3 rounded-lg flex-1 hover:bg-[#e07b00] hover:scale-105 transition-all duration-200"
                            >
                              {editAnneeId ? 'Modifier' : 'Ajouter'}
                            </button>
                            <button
                              type="button"
                              onClick={closeModal}
                              className="bg-gray-200 text-[#093A5D]/90 p-3 rounded-lg flex-1 hover:bg-gray-300 hover:scale-105 transition-all duration-200"
                            >
                              Annuler
                            </button>
                          </div>
                        </form>
                      </>
                    )}
                    {modal.type === 'semestre' && (
                      <>
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="text-xl font-semibold text-[#093A5D]">
                            {editSemestreId ? 'Modifier Semestre' : 'Ajouter Semestre'}
                          </h3>
                          <button
                            onClick={closeModal}
                            className="text-[#093A5D]/60 hover:text-[#E74C3C] hover:rotate-90 transition-all duration-200"
                          >
                            <FaTimes className="w-5 h-5" />
                          </button>
                        </div>
                        <form onSubmit={handleSemestreSubmit} className="space-y-4">
                          <input
                            ref={searchSemestreRef}
                            type="text"
                            placeholder="Libellé (ex. Semestre 1)"
                            value={semestreForm.libelle}
                            onChange={(e) => setSemestreForm({ ...semestreForm, libelle: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F49100] focus:border-transparent transition-all"
                            required
                          />
                          <select
                            value={semestreForm.annee_academique_id}
                            onChange={(e) => setSemestreForm({ ...semestreForm, annee_academique_id: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F49100] focus:border-transparent transition-all"
                            required
                          >
                            <option value="">Sélectionner une année</option>
                            {annees.map((annee) => (
                              <option key={annee.id} value={annee.id}>{annee.annee}</option>
                            ))}
                          </select>
                          <div className="flex gap-4">
                            <button
                              type="submit"
                              className="bg-[#F49100] text-white p-3 rounded-lg flex-1 hover:bg-[#e07b00] hover:scale-105 transition-all duration-200"
                            >
                              {editSemestreId ? 'Modifier' : 'Ajouter'}
                            </button>
                            <button
                              type="button"
                              onClick={closeModal}
                              className="bg-gray-200 text-[#093A5D]/90 p-3 rounded-lg flex-1 hover:bg-gray-300 hover:scale-105 transition-all duration-200"
                            >
                              Annuler
                            </button>
                          </div>
                        </form>
                      </>
                    )}
                    {modal.type === 'deleteAnnee' && (
                      <>
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="text-xl font-semibold text-[#093A5D]">Confirmer la suppression</h3>
                          <button
                            onClick={closeModal}
                            className="text-[#093A5D]/60 hover:text-[#E74C3C] hover:rotate-90 transition-all duration-200"
                          >
                            <FaTimes className="w-5 h-5" />
                          </button>
                        </div>
                        <p className="text-sm text-[#093A5D]/90 mb-6">
                          Voulez-vous vraiment supprimer l’année <strong>{modal.data?.annee || ''}</strong> ?
                        </p>
                        <div className="flex gap-4">
                          <button
                            onClick={handleDeleteAnnee}
                            className="bg-[#E74C3C] text-white p-3 rounded-lg flex-1 hover:bg-red-700 hover:scale-105 transition-all duration-200"
                          >
                            Supprimer
                          </button>
                          <button
                            onClick={closeModal}
                            className="bg-gray-200 text-[#093A5D]/90 p-3 rounded-lg flex-1 hover:bg-gray-300 hover:scale-105 transition-all duration-200"
                          >
                            Annuler
                          </button>
                        </div>
                      </>
                    )}
                    {modal.type === 'deleteSemestre' && (
                      <>
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="text-xl font-semibold text-[#093A5D]">Confirmer la suppression</h3>
                          <button
                            onClick={closeModal}
                            className="text-[#093A5D]/60 hover:text-[#E74C3C] hover:rotate-90 transition-all duration-200"
                          >
                            <FaTimes className="w-5 h-5" />
                          </button>
                        </div>
                        <p className="text-sm text-[#093A5D]/90 mb-6">
                          Voulez-vous vraiment supprimer le semestre <strong>{modal.data?.libelle || ''}</strong> ?
                        </p>
                        <div className="flex gap-4">
                          <button
                            onClick={handleDeleteSemestre}
                            className="bg-[#E74C3C] text-white p-3 rounded-lg flex-1 hover:bg-red-700 hover:scale-105 transition-all duration-200"
                          >
                            Supprimer
                          </button>
                          <button
                            onClick={closeModal}
                            className="bg-gray-200 text-[#093A5D]/90 p-3 rounded-lg flex-1 hover:bg-gray-300 hover:scale-105 transition-all duration-200"
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

export default ConfigAcademique;