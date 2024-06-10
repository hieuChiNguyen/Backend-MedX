'use strict';
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/connectDB');
const Doctor = require('./doctor');
const { TimeSlotEnum } = require('../enum/time_slot.enum');

class Schedule extends Model {}

Schedule.init(
    {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        currentNumber: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        maxNumber: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        timeSlot: {
            type: DataTypes.ENUM,
            values: Object.values(TimeSlotEnum),
            // values: [
            //     '08:00 AM - 08:30 AM', '08:30 AM - 09:00 AM', '09:00 AM - 09:30 AM', '09:30 AM - 10:00 AM',
            //     '10:00 AM - 10:30 AM', '10:30 AM - 11:00 AM', '11:00 AM - 11:30 AM', '11:30 AM - 12:00 AM',
            //     '01:00 PM - 01:30 PM', '01:30 PM - 02:00 PM', '02:00 PM - 02:30 PM', '02:30 PM - 03:00 PM',
            //     '03:00 PM - 03:30 PM', '03:30 PM - 04:00 PM', '04:00 PM - 04:30 PM', '04:30 PM - 05:00 PM',
            // ]
            validate: {
                isIn: {
                  args: [Object.values(TimeSlotEnum)],
                  msg: 'Invalid time slot'
                },
            },
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
        modelName: 'Schedule',
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

Doctor.hasMany(Schedule, {foreignKey:'doctorId', sourceKey:'id'})
Schedule.belongsTo(Doctor, {foreignKey:'doctorId', targetKey:'id', as:'doctorSchedule'})

module.exports = Schedule;
