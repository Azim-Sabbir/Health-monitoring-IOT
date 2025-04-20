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
        Schema::create('fall_detections', function (Blueprint $table) {
            $table->id();
            $table->string('device_id')->nullable();
            $table->boolean('fall_detected')->default(false);
            $table->json('detection_meta')->nullable();
            $table->string('detection_type')->nullable();
            $table->string('detection_status')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fall_detections');
    }
};
