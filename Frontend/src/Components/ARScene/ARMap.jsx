import React from 'react'
import { MapPin, MapPinCheckInside, SendHorizontal } from 'lucide-react'
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import CircularProgress from '@mui/material/CircularProgress';


const ARMap = ({ coords, setCoords, loading, setLoading, setData, apiData, imgUrl1 }) => {
    const imgRef = React.useRef(null);
    const [scale, setScale] = React.useState(1);
    const watchID = React.useRef(null);

    const [gpsSpeed, setGpsSpeed] = React.useState(0);
    const [scaleFactor, setScaleFactor] = React.useState(80);
    
    const pointsRef = React.useRef(null);
    const pathState = React.useRef({ idx: 0, x: null, y: null });
    const scaleFactorRef = React.useRef(scaleFactor);
    const [currentPos, setCurrentPos] = React.useState(null);

    React.useEffect(() => {
        scaleFactorRef.current = scaleFactor;
    }, [scaleFactor]);

    React.useEffect(() => {
        if (apiData && apiData.turning_points && apiData.turning_points.length > 0) {
            pointsRef.current = apiData.turning_points;
            pathState.current = {
                idx: 0,
                x: apiData.turning_points[0][0],
                y: apiData.turning_points[0][1]
            };
            setCurrentPos({ x: pathState.current.x, y: pathState.current.y });
        }
    }, [apiData]);

    React.useEffect(() => {
        if ("geolocation" in navigator) {
            watchID.current = navigator.geolocation.watchPosition(
                (position) => {
                    const speed = position.coords.speed;
                    if (speed !== null) {
                        setGpsSpeed(speed);
                    }

                    // Jaisa aapne kaha, pure geolocation data ka use
                    let currentSpeed = (speed !== null && speed>=1.15) ? speed : 0;
                    let distToMove = currentSpeed * scaleFactorRef.current;

                    let points = pointsRef.current;
                    if (points && pathState.current.x !== null) {
                        let { idx, x, y } = pathState.current;

                        if (idx >= points.length - 1) return;

                        let targetX = points[idx + 1][0];
                        let targetY = points[idx + 1][1];

                        let dx = targetX - x;
                        let dy = targetY - y;
                        let dist = Math.sqrt(dx * dx + dy * dy);

                        if (distToMove > 0) {
                            if (dist <= distToMove) {
                                pathState.current.x = targetX;
                                pathState.current.y = targetY;
                                pathState.current.idx = idx + 1;
                            } else {
                                pathState.current.x += (dx / dist) * distToMove;
                                pathState.current.y += (dy / dist) * distToMove;
                            }
                            setCurrentPos({ x: pathState.current.x, y: pathState.current.y });
                        }
                    }
                },
                (error) => console.log("Error getting GPS speed:", error),
                { enableHighAccuracy: false, maximumAge:0, timeout: 60000 }
            );
        }
        return () => {
            if (watchID.current !== null) {
                navigator.geolocation.clearWatch(watchID.current);
            }
        };
    }, []);

    const handleImgClick = (e) => {
        const rect = imgRef.current.getBoundingClientRect();

        const x = (e.clientX - rect.left) / scale;
        const y = (e.clientY - rect.top) / scale;


        setCoords((prev) => {
            if (!prev.src) {
                return { ...prev, src: { x, y } };
            } else if (!prev.dest) {
                return { ...prev, dest: { x, y } };
            } else {
                return { src: { x, y }, dest: null };
            }
        });
    };
    console.log(apiData);



    React.useEffect(() => {
        const rect = imgRef.current.getBoundingClientRect();
        setData((prev) => {
            return {
                ...prev,
                phone_width: Math.floor(rect.width),
                phone_height: Math.floor(rect.height),
                start: [Math.floor(coords?.src?.x), Math.floor(coords?.src?.y)],
                end: [Math.floor(coords?.dest?.x), Math.floor(coords?.dest?.y)]
            }
        })
    }, [coords])


    return (
        <>

            <TransformWrapper
                onTransformed={(state) => {
                    setScale(state.state.scale);
                }}
            >
                <TransformComponent>
                    <div className='mini-map' style={{ position: "relative" }}>
                        <div
                            className="map"
                        >
                            <img
                                src={apiData ? apiData.image_base64 : imgUrl1}
                                ref={imgRef}
                                alt="blueprint"
                                onClick={(e) => {
                                    if (!coords.src || !coords.dest) {
                                        handleImgClick(e);
                                    }
                                }}
                            />

                            {
                                loading &&
                                <div
                                    className="loaderwrapper"
                                    style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}
                                >
                                    <CircularProgress color='white' size={52} />
                                </div>

                            }


                            {currentPos &&
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        position: "absolute",
                                        top: currentPos.y,
                                        left: currentPos.x,
                                        transform: "translate(-50%, -50%)",
                                        width: 50,
                                        height: 50,
                                        // background: "royalblue",
                                        borderRadius: "50%",
                                        transition: "0.2s linear",
                                    }}
                                >
                                    {/* {gpsSpeed} */}
                                    <div className="pulse-box">{gpsSpeed}</div>
                                </div>}


                            {coords?.src && !currentPos && (
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        position: "absolute",
                                        top: coords.src.y,
                                        left: coords.src.x,
                                        transform: "translate(-50%, -50%)",
                                        width: 30,
                                        height: 30,
                                        background: "royalblue",
                                        borderRadius: "50%"
                                    }}
                                ><MapPin /></div>
                            )}

                            {coords?.dest && (
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        position: "absolute",
                                        transform: "translate(-50%, -50%)",
                                        top: coords.dest.y,
                                        left: coords.dest.x,
                                        width: 30,
                                        height: 30,
                                        background: "tomato",
                                        borderRadius: "50%"
                                    }}
                                ><MapPinCheckInside /></div>
                            )}

                        </div>
                    </div>
                </TransformComponent>
            </TransformWrapper >

            {/* <PedometerOverlay
                steps={stepCount}
                distance={gpsData.distance}
                speed={gpsData.speed}
                latitude={gpsData.latitude}
                longitude={gpsData.longitude}
            /> */}
        </>
    )
}

export default ARMap