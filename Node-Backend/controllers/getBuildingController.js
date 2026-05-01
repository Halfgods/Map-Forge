const { pool } = require('../config/db.js');

const getBuilding = async (req, res) => {
    const { id } = req.params;

    // Validate ID is a number
    if (!id || isNaN(Number(id))) {
        return res.status(400).json({ error: "Invalid building/user ID provided" });
    }

    try {
        const result = await pool.query(`SELECT * FROM buildings WHERE user_id = $1`, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "No buildings found for this user" });
        }

        return res.json(result.rows);
    } catch (error) {
        console.error("Error in getBuilding:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

module.exports = getBuilding;