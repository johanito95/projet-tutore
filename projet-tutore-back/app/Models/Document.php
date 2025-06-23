<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Document extends Model
{
    public function type()
    {
        return $this->belongsTo(TypeDocument::class, 'type_id');
    }

    public function utilisateur()
    {
        return $this->belongsTo(Utilisateur::class);
    }
}
