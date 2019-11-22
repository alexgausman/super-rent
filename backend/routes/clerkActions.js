const router = require('express').Router();
const { database } = require('../config');
const formatQuery = require('../utils/formatQuery');
const countReqVehicles = require('../utils/countReqVehicles');

// @route   POST find-available-vehicles
// @desc    List available vehicles
router.post('/return-vehicle', (req, res) => {
    let {
        rentalID,
        returnOdometer,
        returnDateTime
    } = req.body;
    const text = `
    SELECT R.rid, R.fromdatetime, R.odometer, R.vid, VT.wrate, VT.drate, VT.hrate, VT.wirate, VT.dirate, VT.hirate, VT.krate
    FROM Rentals R, Vehicles V, VehicleTypes VT
    WHERE R.rid ='${rentalID}' AND R.vid = V.vid AND V.vtname = VT.vtname
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