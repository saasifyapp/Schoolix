const cron = require('node-cron');
const http = require('http');

module.exports = function () {
    // Define the cron schedule (every 25 minutes)
    cron.schedule('*/25 * * * *', () => {
        // Make an HTTP request to your own application
        const options = {
            hostname: 'localhost', // or your domain
            port: 3000, // or your port
            path: '/ping', // or any route you want to hit
            method: 'GET'
        };

        const req = http.request(options, (res) => {
            console.log(`Ping status code: ${res.statusCode}`);
        });

        req.on('error', (error) => {
            console.error(`Error making ping request: ${error}`);
        });

        req.end();
    });
};



http.createServer(function (req, res) {
    res.write("I'm Alive!");
    res.end();    
}).listen(8080);