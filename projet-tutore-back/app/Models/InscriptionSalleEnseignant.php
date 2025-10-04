<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InscriptionSalleEnseignant extends Model
{
    protected $table = 'inscriptions_salle_enseignant';
    protected $fillable = ['salle_de_classe_id', 'enseignant_id', 'annee_academique_id'];

    public function salleDeClasse()
    {
        return $this->belongsTo(SalleDeClasse::class, 'salle_de_classe_id');
    }

    public function enseignant()
    {
        return $this->belongsTo(Enseignant::class);
    }

    public function anneeAcademique()
    {
        return $this->belongsTo(AnneeAcademique::class);
    }
}