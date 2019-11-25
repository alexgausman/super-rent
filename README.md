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

Use seperate terminal windows for the following processes.

### Run PostgreSQL Docker Container

`$ docker run --rm -p 4001:5432 -e POSTGRES_PASSWORD=password -e POSTGRES_USER=api_user -e POSTGRES_DB=super_rent -v pgdata:/var/lib/postgresql/data postgres`

### Run NodeJS Backend Server

`cd` into the `backend` directory

`$ npm start`

### Run NodeJS Frontend Client

`cd` into the `frontend` directory

`$ npm start`

# Usage

### Interacting With The Frontend

Once you have both the backend and frontend running in seperate terminal windows, visit `localhost:3000` in your browser.

Open the database dropdown menu in the top right corner and click 'Initialize'. After that, open the dropdown menu again and click 'Seed'. Click on 'VehicleTypes' on the left sidebar to see the VehicleTypes table. You can delete rows, insert rows, and refresh the table. There is also a console on the bottom of the screen that can be opened to show the query history as well as any errors.
