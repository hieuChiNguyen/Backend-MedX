'use strict';
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/connectDB');
const District = require('./district');

class Ward extends Model {}

Ward.init(
    {
        id: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            primaryKey: true
        },
        fullName: {
            type: DataTypes.STRING,
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
        modelName: 'ward',
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

District.hasMany(Ward, {foreignKey:'districtId', sourceKey:'id'})
Ward.belongsTo(District, {foreignKey:'districtId', targetKey:'id', as:'district'})

module.exports = Ward;
