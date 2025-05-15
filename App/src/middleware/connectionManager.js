const mysql = require('mysql'); // Use mysql2 for idleTimeoutMillis support
const connectionPools = {}; // Object to store connection pools keyed by dbUser_sessionID

// Middleware to set dbCredentials and create the connection pool if it doesn't exist
const connectionManager = (req, res, next) => {
    const dbCredentials = req.session.dbCredentials;

    if (!dbCredentials) {
        return next(new Error('No dbCredentials found in session.'));
    }

    const dbUser = dbCredentials.user;
    const sessionID = req.sessionID; // Unique session ID for this session
    const poolKey = `${dbUser}_${sessionID}`; // Key pools by dbUser and sessionID

    // Create or reuse connection pool based on dbUser_sessionID
    if (!connectionPools[poolKey]) {
        console.log('');
        console.log(`============ LOGIN ATTEMPT :- ${dbUser} ===============`);
        console.log(`Creating new connection pool for ${poolKey}`);

        // Create new connection pool
        const poolConfig = {
            host: dbCredentials.host,
            user: dbCredentials.user,
            password: dbCredentials.password,
            database: dbCredentials.database,
            connectionLimit: 10, // Reduced to 10 to avoid hitting max_user_connections
            queueLimit: 0, // No limit on queued connection requests
            waitForConnections: true, // Wait for a connection to be released
            idleTimeout: 60000 // 60 seconds
        };
        //console.log(`Pool config for ${poolKey}:`, poolConfig);

        connectionPools[poolKey] = mysql.createPool(poolConfig);

        console.log(`Allocated 10 connections for ${poolKey}`);
        console.log(`Active pools: ${JSON.stringify(Object.keys(connectionPools))}`);
    }

    req.connectionPool = connectionPools[poolKey]; // Attach the connection pool to the request object
    next();
};

module.exports = connectionManager;
module.exports.connectionPools = connectionPools;