<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FiliereSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('filieres')->insert([
            [
                'nom' => 'Informatique',
                'code' => 'INFO',
                'niveau' => 'Licence',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nom' => 'Génie Civil',
                'code' => 'GC',
                'niveau' => 'Licence',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nom' => 'Marketing',
                'code' => 'MKT',
                'niveau' => 'Master',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
