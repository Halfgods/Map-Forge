const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadBuilding, getUserBuildings } = require('../controllers/buildingController');
const auth = require('../middleware/auth');

const upload = multer({ dest: 'uploads/' });

const cpUpload = upload.fields([
    { name: 'blueprint', maxCount: 1 },
    { name: 'panorama', maxCount: 1 },
    { name: 'building_images', maxCount: 5 }
]);

router.post('/upload', auth, cpUpload, uploadBuilding);
router.get('/my-buildings', auth, getUserBuildings);

module.exports = router;
