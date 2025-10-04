<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\Cours;
use App\Models\InscriptionCours;

class CoursController extends Controller
{
    public function index()
    {
        $cours = Cours::with(['matiere', 'enseignant.utilisateur', 'salle', 'semestre', 'anneeAcademique'])->get();
        return response()->json($cours);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'matiere_id' => 'required|exists:matieres,id',
            'enseignant_id' => 'required|exists:enseignants,id',
            'salle_id' => 'required|exists:salles_de_classe,id',
            'semestre_id' => 'required|exists:semestres,id',
            'annee_academique_id' => 'required|exists:annees_academiques,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();
        if (!$user->hasRole('responsable academique')) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $cours = Cours::create($request->all());
        return response()->json(['message' => 'Cours créé', 'cours' => $cours], 201);
    }

    public function show($id)
    {
        $cours = Cours::with(['matiere', 'enseignant.utilisateur', 'salle', 'semestre', 'anneeAcademique'])->findOrFail($id);
        return response()->json($cours);
    }

    public function update(Request $request, $id)
    {
        $cours = Cours::findOrFail($id);
        $validator = Validator::make($request->all(), [
            'matiere_id' => 'required|exists:matieres,id',
            'enseignant_id' => 'required|exists:enseignants,id',
            'salle_id' => 'required|exists:salles_de_classe,id',
            'semestre_id' => 'required|exists:semestres,id',
            'annee_academique_id' => 'required|exists:annees_academiques,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();
        if (!$user->hasRole('responsable academique')) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $cours->update($request->all());
        return response()->json(['message' => 'Cours mis à jour', 'cours' => $cours]);
    }

    public function destroy($id)
    {
        $cours = Cours::findOrFail($id);
        $user = request()->user();

        if (!$user->hasRole('responsable academique')) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $cours->delete();
        return response()->json(['message' => 'Cours supprimé']);
    }

    public function etudiantCours(Request $request)
    {
        $user = $request->user();
        if (!$user->hasRole('etudiant')) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $cours = Cours::whereHas('inscriptions', function ($query) use ($user) {
            $query->where('etudiant_id', $user->etudiant->id);
        })->with(['matiere', 'enseignant.utilisateur', 'salle', 'semestre', 'anneeAcademique'])->get();

        return response()->json($cours);
    }
}
