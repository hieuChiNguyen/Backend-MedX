const { Sequelize } = require('sequelize');
require('dotenv').config()
// const sequelize = new Sequelize('medx', 'root', null, {
//     host: 'localhost',
//     dialect: 'mysql',
//     logging: false
// });

const sequelize = new Sequelize(
    process.env.DB_NAME || 'medx', // Tên cơ sở dữ liệu
    process.env.DB_USERNAME || 'root', // Tên người dùng
    process.env.DB_PASSWORD || null,   // Mật khẩu
    {
        host: process.env.DB_HOST || 'localhost', // Địa chỉ host
        port: process.env.DB_PORT || 3306,        // Cổng kết nối
        dialect: process.env.DB_DATABASE || 'mysql',
        logging: false
    }
);

module.exports = sequelize
