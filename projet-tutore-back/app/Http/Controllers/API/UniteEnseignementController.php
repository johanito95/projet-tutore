<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\UniteEnseignement;

class UniteEnseignementController extends Controller
{
    public function showUE()
    {
        $ues = UniteEnseignement::with('filiere')->get();
        return response()->json($ues);
    }

    public function createUE(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nom' => 'required|string|max:255',
            'code' => 'required|string|unique:unites_enseignement,code',
            'filiere_id' => 'required|exists:filieres,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();
        if (!$user->hasRole('responsable academique')) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $ue = UniteEnseignement::create($request->all());
        return response()->json(['message' => 'Unité d\'enseignement créée', 'ue' => $ue], 201);
    }

    public function updateUE(Request $request, $id)
    {
        $ue = UniteEnseignement::findOrFail($id);
        $validator = Validator::make($request->all(), [
            'nom' => 'required|string|max:255',
            'code' => 'required|string|unique:unites_enseignement,code,' . $id,
            'filiere_id' => 'required|exists:filieres,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();
        if (!$user->hasRole('responsable academique')) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $ue->update($request->all());
        return response()->json(['message' => 'Unité d\'enseignement mise à jour', 'ue' => $ue]);
    }

    public function deleteUE($id)
    {
        $ue = UniteEnseignement::findOrFail($id);
        $user = request()->user();

        if (!$user->hasRole('responsable academique')) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $ue->delete();
        return response()->json(['message' => 'Unité d\'enseignement supprimée']);
    }
}