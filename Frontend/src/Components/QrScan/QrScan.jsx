import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useNavigate } from "react-router";
import toast from 'react-hot-toast';
import '../../CSS/QrScan.css';
import axios from 'axios';
import API_BASE_URL from '../../utils/api';

const QrScan = () => {
    const navigate = useNavigate()
    const html5QrCodeRef = useRef(null);
    const [result, setResult] = useState('Scanned result will appear here...');
    const token = localStorage.getItem('token');

    const stopScanner = async () => {
        if (html5QrCodeRef.current) {
            try {
                const state = html5QrCodeRef.current.getState();
                if (state === 2 || state === 3) {
                    await html5QrCodeRef.current.stop();
                }
            } catch (e) { }
            html5QrCodeRef.current = null;
        }
    };

    const startScanner = async () => {
        await stopScanner();

        const html5QrCode = new Html5Qrcode("reader");
        html5QrCodeRef.current = html5QrCode;

        Html5Qrcode.getCameras()
            .then(devices => {
                if (devices && devices.length) {
                    html5QrCode.start(
                        { facingMode: "environment" },
                        {
                            fps: 10,
                            qrbox: 250
                        },
                        async (qrCodeMessage) => {
                            const qrData = JSON.parse(qrCodeMessage)
                            if (qrData.generatedBy !== "Map Forge") {
                                toast.error("Invalid QR Code")
                                return null;
                            }
                            try {
                                const buildingId = Number(qrData.userId);
                                if (isNaN(buildingId)) {
                                    toast.error("Invalid User ID in QR Code");
                                    return;
                                }

                                let res = await axios.get(`${API_BASE_URL}/api/building/${buildingId}`, {
                                    headers: {
                                        "Accept": "application/json",
                                        'ngrok-skip-browser-warning': 'true'
                                    }
                                });

                                if (!res.data || res.data.length === 0) {
                                    toast.error("No buildings found for this user");
                                    return;
                                }

                                await stopScanner();
                                navigate('/all-map', { state: { orgName: qrData.orgName, building: res.data } });
                            } catch (error) {
                                if (error.response && error.response.status === 404) {
                                    toast.error("Building not found");
                                } else {
                                    toast.error("Something Went Wrong while fetching data");
                                }
                            }
                        }
                    );
                }
            })
            .catch(err => {
                setResult("Camera access denied or not available.");
            });
    };

    useEffect(() => {
        startScanner();

        // Cleanup on unmount
        return () => {
            stopScanner();
        };
    }, []);

    return (
        <div className="qr-container">
            <h1 className='qr-h1'>Scan QR Code</h1>
            <p className='qr-p'>Point your camera at any QR code</p>

            <div id="reader"></div>

            <div className='btn-cont'>
                <button className='back-qr' onClick={() => { navigate('/') }}>Back Home</button>
                <button className='restart-qr' onClick={startScanner}>Restart Scanner</button>
            </div>
        </div>
    );
};

export default QrScan;