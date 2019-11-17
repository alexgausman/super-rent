<img src="https://raw.githubusercontent.com/alexgausman/super-rent/master/preview.png" />

---

> When entering commands in the terminal, omit `$`, `=#`, and `=>`. These prefixes are only added below for context.

# Installation

### Docker

Check if Docker is installed.

`$ docker -v`

If not, follow the instructions to install Docker CE (Community Edition).

https://docs.docker.com/v17.09/engine/installation/

### NodeJS

Check if NodeJS is installed.

`$ node -v`

If NodeJS is not installed, follow instructions on:

https://nodejs.org/en/download/

Update npm.

`$ npm i -g npm`

### Backend Dependencies

`cd` into the `backend` directory

`$ npm install`

### Frontend Dependencies

`cd` into the `frontend` directory

`$ npm install`

# Setup

Use three seperate terminal windows for the following processes.

### Run PostgreSQL Docker Container

`$ docker run --rm -p 4001:5432 -e POSTGRES_PASSWORD=password -e POSTGRES_USER=api_user -e POSTGRES_DB=super_rent -v pgdata:/var/lib/postgresql/data postgres`

### Run NodeJS Backend Server

`cd` into the `backend` directory

`$ npm start`

### Run NodeJS Frontend Client

`cd` into the `frontend` directory

`$ npm start`

# Development

### Inspecting The PostgreSQL Database

You can use a GUI app like PSequel for inspecting the database.

http://www.psequel.com/

Make sure postgres is running via Docker.

Connect to the db in the PSequel app with the following params.

Host: `localhost`
User: `api_user`
Password: `password`
Database: `super_rent`
Port: `4001`

Remember use the *refresh* button in the bottom left after making changes via the API.

### Interacting With The Server API

You can use a GUI app like *Postman* for interacting with the server.

https://www.getpostman.com/

Make sure NodeJS server is running. If not, follow instructions above.

Click on `File > New Tab`.

Change the HTTP Action (dropdown) from `GET` to `POST`. Enter the request URL `localhost:4000/admin/init-db`. Click *Send*.

A response should return showing the query that was submitted. Note that this query will have multiple "TODO" comments included.

If you now go to the *PSequel* app and click refresh in the bottom left, you should see that there is a `vehicletypes` table that has been added on the left.

Now, let's go back to *Postman* and try adding a new VehicleType.

Keep the HTTP Action set to `POST` and set the request URL to `localhost:4000/tables/vehicletypes`. Below the request URL, select the `Body` tab and the `x-www-form-urlencoded` subtab. Add a key `vtname` and a value `truck`. Click *Send*.

In the response we should see both the query entered and the result row which was added. Likewise, in *PSequel*, if we hit refresh we will see a new VehicleType row with a vtname of truck.

To get a list of the current VehicleTypes via the API, go back to *Postman* and change the HTTP Action from `POST` to `GET`. Keep the request URL set as `localhost:4000/tables/vehicletypes` and uncheck the (key, value) added in the body. Then click Send. The returned response will appear similar to the previous one, with the query entered and a list of the rows (which currently only includes truck).

To delete the truck VehicleType, change the HTTP Action from `GET` to `POST`, set the request URL to `localhost:4000/tables/vehicletypes/delete-row`, re-add the (key, value) pair (vtname, truck) and click *Send*.

If at any point you wish to clear all the tables from the database, send an HTTTP `POST` request to `localhost:4000/admin/clear-db`. After the database is cleared, you can make a `POST` request to `localhost:4000/admin/init-db` to initialize the tables again.

### API Calls (Starter)

|          desc         | action |                   url                   |          body fields          |
|-----------------------|--------|-----------------------------------------|-------------------------------|
| DB tables: clear      | POST   | localhost:4000/admin/clear-db           | *none*                        |
| DB tables: list       | GET    | localhost:4000/admin/db-tables-list     | *none*                        |
| DB tables: initialize | POST   | localhost:4000/admin/init-db            | *none*                        |
| DB tables: seed       | POST   | localhost:4000/admin/seed-db            | *none*                        |
| VehicleTypes: list    | GET    | localhost:4000/vehicletypes             | *none*                        |
| VehicleTypes: add     | POST   | localhost:4000/vehicletypes             | vtname, features, wrate, ...  |
| Vehicletypes: remove  | POST   | localhost:4000/vehicletypes/delete-row  | vtname                        |

### Backend Project Structure & TODOs

The DB initialize query is in backend/routes/admin.js.

The VehicleTypes API is complete and can be viewed in backend/routes/vehicleTypes.js. I have added (index, create, delete) function stubs for branches, customers, rentals, reservations, returns, and vehicles as well. So, I think, all that needs to be done with those is for the SQL TODOs to get filled in.

Once all the Table APIs are complete we can move on to the "actions" for part 3.

### Interacting With The Frontend

Once you have both the backend and frontend running in seperate terminal windows, visit `localhost:3000` in your browser.

Open the database dropdown menu in the top right corner and click 'Initialize'. After that, open the dropdown menu again and click 'Seed'. Click on 'VehicleTypes' on the left sidebar to see the VehicleTypes table. You can delete rows, insert rows, and refresh the table. There is also a console on the bottom of the screen that can be opened to show the query history as well as any errors.
