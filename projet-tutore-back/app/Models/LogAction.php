<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LogAction extends Model
{
    use HasFactory;

    protected $table = 'logs_actions';

    protected $fillable = [
        'utilisateur_id',
        'action',
        'cible',
        'date_action',
    ];

    protected $casts = [
        'date_action' => 'datetime',
    ];

    public function utilisateur()
    {
        return $this->belongsTo(Utilisateur::class);
    }
}
