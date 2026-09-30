# Blogbook - Blog Application (Mini Project)

A simple blog where you can **add, view, edit and delete** posts.

**Tech stack:** Node.js, Express.js, MongoDB, Mongoose, HTML, CSS, JavaScript (`fetch`).

## Project structure

```text
blog-application/
├── server.js              # starts Express, connects to MongoDB
├── package.json
├── .env                   # your settings (not uploaded to Git)
├── .env.example           # sample settings
├── .gitignore
├── models/BlogPost.js     # Mongoose schema + model
├── routes/blogRoutes.js   # REST API (CRUD)
└── public/                # frontend, served by Express
    ├── index.html         # home page (all posts)
    ├── add.html           # add form
    ├── edit.html          # edit form
    ├── style.css
    └── script.js
```

## Setup

1. Install [Node.js](https://nodejs.org) (v18 or newer) and MongoDB (see below).
2. Open a terminal in the project folder and run:

```bash
npm install
```

3. Create your `.env` file (one is already included for local MongoDB):

```bash
cp .env.example .env        # Windows: copy .env.example .env
```

4. Start the app:

```bash
npm start
```

5. Open <http://localhost:5000>.

## MongoDB setup

**Option A - Local MongoDB (easiest for a lab PC)**

1. Install MongoDB Community Server from mongodb.com and make sure the service is running.
2. Use this in `.env`:

```env
MONGO_URI=mongodb://127.0.0.1:27017/blogdb
PORT=5000
```

The database `blogdb` and the collection `blogposts` are created automatically when you add the first post.

**Option B - MongoDB Atlas (free cloud database)**

1. Create a free account and a free cluster at mongodb.com/atlas.
2. Database Access -> add a database user (username + password).
3. Network Access -> add your IP address (or `0.0.0.0/0` for learning only).
4. Connect -> Drivers -> copy the connection string and put it in `.env`:

```env
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/blogdb?retryWrites=true&w=majority
PORT=5000
```

If your password has special characters (`@`, `#`, `/`), URL-encode them.

## REST API

| Method | URL              | What it does       | Success code |
|--------|------------------|--------------------|--------------|
| GET    | `/api/posts`     | Get all posts      | 200          |
| GET    | `/api/posts/:id` | Get one post       | 200          |
| POST   | `/api/posts`     | Create a post      | 201          |
| PUT    | `/api/posts/:id` | Update a post      | 200          |
| DELETE | `/api/posts/:id` | Delete a post      | 200          |

Error codes used: `400` (empty field / bad id / bad JSON), `404` (post not found), `500` (server error).

Request body for POST and PUT:

```json
{ "title": "My first post", "author": "Asha", "content": "Hello world!" }
```

## How the parts talk to each other

```text
Browser (HTML/CSS/JS)  --fetch() JSON-->  Express routes  --Mongoose-->  MongoDB
Browser                <--JSON reply----  Express routes  <--documents--  MongoDB
```

Example - adding a post:

1. User fills `add.html` and clicks **Publish post**.
2. `script.js` checks the fields and calls `fetch('/api/posts', { method: 'POST', body: JSON.stringify(...) })`.
3. `express.json()` turns the JSON body into `req.body`.
4. The route in `blogRoutes.js` validates the data and calls `BlogPost.create(...)`.
5. Mongoose checks the schema and saves a document in MongoDB (adding `createdAt`).
6. Express replies `201` with the saved post as JSON.
7. `script.js` redirects to the home page, which calls `GET /api/posts` and draws the cards.

## Viva notes

**What is this project?** A CRUD web application: users can Create, Read, Update and Delete blog posts. Data is stored permanently in MongoDB.

**Technologies**
- **Node.js** - runs JavaScript on the server (outside the browser).
- **Express.js** - a Node framework that makes it easy to build web servers, routes and APIs.
- **MongoDB** - a NoSQL database that stores data as JSON-like documents (no fixed tables and rows).
- **Mongoose** - a library that connects Node to MongoDB and lets us define a schema, validate data and use simple methods like `find()` and `create()`.
- **HTML / CSS / JavaScript** - the user interface. `fetch()` sends requests to the API.
- **dotenv** - reads secrets like `MONGO_URI` from `.env`, so they are not written in the code.

**CRUD operations**

| Operation | HTTP method | Mongoose method                |
|-----------|-------------|--------------------------------|
| Create    | POST        | `BlogPost.create()`            |
| Read      | GET         | `BlogPost.find()`, `findById()`|
| Update    | PUT         | `BlogPost.findByIdAndUpdate()` |
| Delete    | DELETE      | `BlogPost.findByIdAndDelete()` |

**What is a REST API?** A set of URLs (endpoints) that a client uses with HTTP methods (GET, POST, PUT, DELETE) to work with resources. Data is exchanged as JSON and the reply includes a status code (200, 201, 400, 404, 500).

**What is middleware?** A function that runs between the request and the response. We use `express.json()` (reads JSON bodies), `express.static()` (serves the `public` folder) and an error-handling middleware.

**What is a schema and a model?** The schema defines the fields and rules (`title`, `author`, `content` are required strings). The model is built from the schema and is the object we use to talk to the collection.

**What do timestamps do?** `timestamps: true` makes Mongoose add `createdAt` and `updatedAt` automatically.

**SQL vs MongoDB:** SQL uses tables, rows and a fixed structure. MongoDB uses collections and documents (flexible, JSON-like). Collection ~ table, document ~ row.

**Why keep the connection string in `.env`?** It contains a password. Hard-coding it and uploading to GitHub would leak it. `.env` is listed in `.gitignore`.

**How is validation done?** Twice: in `script.js` (quick feedback for the user) and on the server in the route plus the Mongoose schema (the real protection, because anyone can call the API directly).

**Why `textContent` instead of `innerHTML`?** `textContent` treats user text as plain text, so a post containing `<script>` cannot run code (protects against XSS).

**Possible future improvements:** login/authentication, search, pagination, comments, image upload.
