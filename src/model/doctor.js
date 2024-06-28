'use strict';
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/connectDB');
const User = require('./user');
const Specialty = require('./specialty');
const Room = require('./room');
const { DoctorPositionEnum } = require('../enum/doctor_position.enum');
const { DoctorStatusEnum } = require('../enum/doctor_status.enum');

class Doctor extends Model {}

// Save doctor's information that user don't have
Doctor.init(
    {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
        },
        price: {
            type: DataTypes.DOUBLE
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
        status: {
            type: DataTypes.ENUM,
            values: Object.values(DoctorStatusEnum),
            validate: {
                isIn: {
                  args: [Object.values(DoctorStatusEnum)],
                  msg: 'Invalid doctor status'
                },
            },
            allowNull: false
        },
        citizenCard: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT
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
        modelName: 'doctor',
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

User.hasOne(Doctor,{foreignKey:'userId', sourceKey:'id'})
Doctor.belongsTo(User,{foreignKey:'userId', targetKey:'id', as:'doctorInformation'})

Specialty.hasMany(Doctor, {foreignKey:'specialtyId', sourceKey:'id'})
Doctor.belongsTo(Specialty, {foreignKey:'specialtyId', ta:'id', as:'doctorSpecialty'})

Room.hasOne(Doctor, {foreignKey:'roomId', sourceKey:'id'})
Doctor.belongsTo(Room, {foreignKey:'roomId', ta:'id', as:'doctorRoom'})

module.exports = Doctor;
