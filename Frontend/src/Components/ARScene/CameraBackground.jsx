import React from 'react'

const CameraBackground = () => {
    const videoRef = React.useRef(null)
    const streamRef = React.useRef(null)

    const handleCameraBackground = async () => {
        try {
            streamRef.current = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" },
                audio: false
            })
            videoRef.current.srcObject = streamRef.current
        } catch (err) {
            console.error("Camera error:", err)
        }
    }

    const stopCamera = () => {
        streamRef.current?.getTracks().forEach(track => track.stop());
    };

    React.useEffect(() => {
        handleCameraBackground()

        return () => {

            stopCamera();
            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }
        };
    }, [])

    return (
        <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
                width: "100%",
                height: "100vh",
                objectFit: "cover",
                opacity: 1
            }}
        />
    )
}

export default CameraBackground