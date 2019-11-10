const router = require('express').Router();
const { database } = require('../config');
const formatQuery = require('../utils/formatQuery');

// @route   GET reservations
// @desc    Index Reservations
router.get('/', (req, res) => {
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
      error: error,
    }));
});

// @route   POST reservations
// @desc    Create Reservation
router.post('/', (req, res) => {
  const text = `
    -- TODO
  `;
  const values = [
    // TODO
  ]
  database
    .query(text, values)
    .then(result => res.status(200).json({
      query: formatQuery(text, values),
      result: result.rows,
    }))
    .catch(error => res.status(400).json({
      query: formatQuery(text, values),
      error: error,
    }));
})

// @route   DELETE reservations/:confNo
// @desc    Delete Reservation
router.delete( '/:confNo', (req, res) => {
  const { confNo } = req.params;
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
      error: error,
    }));
});

module.exports = router;
