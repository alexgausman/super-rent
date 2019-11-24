const router = require('express').Router();
const { database } = require('../config');
const formatQuery = require('../utils/formatQuery');
const countReqVehicles = require('../utils/countReqVehicles');

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

// @route   POST reservations
// @desc    Create a Reservation
router.post('/make-a-reservation', (req, res) => {

  const text = `
  INSERT INTO Reservations (
    confno,
    vtname,
    cellphone,
    fromdate,
    fromtime,
    todate,
    totime
  )
  VALUES ( $1, $2, $3, $4, $5, $6, $7, $8 )
  RETURNING *
`;
  const values = [
    req.body.confno,
    req.body.vtname,
    req.body.cellphone,
    req.body.fromdate,
    req.body.fromtime,
    req.body.todate,
    req.body.totime,
    req.body.location
  ];
  database
    .query(text, values)
    .then(result => res.status(200).json({
      query: formatQuery(text, values),
      result: result.rows,
    }))
    .catch(error => res.status(400).json({
      query: formatQuery(text),
      error_message: error.message,
    }));
})

module.exports = router;
