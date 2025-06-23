<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SalleDeClasse extends Model
{
    protected $table = 'salles_de_classe';

    public function filiere()
    {
        return $this->belongsTo(Filiere::class);
    }

    public function responsable()
    {
        return $this->belongsTo(ResponsableAcademique::class, 'responsable_id');
    }

    public function enseignants()
    {
        return $this->belongsToMany(Enseignant::class, 'enseignants_salles');
    }

    public function cours()
    {
        return $this->hasMany(Cours::class, 'salle_id');
    }
}

