<?php

namespace App\Http\Controllers;

use App\Models\FallDetection;
use App\Models\HealthData;
use App\Services\FirebaseService;
use Illuminate\Http\Request;

class FirebaseController extends Controller
{
    public function saveSensorData(Request $request)
    {
        $data = [
            "heart_rate" => $request->input('heart_rate'),
            "spO2" => $request->input('spO2'),
            "temperature" => $request->input('temperature'),
        ];

        $data = HealthData::query()->create($data);

        return response()->json([
            'message' => 'Data synchronized successfully',
            'data' => $data,
        ]);
    }

    public function fallDetect(Request $request)
    {
        FallDetection::query()->create([
            'fall_detected' => $request->input('fall_detected'),
        ]);

        return response()->json([
            'message' => 'Fall detection data synchronized successfully',
        ]);
    }
}
