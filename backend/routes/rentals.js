const router = require('express').Router();
const { database } = require('../config');
const formatQuery = require('../utils/formatQuery');

// @route   GET rentals
// @desc    Index Rentals
router.get('/', (req, res) => {
  const text = `
    SELECT *
    FROM Rentals
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

// @route   POST rentals
// @desc    Create a Rental
router.post('/', (req, res) => {
  const text = `
    INSERT INTO Rentals (
      rid,
      vid,
      cellphone,
      confno,
      fromdatetime,
      todatetime,
      odometer,
      cardno,
      expdate,
      location,
      city
    )
    VALUES ( $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *
  `;
  const values = [
      req.body.rid,
      req.body.vid,
      req.body.cellphone,
      req.body.confno,
      req.body.fromdatetime,
      req.body.todatetime,
      req.body.odometer,
      req.body.cardno,
      req.body.expdate,
      req.body.location,
      req.body.city
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

// @route   POST rentals/delete-row
// @desc    Delete a Rental
router.post( '/delete-row', (req, res) => {
  const { rid } = req.body;
  const text = `
    DELETE
    FROM Rentals
    WHERE rid='${rid}'
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
