# Route Planner 🏃‍♂️🌳

This is the official repository for the SC2006 Software Engineering group project **_Route Planner_**. Welcome!

<div align='center'>
    <img src="public/logo.png" width=200>
</div><br>

RoutePlanner is an innovative mobile application designed to generate _custom running routes_ based on user preferences, specifically tailored to the **desired running distance** and inclusion of specific **landmarks**. 

---

<h3 align='center'>
    🏃‍♂️ <a href="Route_Planner_App/frontend">Frontend</a>
    🏃‍♀️ <a href="Route_Planner_App/backend">Backend</a>
    🏃 <a href="https://www.youtube.com/watch?v=xfKzCGdqzM0">Demo Video</a>
</h3>


<table align='center' border=0><tr>
<td><details>
    <summary><b><font size="+0.5">
        Documentation
    </font></b></summary>
    <ol>
        <li><a href="Lab Deliverables/Final Deliverables/SRS Documentation.pdf">SRS Documentation</a></li>
        <li><a href="Lab Deliverables/Final Deliverables/Use Case Descriptions.pdf">Use Case Descriptions</a></li>
        <li><a href="Lab Deliverables/Final Deliverables/UI Mockup.pdf">UI Mockup</a></li>
        <li><a href="Lab Deliverables/Final Deliverables/Data Dictionary.pdf">Data Dictionary</a></li>
        <li><a href="Lab Deliverables/Final Deliverables/Functional and Non-Functional Requirements.pdf">Functional & Non-functional Requirements</a></li>
    </ol>
</details></td>

<td>
<details>
    <summary><b><font size="+0.5">
        Diagrams
    </font></b></summary>
    <ol>
        <li><a href="Lab Deliverables/Final Deliverables/Use Case Diagram.pdf">Use Case Diagram</a></li>
        <li><a href="Lab Deliverables/Final Deliverables/Class Diagram.pdf">Class Diagram</a></li>
        <li><a href="Lab Deliverables/Final Deliverables/Application Skeleton.pdf">Application Skeleton</a></li>
        <li><a href="Lab Deliverables/Final Deliverables/System Architecture.pdf">System Architecture</a></li>
        <li><a href="Lab Deliverables/Final Deliverables/Dialog Map.pdf">Dialog Map</a></li>
        <li><a href="Lab Deliverables/Final Deliverables/Sequence Diagrams.pdf">Sequence Diagrams</a></li>
        <li><a href="Lab Deliverables/Final Deliverables/Stereotype Diagram.pdf">Stereotype Diagram</a></li>
    </ol>
</details></td>
</tr></table>

---
### Table of Contents
- [Route Planner Overview](#route-planner)
- [Setup Instructions](#setup-instructions)
    - [Frontend](#frontend-frontend)
    - [Backend](#backend-backend)
- [App Design](#app-design)
    - [Frontend](#frontend)
    - [Backend](#backend)
- [External APIs and Datasets](#external-apis-and-datasets)
- [Contributors](#contributors)

# Setup Instructions
This guide provides instructions to set up and deploy the entire application. Follow the steps below to get the application running locally or in your environment.

> **Note:** If application is not working after following the setup instructions, you may need to renew the API keys

## Frontend `/frontend`
### Prerequisites
Before you begin, make sure you have **npm** installed

### 1. Set up environment variables
Create a `.env` file if it does not exist. Modify the `.env` file with your IP address
```bash
EXPO_PUBLIC_BACKEND_URL=http://YOUR_IP_ADDRESS:3000
```

### 2. Run the frontend application
In the `/frontend` directory, install the required node modules
```bash
npm install
```
Start the frontend application
```bash
npm start
```

## Backend `/backend`
### Prerequisites
Before you begin, make sure you have the following installed:
> - [Node.js](https://nodejs.org/en) and npm
> - [Supabase](https://supabase.com/) account

### 1. Install Dependencies

In the `/backend` directory, install the required node modules:

```bash
npm install
```

### 2. Set Up Environment Variables

- Copy the example environment file to create your `.env` file:

```bash
cp .env.example .env
```

- Fill in the necessary environment variables in the `.env` file:

  - `SUPABASE_URL`: Provided in .env.example
  - `SUPABASE_KEY`: Provided in .env.example
  - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase Service Role Key. This is only necessary if you wish to create your own instance of the database and storage using the scripts provided.
  - `DATABASE_URL`: The URL of your PostgreSQL database.
    Format: "postgres://root:password@hostaddress:6543/postgres?pgbouncer=true"
  - `DIRECT_URL`: The direct URL of your PostgreSQL database. Format: DIRECT_URL="postgres://root:password@hostaddress:5432/postgres"
  - `JWT_SECRET`: Your JWT secret for authentication.

### 3. Locating Environment Variables for Supabase

To find the `DATABASE_URL` and `DIRECT_URL` for your Supabase database:

    1. Log in to the Supabase dashboard.
    2. Navigate to Project Settings.
    3. Under the Configuration section, go to Database.
    4. Look for the Connection String section.
    5. Transaction URL corresponds to DATABASE_URL. Add "?pgbouncer=true" at the end of the string.
    6. Session URL corresponds to DIRECT_URL.

Refer to https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections#external-connection-poolers for more information on `DATABASE_URL`, `DIRECT_URL`, and PgBouncer.

**Optional:** To find the `SUPABASE_URL`, `SUPABASE_KEY` and `SUPABASE_SERVICE_ROLE_KEY` for your Supabase database:

    1. Log in to the Supabase Dashboard (https://app.supabase.io/)
    2. Create a New Project.
    3. Navigate to Project Settings.
    4. Under the Configuration section, go to API.
    5. SUPABASE_URL is listed under the Project URL section. This is your project’s unique API endpoint.
    6. SUPABASE_KEY (anon key) is found under the Project API Keys section. This key is for accessing public endpoints and limited database operations.
    7. SUPABASE_SERVICE_ROLE_KEY (service_role key) is found under the Project API Keys section. This key has elevated permissions (bypass Row-Level Security).

Do note that you will only need to change to your own `SUPABASE_URL`, `SUPABASE_KEY` and `SUPABASE_SERVICE_ROLE_KEY` if you wish to create a local instance of the database for covered linkways and the Supabase Storage for route images.

### 4. Run Database Migrations

Set up the database schema for users and runs using Prisma by running:

```bash
npm run migrate
```

This command will deploy all migrations and set up your database schema automatically.

### 5. Build and Run the Server

#### Development Mode

To run the application in development mode with hot-reloading:

```bash
npm run start:dev
```

#### Production Mode

To run the application in production mode:

1. Build the application:

```bash
npm run build
```

2. Start the production server:

```bash
npm run start:prod
```

### 6. Optional: Additional Setup

**NOTE:** The environmental variables `SUPABASE_URL`, `SUPABASE_KEY` and `SUPABASE_SERVICE_ROLE_KEY` need to be set up first.

If you need to manually set up the Supabase storage:

```bash
npx ts-node scripts/setup-storage.ts
```

If you need to manually set up the Supabase database for covered linkways and load its geojson data into the database:

```bash
npx ts-node scripts/setup-database.ts
npx ts-node scripts/load-geojson.ts data/covered-linkway.geojson
```

### 7. Updating the Application

When making changes that require database updates:

**Create a migration**:

```bash
npx prisma migrate dev --name your-migration-name
```

# App Design
<img src="public/architecture.png">

## Frontend
<div align='center'>
    <img src="https://img.shields.io/badge/React%20Native-0.74.5-blue">
    <img src="https://img.shields.io/badge/JavaScript-22.10.0-orange">
</div><br>
The frontend of Route Planner is built using React Native, which uses JavaScript to render components and connect with backend services

The user interfaces are found in the `/app` folder. The `app/index.js` file is the entry point of the frontend.

```
|–- 📁 Homepage
    └──  Homepage.js
    └──  NavBar.js
    └──  PlanRouteButton.js
    └──  SideDeck.js
|-- 📁 Login
    └──  Login.js
    └──  Register.js
|-- 📁 Navigation
    └── NavigationPage.js
    └── SummaryPage.js
|-- 📁 Route_Generation     # UIs for entire route generation process
    └── GenerateRoute.js
    └── GetDistance.js
    └── GetLandmark.js
    └── GetStartAddress.js
    └── LoadingScreen.js
    └── StartRun.js
|-- 📁 View_Run_History
    └── DisplayHistory.js
    └── RunHistoryPage.js
    └── RunSummary.js
|-- _layout.js
|-- AnimatedToggle.js
|-- BackButton.js
|-- index.js                # entry point into frontend application
|-- LoadingSpinner.js
|-- Map.js
```

The stylesheets for each interface are found in the `/styles` folder.

## Backend
<div align='center'>
    <img src="https://img.shields.io/badge/NestJS-10.4.7-red">
    <img src="https://img.shields.io/badge/TypeScript-5.1.3-blue">
    <img src="https://img.shields.io/badge/Supabase-2.46.1-yellow">
    <img src="https://img.shields.io/badge/PostGreSQL-15.6-darkblue">
    <img src="https://img.shields.io/badge/Prisma-5.22.0-purple">
</div><br>

**Main Framework:** NestJS, using TypeScript
- handles all the application logic ranging from user authentication via JWT Token to endpoint routing for HTTP requests

**Database:** Supabase
- provides easy access to S3 bucket which can store the running route images generate

**Database:** PostgreSQL
- enables storage and processing of geo-spatial data from the sheltered paths dataset sourced from the LTA static dataset repository

**Object-Relational Mapping Tool:**
- simplify SQL queries and database interactions
```
|-- 📁 data
    └── covered-linkway.geojson    # Covered Linkway dataset in geojson format
|-- 📁 prisma
    └── schema.prisma                # Prisma schema file
    └── 📁 migrations               # Prisma migrations
|-- 📁 scripts
    └── setup-storage.ts            # Script to set up Supabase storage for route images
    └── setup-database.ts           # Script to set up Supabase database for covered linkway
    └── load-geojson.ts             # Script to load the geojson data for covered linkway
|-- 📁 src
    ├── main.ts                     # Entry point for the application
    └── ...                         # Other application modules and files
|-- .env.example                    # Example environment file
|-- package.json                    # npm scripts and dependencies
|-- README.md                       # Project setup guide
```

# External APIs and Datasets
1. [**GraphHopper API**](https://docs.graphhopper.com/#tag/Routing-API) - Routing
2. [**OneMap API**](https://www.onemap.gov.sg/apidocs/apidocs) - Landmarks
3. [**2-Hour Weather Forecast**](https://data.gov.sg/datasets/d_3f9e064e25005b0e42969944ccaf2e7a/view#tag/default/GET/two-hr-forecast) - Weather
4. [**HERE**](https://www.here.com/docs/bundle/geocoding-and-search-api-developer-guide/page/topics/endpoint-autosuggest-brief.html) - Autosuggest Locations
5. [**Supabase**](https://supabase.com/docs/guides/api) - Database
6. [**Prisma**](https://www.prisma.io/docs) - Database
7. [**GoogleMaps**](https://developers.google.com/maps/documentation/geocoding/overview) - Geocoding
8. [**Covered Linkway Dataset**](https://datamall.lta.gov.sg/content/datamall/en/static-data.html) - Sheltered Routes

# Contributors
| Name           | Github Username                              |
| -------------- | --------------------------------------------- |
| Huang Yongjian | [yyongjiann](https://github.com/yyongjiann)               |  
| Nadya Yuki Wangsajaya   | [yukiwukii](https://github.com/yukiwukii)             | 
| Nang Kal San Hom     | [justkk4](https://github.com/justkk4)   
| Serena Nathania Sihombing          | [srneea](https://github.com/srneea)           | 
| Shiu Lok Chun, Wesley      | [HamsterW](https://github.com/HamsterW)       | 
| Syed Ali Redha Alsagoff       | [syed-aliredha](https://github.com/syed-aliredha) | 
