import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBook, FaChartLine, FaFileAlt, FaEnvelopeOpenText, FaGraduationCap, FaBell, FaUserGraduate } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';
import SidebarEtudiant from './SidebarEtudiant';
import TopbarEtudiant from './TopbarEtudiant';

const DashboardCard = ({ icon, title, description, buttonText, buttonClass, to }) => {
  const navigate = useNavigate();

  return (
    <div
      className="bg-white p-4 sm:p-6 rounded-xl shadow-md flex flex-col justify-between h-48 transition-all duration-200 hover:shadow-lg hover:-translate-y-1 font-poppins"
    >
      <div>
        <div className="flex items-center text-lg font-semibold text-[#093A5D] mb-2 gap-3">
          {icon}
          <span>{title}</span>
        </div>
        <p className="text-sm text-gray-600 mb-4">{description}</p>
      </div>
      {buttonText && (
        <button
          className={`${buttonClass} px-4 py-2 rounded-lg text-white text-sm font-medium w-max hover:shadow-md transition-all duration-200`}
          onClick={() => navigate(to)}
        >
          {buttonText}
        </button>
      )}
    </div>
  );
};

const DashboardEtudiant = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
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
        if (response.data.role !== 'etudiant') {
          throw new Error('Accès réservé aux étudiants');
        }
        setUser(response.data);
      } catch (err) {
        console.error('Fetch user error:', err);
        toast.error(err.message || 'Erreur lors de la récupération des données utilisateur', {
          position: 'top-right',
          autoClose: 3000,
          style: { backgroundColor: '#E53E3E', color: '#FFFFFF', fontSize: '0.875rem' },
        });
        navigate('/');
      }
    };

    fetchUser();
  }, [navigate]);

  const cards = [
    {
      icon: <FaBook className="text-[#093A5D] w-5 h-5" />,
      title: 'Cours',
      description: 'Accédez à vos supports de cours par semestre.',
      buttonText: 'Voir',
      buttonClass: 'bg-[#093A5D] hover:bg-[#072c47]',
      to: '/etudiant/cours',
    },
    {
      icon: <FaChartLine className="text-[#27AE60] w-5 h-5" />,
      title: 'Notes',
      description: 'Consultez vos résultats, moyennes et crédits.',
      buttonText: 'Consulter',
      buttonClass: 'bg-[#27AE60] hover:bg-[#219653]',
      to: '/etudiant/notes',
    },
    {
      icon: <FaFileAlt className="text-[#F49100] w-5 h-5" />,
      title: 'Rapport de stage',
      description: 'Déposez ou mettez à jour votre rapport.',
      buttonText: 'Déposer',
      buttonClass: 'bg-[#F49100] hover:bg-[#e07b00]',
      to: '/etudiant/rapport',
    },
    {
      icon: <FaEnvelopeOpenText className="text-[#9B59B6] w-5 h-5" />,
      title: 'Requêtes',
      description: 'Faites une demande à la scolarité ou l’administration.',
      buttonText: 'Soumettre',
      buttonClass: 'bg-[#9B59B6] hover:bg-[#8e44ad]',
      to: '/etudiant/requetes',
    },
    {
      icon: <FaGraduationCap className="text-[#3498DB] w-5 h-5" />,
      title: 'Diplomation',
      description: 'Suivez l’état d’avancement de votre dossier.',
      buttonText: 'Suivre',
      buttonClass: 'bg-[#3498DB] hover:bg-[#2980b9]',
      to: '/etudiant/diplomation',
    },
    {
      icon: <FaBell className="text-[#E53E3E] w-5 h-5" />,
      title: 'Notifications',
      description: 'Consultez vos notifications récentes.',
      buttonText: 'Voir',
      buttonText: 'Voir',
      buttonClass: 'bg-[#E53E3E] hover:bg-[#c0392b]',
      to: '/etudiant/notifications',
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#F7F9FC] font-poppins">
      <SidebarEtudiant
        isOpen={isSidebarOpen}
        toggleSidebar={() => {
          console.log('Toggle sidebar, isOpen:', !isSidebarOpen);
          setIsSidebarOpen(!isSidebarOpen);
        }}
      />
      <div className="flex-1 flex flex-col">
        <TopbarEtudiant toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 p-4 sm:p-6 md:p-8 md:pl-16 bg-[#F7F9FC] shadow-inner">
          <h1 className="text-xl sm:text-2xl font-bold text-[#093A5D] mb-6 flex items-center gap-3">
            <FaUserGraduate className="w-6 h-6" />
            Dashboard Étudiant
          </h1>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
            {cards.map((card, index) => (
              <DashboardCard
                key={index}
                icon={card.icon}
                title={card.title}
                description={card.description}
                buttonText={card.buttonText}
                buttonClass={card.buttonClass}
                to={card.to}
              />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardEtudiant;


// import React from 'react';
// import { FaBook, FaChartLine, FaFileAlt, FaEnvelopeOpenText, FaGraduationCap, FaBell, FaSignOutAlt } from 'react-icons/fa';
// import { NavLink, useNavigate } from 'react-router-dom';
// import { toast } from 'react-toastify';

// const Sidebar = () => {
//   const navigate = useNavigate();

//   const handleLogout = () => {
//     try {
//       localStorage.removeItem('token');
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

//   const links = [
//     { label: 'Dashboard', path: '/dashboard_etudiant' },
//     { label: 'Cours', path: '/etudiant/cours' },
//     { label: 'Notes', path: '/etudiant/notes' },
//     { label: 'Rapport de stage', path: '/etudiant/rapport' },
//     { label: 'Requêtes', path: '/etudiant/requetes' },
//     { label: 'Diplomation', path: '/etudiant/diplomation' },
//     { label: 'Notifications', path: '/etudiant/notifications' },
//   ];

//   return (
//     <div className="bg-blue-800 text-white w-full md:w-64 p-6 flex flex-col items-center md:items-start min-h-screen font-poppins">
//       <div className="mb-10 text-center md:text-left">
//         <div className="text-2xl font-bold">ERP<br />IUT DOUALA</div>
//         <div className="text-sm font-light">espace étudiant</div>
//       </div>
//       <nav className="flex flex-col gap-4 w-full">
//         {links.map((item) => (
//           <NavLink
//             key={item.path}
//             to={item.path}
//             className={({ isActive }) =>
//               `py-2 px-4 rounded transition-all duration-200 ${
//                 isActive ? 'bg-white text-blue-800 font-semibold' : 'hover:bg-blue-700'
//               }`
//             }
//           >
//             {item.label}
//           </NavLink>
//         ))}
//       </nav>
//       <div className="mt-auto pt-10">
//         <button
//           onClick={handleLogout}
//           className="flex items-center gap-2 text-white hover:text-gray-200 transition-all duration-200"
//         >
//           Logout <FaSignOutAlt />
//         </button>
//       </div>
//     </div>
//   );
// };

// const Card = ({ icon, title, text, color, action, path }) => {
//   const navigate = useNavigate();

//   return (
//     <div className="bg-white p-6 rounded-2xl shadow w-full sm:w-72 font-poppins">
//       <div className="flex items-center gap-2 mb-2 text-lg font-bold">
//         {icon}
//         {title}
//       </div>
//       <p className="text-sm mb-4 text-gray-700">{text}</p>
//       <button
//         onClick={() => navigate(path)}
//         className={`px-4 py-1 text-white rounded font-semibold text-sm bg-${color}-500 hover:bg-${color}-600 transition-all duration-200`}
//       >
//         {action}
//       </button>
//     </div>
//   );
// };

// const Dashboard = () => {
//   const cards = [
//     {
//       icon: <FaBook className="text-blue-800" />,
//       title: 'Cours',
//       text: 'Accédez à vos supports de cours par semestre.',
//       color: 'blue',
//       action: 'Voir',
//       path: '/etudiant/cours',
//     },
//     {
//       icon: <FaChartLine className="text-green-600" />,
//       title: 'Notes',
//       text: 'Consultez vos résultats, moyennes et crédits.',
//       color: 'green',
//       action: 'Consulter',
//       path: '/etudiant/notes',
//     },
//     {
//       icon: <FaFileAlt className="text-orange-500" />,
//       title: 'Rapport',
//       text: 'Déposez ou mettez à jour votre rapport.',
//       color: 'orange',
//       action: 'Déposer',
//       path: '/etudiant/rapport',
//     },
//     {
//       icon: <FaEnvelopeOpenText className="text-pink-500" />,
//       title: 'Requête',
//       text: 'Faites une demande à la scolarité ou l’administration.',
//       color: 'pink',
//       action: 'Soumettre',
//       path: '/etudiant/requetes',
//     },
//     {
//       icon: <FaGraduationCap className="text-purple-600" />,
//       title: 'Diplomation',
//       text: 'Suivez l’état d’avancement de votre dossier.',
//       color: 'purple',
//       action: 'Suivre',
//       path: '/etudiant/diplomation',
//     },
//     {
//       icon: <FaBell className="text-yellow-500" />,
//       title: 'Notifications',
//       text: 'Consultez vos notifications récentes.',
//       color: 'red',
//       action: 'Voir',
//       path: '/etudiant/notifications',
//     },
//   ];

//   return (
//     <div className="flex flex-col md:flex-row min-h-screen">
//       <Sidebar />
//       <div className="flex-1 bg-gray-100 p-6">
//         <div className="flex justify-between items-center mb-6">
//           <h1 className="text-2xl font-bold text-blue-800">Dashboard</h1>
//           <div className="text-blue-800 font-semibold">Étudiant</div>
//         </div>
//         <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
//           {cards.map((card, index) => (
//             <Card
//               key={index}
//               icon={card.icon}
//               title={card.title}
//               text={card.text}
//               color={card.color}
//               action={card.action}
//               path={card.path}
//             />
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;