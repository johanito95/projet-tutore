<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InscriptionCours extends Model
{
    public function etudiant()
    {
        return $this->belongsTo(Etudiant::class);
    }

    public function cours()
    {
        return $this->belongsTo(Cours::class);
    }

    public function anneeAcademique()
    {
        return $this->belongsTo(AnneeAcademique::class);
    }
}
