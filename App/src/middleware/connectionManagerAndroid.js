const mysql = require('mysql');
const connectionPoolsAndroid = {}; // Object to store connection pools keyed by user

// Middleware to set dbCredentials and create the connection pool if it doesn't exist
const connectionManagerAndroid = (req, res, next) => {
    const dbCredentials = {
        host: req.headers['db-host'],
        user: req.headers['db-user'],
        password: req.headers['db-password'],
        database: req.headers['db-database']
    };

    if (!dbCredentials.host || !dbCredentials.user || !dbCredentials.password || !dbCredentials.database) {
        return next(new Error('No dbCredentials found in request.'));
    }

    const user = dbCredentials.user;

    // Create or reuse connection pool based on dbCredentials.user
    if (!connectionPoolsAndroid[user]) {
        // Log the creation of a new connection pool
        console.log(`Creating new connection pool for Android user: ${user}`);

        // Create new connection pool if not already exists
        connectionPoolsAndroid[user] = mysql.createPool({
            host: dbCredentials.host,
            user: dbCredentials.user,
            password: dbCredentials.password,
            database: dbCredentials.database
        });
    } else {
        // Log the reuse of the existing connection pool
        console.log(`Reusing existing connection pool for Android user: ${user}`);
    }

    req.connectionPool = connectionPoolsAndroid[user]; // Attach the connection pool to the request object

    next();
};

module.exports = connectionManagerAndroid;