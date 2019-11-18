const router = require('express').Router();
const { database } = require('../config');
const formatQuery = require('../utils/formatQuery');
const faker = require('faker');
const Chance = require('chance');
const getListOfVehicles = require('../utils/getListOfVehicles');
const countReqVehicles = require('../utils/countReqVehicles');
const formatDate = require('../utils/formatDate');
const genExpDate = require('../utils/genExpDate');

const chance = new Chance();

// @route   GET db-tables-list
// @desc    Get a list of current tables in db
router.get('/db-tables-list', (req, res) => {
  database
    .query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema='public'
    `)
    .then(result => res.status(200).json(result.rows))
    .catch(error => res.status(400).json(error));
});

// @route   GET db-table-columns/:tname
// @desc    Get a column list of a specific table
router.get('/db-table-columns/:tname', (req, res) => {
  database
    .query(`
      SELECT *
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME='${req.params.tname}'
    `)
    .then(result => res.status(200).json(result.rows))
    .catch(error => res.status(400).json(error));
});

// @route GET db-table-row-count/:tname
// @desc Get a row count of a specific table
router.get('/db-table-row-count/:tname', (req, res) => {
  database
    .query(`
      SELECT COUNT (*)
      FROM ${req.params.tname}
    `)
    .then(result => res.status(200).json(result))
    .catch(error => res.status(400).json(error));
});

// @route   POST clear-db
// @desc    Clear all tables and data from db
router.post('/clear-db', (req, res) => {
  database
    .query(`
      DO $$ DECLARE
        r RECORD;
      BEGIN
        FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = current_schema()) LOOP
          EXECUTE 'DROP TABLE ' || quote_ident(r.tablename) || ' CASCADE';
        END LOOP;
      END $$;
    `)
    .then(result => res.status(200).json({
      action: 'clear-db',
      success: true,
    }))
    .catch(error => res.status(400).json({
      action: 'clear-db',
      success: false,
      error_message: error.message,
      error_detail: error.detail,
    }));
});

// @route   POST init-db
// @desc    Init db with CREATE TABLE statements
router.post('/init-db', (req, res) => {
  const text = `
    CREATE TABLE Branches (
      location VARCHAR (20),
      city VARCHAR (20),
      PRIMARY KEY (location, city)
    );

    CREATE TABLE Customers (
      cellphone VARCHAR (12),
      name VARCHAR (40),
      address VARCHAR (40),
      dlicense VARCHAR (7),
      PRIMARY KEY (cellphone)
    );

    CREATE TABLE VehicleTypes (
      vtname VARCHAR (10),
      features TEXT,
      wrate MONEY,
      drate MONEY,
      hrate MONEY,
      wirate MONEY,
      dirate MONEY,
      hirate MONEY,
      krate MONEY,
      PRIMARY KEY (vtname)
    );

    CREATE TABLE Vehicles (
      vid SMALLSERIAL,
      vlicense VARCHAR (7),
      make VARCHAR (16),
      model VARCHAR (16),
      color VARCHAR (16),
      odometer INTEGER,
      status VARCHAR (8),
      vtname VARCHAR (10),
      location VARCHAR (20),
      city VARCHAR (20),
      PRIMARY KEY (vid),
      FOREIGN KEY (vtname) REFERENCES VehicleTypes (vtname),
      FOREIGN KEY (location, city) REFERENCES Branches (location, city)
    );

    CREATE TABLE Reservations (
      confNo INTEGER,
      vtname VARCHAR (10),
      cellphone VARCHAR (12),
      fromDateTime TIMESTAMP,
      toDateTime TIMESTAMP,
      location VARCHAR (20),
      city VARCHAR (20),
      PRIMARY KEY (confNo),
      FOREIGN KEY (vtname) REFERENCES VehicleTypes (vtname),
      FOREIGN KEY (cellphone) REFERENCES Customers (cellphone),
      FOREIGN KEY (location, city) REFERENCES Branches (location, city)
    );

    CREATE TABLE Rentals (
      rid SMALLSERIAL,
      vid SMALLSERIAL,
      cellphone VARCHAR (12),
      confNo INTEGER,
      fromDateTime TIMESTAMP,
      toDateTime TIMESTAMP,
      odometer INTEGER,
      cardName VARCHAR (12),
      cardNo VARCHAR (16),
      expDate VARCHAR (4),
      location VARCHAR (20),
      city VARCHAR (20),
      PRIMARY KEY (rid),
      FOREIGN KEY (vid) REFERENCES Vehicles (vid),
      FOREIGN KEY (cellphone) REFERENCES Customers (cellphone),
      FOREIGN KEY (location, city) REFERENCES Branches (location, city)
    );

    CREATE TABLE Returns (
      rid SMALLSERIAL,
      dateTime TIMESTAMP,
      odometer INTEGER,
      fullTank BOOLEAN,
      totalCost MONEY,
      PRIMARY KEY (rid),
      FOREIGN KEY (rid) REFERENCES Rentals (rid)
    )
  `;
  database
    .query(text)
    .then(result => res.status(200).json({
      query: formatQuery(text),
      action: 'init-db',
      success: true,
    }))
    .catch(error => res.status(400).json({
      query: formatQuery(text),
      action: 'init-db',
      success: false,
      error_message: error.message,
      error_detail: error.detail,
    }));
});

// @route   POST seed-db
// @desc    Seed db with data
router.post('/seed-db', (req, res) => {
  const branchValues = [
    ['Kitsilano', 'Vancouver'],
    ['Yaletown', 'Vancouver'],
    ['James Bay', 'Victoria'],
    ['Yorkville', 'Toronto'],
    ['Pointe-Claire', 'Montreal']
  ];
  const customerValues = [];
  while (customerValues.length < 40) {
    const name = faker.name.firstName() + ' ' + faker.name.lastName();
    let phone, dl;
    do {
      phone = faker.phone.phoneNumberFormat(0);
      dl = faker.finance.account(7);
    } while (!customerValues.every(c => c[0] !== phone && c[3] !== dl));
    customerValues.push([
      phone,
      name.split(`'`).join(`''`),
      faker.address.streetAddress().split(`'`).join(`''`),
      dl,
    ]);
  }
  const vehicleTypeValues = [
    ['Economy', 'NULL', 89.99, 18.37, 0.90, 33.86, 6.47, 0.37, 0.04],
    ['Compact', 'NULL', 92.99, 18.99, 0.94, 34.99, 6.69, 0.39, 0.04],
    ['Mid-size', 'NULL', 94.49, 19.29, 0.96, 35.55, 6.79, 0.40, 0.04],
    ['Standard', 'NULL', 95.79, 19.56, 0.97, 36.04, 6.89, 0.41, 0.04],
    ['Full-size', 'NULL', 96.99, 19.79, 0.98, 36.49, 6.98, 0.41, 0.04],
    ['SUV', 'NULL', 97.99, 19.99, 0.99, 36.87, 7.04, 0.41, 0.04],
    ['Truck', 'NULL', 97.49, 19.90, 0.98, 36.68, 7.01, 0.41, 0.04],
  ];
  const vehiclesByType = getListOfVehicles();
  const vehicleValues = [];
  let vid = 0;
  branchValues.forEach(branch => {
    Object.keys(vehiclesByType).forEach(type => {
      const colors = ['white', 'gray', 'blue', 'red', 'beige', 'green'];
      const vehicleList = vehiclesByType[type];
      vehicleList.forEach(v => {
        const numLoops = chance.integer({ min: 1, max: 2 });
        for (let i = 0; i < numLoops; i++) {
          vid += 1;
          const make = v[0];
          const model = v[1];
          let vl; // vlicense
          do {
            vl = faker.random.alphaNumeric(6).toUpperCase();
            vl = vl.substring(0,3) + ' ' + vl.substring(3,6);
          } while (!vehicleValues.every(val => val[1] !== vl));
          vehicleValues.push([
            vid.toString(),
            vl,
            make,
            model,
            colors[chance.integer({ min: 0, max: colors.length - 1 })],
            chance.integer({ min: 20000, max: 102000 }).toString(),
            chance.bool({ likelihood: 90 }) ? 'for_rent' : 'for_sale',
            type,
            branch[0],
            branch[1],
          ]);
        }
      })
    })
  });
  const oneHour = 3600000;
  const oneDay = oneHour * 24;
  const oneMonth = oneDay * 30;

  const genRandomReservationData = (minFrom, maxFrom) => {
    let from, until, vtIndex, bIndex;
    from = chance.integer({ min: minFrom, max: maxFrom });
    from = Math.trunc(from / oneHour) * oneHour;
    until = from + chance.integer({ min: oneDay, max: 10 * oneDay });
    until = Math.trunc(until / oneHour) * oneHour;
    return {
      fromDateTime: from,
      toDateTime: until,
      vtIndex: chance.integer({ min: 0, max: vehicleTypeValues.length - 1 }),
      bIndex: chance.integer({ min: 0, max: branchValues.length - 1 }),
    };
  }
  const listVehiclesTypeXBranchY = (vtIndex, bIndex) => {
    const vtName = vehicleTypeValues[vtIndex][0];
    const location = branchValues[bIndex][0];
    const city = branchValues[bIndex][1];
    return vehicleValues.filter(v => (
      v[7] === vtName && v[8] === location && v[9] === city
    ));
  }
  const countNumVehiclesTypeXBranchY = (vtIndex, bIndex) => {
    return listVehiclesTypeXBranchY(vtIndex, bIndex).length;
  }

  const resObjects = [];
  customerValues.forEach((c, cIndex) => {
    const cPhone = c[0];
    const minFrom = Date.now() - oneMonth;
    const maxFrom = Date.now() + oneMonth;
    let rentalData;
    let loopIndex = 0;
    do {
      loopIndex += 1;
      if (loopIndex > 10) throw new Error('No available vehicles');
      rentalData = genRandomReservationData(minFrom, maxFrom);
      rentalData.cIndex = cIndex;
    } while ((() => {
      const rentalsOfTypeXBranchY = resObjects.filter(r => (
        r.vtIndex === rentalData.vtIndex && r.bIndex === rentalData.bIndex
      ));
      const reqVs = countReqVehicles(rentalsOfTypeXBranchY);
      const numVs = countNumVehiclesTypeXBranchY(
        rentalData.vtIndex, rentalData.bIndex
      );
      return reqVs >= numVs;
    })())
    resObjects.push(rentalData);
  });
  let resValues = resObjects.map((r, rIndex) => [
    10000 + rIndex,
    vehicleTypeValues[r.vtIndex][0],
    customerValues[r.cIndex][0],
    formatDate(new Date(r.fromDateTime)),
    formatDate(new Date(r.toDateTime)),
    branchValues[r.bIndex][0],
    branchValues[r.bIndex][1],
  ]);
  resValues.sort((a, b) => {
    const a_toDate = new Date(a[4]);
    const b_toDate = new Date(b[4]);
    return (a_toDate > b_toDate ? 1 : -1);
  });
  const odometers = {};
  vehicleValues.forEach(v => odometers[v[0]] = v[5]);
  let rentObjects = [];
  for (let i = resValues.length - 1; i >= 0; i--) {
    const res = resValues[i];
    const fromDate = new Date(res[3]);
    if (fromDate.valueOf() < Date.now()) {
      const r = resObjects[i];
      const eligibleVehicles = listVehiclesTypeXBranchY(r.vtIndex, r.bIndex);
      let vid;
      for (let i = 0; i < eligibleVehicles.length; i++) {
        vid = eligibleVehicles[i][0];
        if (rentObjects.every(ro => {
          if (ro.vid !== vid) { // different vehicle
            return true
          } else {
            const roFrom = ro.fromDateTime;
            const roTo = ro.toDateTime;
            return (roTo < r.fromDateTime || roFrom > r.toDateTime);
          }
        })) {
          break;
        }
      }
      const newRentObject = {
        vid: vid,
        vtIndex: r.vtIndex,
        confNo: res[0],
        fromDateTime: res[3],
        toDateTime: res[4],
        cellphone: res[2],
        location: res[5],
        city: res[6],
        startOdometer: odometers[vid],
        endOdometer: null,
        returned: false,
      }
      // Randomly delete some reservations
      if (chance.bool({ likelihood: 30 })) {
        newRentObject.confNo = 'NULL';
        resValues.splice(i, 1);
      }
      const toDate = new Date(res[4]);
      if (toDate.valueOf() < Date.now()) {
        newRentObject.returned = true;
        const hours = (toDate.valueOf() - fromDate.valueOf()) / 3600000;
        newRentObject.duration = hours;
        const distance = hours * chance.integer({ min: 2, max: 8 });
        newRentObject.endOdometer = odometers[vid];
        odometers[vid] = odometers[vid] - distance;
        newRentObject.startOdometer = odometers[vid];
      }
      rentObjects.push(newRentObject);
    }
  }
  oldToNewConfNos = {};
  for (let i = 0; i < resValues.length; i++) {
    const res = resValues[i]
    const oldConfNo = res[0];
    const newConfNo = 10000 + i;
    resValues[i][0] = newConfNo;
    oldToNewConfNos[oldConfNo] = newConfNo;
  }
  for (let i = 0; i < rentObjects.length; i++) {
    const rent = rentObjects[i]
    const oldConfNo = rent.confNo;
    const newConfNo = oldToNewConfNos[oldConfNo];
    if (newConfNo) {
    rentObjects[i].confNo = newConfNo;
    }
  }
  rentObjects = rentObjects.reverse();
  const rentValues = rentObjects.map((r, i) => [
    i + 1,
    r.vid,
    r.cellphone,
    r.confNo,
    r.fromDateTime,
    r.toDateTime,
    r.startOdometer,
    (chance.bool({ likelihood: 70}) ? 'Visa' : 'Mastercard'),
    faker.finance.account(16),
    genExpDate(),
    r.location,
    r.city,
  ]);
  const returnValues = [];
  rentObjects.forEach(rent => {
    if (rent.returned) {
      const vtype = vehicleTypeValues[rent.vtIndex];
      const weeks = Math.trunc(rent.duration / 168)
      let remainingHrs = Math.trunc(rent.duration % 168)
      const days = Math.trunc(remainingHrs / 24)
      const hours = Math.trunc(remainingHrs % 24)
      let cost = (vtype[2] + vtype[5]) * weeks;
      cost += (vtype[3] + vtype[6]) * days;
      cost += (vtype[4] + vtype[7]) * hours;
      let distance = rent.endOdometer - rent.startOdometer;
      cost += vtype[7] * distance;
      returnValues.push([
        returnValues.length + 1,
        rent.toDateTime,
        rent.endOdometer,
        chance.bool({ likelihood: 40 }),
        cost,
      ]);
    }
  });

  const text = `
    INSERT INTO Branches ( location, city )
    VALUES
    ${branchValues.map(arr => `(
      ${arr.map(item => item === 'NULL' ? item : `'${item}'`).join(', ')})
    `).join(', ')};

    INSERT INTO Customers (
      cellphone,
      name,
      address,
      dlicense
    )
    VALUES
    ${customerValues.map(arr => `(
      ${arr.map(item => item === 'NULL' ? item : `'${item}'`).join(', ')})
    `).join(', ')};

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
    VALUES
    ${vehicleTypeValues.map(arr => `(
      ${arr.map(item => item === 'NULL' ? item : `'${item}'`).join(', ')})
    `).join(', ')};

    INSERT INTO Vehicles (
      vid,
      vlicense,
      make,
      model,
      color,
      odometer,
      status,
      vtname,
      location,
      city
    )
    VALUES
    ${vehicleValues.map(arr => `(
      ${arr.map(item => item === 'NULL' ? item : `'${item}'`).join(', ')})
    `).join(', ')};

    INSERT INTO Reservations (
      confNo,
      vtname,
      cellphone,
      fromDateTime,
      toDateTime,
      location,
      city
    )
    VALUES
    ${resValues.map(arr => `(
      ${arr.map(item => item === 'NULL' ? item : `'${item}'`).join(', ')})
    `).join(', ')};

    INSERT INTO Rentals (
      rid,
      vid,
      cellphone,
      confNo,
      fromDateTime,
      toDateTime,
      odometer,
      cardName,
      cardNo,
      expDate,
      location,
      city
    )
    VALUES
    ${rentValues.map(arr => `(
      ${arr.map(item => item === 'NULL' ? item : `'${item}'`).join(', ')})
    `).join(', ')};

    INSERT INTO Returns (
      rid,
      dateTime,
      odometer,
      fullTank,
      totalCost
    )
    VALUES
    ${returnValues.map(arr => `(
      ${arr.map(item => item === 'NULL' ? item : `'${item}'`).join(', ')})
    `).join(', ')};
  `;
  database
    .query(text)
    .then(result => res.status(200).json({
      query: formatQuery(text),
      action: 'seed-db',
      success: true,
    }))
    .catch(error => res.status(400).json({
      query: formatQuery(text),
      action: 'seed-db',
      success: false,
      error_message: error.message,
      error_detail: error.detail,
    }));
})

module.exports = router;
