const router = require('express').Router();
const { database } = require('../config');
const formatQuery = require('../utils/formatQuery');

// @route   GET branches
// @desc    Index Branches
router.get('/', (req, res) => {
    const text = `
    SELECT *
    FROM Branches
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

// @route   POST branches
// @desc    Create a Branch
router.post('/', (req, res) => {
    const text = `
    INSERT INTO Branches (
      location,
      city
    )
    VALUES ( $1, $2 )
  `;
    const values = [
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

// @route   POST branches/delete-row
// @desc    Delete a Branch
router.post( '/delete-row', (req, res) => {
  const { location, city } = req.body;
  const text = `
    DELETE
    FROM Branches
    WHERE location='${location}' AND city='${city}'
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
