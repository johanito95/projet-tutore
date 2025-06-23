<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ResponsableAcademique extends Model
{
    public function enseignant()
    {
        return $this->belongsTo(Enseignant::class);
    }

    public function salles()
    {
        return $this->hasMany(SalleDeClasse::class, 'responsable_id');
    }

    public function validationsNotes()
    {
        return $this->hasMany(ValidationNote::class, 'responsable_id');
    }
}
