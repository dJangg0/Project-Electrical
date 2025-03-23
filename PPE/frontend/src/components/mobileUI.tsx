import { useEffect, useState } from "react";
import { SOCKET } from "../config";
import { io } from "socket.io-client";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import "../App.css";

// Create a single WebSocket instance
const socket = io(SOCKET, {
    transports: ["websocket", "polling"], // Use WebSocket first
    reconnectionAttempts: 5, // Retry up to 5 times if disconnected
    reconnectionDelay: 2000, // Wait 2s before retrying
});

type GraphData = {
    name: string;
    voltage: number;
    current: number;
    temperature: number;
};

function MobileUI() {
    const [data, setData] = useState<GraphData[]>([]);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const handleConnect = () => setIsConnected(true);
        const handleDisconnect = () => setIsConnected(false);
        const handleGraphData = (newData: Omit<GraphData, "name">) => {
            setData((prev) => [...prev.slice(-9), { name: `T${prev.length}`, ...newData }]);
        };

        socket.on("connect", handleConnect);
        socket.on("disconnect", handleDisconnect);
        socket.on("graphData", handleGraphData);

        return () => {
            socket.off("connect", handleConnect);
            socket.off("disconnect", handleDisconnect);
            socket.off("graphData", handleGraphData);
        };
    }, []);

    const getVoltageStatus = (voltage: number) => {
        if (voltage > 200) {
            return <span className="text-red-600 font-bold text-lg">OVER VOLTAGE!</span>;
        } else if (voltage < 120) {
            return <span className="text-yellow-600 font-bold text-lg">LOW VOLTAGE!</span>;
        }
        return <span className="text-green-600 font-bold text-lg">NORMAL</span>;
    };

    const getCurrentStatus = (current: number) => {
        if (current > 40) {
            return <span className="text-red-600 font-bold text-lg">OVER CURRENT!</span>;
        } else if (current < 20) {
            return <span className="text-yellow-600 font-bold text-lg">LOW CURRENT!</span>;
        }
        return <span className="text-green-600 font-bold text-lg">NORMAL</span>;
    };

    const getTemperatureStatus = (temperature : number) => {
        if (temperature > 50) {
            return <span className="text-red-600 font-bold text-lg">HOT!</span>;
        } else if (temperature  < 20) {
            return <span className="text-blue-600 font-bold text-lg">COLD!</span>;
        }
        return <span className="text-green-600 font-bold text-lg">NORMAL</span>;
    };

    // ...existing code...

    const renderChart = (dataKey: keyof GraphData, label: string, color: string) => (
        <div className="bg-white shadow-lg rounded-lg p-6">
            <div className="flex flex-col space-y-2">
                <h2 className="text-xl font-semibold text-gray-800">{label}</h2>
                <div className="flex justify-between items-center">
                    {dataKey === "voltage" && data.length > 0 && (
                        <div className="flex items-center">
                            Status: {getVoltageStatus(data[data.length - 1].voltage)}
                        </div>
                    )}
                    {dataKey === "current" && data.length > 0 && (
                        <div className="flex items-center">
                            Status: {getCurrentStatus(data[data.length - 1].current)}
                        </div>
                    )}
                    {dataKey === "temperature" && data.length > 0 && (
                        <div className="flex items-center">
                            Status: {getTemperatureStatus(data[data.length - 1].current)}
                        </div>
                    )}
                </div>
                <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis dataKey="name" stroke="#2c3e50" />
                        <YAxis stroke="#2c3e50" />
                        <Tooltip contentStyle={{ backgroundColor: "#fff", borderRadius: "4px" }} />
                        <Legend />
                        <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={3} dot={{ fill: color, strokeWidth: 2 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <h1 className="text-4xl font-bold text-center text-gray-800 mb-6">Real-Time Panel Board Monitor</h1>


            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                {renderChart("voltage", "Voltage (V)", "#3498db")}
                {renderChart("current", "Current (A)", "#e67e22")}
                {renderChart("temperature", "Temperature (°C)", "#e74c3c")}
            </div>

            <div className="mt-6 p-4 bg-white shadow-md rounded-lg text-center">
                <p className="text-gray-600">Latest Values:</p>
                {data.length > 0 ? (
                    <p className="text-lg font-bold text-gray-800">
                        {data[data.length - 1].voltage.toFixed(2)} V, {data[data.length - 1].current.toFixed(2)} A, {data[data.length - 1].temperature.toFixed(2)}°C
                    </p>
                ) : (
                    <p className="text-lg font-bold text-gray-800">No data available</p>
                )}
            </div>
        </div>
    );
}


export default MobileUI;
