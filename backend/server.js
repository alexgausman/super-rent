const express = require('express');
const app = express();

// middleware
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

const admin = require('./routes/admin');
const branches = require('./routes/branches');
const customers = require('./routes/customers');
const rentals = require('./routes/rentals');
const reservations = require('./routes/reservations');
const returns = require('./routes/returns');
const vehicles = require('./routes/vehicles');
const vehicleTypes = require('./routes/vehicleTypes');

app.use('/admin', admin);
app.use('/branches', branches);
app.use('/customers', customers);
app.use('/rentals', rentals);
app.use('/reservations', reservations);
app.use('/returns', returns);
app.use('/vehicles', vehicles);
app.use('/vehicle-types', vehicleTypes);

const PORT = process.env.port || 4000;
app.listen(PORT, () => {
  console.log("Server is running on Port: " + PORT);
});
