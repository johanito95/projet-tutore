<?php

namespace App\Http\Controllers\API;

use App\Models\Etudiant;
use App\Models\AnneeAcademique;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\SalleDeClasse;

class EtudiantController extends Controller
{
    /**
     * Display a listing of Students with their user information.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function viewStudents()
    {
        try {
            // Fetch teachers with their related user data
            $etudiants = Etudiant::with('utilisateur')->get();
            return response()->json($etudiants, 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la récupération des etudiants',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
