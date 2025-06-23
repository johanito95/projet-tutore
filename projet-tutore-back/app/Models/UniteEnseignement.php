<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UniteEnseignement extends Model
{
    protected $table = 'unites_enseignement';

    public function filiere()
    {
        return $this->belongsTo(Filiere::class);
    }

    public function matieres()
    {
        return $this->hasMany(Matiere::class, 'ue_id');
    }
}
