import React from 'react'
import { useLocation, useNavigate } from 'react-router'
import imageNotFound from '../../Assets/imgNotFound.png'
import '../../CSS/AllMap.css';
import { useSelector, useDispatch } from 'react-redux'
import { setData } from '../../Redux/Slice';
const AllMap = () => {
    const navigate = useNavigate();
    const { state } = useLocation();

    React.useEffect(() => {
        if (!state) {
            navigate('/qr');
        };
    }, [])

    if (!state) return null;
    const { orgName, building } = state

    const dispatch = useDispatch();


    return (
        <div className="allmap-container">
            <div className="allmap-header">
                <h1>Floors Overview of {orgName}</h1>
                <p className="subtitle">Explore all floors and their details</p>
            </div>

            {building.length === 0 ? (
                <div className="no-data">
                    <p>No Floors are available</p>
                </div>
            ) : (
                <div className="buildings-grid">
                    {building.map((item) => {
                        return (<div
                            key={item.id}
                            className="building-card"
                        >
                            <div className="card-image-container">
                                <img
                                    src={item.building_images[0]}
                                    alt={`Floor ${item.floor_no}`}
                                    className="card-image"
                                    onError={(e) => e.target.src = imageNotFound}
                                />
                                <div className="floor-badge">
                                    Floor {item.floor_no}
                                </div>
                            </div>

                            <div className="card-content">
                                <button
                                    onClick={() => {
                                        dispatch(setData({
                                            organization: orgName,
                                            blueprint: item.blueprint_url,
                                            panorama: item.panorama_url,
                                            buildings: item.building_images
                                        }))
                                        navigate('/map')
                                    }}
                                    className="view-btn"
                                >
                                    View Details →
                                </button>
                            </div>
                        </div>)
                    })}
                </div>
            )}
        </div>
    )
}

export default AllMap