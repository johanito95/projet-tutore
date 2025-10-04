// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import {
//   FaUser,
//   FaEnvelope,
//   FaLock,
//   FaGraduationCap,
//   FaIdCard,
//   FaBuilding,
//   FaUserTie,
//   FaCalendarAlt,
// } from 'react-icons/fa';

// const RegisterForm = () => {
//   const [roles, setRoles] = useState([]);
//   // const [filieres, setFilieres] = useState([]);
//   // const [anneesAcademiques, setAnneesAcademiques] = useState([]);

//   const [formData, setFormData] = useState({
//     nom: '',
//     prenom: '',
//     telephone: '',
//     date_naissance: '',
//     email: '',
//     password: '',
//     password_confirmation: '',
//     role_id: '',
//   });

//   const [extraFields, setExtraFields] = useState([]);
//   const [extraData, setExtraData] = useState({});

//   // Récupération initiale
//   useEffect(() => {
//     axios.get('http://localhost:8000/api/roles').then((res) => setRoles(res.data));
//     // axios.get('http://localhost:8000/api/filieres').then((res) => setFilieres(res.data));
//     // axios.get('http://localhost:8000/api/annees-academiques').then((res) => setAnneesAcademiques(res.data));
//   }, []);

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleExtraChange = (e) => {
//     const { name, value } = e.target;
//     setExtraData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleRoleChange = (e) => {
//     const roleName = e.target.value;
//     const selectedRole = roles.find((r) => r.nom === roleName);

//     if (selectedRole) {
//       setFormData((prev) => ({
//         ...prev,
//         role_id: selectedRole.id,
//       }));

//       setExtraData({});
//       switch (roleName.toLowerCase()) {
//         case 'etudiant':
//           setExtraFields([
//             { name: 'matricule', placeholder: 'Matricule', icon: <FaIdCard /> },
//             // { name: 'filiere_id', placeholder: 'Filière', type: 'select', options: filieres },
//             { name: 'annee_entree', placeholder: "Année d'entrée", icon: <FaCalendarAlt /> },
//             // { name: 'annee_academique_id', placeholder: 'Année académique', type: 'select', options: anneesAcademiques },
//             { name: 'statut_diplomation', placeholder: 'Statut (optionnel)', icon: <FaGraduationCap /> },
//           ]);
//           break;
//         case 'enseignant':
//           setExtraFields([
//             { name: 'grade', placeholder: 'Grade', icon: <FaUserTie /> },
//             { name: 'specialite', placeholder: 'Spécialité', icon: <FaGraduationCap /> },
//           ]);
//           break;
//         case 'responsable academique':
//           setExtraFields([
//             { name: 'grade', placeholder: 'Grade', icon: <FaUserTie /> },
//             { name: 'specialite', placeholder: 'Spécialité', icon: <FaGraduationCap /> },
//             { name: 'departement', placeholder: 'Département', icon: <FaBuilding /> },
//           ]);
//           break;
//         default:
//           setExtraFields([]);
//       }
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const payload = { ...formData, ...extraData };
//       const res = await axios.post('http://localhost:8000/api/auth/register', payload);
//       alert('Inscription réussie !');
//       console.log(res.data);
//     } catch (err) {
//       console.error('Erreur d’inscription :', err.response?.data || err.message);
//       alert('Erreur lors de l’inscription.');
//     }
//   };

//   const renderInput = (icon, placeholder, name, type = 'text', value = '', onChange) => (
//     <div className="flex items-center border-b border-white py-2 text-white">
//       <span className="mr-2 text-lg">{icon}</span>
//       <input
//         type={type}
//         name={name}
//         placeholder={placeholder}
//         value={value}
//         onChange={onChange}
//         required={name !== 'statut_diplomation'}
//         className="bg-transparent outline-none flex-1 placeholder-white"
//       />
//     </div>
//   );

//   const renderSelect = (placeholder, name, options) => (
//     <div className="flex items-center border-b border-white py-2 text-white">
//       <span className="mr-2 text-lg"><FaGraduationCap /></span>
//       <select
//         name={name}
//         value={extraData[name] || ''}
//         onChange={handleExtraChange}
//         required
//         className="bg-transparent text-white outline-none flex-1 placeholder-white"
//       >
//         <option value="">{placeholder}</option>
//         {options.map((opt) => (
//           <option key={opt.id} value={opt.id}>{opt.nom || opt.annee}</option>
//         ))}
//       </select>
//     </div>
//   );

//   return (
//     <div className="min-h-screen bg-cyan-100 flex items-center justify-center p-4">
//       <div className="w-full max-w-6xl bg-white rounded-lg overflow-hidden shadow-md flex flex-col md:flex-row">
//         {/* Partie gauche */}
//         <div className="md:w-1/2 bg-white flex flex-col items-center justify-center text-center p-8">
//           <div className="w-40 h-40 bg-gray-200 mb-4">Logo</div>
//           <h2 className="text-blue-800 text-3xl font-bold">PAS ENCORE INSCRIS?</h2>
//           <p className="text-blue-800 mt-2">
//             inscrivez vous soyez<br />connecter à votre<br />univers académique
//           </p>
//         </div>

//         {/* Partie droite */}
//         <div className="md:w-1/2 bg-blue-700 text-white p-8 relative">
//           <h3 className="text-2xl font-bold mb-6">inscription</h3>

//           <form className="space-y-4" onSubmit={handleSubmit}>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               {renderInput(<FaUser />, 'Nom', 'nom', 'text', formData.nom, handleInputChange)}
//               {renderInput(<FaUser />, 'Prénom', 'prenom', 'text', formData.prenom, handleInputChange)}
//               {renderInput(<FaEnvelope />, 'Email', 'email', 'email', formData.email, handleInputChange)}
//               {renderInput(<FaLock />, 'Mot de passe', 'password', 'password', formData.password, handleInputChange)}
//               {renderInput(<FaLock />, 'Confirmation mot de passe', 'password_confirmation', 'password', formData.password_confirmation, handleInputChange)}
//               {renderInput(<FaUserTie />, 'Téléphone', 'telephone', 'text', formData.telephone, handleInputChange)}
//               {renderInput(<FaCalendarAlt />, 'Date de naissance', 'date_naissance', 'date', formData.date_naissance, handleInputChange)}
//               <div className="flex items-center border-b border-white py-2">
//                 <span className="mr-2 text-lg"><FaUserTie /></span>
//                 <select
//                   name="role"
//                   onChange={handleRoleChange}
//                   required
//                   className="bg-transparent text-white outline-none flex-1 placeholder-white"
//                 >
//                   <option value="">Sélectionnez un rôle</option>
//                   {roles.map((role) => (
//                     <option key={role.id} value={role.nom}>{role.nom}</option>
//                   ))}
//                 </select>
//               </div>
//             </div>

//             {extraFields.map(({ icon, placeholder, name, type = 'text', options }, index) =>
//               type === 'select'
//                 ? renderSelect(placeholder, name, options)
//                 : renderInput(icon, placeholder, name, type, extraData[name] || '', handleExtraChange)
//             )}

//             <button
//               type="submit"
//               className="w-full bg-white text-blue-700 font-semibold py-2 rounded-full hover:bg-blue-100 transition"
//             >
//               s’inscrire
//             </button>
//           </form>

//           <div className="mt-6 text-right text-sm">
//             <span>vous avez déjà un compte ? </span>
//             <a href="/" className="underline text-white hover:text-blue-300">connexion</a>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default RegisterForm;


import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaGraduationCap,
  FaIdCard,
  FaBuilding,
  FaUserTie,
  FaCalendarAlt,
} from 'react-icons/fa';

const RegisterForm = () => {
  const [roles, setRoles] = useState([]);
  // const [filieres, setFilieres] = useState([]);
  // const [anneesAcademiques, setAnneesAcademiques] = useState([]);

  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    telephone: '',
    date_naissance: '',
    email: '',
    password: '',
    password_confirmation: '',
    role_id: '',
  });

  const [extraFields, setExtraFields] = useState([]);
  const [extraData, setExtraData] = useState({});

  useEffect(() => {
    axios.get('http://localhost:8000/api/roles').then((res) => setRoles(res.data));
    // axios.get('http://localhost:8000/api/filieres').then((res) => setFilieres(res.data));
    // axios.get('http://localhost:8000/api/annees-academiques').then((res) => setAnneesAcademiques(res.data));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleExtraChange = (e) => {
    const { name, value } = e.target;
    setExtraData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRoleChange = (e) => {
    const roleName = e.target.value;
    const selectedRole = roles.find((r) => r.nom === roleName);

    if (selectedRole) {
      setFormData((prev) => ({
        ...prev,
        role_id: selectedRole.id,
      }));

      setExtraData({});
      switch (roleName.toLowerCase()) {
        case 'etudiant':
          setExtraFields([
            { name: 'matricule', placeholder: 'Matricule', icon: <FaIdCard /> },
            { name: 'annee_entree', placeholder: "Année d'entrée", icon: <FaCalendarAlt /> },
            { name: 'statut_diplomation', placeholder: 'Statut (optionnel)', icon: <FaGraduationCap /> },
            // Ajout des champs pour éviter l’erreur 422
            { name: 'filiere_id', placeholder: 'Filière', type: 'select', options: [] },
            { name: 'annee_academique_id', placeholder: 'Année académique', type: 'select', options: [] },
          ]);
          break;
        case 'enseignant':
          setExtraFields([
            { name: 'grade', placeholder: 'Grade', icon: <FaUserTie /> },
            { name: 'specialite', placeholder: 'Spécialité', icon: <FaGraduationCap /> },
          ]);
          break;
        case 'responsable academique':
          setExtraFields([
            { name: 'grade', placeholder: 'Grade', icon: <FaUserTie /> },
            { name: 'specialite', placeholder: 'Spécialité', icon: <FaGraduationCap /> },
            { name: 'departement', placeholder: 'Département', icon: <FaBuilding /> },
          ]);
          break;
        default:
          setExtraFields([]);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, ...extraData };
      const res = await axios.post('http://localhost:8000/api/auth/register', payload);
      alert('Inscription réussie !');
      console.log(res.data);
    } catch (err) {
      console.error('Erreur d’inscription :', err.response?.data || err.message);
      alert('Erreur lors de l’inscription.');
    }
  };

  const renderInput = (icon, placeholder, name, type = 'text', value = '', onChange) => (
    <div className="flex items-center border-b border-white py-2 text-white">
      <span className="mr-2 text-lg">{icon}</span>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value ?? ''} // Assure une chaîne vide si undefined/null
        onChange={onChange}
        required={name !== 'statut_diplomation'}
        className="bg-transparent outline-none flex-1 placeholder-white"
      />
    </div>
  );

  const renderSelect = (placeholder, name, options) => (
    <div className="flex items-center border-b border-white py-2 text-white">
      <span className="mr-2 text-lg"><FaGraduationCap /></span>
      <select
        name={name}
        value={extraData[name] ?? ''}
        onChange={handleExtraChange}
        required
        className="bg-transparent text-white outline-none flex-1 placeholder-white"
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option
            key={opt.id ?? opt.nom ?? opt}
            value={opt.id ?? opt.nom ?? opt}
          >
            {opt.nom ?? opt.annee ?? opt}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="min-h-screen bg-cyan-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-white rounded-lg overflow-hidden shadow-md flex flex-col md:flex-row">
        {/* Partie gauche */}
        <div className="md:w-1/2 bg-white flex flex-col items-center justify-center text-center p-8">
          <div className="w-40 h-40 bg-gray-200 mb-4">Logo</div>
          <h2 className="text-blue-800 text-3xl font-bold">PAS ENCORE INSCRIS?</h2>
          <p className="text-blue-800 mt-2">
            inscrivez vous soyez<br />connecter à votre<br />univers académique
          </p>
        </div>

        {/* Partie droite */}
        <div className="md:w-1/2 bg-blue-700 text-white p-8 relative">
          <h3 className="text-2xl font-bold mb-6">inscription</h3>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderInput(<FaUser />, 'Nom', 'nom', 'text', formData.nom, handleInputChange)}
              {renderInput(<FaUser />, 'Prénom', 'prenom', 'text', formData.prenom, handleInputChange)}
              {renderInput(<FaEnvelope />, 'Email', 'email', 'email', formData.email, handleInputChange)}
              {renderInput(<FaLock />, 'Mot de passe', 'password', 'password', formData.password, handleInputChange)}
              {renderInput(<FaLock />, 'Confirmation mot de passe', 'password_confirmation', 'password', formData.password_confirmation, handleInputChange)}
              {renderInput(<FaUserTie />, 'Téléphone', 'telephone', 'text', formData.telephone, handleInputChange)}
              {renderInput(<FaCalendarAlt />, 'Date de naissance', 'date_naissance', 'date', formData.date_naissance, handleInputChange)}
              <div className="flex items-center border-b border-white py-2">
                <span className="mr-2 text-lg"><FaUserTie /></span>
                <select
                  name="role"
                  onChange={handleRoleChange}
                  required
                  className="bg-transparent text-white outline-none flex-1 placeholder-white"
                >
                  <option value="">Sélectionnez un rôle</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.nom}>{role.nom}</option>
                  ))}
                </select>
              </div>
            </div>

            {extraFields.map(({ icon, placeholder, name, type = 'text', options }, index) =>
              type === 'select'
                ? <React.Fragment key={name}>{renderSelect(placeholder, name, options)}</React.Fragment>
                : <React.Fragment key={name}>{renderInput(icon, placeholder, name, type, extraData[name] ?? '', handleExtraChange)}</React.Fragment>
            )}

            <button
              type="submit"
              className="w-full bg-white text-blue-700 font-semibold py-2 rounded-full hover:bg-blue-100 transition"
            >
              s’inscrire
            </button>
          </form>

          <div className="mt-6 text-right text-sm">
            <span>vous avez déjà un compte ? </span>
            <a href="/" className="underline text-white hover:text-blue-300">connexion</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
