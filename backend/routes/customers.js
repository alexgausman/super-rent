const router = require('express').Router();
const { database } = require('../config');
const formatQuery = require('../utils/formatQuery');

// @route   GET customers
// @desc    Index Customers
router.get('/', (req, res) => {
  const text = `
    SELECT *
    FROM Customers
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

// @route   POST customers
// @desc    Create a Customer
router.post('/', (req, res) => {
  const text = `
    INSERT INTO Customers (
      cellphone,
      name,
      address,
      dlicense
    )
    VALUES ( $1, $2, $3, $4 )
  `;
  const values = [
    req.body.cellphone,
    req.body.name,
    req.body.address,
    req.body.dlicense
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

// @route   POST customers/delete-row
// @desc    Delete a Customer
router.post( '/delete-row', (req, res) => {
  const { cellphone } = req.body;
  const text = `
    DELETE
    FROM Customers
    WHERE cellphone='${cellphone}'
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
