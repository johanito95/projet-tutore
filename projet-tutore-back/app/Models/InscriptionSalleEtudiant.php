<?php

// namespace App\Models;

// use Illuminate\Database\Eloquent\Model;

// class InscriptionSalleEtudiant extends Model
// {
//     protected $table = 'inscriptions_salle_etudiant';
//     protected $fillable = ['salle_de_classe_id', 'etudiant_id', 'annee_academique_id'];

//     public function salleDeClasse()
//     {
//         return $this->belongsTo(SalleDeClasse::class, 'salle_de_classe_id');
//     }

//     public function etudiant()
//     {
//         return $this->belongsTo(Etudiant::class);
//     }

//     public function anneeAcademique()
//     {
//         return $this->belongsTo(AnneeAcademique::class);
//     }
// }


namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InscriptionSalleEtudiant extends Model
{
    protected $table = 'inscriptions_salle_etudiant';
    protected $fillable = ['salle_de_classe_id', 'etudiant_id', 'annee_academique_id'];

    public function salleDeClasse()
    {
        return $this->belongsTo(SalleDeClasse::class, 'salle_de_classe_id', 'id');
    }

    public function etudiant()
    {
        return $this->belongsTo(Etudiant::class, 'etudiant_id', 'id');
    }

    public function anneeAcademique()
    {
        return $this->belongsTo(AnneeAcademique::class, 'annee_academique_id', 'id');
    }
}
