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

    public function analytics(Request $request)
    {
        /*analytics data for last 24 hrs form now for recharts*/
        $data = HealthData::query()
            ->where('created_at', '>=', now()->subHours(24))
            ->get(['heart_rate', 'spO2', 'temperature', 'created_at']);

        $heartRate = [];
        $spO2 = [];
        $temperature = [];

        foreach ($data as $item) {
            $heartRate[] = [
                'value' => $item->heart_rate,
                'name' => $item->created_at->format('h:i A'),
            ];
            $spO2[] = [
                'value' => $item->spO2,
                'name' => $item->created_at->format('h:i A'),
            ];
            $temperature[] = [
                'value' => $item->temperature,
                'name' => $item->created_at->format('h:i A'),
            ];
        }

        return response()->json([
            'heart_rate' => $heartRate,
            'spO2' => $spO2,
            'temperature' => $temperature,
        ]);
    }
}
