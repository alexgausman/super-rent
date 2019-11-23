const router = require('express').Router();
const {database} = require('../config');
const formatQuery = require('../utils/formatQuery');

// @route   GET returns
// @desc    Index Returns
router.get('/', (req, res) => {
    const text = `
    SELECT *
    FROM Returns
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

// @route   POST returns
// @desc    Create a Return
router.post('/', (req, res) => {
    const text = `
    INSERT INTO Returns (
      rid,
      datetime,
      odometer,
      fulltank,
      totalcost
    )
    VALUES ( $1, $2, $3, $4, $5, $6 )
    RETURNING *
  `;
    const values = [
        req.body.rid,
        req.body.datetime,
        req.body.odometer,
        req.body.fulltank,
        req.body.totalcost,
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

// @route   POST returns/delete-row
// @desc    Delete a Return
router.post('/delete-row', (req, res) => {
    const {rid} = req.body;
    const text = `
    DELETE
    FROM Returns
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
