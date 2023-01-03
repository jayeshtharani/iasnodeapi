
module.exports = (sequelize, Sequelize) => {
    const AppSettings = sequelize.define("appsettings", {
        appsettingid: {
            type: Sequelize.UUID,
            primaryKey: true,
            defaultValue: Sequelize.UUIDV4,
        },
        appkey: {
            type: Sequelize.STRING,
            allowNull: false
        },
        appvalue: {
            type: Sequelize.STRING,
            allowNull: false
        },
        
    });
    return AppSettings;
};
