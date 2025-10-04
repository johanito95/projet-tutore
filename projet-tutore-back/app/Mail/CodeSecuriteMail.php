<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class CodeSecuriteMail extends Mailable
{
    use Queueable, SerializesModels;

    public $utilisateur;
    public $code;

    public function __construct($utilisateur, $code)
    {
        $this->utilisateur = $utilisateur;
        $this->code = $code;
    }

    public function build()
    {
        return $this->subject('Votre code de sécurité')
                    ->view('emails.code_securite')
                    ->with([
                        'nom' => $this->utilisateur->nom,
                        'prenom' => $this->utilisateur->prenom,
                        'code' => $this->code,
                    ]);
    }
}
