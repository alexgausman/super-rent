const router = require('express').Router();
const {database} = require('../config');
const formatQuery = require('../utils/formatQuery');
const countReqVehicles = require('../utils/countReqVehicles');

// @route   POST find-available-vehicles
// @desc    List available vehicles
router.post('/return-vehicle', (req, res) => {
    let {
        rentalID,
        returnOdometer,
        returnDateTime,
        tankFull
    } = req.body;

    const q1 = `
      SELECT *
      FROM Rentals R, Vehicles V, VehicleTypes VT
      WHERE R.rid = ${rentalID} AND R.vid = V.vid AND V.vtname = VT.vtname
    `;
    database
        .query(q1)
        .then(result => {
          const d = result.rows[0];
          console.log(d)
          console.log(typeof d.fromdatetime)
          console.log(d.fromdatetime)
          const start = new Date(d.fromdatetime)
          console.log(start)
          const end = new Date(returnDateTime);
          console.log(end)
          let durationHrs = (end.valueOf() - start.valueOf()) / 3600000;
          console.log(durationHrs)
          const weeks = Math.trunc(durationHrs / 168);
          let remainingHrs = Math.trunc(durationHrs % 168);
          const days = Math.trunc(remainingHrs / 24);
          const hours = Math.trunc(remainingHrs % 24);
          // TODO Something with the tank emptiness
          const getRate = strRate => parseFloat(strRate.substring(1));
          console.log(typeof weeks)
          console.log(getRate(d.wrate) + getRate(d.wirate));
          console.log(weeks)
          let cost = (getRate(d.wrate) + getRate(d.wirate)) * weeks;
          console.log(cost)
          cost += (getRate(d.drate) + getRate(d.dirate)) * days;
          cost += (getRate(d.hrate) + getRate(d.hirate)) * hours;
          const distance = returnOdometer - d.odometer;
          cost += getRate(d.krate) * distance;

          const q2 = `
            INSERT INTO Returns (
              rid,
              dateTime,
              odometer,
              fullTank,
              totalCost
            )
            VALUES
            (
              ${rentalID},
              '${returnDateTime}',
              ${returnOdometer},
              ${tankFull},
              ${cost}
            )
          `;
          database
              .query(q2)
              .then(result => res.status(200).json({
                  query: formatQuery(q1 + ' \n\n ' + q2),
                  success: true,
              }))
              .catch(error => res.status(400).json({
                  query: formatQuery(q1 + ' \n\n ' + q2),
                  error_message: error.message,
              }));
        })
        .catch(error => res.status(400).json({
            query: formatQuery(q1),
            error_message: error.message,
        }));



  //   // TODO get start Date from rental table
  //   const duration = new Date(returnDateTime).valueOf();
  //   const returnValues = [];
  //
  //   // TODO, get Vehicle type using vid -> vtname
  //   const vtype = null;
  //   const weeks = Math.trunc(duration / 168);
  //   let remainingHrs = Math.trunc(duration % 168);
  //   const days = Math.trunc(remainingHrs / 24);
  //   const hours = Math.trunc(remainingHrs % 24);
  //   // TODO Something with the tank emptiness
  //   let cost = (vtype[2] + vtype[5]) * weeks;
  //   cost += (vtype[3] + vtype[6]) * days;
  //   cost += (vtype[4] + vtype[7]) * hours;
  //   let distance = returnOdometer - startOdometer;
  //   cost += vtype[7] * distance;
  //   returnValues.push([
  //       rentalID,
  //       returnDateTime,
  //       returnOdometer,
  //       tankFull,
  //       cost,
  //   ]);
  //
  //   const text = `
  //   INSERT INTO Returns (
  //     rid,
  //     dateTime,
  //     odometer,
  //     fullTank,
  //     totalCost
  //   )
  //   VALUES
  //   ${returnValues.map(arr => `(
  //     ${arr.map(item => item === 'NULL' ? item : `'${item}'`).join(', ')})
  //       `).join(', ')};
  // `;
  //   database
  //       .query(text)
  //       .then(result => res.status(200).json({
  //           query: formatQuery(text),
  //           result: result.rows,
  //       }))
  //       .catch(error => res.status(400).json({
  //           query: formatQuery(text),
  //           error_message: error.message,
  //       }));
});

router.post('/generate-report', (req, res) => {
    let {
        reportType,
        location,
        date
    } = req.body;

    let text;

    switch (reportType) {
        case "daily-rentals": {
            text = `
            SELECT R.location, R.rid, V.vtname, Count (*) AS NumRentals
            FROM Rentals R, Vehicles V
            WHERE R.fromDate='${date}' AND R.vid=V.vid'
            GROUP BY (R.location, V.vtname)
            `;
            break;
        }
        case "daily-rentals-branch": {
            text = `
            SELECT R.location, R.rid, VT.vtname Count (*) AS NumRentals
            FROM Rentals R, Vehicles V
            WHERE R.fromDate='${date}' AND R.location='${location} AND R.vid=V.vid'
            )}
            GROUP BY (V.vtname)
            `;
            break;
        }
        case "daily-returns": {
            text = `
            SELECT R.location, R.rid, V.vtname, Count (*) AS NumRentals
            FROM Returns R, Rentals R1, Vehicles V
            WHERE R.fromDate='${date}' AND R1.vid=V.vid AND R.rid=R1.rid'
            GROUP BY (R.location, V.vtname)
            `;
            break;
        }
        case "daily-returns-branch": {
            text = `
            SELECT R.location, R.rid, VT.vtname Count (*) AS NumRentals
            FROM Returns R, Rentals R1, Vehicles V
            WHERE R.fromDate='${date}' AND R.location='${location} AND R1.vid=V.vid AND R.rid=R1.rid'
            )}
            GROUP BY (V.vtname)
            `;
            break;
        }

    }
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
