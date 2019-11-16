const router = require('express').Router();
const { database } = require('../config');
const formatQuery = require('../utils/formatQuery');

// @route   POST find-available-vehicles
// @desc    List available vehicles
router.post('/find-available-vehicles', (req, res) => {
  let {
    locations,
    vehicleTypes,
    fromDateTime,
    toDateTime,
  } = req.body;
  const text = `
    -- TODO
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

// Desc: Returns number of required vehicles to fulfill reservations
//       where all reservations are for a single vehicle type.
const countReqVehicles = reserves => {
  const multipleVReserves = [];
  while (reserves.length > 0) {
    const singleVReserves = [reserves.shift()];
    while (true) {
      let prevRes = singleVReserves[singleVReserves.length -1];
      let nextResIndex;
      for(let i = 0; i < reserves.length; i++) {
        const reserve = reserves[i];
        if (new Date(reserve.fromDateTime) >= new Date(prevRes.toDateTime)) {
          nextResIndex = i;
          break;
        }
      }
      if (nextResIndex) {
        const nextRes = reserves.splice(nextResIndex, 1)
        singleVReserves.push(nextRes[0]);
      } else {
        break;
      }
    }
    multipleVReserves.push(singleVReserves);
  }
  return multipleVReserves.length;
}

module.exports = router;
