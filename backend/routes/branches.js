const router = require('express').Router();
const { database } = require('../config');
const formatQuery = require('../utils/formatQuery');

// @route   GET branches
// @desc    Index Branches
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

// @route   POST branches
// @desc    Create a Branch
router.post('/', (req, res) => {
  const text = `
    -- TODO
  `;
  const values = [
    // TODO
  ];
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

// @route   POST branches/delete-row
// @desc    Delete a Branch
router.post( '/delete-row', (req, res) => {
  const { location, city } = req.body;
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
