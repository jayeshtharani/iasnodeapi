module.exports = (sequelize, Sequelize) => {
    const SubCustomers = sequelize.define("subcustomers", {
        subcustomerid: {
            type: Sequelize.UUID,
            primaryKey: true,
            defaultValue: Sequelize.UUIDV4,
        },
        customerid: {
            type: Sequelize.UUID,
            references: {
                model: 'customers',
                key: 'customerid',
            },
            allowNull: false,
        },
        firstname: {
            type: Sequelize.STRING,
            allowNull: false
        },
        lastname: {
            type: Sequelize.STRING,
            allowNull: true
        },
        email: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                isEmail: true
            }
        },
        phone: {
            type: Sequelize.STRING,
            allowNull: true
        },
        designation: {
            type: Sequelize.STRING,
            allowNull: true
        },
        isactive: {
            type: Sequelize.BOOLEAN,
            defaultValue: true
        },
        isdeleted: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        }
    });
    return SubCustomers;
};
