const { connectionPools } = require('../middleware/connectionManager');

module.exports = (req, res, next) => {
    const username = req.session?.user?.username || 'Anonymous';
    const dbUser = req.session?.dbCredentials?.user;
    const sessionID = req.sessionID; // Unique session ID for this session
    const poolKey = dbUser ? `${dbUser}_${sessionID}` : null; // Key for session-specific pool

    console.log(`User logged out: ${username} (Session: ${sessionID})`);

    const userPool = poolKey ? connectionPools[poolKey] : null;

    if (poolKey && userPool) {
        console.log(`Closing connection pool for ${poolKey}`);
        userPool.end((err) => {
            if (err) {
                console.error(`Error closing connection pool for ${poolKey}:`, err);
            } else {
                console.log(`Successfully closed connection pool for ${poolKey}`);
            }

            delete connectionPools[poolKey];
            console.log(`Connection pools remaining after logout: ${JSON.stringify(Object.keys(connectionPools))}`);

            req.session.destroy((err) => {
                if (err) {
                    console.error('Error destroying session:', err);
                    return res.status(500).send('Error logging out.');
                }
                console.log(`Session destroyed for ${username} (Session: ${sessionID})`);
                res.clearCookie('jwt');
                res.clearCookie('schoolName');
                res.clearCookie('username');
                res.clearCookie('session_cookie');
                return res.redirect('/');
            });
        });
    } else {
        console.log(`No pool found for ${poolKey}, destroying session for ${username}`);
        req.session.destroy((err) => {
            if (err) {
                console.error('Error destroying session:', err);
                return res.status(500).send('Error logging out.');
            }
            console.log(`Session destroyed for ${username} (Session: ${sessionID})`);
            res.clearCookie('jwt');
            res.clearCookie('schoolName');
            res.clearCookie('username');
            res.clearCookie('session_cookie');
            return res.redirect('/');
        });
    }
};