require('dotenv').config('.env');
const cors = require('cors');
const express = require('express');
const app = express();
const morgan = require('morgan');
const { PORT = 3000 } = process.env;

const { User, Cupcake } = require('./db');

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* *********** YOUR CODE HERE *********** */
const {
  AUTH0_SECRET = 'a long, randomly-generated string stored in env',
  AUTH0_AUDIENCE = 'http://localhost:3000',
  AUTH0_CLIENT_ID,
  AUTH0_BASE_URL,
} = process.env;

const config = {
  authRequired: true,
  auth0Logout: true,
  secret: AUTH0_SECRET,
  baseURL: AUTH0_AUDIENCE,
  clientID: AUTH0_CLIENT_ID,
  issuerBaseURL: `https://${AUTH0_BASE_URL}`,
};

const { auth } = require('express-openid-connect');
app.use(auth(config));

app.get('/', (req, res) => {
  if (req.oidc.isAuthenticated()) {
    const { name, nickname, email, picture } = req.oidc.user;
    const html = `
      <h1>Welcome, ${name}</h1>
      <p>Username: ${nickname}</p>
      <p>Email: ${email}</p>
      <img src="${picture}" alt="Profile Picture">
    `;
    res.send(html);
  } else {
    res.send('Logged out');
  }
});

/* *************************************** */

app.get('/cupcakes', async (req, res, next) => {
  try {
    const cupcakes = await Cupcake.findAll();
    res.send(cupcakes);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('SERVER ERROR: ', error);
  if (res.statusCode < 400) res.status(500);
  res.send({ error: error.message, name: error.name, message: error.message });
});

app.listen(PORT, () => {
  console.log(`Cupcakes are ready at http://localhost:${PORT}`);
});