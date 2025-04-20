<?php

namespace App\Http\Controllers;

use App\Services\FirebaseService;
use Illuminate\Http\Request;

class FirebaseController extends Controller
{
    public function index()
    {
        $firebase = new FirebaseService();
        $database = $firebase->getDatabase();

        // Example: Fetch data from a specific path
        $reference = $database->getReference('path/to/your/data');
        $firebaseData = $reference->getValue();

        foreach ($firebaseData as $key => $value) {
            logger(json_encode($value));
            // Store in your Laravel database
//            YourModel::updateOrCreate(
//                ['firebase_key' => $key], // Unique identifier
//                [
//                    'field1' => $value['field1'] ?? null,
//                    'field2' => $value['field2'] ?? null,
//                    // Map other fields as needed
//                ]
//            );
        }

        return response()->json(['message' => 'Data synchronized successfully']);
    }
}
