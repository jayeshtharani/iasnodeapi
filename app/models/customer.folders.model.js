module.exports = (sequelize, Sequelize) => {
    const CustomerFolders = sequelize.define("customerfolders", {
        customerfolderid: {
            type: Sequelize.UUID,
            primaryKey: true,
            defaultValue: Sequelize.UUIDV4,
        },
        foldername: {
            type: Sequelize.STRING,
            allowNull: false
        },
        isdeleted: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
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
    return CustomerFolders;
};
