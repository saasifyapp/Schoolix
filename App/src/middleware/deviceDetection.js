const deviceDetection = (req, res, next) => {
    const userAgent = req.headers['user-agent'];
    const isMobile = /Mobi|Android/i.test(userAgent);

    // Log the user agent and the type of device detected only for the root URL
    if (req.path === '/') {
        if (isMobile) {
           // console.log(`Mobile device detected: ${userAgent}`);
            res.status(403).send('Access denied. Please use a desktop browser.');
        } else {
            //console.log(`Desktop device detected: ${userAgent}`);
            next();
        }
    } else {
        next();
    }
};


module.exports = deviceDetection;