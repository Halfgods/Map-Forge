import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Upload as UploadIcon, Image as ImageIcon, Map as MapIcon, Box, X, Plus, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import API_BASE_URL from '../../utils/api';
import '../../CSS/Home.css';
import '../../CSS/Upload.css';

const Upload = () => {
    const navigate = useNavigate();


    useEffect(() => {
        if (!localStorage.getItem('token')) {
            navigate('/login');
        }
    }, []);

    if (!localStorage.getItem('token')) {
        return null;
    }

    const [loading, setLoading] = useState(false);
    const [floorNo, setFloorNo] = useState('');
    const [blueprint, setBlueprint] = useState(null);
    const [buildingImages, setBuildingImages] = useState([]);
    const [panorama, setPanorama] = useState(null);

    const handleFileChange = (e, setter, multiple = false) => {
        const files = Array.from(e.target.files);
        if (multiple) {
            if (buildingImages.length + files.length > 5) {
                alert("You can only upload up to 5 building images.");
                return;
            }
            const newImages = files.map(file => ({
                file,
                preview: URL.createObjectURL(file)
            }));
            setter(prev => [...prev, ...newImages]);
        } else {
            const file = files[0];
            if (file) {
                setter({
                    file,
                    preview: URL.createObjectURL(file)
                });
            }
        }
    };

    const removeImage = (index, setter, isArray = true) => {
        if (isArray) {
            setter(prev => prev.filter((_, i) => i !== index));
        } else {
            setter(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!blueprint || !panorama) {
            return toast.error("Blueprint and Panorama are required");
        }

        const token = localStorage.getItem('token');
        if (!token) {
            toast.error("Please login first");
            return navigate('/login');
        }

        const formData = new FormData();
        formData.append('floor_no', floorNo);
        formData.append('blueprint', blueprint.file);
        formData.append('panorama', panorama.file);

        buildingImages.forEach((img) => {
            formData.append('building_images', img.file);
        });

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/buildings/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                    // Note: 'Content-Type' header should NOT be set manually for FormData
                },
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                toast.success("Building details uploaded successfully!");
                navigate('/');
            } else {
                toast.error(data.message || "Upload failed");
            }
        } catch (err) {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="upload-page">
            <nav className="upload-nav">
                <div className="nav-content">
                    <div className="logo" onClick={() => navigate('/')}>
                        <span className="material-symbols-outlined text-primary">layers</span>
                        <span className="logo-text">ARNavic</span>
                    </div>
                    <button className="back-btn" onClick={() => navigate(-1)}>Cancel</button>
                </div>
            </nav>

            <main className="upload-main">
                <div className="upload-card">
                    <div className="upload-header">
                        <h1>Project Setup</h1>
                        <p>Upload building details and images to initialize AR navigation</p>
                    </div>

                    <form className="upload-form" onSubmit={handleSubmit}>
                        {/* Floor Number */}
                        <div className="form-section">
                            <label className="section-label">
                                <Box size={20} />
                                <span>Floor Details</span>
                            </label>
                            <div className="input-group">
                                <input
                                    type="number"
                                    placeholder="Enter Floor Number (e.g., 1, 2, 3)"
                                    value={floorNo}
                                    onChange={(e) => setFloorNo(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* Building Blueprint */}
                        <div className="form-section">
                            <label className="section-label">
                                <MapIcon size={20} />
                                <span>Building Blueprint (Map)</span>
                            </label>
                            <div className={`drop-zone ${blueprint ? 'has-file' : ''}`}>
                                {blueprint ? (
                                    <div className="preview-container">
                                        <img src={blueprint.preview} alt="Blueprint" />
                                        <button type="button" className="remove-btn" onClick={() => removeImage(0, setBlueprint, false)}>
                                            <X size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="upload-placeholder">
                                        <UploadIcon size={32} />
                                        <span>Click to upload Blueprint</span>
                                        <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, setBlueprint)} hidden />
                                    </label>
                                )}
                            </div>
                        </div>

                        {/* Building Images */}
                        <div className="form-section">
                            <label className="section-label">
                                <ImageIcon size={20} />
                                <span>Building Images (Max 5)</span>
                            </label>
                            <div className="image-grid">
                                {buildingImages.map((img, index) => (
                                    <div key={index} className="grid-item">
                                        <img src={img.preview} alt={`Building ${index}`} />
                                        <button type="button" className="remove-btn" onClick={() => removeImage(index, setBuildingImages)}>
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                                {buildingImages.length < 5 && (
                                    <label className="add-more">
                                        <Plus size={24} />
                                        <input type="file" accept="image/*" multiple onChange={(e) => handleFileChange(e, setBuildingImages, true)} hidden />
                                    </label>
                                )}
                            </div>
                        </div>

                        {/* Panorama Image */}
                        <div className="form-section">
                            <label className="section-label">
                                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>360</span>
                                <span>Panorama Image (360° View)</span>
                            </label>
                            <div className={`drop-zone ${panorama ? 'has-file' : ''}`}>
                                {panorama ? (
                                    <div className="preview-container panorama">
                                        <img src={panorama.preview} alt="Panorama" />
                                        <button type="button" className="remove-btn" onClick={() => removeImage(0, setPanorama, false)}>
                                            <X size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="upload-placeholder">
                                        <UploadIcon size={32} />
                                        <span>Click to upload 360° Image</span>
                                        <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, setPanorama)} hidden />
                                    </label>
                                )}
                            </div>
                        </div>

                        <button type="submit" className="submit-btn" disabled={loading}>
                            <span>{loading ? 'Uploading & Processing...' : 'Process & Start Navigation'}</span>
                            {!loading && <ChevronRight size={20} />}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default Upload;
