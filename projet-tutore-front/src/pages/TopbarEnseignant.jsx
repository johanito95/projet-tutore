// import React, { useState, useEffect } from 'react';
// import { FaBell, FaBars, FaUserCircle, FaSignOutAlt, FaTimes } from 'react-icons/fa';
// import { NavLink, useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { toast } from 'react-toastify';
// import { motion, AnimatePresence } from 'framer-motion';

// const TopbarEnseignant = () => {
//   const navigate = useNavigate();
//   const [user, setUser] = useState(null);
//   const [showNotifications, setShowNotifications] = useState(false);
//   const [showProfileMenu, setShowProfileMenu] = useState(false);
//   const [showMobileMenu, setShowMobileMenu] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [notifications, setNotifications] = useState([]);
//   const [error, setError] = useState(null);

//   const links = [
//     { label: 'Dashboard', path: '/dashboard_enseignant' },
//     { label: 'Téléverser cours', path: '/enseignant/televerser_cours' },
//     { label: 'Saisir note', path: '/enseignant/notes' },
//     { label: 'Faire l’appel', path: '/enseignant/faire-appel' },
//     { label: 'Mes Documents', path: '/enseignant/mes-documents' },
//     { label: 'Notifications', path: '/enseignant/notifications' },
//   ];

//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     if (!token) {
//       setError('Utilisateur non authentifié');
//       setLoading(false);
//       toast.error('Utilisateur non authentifié', {
//         position: 'top-right',
//         autoClose: 3000,
//         style: { backgroundColor: '#E53E3E', color: '#FFFFFF', fontSize: '0.875rem' },
//       });
//       navigate('/');
//       return;
//     }

//     const fetchUser = async () => {
//       try {
//         const response = await axios.get('http://127.0.0.1:8000/api/infos', {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         if (response.data.role !== 'enseignant') {
//           throw new Error('Accès réservé aux enseignants');
//         }
//         setUser(response.data);
//       } catch (err) {
//         setError(err.message || 'Erreur lors de la récupération des données utilisateur');
//         console.error('Fetch user error:', err);
//         toast.error(err.message || 'Erreur lors de la récupération des données utilisateur', {
//           position: 'top-right',
//           autoClose: 3000,
//           style: { backgroundColor: '#E53E3E', color: '#FFFFFF', fontSize: '0.875rem' },
//         });
//         navigate('/');
//       }
//     };

//     const fetchNotifications = async () => {
//       try {
//         const response = await axios.get('http://127.0.0.1:8000/api/notifications', {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         setNotifications(Array.isArray(response.data) ? response.data : []);
//       } catch (err) {
//         console.error('Erreur lors de la récupération des notifications:', err);
//         setNotifications([
//           { id: 1, message: 'Nouveau cours téléversé', date: '2025-07-28', is_read: false },
//           { id: 2, message: 'Appel à valider pour Salle 101', date: '2025-07-27', is_read: false },
//           { id: 3, message: 'Note saisie pour Matière X', date: '2025-07-26', is_read: true },
//         ]);
//         toast.error('Erreur lors du chargement des notifications', {
//           position: 'top-right',
//           autoClose: 3000,
//           style: { backgroundColor: '#E53E3E', color: '#FFFFFF', fontSize: '0.875rem' },
//         });
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchUser();
//     fetchNotifications();
//   }, [navigate]);

//   const markAsRead = async (id) => {
//     const token = localStorage.getItem('token');
//     if (!token) return;
//     try {
//       await axios.post(`http://127.0.0.1:8000/api/notifications/${id}/read`, {}, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
//       toast.success('Notification marquée comme lue', {
//         position: 'top-right',
//         autoClose: 3000,
//         style: { backgroundColor: '#27AE60', color: '#FFFFFF', fontSize: '0.875rem' },
//       });
//     } catch (err) {
//       console.error('Erreur lors de la mise à jour de la notification:', err);
//       toast.error('Erreur lors de la mise à jour', {
//         position: 'top-right',
//         autoClose: 3000,
//         style: { backgroundColor: '#E53E3E', color: '#FFFFFF', fontSize: '0.875rem' },
//       });
//     }
//   };

//   const handleLogout = () => {
//     try {
//       localStorage.removeItem('token');
//       setUser(null);
//       setNotifications([]);
//       toast.success('Déconnexion réussie !', {
//         position: 'top-right',
//         autoClose: 3000,
//         style: { backgroundColor: '#27AE60', color: '#FFFFFF', fontSize: '0.875rem' },
//       });
//       navigate('/');
//     } catch (err) {
//       console.error('Erreur lors de la déconnexion:', err);
//       toast.error('Erreur lors de la déconnexion', {
//         position: 'top-right',
//         autoClose: 3000,
//         style: { backgroundColor: '#E53E3E', color: '#FFFFFF', fontSize: '0.875rem' },
//       });
//     }
//   };

//   const handleToggleSidebar = () => {
//     setShowMobileMenu(!showMobileMenu);
//     window.dispatchEvent(new CustomEvent('toggleSidebar'));
//   };

//   return (
//     <div className="bg-white/95 backdrop-blur-md shadow-lg h-16 flex items-center justify-between px-4 sm:px-6 fixed top-0 left-0 right-0 z-50 font-poppins">
//       {/* Left Section: Menu Button & Role */}
//       <div className="flex items-center gap-4">
//         <button
//           className="md:hidden text-[#093A5D] hover:text-[#F49100] transition-all duration-300 transform hover:scale-110"
//           onClick={handleToggleSidebar}
//           aria-label="Ouvrir le menu"
//         >
//           <FaBars className="w-6 h-6" />
//         </button>
//         <div className="text-lg sm:text-xl font-semibold text-[#093A5D]">
//           {error ? 'Erreur' : user ? 'Enseignant' : 'Chargement...'}
//         </div>
//       </div>

//       {/* Right Section: Notifications & Profile */}
//       <div className="flex items-center gap-4 sm:gap-6">
//         {/* Notifications */}
//         <div className="relative">
//           <button
//             onClick={() => {
//               setShowNotifications(!showNotifications);
//               setShowProfileMenu(false);
//               setShowMobileMenu(false);
//             }}
//             className="relative flex items-center gap-2 text-[#093A5D] hover:text-[#F49100] hover:bg-[#093A5D]/10 rounded-lg px-2 py-1 sm:px-3 sm:py-2 transition-all duration-300 transform hover:scale-105"
//             aria-label="Notifications"
//           >
//             <FaBell className="w-5 h-5 sm:w-6 sm:h-6" />
//             {notifications.filter((n) => !n.is_read).length > 0 && (
//               <span className="absolute top-[-4px] right-[-4px] bg-[#E53E3E] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs animate-pulse">
//                 {notifications.filter((n) => !n.is_read).length}
//               </span>
//             )}
//           </button>
//           <AnimatePresence>
//             {showNotifications && (
//               <motion.div
//                 initial={{ opacity: 0, y: -10 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 exit={{ opacity: 0, y: -10 }}
//                 transition={{ duration: 0.2 }}
//                 className="absolute top-14 right-0 w-72 sm:w-80 bg-white/95 backdrop-blur-md rounded-lg shadow-xl border border-[#093A5D]/10 z-10 max-h-96 overflow-y-auto"
//               >
//                 {loading ? (
//                   <div className="p-4 text-center text-[#093A5D]/70 text-sm">Chargement...</div>
//                 ) : notifications.length ? (
//                   notifications.map((notif) => (
//                     <div
//                       key={notif.id}
//                       className={`p-4 border-b border-[#093A5D]/10 hover:bg-[#F49100]/10 transition-all duration-200 ${
//                         notif.is_read ? '' : 'bg-[#E53E3E]/5'
//                       }`}
//                     >
//                       <div className="flex justify-between items-start">
//                         <div>
//                           <p className="text-sm text-[#093A5D]">{notif.message}</p>
//                           <p className="text-xs text-[#093A5D]/50">
//                             {new Date(notif.date).toLocaleString('fr-FR', {
//                               dateStyle: 'short',
//                               timeStyle: 'short',
//                             })}
//                           </p>
//                         </div>
//                         {!notif.is_read && (
//                           <button
//                             onClick={() => markAsRead(notif.id)}
//                             className="bg-[#F49100] text-white text-xs py-1 px-2 rounded-lg hover:bg-[#e07b00] transition-all duration-200"
//                           >
//                             Lu
//                           </button>
//                         )}
//                       </div>
//                     </div>
//                   ))
//                 ) : (
//                   <div className="p-4 text-center text-[#093A5D]/70 text-sm">Aucune notification</div>
//                 )}
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </div>

//         {/* Profile */}
//         <div className="relative">
//           <button
//             onClick={() => {
//               setShowProfileMenu(!showProfileMenu);
//               setShowNotifications(false);
//               setShowMobileMenu(false);
//             }}
//             className="flex items-center gap-2 text-[#093A5D] hover:text-[#F49100] hover:bg-[#093A5D]/10 rounded-lg px-2 py-1 sm:px-3 sm:py-2 transition-all duration-300"
//             aria-label="Menu profil"
//           >
//             <FaUserCircle className="w-6 h-6 sm:w-8 sm:h-8" />
//             <span className="hidden sm:inline text-sm text-[#093A5D]">
//               {error ? 'Erreur' : user ? `${user.prenom} ${user.nom}` : 'Chargement...'}
//             </span>
//           </button>
//           <AnimatePresence>
//             {showProfileMenu && (
//               <motion.div
//                 initial={{ opacity: 0, y: -10 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 exit={{ opacity: 0, y: -10 }}
//                 transition={{ duration: 0.2 }}
//                 className="absolute top-14 right-0 w-48 bg-white/95 backdrop-blur-md rounded-lg shadow-xl border border-[#093A5D]/10 z-10"
//               >
//                 <div
//                   onClick={handleLogout}
//                   className="flex items-center gap-2 p-4 hover:bg-[#F49100]/10 transition-all duration-200 cursor-pointer"
//                 >
//                   <FaSignOutAlt className="w-5 h-5 text-[#093A5D]" />
//                   <span className="text-sm text-[#093A5D]">Déconnexion</span>
//                 </div>
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </div>
//       </div>

//       {/* Mobile Menu */}
//       <AnimatePresence>
//         {showMobileMenu && (
//           <motion.div
//             initial={{ opacity: 0, x: -10 }}
//             animate={{ opacity: 1, x: 0 }}
//             exit={{ opacity: 0, x: -10 }}
//             transition={{ duration: 0.2 }}
//             className="md:hidden absolute top-16 left-4 w-64 bg-white/95 backdrop-blur-md rounded-lg shadow-xl border border-[#093A5D]/10 z-10 max-h-96 overflow-y-auto"
//           >
//             {links.map(({ label, path }) => (
//               <NavLink
//                 key={path}
//                 to={path}
//                 className={({ isActive }) =>
//                   `block p-4 text-sm text-[#093A5D] border-b border-[#093A5D]/10 hover:bg-[#F49100]/10 transition-all duration-200 ${
//                     isActive ? 'bg-[#093A5D]/10 font-semibold' : ''
//                   }`
//                 }
//                 onClick={() => setShowMobileMenu(false)}
//               >
//                 {label}
//               </NavLink>
//             ))}
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// };

// export default TopbarEnseignant;

import React, { useState, useEffect } from 'react';
import { FaBell, FaBars, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const TopbarEnseignant = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Utilisateur non authentifié');
      setLoading(false);
      toast.error('Utilisateur non authentifié', {
        position: 'top-right',
        autoClose: 3000,
        style: { backgroundColor: '#E53E3E', color: '#FFFFFF', fontSize: '0.875rem' },
      });
      navigate('/');
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/infos', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.role !== 'enseignant') {
          throw new Error('Accès réservé aux enseignants');
        }
        setUser(response.data);
      } catch (err) {
        setError(err.message || 'Erreur lors de la récupération des données utilisateur');
        console.error('Fetch user error:', err);
        toast.error(err.message || 'Erreur lors de la récupération des données utilisateur', {
          position: 'top-right',
          autoClose: 3000,
          style: { backgroundColor: '#E53E3E', color: '#FFFFFF', fontSize: '0.875rem' },
        });
        navigate('/');
      }
    };

    const fetchNotifications = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/notifications', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error('Erreur lors de la récupération des notifications:', err);
        setNotifications([
          { id: 1, message: 'Nouveau cours téléversé', date: '2025-07-28', is_read: false },
          { id: 2, message: 'Appel à valider pour Salle 101', date: '2025-07-27', is_read: false },
          { id: 3, message: 'Note saisie pour Matière X', date: '2025-07-26', is_read: true },
        ]);
        toast.error('Erreur lors du chargement des notifications', {
          position: 'top-right',
          autoClose: 3000,
          style: { backgroundColor: '#E53E3E', color: '#FFFFFF', fontSize: '0.875rem' },
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
    fetchNotifications();
  }, [navigate]);

  const markAsRead = async (id) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      await axios.post(`http://127.0.0.1:8000/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
      toast.success('Notification marquée comme lue', {
        position: 'top-right',
        autoClose: 3000,
        style: { backgroundColor: '#27AE60', color: '#FFFFFF', fontSize: '0.875rem' },
      });
    } catch (err) {
      console.error('Erreur lors de la mise à jour de la notification:', err);
      toast.error('Erreur lors de la mise à jour', {
        position: 'top-right',
        autoClose: 3000,
        style: { backgroundColor: '#E53E3E', color: '#FFFFFF', fontSize: '0.875rem' },
      });
    }
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('token');
      setUser(null);
      setNotifications([]);
      toast.success('Déconnexion réussie !', {
        position: 'top-right',
        autoClose: 3000,
        style: { backgroundColor: '#27AE60', color: '#FFFFFF', fontSize: '0.875rem' },
      });
      navigate('/');
    } catch (err) {
      console.error('Erreur lors de la déconnexion:', err);
      toast.error('Erreur lors de la déconnexion', {
        position: 'top-right',
        autoClose: 3000,
        style: { backgroundColor: '#E53E3E', color: '#FFFFFF', fontSize: '0.875rem' },
      });
    }
  };

  return (
    <>
      <style>
        {`
          .notification-dropdown {
            position: absolute;
            top: 64px;
            right: 16px;
            width: 320px;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(16px);
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(44, 62, 80, 0.1);
            z-index: 10;
            max-height: 400px;
            overflow-y: auto;
          }
          .notification-item {
            padding: 12px 16px;
            border-bottom: 1px solid rgba(44, 62, 80, 0.1);
            transition: all 0.3s ease;
            cursor: pointer;
          }
          .notification-item:hover {
            background: rgba(244, 145, 0, 0.1);
          }
          .notification-item.unread {
            background: rgba(229, 62, 62, 0.05);
          }
          .badge {
            position: absolute;
            top: -4px;
            right: -4px;
            background: #E53E3E;
            color: white;
            border-radius: 50%;
            width: 18px;
            height: 18px;
            font-size: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: pulse 2s infinite;
          }
          .profile-dropdown {
            position: absolute;
            top: 64px;
            right: 16px;
            width: 200px;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(16px);
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(44, 62, 80, 0.1);
            z-index: 10;
          }
          .profile-item {
            padding: 12px 16px;
            border-bottom: 1px solid rgba(44, 62, 80, 0.1);
            transition: all 0.3s ease;
            cursor: pointer;
          }
          .profile-item:hover {
            background: rgba(244, 145, 0, 0.1);
          }
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); }
          }
        `}
      </style>
      <div className="bg-white/90 backdrop-blur-md shadow-md h-16 flex items-center justify-between px-6 fixed top-0 left-0 md:left-64 right-0 z-10 font-poppins">
        <div className="flex items-center gap-4">
          <button
            className="md:hidden text-[#093A5D] hover:text-[#F49100] transition-all duration-300 transform hover:scale-110"
            onClick={() => {
              console.log('Bouton hamburger cliqué');
              if (toggleSidebar) toggleSidebar();
            }}
            aria-label="Ouvrir/Fermer le menu"
          >
            <FaBars className="w-6 h-6" />
          </button>
          <div className="text-xl font-semibold text-[#093A5D]">
            {error ? 'Erreur' : user ? 'Enseignant' : 'Chargement...'}
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfileMenu(false);
              }}
              className="relative flex items-center gap-2 text-[#093A5D]/60 hover:text-[#F49100] hover:bg-[#093A5D]/10 rounded-lg px-3 py-2 transition-all duration-300 transform hover:scale-105"
              aria-label="Notifications"
            >
              <FaBell className="w-6 h-6" />
              {notifications.filter((n) => !n.is_read).length > 0 && (
                <span className="badge">
                  {notifications.filter((n) => !n.is_read).length}
                </span>
              )}
            </button>
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="notification-dropdown"
                >
                  {loading ? (
                    <div className="notification-item text-center text-[#093A5D]/70">Chargement...</div>
                  ) : notifications.length ? (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`notification-item ${notif.is_read ? '' : 'unread'}`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm text-[#093A5D]/90">{notif.message}</p>
                            <p className="text-xs text-[#093A5D]/50">
                              {new Date(notif.date).toLocaleString('fr-FR', {
                                dateStyle: 'short',
                                timeStyle: 'short',
                              })}
                            </p>
                          </div>
                          {!notif.is_read && (
                            <button
                              onClick={() => markAsRead(notif.id)}
                              className="bg-[#F49100] text-white text-xs py-1 px-3 rounded-lg hover:bg-[#e07b00] transition-all duration-200 transform hover:scale-105"
                            >
                              Lu
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="notification-item text-center text-[#093A5D]/70">Aucune notification</div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="relative flex items-center gap-2">
            <button
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2 text-[#093A5D]/60 hover:text-[#F49100] hover:bg-[#093A5D]/10 rounded-lg px-3 py-2 transition-all duration-300"
              aria-label="Menu profil"
            >
              <FaUserCircle className="w-8 h-8" />
              <span className="text-sm text-[#093A5D]/90">
                {error ? 'Erreur' : user ? `${user.prenom} ${user.nom}` : 'Chargement...'}
              </span>
            </button>
            <AnimatePresence>
              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="profile-dropdown"
                >
                  <div
                    onClick={handleLogout}
                    className="profile-item flex items-center gap-2"
                  >
                    <FaSignOutAlt className="w-5 h-5 text-[#093A5D]/60" />
                    <span className="text-[#093A5D]/90">Déconnexion</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
};

export default TopbarEnseignant;