'use strict';
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/connectDB');
const Doctor = require('./doctor');
const Appointment = require('./appointment');

class History extends Model {}

History.init(
    {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        files: {
            type: DataTypes.TEXT,
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
        modelName: 'history',
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

Doctor.hasMany(History, {foreignKey:'doctorId', sourceKey:'id'})
History.belongsTo(Doctor, {foreignKey:'doctorId', targetKey:'id', as:'doctorHistory'})

Appointment.hasMany(History, {foreignKey:'appointmentId', sourceKey:'id'})
History.belongsTo(Appointment, {foreignKey:'appointmentId', targetKey:'id', as:'appointmentHistory'})

module.exports = History;
