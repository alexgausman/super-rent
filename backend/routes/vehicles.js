const router = require('express').Router();
const { database } = require('../config');
const formatQuery = require('../utils/formatQuery');

// @route   GET vehicles
// @desc    Index Vehicles
router.get('/', (req, res) => {
  const text = `
    SELECT *
    FROM Vehicles
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

// @route   POST vehicles
// @desc    Create a Vehicle
router.post('/', (req, res) => {
  const text = `
    INSERT INTO Vehicles (
      vid,
      vlicense,
      make,
      model,
      color,
      odometer,
      status,
      vtname,
      location,
      city
    )
    VALUES ( $1, $2, $3, $4, $5, $6, $7, $8, $9, $10 )
  `;
  const values = [
    req.body.vid,
    req.body.vlicense,
    req.body.make,
    req.body.model,
    req.body.color,
    req.body.odometer,
    req.body.status,
    req.body.vtname,
    req.body.location,
    req.body.city,
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
      error_detail: error.detail,
    }));
})

// @route   POST vehicles/delete-row
// @desc    Delete a Vehicle
router.post( '/delete-row', (req, res) => {
  const { vid } = req.body;
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

module.exports = router;
