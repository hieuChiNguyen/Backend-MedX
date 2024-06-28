const { Sequelize } = require('sequelize');
require('dotenv').config()
// const sequelize = new Sequelize('medx', 'root', null, {
//     host: 'localhost',
//     dialect: 'mysql',
//     logging: false
// });

const sequelize = new Sequelize(
    process.env.DB_NAME || 'medx', 
    process.env.DB_USERNAME || 'root', 
    process.env.DB_PASSWORD || null,  
    {
        host: process.env.DB_HOST || 'localhost', 
        port: process.env.DB_PORT || 3306,       
        dialect: process.env.DB_DATABASE || 'mysql',
        logging: false
    }
);

module.exports = sequelize
