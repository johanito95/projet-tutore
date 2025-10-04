<?php

// AnneeAcademiqueController.php
namespace App\Http\Controllers;

use App\Models\AnneeAcademique;

class AnneeAcademiqueController extends Controller
{
    public function index()
    {
        return AnneeAcademique::all();
    }
}
