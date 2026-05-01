import React from 'react'
import CircularProgress from '@mui/material/CircularProgress';
import { Maximize2, Minimize2 } from 'lucide-react'
import view360 from '../../Assets/360.png'
import toast from 'react-hot-toast';

const NavigationController = ({ setIsARScence, coords, loading, setLoading, data, setApiData }) => {
    const [isFullScreen, setIsFullScreen] = React.useState(false);

    const handleFullScreen = () => {
        const root = document.getElementById("root")
        root.requestFullscreen();
        setIsFullScreen(true)
    }

    const handleExitFullScreen = () => {
        document.exitFullscreen()
        setIsFullScreen(false)
    }

    React.useEffect(() => {
        document.addEventListener("fullscreenchange", (e) => {
            if (document.fullscreenElement) {
                setIsFullScreen(true);
            }
            else {
                setIsFullScreen(false)
            }
        })
    }, [])

    async function callapi() {
        setLoading(true)
        try {
            const res = await fetch("https://astar-b74m.onrender.com/navigate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            if (!res.ok) return;
            const newApiData = await res.json();
            setApiData(newApiData);
        } catch (e) {
            toast.error(e.message)
        } finally {
            setLoading(false)
        }

    }
    return (
        <div className="navigation-controller">
            <button
                type="button"
                className="fullscreen-toggle-btn"
                onClick={() => isFullScreen ? handleExitFullScreen() : handleFullScreen()}
            >
                {isFullScreen ? <Minimize2 /> : <Maximize2 />}
            </button>
            {
                (coords.src || coords.dest) &&
                <button type="button" className="ok-btn" onClick={callapi} disabled={loading}>
                    {loading ? <CircularProgress color='white' size={22} /> : "Ok"}
                </button>
            }
            {(coords.src || coords.dest) &&
                <button type="button" className="reset-btn" disabled={loading} onClick={() => { location.reload() }}>
                    Reset
                </button>
            }
            <button
                type="button"
                className="view-pannellum-btn"
                onClick={() => { setIsARScence(false) }}
                disabled={loading}
            >
                <img src={view360} height={20} />
            </button>
        </div>
    )
}

export default NavigationController