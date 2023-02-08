
module.exports = (sequelize, Sequelize) => {
    const MetalInfos = sequelize.define("metalinfos", {
        metalinfoid: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        metaltypeid: {
            type: Sequelize.INTEGER,
            references: {
                model: 'metaltypes',
                key: 'metaltypeid',
            },
            allowNull: false,
        },
        mastervalue: {
            type: Sequelize.TEXT,
            allowNull: false
        },
        childvalue: {
            type: Sequelize.TEXT,
            allowNull: false
        }
        
    });
    return MetalInfos;
};
