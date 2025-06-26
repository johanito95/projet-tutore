<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ResponsableAcademique extends Model
{
    use HasFactory;

    protected $fillable = [
        'enseignant_id',
        'departement',
    ];

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
