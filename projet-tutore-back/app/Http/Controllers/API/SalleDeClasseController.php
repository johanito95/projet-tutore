<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\SalleDeClasse;
use App\Models\Etudiant;
use App\Models\Enseignant;
use App\Models\InscriptionSalleEtudiant;
use App\Models\InscriptionSalleEnseignant;


class SalleDeClasseController extends Controller
{
    public function showclasse()
    {
        $salles = SalleDeClasse::with(['filiere', 'responsable.enseignant.utilisateur'])->get();
        return response()->json($salles);
    }

    public function createclasse(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nom' => 'required|string|max:255',
            'capacite' => 'required|integer',
            'filiere_id' => 'required|exists:filieres,id',
            'responsable_id' => 'required|exists:responsable_academiques,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();
        if (!$user->hasRole('responsable academique')) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $salle = SalleDeClasse::create($request->all());
        return response()->json(['message' => 'Salle créée', 'salle' => $salle], 201);
    }

    public function updateclasse(Request $request, $id)
    {
        $salle = SalleDeClasse::findOrFail($id);
        $validator = Validator::make($request->all(), [
            'nom' => 'required|string|max:255',
            'capacite' => 'required|integer',
            'filiere_id' => 'required|exists:filieres,id',
            'responsable_id' => 'required|exists:responsable_academiques,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();
        if (!$user->hasRole('responsable academique')) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $salle->update($request->all());
        return response()->json(['message' => 'Salle mise à jour', 'salle' => $salle]);
    }

    public function deleteclasse($id)
    {
        $salle = SalleDeClasse::findOrFail($id);
        $user = request()->user();

        if (!$user->hasRole('responsable academique')) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $salle->delete();
        return response()->json(['message' => 'Salle supprimée']);
    }

    // public function indexUserSalles(Request $request)
    // {
    //     Log::debug('Début de SalleDeClasseController::indexUserSalles', ['request' => $request->all()]);

    //     try {
    //         $user = $request->user();
    //         if (!$user) {
    //             Log::error('Utilisateur non authentifié');
    //             return response()->json(['error' => 'Utilisateur non authentifié'], 401);
    //         }

    //         if (!$user->hasRole('enseignant') && !$user->hasRole('etudiant')) {
    //             Log::error('Utilisateur non autorisé', ['user_id' => $user->id]);
    //             return response()->json(['message' => 'Non autorisé'], 403);
    //         }

    //         $salleIds = [];

    //         // Si l'utilisateur est un étudiant
    //         if ($user->hasRole('etudiant')) {
    //             $etudiant = Etudiant::where('utilisateur_id', $user->id)->first();
    //             if ($etudiant) {
    //                 $salleIds = InscriptionSalleEtudiant::where('etudiant_id', $etudiant->id)
    //                     ->pluck('salle_de_classe_id')
    //                     ->toArray();
    //             }
    //         }

    //         // Si l'utilisateur est un enseignant
    //         if ($user->hasRole('enseignant')) {
    //             $enseignant = Enseignant::where('utilisateur_id', $user->id)->first();
    //             if ($enseignant) {
    //                 $enseignantSalleIds = InscriptionSalleEnseignant::where('enseignant_id', $enseignant->id)
    //                     ->pluck('salle_de_classe_id')
    //                     ->toArray();
    //                 $salleIds = array_unique(array_merge($salleIds, $enseignantSalleIds));
    //             }
    //         }

    //         // Récupérer les salles avec leurs relations
    //         $salles = SalleDeClasse::with(['filiere', 'responsable.enseignant.utilisateur'])
    //             ->whereIn('id', $salleIds)
    //             ->get();

    //         Log::info('Salles de l\'utilisateur récupérées', [
    //             'user_id' => $user->id,
    //             'role' => $user->hasRole('enseignant') ? 'enseignant' : 'etudiant',
    //             'count' => $salles->count()
    //         ]);

    //         return response()->json($salles);
    //     } catch (\Exception $e) {
    //         Log::error('Erreur lors de la récupération des salles de l\'utilisateur', [
    //             'message' => $e->getMessage(),
    //             'trace' => $e->getTraceAsString()
    //         ]);
    //         return response()->json(['error' => 'Erreur lors de la récupération des salles: ' . $e->getMessage()], 500);
    //     }
    // }

}