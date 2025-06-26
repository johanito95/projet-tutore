import React, { useState } from 'react';
import { FaUser, FaEnvelope, FaLock, FaGraduationCap, FaIdCard, FaBuilding, FaUserTie } from 'react-icons/fa';

const RegisterForm = () => {
  const [_role, setRole] = useState('');
  const [extraFields, setExtraFields] = useState([]);

  // Met à jour les champs supplémentaires selon le rôle sélectionné
  const handleRoleChange = (e) => {
    const selectedRole = e.target.value;
    setRole(selectedRole);

    switch (selectedRole) {
      case 'etudiant':
        setExtraFields([
          { icon: <FaIdCard />, placeholder: 'Matricule' },
          { icon: <FaGraduationCap />, placeholder: 'Filière' },
          { icon: <FaGraduationCap />, placeholder: "Niveau d'étude" },
        ]);
        break;
      case 'enseignant':
        setExtraFields([
          { icon: <FaIdCard />, placeholder: 'Matricule enseignant' },
          { icon: <FaUserTie />, placeholder: 'Spécialité' },
          { icon: <FaBuilding />, placeholder: 'Département' },
        ]);
        break;
      case 'scolarite':
      case 'admin':
        setExtraFields([
          { icon: <FaIdCard />, placeholder: 'Identifiant interne' },
          { icon: <FaUserTie />, placeholder: 'Fonction ou service' },
        ]);
        break;
      default:
        setExtraFields([]);
    }
  };

  // Structure du champ avec icône à gauche de la page
  const renderInput = (icon, placeholder, type = 'text') => (
    <div className="flex items-center border-b border-white py-2 text-white">
      <span className="mr-2 text-lg">{icon}</span>
      <input
        type={type}
        placeholder={placeholder}
        required
        className="bg-transparent outline-none flex-1 placeholder-white"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-cyan-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-white rounded-lg overflow-hidden shadow-md flex flex-col md:flex-row">
        {/* Partie gauche (Logo + Message) */}
        <div className="md:w-1/2 bg-white flex flex-col items-center justify-center text-center p-8">
          <div className="w-40 h-40 bg-gray-200 mb-4">Logo</div>
          <h2 className="text-blue-800 text-3xl font-bold">PAS ENCORE INSCRIS?</h2>
          <p className="text-blue-800 mt-2">
            inscrivez vous soyez<br />connecter à votre<br />univers académique
          </p>
        </div>

        {/* Partie droite (Formulaire) */}
        <div className="md:w-1/2 bg-blue-700 text-white p-8 relative">
          <h3 className="text-2xl font-bold mb-6">inscription</h3>

          <form className="space-y-4">
            {/* Ligne nom + email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderInput(<FaUser />, 'Nom')}
              {renderInput(<FaEnvelope />, 'Email', 'email')}
            </div>

            {/* Ligne mot de passe + rôle */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderInput(<FaLock />, 'Mot de passe', 'password')}
              <div className="flex items-center border-b border-white py-2">
                <span className="mr-2 text-lg">
                  <FaUserTie />
                </span>
                <select
                  onChange={handleRoleChange}
                  required
                  className="bg-transparent text-white outline-none flex-1 placeholder-white"
                >
                  <option value="">Rôle</option>
                  <option value="etudiant">Étudiant</option>
                  <option value="enseignant">Enseignant</option>
                  <option value="scolarite">Scolarité</option>
                  <option value="admin">Administration</option>
                </select>
              </div>
            </div>

            {/* Champs supplémentaires selon le rôle */}
            {extraFields.map(({ icon, placeholder }, index) => (
              <div key={index}>{renderInput(icon, placeholder)}</div>
            ))}

            <button
              type="submit"
              className="w-full bg-white text-blue-700 font-semibold py-2 rounded-full hover:bg-blue-100 transition"
            >
              s’inscrire
            </button>
          </form>

          <div className="mt-6 text-right text-sm">
            <span>vous avez déjà un compte ? </span>
            <a href="/login" className="underline text-white hover:text-blue-300">connexion</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;


// import React, { useState } from "react";
// import {
//   FaUser,
//   FaEnvelope,
//   FaLock,
//   FaGraduationCap,
//   FaBuilding,
//   FaArrowLeft,
//   FaKey
// } from "react-icons/fa";

// export default function RegisterPage() {
//   const [role, setRole] = useState("");

//   const renderExtraFields = () => {
//     switch (role) {
//       case "etudiant":
//         return (
//           <>
//             <div className="input-group">
//               <FaKey className="icon" />
//               <input type="text" placeholder="Matricule" required />
//             </div>
//             <div className="input-group">
//               <FaGraduationCap className="icon" />
//               <input type="text" placeholder="Filière" required />
//             </div>
//             <div className="input-group">
//               <FaGraduationCap className="icon" />
//               <input type="text" placeholder="Niveau d'étude" required />
//             </div>
//           </>
//         );
//       case "enseignant":
//         return (
//           <>
//             <div className="input-group">
//               <FaKey className="icon" />
//               <input type="text" placeholder="Matricule enseignant" required />
//             </div>
//             <div className="input-group">
//               <FaGraduationCap className="icon" />
//               <input type="text" placeholder="Spécialité" required />
//             </div>
//             <div className="input-group">
//               <FaBuilding className="icon" />
//               <input type="text" placeholder="Département" required />
//             </div>
//           </>
//         );
//       case "scolarite":
//       case "admin":
//         return (
//           <>
//             <div className="input-group">
//               <FaKey className="icon" />
//               <input type="text" placeholder="Identifiant interne" required />
//             </div>
//             <div className="input-group">
//               <FaBuilding className="icon" />
//               <input type="text" placeholder="Fonction ou service" required />
//             </div>
//           </>
//         );
//       default:
//         return null;
//     }
//   };

//   return (
//     <div className="min-h-screen flex flex-col md:flex-row bg-blue-50">
//       {/* Section Formulaire */}
//       <div className="flex-1 flex items-center justify-center p-6">
//         <div className="w-full max-w-lg bg-white shadow-xl rounded-xl p-8">
//           <h2 className="text-2xl font-bold text-blue-700 text-center mb-6">
//             Créer un compte
//           </h2>

//           <form className="space-y-4">
//             <div className="flex space-x-4">
//               <div className="input-group">
//                 <FaUser className="icon" />
//                 <input type="text" placeholder="Nom" required />
//               </div>
//               <div className="input-group">
//                 <FaUser className="icon" />
//                 <input type="text" placeholder="Prénom" required />
//               </div>
//             </div>

//             <div className="input-group">
//               <FaEnvelope className="icon" />
//               <input type="email" placeholder="Adresse email" required />
//             </div>
//             <div className="input-group">
//               <FaLock className="icon" />
//               <input type="password" placeholder="Mot de passe" required />
//             </div>
//             <div className="input-group">
//               <FaLock className="icon" />
//               <input type="password" placeholder="Confirmer le mot de passe" required />
//             </div>

//             <div className="input-group">
//               <FaUser className="icon" />
//               <select
//                 value={role}
//                 onChange={(e) => setRole(e.target.value)}
//                 required
//               >
//                 <option value="">-- Sélectionnez un rôle --</option>
//                 <option value="etudiant">Étudiant</option>
//                 <option value="enseignant">Enseignant</option>
//                 <option value="scolarite">Scolarité</option>
//                 <option value="admin">Administration</option>
//               </select>
//             </div>

//             {renderExtraFields()}

//             <button
//               type="submit"
//               className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-xl font-semibold transition"
//             >
//               S'inscrire
//             </button>

//             <p className="text-center text-sm text-blue-600 mt-4">
//               Vous avez déjà un compte ?
//               <a href="/login" className="ml-1 underline hover:text-blue-800">
//                 Connexion
//               </a>
//             </p>
//           </form>
//         </div>
//       </div>

//       {/* Section Bleue Décorative */}
//       <div className="hidden md:flex md:w-1/2 relative bg-blue-700 trapezoid-shape text-white items-center justify-center p-10">
//         <a href="/" className="absolute top-6 right-6 text-white hover:text-blue-200">
//           <FaArrowLeft size={24} />
//         </a>

//         <div className="absolute top-6 left-6">
//           {/* Logo Placeholder */}
//           <div className="w-20 h-20 bg-white rounded-md" />
//         </div>

//         <div className="text-center max-w-sm">
//           <h2 className="text-3xl font-bold mb-4">Bienvenue sur la plateforme</h2>
//           <p className="text-lg opacity-90">
//             Veuillez remplir le formulaire pour accéder à votre espace personnalisé.
//           </p>
//         </div>
//       </div>

//       {/* Styles personnalisés */}
//       <style jsx>{`
//         .trapezoid-shape {
//           clip-path: polygon(10% 0%, 100% 0, 100% 100%, 0% 100%);
//         }
//         .input-group {
//           @apply flex items-center border border-gray-300 rounded-lg px-4 py-2 w-full bg-white;
//         }
//         .icon {
//           @apply text-blue-700 mr-2;
//         }
//         input,
//         select {
//           @apply w-full outline-none bg-transparent;
//         }
//       `}</style>
//     </div>
//   );
// }
