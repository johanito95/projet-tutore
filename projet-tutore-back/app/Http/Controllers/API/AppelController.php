<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\Appel;
use App\Models\Cours;

use App\Models\Presence;
use App\Models\StatutPresence;

class AppelController extends Controller
{
    public function index(Request $request)
    {
        $appels = Appel::with([
            'cours.matiere',
            'cours.enseignant.utilisateur',
            'cours.salle',
            'cours.semestre',
            'cours.anneeAcademique',
            'enseignant.utilisateur'
        ])->get();
        return response()->json($appels);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'cours_id' => 'required|exists:cours,id',
            'date_heure' => 'required|date',
            'commentaire' => 'nullable|string',
            'etat' => 'required|in:brouillon,valide,verrouille',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();
        $cours = Cours::find($request->cours_id);

        if (!$user->hasRole('enseignant') && !$user->hasRole('responsable academique')) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        if ($cours->enseignant_id !== $user->enseignant->id) {
            return response()->json(['message' => 'Vous n\'êtes pas l\'enseignant de ce cours'], 403);
        }

        $appel = Appel::create([
            'cours_id' => $request->cours_id,
            'enseignant_id' => $user->enseignant->id,
            'date_heure' => $request->date_heure,
            'commentaire' => $request->commentaire,
            'etat' => $request->etat,
        ]);

        return response()->json(['message' => 'Appel créé', 'appel' => $appel], 201);
    }

    public function update(Request $request, $id)
    {
        $appel = Appel::findOrFail($id);
        $validator = Validator::make($request->all(), [
            'date_heure' => 'required|date',
            'commentaire' => 'nullable|string',
            'etat' => 'required|in:brouillon,valide,verrouille',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();
        if ($appel->enseignant_id !== $user->enseignant->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $appel->update($request->only(['date_heure', 'commentaire', 'etat']));
        return response()->json(['message' => 'Appel mis à jour', 'appel' => $appel]);
    }

    public function appelsParCours($coursId)
    {
        $appels = Appel::where('cours_id', $coursId)
            ->with([
                'cours.matiere',
                'cours.enseignant.utilisateur',
                'cours.salle',
                'cours.semestre',
                'cours.anneeAcademique',
                'enseignant.utilisateur'
            ])
            ->get();
        return response()->json($appels);
    }


    public function valider(Request $request, $id)
    {
        $appel = Appel::findOrFail($id);
        if ($appel->etat !== 'brouillon') {
            return response()->json(['message' => 'Appel déjà validé ou verrouillé'], 422);
        }

        $user = $request->user();
        if (!$user->hasRole('responsable academique')) {
            return response()->json(['message' => 'Vous n\'êtes pas autorisé à valider cet appel'], 403);
        }

        $appel->etat = 'valide';
        $appel->save();

        return response()->json(['message' => 'Appel validé']);
    }

    // public function appelsParCours($cours_id)
    // {
    //     $appels = Appel::where('cours_id', $cours_id)->with(['cours', 'enseignant.utilisateur'])->get();
    //     return response()->json($appels);
    // }

    public function show($id)
    {
        try {
            $appel = Appel::with([
                'cours.matiere',
                'cours.enseignant.utilisateur',
                'cours.salle',
                'cours.semestre',
                'cours.anneeAcademique',
                'enseignant.utilisateur'
            ])->findOrFail($id);
            return response()->json($appel);
        } catch (\Exception $e) {
            Log::error('Erreur lors de la récupération de l’appel', [
                'appel_id' => $id,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['error' => 'Appel non trouvé'], 404);
        }
    }
}
