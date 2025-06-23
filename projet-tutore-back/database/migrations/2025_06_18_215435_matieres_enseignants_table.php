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
        Schema::create('matieres_enseignants', function (Blueprint $table) {
            $table->foreignId('matiere_id')->constrained('matieres')->onDelete('cascade');
            $table->foreignId('enseignant_id')->constrained('enseignants')->onDelete('cascade');
            $table->primary(['matiere_id', 'enseignant_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('matieres_enseignants');
        Schema::table('matieres_enseignants', function (Blueprint $table) {
            $table->dropForeign(['matiere_id']);
            $table->dropForeign(['enseignant_id']);
        });
    }
};
