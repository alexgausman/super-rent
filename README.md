> When entering commands in the terminal, omit `$`, `=#`, and `=>`. These prefixes are only added below for context.

# NodeJS Installation

Check if NodeJS is installed.

`$ node -v`

If NodeJS is not installed, follow instructions on:

https://nodejs.org/en/download/

Update npm.

`$ npm i -g npm`


# Backend

### Setup PostgreSQL

Check if PostgreSQL is installed.

`$ psql --version`

If not, install PostgreSQL.

`$ brew install postgresql`

### Run Postgres & Setup Database

Start postgres.

`$ pg_ctl -D /usr/local/var/postgres start`

Login to postgres.

`$ psql postgres`

Create a user and password and give them create database access.

`=# CREATE ROLE api_user WITH LOGIN PASSWORD 'password';`
`=# ALTER ROLE api_user CREATEDB;`

Logout of the root user and login to the newly created user.

`=# \q`
`$ psql -d postgres -U api_user`

Create a `super_rent` database and connect to it.

`=> CREATE DATABASE super_rent;`
`=> \c super_rent`

### Install NodeJS Backend Dependencies

Install/update NodeJS global dependencies:

`$ npm i -D nodemon`

Install local dependencies.

`cd` into the `backend` directory (i.e. SuperRent/backend)

`$ npm install`

### Inspecting The PostgreSQL Database

You can use a GUI app like PSequel for inspecting the database.

http://www.psequel.com/

If postgres is not already running, start it now.

`$ pg_ctl -D /usr/local/var/postgres start`

Connect to the db in the PSequel app with the following params.

Host: `localhost`
User: `api_user`
Password: `password`
Database: `super_rent`
Port: `5432`

Remember use the *refresh* button in the bottom left after making changes via the API.

### Startup Backend Server

If postgres is not already running, start it now.

`$ pg_ctl -D /usr/local/var/postgres start`

`cd` into the `backend` directory (i.e. SuperRent/backend)

Start NodeJS server.

`$ nodemon server`

### Interacting With The Server API

You can use a GUI app like *Postman* for interacting with the server.

https://www.getpostman.com/

Make sure NodeJS server is running. If not, follow instructions above.

Click on `File > New Tab`.

Change the HTTP Action (dropdown) from `GET` to `POST`. Enter the request URL `localhost:4000/admin/init-db`. Click *Send*.

A response should return showing the query that was submitted. Note that this query will have multiple "TODO" comments included.

If you now go to the *PSequel* app and click refresh in the bottom left, you should see that there is a `vehicletypes` table that has been added on the left.

Now, let's go back to *Postman* and try adding a new VehicleType.

Keep the HTTP Action set to `POST` and set the request URL to `localhost:4000/vehicle-types`. Below the request URL, select the `Body` tab and the `x-www-form-urlencoded` subtab. Add a key `vtname` and a value `truck`. Click *Send*.

In the response we should see both the query entered and the result row which was added. Likewise, in *PSequel*, if we hit refresh we will see a new VehicleType row with a vtname of truck.

To get a list of the current VehicleTypes via the API, go back to *Postman* and change the HTTP Action from `POST` to `GET`. Keep the request URL set as `localhost:4000/vehicle-types` and uncheck the (key, value) added in the body. Then click Send. The returned response will appear similar to the previous one, with the query entered and a list of the rows (which currently only includes truck).

To delete the truck VehicleType, change the HTTP Action from `GET` to `DELETE`, set the request URL to `localhost:4000/vehicle-types/truck`, and click *Send*.

If at any point you wish to clear all the tables from the database, send an HTTTP `POST` request to `localhost:4000/admin/clear-db`. After the database is cleared, you can make a `POST` request to `localhost:4000/admin/init-db` to initialize the tables again.

### API Calls (Starter)

|          desc         | action |                  url                 |          body fields          |
|-----------------------|--------|--------------------------------------|-------------------------------|
| DB tables: clear      | POST   | localhost:4000/admin/clear-db        | *none*                        |
| DB tables: list       | GET    | localhost:4000/admin/db-tables-list  | *none*                        |
| DB tables: initialize | POST   | localhost:4000/admin/init-db         | *none*                        |
| DB tables: seed       | POST   | localhost:4000/admin/seed-db         | *none*                        |
| VehicleTypes: list    | GET    | localhost:4000/vehicle-types         | *none*                        |
| VehicleTypes: add     | POST   | localhost:4000/vehicle-types         | vtname, features, wrate, ...  |
| Vehicletypes: remove  | DELETE | localhost:4000/vehicle-types/:vtname | *none*                        |

### Backend Project Structure & TODOs

The DB initialize query is in backend/routes/admin.js. Multiple TODOs are listed where other CREATE TABLE statements should go.

The VehicleTypes API is complete and can be viewed in backend/routes/vehicleTypes.js. I have added (index, create, delete) function stubs for branches, customers, rentals, reservations, returns, and vehicles as well. So, I think, all that needs to be done with those is for the SQL TODOs to get filled in.

Once all the Table APIs are complete we can move on to the "actions" for part 3.

I will also get started on a front end for the app. I'll probably just use React and Bootstrap for that.
