
module.exports = (sequelize, Sequelize) => {
    const CustomerFiles = sequelize.define("customerfiles", {
        customerfileid: {
            type: Sequelize.UUID,
            primaryKey: true,
            defaultValue: Sequelize.UUIDV4,
        },
        customerfilepath: {
            type: Sequelize.STRING,
            allowNull: false
        },
        customerfilename: {
            type: Sequelize.STRING,
            allowNull: false
        },
        filetags: {
            type: Sequelize.STRING
        },

        isdeleted: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        customerfolderid: {
            type: Sequelize.UUID,
            allowNull: true,
        },
        customerid: {
            type: Sequelize.UUID,
            references: {
                model: 'customers',
                key: 'customerid',
            },
            allowNull: false,
        }
    });
    return CustomerFiles;
};
