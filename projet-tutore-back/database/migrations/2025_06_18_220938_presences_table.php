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
        Schema::create('presences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('appel_id')->constrained('appels')->onDelete('cascade');
            $table->foreignId('etudiant_id')->constrained('etudiants')->onDelete('cascade');
            $table->foreignId('statut_id')->constrained('statuts_presences')->onDelete('cascade');
            $table->text('remarque')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('presences');
        Schema::table('presences', function (Blueprint $table) {
            $table->dropForeign(['appel_id']);
            $table->dropForeign(['etudiant_id']);
            $table->dropForeign(['statut_id']);
        });
    }
};
