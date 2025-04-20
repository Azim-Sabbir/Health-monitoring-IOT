import React, { useEffect, useRef, useState } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "../config/firebaseConfig";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import NotificationSound from "./alertAudio.mp3";
import axios from "axios";

const Monitor = () => {
    const [data, setData] = useState(null);
    const [isFall, setIsFall] = useState(false);
    const [audioEnabled, setAudioEnabled] = useState(false);
    const [sensorHistory, setSensorHistory] = useState([]);

    const audioPlayer = useRef(new Audio(NotificationSound));

    const stopAlert = () => setIsFall(false);
    const enableAudio = () => {
        setAudioEnabled(true);
        audioPlayer.current.play().catch(err => console.error("Failed to play:", err));
    };

    const saveSensorData = async (sensorData) => {
        const payload = {
            heart_rate: sensorData.heart_rate,
            spO2: sensorData.spO2,
            temperature: sensorData.temperature,
        }

        const response = await axios.post("/api/sensor-data", payload);
        if (response.status === 200) {
            console.log(response)
        } else {
            console.error("Error saving data");
        }
    }

    const entryFallDetection = async () => {
        await axios.post("/api/fall-detect", {
            fall_detect: true,
        });
    }

    useEffect(() => {
        const dbRef = ref(database, "fall_detection");
        onValue(dbRef, (snapshot) => {
            if (snapshot.exists()) {
                setIsFall(snapshot.val());
                entryFallDetection();
            }
        });
    }, []);

    useEffect(() => {
        const dbRef = ref(database, "sensor_data");
        onValue(dbRef, (snapshot) => {
            if (snapshot.exists()) {
                const newData = snapshot.val();
                setData(newData);
                saveSensorData(newData);
                setSensorHistory(prev => [...prev.slice(-20), newData]);
            }
        });
    }, []);

    useEffect(() => {
        audioPlayer.current.loop = true;
        if (isFall && audioEnabled) {
            audioPlayer.current.play().catch(err => console.error("Failed to play:", err));
        } else {
            audioPlayer.current.pause();
            audioPlayer.current.currentTime = 0;
        }
    }, [isFall, audioEnabled]);

    return (
        <div className="flex flex-col p-6 min-h-screen bg-gray-100">
            <h2 className="text-3xl font-semibold text-gray-800 mb-6">Sensor Data Overview</h2>

            {isFall && (
                <div className="bg-red-500 text-white p-4 rounded-lg mb-4 flex justify-between items-center">
                    <span>🚨 Fall detected! Take immediate action.</span>
                    <button onClick={stopAlert} className="bg-white text-red-500 px-4 py-2 rounded-lg font-semibold">
                        Stop Alert
                    </button>
                </div>
            )}

            {!audioEnabled && (
                <button onClick={enableAudio} className="bg-blue-500 text-white px-4 py-2 rounded-lg mb-4">
                    Enable Audio Alerts 🔊
                </button>
            )}

            {data ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white shadow-md rounded-lg p-6">
                        <h3 className="text-xl font-semibold">Heart Rate</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={sensorHistory}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="time" hide />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="heart_rate" stroke="#FF0000" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="bg-white shadow-md rounded-lg p-6">
                        <h3 className="text-xl font-semibold">SpO2 Levels</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={sensorHistory}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="time" hide />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="spO2" stroke="#0000FF" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="bg-white shadow-md rounded-lg p-6">
                        <h3 className="text-xl font-semibold">Temperature</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={sensorHistory}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="time" hide />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="temperature" stroke="#FFA500" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="bg-white shadow-md rounded-lg p-6">
                        <h3 className="text-xl font-semibold">Acceleration (X-Axis)</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={sensorHistory}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="time" hide />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="mpu6050.accel_x" stroke="#008000" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            ) : (
                <p className="text-lg text-gray-700">Loading...</p>
            )}
        </div>
    );
};

export default Monitor;
