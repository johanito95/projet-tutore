<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cours extends Model
{
    public function matiere()
    {
        return $this->belongsTo(Matiere::class);
    }

    public function enseignant()
    {
        return $this->belongsTo(Enseignant::class);
    }

    public function salle()
    {
        return $this->belongsTo(SalleDeClasse::class, 'salle_id');
    }

    public function semestre()
    {
        return $this->belongsTo(Semestre::class);
    }

    public function anneeAcademique()
    {
        return $this->belongsTo(AnneeAcademique::class);
    }

    public function inscriptions()
    {
        return $this->hasMany(InscriptionCours::class);
    }

    public function appels()
    {
        return $this->hasMany(Appel::class);
    }

    public function notes()
    {
        return $this->hasMany(Note::class);
    }
}
