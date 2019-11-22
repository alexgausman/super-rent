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
const customerActions = require('./routes/customerActions');
const clerkActions = require('./routes/clerkActions');

app.use('/admin', admin);
app.use('/tables/branches', branches);
app.use('/tables/customers', customers);
app.use('/tables/rentals', rentals);
app.use('/tables/reservations', reservations);
app.use('/tables/returns', returns);
app.use('/tables/vehicles', vehicles);
app.use('/tables/vehicletypes', vehicleTypes);
app.use('/customer-actions', customerActions);
app.use('/clerk-actions', clerkActions);

const PORT = process.env.port || 4000;
app.listen(PORT, () => {
  console.log("Server is running on Port: " + PORT);
});
