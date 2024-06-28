'use strict';
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/connectDB');
const { DoctorPositionEnum } = require('../enum/doctor_position.enum');

class Price extends Model {}

Price.init(
    {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,  
            primaryKey: true,
            autoIncrement: true,
        },
        position: {
            type: DataTypes.ENUM,
            values: Object.values(DoctorPositionEnum),
            validate: {
                isIn: {
                  args: [Object.values(DoctorPositionEnum)],
                  msg: 'Invalid doctor position'
                },
            },
            allowNull: false
        },
        price: {
            type: DataTypes.DOUBLE,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: DataTypes.NOW
        }
    },
    {
        sequelize,
        modelName: 'price',
        hooks: {
            beforeCreate: (appointmentDoctor, options) => {
                appointmentDoctor.createdAt = new Date(appointmentDoctor.createdAt.getTime() + 7 * 60 * 60 * 1000);
                appointmentDoctor.updatedAt = new Date(appointmentDoctor.updatedAt.getTime() + 7 * 60 * 60 * 1000);
            },
            beforeUpdate: (appointmentDoctor, options) => {
                appointmentDoctor.updatedAt = new Date(appointmentDoctor.updatedAt.getTime() + 7 * 60 * 60 * 1000);
            }
        }
    }
);

module.exports = Price;
