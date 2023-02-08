
module.exports = (sequelize, Sequelize) => {
    const MetalTypes = sequelize.define("metaltypes", {
        metaltypeid: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        metaltype: {
            type: Sequelize.STRING,
            allowNull: false
        }
        
    });
    return MetalTypes;
};
