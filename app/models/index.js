const config = require("../config/db.config.js");
const Sequelize = require("sequelize");
const sequelize = new Sequelize(
    config.DB,
    config.USER,
    config.PASSWORD,
    {
        host: config.HOST,
        dialect: config.dialect,
        pool: {
            max: config.pool.max,
            min: config.pool.min,
            acquire: config.pool.acquire,
            idle: config.pool.idle
        },
        //logging: true
    }
);
const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.user = require("../models/user.model.js")(sequelize, Sequelize);
db.role = require("../models/role.model.js")(sequelize, Sequelize);
db.customers = require("../models/customer.model.js")(sequelize, Sequelize);
db.customerfiles = require("../models/customer.files.model.js")(sequelize, Sequelize);
db.customerfolders = require("../models/customer.folders.model.js")(sequelize, Sequelize);
db.appsettings = require("../models/app.settings.modal.js")(sequelize, Sequelize);
db.role.belongsToMany(db.user, {
    through: "user_roles",
    foreignKey: "roleid",
    otherKey: "userid"
});
db.user.belongsToMany(db.role, {
    through: "user_roles",
    foreignKey: "userid",
    otherKey: "roleid"
});
db.ROLES = ["admin", "customer"];
module.exports = db;
    