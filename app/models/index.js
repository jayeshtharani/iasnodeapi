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
db.subcustomers = require("../models/subcustomer.model.js")(sequelize, Sequelize);
db.appsettings = require("../models/app.settings.modal.js")(sequelize, Sequelize);
db.metaltypes = require("../models/metaltypes.modal.js")(sequelize, Sequelize);
db.metalinfos = require("../models/metalinfo.modal.js")(sequelize, Sequelize);
db.clearanceitems = require("../models/clearanceitems.modal.js")(sequelize, Sequelize);
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
    