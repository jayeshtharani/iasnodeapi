const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const db = require("../models");
const User = db.user;

verifyToken = (req, res, next) => {
    let token = req.headers["x-access-token"];

    if (!token) {
        return res.status(403).send({
            data: null,
            message: "No token provided!"
        });
    }

    jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
            return res.status(401).send({
                data: null,
                message: "Unauthorized!"
            });
        }
        //req.userid = decoded.id.userid;
        req.userid = decoded.data[0].id;
        next();
    });
};

isAdmin = (req, res, next) => {
    User.findByPk(req.userid).then(user => {
        user.getRoles().then(roles => {
            for (let i = 0; i < roles.length; i++) {
                if (roles[i].name === "admin") {
                    next();
                    return;
                }
            }
            return res.status(403).send({
                data: null,
                message: "Require Admin Role!"
            });

        });
    });
};

isCustomer = (req, res, next) => {
    User.findByPk(req.userid).then(user => {
        user.getRoles().then(roles => {
            for (let i = 0; i < roles.length; i++) {
                if (roles[i].name === "customer") {
                    next();
                    return;
                }
            }
            return res.status(403).send({
                data: null,
                message: "Require Customer Role!"
            });

        });
    });
};




const authJwt = {
    verifyToken: verifyToken,
    isAdmin: isAdmin,
    isCustomer: isCustomer

};
module.exports = authJwt;
