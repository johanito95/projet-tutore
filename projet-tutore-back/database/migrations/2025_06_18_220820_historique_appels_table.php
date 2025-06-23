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
        Schema::create('historique_appels', function (Blueprint $table) {
            $table->id();
            $table->foreignId('appel_id')->constrained('appels')->onDelete('cascade');
            $table->foreignId('utilisateur_id')->constrained('utilisateurs')->onDelete('cascade');
            $table->dateTime('date_modification');
            $table->text('commentaire')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('historique_appels');
        Schema::table('historique_appels', function (Blueprint $table) {
            $table->dropForeign(['appel_id']);
            $table->dropForeign(['utilisateur_id']);
        });
    }
};
