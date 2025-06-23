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
        Schema::create('sauvegardes', function (Blueprint $table) {
            $table->id();
            $table->dateTime('date_backup');
            $table->foreignId('effectue_par')->constrained('utilisateurs')->onDelete('cascade');
            $table->text('commentaire')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sauvegardes');
        Schema::table('sauvegardes', function (Blueprint $table) {
            $table->dropForeign(['effectue_par']);
        });
    }
};
