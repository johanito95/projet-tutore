<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use App\Models\Presence;
use App\Models\Appel;
use App\Models\Etudiant;

class PresenceController extends Controller
{

    public function index(Request $request)
    {
        $presences = Presence::with([
            'appel.cours.matiere',
            'appel.cours.salle',
            'appel.cours.semestre',
            'appel.cours.anneeAcademique',
            'appel.enseignant.utilisateur',
            'etudiant.utilisateur'
        ])->get();
        return response()->json($presences);
    }

    public function store(Request $request)
    {
        Log::info('Début de PresenceController::store', ['input' => $request->all()]);

        $validator = Validator::make($request->all(), [
            'appel_id' => 'required|exists:appels,id',
            'etudiant_id' => 'required|exists:etudiants,id',
            'etat' => 'required|in:present,absent',
            'remarque' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            Log::error('Erreur de validation', ['errors' => $validator->errors()]);
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();
        $appel = Appel::find($request->appel_id);

        if (!$user) {
            Log::error('Utilisateur non authentifié');
            return response()->json(['error' => 'Utilisateur non authentifié'], 401);
        }

        if (!$user->hasRole('enseignant') && !$user->hasRole('responsable academique')) {
            Log::error('Utilisateur non autorisé', ['user_id' => $user->id ?? 'none']);
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        if ($appel->enseignant_id !== $user->enseignant->id) {
            Log::error('Utilisateur n\'est pas l\'enseignant de l\'appel', ['appel_id' => $appel->id, 'enseignant_id' => $appel->enseignant_id]);
            return response()->json(['message' => 'Vous n\'êtes pas l\'enseignant de cet appel'], 403);
        }

        if ($appel->etat !== 'brouillon') {
            Log::error('Appel non en brouillon', ['appel_id' => $appel->id, 'etat' => $appel->etat]);
            return response()->json(['message' => 'L\'appel doit être en état brouillon'], 422);
        }

        try {
            $data = [
                'appel_id' => $request->appel_id,
                'etudiant_id' => $request->etudiant_id,
                'etat' => $request->etat,
                'date_heure' => now(),
                'remarque' => $request->remarque,
            ];
            Log::info('Données pour Presence::create', ['data' => $data]);

            $presence = Presence::create($data);

            Log::info('Présence enregistrée', ['presence_id' => $presence->id]);
            return response()->json(['message' => 'Présence enregistrée', 'presence' => $presence], 201);
        } catch (\Exception $e) {
            Log::error('Erreur lors de l\'enregistrement de la présence', ['message' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['error' => 'Erreur lors de l\'enregistrement: ' . $e->getMessage()], 500);
        }
    }

    public function presencesEtudiant(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            Log::error('Utilisateur non authentifié');
            return response()->json(['error' => 'Utilisateur non authentifié'], 401);
        }

        if (!$user->hasRole('etudiant')) {
            Log::error('Utilisateur non autorisé', ['user_id' => $user->id]);
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $presences = Presence::where('etudiant_id', $user->etudiant->id)
            ->with([
                'appel.cours.matiere',
                'appel.cours.salle',
                'appel.cours.semestre',
                'appel.cours.anneeAcademique',
                'appel.enseignant.utilisateur'
            ])
            ->get();
        return response()->json($presences);
    }

    public function presencesParSalle(Request $request, $salle_id)
    {
        $user = $request->user();
        if (!$user) {
            Log::error('Utilisateur non authentifié');
            return response()->json(['error' => 'Utilisateur non authentifié'], 401);
        }

        if (!$user->hasRole('responsable academique')) {
            Log::error('Utilisateur non autorisé', ['user_id' => $user->id]);
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $presences = Presence::whereHas('appel.cours', function ($query) use ($salle_id) {
            $query->where('salle_id', $salle_id);
        })->with([
            'appel.cours.matiere',
            'appel.cours.salle',
            'appel.cours.semestre',
            'appel.cours.anneeAcademique',
            'appel.enseignant.utilisateur',
            'etudiant.utilisateur'
        ])->get();
        return response()->json($presences);
    }

    public function updatePresence(Request $request, $presence_id)
    {
        Log::info('Début de PresenceController::updatePresence', ['input' => $request->all(), 'presence_id' => $presence_id]);

        $validator = Validator::make($request->all(), [
            'etat' => 'required|in:present,absent',
            'remarque' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            Log::error('Erreur de validation', ['errors' => $validator->errors()]);
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();
        if (!$user) {
            Log::error('Utilisateur non authentifié');
            return response()->json(['error' => 'Utilisateur non authentifié'], 401);
        }

        if (!$user->hasRole('responsable academique')) {
            Log::error('Utilisateur non autorisé', ['user_id' => $user->id]);
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $presence = Presence::find($presence_id);
        if (!$presence) {
            Log::error('Présence non trouvée', ['presence_id' => $presence_id]);
            return response()->json(['message' => 'Présence non trouvée'], 404);
        }

        try {
            $presence->update([
                'etat' => $request->etat,
                'remarque' => $request->remarque,
                'updated_at' => now(),
            ]);

            Log::info('Présence mise à jour', ['presence_id' => $presence->id]);
            return response()->json(['message' => 'Présence mise à jour', 'presence' => $presence], 200);
        } catch (\Exception $e) {
            Log::error('Erreur lors de la mise à jour de la présence', ['message' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['error' => 'Erreur lors de la mise à jour: ' . $e->getMessage()], 500);
        }
    }
    // public function index(Request $request)
    // {
    //     $presences = Presence::with(['appel.cours', 'etudiant.utilisateur'])->get();
    //     return response()->json($presences);
    // }

    // public function store(Request $request)
    // {
    //     Log::info('Début de PresenceController::store', ['input' => $request->all()]);

    //     $validator = Validator::make($request->all(), [
    //         'appel_id' => 'required|exists:appels,id',
    //         'etudiant_id' => 'required|exists:etudiants,id',
    //         'etat' => 'required|in:present,absent',
    //         'remarque' => 'nullable|string',
    //     ]);

    //     if ($validator->fails()) {
    //         Log::error('Erreur de validation', ['errors' => $validator->errors()]);
    //         return response()->json(['errors' => $validator->errors()], 422);
    //     }

    //     $user = $request->user();
    //     $appel = Appel::find($request->appel_id);

    //     if (!$user) {
    //         Log::error('Utilisateur non authentifié');
    //         return response()->json(['error' => 'Utilisateur non authentifié'], 401);
    //     }

    //     if (!$user->hasRole('enseignant') && !$user->hasRole('responsable academique')) {
    //         Log::error('Utilisateur non autorisé', ['user_id' => $user->id ?? 'none']);
    //         return response()->json(['message' => 'Non autorisé'], 403);
    //     }

    //     if ($appel->enseignant_id !== $user->enseignant->id) {
    //         Log::error('Utilisateur n\'est pas l\'enseignant de l\'appel', ['appel_id' => $appel->id, 'enseignant_id' => $appel->enseignant_id]);
    //         return response()->json(['message' => 'Vous n\'êtes pas l\'enseignant de cet appel'], 403);
    //     }

    //     if ($appel->etat !== 'brouillon') {
    //         Log::error('Appel non en brouillon', ['appel_id' => $appel->id, 'etat' => $appel->etat]);
    //         return response()->json(['message' => 'L\'appel doit être en état brouillon'], 422);
    //     }

    //     try {
    //         $data = [
    //             'appel_id' => $request->appel_id,
    //             'etudiant_id' => $request->etudiant_id,
    //             'etat' => $request->etat,
    //             'date_heure' => now(),
    //             'remarque' => $request->remarque,
    //         ];
    //         Log::info('Données pour Presence::create', ['data' => $data]);

    //         $presence = Presence::create($data);

    //         Log::info('Présence enregistrée', ['presence_id' => $presence->id]);
    //         return response()->json(['message' => 'Présence enregistrée', 'presence' => $presence], 201);
    //     } catch (\Exception $e) {
    //         Log::error('Erreur lors de l\'enregistrement de la présence', ['message' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
    //         return response()->json(['error' => 'Erreur lors de l\'enregistrement: ' . $e->getMessage()], 500);
    //     }
    // }

    // public function updatePresence(Request $request, $presence_id)
    // {
    //     Log::info('Début de PresenceController::updatePresence', ['input' => $request->all(), 'presence_id' => $presence_id]);

    //     $validator = Validator::make($request->all(), [
    //         'etat' => 'required|in:present,absent',
    //         'remarque' => 'nullable|string',
    //     ]);

    //     if ($validator->fails()) {
    //         Log::error('Erreur de validation', ['errors' => $validator->errors()]);
    //         return response()->json(['errors' => $validator->errors()], 422);
    //     }

    //     $user = $request->user();
    //     if (!$user) {
    //         Log::error('Utilisateur non authentifié');
    //         return response()->json(['error' => 'Utilisateur non authentifié'], 401);
    //     }

    //     if (!$user->hasRole('responsable academique')) {
    //         Log::error('Utilisateur non autorisé', ['user_id' => $user->id]);
    //         return response()->json(['message' => 'Non autorisé'], 403);
    //     }

    //     $presence = Presence::find($presence_id);
    //     if (!$presence) {
    //         Log::error('Présence non trouvée', ['presence_id' => $presence_id]);
    //         return response()->json(['message' => 'Présence non trouvée'], 404);
    //     }

    //     try {
    //         $presence->update([
    //             'etat' => $request->etat,
    //             'remarque' => $request->remarque,
    //             'updated_at' => now(),
    //         ]);

    //         Log::info('Présence mise à jour', ['presence_id' => $presence->id]);
    //         return response()->json(['message' => 'Présence mise à jour', 'presence' => $presence], 200);
    //     } catch (\Exception $e) {
    //         Log::error('Erreur lors de la mise à jour de la présence', ['message' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
    //         return response()->json(['error' => 'Erreur lors de la mise à jour: ' . $e->getMessage()], 500);
    //     }
    // }


    // public function presencesEtudiant(Request $request)
    // {
    //     $user = $request->user();
    //     if (!$user) {
    //         Log::error('Utilisateur non authentifié');
    //         return response()->json(['error' => 'Utilisateur non authentifié'], 401);
    //     }

    //     if (!$user->hasRole('etudiant')) {
    //         Log::error('Utilisateur non autorisé', ['user_id' => $user->id]);
    //         return response()->json(['message' => 'Non autorisé'], 403);
    //     }

    //     $presences = Presence::where('etudiant_id', $user->etudiant->id)
    //         ->with(['appel.cours'])
    //         ->get();
    //     return response()->json($presences);
    // }

    // public function presencesParSalle(Request $request, $salle_id)
    // {
    //     $user = $request->user();
    //     if (!$user) {
    //         Log::error('Utilisateur non authentifié');
    //         return response()->json(['error' => 'Utilisateur non authentifié'], 401);
    //     }

    //     if (!$user->hasRole('responsable academique')) {
    //         Log::error('Utilisateur non autorisé', ['user_id' => $user->id]);
    //         return response()->json(['message' => 'Non autorisé'], 403);
    //     }

    //     $presences = Presence::whereHas('appel.cours', function ($query) use ($salle_id) {
    //         $query->where('salle_id', $salle_id);
    //     })->with(['appel.cours', 'etudiant.utilisateur'])->get();
    //     return response()->json($presences);
    // }

    // public function presencesParSalle($salleId)
    // {
    //     $presences = Presence::whereHas('appel.cours.salle', function ($query) use ($salleId) {
    //         $query->where('id', $salleId);
    //     })->with([
    //         'etudiant.utilisateur',
    //         'appel.cours.matiere',
    //         'appel.cours.salle',
    //         'appel.cours.semestre',
    //         'appel.cours.anneeAcademique',
    //         'appel.enseignant.utilisateur'
    //     ])->get();

    //     return response()->json($presences);
    // }
}