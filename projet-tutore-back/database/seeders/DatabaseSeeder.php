<?php

namespace Database\Seeders;

use App\Models\Connexion;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {

        $this->call(FiliereSeeder::class);
        $this->call(AnneeAcademiqueSeeder::class);

        // User::factory(10)->create();
        $this->call(RoleSeeder::class);
        Connexion::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            
        ]);
    }
}
