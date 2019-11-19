const router = require('express').Router();
const {database} = require('../config');
const formatQuery = require('../utils/formatQuery');

// @route   GET vehicletypes
// @desc    Index VehicleTypes
router.get('/', (req, res) => {
    const text = `
    SELECT *
    FROM VehicleTypes
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

// @route   POST vehicletypes
// @desc    Create a VehicleType
router.post('/', (req, res) => {
    const text = `
    INSERT INTO VehicleTypes (
      vtname,
      features,
      wrate,
      drate,
      hrate,
      wirate,
      dirate,
      hirate,
      krate
    )
    VALUES ( $1, $2, $3, $4, $5, $6, $7, $8, $9 )
    RETURNING *
  `;
    const values = [
        req.body.vtname,
        req.body.features,
        req.body.wrate,
        req.body.drate,
        req.body.hrate,
        req.body.wirate,
        req.body.dirate,
        req.body.hirate,
        req.body.krate
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

// @route   POST vehicletypes/delete-row
// @desc    Delete a VehicleType
router.post('/delete-row', (req, res) => {
    const {vtname} = req.body;
    const text = `
    DELETE
    FROM VehicleTypes
    WHERE vtname='${vtname}'
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
