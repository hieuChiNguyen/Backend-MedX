const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('medx', 'root', null, {
    host: 'localhost',
    dialect: 'mysql',
    logging: false
});

module.exports = sequelize
