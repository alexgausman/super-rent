const router = require('express').Router();
const { database } = require('../config');
const formatQuery = require('../utils/formatQuery');

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
      error: error,
    }));
});

// @route   POST init-db
// @desc    Init db with CREATE TABLE statements
router.post('/init-db', (req, res) => {
  const text = `
    -- TODO: CREATE TABLE Branches --

    -- TODO: CREATE TABLE Customers --

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

    -- TODO: CREATE TABLE Vehicles --

    -- TODO: CREATE TABLE Reservations --

    -- TODO: CREATE TABLE Rentals --

    -- TODO: CREATE TABLE Returns --
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
      error: error,
    }));
});

module.exports = router;
