<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Semestre extends Model
{
    public function anneeAcademique()
    {
        return $this->belongsTo(AnneeAcademique::class);
    }

    public function cours()
    {
        return $this->hasMany(Cours::class);
    }
}
