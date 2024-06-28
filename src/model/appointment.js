'use strict';
import { AppointmentStatusEnum } from '../enum/appointment_status.enum';
import { DoctorPositionEnum } from '../enum/doctor_position.enum';
import { ExpectedTimeSlotEnum } from '../enum/expected_time_slot.enum';
import Specialty from './specialty';

const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/connectDB');
const User = require('./user')

class Appointment extends Model {}

Appointment.init(
    {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
        },
        status: {
            type: DataTypes.ENUM,
            values: Object.values(AppointmentStatusEnum),
            validate: {
                isIn: {
                  args: [Object.values(AppointmentStatusEnum)],
                  msg: 'Invalid appointment status'
                },
            },
            allowNull: false
        },
        appointmentDate: {
            type: DataTypes.DATE,
            allowNull: false
        },
        expectedTime: {
            type: DataTypes.ENUM,
            values: Object.values(ExpectedTimeSlotEnum),
            validate: {
                isIn: {
                  args: [Object.values(ExpectedTimeSlotEnum)],
                  msg: 'Invalid expected time slot'
                },
            },
            allowNull: false
        },
        examReason: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        healthInsurance: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        expectedPosition: {
            type: DataTypes.ENUM,
            values: Object.values(DoctorPositionEnum),
            validate: {
                isIn: {
                  args: [Object.values(DoctorPositionEnum)],
                  msg: 'Invalid expected position'
                },
            },
            allowNull: false
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
        modelName: 'appointment',
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

User.hasMany(Appointment, {foreignKey:'patientId', sourceKey:'id'})
Appointment.belongsTo(User, {foreignKey:'patientId', targetKey:'id', as:'patientAppointment'})

Specialty.hasMany(Appointment, {foreignKey:'specialtyId', sourceKey:'id'})
Appointment.belongsTo(Specialty, {foreignKey:'specialtyId', targetKey:'id', as:'specialtyAppointment'})

module.exports = Appointment;
