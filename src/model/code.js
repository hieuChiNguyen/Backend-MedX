'use strict';
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/connectDB');
const Appointment = require('../model/appointment');

class Code extends Model {}

Code.init(
    {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,  
            primaryKey: true,
            autoIncrement: true
        },
        code: {
            type: DataTypes.STRING,
            allowNull: true
        },
        url: {
            type: DataTypes.STRING,
            allowNull: true
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
        modelName: 'code',
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

Appointment.hasMany(Code, {foreignKey:'appointmentId', sourceKey:'id'})
Code.belongsTo(Appointment, {foreignKey:'appointmentId', targetKey:'id', as:'appointmentCode'})

module.exports = Code;
