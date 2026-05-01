import React from 'react'

import { useSelector } from 'react-redux'
const ImgCarousel = () => {
    const buildings = useSelector((state) => state.orgdata.buildings);
    return (
        <div className="imgcarousel">
            {
                buildings.map((item, idx) => (
                    <div className="imgcard" key={idx}>
                        <img src={item} />
                    </div>
                ))
            }

        </div>
    )
}

export default ImgCarousel