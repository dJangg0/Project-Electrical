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
    ResponsiveContainer
} from "recharts";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as Tone from "tone"; // Import Tone.js
import { TbCircleLetterGFilled } from "react-icons/tb";
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

function Dashboard() {
    const [data, setData] = useState<GraphData[]>([]);
    const [isConnected, setIsConnected] = useState(false);

    const notify = (message: string, type: "success" | "error" | "warning") => {
        if (type === "success") {
            toast.success(message);
        } else if (type === "error") {
            toast.error(message);
        } else if (type === "warning") {
            toast.warning(message);
        }
    };

    const playTone = (frequency: number, duration: string | number = "4n") => {
            const synth = new Tone.Synth().toDestination();
            synth.triggerAttackRelease(frequency, duration); // Play a note for the specified duration
        };
    
        useEffect(() => {
            const handleConnect = () => {
                console.log("✅ Connected to WebSocket server");
                setIsConnected(true); // Update state to reflect connection
            };
        
            const handleDisconnect = () => {
                console.log("❌ Disconnected from WebSocket server");
                setIsConnected(false); // Update state to reflect disconnection
            };
            const handleGraphData = (newData: Omit<GraphData, "name">) => {
                setData((prev) => [...prev.slice(-9), { name: `T${prev.length}`, ...newData }]);
        
                // Check for abnormal conditions and show notifications
                if (newData.voltage > 250) {
                    notify("Over Voltage Detected!", "error");
                    playTone(440, 3); // Play a tone at 440 Hz (A4) for 2 seconds
                } else if (newData.voltage < 207) {
                    notify("Low Voltage Detected!", "warning");
                    playTone(220, 3); // Play a tone at 220 Hz (A3) for 2 seconds
                }
        
                if (newData.current > 20) {
                    notify("Over Current Detected!", "error");
                    playTone(880, 3); // Play a tone at 880 Hz (A5) for 1.5 seconds
                } else if (newData.current < 10) {
                    notify("Low Current Detected!", "warning");
                    playTone(330, 3); // Play a tone at 330 Hz (E4) for 1.5 seconds
                }
        
                if (newData.temperature > 35) {
                    notify("High Temperature Detected!", "error");
                    playTone(660, 3); // Play a tone at 660 Hz (E5) for 2 seconds
                } else if (newData.temperature < 20) {
                    notify("Low Temperature Detected!", "warning");
                    playTone(550, 3); // Play a tone at 550 Hz (C#5) for 2 seconds
                }
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

        const renderChart = (dataKey: keyof GraphData, label: string, color: string) => (
            <div className="bg-white shadow-lg rounded-lg p-6">
                <div className="flex justify-center items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800 text-center">{label}</h2>
                </div>
                <ResponsiveContainer width="130%" height={200}>
                    <LineChart
                        data={data}
                        margin={{ top: 20, right: 40, left: -25, bottom: 20 }} // Adjusted left margin to -20
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis dataKey="name" stroke="#2c3e50" />
                        <YAxis stroke="#2c3e50" />
                        <Tooltip contentStyle={{ backgroundColor: "#fff", borderRadius: "4px" }} />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey={dataKey}
                            stroke={color}
                            strokeWidth={3}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        );

        return (
            <div className="min-h-1/2 bg-gray-100 p-6 flex">
              {/* Panel Board */}
<div className="w-1/4 bg-white shadow-lg rounded-lg p-4 min-h-screen flex flex-col">
    <h3 className="text-lg font-bold text-center text-gray-800 mb-4 sticky">Panel Board</h3>
    <div className="flex-1 grid grid-cols-2 gap-4">
        <div
            className={`rounded-lg flex items-center justify-center px-2 text-center text-sm ${
                data.length > 0 && data[data.length - 1].voltage > 250
                    ? "bg-red-500 animate-pulse text-white"
                    : "bg-gray-200 text-gray-800"
            }`}
        >
            Over Voltage
        </div>
        <div
            className={`rounded-lg flex items-center justify-center px-2 text-center text-sm ${
                data.length > 0 && data[data.length - 1].voltage < 207
                    ? "bg-yellow-500 animate-pulse text-white"
                    : "bg-gray-200 text-gray-800"
            }`}
        >
            Under Voltage
        </div>
        <div
            className={`rounded-lg flex items-center justify-center px-2 text-center text-sm ${
                data.length > 0 && data[data.length - 1].current > 20
                    ? "bg-red-500 animate-pulse text-white"
                    : "bg-gray-200 text-gray-800"
            }`}
        >
            Over Current
        </div>
        <div
            className={`rounded-lg flex items-center justify-center px-2 text-center text-sm ${
                data.length > 0 && data[data.length - 1].current < 10
                    ? "bg-yellow-500 animate-pulse text-white"
                    : "bg-gray-200 text-gray-800"
            }`}
        >
            Under Current
        </div>
        <div
            className={`rounded-lg flex items-center justify-center px-2 text-center text-sm ${
                data.length > 0 && data[data.length - 1].temperature > 35
                    ? "bg-red-500 animate-pulse text-white"
                    : "bg-gray-200 text-gray-800"
            }`}
        >
            High Temperature
        </div>
        <div
            className={`rounded-lg flex items-center justify-center px-2 text-center text-sm ${
                data.length > 0 && data[data.length - 1].temperature < 20
                    ? "bg-yellow-500 animate-pulse text-white"
                    : "bg-gray-200 text-gray-800"
            }`}
        >
            Low Temperature
        </div>
    </div>
</div>
        
                {/* Main Content */}
                <div className="w-3/4 pl-6">
                    <div className="w-full flex flex-row justify-center items-center gap-2 bg-sky-800 p-2">
                        <TbCircleLetterGFilled className="text-3xl" />
                        <h3 className="text-2xl font-bold text-center text-white">
                            ELECTRICAL MONITORING SYSTEM
                        </h3>
                    </div>
        
                    <div className="flex justify-center items-center mb-4 mt-4">
                        <div
                            className={`px-4 py-2 rounded-full ${
                                isConnected
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                            }`}
                        >
                            {isConnected ? "🟢 Connected" : "🔴 Disconnected"}
                        </div>
                    </div>
        
                    <div className="grid grid-cols-3 gap-4 mt-6 w-full"> {/* Changed grid-cols-1 to grid-rows-3 */}
                        {renderChart("voltage", "Voltage (V)", "#3498db")}
                        {renderChart("current", "Current (A)", "#e67e22")}
                        {renderChart("temperature", "Temp (°C)", "#e74c3c")}
                    </div>
        
                    <div className="mt-6 p-4 bg-white shadow-md rounded-lg text-center">
                        <p className="text-gray-600">Latest Values:</p>
                        {data.length > 0 ? (
                            <div>
                                <p className="text-lg font-bold text-gray-800">
                                    {data[data.length - 1].voltage.toFixed(2)} V,{" "}
                                    {data[data.length - 1].current.toFixed(2)} A,{" "}
                                    {data[data.length - 1].temperature.toFixed(2)}°C
                                </p>
                            </div>
                        ) : (
                            <p className="text-lg font-bold text-gray-800">
                                No data available
                            </p>
                        )}
                    </div>
        
                    {/* Toast Container */}
                    <ToastContainer />
                </div>
            </div>
        );
    }

export default Dashboard;