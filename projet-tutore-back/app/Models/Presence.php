<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Presence extends Model
{
    protected $table = 'presences';
    protected $fillable = [
        'appel_id',
        'etudiant_id',
        'etat',
        'date_heure',
        'remarque'];
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