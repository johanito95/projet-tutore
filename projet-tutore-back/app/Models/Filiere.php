<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Filiere extends Model
{

    protected $fillable = ['nom', 'code', 'niveau'];

    public function unitesEnseignement()
    {
        return $this->hasMany(UniteEnseignement::class);
    }

    public function salles()
    {
        return $this->hasMany(SalleDeClasse::class);
    }

    public function etudiants()
    {
        return $this->hasMany(Etudiant::class);
    }
}