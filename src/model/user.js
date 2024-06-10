'use strict';
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/connectDB');
const { GenderEnum } = require('../enum/gender.enum');
const { RoleEnum } = require('../enum/role.enum');

class User extends Model {}

User.init(
    {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
        },
        fullName: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        email: {
            type: DataTypes.STRING,
            unique: true,
            unique: {
                name: 'unique_email_index'
            },
            allowNull: false,
            validate: {
                notEmpty: true,
                isEmail: true
            }
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        address: {
            type: DataTypes.STRING,
            allowNull: true
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                    is: /([\+84|84|0]+(3|5|7|8|9|1[2|6|8|9]))+([0-9]{8})\b/,
                    msg: 'Invalid phone number !'
                }
            }
        },
        gender: {
            type: DataTypes.ENUM,
            values: Object.values(GenderEnum),
            validate: {
                isIn: {
                  args: [Object.values(GenderEnum)],
                  msg: 'Invalid gender'
                },
            },
            allowNull: false
        },
        birthday: {
            type: DataTypes.DATE,
            allowNull: false
        },
        avatar: {
            type: DataTypes.BLOB('long'),
            allowNull: true,
        },
        role: {
            type: DataTypes.ENUM,
            values: Object.values(RoleEnum),
            validate: {
                isIn: {
                  args: [Object.values(RoleEnum)],
                  msg: 'Invalid role'
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
        modelName: 'User',
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

module.exports = User;
