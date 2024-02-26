//server.js

const express = require('express');
const authRouter = require('./auth'); // Importer le routeur d'authentification
const { MongoClient } = require('mongodb');

const app = express();
const url = 'mongodb://127.0.0.1:27017';
const dbName = 'bdmonapi';
let db;

// Middleware pour le parsing du corps de la requête
app.use(express.json());

// Middleware pour la connexion à la base de données MongoDB
MongoClient.connect(url)
    .then((client) => {
      app.locals.db = client.db(dbName);
        console.log('Successfully connected to the database.');

        let isConnected = false;

        app.get('/turn/:state', async (req, res) => {
            const state = req.params.state;
            if (state == "off") {
                await client.close();
                isConnected = false;
                res.send('Connection is now OFF');
            } else {
                await MongoClient.connect(url);
                isConnected = true;
                res.send('Connection is now ON');
            }
        });
    
    // Utilisation du routeur d'authentification
    app.use('/auth', authRouter);
   

    // Démarrage du serveur une fois la connexion à la base de données établie
    const port = 80;
    app.listen(port, () => {
      console.log(`Le serveur écoute sur le port ${port}`);
    });
  })
  .catch((err) => {
    console.log('Failed to connect to the database.', err);
  });
