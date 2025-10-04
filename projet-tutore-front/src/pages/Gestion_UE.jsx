import React, { useState, useEffect, useRef } from 'react';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaSearch, FaBook } from 'react-icons/fa';
import Sidebar_RA from '../pages/Sidebar_RA';
import Topbar from '../pages/Topbar';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const Gestion_UE = () => {
  const [ues, setUes] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [filieres, setFilieres] = useState([]);
  const [ueForm, setUeForm] = useState({ nom: '', code: '', filiere_id: '' });
  const [matiereForm, setMatiereForm] = useState({ nom: '', code: '', ue_id: '', credits: '' });
  const [editUeId, setEditUeId] = useState(null);
  const [editMatiereId, setEditMatiereId] = useState(null);
  const [loading, setLoading] = useState({ ues: true, matieres: true, filieres: true, user: true });
  const [error, setError] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [modal, setModal] = useState({ isOpen: false, type: '', data: null });
  const [searchUeQuery, setSearchUeQuery] = useState('');
  const [searchMatiereQuery, setSearchMatiereQuery] = useState('');
  const [sortUeBy, setSortUeBy] = useState('nom');
  const [sortMatiereBy, setSortMatiereBy] = useState('nom');
  const [sortUeOrder, setSortUeOrder] = useState('asc');
  const [sortMatiereOrder, setSortMatiereOrder] = useState('asc');
  const [uePage, setUePage] = useState(1);
  const [matierePage, setMatierePage] = useState(1);
  const itemsPerPage = 5;
  const searchUeRef = useRef(null);
  const searchMatiereRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Utilisateur non authentifié', {
        position: 'top-right',
        autoClose: 3000,
        style: { backgroundColor: '#E74C3C', color: '#FFFFFF' },
      });
      setLoading({ ues: false, matieres: false, filieres: false, user: false });
      return;
    }

    const fetchData = async () => {
      try {
        const [userResponse, filieresResponse, uesResponse, matieresResponse] = await Promise.all([
          axios.get('http://127.0.0.1:8000/api/infos', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://127.0.0.1:8000/api/showfiliere', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://127.0.0.1:8000/api/showUE', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://127.0.0.1:8000/api/showmatiere', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setUser(userResponse.data);
        setFilieres(Array.isArray(filieresResponse.data) ? filieresResponse.data : []);
        setUes(Array.isArray(uesResponse.data) ? uesResponse.data : []);
        setMatieres(Array.isArray(matieresResponse.data) ? matieresResponse.data : []);
      } catch (err) {
        setError('Erreur lors du chargement des données');
        console.error('Fetch error:', err);
        toast.error('Erreur lors du chargement des données', {
          position: 'top-right',
          autoClose: 3000,
          style: { backgroundColor: '#E74C3C', color: '#FFFFFF' },
        });
      } finally {
        setLoading({ ues: false, matieres: false, filieres: false, user: false });
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (modal.isOpen) {
      if (modal.type === 'ue' && searchUeRef.current) searchUeRef.current.focus();
      if (modal.type === 'matiere' && searchMatiereRef.current) searchMatiereRef.current.focus();
    }
  }, [modal.isOpen, modal.type]);

  const openModal = (type, data = null) => {
    if (type === 'ue' && data) {
      setUeForm({ nom: data.nom || '', code: data.code || '', filiere_id: data.filiere_id || '' });
      setEditUeId(data.id);
    } else if (type === 'matiere' && data) {
      setMatiereForm({
        nom: data.nom || '',
        code: data.code || '',
        ue_id: data.ue_id || '',
        credits: data.credits || '',
      });
      setEditMatiereId(data.id);
    } else {
      setUeForm({ nom: '', code: '', filiere_id: '' });
      setMatiereForm({ nom: '', code: '', ue_id: '', credits: '' });
      setEditUeId(null);
      setEditMatiereId(null);
    }
    setModal({ isOpen: true, type, data });
    setError('');
  };

  const closeModal = () => {
    setModal({ isOpen: false, type: '', data: null });
    setUeForm({ nom: '', code: '', filiere_id: '' });
    setMatiereForm({ nom: '', code: '', ue_id: '', credits: '' });
    setEditUeId(null);
    setEditMatiereId(null);
    setError('');
  };

  const handleUeSubmit = async (e) => {
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
      if (editUeId) {
        response = await axios.put(`http://127.0.0.1:8000/api/updateUE/${editUeId}`, ueForm, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUes(ues.map((u) => (u.id === editUeId ? response.data.ue : u)));
        toast.success(`UE ${ueForm.nom} mise à jour`, {
          position: 'top-right',
          autoClose: 3000,
          style: { backgroundColor: '#27AE60', color: '#FFFFFF' },
        });
      } else {
        response = await axios.post('http://127.0.0.1:8000/api/createUE', ueForm, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUes([...ues, response.data.ue]);
        toast.success(`UE ${ueForm.nom} créée`, {
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
      setError(errorMsg);
      toast.error(errorMsg, {
        position: 'top-right',
        autoClose: 3000,
        style: { backgroundColor: '#E74C3C', color: '#FFFFFF' },
      });
      console.error('Submit UE error:', err);
    }
  };

  const handleMatiereSubmit = async (e) => {
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
      if (editMatiereId) {
        response = await axios.put(`http://127.0.0.1:8000/api/updatematiere/${editMatiereId}`, matiereForm, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMatieres(matieres.map((m) => (m.id === editMatiereId ? response.data.matiere : m)));
        toast.success(`Matière ${matiereForm.nom} mise à jour`, {
          position: 'top-right',
          autoClose: 3000,
          style: { backgroundColor: '#27AE60', color: '#FFFFFF' },
        });
      } else {
        response = await axios.post('http://127.0.0.1:8000/api/creatematiere', matiereForm, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMatieres([...matieres, response.data.matiere]);
        toast.success(`Matière ${matiereForm.nom} créée`, {
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
      setError(errorMsg);
      toast.error(errorMsg, {
        position: 'top-right',
        autoClose: 3000,
        style: { backgroundColor: '#E74C3C', color: '#FFFFFF' },
      });
      console.error('Submit matiere error:', err);
    }
  };

  const handleDeleteUe = async () => {
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
      await axios.delete(`http://127.0.0.1:8000/api/deleteUE/${modal.data?.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUes(ues.filter((u) => u.id !== modal.data?.id));
      toast.success('Unité d’enseignement supprimée', {
        position: 'top-right',
        autoClose: 3000,
        style: { backgroundColor: '#27AE60', color: '#FFFFFF' },
      });
      closeModal();
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Erreur lors de la suppression';
      setError(errorMsg);
      toast.error(errorMsg, {
        position: 'top-right',
        autoClose: 3000,
        style: { backgroundColor: '#E74C3C', color: '#FFFFFF' },
      });
      console.error('Delete UE error:', err);
    }
  };

  const handleDeleteMatiere = async () => {
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
      await axios.delete(`http://127.0.0.1:8000/api/deletematiere/${modal.data?.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMatieres(matieres.filter((m) => m.id !== modal.data?.id));
      toast.success('Matière supprimée', {
        position: 'top-right',
        autoClose: 3000,
        style: { backgroundColor: '#27AE60', color: '#FFFFFF' },
      });
      closeModal();
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Erreur lors de la suppression';
      setError(errorMsg);
      toast.error(errorMsg, {
        position: 'top-right',
        autoClose: 3000,
        style: { backgroundColor: '#E74C3C', color: '#FFFFFF' },
      });
      console.error('Delete matiere error:', err);
    }
  };

  const filteredUes = ues.filter(
    (ue) =>
      (ue.nom?.toLowerCase() || '').includes(searchUeQuery.toLowerCase()) ||
      (ue.code?.toLowerCase() || '').includes(searchUeQuery.toLowerCase())
  );

  const filteredMatieres = matieres.filter(
    (matiere) =>
      (matiere.nom?.toLowerCase() || '').includes(searchMatiereQuery.toLowerCase()) ||
      (matiere.code?.toLowerCase() || '').includes(searchMatiereQuery.toLowerCase())
  );

  const sortedUes = [...filteredUes].sort((a, b) => {
    let valA = sortUeBy === 'filiere' ? (a.filiere?.nom || '') : (a[sortUeBy] || '');
    let valB = sortUeBy === 'filiere' ? (b.filiere?.nom || '') : (b[sortUeBy] || '');
    if (typeof valA === 'string' && typeof valB === 'string') {
      valA = valA.toLowerCase();
      valB = valB.toLowerCase();
    }
    if (valA < valB) return sortUeOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortUeOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const sortedMatieres = [...filteredMatieres].sort((a, b) => {
    let valA = sortMatiereBy === 'uniteEnseignement' ? (a.uniteEnseignement?.nom || '') : (a[sortMatiereBy] || '');
    let valB = sortMatiereBy === 'uniteEnseignement' ? (b.uniteEnseignement?.nom || '') : (b[sortMatiereBy] || '');
    if (typeof valA === 'string' && typeof valB === 'string') {
      valA = valA.toLowerCase();
      valB = valB.toLowerCase();
    }
    if (valA < valB) return sortMatiereOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortMatiereOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const paginatedUes = sortedUes.slice(
    (uePage - 1) * itemsPerPage,
    uePage * itemsPerPage
  );

  const paginatedMatieres = sortedMatieres.slice(
    (matierePage - 1) * itemsPerPage,
    matierePage * itemsPerPage
  );

  const totalUePages = Math.ceil(filteredUes.length / itemsPerPage);
  const totalMatierePages = Math.ceil(filteredMatieres.length / itemsPerPage);

  const toggleUeSort = (field) => {
    if (sortUeBy === field) {
      setSortUeOrder(sortUeOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortUeBy(field);
      setSortUeOrder('asc');
    }
  };

  const toggleMatiereSort = (field) => {
    if (sortMatiereBy === field) {
      setSortMatiereOrder(sortMatiereOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortMatiereBy(field);
      setSortMatiereOrder('asc');
    }
  };

  return (
    <>
      <style>
        {`
          .ue-card {
            transition: all 0.3s ease;
          }
          .ue-card:hover {
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
              <FaBook className="w-6 h-6" /> Gestion des Unités d’Enseignement
            </motion.h1>
            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[#E74C3C] text-sm mb-4 max-w-7xl mx-auto"
              >
                {error}
              </motion.p>
            )}
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 max-w-7xl mx-auto">
              {/* Unités d'Enseignement */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-white/95 backdrop-blur-md rounded-xl shadow-xl p-6 ue-card"
              >
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <FaBook className="text-[#093A5D] w-6 h-6" />
                    <h2 className="text-xl font-semibold text-[#093A5D]">Unités d’Enseignement</h2>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                      <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#093A5D]/50" />
                      <input
                        ref={searchUeRef}
                        type="text"
                        placeholder="Rechercher par nom ou code..."
                        value={searchUeQuery}
                        onChange={(e) => {
                          setSearchUeQuery(e.target.value);
                          setUePage(1);
                        }}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F49100] focus:border-transparent transition-all"
                      />
                    </div>
                    <button
                      onClick={() => openModal('ue')}
                      className="bg-[#F49100] text-white p-2 rounded-lg flex items-center gap-2 hover:bg-[#e07b00] hover:scale-105 transition-all duration-200"
                    >
                      <FaPlus className="w-4 h-4" /> Ajouter
                    </button>
                  </div>
                </div>
                {loading.ues ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-12 bg-gray-200 rounded-lg"></div>
                    <div className="h-12 bg-gray-200 rounded-lg"></div>
                  </div>
                ) : paginatedUes.length ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-[#093A5D]/10">
                          <th className="p-3 text-left">
                            <button onClick={() => toggleUeSort('nom')} className="flex items-center gap-2">
                              Nom {sortUeBy === 'nom' && (sortUeOrder === 'asc' ? '↑' : '↓')}
                            </button>
                          </th>
                          <th className="p-3 text-left">
                            <button onClick={() => toggleUeSort('code')} className="flex items-center gap-2">
                              Code {sortUeBy === 'code' && (sortUeOrder === 'asc' ? '↑' : '↓')}
                            </button>
                          </th>
                          <th className="p-3 text-left">
                            <button onClick={() => toggleUeSort('filiere')} className="flex items-center gap-2">
                              Filière {sortUeBy === 'filiere' && (sortUeOrder === 'asc' ? '↑' : '↓')}
                            </button>
                          </th>
                          <th className="p-3 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedUes.map((ue) => (
                          <motion.tr
                            key={ue.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.2 }}
                            className="border-b border-gray-200 hover:bg-[#093A5D]/5"
                          >
                            <td className="p-3">{ue.nom}</td>
                            <td className="p-3">{ue.code}</td>
                            <td className="p-3">{ue.filiere?.nom || 'N/A'}</td>
                            <td className="p-3 flex gap-3">
                              <button
                                onClick={() => openModal('ue', ue)}
                                className="text-[#093A5D] hover:text-[#F49100] hover:scale-110 transition-all duration-200"
                              >
                                <FaEdit className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => openModal('deleteUe', ue)}
                                className="text-[#E74C3C] hover:text-red-700 hover:scale-110 transition-all duration-200"
                              >
                                <FaTrash className="w-5 h-5" />
                              </button>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                    {totalUePages > 1 && (
                      <div className="flex justify-between items-center mt-4">
                        <button
                          onClick={() => setUePage((prev) => Math.max(prev - 1, 1))}
                          disabled={uePage === 1}
                          className="bg-[#F49100] text-white px-4 py-2 rounded-lg disabled:bg-gray-300 hover:bg-[#e07b00] transition-all duration-200"
                        >
                          Précédent
                        </button>
                        <span className="text-sm text-[#093A5D]">
                          Page {uePage} sur {totalUePages}
                        </span>
                        <button
                          onClick={() => setUePage((prev) => Math.min(prev + 1, totalUePages))}
                          disabled={uePage === totalUePages}
                          className="bg-[#F49100] text-white px-4 py-2 rounded-lg disabled:bg-gray-300 hover:bg-[#e07b00] transition-all duration-200"
                        >
                          Suivant
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-[#093A5D]/70 text-center">Aucune unité d’enseignement disponible.</p>
                )}
              </motion.div>

              {/* Matières */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-white/95 backdrop-blur-md rounded-xl shadow-xl p-6 ue-card"
              >
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <FaBook className="text-[#093A5D] w-6 h-6" />
                    <h2 className="text-xl font-semibold text-[#093A5D]">Matières</h2>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                      <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#093A5D]/50" />
                      <input
                        ref={searchMatiereRef}
                        type="text"
                        placeholder="Rechercher par nom ou code..."
                        value={searchMatiereQuery}
                        onChange={(e) => {
                          setSearchMatiereQuery(e.target.value);
                          setMatierePage(1);
                        }}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F49100] focus:border-transparent transition-all"
                      />
                    </div>
                    <button
                      onClick={() => openModal('matiere')}
                      className="bg-[#F49100] text-white p-2 rounded-lg flex items-center gap-2 hover:bg-[#e07b00] hover:scale-105 transition-all duration-200"
                    >
                      <FaPlus className="w-4 h-4" /> Ajouter
                    </button>
                  </div>
                </div>
                {loading.matieres ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-12 bg-gray-200 rounded-lg"></div>
                    <div className="h-12 bg-gray-200 rounded-lg"></div>
                  </div>
                ) : paginatedMatieres.length ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-[#093A5D]/10">
                          <th className="p-3 text-left">
                            <button onClick={() => toggleMatiereSort('nom')} className="flex items-center gap-2">
                              Nom {sortMatiereBy === 'nom' && (sortMatiereOrder === 'asc' ? '↑' : '↓')}
                            </button>
                          </th>
                          <th className="p-3 text-left">
                            <button onClick={() => toggleMatiereSort('code')} className="flex items-center gap-2">
                              Code {sortMatiereBy === 'code' && (sortMatiereOrder === 'asc' ? '↑' : '↓')}
                            </button>
                          </th>
                          <th className="p-3 text-left">
                            <button onClick={() => toggleMatiereSort('uniteEnseignement')} className="flex items-center gap-2">
                              UE {sortMatiereBy === 'uniteEnseignement' && (sortMatiereOrder === 'asc' ? '↑' : '↓')}
                            </button>
                          </th>
                          <th className="p-3 text-left">
                            <button onClick={() => toggleMatiereSort('credits')} className="flex items-center gap-2">
                              Crédits {sortMatiereBy === 'credits' && (sortMatiereOrder === 'asc' ? '↑' : '↓')}
                            </button>
                          </th>
                          <th className="p-3 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedMatieres.map((matiere) => (
                          <motion.tr
                            key={matiere.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.2 }}
                            className="border-b border-gray-200 hover:bg-[#093A5D]/5"
                          >
                            <td className="p-3">{matiere.nom}</td>
                            <td className="p-3">{matiere.code}</td>
                            <td className="p-3">{matiere.uniteEnseignement?.nom || 'N/A'}</td>
                            <td className="p-3">{matiere.credits}</td>
                            <td className="p-3 flex gap-3">
                              <button
                                onClick={() => openModal('matiere', matiere)}
                                className="text-[#093A5D] hover:text-[#F49100] hover:scale-110 transition-all duration-200"
                              >
                                <FaEdit className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => openModal('deleteMatiere', matiere)}
                                className="text-[#E74C3C] hover:text-red-700 hover:scale-110 transition-all duration-200"
                              >
                                <FaTrash className="w-5 h-5" />
                              </button>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                    {totalMatierePages > 1 && (
                      <div className="flex justify-between items-center mt-4">
                        <button
                          onClick={() => setMatierePage((prev) => Math.max(prev - 1, 1))}
                          disabled={matierePage === 1}
                          className="bg-[#F49100] text-white px-4 py-2 rounded-lg disabled:bg-gray-300 hover:bg-[#e07b00] transition-all duration-200"
                        >
                          Précédent
                        </button>
                        <span className="text-sm text-[#093A5D]">
                          Page {matierePage} sur {totalMatierePages}
                        </span>
                        <button
                          onClick={() => setMatierePage((prev) => Math.min(prev + 1, totalMatierePages))}
                          disabled={matierePage === totalMatierePages}
                          className="bg-[#F49100] text-white px-4 py-2 rounded-lg disabled:bg-gray-300 hover:bg-[#e07b00] transition-all duration-200"
                        >
                          Suivant
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-[#093A5D]/70 text-center">Aucune matière disponible.</p>
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
                    {modal.type === 'ue' && (
                      <>
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="text-xl font-semibold text-[#093A5D]">
                            {editUeId ? 'Modifier UE' : 'Ajouter UE'}
                          </h3>
                          <button
                            onClick={closeModal}
                            className="text-[#093A5D]/60 hover:text-[#E74C3C] hover:rotate-90 transition-all duration-200"
                          >
                            <FaTimes className="w-5 h-5" />
                          </button>
                        </div>
                        {error && (
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-[#E74C3C] text-sm mb-4"
                          >
                            {error}
                          </motion.p>
                        )}
                        <form onSubmit={handleUeSubmit} className="space-y-4">
                          <input
                            ref={searchUeRef}
                            type="text"
                            placeholder="Nom (ex. Programmation)"
                            value={ueForm.nom}
                            onChange={(e) => setUeForm({ ...ueForm, nom: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F49100] focus:border-transparent transition-all"
                            required
                          />
                          <input
                            type="text"
                            placeholder="Code (ex. PROG101)"
                            value={ueForm.code}
                            onChange={(e) => setUeForm({ ...ueForm, code: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F49100] focus:border-transparent transition-all"
                            required
                          />
                          <select
                            value={ueForm.filiere_id}
                            onChange={(e) => setUeForm({ ...ueForm, filiere_id: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F49100] focus:border-transparent transition-all"
                            required
                          >
                            <option value="">Sélectionner une filière</option>
                            {filieres.map((filiere) => (
                              <option key={filiere.id} value={filiere.id}>{filiere.nom}</option>
                            ))}
                          </select>
                          <div className="flex gap-4">
                            <button
                              type="submit"
                              className="bg-[#F49100] text-white p-3 rounded-lg flex-1 hover:bg-[#e07b00] hover:scale-105 transition-all duration-200"
                            >
                              {editUeId ? 'Modifier' : 'Ajouter'}
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
                    {modal.type === 'matiere' && (
                      <>
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="text-xl font-semibold text-[#093A5D]">
                            {editMatiereId ? 'Modifier Matière' : 'Ajouter Matière'}
                          </h3>
                          <button
                            onClick={closeModal}
                            className="text-[#093A5D]/60 hover:text-[#E74C3C] hover:rotate-90 transition-all duration-200"
                          >
                            <FaTimes className="w-5 h-5" />
                          </button>
                        </div>
                        {error && (
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-[#E74C3C] text-sm mb-4"
                          >
                            {error}
                          </motion.p>
                        )}
                        <form onSubmit={handleMatiereSubmit} className="space-y-4">
                          <input
                            ref={searchMatiereRef}
                            type="text"
                            placeholder="Nom (ex. Algorithmique)"
                            value={matiereForm.nom}
                            onChange={(e) => setMatiereForm({ ...matiereForm, nom: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F49100] focus:border-transparent transition-all"
                            required
                          />
                          <input
                            type="text"
                            placeholder="Code (ex. ALGO101)"
                            value={matiereForm.code}
                            onChange={(e) => setMatiereForm({ ...matiereForm, code: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F49100] focus:border-transparent transition-all"
                            required
                          />
                          <select
                            value={matiereForm.ue_id}
                            onChange={(e) => setMatiereForm({ ...matiereForm, ue_id: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F49100] focus:border-transparent transition-all"
                            required
                          >
                            <option value="">Sélectionner une UE</option>
                            {ues.map((ue) => (
                              <option key={ue.id} value={ue.id}>{ue.nom}</option>
                            ))}
                          </select>
                          <input
                            type="number"
                            placeholder="Crédits (ex. 3)"
                            value={matiereForm.credits}
                            onChange={(e) => setMatiereForm({ ...matiereForm, credits: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F49100] focus:border-transparent transition-all"
                            min="1"
                            required
                          />
                          <div className="flex gap-4">
                            <button
                              type="submit"
                              className="bg-[#F49100] text-white p-3 rounded-lg flex-1 hover:bg-[#e07b00] hover:scale-105 transition-all duration-200"
                            >
                              {editMatiereId ? 'Modifier' : 'Ajouter'}
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
                    {modal.type === 'deleteUe' && (
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
                          Voulez-vous vraiment supprimer l’unité d’enseignement <strong>{modal.data?.nom || ''}</strong> ?
                        </p>
                        <div className="flex gap-4">
                          <button
                            onClick={handleDeleteUe}
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
                    {modal.type === 'deleteMatiere' && (
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
                          Voulez-vous vraiment supprimer la matière <strong>{modal.data?.nom || ''}</strong> ?
                        </p>
                        <div className="flex gap-4">
                          <button
                            onClick={handleDeleteMatiere}
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

export default Gestion_UE;