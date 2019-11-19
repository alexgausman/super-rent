const router = require('express').Router();
const { database } = require('../config');
const formatQuery = require('../utils/formatQuery');
const countReqVehicles = require('../utils/countReqVehicles');

// @route   POST find-available-vehicles
// @desc    List available vehicles
router.post('/find-available-vehicles', (req, res) => {
  let {
    location,
    vehicleType,
    fromDateTime,
    toDateTime,
  } = req.body;
  const hasLocation = (location !== 'any')
  const vQuery = `
    SELECT DISTINCT V.vtname${hasLocation ? '' : ', V.location'}
    FROM Vehicles V
    WHERE V.status='for_rent' ${(
      hasLocation ? `AND V.location='${location}'` : ''
    )}
  `;
  database
    .query(vQuery)
    .then(result => {

      if (!fromDateTime && !toDateTime) {
        return res.status(200).json({
          query: formatQuery(text),
          result: result.rows,
        })
      }
      if (!fromDateTime) {
        // TODO (Alex): set fromDateTime to 24 hours before toDateTime
      }
      if (!toDateTime) {
        // TODO (Alex): set toDateTime to 24 hours after fromDateTime
      }
      const hasVt = (vehicleType !== 'any');
      const rQuery = `
        WITH
          /* Rentals not returned (rid only) */
          R0 AS (
            (
              SELECT rid
              FROM Rentals
            )
            EXCEPT
            (
              SELECT rid
              FROM Returns
            )
          ),
          /* Relavent rentals (based on R0) */
          R1 AS (
            SELECT *
            FROM Rentals R, R0
            WHERE R.rid = R0.rid
                  R.toDateTime > ${fromDateTime}
                  ${( hasLocation ? `AND R.location='${location}'` : '')}
          ),
          /* Rentals w/ vehicle type (based on R1)*/
          R2 AS (
            SELECT R1.confNo, R1.fromDateTime, R1.toDateTime, R1.location,
                   V.vtName
            FROM R1, Vehicles V
            WHERE R1.vid = V.vid
          ),
          /* Reservations w/o rentals (confNo only) */
          R3 AS (
            (
              SELECT confNo
              FROM Reservations
            )
            EXCEPT
            (
              SELECT DISTINCT confNo
              FROM Rentals
            )
          ),
          /* Relavent reservations (based on R3) */
          R4 AS (
            ( SELECT *
              FROM Reservations R, R3
              WHERE R.confNO = R3.confNo AND
                    R.toDateTime > ${fromDateTime} AND
                    R.fromDateTime < ${toDateTime}
                    ${( hasLocation ? `AND R.location='${location}'` : '')}
                    ${( hasVt ? `AND R.vtname='${vehicleType}'` : '')}
            )
            UNION
            ( SELECT *
              FROM Reservations R, R3
              WHERE R.confNo = R3.confNo
                    R.fromDateTime < ${toDateTime} AND
                    R.toDateTime > ${fromDateTime}
                    ${( hasLocation ? `AND R.location='${location}'` : '')}
                    ${( hasVt ? `AND R.vtname='${vehicleType}'` : '')}
            )
          )

          /* TODO (Alex): relavent rentals UNION relavent reservations */
      `;

      // TODO (Alex): Group reserves/rents by branch, vehicletype

      // TODO (Alex): check required vehicles for each type and branch

    })
    .catch(error => res.status(400).json({
      query: formatQuery(branchesQ),
      error_message: error.message,
    }));
});



module.exports = router;
