import React from 'react'
import compass from '../../Assets/compass.png';

const NavigationCompass = () => {
    const [alpha, setAlpha] = React.useState(null);
    React.useEffect(() => {
        const handleDirection = (e) => {
            if (e.alpha !== null) {
                setAlpha(e.alpha)
            }
        }

        window.addEventListener("deviceorientation", handleDirection)
        return () => { window.removeEventListener("deviceorientation", handleDirection) }
    }, [])
    return (
        <div
            className="compass"
            style={{
                transform: `rotate(${alpha !== null ? 360 - alpha : 0}deg)`,
                transition: "transform 0.3s linear"
            }}
        >
            <img src={compass} alt="compass" width="120" />
        </div>
    )
}

export default NavigationCompass