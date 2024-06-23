// logoutManager.js
module.exports = (req, res, next) => {
    // Log the username of the user logging out
    console.log('User logged out:', req.session.user?.username);

    // If the user has a userConnectionPool, end it
    if (req.session.userConnectionPool) {
        req.session.userConnectionPool.end((err) => {
            if (err) {
                console.error('Error closing MySQL connection:', err);
            } else {
                console.log('User-specific database disconnected on signout.');
            }

            // Destroy the session after closing the connection pool
            req.session.destroy((err) => {
                if (err) {
                    console.error('Error destroying session:', err);
                    // Send a response to indicate error in session destruction
                    res.status(500).send('Error logging out.');
                } else {
                    // Clear cookies after session is destroyed
                    res.clearCookie('jwt');
                    res.clearCookie('schoolName');
                    res.clearCookie('username');
                    res.clearCookie('session_cookie');
                    // Redirect to the home page
                    res.redirect('/');
                }
            });
        });
    } else {
        // If there's no userConnectionPool, just destroy the session
        req.session.destroy((err) => {
            if (err) {
                console.error('Error destroying session:', err);
                // Send a response to indicate error in session destruction
                res.status(500).send('Error logging out.');
            } else {
                // Clear cookies after session is destroyed
                res.clearCookie('jwt');
                res.clearCookie('schoolName');
                res.clearCookie('username');
                res.clearCookie('session_cookie');
                // Redirect to the home page
                res.redirect('/');
            }
        });
    }
};
