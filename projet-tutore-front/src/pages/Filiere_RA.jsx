// import React, { useState, useEffect } from 'react';
// import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
// import Sidebar_RA from '../pages/Sidebar_RA';
// import Topbar from '../pages/Topbar';
// import axios from 'axios';

// const Filiere_RA = () => {
//   const [filieres, setFilieres] = useState([]);
//   const [filiereForm, setFiliereForm] = useState({ nom: '', code: '', niveau: '' });
//   const [editFiliereId, setEditFiliereId] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//   const [notifications, setNotifications] = useState([]);
//   const [user, setUser] = useState({
//     nom: 'Tchamgoue',
//     prenom: 'Jean',
//     role: 'Responsable Académique',
//   });

//   const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     if (!token) return;

//     const fetchFilieres = async () => {
//       try {
//         const response = await axios.get('http://127.0.0.1:8000/api/showfiliere', {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         setFilieres(response.data);
//       } catch (err) {
//         setError('Erreur lors de la récupération des filières');
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchFilieres();
//   }, []);

//   const handleFiliereSubmit = async (e) => {
//     e.preventDefault();
//     const token = localStorage.getItem('token');
//     try {
//       if (editFiliereId) {
//         const response = await axios.put(`http://127.0.0.1:8000/api/updatefiliere/${editFiliereId}`, filiereForm, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         setFilieres(filieres.map((f) => (f.id === editFiliereId ? response.data.filiere : f)));
//         setNotifications([...notifications, { id: Date.now(), message: `Filière ${filiereForm.nom} mise à jour`, date: new Date().toLocaleString(), is_read: false }]);
//       } else {
//         const response = await axios.post('http://127.0.0.1:8000/api/createfiliere', filiereForm, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         setFilieres([...filieres, response.data.filiere]);
//         setNotifications([...notifications, { id: Date.now(), message: `Filière ${filiereForm.nom} créée`, date: new Date().toLocaleString(), is_read: false }]);
//       }
//       setFiliereForm({ nom: '', code: '', niveau: '' });
//       setEditFiliereId(null);
//       setError('');
//     } catch (err) {
//       setError(err.response?.data?.errors ? Object.values(err.response.data.errors).join(', ') : 'Erreur lors de la soumission');
//       console.error(err);
//     }
//   };

//   const handleDeleteFiliere = async (id) => {
//     const token = localStorage.getItem('token');
//     try {
//       await axios.delete(`http://127.0.0.1:8000/api/deletefiliere/${id}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setFilieres(filieres.filter((f) => f.id !== id));
//       setNotifications([...notifications, { id: Date.now(), message: `Filière supprimée`, date: new Date().toLocaleString(), is_read: false }]);
//       setError('');
//     } catch (err) {
//       setError(err.response?.data?.message || 'Erreur lors de la suppression');
//       console.error(err);
//     }
//   };

//   const handleEditFiliere = (filiere) => {
//     setFiliereForm({ nom: filiere.nom, code: filiere.code, niveau: filiere.niveau });
//     setEditFiliereId(filiere.id);
//   };

//   return (
//     <div className="flex min-h-screen bg-[#F7F9FC] font-poppins">
//       <Sidebar_RA isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
//       <div className="flex-1 flex flex-col">
//         <Topbar user={user} setNotifications={setNotifications} toggleSidebar={toggleSidebar} />
//         <div className="flex-1 p-4 md:p-6">
//           <h1 className="text-xl font-semibold text-[#093A5D] mb-6">Gestion des Filières</h1>
//           {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
//           <div className="bg-white rounded-lg shadow-md p-4 max-w-3xl mx-auto">
//             <div className="flex items-center gap-2 mb-4">
//               <FaPlus className="text-[#093A5D] w-5 h-5" />
//               <h2 className="text-lg font-semibold text-[#093A5D]">{editFiliereId ? 'Modifier une filière' : 'Ajouter une filière'}</h2>
//             </div>
//             <form onSubmit={handleFiliereSubmit} className="grid gap-4 sm:grid-cols-2">
//               <input
//                 type="text"
//                 placeholder="Nom (ex. Informatique)"
//                 value={filiereForm.nom}
//                 onChange={(e) => setFiliereForm({ ...filiereForm, nom: e.target.value })}
//                 className="p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#F49100]"
//                 required
//               />
//               <input
//                 type="text"
//                 placeholder="Code (ex. INF)"
//                 value={filiereForm.code}
//                 onChange={(e) => setFiliereForm({ ...filiereForm, code: e.target.value })}
//                 className="p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#F49100]"
//                 required
//               />
//               <input
//                 type="text"
//                 placeholder="Niveau (ex. Licence 1)"
//                 value={filiereForm.niveau}
//                 onChange={(e) => setFiliereForm({ ...filiereForm, niveau: e.target.value })}
//                 className="p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#F49100]"
//                 required
//               />
//               <button
//                 type="submit"
//                 className="bg-[#F49100] text-white p-2 rounded-md flex items-center gap-1 hover:bg-[#e07b00] sm:col-span-2"
//               >
//                 <FaPlus /> {editFiliereId ? 'Modifier' : 'Ajouter'}
//               </button>
//             </form>
//             <div className="mt-6">
//               {loading ? (
//                 <div className="animate-pulse">
//                   <div className="h-10 bg-gray-200 rounded mb-2"></div>
//                   <div className="h-10 bg-gray-200 rounded mb-2"></div>
//                 </div>
//               ) : filieres.length ? (
//                 <div className="overflow-x-auto">
//                   <table className="w-full text-sm">
//                     <thead>
//                       <tr className="bg-gray-100">
//                         <th className="p-2 text-left">Nom</th>
//                         <th className="p-2 text-left">Code</th>
//                         <th className="p-2 text-left">Niveau</th>
//                         <th className="p-2 text-left">Actions</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {filieres.map((filiere) => (
//                         <tr key={filiere.id} className="border-b border-gray-200">
//                           <td className="p-2">{filiere.nom}</td>
//                           <td className="p-2">{filiere.code}</td>
//                           <td className="p-2">{filiere.niveau}</td>
//                           <td className="p-2 flex gap-2">
//                             <button
//                               onClick={() => handleEditFiliere(filiere)}
//                               className="text-[#093A5D] hover:text-[#F49100]"
//                             >
//                               <FaEdit />
//                             </button>
//                             <button
//                               onClick={() => handleDeleteFiliere(filiere.id)}
//                               className="text-red-500 hover:text-red-700"
//                             >
//                               <FaTrash />
//                             </button>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               ) : (
//                 <p className="text-sm text-gray-500">Aucune filière disponible.</p>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Filiere_RA;

import React, { useState, useEffect, useRef } from 'react';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaSearch } from 'react-icons/fa';
import Sidebar_RA from '../pages/Sidebar_RA';
import Topbar from '../pages/Topbar';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const Filiere_RA = () => {
  const [filieres, setFilieres] = useState([]);
  const [filiereForm, setFiliereForm] = useState({ nom: '', code: '', niveau: '' });
  const [editFiliereId, setEditFiliereId] = useState(null);
  const [loading, setLoading] = useState({ filieres: true, user: true });
  const [error, setError] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [modal, setModal] = useState({ isOpen: false, type: '', data: null });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('nom');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const searchInputRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Utilisateur non authentifié', {
        position: 'top-right',
        autoClose: 3000,
        style: { backgroundColor: '#E74C3C', color: '#FFFFFF' },
      });
      setLoading({ filieres: false, user: false });
      return;
    }

    const fetchData = async () => {
      try {
        const [userResponse, filieresResponse] = await Promise.all([
          axios.get('http://127.0.0.1:8000/api/infos', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://127.0.0.1:8000/api/showfiliere', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setUser(userResponse.data);
        setFilieres(Array.isArray(filieresResponse.data) ? filieresResponse.data : []);
      } catch (err) {
        setError('Erreur lors du chargement des données');
        console.error('Fetch error:', err);
        toast.error('Erreur lors du chargement des données', {
          position: 'top-right',
          autoClose: 3000,
          style: { backgroundColor: '#E74C3C', color: '#FFFFFF' },
        });
      } finally {
        setLoading({ filieres: false, user: false });
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [modal.isOpen]);

  const handleFiliereSubmit = async (e) => {
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
      if (editFiliereId) {
        response = await axios.put(`http://127.0.0.1:8000/api/updatefiliere/${editFiliereId}`, filiereForm, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFilieres(filieres.map((f) => (f.id === editFiliereId ? response.data.filiere : f)));
        toast.success(`Filière ${filiereForm.nom} mise à jour`, {
          position: 'top-right',
          autoClose: 3000,
          style: { backgroundColor: '#27AE60', color: '#FFFFFF' },
        });
      } else {
        response = await axios.post('http://127.0.0.1:8000/api/createfiliere', filiereForm, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFilieres([...filieres, response.data.filiere]);
        toast.success(`Filière ${filiereForm.nom} créée`, {
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
      console.error('Submit error:', err);
    }
  };

  const handleDeleteFiliere = async () => {
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
      await axios.delete(`http://127.0.0.1:8000/api/deletefiliere/${modal.data?.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFilieres(filieres.filter((f) => f.id !== modal.data?.id));
      toast.success('Filière supprimée', {
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
      console.error('Delete error:', err);
    }
  };

  const openModal = (type, data = null) => {
    if (type === 'filiere' && data) {
      setFiliereForm({ nom: data.nom || '', code: data.code || '', niveau: data.niveau || '' });
      setEditFiliereId(data.id);
    } else {
      setFiliereForm({ nom: '', code: '', niveau: '' });
      setEditFiliereId(null);
    }
    setModal({ isOpen: true, type, data });
  };

  const closeModal = () => {
    setModal({ isOpen: false, type: '', data: null });
    setFiliereForm({ nom: '', code: '', niveau: '' });
    setEditFiliereId(null);
    setError('');
  };

  const filteredFilieres = filieres.filter(
    (filiere) =>
      (filiere.nom?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (filiere.code?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  const sortedFilieres = [...filteredFilieres].sort((a, b) => {
    let valA = a[sortBy] || '';
    let valB = b[sortBy] || '';
    // Pour les strings, on compare insensible à la casse
    if (typeof valA === 'string' && typeof valB === 'string') {
      valA = valA.toLowerCase();
      valB = valB.toLowerCase();
    }
    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const paginatedFilieres = sortedFilieres.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredFilieres.length / itemsPerPage);

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
          .filiere-card {
            transition: all 0.3s ease;
          }
          .filiere-card:hover {
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
              <FaPlus className="w-6 h-6" /> Gestion des Filières
            </motion.h1>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-white/95 backdrop-blur-md rounded-xl shadow-xl p-6 filiere-card max-w-4xl mx-auto"
            >
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <FaPlus className="text-[#093A5D] w-6 h-6" />
                  <h2 className="text-xl font-semibold text-[#093A5D]">
                    Liste des filières
                  </h2>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#093A5D]/50" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Rechercher par nom ou code..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F49100] focus:border-transparent transition-all"
                    />
                  </div>
                  <button
                    onClick={() => openModal('filiere')}
                    className="bg-[#F49100] text-white p-2 rounded-lg flex items-center gap-2 hover:bg-[#e07b00] hover:scale-105 transition-all duration-200"
                  >
                    <FaPlus className="w-4 h-4" /> Ajouter
                  </button>
                </div>
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
              {loading.filieres ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-12 bg-gray-200 rounded-lg"></div>
                  <div className="h-12 bg-gray-200 rounded-lg"></div>
                </div>
              ) : paginatedFilieres.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-[#093A5D]/10">
                        <th className="p-3 text-left">
                          <button onClick={() => toggleSort('nom')} className="flex items-center gap-2">
                            Nom {sortBy === 'nom' && (sortOrder === 'asc' ? '↑' : '↓')}
                          </button>
                        </th>
                        <th className="p-3 text-left">
                          <button onClick={() => toggleSort('code')} className="flex items-center gap-2">
                            Code {sortBy === 'code' && (sortOrder === 'asc' ? '↑' : '↓')}
                          </button>
                        </th>
                        <th className="p-3 text-left">
                          <button onClick={() => toggleSort('niveau')} className="flex items-center gap-2">
                            Niveau {sortBy === 'niveau' && (sortOrder === 'asc' ? '↑' : '↓')}
                          </button>
                        </th>
                        <th className="p-3 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedFilieres.map((filiere) => (
                        <motion.tr
                          key={filiere.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.2 }}
                          className="border-b border-gray-200 hover:bg-[#093A5D]/5"
                        >
                          <td className="p-3">{filiere.nom}</td>
                          <td className="p-3">{filiere.code}</td>
                          <td className="p-3">{filiere.niveau}</td>
                          <td className="p-3 flex gap-3">
                            <button
                              onClick={() => openModal('filiere', filiere)}
                              className="text-[#093A5D] hover:text-[#F49100] hover:scale-110 transition-all duration-200"
                            >
                              <FaEdit className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => openModal('deleteFiliere', filiere)}
                              className="text-[#E74C3C] hover:text-red-700 hover:scale-110 transition-all duration-200"
                            >
                              <FaTrash className="w-5 h-5" />
                            </button>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                  {totalPages > 1 && (
                    <div className="flex justify-between items-center mt-4">
                      <button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="bg-[#F49100] text-white px-4 py-2 rounded-lg disabled:bg-gray-300 hover:bg-[#e07b00] transition-all duration-200"
                      >
                        Précédent
                      </button>
                      <span className="text-sm text-[#093A5D]">
                        Page {currentPage} sur {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="bg-[#F49100] text-white px-4 py-2 rounded-lg disabled:bg-gray-300 hover:bg-[#e07b00] transition-all duration-200"
                      >
                        Suivant
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-[#093A5D]/70 text-center">Aucune filière disponible.</p>
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
                  {modal.type === 'filiere' && (
                    <>
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-semibold text-[#093A5D]">
                          {editFiliereId ? 'Modifier Filière' : 'Ajouter Filière'}
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
                      <form onSubmit={handleFiliereSubmit} className="space-y-4">
                        <input
                          type="text"
                          placeholder="Nom (ex. Informatique)"
                          value={filiereForm.nom}
                          onChange={(e) => setFiliereForm({ ...filiereForm, nom: e.target.value })}
                          className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F49100] focus:border-transparent transition-all"
                          required
                        />
                        <input
                          type="text"
                          placeholder="Code (ex. INF)"
                          value={filiereForm.code}
                          onChange={(e) => setFiliereForm({ ...filiereForm, code: e.target.value })}
                          className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F49100] focus:border-transparent transition-all"
                          required
                        />
                        <input
                          type="text"
                          placeholder="Niveau (ex. Licence 1)"
                          value={filiereForm.niveau}
                          onChange={(e) => setFiliereForm({ ...filiereForm, niveau: e.target.value })}
                          className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F49100] focus:border-transparent transition-all"
                          required
                        />
                        <div className="flex gap-4">
                          <button
                            type="submit"
                            className="bg-[#F49100] text-white p-3 rounded-lg flex-1 hover:bg-[#e07b00] hover:scale-105 transition-all duration-200"
                          >
                            {editFiliereId ? 'Modifier' : 'Ajouter'}
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
                  {modal.type === 'deleteFiliere' && (
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
                        Voulez-vous vraiment supprimer la filière <strong>{modal.data?.nom || ''}</strong> ?
                      </p>
                      <div className="flex gap-4">
                        <button
                          onClick={handleDeleteFiliere}
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
    </>
  );
};

export default Filiere_RA;