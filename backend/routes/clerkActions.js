const router = require('express').Router();
const {database} = require('../config');
const formatQuery = require('../utils/formatQuery');
const countReqVehicles = require('../utils/countReqVehicles');

// @route   POST find-available-vehicles
// @desc    List available vehicles
router.post('/return-vehicle', (req, res) => {
    let {
        rentalID,
        returnOdometer,
        returnDateTime,
        tankFull
    } = req.body;

    // TODO get start Date from rental table
    const duration = new Date(returnDateTime).valueOf();
    const returnValues = [];

    // TODO, get Vehicle type using vid -> vtname
    const vtype = null;
    const weeks = Math.trunc(duration / 168);
    let remainingHrs = Math.trunc(duration % 168);
    const days = Math.trunc(remainingHrs / 24);
    const hours = Math.trunc(remainingHrs % 24);
    // TODO Something with the tank emptiness
    let cost = (vtype[2] + vtype[5]) * weeks;
    cost += (vtype[3] + vtype[6]) * days;
    cost += (vtype[4] + vtype[7]) * hours;
    let distance = returnOdometer - startOdometer;
    cost += vtype[7] * distance;
    returnValues.push([
        rentalID,
        returnDateTime,
        returnOdometer,
        tankFull,
        cost,
    ]);

    const text = `    
    INSERT INTO Returns (
      rid,
      dateTime,
      odometer,
      fullTank,
      totalCost
    )
    VALUES
    ${returnValues.map(arr => `(
      ${arr.map(item => item === 'NULL' ? item : `'${item}'`).join(', ')})
        `).join(', ')};
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

router.post('/generate-report', (req, res) => {
    let {
        location,
        date
    } = req.body;
    const hasLocation = (location && location !== 'all');
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