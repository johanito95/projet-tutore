<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('presences', function (Blueprint $table) {
            // Supprimer la contrainte étrangère et la colonne statut_id
            $table->dropForeign(['statut_id']);
            $table->dropColumn('statut_id');

            // Ajouter la colonne etat
            $table->enum('etat', ['present', 'absent'])->after('etudiant_id');

            // Ajouter la colonne date_heure
            $table->dateTime('date_heure')->after('etat');
        });
    }

    public function down(): void
    {
        Schema::table('presences', function (Blueprint $table) {
            // Restaurer statut_id et sa contrainte
            $table->foreignId('statut_id')->after('etudiant_id')->constrained('statuts_presences')->onDelete('cascade');

            // Supprimer etat et date_heure
            $table->dropColumn('etat');
            $table->dropColumn('date_heure');
        });
    }
};