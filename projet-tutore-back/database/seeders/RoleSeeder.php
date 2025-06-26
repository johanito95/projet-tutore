<?php

// database/seeders/RoleSeeder.php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;

class RoleSeeder extends Seeder
{
    public function run()
    {
        $roles = [
            'etudiant',
            'enseignant',
            'responsable academique',
        ];

        foreach ($roles as $roleName) {
            Role::firstOrCreate(['nom' => $roleName]);
        }
    }
}
