const router = require('express').Router();
const { database } = require('../config');
const formatQuery = require('../utils/formatQuery');
const faker = require('faker');

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
      cellphone CHAR (12),
      name VARCHAR (40),
      address VARCHAR (40),
      dlicense CHAR (7),
      PRIMARY KEY (cellphone)
    );

    CREATE TABLE VehicleTypes (
      vtname VARCHAR (40),
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
      status CHAR (8),
      vtname VARCHAR (10),
      location VARCHAR (20),
      city VARCHAR (20),
      PRIMARY KEY (vid),
      FOREIGN KEY (vtname) REFERENCES VehicleTypes (vtname),
      FOREIGN KEY (location, city) REFERENCES Branches (location, city)
    );

    CREATE TABLE Reservations (
      confNo SMALLSERIAL,
      vtname VARCHAR (10),
      cellphone CHAR (12),
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
      cellphone CHAR (12),
      confNo SMALLSERIAL,
      fromDateTime TIMESTAMP,
      toDateTime TIMESTAMP,
      odometer INTEGER,
      cardName VARCHAR (12),
      cardNo CHAR (16),
      ExpDate CHAR (4),
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
    }));
});

// @route   POST seed-db
// @desc    Seed db with data
router.post('/seed-db', (req, res) => {
  const customerValues = [];
  while (customerValues.length < 20) {
    const phone = faker.phone.phoneNumberFormat(0);
    const dl = faker.finance.account(7);
    if (customerValues.every(c => !c.includes(phone) && !c.includes(dl))) {
      customerValues.push(`(
        '${phone}',
        '${faker.name.findName().split(`''`).join(`''`)}',
        '${faker.address.streetAddress().split(`'`).join(`''`)}',
        '${dl}'
      )`);
    }
  }
  const text = `
  INSERT INTO Branches ( location, city )
  VALUES
  ( 'Kitsilano', 'Vancouver' ),
  ( 'Yaletown', 'Vancouver' ),
  ( 'James Bay', 'Victoria' ),
  ( 'Yorkville', 'Toronto' ),
  ( 'Pointe-Claire', 'Montreal');

  INSERT INTO Customers (cellphone, name, address, dlicense) VALUES ${customerValues.join(', ')};

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
    ( 'Econony',
      NULL,
      89.99,
      18.37,
      0.90,
      33.86,
      6.47,
      0.37,
      0.04
    ),
    (
      'Compact',
      NULL,
      92.99,
      18.99,
      0.94,
      34.99,
      6.69,
      0.39,
      0.04
    ),
    (
      'Mid-size',
      NULL,
      94.49,
      19.29,
      0.96,
      35.55,
      6.79,
      0.40,
      0.04
    ),
    (
      'Standard',
      NULL,
      95.79,
      19.56,
      0.97,
      36.04,
      6.89,
      0.41,
      0.04
    ),
    (
      'Full-size',
      NULL,
      96.99,
      19.79,
      0.98,
      36.49,
      6.98,
      0.41,
      0.04
    ),
    (
      'SUV',
      NULL,
      97.99,
      19.99,
      0.99,
      36.87,
      7.04,
      0.41,
      0.04
    ),
    (
      'Truck',
      NULL,
      97.49,
      19.90,
      0.98,
      36.68,
      7.01,
      0.41,
      0.04
    );

  -- TODO: INSERT INTO Vehicles --

  -- TODO: INSERT INTO Reservations --

  -- TODO: INSERT INTO Rentals --

  -- TODO: INSERT INTO Returns --
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
    }));
})

module.exports = router;
