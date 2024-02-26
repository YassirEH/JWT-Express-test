//auth.js

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { MongoClient } = require('mongodb');

const router = express.Router();

// Middleware for the parsing of the request body
router.use(express.json());

// Database connection parameters
const url = 'mongodb://127.0.0.1:27017';
const dbName = 'bdmonapi';
let db;




// Middleware pour l'authentification
async function authenticateUser(username, password ,db) {
  
  if (!db) {
    console.error('Database connection not established');
    throw new Error('Database connection not established');
  }

  const utilisateursCollection = db.collection('utilisateur');
  const user = await utilisateursCollection.findOne({ username: username }); // chercher un utilisateur selon un username

  if (!user) {
    return null; // Utilisateur non trouvé
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  console.log( passwordMatch)
  if (passwordMatch) {
    return user; // Authentification réussie
  } else {
    return null; // Mot de passe incorrect
  }
}

// Route pour la connexion d'un utilisateur
router.post('/login', async (req, res) => {
  const db = req.app.locals.db
  const { username, password } = req.body;
console.log("ok")
  try {
    if (!db) {
      console.error('Database connection not established');
      return res.status(500).send('Failed to login');
    }

    const user = await authenticateUser(username, password, db);

    if (user) {
      const accessToken = jwt.sign({ username: user.username }, 'secretkey');
      res.json({ accessToken: accessToken });
    } else {
      res.status(401).send('Invalid username or password');
    }
  } catch (error) {
    console.error('Error authenticating user', error);
    res.status(500).send('Failed to login');
  }
});

// Route pour l'enregistrement d'un nouvel utilisateur
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const db = req.app.locals.db


  try {
    if (!db) {
      console.error('Database connection not established');
      return res.status(500).send('Failed to register user');
    }

    const utilisateursCollection = db.collection('utilisateur');
    const existingUser = await utilisateursCollection.findOne({ username: username });

    if (existingUser) {
      return res.status(400).send('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { username: username, password: hashedPassword };
    await utilisateursCollection.insertOne(newUser);

    res.status(201).send('User registered successfully');
  } catch (error) {
    console.error('Error registering user', error);
    res.status(500).send('Failed to register user');
  }
});

module.exports = router;
