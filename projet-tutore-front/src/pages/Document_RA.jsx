import React, { useState, useEffect } from 'react';
import { FaPlus, FaEye, FaCheck, FaTimes, FaSearch, FaFileAlt, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import Sidebar_RA from '../pages/Sidebar_RA';
import Topbar from '../pages/Topbar';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const Document_RA = () => {
  const [documents, setDocuments] = useState([]);
  const [annees, setAnnees] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [salles, setSalles] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [documentForm, setDocumentForm] = useState({ nom: '', type: '', file: null, annee_academique_id: '', matiere_id: '', salle_ids: [], raison: '' });
  const [loading, setLoading] = useState({ documents: true, annees: true, matieres: true, salles: true, notifications: true });
  const [error, setError] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, type: '', data: null });
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
      setLoading({ documents: false, annees: false, matieres: false, salles: false, notifications: false });
      return;
    }

    const fetchData = async () => {
      try {
        const [documentsResponse, rapportsResponse, anneesResponse, matieresResponse, sallesResponse, notificationsResponse] = await Promise.all([
          axios.get('http://127.0.0.1:8000/api/documents', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://127.0.0.1:8000/api/rapports-stage', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://127.0.0.1:8000/api/showyearschool', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://127.0.0.1:8000/api/showmatiere', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://127.0.0.1:8000/api/showclasse', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://127.0.0.1:8000/api/notifications', { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        // Normaliser les documents
        const normalizedDocuments = Array.isArray(documentsResponse.data) ? documentsResponse.data.map(doc => ({
          id: doc.id,
          nom: doc.nom,
          type: doc.type,
          extension: doc.extension,
          url: doc.url,
          date_upload: doc.date_upload,
          uploader: {
            id: doc.uploader?.id,
            nom: doc.uploader?.nom,
            prenom: doc.uploader?.prenom,
            role: doc.uploader?.role && Array.isArray(doc.uploader.role) && doc.uploader.role.length > 0 ? doc.uploader.role : [{ name: 'N/A' }],
          },
          anneeAcademique: doc.anneeAcademique,
          matiere: doc.matiere,
          salle_ids: doc.salle_ids ? JSON.parse(doc.salle_ids) : [],
          raison: doc.raison,
          approved: doc.approved,
          source: 'document',
        })) : [];

        // Normaliser les rapports
        const normalizedRapports = Array.isArray(rapportsResponse.data) ? rapportsResponse.data.map(rapport => ({
          id: rapport.document.id,
          nom: rapport.titre,
          type: rapport.document.type,
          extension: rapport.document.extension,
          url: rapport.document.url,
          date_upload: rapport.date_soumission,
          uploader: {
            id: rapport.etudiant.id,
            nom: rapport.etudiant.nom,
            prenom: rapport.etudiant.prenom,
            role: [{ name: 'etudiant' }],
          },
          anneeAcademique: { id: rapport.annee_academique_id, annee: rapport.annee_academique },
          matiere: rapport.matiere,
          salle_ids: rapport.salle_de_classes.map(salle => salle.id),
          raison: rapport.document.raison,
          statut: rapport.statut,
          commentaire: rapport.commentaire,
          source: 'rapport',
          rapportId: rapport.id,
        })) : [];

        // Fusionner et filtrer pour éviter les doublons
        const allDocuments = [...normalizedDocuments, ...normalizedRapports];
        const uniqueDocuments = Array.from(
          new Map(allDocuments.map(doc => [doc.id + doc.source, doc])).values()
        );

        setDocuments(uniqueDocuments);
        setAnnees(Array.isArray(anneesResponse.data) ? anneesResponse.data : []);
        setMatieres(Array.isArray(matieresResponse.data) ? matieresResponse.data : []);
        setSalles(Array.isArray(sallesResponse.data) ? sallesResponse.data : []);
        setNotifications(Array.isArray(notificationsResponse.data) ? notificationsResponse.data : []);
      } catch (err) {
        setError('Erreur lors du chargement des données');
        toast.error('Erreur lors du chargement des données', {
          position: 'top-right',
          autoClose: 3000,
          style: { backgroundColor: '#E74C3C', color: '#FFFFFF', fontSize: '0.875rem' },
        });
      } finally {
        setLoading({ documents: false, annees: false, matieres: false, salles: false, notifications: false });
      }
    };

    fetchData();
  }, []);

  const openModal = (type, data = null) => {
    if (type === 'upload') {
      setDocumentForm({ nom: '', type: '', file: null, annee_academique_id: '', matiere_id: '', salle_ids: [], raison: '' });
    } else if (type === 'details') {
      setDocumentForm({ ...data });
    }
    setModal({ isOpen: true, type, data });
    setError('');
  };

  const closeModal = () => {
    setModal({ isOpen: false, type: '', data: null });
    setDocumentForm({ nom: '', type: '', file: null, annee_academique_id: '', matiere_id: '', salle_ids: [], raison: '' });
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
      toast.error('Erreur lors de l’envoi de la notification', {
        position: 'top-right',
        autoClose: 3000,
        style: { backgroundColor: '#E74C3C', color: '#FFFFFF', fontSize: '0.875rem' },
      });
    }
  };

  const handleDocumentSubmit = async (e) => {
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

    const formData = new FormData();
    formData.append('nom', documentForm.nom);
    formData.append('type', documentForm.type);
    if (documentForm.file) formData.append('file', documentForm.file);
    formData.append('annee_academique_id', documentForm.annee_academique_id);
    if (documentForm.matiere_id) formData.append('matiere_id', documentForm.matiere_id);
    documentForm.salle_ids.forEach((id, index) => formData.append(`salle_ids[${index}]`, id));
    if (documentForm.raison) formData.append('raison', documentForm.raison);

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/documents', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      setDocuments((prev) => [...prev, {
        ...response.data.document,
        source: 'document',
        uploader: {
          id: response.data.document.uploader_id,
          nom: response.data.document.uploader?.nom,
          prenom: response.data.document.uploader?.prenom,
          role: response.data.document.uploader?.role || [{ name: 'N/A' }],
        },
      }]);
      toast.success(`Document ${documentForm.nom} téléversé`, {
        position: 'top-right',
        autoClose: 3000,
        style: { backgroundColor: '#27AE60', color: '#FFFFFF', fontSize: '0.875rem' },
      });
      await sendNotification(`Document ${documentForm.nom} téléversé`, token);
      closeModal();
    } catch (err) {
      const errorMsg = err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat().join(', ')
        : 'Erreur lors du téléversement';
      setError(errorMsg);
      toast.error(errorMsg, {
        position: 'top-right',
        autoClose: 3000,
        style: { backgroundColor: '#E74C3C', color: '#FFFFFF', fontSize: '0.875rem' },
      });
    }
  };

  const handleValidateDocument = async (rapportId, documentName, statut, commentaire = '') => {
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
        `http://127.0.0.1:8000/api/rapports-stage/${rapportId}/valider`,
        { statut, commentaire },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.rapportId === rapportId && doc.source === 'rapport'
            ? { ...doc, statut: response.data.rapport.statut, commentaire: response.data.rapport.commentaire }
            : doc
        )
      );
      toast.success(`Rapport ${documentName} ${statut === 'valide' ? 'validé' : 'rejeté'}`, {
        position: 'top-right',
        autoClose: 3000,
        style: { backgroundColor: statut === 'valide' ? '#27AE60' : '#E74C3C', color: '#FFFFFF', fontSize: '0.875rem' },
      });
      await sendNotification(`Rapport ${documentName} ${statut === 'valide' ? 'validé' : 'rejeté'}`, token);
    } catch (err) {
      const errorMsg = err.response?.data?.message || `Erreur lors de la ${statut === 'valide' ? 'validation' : 'rejet'} du rapport`;
      toast.error(errorMsg, {
        position: 'top-right',
        autoClose: 3000,
        style: { backgroundColor: '#E74C3C', color: '#FFFFFF', fontSize: '0.875rem' },
      });
    }
  };

  const filteredDocuments = documents.filter((doc) =>
    (doc.nom?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    let valA = sortBy === 'uploader' ? (a.uploader?.nom || '') : (a[sortBy] || '');
    let valB = sortBy === 'uploader' ? (b.uploader?.nom || '') : (b[sortBy] || '');
    if (typeof valA === 'string' && typeof valB === 'string') {
      valA = valA.toLowerCase();
      valB = valB.toLowerCase();
    }
    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const paginatedDocuments = sortedDocuments.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);

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
          .document-card {
            transition: all 0.3s ease;
          }
          .document-card:hover {
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
            .document-card {
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
            .document-card {
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
              <FaFileAlt className="w-5 h-5 sm:w-6 sm:h-6" /> Gestion des Documents
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
              className="bg-white/95 backdrop-blur-md rounded-xl shadow-xl p-4 sm:p-6 document-card max-w-4xl xl:max-w-5xl mx-auto"
            >
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <FaFileAlt className="text-[#093A5D] w-5 h-5 sm:w-6 sm:h-6" />
                  <h2 className="text-lg sm:text-xl font-semibold text-[#093A5D]">Liste des Documents et Rapports</h2>
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
                    onClick={() => openModal('upload')}
                    className="bg-[#F49100] text-white p-2 sm:p-2.5 rounded-lg flex items-center gap-2 hover:bg-[#e07b00] hover:scale-105 transition-all duration-200 w-full sm:w-auto"
                  >
                    <FaPlus className="w-4 h-4" /> Téléverser
                  </button>
                </div>
              </div>
              {loading.documents ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-10 sm:h-12 bg-gray-200 rounded-lg"></div>
                  <div className="h-10 sm:h-12 bg-gray-200 rounded-lg"></div>
                </div>
              ) : paginatedDocuments.length ? (
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
                            <button onClick={() => toggleSort('type')} className="flex items-center gap-2">
                              Type {sortBy === 'type' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </button>
                          </th>
                          <th className="p-2 sm:p-3 text-left hidden md:table-cell">Extension</th>
                          <th className="p-2 sm:p-3 text-left">
                            <button onClick={() => toggleSort('uploader')} className="flex items-center gap-2">
                              Uploader {sortBy === 'uploader' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </button>
                          </th>
                          <th className="p-2 sm:p-3 text-left hidden lg:table-cell">Année</th>
                          <th className="p-2 sm:p-3 text-left hidden xl:table-cell">Statut</th>
                          <th className="p-2 sm:p-3 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedDocuments.map((doc) => (
                          <motion.tr
                            key={`${doc.id}-${doc.source}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.15 }}
                            className="border-b border-gray-200 hover:bg-[#093A5D]/5"
                          >
                            <td className="p-2 sm:p-3">{doc.nom}</td>
                            <td className="p-2 sm:p-3 hidden sm:table-cell">{doc.type}</td>
                            <td className="p-2 sm:p-3 hidden md:table-cell">{doc.extension}</td>
                            <td className="p-2 sm:p-3">
                              {doc.uploader 
                                ? `${doc.uploader.nom} ${doc.uploader.prenom} (${doc.uploader.role[0]?.name || 'N/A'})`
                                : 'Inconnu'}
                            </td>
                            <td className="p-2 sm:p-3 hidden lg:table-cell">{doc.anneeAcademique?.annee || 'N/A'}</td>
                            <td className="p-2 sm:p-3 hidden xl:table-cell">
                              {doc.source === 'rapport' ? (
                                doc.statut === 'valide' ? (
                                  <span className="text-[#27AE60] font-semibold">Validé</span>
                                ) : doc.statut === 'rejete' ? (
                                  <span className="text-[#E74C3C] font-semibold">Rejeté</span>
                                ) : (
                                  <span className="text-[#F1C40F] font-semibold">En attente</span>
                                )
                              ) : doc.approved ? (
                                <span className="text-[#27AE60] font-semibold">Approuvé</span>
                              ) : (
                                <span className="text-[#F1C40F] font-semibold">En attente</span>
                              )}
                            </td>
                            <td className="p-2 sm:p-3 flex gap-2 sm:gap-3">
                              <button
                                onClick={() => openModal('details', doc)}
                                className="text-[#27AE60] hover:text-green-700 hover:scale-110 transition-all duration-200"
                                title="Voir détails"
                              >
                                <FaEye className="w-4 h-4 sm:w-5 sm:h-5" />
                              </button>
                              {doc.source === 'rapport' && doc.statut === 'en_attente' && (
                                <>
                                  <button
                                    onClick={() => handleValidateDocument(doc.rapportId, doc.nom, 'valide')}
                                    className="text-[#093A5D] hover:text-[#27AE60] hover:scale-110 transition-all duration-200"
                                    title="Valider"
                                  >
                                    <FaCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                                  </button>
                                  <button
                                    onClick={() => handleValidateDocument(doc.rapportId, doc.nom, 'rejete')}
                                    className="text-[#093A5D] hover:text-[#E74C3C] hover:scale-110 transition-all duration-200"
                                    title="Rejeter"
                                  >
                                    <FaTimes className="w-4 h-4 sm:w-5 sm:h-5" />
                                  </button>
                                </>
                              )}
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="card-container">
                    {paginatedDocuments.map((doc) => (
                      <motion.div
                        key={`${doc.id}-${doc.source}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.15 }}
                        className="bg-white/90 rounded-lg p-4 shadow-md border border-gray-200"
                      >
                        <div className="flex flex-col gap-2">
                          <div>
                            <span className="font-semibold text-[#093A5D] text-xs">Nom:</span> {doc.nom}
                          </div>
                          <div>
                            <span className="font-semibold text-[#093A5D] text-xs">Type:</span> {doc.type}
                          </div>
                          <div>
                            <span className="font-semibold text-[#093A5D] text-xs">Uploader:</span>{' '}
                            {doc.uploader 
                              ? `${doc.uploader.nom} ${doc.uploader.prenom} (${doc.uploader.role[0]?.name || 'N/A'})`
                              : 'Inconnu'}
                          </div>
                          <div>
                            <span className="font-semibold text-[#093A5D] text-xs">Année:</span> {doc.anneeAcademique?.annee || 'N/A'}
                          </div>
                          <div>
                            <span className="font-semibold text-[#093A5D] text-xs">Statut:</span>{' '}
                            {doc.source === 'rapport' ? (
                              doc.statut === 'valide' ? (
                                <span className="text-[#27AE60] font-semibold">Validé</span>
                              ) : doc.statut === 'rejete' ? (
                                <span className="text-[#E74C3C] font-semibold">Rejeté</span>
                              ) : (
                                <span className="text-[#F1C40F] font-semibold">En attente</span>
                              )
                            ) : doc.approved ? (
                              <span className="text-[#27AE60] font-semibold">Approuvé</span>
                              ) : (
                                <span className="text-[#F1C40F] font-semibold">En attente</span>
                              )}
                          </div>
                          <div className="flex gap-3 mt-2">
                            <button
                              onClick={() => openModal('details', doc)}
                              className="text-[#27AE60] hover:text-green-700 hover:scale-110 transition-all duration-200"
                              title="Voir détails"
                            >
                              <FaEye className="w-4 h-4" />
                            </button>
                            {doc.source === 'rapport' && doc.statut === 'en_attente' && (
                              <>
                                <button
                                  onClick={() => handleValidateDocument(doc.rapportId, doc.nom, 'valide')}
                                  className="text-[#093A5D] hover:text-[#27AE60] hover:scale-110 transition-all duration-200"
                                  title="Valider"
                                >
                                  <FaCheck className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleValidateDocument(doc.rapportId, doc.nom, 'rejete')}
                                  className="text-[#093A5D] hover:text-[#E74C3C] hover:scale-110 transition-all duration-200"
                                  title="Rejeter"
                                >
                                  <FaTimes className="w-4 h-4" />
                                </button>
                              </>
                            )}
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
                <p className="text-xs sm:text-sm text-[#093A5D]/70 text-center">Aucun document ou rapport disponible.</p>
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
                    {modal.type === 'upload' && (
                      <>
                        <div className="flex justify-between items-center mb-4 sm:mb-6">
                          <h3 className="text-base sm:text-xl font-semibold text-[#093A5D]">
                            Téléverser un Document
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
                        <form onSubmit={handleDocumentSubmit} className="space-y-3 sm:space-y-4">
                          <input
                            type="text"
                            placeholder="Nom du document"
                            value={documentForm.nom}
                            onChange={(e) => setDocumentForm({ ...documentForm, nom: e.target.value })}
                            className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#F49100] focus:border-transparent transition-all"
                            required
                          />
                          <select
                            value={documentForm.type}
                            onChange={(e) => setDocumentForm({ ...documentForm, type: e.target.value })}
                            className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#F49100] focus:border-transparent transition-all"
                            required
                          >
                            <option value="">Type de document</option>
                            <option value="cours">Cours</option>
                            <option value="rapport">Rapport</option>
                            <option value="autre">Autre</option>
                          </select>
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={(e) => setDocumentForm({ ...documentForm, file: e.target.files[0] })}
                            className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#F49100] focus:border-transparent transition-all"
                            required
                          />
                          <select
                            value={documentForm.annee_academique_id}
                            onChange={(e) => setDocumentForm({ ...documentForm, annee_academique_id: e.target.value })}
                            className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#F49100] focus:border-transparent transition-all"
                            required
                          >
                            <option value="">Année académique</option>
                            {annees.map((annee) => (
                              <option key={annee.id} value={annee.id}>{annee.annee}</option>
                            ))}
                          </select>
                          <select
                            value={documentForm.matiere_id}
                            onChange={(e) => setDocumentForm({ ...documentForm, matiere_id: e.target.value })}
                            className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#F49100] focus:border-transparent transition-all"
                          >
                            <option value="">Matière (optionnel)</option>
                            {matieres.map((matiere) => (
                              <option key={matiere.id} value={matiere.id}>{matiere.nom}</option>
                            ))}
                          </select>
                          <select
                            multiple
                            value={documentForm.salle_ids}
                            onChange={(e) => setDocumentForm({ ...documentForm, salle_ids: Array.from(e.target.selectedOptions, option => option.value) })}
                            className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#F49100] focus:border-transparent transition-all"
                          >
                            <option value="">Salles (optionnel)</option>
                            {salles.map((salle) => (
                              <option key={salle.id} value={salle.id}>{salle.nom}</option>
                            ))}
                          </select>
                          <textarea
                            placeholder="Raison (optionnel)"
                            value={documentForm.raison}
                            onChange={(e) => setDocumentForm({ ...documentForm, raison: e.target.value })}
                            className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#F49100] focus:border-transparent transition-all"
                            rows="3"
                          />
                          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                            <button
                              type="submit"
                              className="bg-[#F49100] text-white p-2 sm:p-3 rounded-lg flex-1 hover:bg-[#e07b00] hover:scale-105 transition-all duration-200 text-xs sm:text-sm"
                            >
                              Téléverser
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
                          <h3 className="text-base sm:text-xl font-semibold text-[#093A5D]">Détails du Document</h3>
                          <button
                            onClick={closeModal}
                            className="text-[#093A5D]/60 hover:text-[#E74C3C] hover:rotate-90 transition-all duration-200"
                          >
                            <FaTimes className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                        </div>
                        <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm text-[#093A5D]">
                          <p><strong>Nom :</strong> {modal.data?.nom || 'N/A'}</p>
                          <p><strong>Type :</strong> {modal.data?.type || 'N/A'}</p>
                          <p><strong>Extension :</strong> {modal.data?.extension || 'N/A'}</p>
                          <p>
                            <strong>Uploader :</strong>{' '}
                            {modal.data?.uploader 
                              ? `${modal.data.uploader.nom} ${modal.data.uploader.prenom} (${modal.data.uploader.role[0]?.name || 'N/A'})`
                              : 'Inconnu'}
                          </p>
                          <p><strong>Année :</strong> {modal.data?.anneeAcademique?.annee || 'N/A'}</p>
                          <p><strong>Matière :</strong> {modal.data?.matiere?.nom || 'N/A'}</p>
                          <p><strong>Salles :</strong> {modal.data?.salle_ids?.length ? modal.data.salle_ids.join(', ') : 'N/A'}</p>
                          <p><strong>Raison :</strong> {modal.data?.raison || 'N/A'}</p>
                          <p>
                            <strong>Statut :</strong>{' '}
                            {modal.data?.source === 'rapport' ? (
                              modal.data.statut === 'valide' ? (
                                <span className="text-[#27AE60] font-semibold">Validé</span>
                              ) : modal.data.statut === 'rejete' ? (
                                <span className="text-[#E74C3C] font-semibold">Rejeté</span>
                              ) : (
                                <span className="text-[#F1C40F] font-semibold">En attente</span>
                              )
                            ) : modal.data?.approved ? (
                              <span className="text-[#27AE60] font-semibold">Approuvé</span>
                            ) : (
                              <span className="text-[#F1C40F] font-semibold">En attente</span>
                            )}
                          </p>
                          {modal.data?.source === 'rapport' && modal.data?.commentaire && (
                            <p><strong>Commentaire :</strong> {modal.data.commentaire}</p>
                          )}
                          <p>
                            <strong>Lien :</strong>{' '}
                            <a href={`http://127.0.0.1:8000/storage/${modal.data?.url}`} target="_blank" rel="noopener noreferrer" className="text-[#F49100] hover:underline">
                              Visualiser le Document
                            </a>
                          </p>
                        </div>
                        <button
                          onClick={closeModal}
                          className="mt-4 sm:mt-6 bg-gray-200 text-[#093A5D]/90 p-2 sm:p-3 rounded-lg w-full hover:bg-gray-300 hover:scale-105 transition-all duration-200 text-xs sm:text-sm"
                        >
                          Fermer
                        </button>
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

export default Document_RA;
