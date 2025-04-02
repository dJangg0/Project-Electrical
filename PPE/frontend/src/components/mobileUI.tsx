import { useEffect, useState } from "react";
import { SOCKET } from "../config";
import { io } from "socket.io-client";
// import {
//     LineChart,
//     Line,
//     XAxis,
//     YAxis,
//     CartesianGrid,
//     Tooltip,
//     Legend,
//     ResponsiveContainer,
// } from "recharts";
import { GiElectricalResistance } from "react-icons/gi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as Tone from "tone"; // Import Tone.js
import "../App.css";
import { Gauge, gaugeClasses } from '@mui/x-charts/Gauge';
import { TbCircleLetterGFilled } from "react-icons/tb";

// Create a single WebSocket instance
const socket = io(SOCKET, {
    transports: ["websocket", "polling"], // Use WebSocket first
    reconnectionAttempts: 5, // Retry up to 5 times if disconnected
    reconnectionDelay: 2000, // Wait 2s before retrying
});

const GAUGE_COLORS: Record<keyof Omit<GraphData, 'name'>, string> = {
    voltage: "#fb4141",    // Red
    current: "#ffeb55",    // Yellow
    temperature: "#0000ff" // Blue
} as const;

type GaugeMaxValues = {
    [K in keyof Omit<GraphData, 'name'>]: number;
};

const maxValues: GaugeMaxValues = {
    voltage: 300,
    current: 50,
    temperature: 100
};

type GraphData = {
    name: string;
    voltage: number;
    current: number;
    temperature: number;
};

function MobileUI() {
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

    const getVoltageStatus = (voltage: number) => {
        if (voltage > 250) {
            return <span className="text-red-600 font-bold text-lg">OVER VOLTAGE!</span>;
        } else if (voltage < 207) {
            return <span className="text-yellow-600 font-bold text-lg">LOW VOLTAGE!</span>;
        }
        return <span className="text-green-600 font-bold text-lg">NORMAL</span>;
    };

    const getCurrentStatus = (current: number) => {
        if (current > 20) {
            return <span className="text-red-600 font-bold text-lg">OVER CURRENT!</span>;
        } else if (current < 10) {
            return <span className="text-yellow-600 font-bold text-lg">LOW CURRENT!</span>;
        }
        return <span className="text-green-600 font-bold text-lg">NORMAL</span>;
    };

    const getTemperatureStatus = (temperature: number) => {
        if (temperature > 35) {
            return <span className="text-red-600 font-bold text-lg">HOT!</span>;
        } else if (temperature < 20) {
            return <span className="text-blue-600 font-bold text-lg">COLD!</span>;
        }
        return <span className="text-green-600 font-bold text-lg">NORMAL</span>;
    };

    const renderChart = (dataKey: keyof Omit<GraphData, 'name'>, label: string) => {
        const rawValue = data.length > 0 ? Number(data[data.length - 1][dataKey]) : 0;
        const value = Math.min(rawValue, maxValues[dataKey]); // Ensure value does not exceed max
        const normalizedValue = (value / maxValues[dataKey]) * 100; // Normalize value to a percentage (0-100)
    
        return (
            <div className="bg-white shadow-lg rounded-lg p-6">
                
                <div className="flex flex-col space-y-2">
                    <h2 className="text-xl font-semibold text-gray-800 text-center">{label}</h2>
                    <div className="flex justify-center items-center">
                        {dataKey === "voltage" && getVoltageStatus(rawValue)}
                        {dataKey === "current" && getCurrentStatus(rawValue)}
                        {dataKey === "temperature" && getTemperatureStatus(rawValue)}
                    </div>
                    <div className="flex justify-center items-center h-[200px]">
                        <Gauge
                            value={normalizedValue} // Use normalized value (0-100)
                            max={100} // Gauge max is always 100 (percentage)
                            valueLabel={`${rawValue.toFixed(2)} ${label.split(" ")[1]}`}
                            startAngle={-110}
                            endAngle={110}
                            sx={{
                                width: '100%',
                                height: '200px',
                                [`& .${gaugeClasses.valueText}`]: {
                                    fontSize: '1rem',
                                    display: 'none',
                                    fill: 'black',
                                },
                                [`& .${gaugeClasses.valueArc}`]: {
                                    fill: GAUGE_COLORS[dataKey as keyof typeof GAUGE_COLORS],
                                },
                                [`& .${gaugeClasses.referenceArc}`]: {
                                    fill: '#e0e0e0',
                                },
                            }}
                        />
                    </div>
                    {/* Display the real data below the gauge */}
                    <div className="text-center mt-2">
                        <p className="text-lg font-bold text-gray-800">
                            {rawValue.toFixed(2)} {label.split(" ")[1]}
                        </p>
                    </div>
                </div>
            </div>
        );
    };


    return (
        <div className="min-h-screen bg-gray-100 p-6">
           <div className="w-full flex flex-row justify-center items-center gap-2 bg-sky-800 p-2 mb-4">
               <TbCircleLetterGFilled className="text-3xl" />
                 <h3 className="text-2xl font-bold text-center text-white">
                      ELECTRICAL MONITORING SYSTEM
                </h3>
            </div>

            <div className="flex justify-center items-center mb-4">
                <div className={`px-4 py-2 rounded-full ${
                    isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                    {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                {renderChart("voltage", "Voltage (V)")}
                {renderChart("current", "Current (A)")}
                {renderChart("temperature", "Temperature (°C)")}
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

            {/* Toast Container */}
            <ToastContainer />
        </div>
    );
}

export default MobileUI;