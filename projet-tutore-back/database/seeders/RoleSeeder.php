<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $roles = [
            [
                'nom' => 'etudiant',
                'description' => 'Étudiant de l’IUT de Douala'
            ],
            [
                'nom' => 'enseignant',
                'description' => 'Enseignant de l’IUT de Douala'
            ],
            [
                'nom' => 'responsable academique',
                'description' => 'Responsable académique de l’IUT de Douala'
            ]
        ];

        foreach ($roles as $role) {
            Role::create($role);
        }
    }
}
?>