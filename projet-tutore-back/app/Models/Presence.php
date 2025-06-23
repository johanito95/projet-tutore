<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Presence extends Model
{
    public function appel()
    {
        return $this->belongsTo(Appel::class);
    }

    public function etudiant()
    {
        return $this->belongsTo(Etudiant::class);
    }

    public function statut()
    {
        return $this->belongsTo(StatutPresence::class, 'statut_id');
    }
}
