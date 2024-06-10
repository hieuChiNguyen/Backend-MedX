'use strict';
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/connectDB');
const Appointment = require('./appointment');
const Doctor = require('./doctor');
const User = require('./user');
const { TimeSlotEnum } = require('../enum/time_slot.enum');

class Appointment_Doctor extends Model {}

Appointment_Doctor.init(
    {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        timeSlot: {
            type: DataTypes.ENUM,
            values: Object.values(TimeSlotEnum),
            validate: {
                isIn: {
                  args: [Object.values(TimeSlotEnum)],
                  msg: 'Invalid time slot'
                },
            },
        },
        priority: {
            type: DataTypes.STRING
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
        modelName: 'Appointment_Doctor',
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

Appointment.hasMany(Appointment_Doctor, {foreignKey:'appointmentId', sourceKey:'id'})
Appointment_Doctor.belongsTo(Appointment, {foreignKey:'appointmentId', targetKey:'id', as:'doctorAppointment_appointment'})

Doctor.hasMany(Appointment_Doctor, {foreignKey:'doctorId', sourceKey:'id'})
Appointment_Doctor.belongsTo(Doctor, {foreignKey:'doctorId', targetKey:'id', as:'doctorAppointment_doctor'})

User.hasMany(Appointment_Doctor, {foreignKey:'createBy', sourceKey:'id'})
Appointment_Doctor.belongsTo(Doctor, {foreignKey:'createBy', targetKey:'id', as:'receptionist'})

module.exports = Appointment_Doctor;
