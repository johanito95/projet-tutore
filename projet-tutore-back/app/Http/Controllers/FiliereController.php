<?php

// FiliereController.php
namespace App\Http\Controllers;

use App\Models\Filiere;

class FiliereController extends Controller
{
    public function index()
    {
        return Filiere::all(); // ou response()->json(Filiere::all());
    }
}

