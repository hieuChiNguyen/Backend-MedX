'use strict';
const { DataTypes, Model } = require('sequelize')
const sequelize = require('../config/connectDB')
const Doctor = require('./doctor')
const Specialty = require('./specialty')

class Markdown extends Model {}

Markdown.init(
    {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
        },
        contentHTML: {
            type: DataTypes.TEXT('long'),
            allowNull: true
        },
        contentMarkdown: {
            type: DataTypes.TEXT('long'),
            allowNull: true
        },
        description: {
            type: DataTypes.TEXT('long'),
            allowNull: true,
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
        modelName: 'markdown',
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

Doctor.hasMany(Markdown, {foreignKey:'doctorId', sourceKey:'id'})
Markdown.belongsTo(Doctor, {foreignKey:'doctorId', targetKey:'id', as:'doctorMarkdown', onDelete:'CASCADE'})

Specialty.hasMany(Markdown, {foreignKey:'specialtyId', sourceKey:'id'})
Markdown.belongsTo(Specialty, {foreignKey:'specialtyId', targetKey:'id', as:'specialtyMarkdown', onDelete:'CASCADE'})

module.exports = Markdown;
