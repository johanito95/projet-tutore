<?php

// namespace App\Models;

// use Illuminate\Database\Eloquent\Model;

// class Document extends Model
// {
//     protected $table = 'documents';
//     protected $fillable = ['nom', 'type','url','date_upload','uploader_id', 'file', 'annee_academique_id'];

//     public function anneeAcademique()
//     {
//         return $this->belongsTo(AnneeAcademique::class);
//     }

//     public function typeDocument()
//     {
//         return $this->belongsTo(TypeDocument::class, 'type_id');
//     }
//     public function type()
//     {
//         return $this->belongsTo(TypeDocument::class, 'type_id');
//     }

//     public function utilisateur()
//     {
//         return $this->belongsTo(Utilisateur::class);
//     }

//     public function uploader()
//     {
//         return $this->belongsTo(Utilisateur::class, 'uploader_id');
//     }
// }

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Document extends Model
{
    protected $fillable = [
        'nom',
        'type',
        'extension',
        'url',
        'date_upload',
        'uploader_id',
        'annee_academique_id',
        'matiere_id',
        'salle_ids',
        'raison',
        'restrict_to_role',
    ];

    protected $casts = [
        'salle_ids' => 'array',
    ];

    public function uploader()
    {
        return $this->belongsTo(Utilisateur::class, 'uploader_id');
    }

    public function anneeAcademique()
    {
        return $this->belongsTo(AnneeAcademique::class);
    }

    public function matiere()
    {
        return $this->belongsTo(Matiere::class);
    }

    public function salleDeClasse()
    {
        return $this->belongsToMany(SalleDeClasse::class, 'document_salle_de_classe', 'document_id', 'salle_de_classe_id');
    }
}