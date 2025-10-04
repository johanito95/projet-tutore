import React, { useState, useEffect, Component, useRef } from 'react';
import { FaBook, FaSearch, FaInfoCircle, FaEdit, FaTimes, FaFileExcel } from 'react-icons/fa';
import Sidebar_RA from '../pages/Sidebar_RA';
import Topbar from '../pages/Topbar';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';

// Error Boundary
class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-[#E74C3C] text-center">
          <p>Une erreur est survenue : {this.state.error?.message || 'Erreur inconnue'}</p>
          <p>Veuillez recharger la page ou contacter le support.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

const Presence_RA = () => {
  const [presences, setPresences] = useState([]);
  const [salles, setSalles] = useState([]);
  const [selectedSalle, setSelectedSalle] = useState('');
  const [loading, setLoading] = useState({ presences: true, salles: true });
  const [error, setError] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [user, setUser] = useState(null);
  const [selectedPresence, setSelectedPresence] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editPresence, setEditPresence] = useState(null);
  const [editEtat, setEditEtat] = useState('');
  const [editRemarque, setEditRemarque] = useState('');
  const pieChartRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Utilisateur non authentifié', {
        position: 'top-right',
        autoClose: 3000,
        style: { backgroundColor: '#E74C3C', color: '#FFFFFF', fontSize: '0.875rem' },
      });
      setLoading({ presences: false, salles: false });
      return;
    }

    const fetchData = async () => {
      try {
        const [userResponse, sallesResponse, presencesResponse] = await Promise.all([
          axios.get('http://127.0.0.1:8000/api/infos', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://127.0.0.1:8000/api/showclasse', { headers: { Authorization: `Bearer ${token}` } }),
          selectedSalle
            ? axios.get(`http://127.0.0.1:8000/api/presences/salle/${selectedSalle}`, {
                headers: { Authorization: `Bearer ${token}` },
              })
            : Promise.resolve({ data: [] }),
        ]);

        setUser(userResponse.data);
        setSalles(Array.isArray(sallesResponse.data) ? sallesResponse.data : []);
        setPresences(Array.isArray(presencesResponse.data) ? presencesResponse.data : []);

        console.log('SelectedSalle:', selectedSalle);
        console.log('Presences:', presencesResponse.data);
        console.log('PieChartData:', getPieChartData(presencesResponse.data));

        presencesResponse.data.forEach((presence, index) => {
          if (!presence.appel?.cours) {
            console.warn(`Présence #${index + 1} (ID: ${presence.id}) n'a pas de cours associé`);
            toast.warn(`Présence ID ${presence.id} sans cours associé`, {
              position: 'top-right',
              autoClose: 3000,
              style: { backgroundColor: '#E74C3C', color: '#FFFFFF', fontSize: '0.875rem' },
            });
          }
        });
      } catch (err) {
        const errorMsg = err.response?.data?.message || 'Erreur lors de la récupération des données';
        setError(errorMsg);
        toast.error(errorMsg, {
          position: 'top-right',
          autoClose: 3000,
          style: { backgroundColor: '#E74C3C', color: '#FFFFFF', fontSize: '0.875rem' },
        });
      } finally {
        setLoading({ presences: false, salles: false });
      }
    };

    fetchData();
  }, [selectedSalle]);

  const getPieChartData = (presences) => {
    const presentCount = presences.filter((p) => p.etat === 'present').length;
    const absentCount = presences.filter((p) => p.etat === 'absent').length;
    console.log('PresentCount:', presentCount, 'AbsentCount:', absentCount);
    return [
      { name: 'Présents', value: presentCount, color: '#27AE60' },
      { name: 'Absents', value: absentCount, color: '#E74C3C' },
    ].filter((entry) => entry.value > 0);
  };

  const groupPresencesByCours = (presences) => {
    const grouped = {};
    presences.forEach((presence) => {
      const coursId = presence.appel?.cours?.id || 'unknown';
      const coursLabel = presence.appel?.cours
        ? `${presence.appel.cours.matiere?.nom || 'N/A'} - ${presence.appel.cours.salle?.nom || 'N/A'} (${
            presence.appel.cours.semestre?.libelle || 'N/A'
          }, ${presence.appel.cours.anneeAcademique?.annee || 'N/A'})`
        : 'Cours non trouvé';
      if (!grouped[coursId]) {
        grouped[coursId] = { label: coursLabel, presences: [] };
      }
      grouped[coursId].presences.push(presence);
    });
    return Object.values(grouped);
  };

  const handleDetailsClick = (presence) => {
    setSelectedPresence(presence);
    setIsModalOpen(true);
  };

  const handleEditClick = (presence) => {
    setEditPresence(presence);
    setEditEtat(presence.etat || '');
    setEditRemarque(presence.remarque || '');
  };

  const handleUpdatePresence = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.put(
        `http://127.0.0.1:8000/api/presences/${editPresence.id}`,
        { etat: editEtat, remarque: editRemarque },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Présence mise à jour avec succès', {
        position: 'top-right',
        autoClose: 3000,
        style: { backgroundColor: '#27AE60', color: '#FFFFFF', fontSize: '0.875rem' },
      });
      setPresences((prev) =>
        prev.map((p) => (p.id === editPresence.id ? { ...p, etat: editEtat, remarque: editRemarque } : p))
      );
      setEditPresence(null);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Erreur lors de la mise à jour';
      toast.error(errorMsg, {
        position: 'top-right',
        autoClose: 3000,
        style: { backgroundColor: '#E74C3C', color: '#FFFFFF', fontSize: '0.875rem' },
      });
    }
  };

  const exportToExcel = async () => {
    if (!selectedSalle || presences.length === 0) {
      toast.error('Aucune donnée à exporter. Sélectionnez une salle avec des présences.', {
        position: 'top-right',
        autoClose: 3000,
        style: { backgroundColor: '#E74C3C', color: '#FFFFFF', fontSize: '0.875rem' },
      });
      return;
    }

    try {
      const ExcelJS = (await import('exceljs')).default;
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Présences');

      // Ajouter les en-têtes
      worksheet.columns = [
        { header: 'Étudiant', key: 'etudiant', width: 20 },
        { header: 'Cours', key: 'cours', width: 20 },
        { header: 'Salle', key: 'salle', width: 15 },
        { header: 'Semestre', key: 'semestre', width: 15 },
        { header: 'Année Académique', key: 'annee', width: 15 },
        { header: 'Date', key: 'date', width: 15 },
        { header: 'Statut', key: 'statut', width: 10 },
        { header: 'Remarque', key: 'remarque', width: 20 },
      ];

      // Style des en-têtes
      worksheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF093A5D' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      });

      // Ajouter les données
      presences.forEach((presence) => {
        worksheet.addRow({
          etudiant: (presence.etudiant?.utilisateur?.nom || 'N/A') + ' ' + (presence.etudiant?.utilisateur?.prenom || 'N/A'),
          cours: presence.appel?.cours?.matiere?.nom || 'N/A',
          salle: presence.appel?.cours?.salle?.nom || 'N/A',
          semestre: presence.appel?.cours?.semestre?.libelle || 'N/A',
          annee: presence.appel?.cours?.anneeAcademique?.annee || 'N/A',
          date: presence.date_heure
            ? new Date(presence.date_heure).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })
            : 'N/A',
          statut: presence.etat === 'present' ? 'Présent' : presence.etat === 'absent' ? 'Absent' : 'N/A',
          remarque: presence.remarque || 'Aucune',
        });
      });

      // Ajouter le pie chart comme image
      if (pieChartRef.current) {
        try {
          const canvas = await html2canvas(pieChartRef.current, { backgroundColor: '#FFFFFF' });
          const imgData = canvas.toDataURL('image/png');
          const imageId = workbook.addImage({
            base64: imgData,
            extension: 'png',
          });
          worksheet.addImage(imageId, {
            tl: { col: 0, row: presences.length + 2 },
            ext: { width: 300, height: 300 },
          });
        } catch (imgError) {
          console.warn('Erreur lors de la capture du pie chart:', imgError);
          toast.warn('Le pie chart n’a pas pu être inclus dans l’exportation.', {
            position: 'top-right',
            autoClose: 3000,
            style: { backgroundColor: '#F49100', color: '#FFFFFF', fontSize: '0.875rem' },
          });
        }
      }

      // Générer et télécharger le fichier
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/octet-stream' });
      saveAs(blob, `Présences_Salle_${salles.find((s) => String(s.id) === String(selectedSalle))?.nom || 'N/A'}_${new Date().toISOString().split('T')[0]}.xlsx`);

      toast.success('Données exportées avec succès !', {
        position: 'top-right',
        autoClose: 3000,
        style: { backgroundColor: '#27AE60', color: '#FFFFFF', fontSize: '0.875rem' },
      });
    } catch (err) {
      console.error('Erreur lors de l’exportation Excel:', err);
      toast.error('Erreur lors de l’exportation Excel: ' + err.message, {
        position: 'top-right',
        autoClose: 3000,
        style: { backgroundColor: '#E74C3C', color: '#FFFFFF', fontSize: '0.875rem' },
      });
    }
  };

  return (
    <ErrorBoundary>
      <style>
        {`
          .presence-card {
            transition: all 0.3s ease;
          }
          .presence-card:hover {
            transform: scale(1.02);
            box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
          }
          .pie-chart-container {
            max-width: 100%;
            width: 100%;
            max-height: 300px;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
          }
          .modal-content {
            background: white;
            padding: 1.5rem;
            border-radius: 0.5rem;
            max-width: 90%;
            width: 400px;
            position: relative;
          }
          .modal-close {
            position: absolute;
            top: 0.5rem;
            right: 0.5rem;
            cursor: pointer;
          }
          @media (max-width: 640px) {
            .presence-card {
              padding: 1rem;
            }
            .table-container {
              display: none;
            }
            .card-container {
              display: flex;
              flex-direction: column;
              gap: 1rem;
            }
            .pie-chart-container {
              max-width: 80vw;
              max-height: 200px;
            }
          }
          @media (min-width: 641px) {
            .card-container {
              display: none;
            }
            .table-container {
              display: block;
            }
            .pie-chart-container {
              max-width: 300px;
            }
          }
          @media (min-width: 1024px) {
            .presence-card {
              max-width: 80rem;
            }
            .pie-chart-container {
              max-width: 350px;
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
              <FaBook className="w-5 h-5 sm:w-6 sm:h-6" /> Présences par Salle
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
              className="bg-white/95 backdrop-blur-md rounded-xl shadow-xl p-4 sm:p-6 presence-card max-w-4xl xl:max-w-5xl mx-auto"
            >
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <FaBook className="text-[#093A5D] w-5 h-5 sm:w-6 sm:h-6" />
                  <h2 className="text-lg sm:text-xl font-semibold text-[#093A5D]">Filtrer par salle</h2>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#093A5D]/50 w-4 h-4 sm:w-5 sm:h-5" />
                    <select
                      value={selectedSalle}
                      onChange={(e) => setSelectedSalle(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#F49100] focus:border-transparent transition-all"
                    >
                      <option value="">Sélectionner une salle</option>
                      {salles.map((salle) => (
                        <option key={salle.id} value={salle.id}>
                          {salle.nom} ({salle.filiere?.nom || 'N/A'})
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={exportToExcel}
                    className="bg-[#093A5D] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#F49100] transition-all text-xs sm:text-sm"
                    disabled={loading.presences || !selectedSalle || presences.length === 0}
                  >
                    <FaFileExcel className="w-4 h-4 sm:w-5 sm:h-5" />
                    Exporter Excel
                  </button>
                </div>
              </div>
              {loading.presences ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-10 sm:h-12 bg-gray-200 rounded-lg"></div>
                  <div className="h-10 sm:h-12 bg-gray-200 rounded-lg"></div>
                </div>
              ) : selectedSalle && presences.length ? (
                <>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.15 }}
                    className="mb-8"
                    ref={pieChartRef}
                  >
                    <h3 className="text-lg sm:text-xl font-semibold text-[#093A5D] mb-4">
                      Présences dans la salle : {salles.find((s) => String(s.id) === String(selectedSalle))?.nom || 'N/A'}
                    </h3>
                    {getPieChartData(presences).length > 0 ? (
                      <div className="pie-chart-container mx-auto">
                        <PieChart width={300} height={300}>
                          <Pie
                            data={getPieChartData(presences)}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label={({ name, value }) => `${name}: ${value}`}
                          >
                            {getPieChartData(presences).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value, name) => {
                              const total = presences.length;
                              const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                              return `${name}: ${value} (${percentage}%)`;
                            }}
                          />
                          <Legend align="center" verticalAlign="bottom" />
                        </PieChart>
                      </div>
                    ) : (
                      <p className="text-xs sm:text-sm text-[#093A5D]/70 text-center">
                        Aucune donnée de présence disponible pour ce diagramme.
                      </p>
                    )}
                  </motion.div>

                  {groupPresencesByCours(presences).map((coursGroup, idx) => (
                    <motion.div
                      key={coursGroup.label + idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.15 }}
                      className="mb-8"
                    >
                      <h3 className="text-lg sm:text-xl font-semibold text-[#093A5D] mb-4">{coursGroup.label}</h3>
                      <div className="table-container overflow-x-auto">
                        <table className="w-full text-xs sm:text-sm">
                          <thead>
                            <tr className="bg-[#093A5D]/10">
                              <th className="p-2 sm:p-3 text-left">Étudiant</th>
                              <th className="p-2 sm:p-3 text-left hidden sm:table-cell">Cours</th>
                              <th className="p-2 sm:p-3 text-left hidden md:table-cell">Date</th>
                              <th className="p-2 sm:p-3 text-left">Statut</th>
                              <th className="p-2 sm:p-3 text-left">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {coursGroup.presences.map((presence) => (
                              <motion.tr
                                key={presence.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.15 }}
                                className="border-b border-gray-200 hover:bg-[#093A5D]/5"
                              >
                                <td className="p-2 sm:p-3">
                                  {(presence.etudiant?.utilisateur?.nom || 'N/A') + ' ' + (presence.etudiant?.utilisateur?.prenom || 'N/A')}
                                </td>
                                <td className="p-2 sm:p-3 hidden sm:table-cell">
                                  {presence.appel?.cours
                                    ? `${presence.appel.cours.matiere?.nom || 'N/A'} - ${presence.appel.cours.salle?.nom || 'N/A'} (${
                                        presence.appel.cours.semestre?.libelle || 'N/A'
                                      }, ${presence.appel.cours.anneeAcademique?.annee || 'N/A'})`
                                    : 'Cours non trouvé'}
                                </td>
                                <td className="p-2 sm:p-3 hidden md:table-cell">
                                  {presence.date_heure
                                    ? new Date(presence.date_heure).toLocaleDateString('fr-FR', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric',
                                      })
                                    : 'N/A'}
                                </td>
                                <td className="p-2 sm:p-3">{presence.etat === 'present' ? 'Présent' : presence.etat === 'absent' ? 'Absent' : 'N/A'}</td>
                                <td className="p-2 sm:p-3 flex gap-2">
                                  <FaInfoCircle
                                    className="text-[#093A5D] cursor-pointer hover:text-[#F49100]"
                                    onClick={() => handleDetailsClick(presence)}
                                  />
                                  <FaEdit
                                    className="text-[#093A5D] cursor-pointer hover:text-[#F49100]"
                                    onClick={() => handleEditClick(presence)}
                                  />
                                </td>
                              </motion.tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="card-container">
                        {coursGroup.presences.map((presence) => (
                          <motion.div
                            key={presence.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.15 }}
                            className="bg-white/90 rounded-lg p-4 shadow-md border border-gray-200"
                          >
                            <div className="flex flex-col gap-2">
                              <div>
                                <span className="font-semibold text-[#093A5D] text-xs">Étudiant:</span>{' '}
                                {(presence.etudiant?.utilisateur?.nom || 'N/A') + ' ' + (presence.etudiant?.utilisateur?.prenom || 'N/A')}
                              </div>
                              <div>
                                <span className="font-semibold text-[#093A5D] text-xs">Cours:</span>{' '}
                                {presence.appel?.cours
                                  ? `${presence.appel.cours.matiere?.nom || 'N/A'} - ${presence.appel.cours.salle?.nom || 'N/A'} (${
                                      presence.appel.cours.semestre?.libelle || 'N/A'
                                    }, ${presence.appel.cours.anneeAcademique?.annee || 'N/A'})`
                                  : 'Cours non trouvé'}
                              </div>
                              <div>
                                <span className="font-semibold text-[#093A5D] text-xs">Date:</span>{' '}
                                {presence.date_heure
                                  ? new Date(presence.date_heure).toLocaleDateString('fr-FR', {
                                      day: '2-digit',
                                      month: '2-digit',
                                      year: 'numeric',
                                    })
                                  : 'N/A'}
                              </div>
                              <div>
                                <span className="font-semibold text-[#093A5D] text-xs">Statut:</span>{' '}
                                {presence.etat === 'present' ? 'Présent' : presence.etat === 'absent' ? 'Absent' : 'N/A'}
                              </div>
                              <div className="flex gap-2">
                                <FaInfoCircle
                                  className="text-[#093A5D] cursor-pointer hover:text-[#F49100]"
                                  onClick={() => handleDetailsClick(presence)}
                                />
                                <FaEdit
                                  className="text-[#093A5D] cursor-pointer hover:text-[#F49100]"
                                  onClick={() => handleEditClick(presence)}
                                />
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </>
              ) : (
                <p className="text-xs sm:text-sm text-[#093A5D]/70 text-center">
                  {selectedSalle ? 'Aucune présence pour cette salle.' : 'Veuillez sélectionner une salle.'}
                </p>
              )}
            </motion.div>
          </div>
        </div>

        {/* Modal pour détails */}
        {isModalOpen && selectedPresence && (
          <div className="modal-overlay">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.15 }}
              className="modal-content"
            >
              <FaTimes className="modal-close text-[#093A5D] w-5 h-5" onClick={() => setIsModalOpen(false)} />
              <h3 className="text-lg font-semibold text-[#093A5D] mb-4">Détails de la présence</h3>
              <div className="flex flex-col gap-2 text-sm">
                <p>
                  <span className="font-semibold">Étudiant:</span>{' '}
                  {(selectedPresence.etudiant?.utilisateur?.nom || 'N/A') + ' ' + (selectedPresence.etudiant?.utilisateur?.prenom || 'N/A')}
                </p>
                <p>
                  <span className="font-semibold">Matière:</span>{' '}
                  {selectedPresence.appel?.cours?.matiere?.nom || 'N/A'}
                </p>
                <p>
                  <span className="font-semibold">Salle:</span>{' '}
                  {selectedPresence.appel?.cours?.salle?.nom || 'N/A'}
                </p>
                <p>
                  <span className="font-semibold">Semestre:</span>{' '}
                  {selectedPresence.appel?.cours?.semestre?.libelle || 'N/A'}
                </p>
                <p>
                  <span className="font-semibold">Année Académique:</span>{' '}
                  {selectedPresence.appel?.cours?.anneeAcademique?.annee || 'N/A'}
                </p>
                <p>
                  <span className="font-semibold">Date:</span>{' '}
                  {selectedPresence.date_heure
                    ? new Date(selectedPresence.date_heure).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })
                    : 'N/A'}
                </p>
                <p>
                  <span className="font-semibold">Enseignant:</span>{' '}
                  {(selectedPresence.appel?.enseignant?.utilisateur?.nom || 'N/A') + ' ' + 
                   (selectedPresence.appel?.enseignant?.utilisateur?.prenom || 'N/A')}
                </p>
                <p>
                  <span className="font-semibold">Statut:</span>{' '}
                  {selectedPresence.etat === 'present' ? 'Présent' : selectedPresence.etat === 'absent' ? 'Absent' : 'N/A'}
                </p>
                <p>
                  <span className="font-semibold">Remarque:</span>{' '}
                  {selectedPresence.remarque || 'Aucune'}
                </p>
              </div>
            </motion.div>
          </div>
        )}

        {/* Modal pour mise à jour */}
        {editPresence && (
          <div className="modal-overlay">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.15 }}
              className="modal-content"
            >
              <FaTimes className="modal-close text-[#093A5D] w-5 h-5" onClick={() => setEditPresence(null)} />
              <h3 className="text-lg font-semibold text-[#093A5D] mb-4">Mettre à jour la présence</h3>
              <div className="flex flex-col gap-4 text-sm">
                <p>
                  <span className="font-semibold">Étudiant:</span>{' '}
                  {(editPresence.etudiant?.utilisateur?.nom || 'N/A') + ' ' + (editPresence.etudiant?.utilisateur?.prenom || 'N/A')}
                </p>
                <div>
                  <label className="font-semibold text-[#093A5D]">Statut:</label>
                  <select
                    value={editEtat}
                    onChange={(e) => setEditEtat(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F49100]"
                  >
                    <option value="present">Présent</option>
                    <option value="absent">Absent</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-[#093A5D]">Remarque:</label>
                  <textarea
                    value={editRemarque}
                    onChange={(e) => setEditRemarque(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F49100]"
                    rows="4"
                  />
                </div>
                <button
                  onClick={handleUpdatePresence}
                  className="bg-[#093A5D] text-white px-4 py-2 rounded-lg hover:bg-[#F49100] transition-all"
                >
                  Mettre à jour
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default Presence_RA;
