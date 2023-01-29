module.exports = (sequelize, Sequelize) => {
    const Customer = sequelize.define("customers", {
        customerid: {
            type: Sequelize.UUID,
            primaryKey: true,
            defaultValue: Sequelize.UUIDV4,
        },
        companyname: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: { len: 6 },
        },
        companyphone: {
            type: Sequelize.STRING,
            allowNull: true
        },
        companyaddress: {
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
        },
        userid: {
            type: Sequelize.UUID,
            references: {
                model: 'users',
                key: 'userid',
            },
            allowNull: false,
        },
        rootfoldername: {
            type: Sequelize.STRING
        }
    });
    return Customer;
};
