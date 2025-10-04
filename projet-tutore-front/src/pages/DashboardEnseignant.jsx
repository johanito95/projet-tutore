// // DashboardEnseignant.jsx
// import React from 'react';
// import SidebarEnseignant from './SidebarEnseignant';
// import { FaDownload, FaBell, FaFileAlt, FaChalkboardTeacher } from 'react-icons/fa';
// import { RiEdit2Fill } from 'react-icons/ri';
// import { PiStudentFill } from 'react-icons/pi';

// const DashboardCard = ({ icon, title, description, buttonText, buttonClass }) => (
//   <div className="bg-white p-4 rounded-2xl shadow w-full flex flex-col justify-between">
//     <div>
//       <div className="flex items-center text-lg font-bold mb-2 gap-2">{icon} {title}</div>
//       <p className="text-sm text-gray-700 mb-4">{description}</p>
//     </div>
//     {buttonText && (
//       <button className={`${buttonClass} px-3 py-1 rounded text-white text-sm font-medium w-max`}>
//         {buttonText}
//       </button>
//     )}
//   </div>
// );

// const DashboardEnseignant = () => {
//   return (
//     <div className="flex flex-col md:flex-row min-h-screen">
//       <SidebarEnseignant />

//       <main className="flex-1 bg-gray-100 p-6">
//         {/* Header */}
//         <div className="flex justify-between items-center mb-6">
//           <h1 className="text-2xl font-bold text-blue-800">Dashboard</h1>
//           <div className="flex items-center gap-2 text-blue-800 font-semibold">
//             <FaChalkboardTeacher /> name
//           </div>
//         </div>

//         {/* Section title */}
//         <div className="flex items-center gap-3 mb-6">
//           <img
//             src="https://cdn-icons-png.flaticon.com/512/921/921347.png"
//             alt="Enseignant"
//             className="w-12 h-12 rounded-full"
//           />
//           <h2 className="text-2xl font-bold">espace enseignant</h2>
//         </div>

//         {/* Cards */}
//         <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
//           <DashboardCard
//             icon={<FaDownload className="text-blue-700" />}
//             title="televerser cours"
//             description="Accédez à vos supports de cours par semestre."
//             buttonText="Téléverser le support"
//             buttonClass="bg-blue-600 hover:bg-blue-700"
//           />
//           <DashboardCard
//             icon={<RiEdit2Fill className="text-black" />}
//             title="saisir les notes"
//             description="Accédez à vos UE pour entrer ou modifier les notes."
//             buttonText="accéder"
//             buttonClass="bg-green-600 hover:bg-green-700"
//           />
//           <DashboardCard
//             icon={<PiStudentFill className="text-black" />}
//             title="faire l’appel"
//             description="Évaluer la présence des étudiants durant le cours."
//             buttonText="effectuer l’appel"
//             buttonClass="bg-orange-500 hover:bg-orange-600"
//           />
//           <DashboardCard
//             icon={<FaFileAlt className="text-blue-800" />}
//             title="Documents"
//             description="Consultez ou téléchargez les documents officiels."
//             buttonText="consulter"
//             buttonClass="bg-fuchsia-600 hover:bg-fuchsia-700"
//           />
//           <DashboardCard
//             icon={<FaBell className="text-yellow-500" />}
//             title="Notifications"
//             description="Déposez ou mettez à jour votre rapport."
//             buttonText="voir"
//             buttonClass="bg-red-600 hover:bg-red-700"
//           />
//         </div>
//       </main>
//     </div>
//   );
// };

// export default DashboardEnseignant;

import React, { useState } from 'react';
import { FaDownload, FaBell, FaFileAlt, FaChalkboardTeacher } from 'react-icons/fa';
import { RiEdit2Fill } from 'react-icons/ri';
import { PiStudentFill } from 'react-icons/pi';
import SidebarEnseignant from './SidebarEnseignant';
import TopbarEnseignant from '../pages/TopbarEnseignant';

const DashboardCard = ({ icon, title, description, buttonText, buttonClass, to }) => (
  <div
    className="bg-white p-4 sm:p-6 rounded-xl shadow-md flex flex-col justify-between h-48 transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
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
        onClick={() => window.location.href = to}
      >
        {buttonText}
      </button>
    )}
  </div>
);

const DashboardEnseignant = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const cards = [
    {
      icon: <FaDownload className="text-[#093A5D] w-5 h-5" />,
      title: 'Téléverser cours',
      description: 'Accédez à vos supports de cours par semestre.',
      buttonText: 'Téléverser un support',
      buttonClass: 'bg-[#093A5D] hover:bg-[#072c47]',
      to: '/enseignant/televerser_cours',
    },
    {
      icon: <RiEdit2Fill className="text-[#27AE60] w-5 h-5" />,
      title: 'Saisir les notes',
      description: 'Accédez à vos UE pour entrer ou modifier les notes.',
      buttonText: 'Accéder',
      buttonClass: 'bg-[#27AE60] hover:bg-[#219653]',
      to: '/enseignant/notes',
    },
    {
      icon: <PiStudentFill className="text-[#F49100] w-5 h-5" />,
      title: 'Faire l’appel',
      description: 'Évaluer la présence des étudiants durant le cours.',
      buttonText: 'Effectuer l’appel',
      buttonClass: 'bg-[#F49100] hover:bg-[#e07b00]',
      to: '/enseignant/faire-appel',
    },
    {
      icon: <FaFileAlt className="text-[#093A5D] w-5 h-5" />,
      title: 'Documents',
      description: 'Consultez ou téléchargez les documents officiels.',
      buttonText: 'Consulter',
      buttonClass: 'bg-[#093A5D] hover:bg-[#072c47]',
      to: '/enseignant/mes-documents',
    },
    {
      icon: <FaBell className="text-[#E74C3C] w-5 h-5" />,
      title: 'Notifications',
      description: 'Déposez ou mettez à jour votre rapport.',
      buttonText: 'Voir',
      buttonClass: 'bg-[#E74C3C] hover:bg-[#c0392b]',
      to: '/enseignant/notifications',
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#F7F9FC] font-poppins">
      <SidebarEnseignant
        isOpen={isSidebarOpen}
        toggleSidebar={() => {
          console.log('Toggle sidebar, isOpen:', !isSidebarOpen);
          setIsSidebarOpen(!isSidebarOpen);
        }}
      />
      <div className="flex-1 flex flex-col">
        <TopbarEnseignant toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 p-4 sm:p-6 md:p-8 md:pl-16 bg-[#F7F9FC] shadow-inner">
          <h1 className="text-xl sm:text-2xl font-bold text-[#093A5D] mb-6 flex items-center gap-3">
            <FaChalkboardTeacher className="w-6 h-6" />
            Dashboard Enseignant
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

export default DashboardEnseignant;