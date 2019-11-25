const router = require('express').Router();
const {database} = require('../config');
const formatQuery = require('../utils/formatQuery');
const countReqVehicles = require('../utils/countReqVehicles');
const Chance = require('chance');
const formatDate = require('../utils/formatDate');

const chance = new Chance();

router.post('/rent-vehicle', (req, res) => {
    let {
        hasReservation,
        isExistingCustomer,
        confNumber,
        creditCardNumber,
        creditCardType,
        creditCardExp,
        cellNumber,
        customerName,
        customerAddress,
        driversLicense,
        location,
        vehicleType,
        fromDateTime,
        toDateTime,
    } = req.body;
    const q0 = `
      SELECT *
      FROM Reservations R
      ${confNumber ? `WHERE R.confno = ${confNumber}` : ''}
    `;
    database
        .query(q0)
        .then(result => {
            const reservation = result.rows[0];
            const q1 = `
          SELECT *
          FROM Rentals R
        `;
        database
          .query(q1)
          .then(result => {
            const rentals = result.rows;
            const q2 = `
              SELECT *
              FROM Customers C
              WHERE C.cellphone = '${cellNumber}'
            `;
            database
              .query(q2)
              .then(result => {
                const customer = result.rows[0];
                // Business logic
                let queries = [];
                // Validate input
                let input_errors = {};
                if (hasReservation) {
                  if (!confNumber) {
                    input_errors.confNumber = 'Confirmation number is required';
                  } else if (isNaN(parseInt(confNumber))) {
                    input_errors.confNumber = 'Confirmation number is invalid';
                  }
                  if (!reservation) {
                    input_errors.confNumber = 'Reservation not found';
                  }
                  const existingRentalWithConfNo = rentals.find(r => {
                    return r.confno === confNumber;
                  })
                  if (existingRentalWithConfNo) {
                    input_errors.confNumber = 'Reservation already linked to existing rental';
                  }
                } else {
                  if (isExistingCustomer) {
                     if (!customer) {
                      input_errors.cellNumber = 'Customer not found';
                    }
                  } else {
                    if (customer) {
                      input_errors.cellNumber = 'Customer already exists';
                    }
                  }
                }
                if (Object.keys(input_errors).length > 0) {
                  return res.status(400).json({ input_errors: input_errors });
                }
                // Updaes dates
                if (hasReservation) {
                  fromDateTime = formatDate(new Date(reservation.fromdatetime));
                  toDateTime = formatDate(new Date(reservation.todatetime));
                }
                // Check if rentable vehicle exists
                const q3 = `
                  SELECT *
                  FROM Vehicles V
                  WHERE V.location = '${location}' AND V.status = 'for_rent' ${
                    vehicleType === 'any' ? '' : `AND V.vtname = '${vehicleType}'`
                  }
                `;
                database
                  .query(q3)
                  .then(vehicles => {
                    queries.push(q3);
                    if (vehicles.length === 0) {
                      input_errors.vehicleType = `No vehicles of this type available at ${location}`;
                      return res.status(400).json({
                        query: formatQuery(q3),
                        input_errors: input_errors,
                      });
                    }
                    // Randomly choose a vehicle
                    const vIndex = chance.integer({
                      min: 0,
                      max: vehicles.rows.length - 1,
                    })
                    const vehicle = vehicles.rows[vIndex];
                    // Get next available rid
                    const maxRid = rentals.reduce((acc, rental) => {
                      return Math.max(acc, rental.rid);
                    }, 0);
                    const newRid = maxRid + 1;

                    let insertQuery = '';
                    if (!hasReservation && !isExistingCustomer) {
                      insertQuery += `
                        INSERT INTO Customers (
                          cellphone,
                          name,
                          address,
                          dlicense
                        )
                        VALUES (
                          '${cellNumber}',
                          '${customerName}',
                          '${customerAddress}',
                          '${driversLicense}'
                        );
                        \n\n
                      `;
                                    }
                                    insertQuery += `
                      INSERT INTO Rentals (
                        rid,
                        vid,
                        cellphone,
                        confno,
                        fromdatetime,
                        todatetime,
                        odometer,
                        cardname,
                        cardno,
                        expdate,
                        location,
                        city
                      )
                      VALUES (
                        ${newRid},
                        '${vehicle.vid}',
                        '${cellNumber || reservation.cellphone}',
                        ${hasReservation ? confNumber : 'NULL'},
                        '${fromDateTime}',
                        '${toDateTime}',
                        ${vehicle.odometer},
                        NULL, /* TODO */
                        NULL, /* TODO */
                        NULL, /* TODO */
                        '${location}',
                        '${vehicle.city}'
                      )
                      RETURNING *
                    `;
                    queries.push(insertQuery);
                    const queriesString = queries.join(' \n\n ');
                    database
                      .query(insertQuery)
                      .then(result => {
                        if (result.length) {
                          result = result[result.length -1];
                        }
                        console.log(result);
                        result.rows[0].vehicleType = vehicle.vtname;
                        res.status(200).json({
                          query: formatQuery(queriesString),
                          result: result.rows[0],
                        })
                      })
                      .catch(error => res.status(400).json({
                        query: formatQuery(queriesString),
                        error_message: error.message,
                      }));

                  })
                  .catch(error => res.status(400).json({
                    query: formatQuery(q3),
                    error_message: error.message,
                  }))
              })
              .catch(error => res.status(400).json({
                query: formatQuery(q2),
                error_message: error.message,
              }));


          })
          .catch(error => res.status(400).json({
            query: formatQuery(q1),
            error_message: error.message,
          }));
      })
      .catch(error => res.status(400).json({
        query: formatQuery(q0),
        error_message: error.message,
      }));
});

// @route   POST find-available-vehicles
// @desc    List available vehicles
router.post('/return-vehicle', (req, res) => {
    let {
        rentalID,
        returnOdometer,
        returnDateTime,
        tankFull
    } = req.body;

    const q0 = `
      SELECT *
      FROM Returns
    `;
    database
        .query(q0)
        .then(result => {
            const currentReturns = result.rows;
            const input_errors = {};
            if (!rentalID) {
                input_errors.rid = 'Rental ID is required';
            } else if (currentReturns.find(r => r.rid === parseInt(rentalID))) {
                input_errors.rid = `Return with ID ${rentalID} already exists`;
            }
            if (!returnOdometer) {
                input_errors.odometer = 'Odometer value is required';
            } else if (isNaN(parseInt(returnOdometer))) {
                input_errors.odometer = 'Odometer value is invalid';
            }
            if (!returnDateTime) {
                input_errors.dateTime = 'Return time is required';
            } else if (isNaN(new Date(returnDateTime).valueOf())) {
                input_errors.dateTime = 'Return time is invalid';
            }
            if (Object.keys(input_errors).length > 0) {
                return res.status(400).json({
                    input_errors: input_errors,
                });
            }
            const q2 = `
          SELECT *
          FROM Rentals R, Vehicles V, VehicleTypes VT, Customers C
          WHERE R.rid = ${rentalID} AND R.vid = V.vid AND V.vtname = VT.vtname AND C.cellphone = R.cellphone
        `;
            database
                .query(q2)
                .then(result => {
                    const combinedInfo = result.rows[0];
                    let start, end, duration;
                    if (!combinedInfo) {
                        input_errors.rid = 'RID not found';
                    } else {
                        if (!(returnOdometer >= combinedInfo.odometer)) {
                            input_errors.odometer = 'Odometer must be > starting value';
                        }
                        start = new Date(combinedInfo.fromdatetime);
                        end = new Date(returnDateTime);
                        duration = (end.valueOf() - start.valueOf());
                        if (!(duration > 0)) {
                            input_errors.dateTime = 'Return time must be after start time';
                        }
                    }
                    if (Object.keys(input_errors).length > 0) {
                        return res.status(400).json({
                            query: formatQuery(q2),
                            input_errors: input_errors,
                        });
                    }
                    const durationHrs = duration / 3600000;
                    const weeks = Math.trunc(durationHrs / 168);
                    let remainingHrs = Math.trunc(durationHrs % 168);
                    const days = Math.trunc(remainingHrs / 24);
                    const hours = Math.trunc(remainingHrs % 24);
                    // TODO Something with the tank emptiness
                    const getRate = strRate => parseFloat(strRate.substring(1));
                    let carCost = getRate(combinedInfo.wrate) * weeks;
                    carCost += getRate(combinedInfo.drate) * days;
                    carCost += getRate(combinedInfo.hrate) * hours;
                    let insuranceCost = getRate(combinedInfo.wirate) * weeks;
                    insuranceCost += getRate(combinedInfo.dirate) * days;
                    insuranceCost += getRate(combinedInfo.hirate) * hours;
                    const distance = returnOdometer - combinedInfo.odometer;
                    carCost += getRate(combinedInfo.krate) * distance;
                    let totalCost = carCost + insuranceCost;
                    let confNo = combinedInfo.confno;

                    const q3 = `
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
                  ${totalCost}
                )
              `;
                    database
                        .query(q3)
                        .then(result => res.status(200).json({
                            query: formatQuery(q2 + ' \n\n ' + q3),
                            success: true,
                            result: {
                                rid: rentalID,
                                confNo: confNo,
                                vehicleCost: carCost,
                                insuranceCost: insuranceCost,
                                totalCost: totalCost
                            }
                        }))
                        .catch(error => res.status(400).json({
                            query: formatQuery(q2 + ' \n\n ' + q3),
                            error_message: error.message,
                        }));
                })
                .catch(error => res.status(400).json({
                    query: formatQuery(q2),
                    error_message: error.message,
                }));
        })
        .catch(error => res.status(400).json({
            query: formatQuery(q0),
            error_message: error.message,
        }));
});

router.post('/generate-report', (req, res) => {
    let {
        reportType,
        location,
        reportDate
    } = req.body;

    let q1;
    let q2;
    let q3;
    let q4;

    switch (reportType) {
        case "daily-rentals": {
            q1 = `
            SELECT R.location, R.rid, V.vid, V.vtname, V.make, V.model, V.color
            FROM Rentals R, Vehicles V
            WHERE TO_CHAR(R.fromdatetime, 'MM/DD/YYYY')='${reportDate}' AND R.vid=V.vid
            `;
            q2 = `
            SELECT R.location, V.vtname, Count (*) AS NumRentals
            FROM Rentals R, Vehicles V
            WHERE TO_CHAR(R.fromdatetime, 'MM/DD/YYYY')='${reportDate}' AND R.vid=V.vid
            GROUP BY (R.location, V.vtname)
            `;
            q3 = `
            SELECT R.location, Count (*) AS totalRentals
            FROM Rentals R
            WHERE TO_CHAR(R.fromdatetime, 'MM/DD/YYYY')='${reportDate}'
            GROUP BY (R.location)
            `;
            q4 = `
            SELECT Count (*) AS overallRentals
            FROM Rentals R
            WHERE TO_CHAR(R.fromdatetime, 'MM/DD/YYYY')='${reportDate}'
            `;
            break;
        }
        case "daily-rentals-branch": {
            q1 = `
            SELECT R.location, R.rid, V.vid, V.vtname, V.make, V.model, V.color
            FROM Rentals R, Vehicles V
            WHERE TO_CHAR(R.fromdatetime, 'MM/DD/YYYY')='${reportDate}' AND R.location='${location}' AND R.vid=V.vid
            `;
            q2 = `
            SELECT R.location, V.vtname, Count (*) AS NumRentals
            FROM Rentals R, Vehicles V
            WHERE TO_CHAR(R.fromdatetime, 'MM/DD/YYYY')='${reportDate}' AND R.location='${location}' AND R.vid=V.vid
            GROUP BY (R.location, V.vtname)
            `;
            q3 = `
            SELECT R.location, Count (*) AS totalRentals
            FROM Rentals R
            WHERE TO_CHAR(R.fromdatetime, 'MM/DD/YYYY')='${reportDate}' AND R.location='${location}'
            GROUP BY (R.location)
            `;
            q4 = `
            SELECT Count (*) AS overallRentals
            FROM Rentals R
            WHERE TO_CHAR(R.fromdatetime, 'MM/DD/YYYY')='${reportDate}' AND R.location='${location}'
            `;
            break;
        }
        case "daily-returns": {
            q1 = `
            SELECT R1.location, R.rid, V.vid, V.vtname, V.make, V.model, V.color
            FROM Returns R, Rentals R1, Vehicles V
            WHERE TO_CHAR(R.datetime, 'MM/DD/YYYY')='${reportDate}' AND R1.vid=V.vid AND R.rid=R1.rid
            `;
            q2 = `
            SELECT R1.location, V.vtname, Count (*) AS NumRentals, Sum (R.totalcost) AS revenue
            FROM Returns R, Rentals R1, Vehicles V
            WHERE TO_CHAR(R.datetime, 'MM/DD/YYYY')='${reportDate}' AND R1.vid=V.vid AND R.rid=R1.rid
            GROUP BY (R1.location, V.vtname)
            `;
            q3 = `
            SELECT R1.location, Count (*) AS totalReturns, Sum (R.totalcost) AS totalRevenue
            FROM Returns R, Rentals R1
            WHERE TO_CHAR(R.datetime, 'MM/DD/YYYY')='${reportDate}' AND R.rid=R1.rid
            GROUP BY (R1.location)
            `;
            q4 = `
            SELECT Count (*) AS overallReturns, Sum (R.totalcost) AS overallRevenue
            FROM Returns R, Rentals R1
            WHERE TO_CHAR(R.datetime, 'MM/DD/YYYY')='${reportDate}' AND R.rid=R1.rid
            `;
            break;
        }
        case "daily-returns-branch": {
            q1 = `
            SELECT R1.location, R.rid, V.vid, V.vtname, V.make, V.model, V.color
            FROM Returns R, Rentals R1, Vehicles V
            WHERE TO_CHAR(R.datetime, 'MM/DD/YYYY')='${reportDate}' AND R1.location='${location}' AND R1.vid=V.vid AND R.rid=R1.rid
            `;
            q2 = `
            SELECT R1.location, V.vtname, Count (*) AS NumRentals, Sum (R.totalcost) AS revenue
            FROM Returns R, Rentals R1, Vehicles V
            WHERE TO_CHAR(R.datetime, 'MM/DD/YYYY')='${reportDate}' AND R1.location='${location}' AND R1.vid=V.vid AND R.rid=R1.rid
            GROUP BY (R1.location, V.vtname)
            `;
            q3 = `
            SELECT R1.location, Count (*) AS totalReturns, Sum (R.totalcost) AS totalRevenue
            FROM Returns R, Rentals R1, Vehicles V
            WHERE TO_CHAR(R.datetime, 'MM/DD/YYYY')='${reportDate}' AND R1.location='${location}' AND R.rid=R1.rid
            GROUP BY (R1.location)
            `;
            q4 = `
            SELECT Count (*) AS overallReturns, Sum (R.totalcost) AS overallRevenue
            FROM Returns R, Rentals R1, Vehicles V
            WHERE TO_CHAR(R.datetime, 'MM/DD/YYYY')='${reportDate}' AND R1.location='${location}' AND R.rid=R1.rid
            `;
            break;
        }

    }
    database
        .query(q1)
        .then(vehicleInfo => {
            database
                .query(q2)
                .then(locationByType => {
                    database
                        .query(q3)
                        .then(totalAtLocation => {
                            database
                                .query(q4)
                                .then(overallTotal => res.status(200).json({
                                    query: formatQuery(q1 + ' \n\n ' + q2 + ' \n\n ' + q3),
                                    success: true,
                                    result: {
                                        vehicleInfo: vehicleInfo,
                                        locationByType: locationByType,
                                        totalAtLocation: totalAtLocation,
                                        overallTotal: overallTotal,
                                    }
                                }))
                                .catch(error => res.status(400).json({
                                    query: formatQuery(q4),
                                    error_message: error.message,
                                }))

                        })
                        .catch(error => res.status(400).json({
                            query: formatQuery(q3),
                            error_message: error.message,
                        }))
                })
                .catch(error => res.status(400).json({
                    query: formatQuery(q2),
                    error_message: error.message,
                }))
        })
        .catch(error => res.status(400).json({
            query: formatQuery(q1),
            error_message: error.message,
        }));
});

module.exports = router;
