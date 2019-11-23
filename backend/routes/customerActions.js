const router = require('express').Router();
const {database} = require('../config');
const formatQuery = require('../utils/formatQuery');
const countReqVehicles = require('../utils/countReqVehicles');

// @route   POST find-available-vehicles
// @desc    List available vehicles
router.post('/find-available-vehicles', (req, res) => {
    let {
        location,
        vehicleType,
        fromDateTime,
        toDateTime,
    } = req.body;
    const hasLocation = (location && location !== 'any');
    const text = `
    SELECT V.location, V.vtname, Count (*) AS NumVehicles
    FROM Vehicles V
    WHERE V.status='for_rent' ${(
        hasLocation ? `AND V.location='${location}'` : ''
    )}
    GROUP BY (V.location, V.vtname)
  `;
    database
        .query(text)
        .then(result => res.status(200).json({
            query: formatQuery(text),
            result: result.rows,
        }))
        .catch(error => res.status(400).json({
            query: formatQuery(text),
            error_message: error.message,
        }));
});


module.exports = router;
