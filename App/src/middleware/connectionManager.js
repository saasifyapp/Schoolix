const mysql = require('mysql');
const connectionPools = {}; // Object to store connection pools keyed by user

// Middleware to set dbCredentials and create the connection pool if it doesn't exist
const connectionManager = (req, res, next) => {
    const dbCredentials = req.session.dbCredentials;

    if (!dbCredentials) {
        return next(new Error('No dbCredentials found in session.'));
    }

    const user = dbCredentials.user;

    // Create or reuse connection pool based on dbCredentials.user
    if (!connectionPools[user]) {
        console.log(`Creating new connection pool for user: ${user}`);

        // Create new connection pool if not already exists
        connectionPools[user] = mysql.createPool({
            host: dbCredentials.host,
            user: dbCredentials.user,
            password: dbCredentials.password,
            database: dbCredentials.database,
            connectionLimit: 20, // Limit the number of connections in the pool
            queueLimit: 0, // No limit on the number of queued connection requests
            waitForConnections: true, // Wait for a connection to be released
            idleTimeoutMillis: 60000 // 60 seconds
        });

        console.log(`Allocated 10 sessions for user: ${user}`);
    }

    req.connectionPool = connectionPools[user]; // Attach the connection pool to the request object
    next();
};

module.exports = connectionManager;
module.exports.connectionPools = connectionPools;