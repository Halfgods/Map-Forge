import React from 'react'
import Switch from '@mui/material/Switch';
import { useNavigate } from 'react-router'
import { ArrowBigLeft, EllipsisVertical } from 'lucide-react'
const BackNavigation = ({ setCarouselToggle, setOnTheGoToggle, carouselToggle, onTheGoToggle }) => {
    const navigate = useNavigate()
    return (
        <div className="navigation-cont">
            <button type="button" className='ar-back-btn' onClick={() => {
                console.log("hii");
                navigate("/all-map")
            }}>
                <ArrowBigLeft />
            </button>
            <details className='ar-menu-cont'>
                <summary>
                    <EllipsisVertical />
                </summary>
                <div>
                    <button type="button">Carousel <Switch checked={carouselToggle} onChange={() => setCarouselToggle((prev) => !prev)} /></button>
                    <button type="button">On The Go <Switch checked={onTheGoToggle} onChange={() => setOnTheGoToggle((prev) => !prev)} /></button>
                </div>
            </details>
        </div>

    )
}

export default BackNavigation