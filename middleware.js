// middleware.js

const jwt = require('jsonwebtoken'); // Import jwt module for token verification

// Middleware pour vérifier l'authentification
const isAuthenticated = async (req, res, next) => {
    try {
        const token = req.headers.authorization;
        if (!token) {
            return res.status(401).send('Unauthorized: No token provided');
        }

        const decoded = jwt.verify(token, 'secretkey'); // Verify JWT token
        if (!decoded) {
            return res.status(401).send('Unauthorized: Invalid token');
        }

        // If the token is valid, you might want to check if the user exists or has appropriate access permissions
        // For example, you can retrieve user information from the database using the decoded token payload

        // Assuming you have access to the db variable for querying the database
        // Replace 'bdmonapi' with the appropriate collection name
        const equipes = await db.collection('bdmonapi').find({}).toArray();
        res.status(200).json(equipes);
    } catch (error) {
        console.error('Error authenticating user', error);
        return res.status(500).send('Internal Server Error');
    }
};

module.exports = isAuthenticated;
