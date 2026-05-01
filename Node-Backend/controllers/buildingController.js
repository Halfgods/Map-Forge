const cloudinary = require('../config/cloudinary');
const { pool } = require('../config/db');
const fs = require('fs');

exports.uploadBuilding = async (req, res) => {
    const uploadedFiles = []; // To track files for cleanup
    
    try {
        const { floor_no } = req.body;
        const files = req.files;

        if (!files || !files.blueprint || !files.panorama) {
            return res.status(400).json({ message: 'Blueprint and Panorama are required' });
        }

        // Helper to track files to delete
        const trackFiles = (f) => {
            if (Array.isArray(f)) f.forEach(file => uploadedFiles.push(file.path));
            else uploadedFiles.push(f.path);
        };

        trackFiles(files.blueprint[0]);
        trackFiles(files.panorama[0]);
        if (files.building_images) trackFiles(files.building_images);

        console.log('--- Starting Cloudinary Uploads ---');

        // Upload Blueprint
        console.log('Uploading Blueprint...');
        const blueprintResult = await cloudinary.uploader.upload(files.blueprint[0].path, { 
            folder: 'arnavic/blueprints',
            timeout: 60000 
        });
        
        // Upload Panorama
        console.log('Uploading Panorama...');
        const panoramaResult = await cloudinary.uploader.upload(files.panorama[0].path, { 
            folder: 'arnavic/panoramas',
            timeout: 60000 
        });

        // Upload Building Images
        const buildingImageUrls = [];
        if (files.building_images) {
            console.log(`Uploading ${files.building_images.length} building images...`);
            for (const file of files.building_images) {
                const result = await cloudinary.uploader.upload(file.path, { 
                    folder: 'arnavic/buildings',
                    timeout: 60000 
                });
                buildingImageUrls.push(result.secure_url);
            }
        }

        console.log('--- Cloudinary Uploads Done. Saving to DB ---');

        const newBuilding = await pool.query(
            'INSERT INTO buildings (user_id, floor_no, blueprint_url, panorama_url, building_images) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [req.user.id, floor_no, blueprintResult.secure_url, panoramaResult.secure_url, buildingImageUrls]
        );

        console.log('Success! Building ID:', newBuilding.rows[0].id);

        // Cleanup temporary files
        uploadedFiles.forEach(path => fs.unlinkSync(path));

        res.status(201).json(newBuilding.rows[0]);
    } catch (err) {
        console.error('UPLOAD ERROR:', err);
        // Cleanup on error too
        uploadedFiles.forEach(path => {
            if (fs.existsSync(path)) fs.unlinkSync(path);
        });
        res.status(500).json({ error: err.message });
    }
};

exports.getUserBuildings = async (req, res) => {
    try {
        const buildings = await pool.query('SELECT * FROM buildings WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
        res.json(buildings.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
