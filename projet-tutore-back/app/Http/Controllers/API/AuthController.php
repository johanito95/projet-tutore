<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Mail;

use App\Models\Utilisateur;
use App\Models\Connexion;
use App\Models\Role;
use App\Models\Etudiant;
use App\Models\Enseignant;
use App\Models\ResponsableAcademique;
use App\Mail\CodeSecuriteMail;

class AuthController extends Controller
{
    /**
     * Enregistrement d'un nouvel utilisateur
     */
    public function register(Request $request)
    {
        // Récupération du rôle
        $role = Role::find($request->role_id);
        if (!$role) {
            return response()->json(['message' => 'Rôle invalide.'], 422);
        }

        // Règles de validation de base
        $rules = [
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'telephone' => 'required|string|max:20',
            'date_naissance' => 'required|date',
            'email' => 'required|email|unique:connexions,email',
            'password' => 'required|string|min:8|confirmed',
            'role_id' => 'required|exists:roles,id',
        ];

        // Ajout des règles spécifiques selon le rôle
        switch (strtolower($role->nom)) {
            case 'etudiant':
                $rules = array_merge($rules, [
                    'matricule' => 'required|string|unique:etudiants,matricule',
                    'filiere_id' => 'required|exists:filieres,id',
                    'annee_entree' => 'required|integer',
                    'annee_academique_id' => 'required|exists:annees_academiques,id',
                    'statut_diplomation' => 'nullable|string',
                ]);
                break;

            case 'enseignant':
                $rules = array_merge($rules, [
                    'grade' => 'required|string',
                    'specialite' => 'required|string',
                ]);
                break;

            case 'responsable academique':
                $rules = array_merge($rules, [
                    'grade' => 'required|string',
                    'specialite' => 'required|string',
                    'departement' => 'required|string',
                ]);
                break;
        }

        // Validation des données
        $validator = Validator::make($request->all(), $rules);
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Création de l'utilisateur
        $utilisateur = Utilisateur::create([
            'nom' => $request->nom,
            'prenom' => $request->prenom,
            'telephone' => $request->telephone,
            'date_naissance' => $request->date_naissance,
            'role_id' => $request->role_id,
        ]);

        // Génération du code de sécurité
        $code = Str::upper(Str::random(6));

        // Création des identifiants de connexion
        $connexion = Connexion::create([
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'code_securite' => $code,
            'utilisateur_id' => $utilisateur->id,
        ]);

        // Création des entités liées selon le rôle
        switch (strtolower($role->nom)) {
            case 'etudiant':
                Etudiant::create([
                    'utilisateur_id' => $utilisateur->id,
                    'matricule' => $request->matricule,
                    'filiere_id' => $request->filiere_id,
                    'annee_entree' => $request->annee_entree,
                    'annee_academique_id' => $request->annee_academique_id,
                    'statut_diplomation' => $request->statut_diplomation,
                ]);
                break;

            case 'enseignant':
                Enseignant::create([
                    'utilisateur_id' => $utilisateur->id,
                    'grade' => $request->grade,
                    'specialite' => $request->specialite,
                ]);
                break;

            case 'responsable academique':
                $enseignant = Enseignant::create([
                    'utilisateur_id' => $utilisateur->id,
                    'grade' => $request->grade,
                    'specialite' => $request->specialite,
                ]);

                ResponsableAcademique::create([
                    'enseignant_id' => $enseignant->id,
                    'departement' => $request->departement,
                ]);
                break;
        }

        // Envoi du mail avec le code de sécurité
        Mail::to($connexion->email)->send(new CodeSecuriteMail($utilisateur, $code));

        return response()->json([
            'message' => 'Inscription réussie. Vérifiez votre email pour le code de sécurité.'
        ], 201);
    }

    /**
     * Connexion avec email, mot de passe et code de sécurité
     */
    public function login(Request $request)
    {
        // Validation des champs
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
            'code_securite' => 'required|string',
        ]);

        // Recherche de la connexion par email
        $connexion = Connexion::where('email', $request->email)->first();

        // Vérification des identifiants
        if (!$connexion || !Hash::check($request->password, $connexion->password)) {
            return response()->json(['message' => 'Email ou mot de passe incorrect'], 401);
        }

        // Vérification du code de sécurité
        if ($connexion->code_securite !== $request->code_securite) {
            return response()->json(['message' => 'Code de sécurité invalide'], 401);
        }

        // Mise à jour du dernier login
        $connexion->last_login = now();
        $connexion->save();

        // Création du token d'authentification Sanctum
        $token = $connexion->createToken('auth_token')->plainTextToken;

        // Réponse
        return response()->json([
            'message' => 'Connexion réussie',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'utilisateur' => $connexion->utilisateur,
        ], 200);
    }

    /**
     * Déconnexion : révoque tous les tokens
     */
    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json(['message' => 'Déconnexion réussie.']);
    }
}
