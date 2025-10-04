<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UniteEnseignement extends Model
{
    protected $table = 'unites_enseignement';
    protected $fillable = ['nom', 'code', 'filiere_id'];

    public function filiere()
    {
        return $this->belongsTo(Filiere::class);
    }

    public function matieres()
    {
        return $this->hasMany(Matiere::class, 'ue_id');
    }

    public function anneeAcademique()
    {
        return $this->belongsTo(AnneeAcademique::class, 'annee_academique_id');
    }
}
