<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Requete extends Model
{
    public function etudiant()
    {
        return $this->belongsTo(Etudiant::class);
    }

    public function utilisateur()
    {
        return $this->belongsTo(Utilisateur::class);
    }
}

