
module.exports = (sequelize, Sequelize) => {
    const Customer = sequelize.define("customers", {
        customerid: {
            type: Sequelize.UUID,
            primaryKey: true,
            defaultValue: Sequelize.UUIDV4,
        },
        companyname: {
            type: Sequelize.STRING,
            allowNull: false
        },
        companyphone: {
            type: Sequelize.STRING
        },
        companyemail: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        companyaddress: {
            type: Sequelize.STRING
        },
        cpfirstname: {
            type: Sequelize.STRING
            //,allowNull: false
        },
        cplastname: {
            type: Sequelize.STRING,
            //allowNull: false
        },
        cpgenderid: {
            type: Sequelize.TINYINT,
            allowNull: true,
            defaultValue: '1'
        },
        cpemail: {
            type: Sequelize.STRING,
            allowNull: true
        },
        cpphone: {
            type: Sequelize.STRING
        },
        cpdob: {
            type: Sequelize.DATEONLY,
            allowNull: true,
            defaultValue: Sequelize.NOW
        },
        cpnotes: {
            type: Sequelize.STRING
        },
        isactive: {
            type: Sequelize.BOOLEAN,
            defaultValue: true
        },
        isdeleted: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        profilepic: {
            type: Sequelize.STRING,
            defaultValue: '',
            allowNull: true
        },
        userid: {
            type: Sequelize.UUID,
            references: {
                model: 'users',
                key: 'userid',
            },
            allowNull: false,
            unique: true,
        },
        rootfoldername: {
            type: Sequelize.STRING
        }
    });
    return Customer;
};
