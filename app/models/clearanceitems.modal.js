module.exports = (sequelize, Sequelize) => {
    const ClearanceItems = sequelize.define("clearanceitems", {
        clearanceitemid: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        itemname: {
            type: Sequelize.TEXT,
            allowNull: false
        },
        itemdescription: {
            type: Sequelize.TEXT,
            allowNull: true
        },
        itembatch: {
            type: Sequelize.TEXT,
            allowNull: true
        },
        filename: {
            type: Sequelize.TEXT,
            allowNull: false
        }
        
    });
    return ClearanceItems;
};
