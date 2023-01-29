module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define("users", {
        userid: {
            type: Sequelize.UUID,
            primaryKey: true,
            defaultValue: Sequelize.UUIDV4,
        },
        username: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: { len: 6 },
        },
        //email: {
        //    type: Sequelize.STRING,
        //    allowNull: false,
        //    unique: true,
        //    validate: {
        //        isEmail: true,
        //        notNull: {
        //            msg: 'Please enter your email'
        //        }
        //    }
        //},
        password: {
            type: Sequelize.STRING,
            allowNull: false
        },
        isactive: {
            type: Sequelize.BOOLEAN,
            defaultValue: true
        },
        isdeleted: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        plaintextpassword: {
            type: Sequelize.STRING,
            defaultValue: false
        }
    });

    return User;
};
