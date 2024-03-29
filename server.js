//https://codeforgeek.com/a-guide-to-securing-node-js-applications/
const https = require("https");
var http = require('http');
const express = require("express");
const fs = require('fs');
//prod
var privateKey = fs.readFileSync('/var/www/html/indo-aerospace.key', 'utf8');
var certificate = fs.readFileSync('/var/www/html/indo-aerospace.com.crt', 'utf8');
var credentials = { key: privateKey, cert: certificate };

const cors = require("cors");
const helmet = require('helmet');
const compression = require('compression');
const winston = require('winston');
require('dotenv').config();
const dev = process.env.NODE_ENV !== 'production';
const PORT = process.env.NODE_PORT || 8080;
const ROOT_URL = process.env.APP_URL + PORT + "/";
const app = express();
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: '30mb', }));
//app.use(cors());

//if (!dev) {
//    server.set('trust proxy', 1);
//}
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Expose-Headers', 'Content-Length');
    res.header('Access-Control-Allow-Headers', 'x-access-token, Origin, Accept, Authorization, Content-Type, X-Requested-With, multipart/form-data"');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    } else {
        return next();
    }
});

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'user-service' },
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
    ],
});
logger.add(new winston.transports.Console({
    format: winston.format.simple(),
}));

const db = require("./app/models");
const Role = db.role;
const AppSettings = db.appsettings;
const MetalTypes = db.metaltypes;
db.sequelize.sync();

//db.sequelize.sync({ force: true }).then(() => {
//    console.log('Drop and Resync Database with { force: true }');
//    initial();
//});
require('./app/routes/auth.routes')(app);
require('./app/routes/customer.routes')(app);
require('./app/routes/admin.routes')(app);
require('./app/routes/metal.routes')(app);
require('./app/routes/upload.routes')(app);
//prod
var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);
httpServer.listen(8080);
httpsServer.listen(8443);

//development
//app.listen(PORT, (err) => {
//    if (err) console.log(err);
//    console.log(`Server is running on port ${PORT}.`);
//    console.log(process.env.NODE_ENV);
//});


function initial() {
    MetalTypes.create({
        metaltype: "ALUMINIUM"
    });
    MetalTypes.create({
        metaltype: "STAINLESS STEEL"
    });
    MetalTypes.create({
        metaltype: "Carbon Steel"
    });
    MetalTypes.create({
        metaltype: "AIRCRAFT ALLOYS"
    });
    MetalTypes.create({
        metaltype: "SUPER ALLOYS"
    });
    MetalTypes.create({
        metaltype: "ELECTRICAL STEEL"
    });
    MetalTypes.create({
        metaltype: "BRASS"
    });

    Role.create({
        roleid: 1,
        name: "admin"
    });
    Role.create({
        roleid: 2,
        name: "customer"
    });

    AppSettings.create({
        appkey: "smtpport",
        appvalue: "25"
    });

    AppSettings.create({
        appkey: "smtpuser",
        appvalue: "jayeshtharani@gmail.com"
    });

    AppSettings.create({
        appkey: "smtpkey",
        appvalue: ""
    });

    AppSettings.create({
        appkey: "passsecretkey",
        appvalue: ""
    });
}