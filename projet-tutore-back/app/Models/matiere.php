<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Matiere extends Model
{
    public function unite()
    {
        return $this->belongsTo(UniteEnseignement::class, 'ue_id');
    }

    public function enseignants()
    {
        return $this->belongsToMany(Enseignant::class, 'matieres_enseignants');
    }

    public function cours()
    {
        return $this->hasMany(Cours::class);
    }
}
