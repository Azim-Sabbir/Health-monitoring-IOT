import React, { useEffect, useRef, useState } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "../config/firebaseConfig";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import NotificationSound from "./alertAudio.mp3";
import axios from "axios";

const Monitor = () => {
    const audioPlayer = useRef(new Audio(NotificationSound));

    const [data, setData] = useState(null);
    const [isFall, setIsFall] = useState(false);
    const [audioEnabled, setAudioEnabled] = useState(false);
    const [sensorHistory, setSensorHistory] = useState([]);
    const [analytics, setAnalytics] = useState({
        heart_rate: [],
        spO2: [],
        temperature: [],
    });

    const [alerts, setAlerts] = useState([
        { type: "Heart Rate", status: "Normal" },
        { type: "SpO2", status: "Normal" },
        { type: "Temperature", status: "Normal" },
        { type: "Fall Detection", status: "Normal" },
    ]);



    const stopAlert = () => {
        setAudioEnabled(false);
        audioPlayer.current.pause();
        audioPlayer.current.currentTime = 0;
    }

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
            // console.log(response)
        } else {
            console.error("Error saving data");
        }
    }

    const entryFallDetection = async () => {
        await axios.post("/api/fall-detect", {
            fall_detect: true,
        });
    }

    async function fetchSensorData() {
        const analyticsData = await axios.get("/api/analytics");

        if (analyticsData.status === 200) {
            setAnalytics(analyticsData.data);
        } else {
            console.error("Error fetching analysis data");
        }
    }

    useEffect(() => {
        const dbRef = ref(database, "fall_detection");
        onValue(dbRef, (snapshot) => {
            if (snapshot.exists()) {
                const fallDetectionData = snapshot.val();
                // setIsFall(fallDetectionData);
                 if (fallDetectionData === "No") return;
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
                // saveSensorData(newData);
                setSensorHistory(prev => [...prev.slice(-20), newData]);
            }
        });
    }, []);

    // useEffect(() => {
    //     audioPlayer.current.loop = true;
    //     if (isFall && audioEnabled) {
    //         audioPlayer.current.play().catch(err => console.error("Failed to play:", err));
    //     } else {
    //         audioPlayer.current.pause();
    //         audioPlayer.current.currentTime = 0;
    //     }
    // }, [isFall, audioEnabled]);

    useEffect(() => {
        if (!data) return;

        const { heart_rate, spO2, temperature } = data;
        const newAlerts = [...alerts];

        newAlerts[0].status = heart_rate > 100 ? "High" : heart_rate < 60 ? "Low" : "Normal";
        newAlerts[1].status = spO2 < 90 ? "Low" : "Normal";
        newAlerts[2].status = temperature > 100.4 ? "High" : temperature < 95 ? "Low" : "Normal";

        setAlerts(newAlerts);
    }, [data]);

    useEffect(() => {
        if (alerts.map(alert => alert.status).includes("High")) {
            enableAudio();
        }
    }, [alerts]);

    useEffect( () => {
        fetchSensorData()
    }, []);

    return (
        <div className="flex flex-col p-4 md:p-6 min-h-screen bg-gray-100">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4 md:mb-6">Sensor Data Overview</h2>

            {/* Fall Alert */}
            {alerts.map(alert => alert.status).includes("High") && (
                <div className="bg-red-500 text-white p-3 md:p-4 rounded-lg mb-4 w-full">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                        {
                            alerts.map((alert, index) => (
                                <div key={index} className="mb-2 md:mb-0">
                                    <span className={`font-semibold ${alert.status === "High" ? "text-white" : "text-red-300"}`}>
                                        {alert.status === "High" ? "🚨" : ""} {alert.type}: {alert.status}
                                    </span>
                                </div>
                            ))
                        }
                        {/*<span className="mb-2 md:mb-0">🚨 Fall detected! Take immediate action.</span>*/}
                        <button
                            onClick={stopAlert}
                            className="bg-white text-red-500 px-4 py-2 rounded-lg font-semibold"
                        >
                            Stop Alert
                        </button>
                    </div>
                </div>
            )}

            {/* Audio Toggle */}
            {/*{!audioEnabled && (*/}
            {/*    <button*/}
            {/*        onClick={enableAudio}*/}
            {/*        className="w-full md:w-auto bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg mb-6 transition-colors"*/}
            {/*    >*/}
            {/*        Enable Audio Alerts 🔊*/}
            {/*    </button>*/}
            {/*)}*/}

            {/* Realtime Sensor Cards (3 columns on desktop) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {/* Heart Rate Card */}
                <div className="bg-white shadow-md rounded-lg p-4">
                    <h3 className="text-gray-500 text-sm font-medium">Heart Rate</h3>
                    <div className="flex items-end mt-2">
                        <p className="text-3xl font-bold text-red-500">{Math.round(data?.heart_rate ?? 0)}</p>
                        <span className="ml-2 text-gray-500">bpm</span>
                    </div>
                    <div className="mt-2 text-sm text-green-500 font-medium">
                        <span>▲</span> <span>Normal</span>
                    </div>
                </div>

                {/* SpO2 Card */}
                <div className="bg-white shadow-md rounded-lg p-4">
                    <h3 className="text-gray-500 text-sm font-medium">SpO2 Level</h3>
                    <div className="flex items-end mt-2">
                        <p className="text-3xl font-bold text-blue-500">{Math.round(data?.spO2 ?? 0)}</p>
                        <span className="ml-2 text-gray-500">%</span>
                    </div>
                    <div className="mt-2 text-sm text-green-500 font-medium">
                        <span>▲</span> <span>Excellent</span>
                    </div>
                </div>

                {/* Temperature Card */}
                <div className="bg-white shadow-md rounded-lg p-4">
                    <h3 className="text-gray-500 text-sm font-medium">Temperature</h3>
                    <div className="flex items-end mt-2">
                        <p className="text-3xl font-bold text-orange-500">{Math.round(data?.temperature ?? 0)}</p>
                        <span className="ml-2 text-gray-500">°F</span>
                    </div>
                    <div className="mt-2 text-sm text-green-500 font-medium">
                        <span>▲</span> <span>Normal</span>
                    </div>
                </div>
            </div>

            {/* Charts Grid */}
            {data ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    {/* Heart Rate Chart */}
                    <div className="bg-white shadow-md rounded-lg p-4 md:p-6">
                        <h3 className="text-lg md:text-xl font-semibold mb-2">Heart Rate History</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={analytics.heart_rate}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" hide />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="value" stroke="#FF0000" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* SpO2 Chart */}
                    <div className="bg-white shadow-md rounded-lg p-4 md:p-6">
                        <h3 className="text-lg md:text-xl font-semibold mb-2">SpO2 Levels History</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={analytics.spO2}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" hide />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="value" stroke="#0000FF" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Temperature Chart */}
                    <div className="bg-white shadow-md rounded-lg p-4 md:p-6">
                        <h3 className="text-lg md:text-xl font-semibold mb-2">Temperature Levels History</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={analytics.temperature}>
                                <CartesianGrid strokeDasharray="3 3"/>
                                <XAxis dataKey="name" hide/>
                                <YAxis/>
                                <Tooltip/>
                                <Legend/>
                                <Line type="monotone" dataKey="value" stroke="#FFA500"/>
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Acceleration Chart */}
                    {/*<div className="bg-white shadow-md rounded-lg p-4 md:p-6">*/}
                    {/*    <h3 className="text-lg md:text-xl font-semibold mb-2">Acceleration (X-Axis)</h3>*/}
                    {/*    <ResponsiveContainer width="100%" height={250}>*/}
                    {/*        <LineChart data={sensorHistory}>*/}
                    {/*            <CartesianGrid strokeDasharray="3 3" />*/}
                    {/*            <XAxis dataKey="time" hide />*/}
                    {/*            <YAxis />*/}
                    {/*            <Tooltip />*/}
                    {/*            <Legend />*/}
                    {/*            <Line type="monotone" dataKey="mpu6050.accel_x" stroke="#008000" />*/}
                    {/*        </LineChart>*/}
                    {/*    </ResponsiveContainer>*/}
                    {/*</div>*/}
                </div>
            ) : (
                <p className="text-lg text-gray-700">Loading...</p>
            )}
        </div>
    );
};

export default Monitor;
