import React from 'react';
import { CircleUserRound, ChevronDown, QrCode, Eye, CloudUpload, LogOut, Route, BrainCircuit, X } from 'lucide-react';
import { TypeAnimation } from 'react-type-animation';
import { useNavigate } from 'react-router';
import Logo from '../../Assets/Logo.png';
import Scene from '../../Assets/scene.mp4'
import QRCodeStyling from "qr-code-styling";
import { motion, AnimatePresence } from "motion/react"
import '../../CSS/Home.css'
import '../../SCSS/Homes.scss';
const Homes = () => {
    const navigate = useNavigate();
    const [showQrCode, setShowQrCode] = React.useState(false);
    const detailsRef = React.useRef(null)
    const divRef = React.useRef(null);
    const qrRef = React.useRef(null);

    React.useEffect(() => {
        if (!localStorage.getItem("token") && !showQrCode) return;
        if (!divRef.current) return;
        divRef.current.innerHTML = "";

        qrRef.current = new QRCodeStyling({
            width: 300,
            height: 300,
            data: JSON.stringify({
                generatedBy: "Map Forge",
                orgName: JSON.parse(localStorage.getItem('user'))?.name || 'User',
                userId: Number(JSON.parse(localStorage.getItem("user"))?.id) || null
            }),
            image: Logo,
            dotsOptions: {
                color: "#4267b2",
                type: "rounded"
            },
            imageOptions: {
                crossOrigin: "anonymous",
                margin: 10,
                imageSize: 0.5
            },
            qrOptions: {
                errorCorrectionLevel: "H"
            }
        });
        console.log(qrRef.current);

        qrRef.current.append(divRef.current);

        return () => {
            qrRef.current = null
            if (divRef.current) {
                divRef.current.innerHTML = "";
            }
        }

    }, [showQrCode]);


    return (
        <div className="homes">
            <header>
                <div className="left">
                    <img src={Logo} alt="Logo" height={"50px"} width={"50px"} />
                    <h1 className="title text-gradient">Map Forge</h1>
                </div>
                <div className="right">
                    {
                        localStorage.getItem('token') ?

                            <details className='login-detail' ref={detailsRef}>
                                <summary className='flex'>{JSON.parse(localStorage.getItem('user'))?.name || 'User'} <ChevronDown size={18} /></summary>
                                <div>
                                    <button className='upload flex'
                                        onClick={() => navigate('/upload')}
                                    >Upload Image <CloudUpload /></button>
                                    <button
                                        className='upload flex'
                                        onClick={() => {
                                            setShowQrCode(true)
                                            detailsRef.current.open = false;
                                        }}
                                    >
                                        Show Qr <QrCode />
                                    </button>

                                    <button
                                        className='logout flex'
                                        onClick={() => {
                                            localStorage.removeItem('token');
                                            localStorage.removeItem('user');
                                            window.location.reload();
                                        }}
                                    >
                                        Logout <LogOut />
                                    </button>
                                </div>
                            </details>
                            :
                            <button className="login-btn flex" onClick={() => navigate('/login')}><CircleUserRound size={25} />Login</button>
                    }
                </div>
            </header>

            <main>
                <div className="backgrounds">
                    <video className="scene" autoPlay muted loop playsInline>
                        <source src={Scene} type="video/mp4" />
                    </video>
                    <div className="grid-backgrounds"></div>
                </div>

                <div className="hero">
                    <div className='pill'>AI Powered Indoor Navigation</div>

                    <div className="slogan">
                        <div className="line1 lines">
                            <div>Navigate Any</div>
                            <TypeAnimation
                                className='typo text-gradient'
                                sequence={['Buildings', 500, 'Place', 500, 'Organizations', 500]}
                                style={{ fontSize: 'clamp(50px, 5vw, 80px)', fontWeight: "700", fontFamily: "sans-serif" }}
                                repeat={Infinity}
                            />
                        </div>
                        <div className="line2 lines">using Blueprints</div>
                    </div>

                    <div className="tagline">
                        Say goodbye to getting lost in complex indoor spaces. With Map Forge, you can easily navigate through airports, shopping malls, hospitals, and more using detailed blueprints and AI-powered directions.
                    </div>

                    <button className="scan-qr-code flex" type="button" onClick={() => navigate("/qr")}><QrCode /> Scan QR Code</button>

                    <div className="cards">
                        <div className="card">
                            <div className="icons"><Eye className="icon" /></div>
                            <h3>Visual Positioning</h3>
                            <p>
                                Instantly localize users within centimeters
                                using just their camera feed. No beacons
                                or wifi triangulation needed
                            </p>
                        </div>

                        <div className="card">
                            <div className="icons"><Route className="icon" /></div>
                            <h3>Visual Positioning</h3>
                            <p>
                                Instantly localize users within centimeters
                                using just their camera feed. No beacons
                                or wifi triangulation needed
                            </p>
                        </div>

                        <div className="card">
                            <div className="icons"><BrainCircuit className="icon" /></div>
                            <h3>Visual Positioning</h3>
                            <p>
                                Instantly localize users within centimeters
                                using just their camera feed. No beacons
                                or wifi triangulation needed
                            </p>
                        </div>
                    </div>
                </div>

                <AnimatePresence>
                    {showQrCode &&
                        <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }} className="user-qr-code">
                            <div className="qr-modal">

                                <div ref={divRef}></div>
                                <button
                                    className='print-qr-modal'
                                    type="button"
                                    onClick={() => window.print()}
                                >
                                    Print QR
                                </button>
                            </div>
                            <button
                                className="remove-qr-modal"
                                type="button"
                                onClick={() => setShowQrCode(false)}
                            >
                                <X size={40} />
                            </button>
                        </motion.div>
                    }
                </AnimatePresence>
            </main>
        </div>
    )
}

export default Homes