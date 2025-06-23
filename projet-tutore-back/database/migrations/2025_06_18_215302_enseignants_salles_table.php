<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('enseignants_salles', function (Blueprint $table) {
            $table->foreignId('enseignant_id')->constrained('enseignants')->onDelete('cascade');
            $table->foreignId('salle_id')->constrained('salles_de_classe')->onDelete('cascade');
            $table->primary(['enseignant_id', 'salle_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('enseignants_salles');
        Schema::table('enseignants_salles', function (Blueprint $table) {
            $table->dropForeign(['enseignant_id']);
            $table->dropForeign(['salle_id']);
        });
    }
};
