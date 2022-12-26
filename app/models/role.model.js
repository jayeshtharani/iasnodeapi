module.exports = (sequelize, Sequelize) => {
    const Role = sequelize.define("roles", {
        roleid: {
            type: Sequelize.INTEGER,
            primaryKey: true
        },
        name: {
            type: Sequelize.STRING
        }
    });

    return Role;
};
