const router = require('express').Router();
const {database} = require('../config');
const formatQuery = require('../utils/formatQuery');

// @route   GET reservations
// @desc    Index Reservations
router.get('/', (req, res) => {
    const text = `
    SELECT *
    FROM Reservations
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
router.post('/', (req, res) => {

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
    VALUES ( $1, $2, $3, $4, $5, $6 )
    RETURNING *
  `;
    const values = [
        req.body.confno,
        req.body.vtname,
        req.body.cellphone,
        req.body.fromdate,
        req.body.fromtime,
        req.body.todate,
        req.body.totime
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

// @route   POST reservations/delete-row
// @desc    Delete a Reservation
router.post('/delete-row', (req, res) => {
    const {confno} = req.body;
    const text = `
    DELETE
    FROM Reservations
    WHERE confNo='${confno}'
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
