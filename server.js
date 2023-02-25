/*
CSC3916 HW2
File: Server.js
Description: Web API scaffolding for Movie API
*/

const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const authController = require('./auth');
const authJwtController = require('./auth_jwt');
const db = require('./db')();
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();

// Allow CORS requests
app.use(cors());

// Parse JSON and URL-encoded query parameters
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Initialize Passport middleware
app.use(passport.initialize());

// Create a router instance
const router = express.Router();

// Define a function to get a JSON object for the movie requirement
function getJSONObjectForMovieRequirement(req) {
  const json = {
    headers: 'No headers',
    key: process.env.UNIQUE_KEY,
    body: 'No body',
  };

  if (req.body != null) {
    json.body = req.body;
  }

  if (req.headers != null) {
    json.headers = req.headers;
  }

  return json;
}

// Handle signup requests
router.post('/signup', (req, res) => {
  if (!req.body.username || !req.body.password) {
    res.json({ success: false, msg: 'Please include both username and password to signup.' });
  } else {
    const newUser = {
      username: req.body.username,
      password: req.body.password,
    };

    db.save(newUser); // No duplicate checking
    res.json({ success: true, msg: 'Successfully created new user.' });
  }
});

// Handle signin requests
router.post('/signin', (req, res) => {
  const user = db.findOne(req.body.username);

  if (!user) {
    res.status(401).send({ success: false, msg: 'Authentication failed. User not found.' });
  } else {
    if (req.body.password == user.password) {
      const userToken = { id: user.id, username: user.username };
      const token = jwt.sign(userToken, process.env.SECRET_KEY);
      res.json({ success: true, token: 'JWT ' + token });
    } else {
      res.status(401).send({ success: false, msg: 'Authentication failed.' });
    }
  }
});

// Test collection route
router.route('/testcollection')
  .delete(authController.isAuthenticated, (req, res) => {
    console.log(req.body);
    res = res.status(200);
    if (req.get('Content-Type')) {
      res = res.type(req.get('Content-Type'));
    }
    const o = getJSONObjectForMovieRequirement(req);
    res.json(o);
  })
  .put(authJwtController.isAuthenticated, (req, res) => {
    console.log(req.body);
    res = res.status(200);
    if (req.get('Content-Type')) {
      res = res.type(req.get('Content-Type'));
    }
    const o = getJSONObjectForMovieRequirement(req);
    res.json(o);
  });

// Use the router middleware
app.use('/', router);

// Start the server
app.listen(process.env.PORT || 8080);

// Export the app for testing
module.exports = app;
