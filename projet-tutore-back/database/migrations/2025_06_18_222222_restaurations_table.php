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
        Schema::create('restaurations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sauvegarde_id')->constrained('sauvegardes')->onDelete('cascade');
            $table->dateTime('date_restaur');
            $table->foreignId('fait_par')->constrained('utilisateurs')->onDelete('cascade');
            $table->text('motif');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('restaurations');
        Schema::table('restaurations', function (Blueprint $table) {
            $table->dropForeign(['sauvegarde_id']);
            $table->dropForeign(['fait_par']);
        });
    }
};
