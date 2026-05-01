import React, { useEffect, useRef } from "react";
import { X } from 'lucide-react'
import "pannellum/build/pannellum.css";
import "pannellum/build/pannellum.js";
import { useSelector } from "react-redux";
const Pannellum = ({ setIsARScence }) => {
    const organization = useSelector((state) => state.orgdata.organization)
    const panorama = useSelector((state) => state.orgdata.panorama)
    const viewerRef = useRef(null);

    useEffect(() => {
        pannellum.viewer(viewerRef.current, {
            type: "equirectangular",
            panorama: panorama,
            autoLoad: true,
            showZoomCtrl: true,
            "haov": 360,
            "vaov": 80,
            "vOffset": 2,
            orientationOnByDefault: true,
            title: organization,
            author: "Team Vibeyz"
        });
    }, []);

    return (
        <>
            <button type="button" className="view-360-btn" onClick={() => { setIsARScence(true) }}><X /></button>
            <div
                ref={viewerRef}
                style={{ width: "100%", height: "100vh" }}
            />
        </>

    );
};

export default Pannellum