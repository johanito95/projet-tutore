<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\Matiere;

class MatiereController extends Controller
{
    // public function showmatiere()
    // {
    //     $matieres = Matiere::with('uniteEnseignement')->get();
    //     return response()->json($matieres);
    // }

    public function showmatiere()
    {
        $matieres = Matiere::with(['uniteEnseignement.anneeAcademique'])->get();
        return response()->json($matieres);
    }

    public function creatematiere(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nom' => 'required|string|max:255',
            'code' => 'required|string|unique:matieres,code',
            'ue_id' => 'required|exists:unites_enseignement,id',
            'credits' => 'required|integer',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();
        if (!$user->hasRole('responsable academique')) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $matiere = Matiere::create($request->all());
        return response()->json(['message' => 'Matière créée', 'matiere' => $matiere], 201);
    }

    public function updatematiere(Request $request, $id)
    {
        $matiere = Matiere::findOrFail($id);
        $validator = Validator::make($request->all(), [
            'nom' => 'required|string|max:255',
            'code' => 'required|string|unique:matieres,code,' . $id,
            'ue_id' => 'required|exists:unites_enseignement,id',
            'credits' => 'required|integer',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();
        if (!$user->hasRole('responsable academique')) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $matiere->update($request->all());
        return response()->json(['message' => 'Matière mise à jour', 'matiere' => $matiere]);
    }

    public function deletematiere($id)
    {
        $matiere = Matiere::findOrFail($id);
        $user = request()->user();

        if (!$user->hasRole('responsable academique')) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $matiere->delete();
        return response()->json(['message' => 'Matière supprimée']);
    }
}
