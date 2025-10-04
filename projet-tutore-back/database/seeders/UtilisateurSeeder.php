<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Utilisateur;

class UtilisateurSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $utilisateurs = [
            [
                'nom' => 'Tchamgoue',
                'prenom' => 'Jean',
                'telephone' => '+237690123456',
                'date_naissance' => '1990-05-15',
                'photo' => null,
                'role_id' => 3, // Responsable académique
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nom' => 'Ngono',
                'prenom' => 'Marie',
                'telephone' => '+237677987654',
                'date_naissance' => '1998-08-22',
                'photo' => null,
                'role_id' => 1, // Étudiant
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nom' => 'Eto',
                'prenom' => 'Paul',
                'telephone' => '+237694321789',
                'date_naissance' => '1985-03-10',
                'photo' => null,
                'role_id' => 2, // Enseignant
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($utilisateurs as $utilisateur) {
            Utilisateur::create($utilisateur);
        }
    }
}