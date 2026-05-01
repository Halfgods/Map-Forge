const express = require('express');
const router = express.Router();
const getBuilding = require('../controllers/getBuildingController');

router.get('/building/:id', getBuilding);

module.exports = router;