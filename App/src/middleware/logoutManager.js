const { connectionPools } = require('../middleware/connectionManager');

module.exports = (req, res, next) => {
    const username = req.session?.user?.username || 'Anonymous';
    const dbUser = req.session?.dbCredentials?.user;

    console.log(`User logged out: ${username}`);

    const userPool = connectionPools[dbUser];

    if (dbUser && userPool) {
        userPool.end((err) => {
            if (err) {
                console.error('Error closing connection pool:', err);
            }

            delete connectionPools[dbUser];
            console.log(`Connection pools remaining after logout: ${JSON.stringify(Object.keys(connectionPools))}`);

            req.session.destroy((err) => {
                if (err) {
                    console.error('Error destroying session:', err);
                    return res.status(500).send('Error logging out.');
                }
                res.clearCookie('jwt');
                res.clearCookie('schoolName');
                res.clearCookie('username');
                res.clearCookie('session_cookie');
                return res.redirect('/');
            });
        });
    } else {
        req.session.destroy((err) => {
            if (err) {
                console.error('Error destroying session:', err);
                return res.status(500).send('Error logging out.');
            }
            res.clearCookie('jwt');
            res.clearCookie('schoolName');
            res.clearCookie('username');
            res.clearCookie('session_cookie');
            return res.redirect('/');
        });
    }
};