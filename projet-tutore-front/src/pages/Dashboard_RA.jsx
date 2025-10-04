import React, { useState, useEffect } from 'react';
import { FaChalkboardTeacher, FaUsers, FaCalendar, FaUser, FaDownload, FaSearch, FaTimes } from 'react-icons/fa';
import Sidebar_RA from '../pages/Sidebar_RA';
import Topbar from '../pages/Topbar';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard_RA = () => {
  const [user, setUser] = useState(null);
  const [classes, setClasses] = useState([]);
  const [etudiants, setEtudiants] = useState([]);
  const [annee, setAnnee] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [selectedClasse, setSelectedClasse] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState({ user: true, classes: true, etudiants: true, annee: true, notifications: true });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Utilisateur non authentifié', {
        position: 'top-right',
        autoClose: 3000,
        style: { backgroundColor: '#E74C3C', color: '#FFFFFF', fontSize: '0.875rem' },
      });
      setLoading({ user: false, classes: false, etudiants: false, annee: false, notifications: false });
      return;
    }

    const fetchData = async () => {
      try {
        const [userResponse, classesResponse, etudiantsResponse, anneeResponse, notificationsResponse] = await Promise.all([
          axios.get('http://127.0.0.1:8000/api/infos', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://127.0.0.1:8000/api/showclasse', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://127.0.0.1:8000/api/etudiants', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://127.0.0.1:8000/api/showyearschool', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://127.0.0.1:8000/api/notifications', { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        setUser(userResponse.data);
        setClasses(Array.isArray(classesResponse.data) ? classesResponse.data.filter(
          (classe) => classe.responsable?.enseignant?.utilisateur?.id === userResponse.data.id
        ) : []);
        setEtudiants(Array.isArray(etudiantsResponse.data) ? etudiantsResponse.data : []);
        setAnnee(Array.isArray(anneeResponse.data.data) ? anneeResponse.data.data[0] : null);
        setNotifications(Array.isArray(notificationsResponse.data) ? notificationsResponse.data : []);
      } catch (err) {
        console.error('Fetch error:', err);
        toast.error('Erreur lors du chargement des données', {
          position: 'top-right',
          autoClose: 3000,
          style: { backgroundColor: '#E74C3C', color: '#FFFFFF', fontSize: '0.875rem' },
        });
      } finally {
        setLoading({ user: false, classes: false, etudiants: false, annee: false, notifications: false });
      }
    };

    fetchData();
  }, []);

  const filteredEtudiants = selectedClasse === 'all'
    ? etudiants.filter((etudiant) =>
        `${etudiant.utilisateur?.nom} ${etudiant.utilisateur?.prenom}`.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : etudiants.filter((etudiant) =>
        etudiant.classe?.id === parseInt(selectedClasse) &&
        `${etudiant.utilisateur?.nom} ${etudiant.utilisateur?.prenom}`.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const exportToCSV = () => {
    const data = selectedClasse === 'all'
      ? classes.map((classe) => ({
          nom: classe.nom,
          filiere: classe.filiere?.nom || 'N/A',
          etudiants: classe.etudiants?.length || 0,
        }))
      : filteredEtudiants.map((etudiant) => ({
          nom: `${etudiant.utilisateur?.nom} ${etudiant.utilisateur?.prenom}`,
          classe: etudiant.classe?.nom || 'N/A',
        }));

    const csv = selectedClasse === 'all'
      ? [
          'Classe,Filière,Étudiants',
          ...data.map((item) => `${item.nom},${item.filiere},${item.etudiants}`),
        ].join('\n')
      : [
          'Nom,Classe',
          ...data.map((item) => `${item.nom},${item.classe}`),
        ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedClasse === 'all' ? 'classes.csv' : 'etudiants.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const UserInfo = ({ user, classes }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg shadow-md p-4 sm:p-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <FaUser className="text-[#093A5D] w-5 h-5" />
        <h2 className="text-lg font-semibold text-[#093A5D]">Profil</h2>
      </div>
      {loading.user || loading.classes ? (
        <div className="animate-pulse">
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      ) : (
        <p className="text-sm text-gray-700">
          <strong>Nom :</strong> {user?.nom} {user?.prenom}<br />
          <strong>Rôle :</strong> {user?.role || 'Responsable Académique'}<br />
          <strong>Classes gérées :</strong> {classes.length}
        </p>
      )}
    </motion.div>
  );

  const ClassList = ({ classes, setSelectedClasse }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="bg-white rounded-lg shadow-md p-4 sm:p-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <FaChalkboardTeacher className="text-[#093A5D] w-5 h-5" />
        <h2 className="text-lg font-semibold text-[#093A5D]">Mes Classes</h2>
      </div>
      {loading.classes ? (
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded mb-2"></div>
          <div className="h-10 bg-gray-200 rounded mb-2"></div>
        </div>
      ) : classes.length ? (
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {classes.map((classe) => (
            <motion.div
              key={classe.id}
              whileHover={{ scale: 1.02 }}
              className="p-3 border border-gray-200 rounded-lg hover:bg-[#093A5D]/5 cursor-pointer"
              onClick={() => setSelectedClasse(classe.id.toString())}
            >
              <p className="text-sm font-medium text-[#093A5D]">{classe.nom}</p>
              <p className="text-xs text-gray-500">
                Filière : {classe.filiere?.nom || 'N/A'} | Étudiants : {classe.etudiants?.length || 0}
              </p>
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">Aucune classe disponible.</p>
      )}
    </motion.div>
  );

  const StudentList = ({ etudiants, selectedClasse }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="bg-white rounded-lg shadow-md p-4 sm:p-6"
    >
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <FaUsers className="text-[#093A5D] w-5 h-5" />
          <h2 className="text-lg font-semibold text-[#093A5D]">
            {selectedClasse === 'all' ? 'Tous les Étudiants' : 'Étudiants de la Classe'}
          </h2>
        </div>
        <div className="relative w-full sm:w-64">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#093A5D]/50 w-4 h-4" />
          <input
            type="text"
            placeholder="Rechercher un étudiant..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F49100] focus:border-transparent"
          />
        </div>
      </div>
      {loading.etudiants ? (
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded mb-2"></div>
          <div className="h-10 bg-gray-200 rounded mb-2"></div>
        </div>
      ) : filteredEtudiants.length ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#093A5D]/10">
                <th className="p-3 text-left">Nom</th>
                <th className="p-3 text-left">Classe</th>
              </tr>
            </thead>
            <tbody>
              {filteredEtudiants.map((etudiant) => (
                <motion.tr
                  key={etudiant.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="border-b border-gray-200 hover:bg-[#093A5D]/5"
                >
                  <td className="p-3">{etudiant.utilisateur?.nom} {etudiant.utilisateur?.prenom}</td>
                  <td className="p-3">{etudiant.classe?.nom || 'N/A'}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-gray-500">Aucun étudiant trouvé.</p>
      )}
    </motion.div>
  );

  const AcademicYear = ({ annee }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
      className="bg-white rounded-lg shadow-md p-4 sm:p-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <FaCalendar className="text-[#093A5D] w-5 h-5" />
        <h2 className="text-lg font-semibold text-[#093A5D]">Année Académique</h2>
      </div>
      {loading.annee ? (
        <div className="animate-pulse">
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      ) : annee ? (
        <p className="text-sm text-gray-700">
          <strong>Année :</strong> {annee.annee || 'N/A'}
        </p>
      ) : (
        <p className="text-sm text-gray-500">Aucune année académique disponible.</p>
      )}
    </motion.div>
  );

  return (
    <>
      <style>
        {`
          .dashboard-card {
            transition: all 0.3s ease;
          }
          .dashboard-card:hover {
            transform: scale(1.02);
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
          }
          @media (max-width: 640px) {
            .dashboard-card {
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
          }
          @media (min-width: 641px) {
            .card-container {
              display: none;
            }
            .table-container {
              display: block;
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
              transition={{ duration: 0.3 }}
              className="text-xl sm:text-2xl font-bold text-[#093A5D] mb-6 flex items-center gap-3"
            >
              <FaChalkboardTeacher className="w-6 h-6" /> Dashboard Responsable Académique
            </motion.h1>
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
              <UserInfo user={user} classes={classes} />
              <AcademicYear annee={annee} />
              <div className="col-span-1 sm:col-span-2 lg:col-span-3">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                  className="bg-white rounded-lg shadow-md p-4 sm:p-6 dashboard-card"
                >
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                    <h2 className="text-lg font-semibold text-[#093A5D]">Gestion des Classes</h2>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <select
                        value={selectedClasse}
                        onChange={(e) => setSelectedClasse(e.target.value)}
                        className="bg-[#F49100] text-white text-sm p-2 rounded-lg hover:bg-[#e07b00]"
                      >
                        <option value="all">Toutes les classes</option>
                        {classes.map((classe) => (
                          <option key={classe.id} value={classe.id}>{classe.nom}</option>
                        ))}
                      </select>
                      <button
                        onClick={exportToCSV}
                        className="bg-[#F49100] text-white p-2 rounded-lg flex items-center gap-2 hover:bg-[#e07b00] hover:scale-105 transition-all"
                      >
                        <FaDownload className="w-4 h-4" /> Exporter
                      </button>
                    </div>
                  </div>
                  <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                    <ClassList classes={classes} setSelectedClasse={setSelectedClasse} />
                    <StudentList etudiants={etudiants} selectedClasse={selectedClasse} />
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard_RA;







// import React, { useState, useEffect } from 'react';
// import { FaChartBar, FaCalendar, FaUser, FaUsers, FaCheckCircle, FaBook, FaClock, FaDownload } from 'react-icons/fa';
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
// import Sidebar_RA from '../pages/Sidebar_RA';
// import Topbar from '../pages/Topbar';
// import axios from 'axios';

// const Dashboard_RA = () => {
//   const [user, setUser] = useState({
//     nom: 'Tchamgoue',
//     prenom: 'Jean',
//     role: 'Responsable Académique',
//   });
//   const [presences, setPresences] = useState([]);
//   const [annee, setAnnee] = useState(null);
//   const [semestre, setSemestre] = useState(null);
//   const [classes, setClasses] = useState([]);
//   const [notifications, setNotifications] = useState([]);
//   const [stats, setStats] = useState({ taux_presence: 0, etudiants: 0, cours_actifs: 0 });
//   const [cours, setCours] = useState([]);
//   const [studentStats, setStudentStats] = useState([]);
//   const [filter, setFilter] = useState('all');
//   const [selectedSalle, setSelectedSalle] = useState('all');
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//   const [loading, setLoading] = useState({
//     presences: true,
//     stats: true,
//     cours: true,
//     studentStats: true,
//     annee: true,
//     semestre: true,
//     classes: true,
//   });

//   const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     if (!token) return;

//     const fetchUser = async () => {
//       try {
//         const response = await axios.get('http://127.0.0.1:8000/api/infos', {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         setUser(response.data);
//       } catch (err) {
//         console.error('Erreur lors de la récupération de l’utilisateur', err);
//       } finally {
//         setLoading((prev) => ({ ...prev, user: false }));
//       }
//     };

//     const fetchPresences = async () => {
//       try {
//         const response = await axios.get(`http://127.0.0.1:8000/api/presences?date_range=${filter}&salle_id=${selectedSalle}`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         setPresences(response.data);
//       } catch (err) {
//         console.error('Erreur lors de la récupération des présences', err);
//       } finally {
//         setLoading((prev) => ({ ...prev, presences: false }));
//       }
//     };

//     const fetchAnnee = async () => {
//       try {
//         const response = await axios.get('http://127.0.0.1:8000/api/showyearschool', {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         const latestAnnee = response.data.data[0];
//         setAnnee(latestAnnee);
//       } catch (err) {
//         console.error('Erreur lors de la récupération des années académiques', err);
//       } finally {
//         setLoading((prev) => ({ ...prev, annee: false }));
//       }
//     };

//     const fetchSemestre = async () => {
//       try {
//         const response = await axios.get('http://127.0.0.1:8000/api/showsemestre', {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         const activeSemestre = response.data.data[0];
//         setSemestre(activeSemestre);
//       } catch (err) {
//         console.error('Erreur lors de la récupération des semestres', err);
//       } finally {
//         setLoading((prev) => ({ ...prev, semestre: false }));
//       }
//     };

//     const fetchClasses = async () => {
//       try {
//         const response = await axios.get('http://127.0.0.1:8000/api/showclasse', {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         const userClasses = response.data.filter(
//           (classe) => classe.responsable?.enseignant?.utilisateur?.id === user.id
//         );
//         setClasses(userClasses);
//       } catch (err) {
//         console.error('Erreur lors de la récupération des classes', err);
//       } finally {
//         setLoading((prev) => ({ ...prev, classes: false }));
//       }
//     };

//     const fetchStats = async () => {
//       try {
//         const response = await axios.get('http://127.0.0.1:8000/api/stats', {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         setStats(response.data);
//       } catch (err) {
//         console.error('Erreur lors de la récupération des stats', err);
//       } finally {
//         setLoading((prev) => ({ ...prev, stats: false }));
//       }
//     };

//     const fetchCours = async () => {
//       try {
//         const response = await axios.get('http://127.0.0.1:8000/api/cours', {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         setCours(response.data);
//       } catch (err) {
//         console.error('Erreur lors de la récupération des cours', err);
//       } finally {
//         setLoading((prev) => ({ ...prev, cours: false }));
//       }
//     };

//     const fetchStudentStats = async () => {
//       try {
//         const response = await axios.get('http://127.0.0.1:8000/api/presences/students', {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         setStudentStats(response.data);
//       } catch (err) {
//         console.error('Erreur lors de la récupération des stats étudiants', err);
//       } finally {
//         setLoading((prev) => ({ ...prev, studentStats: false }));
//       }
//     };

//     fetchUser();
//     fetchPresences();
//     fetchAnnee();
//     fetchSemestre();
//     fetchClasses();
//     fetchStats();
//     fetchCours();
//     fetchStudentStats();
//   }, [user.id, filter, selectedSalle]);

//   const PresenceChart = ({ presences, classes }) => {
//     const data = presences.reduce((acc, presence) => {
//       const salle = presence.appel?.cours?.salle?.nom || 'Inconnu';
//       const existing = acc.find((item) => item.salle === salle);
//       if (existing) {
//         presence.present ? existing.presences++ : existing.absences++;
//       } else {
//         acc.push({
//           salle,
//           presences: presence.present ? 1 : 0,
//           absences: presence.present ? 0 : 1,
//         });
//       }
//       return acc;
//     }, []);

//     const exportToCSV = () => {
//       const csv = [
//         'Salle,Présences,Absences',
//         ...data.map((item) => `${item.salle},${item.presences},${item.absences}`),
//       ].join('\n');
//       const blob = new Blob([csv], { type: 'text/csv' });
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.href = url;
//       a.download = 'presences.csv';
//       a.click();
//       window.URL.revokeObjectURL(url);
//     };

//     return (
//       <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
//         <div className="flex flex-col sm:flex-row items-center justify-between mb-4">
//           <div className="flex items-center gap-2">
//             <FaChartBar className="text-[#093A5D] w-5 h-5" />
//             <h2 className="text-lg font-semibold text-[#093A5D]">Présences par salle</h2>
//           </div>
//           <div className="flex flex-col sm:flex-row gap-2 mt-2 sm:mt-0">
//             <select
//               value={filter}
//               onChange={(e) => setFilter(e.target.value)}
//               className="bg-[#F49100] text-white text-sm p-2 rounded-md hover:bg-[#e07b00]"
//             >
//               <option value="all">Toutes les périodes</option>
//               <option value="7days">Derniers 7 jours</option>
//               <option value="30days">Derniers 30 jours</option>
//             </select>
//             <select
//               value={selectedSalle}
//               onChange={(e) => setSelectedSalle(e.target.value)}
//               className="bg-[#F49100] text-white text-sm p-2 rounded-md hover:bg-[#e07b00]"
//             >
//               <option value="all">Toutes les salles</option>
//               {classes.map((classe) => (
//                 <option key={classe.id} value={classe.id}>{classe.nom}</option>
//               ))}
//             </select>
//             <button onClick={exportToCSV} className="bg-[#F49100] text-white p-2 rounded-md flex items-center gap-1 hover:bg-[#e07b00]">
//               <FaDownload /> Exporter
//             </button>
//           </div>
//         </div>
//         {loading.presences ? (
//           <div className="animate-pulse">
//             <div className="h-60 bg-gray-200 rounded"></div>
//           </div>
//         ) : data.length > 0 ? (
//           <ResponsiveContainer width="100%" height={250}>
//             <BarChart data={data} barSize={20} barGap={4}>
//               <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
//               <XAxis dataKey="salle" stroke="#093A5D" />
//               <YAxis stroke="#093A5D" />
//               <Tooltip contentStyle={{ borderRadius: '0.5rem', backgroundColor: 'white', color: 'black' }} />
//               <Bar dataKey="presences" fill="#093A5D" name="Présences" radius={[4, 4, 0, 0]} />
//               <Bar dataKey="absences" fill="#F49100" name="Absences" radius={[4, 4, 0, 0]} />
//             </BarChart>
//           </ResponsiveContainer>
//         ) : (
//           <p className="text-sm text-gray-500">Aucune donnée de présence disponible.</p>
//         )}
//       </div>
//     );
//   };

//   const QuickStats = ({ stats }) => {
//     return (
//       <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
//         <div className="bg-white rounded-lg shadow-md p-4 flex items-center gap-3">
//           <FaCheckCircle className="text-[#093A5D] w-6 h-6" />
//           <div>
//             <p className="text-sm text-gray-700">Taux de présence</p>
//             <p className="text-lg font-semibold text-[#093A5D]">{loading.stats ? '...' : `${stats.taux_presence}%`}</p>
//           </div>
//         </div>
//         <div className="bg-white rounded-lg shadow-md p-4 flex items-center gap-3">
//           <FaUsers className="text-[#F49100] w-6 h-6" />
//           <div>
//             <p className="text-sm text-gray-700">Étudiants</p>
//             <p className="text-lg font-semibold text-[#093A5D]">{loading.stats ? '...' : stats.etudiants}</p>
//           </div>
//         </div>
//         <div className="bg-white rounded-lg shadow-md p-4 flex items-center gap-3">
//           <FaBook className="text-[#093A5D] w-6 h-6" />
//           <div>
//             <p className="text-sm text-gray-700">Cours actifs</p>
//             <p className="text-lg font-semibold text-[#093A5D]">{loading.stats ? '...' : stats.cours_actifs}</p>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   const UpcomingCourses = ({ cours }) => {
//     return (
//       <div className="bg-white rounded-lg shadow-md p-4">
//         <div className="flex items-center gap-2 mb-4">
//           <FaClock className="text-[#093A5D] w-5 h-5" />
//           <h2 className="text-lg font-semibold text-[#093A5D]">Prochains cours</h2>
//         </div>
//         {loading.cours ? (
//           <div className="animate-pulse">
//             <div className="h-10 bg-gray-200 rounded mb-2"></div>
//             <div className="h-10 bg-gray-200 rounded mb-2"></div>
//           </div>
//         ) : cours.length ? (
//           <div className="max-h-40 overflow-y-auto">
//             {cours.map((course) => (
//               <div key={course.id} className="p-2 border-b border-gray-200">
//                 <p className="text-sm font-medium">{course.matiere?.nom || 'N/A'}</p>
//                 <p className="text-xs text-gray-500">
//                   {course.salle?.nom || 'N/A'} - {new Date(course.date_debut).toLocaleString()}
//                 </p>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <p className="text-sm text-gray-500">Aucun cours à venir.</p>
//         )}
//       </div>
//     );
//   };

//   const StudentPresenceTable = ({ studentStats }) => {
//     const [sortBy, setSortBy] = useState('nom');
//     const [sortOrder, setSortOrder] = useState('asc');

//     const sortedStats = [...studentStats].sort((a, b) => {
//       const valA = sortBy === 'nom' ? `${a.nom} ${a.prenom}` : a.taux_presence;
//       const valB = sortBy === 'nom' ? `${b.nom} ${b.prenom}` : b.taux_presence;
//       return sortOrder === 'asc' ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
//     });

//     const toggleSort = (field) => {
//       if (sortBy === field) {
//         setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
//       } else {
//         setSortBy(field);
//         setSortOrder('asc');
//       }
//     };

//     return (
//       <div className="bg-white rounded-lg shadow-md p-4">
//         <div className="flex items-center gap-2 mb-4">
//           <FaUsers className="text-[#093A5D] w-5 h-5" />
//           <h2 className="text-lg font-semibold text-[#093A5D]">Présences par étudiant</h2>
//         </div>
//         {loading.studentStats ? (
//           <div className="animate-pulse">
//             <div className="h-10 bg-gray-200 rounded mb-2"></div>
//             <div className="h-10 bg-gray-200 rounded mb-2"></div>
//           </div>
//         ) : studentStats.length ? (
//           <div className="overflow-x-auto">
//             <table className="w-full text-sm">
//               <thead>
//                 <tr className="bg-gray-100">
//                   <th className="p-2 text-left">
//                     <button onClick={() => toggleSort('nom')} className="flex items-center gap-1">
//                       Nom {sortBy === 'nom' && (sortOrder === 'asc' ? '↑' : '↓')}
//                     </button>
//                   </th>
//                   <th className="p-2 text-left">
//                     <button onClick={() => toggleSort('taux_presence')} className="flex items-center gap-1">
//                       Taux de présence {sortBy === 'taux_presence' && (sortOrder === 'asc' ? '↑' : '↓')}
//                     </button>
//                   </th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {sortedStats.map((student) => (
//                   <tr key={student.id} className="border-b border-gray-200">
//                     <td className="p-2">{student.nom} {student.prenom}</td>
//                     <td className="p-2">{student.taux_presence}%</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         ) : (
//           <p className="text-sm text-gray-500">Aucune donnée disponible.</p>
//         )}
//       </div>
//     );
//   };

//   const RecapAnnee = ({ annee, semestre }) => {
//     return (
//       <div className="bg-white rounded-lg shadow-md p-4">
//         <div className="flex items-center gap-2 mb-4">
//           <FaCalendar className="text-[#093A5D] w-5 h-5" />
//           <h2 className="text-lg font-semibold text-[#093A5D]">Année Académique en cours</h2>
//         </div>
//         {loading.annee || loading.semestre ? (
//           <div className="animate-pulse">
//             <div className="h-20 bg-gray-200 rounded"></div>
//           </div>
//         ) : annee ? (
//           <p className="text-sm text-gray-700">
//             <strong>Nom :</strong> {annee.nom || 'N/A'}<br />
//             <strong>Début :</strong> {annee.date_debut || 'N/A'}<br />
//             <strong>Fin :</strong> {annee.date_fin || 'N/A'}<br />
//             <strong>Semestre :</strong> {semestre?.nom || 'N/A'}
//           </p>
//         ) : (
//           <p className="text-sm text-gray-500">Aucune année académique disponible.</p>
//         )}
//       </div>
//     );
//   };

//   const UserInfo = ({ user, classes }) => {
//     return (
//       <div className="bg-white rounded-lg shadow-md p-4">
//         <div className="flex items-center gap-2 mb-4">
//           <FaUser className="text-[#093A5D] w-5 h-5" />
//           <h2 className="text-lg font-semibold text-[#093A5D]">Informations Utilisateur</h2>
//         </div>
//         {loading.classes ? (
//           <div className="animate-pulse">
//             <div className="h-20 bg-gray-200 rounded"></div>
//           </div>
//         ) : (
//           <p className="text-sm text-gray-700">
//             <strong>Nom :</strong> {user.nom} {user.prenom}<br />
//             <strong>Rôle :</strong> {user.role}<br />
//             <strong>Classes gérées :</strong> {classes.length}<br />
//             <strong>Cours assignés :</strong> {classes.reduce((acc, classe) => acc + (classe.cours?.length || 0), 0)}
//           </p>
//         )}
//       </div>
//     );
//   };

//   return (
//     <div className="flex min-h-screen bg-[#F7F9FC] font-poppins">
//       <Sidebar_RA isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
//       <div className="flex-1 flex flex-col">
//         <Topbar user={user} setNotifications={setNotifications} toggleSidebar={toggleSidebar} />
//         <div className="flex-1 p-4 md:p-6">
//           <h1 className="text-xl font-semibold text-[#093A5D] mb-6">Dashboard</h1>
//           <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
//             <QuickStats stats={stats} />
//             <div className="col-span-1 sm:col-span-2 lg:col-span-3">
//               <PresenceChart presences={presences} classes={classes} />
//             </div>
//             <UpcomingCourses cours={cours} />
//             <StudentPresenceTable studentStats={studentStats} />
//             <RecapAnnee annee={annee} semestre={semestre} />
//             <UserInfo user={user} classes={classes} />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard_RA;