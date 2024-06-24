import { Op, where } from "sequelize";
import { AppointmentStatusEnum } from "../enum/appointment_status.enum";
import Appointment from "../model/appointment";
import Price from "../model/price";
import Specialty from "../model/specialty";
import User from "../model/user";

let createNewAppointment = (appointmentData) => {
    return new Promise(async (resolve, reject) => {
        try {
            let newAppointment = await Appointment.create({
                patientId: appointmentData.patientId,
                examReason: appointmentData.examReason,
                expectedTime: appointmentData.expectedTime,
                appointmentDate: appointmentData.appointmentDate,
                healthInsurance: appointmentData.healthInsurance,
                expectedPosition: appointmentData.expectedPosition,
                specialtyId: appointmentData.specialtyId,
                status: AppointmentStatusEnum.NEW
            });

            if (newAppointment) {
                resolve({
                    errCode: 0,
                    message: 'OK',
                    data: newAppointment
                });
            } else {
                resolve({
                    errCode: 1,
                    message: 'Đặt lịch thất bại.'
                })
            }
        } catch (error) {
            reject(error);
        }
    });
}

let getPrices = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let prices = '';

            prices = await Price.findAll({
                attributes: ['position', 'price']
            });

            resolve({
                errCode: 0,
                message: 'OK',
                data: prices
            })
        } catch (error) {
            reject(error)
        }
    })
}

let getAllAppointments = (status, specialty, start, end) => {
    return new Promise(async (resolve, reject) => {
        try {
            let whereClause = {};

            if (status === 'new') {
                whereClause.status = 'Lịch hẹn mới';
            } else if (status === 'accepted') {
                whereClause.status = 'Đã xác nhận';
            } else if (status === 'completed') {
                whereClause.status = 'Đã khám xong';
            } else if (status === 'cancel') {
                whereClause.status = 'Đã hủy';
            }

            if (specialty !== 'all' && specialty !== undefined) {
                whereClause.specialtyId = specialty
            }

            if (start && !end) {
                whereClause.appointmentDate = {
                    [Op.and]: {
                        [Op.gte]: new Date(start),
                    }
                };
            }

            if (end && !start) {
                whereClause.appointmentDate = {
                    [Op.and]: {
                        [Op.lte]: new Date(end)  
                    }
                };
            }

            if (start && end) {
                whereClause.appointmentDate = {
                    [Op.and]: {
                        [Op.gte]: new Date(start),
                        [Op.lte]: new Date(end)   
                    }
                };
            }

            const appointments = await Appointment.findAll({
                where: whereClause,
                include: [
                    {
                        model: User,
                        required: true,
                        as: 'patientAppointment',
                        attributes: ['id', 'fullName', 'email', 'gender', 'role', 'phone', 'address'] 
                    }
                ]
            });

            const length = appointments.length

            resolve({
                errCode: 0,
                message: 'OK',
                data: appointments,
                length: length
            })
        } catch (error) {
            reject(error)
        }
    })
}

let getAppointmentById = (appointmentId) => {
    return new Promise(async (resolve, reject) => {
        try {
            const appointment = await Appointment.findOne({
                where: {
                    id: appointmentId
                },
                include: [
                    {
                        model: User,
                        require: true,
                        as: 'patientAppointment',
                        attributes: ['id', 'fullName', 'email', 'gender', 'role', 'phone', 'address'] 
                    },
                    {
                        model: Specialty,
                        require: true,
                        as: 'specialtyAppointment',
                        attributes: ['id', 'nameVi', 'nameEn'] 
                    }
                ]
            });

            resolve({
                errCode: 0,
                message: 'OK',
                data: appointment
            })
        } catch (error) {
            reject(error)
        }
    })
}

let getAppointmentsByPatientId = (patientId) => {
    return new Promise(async (resolve, reject) => {
        try {
            const appointments = await Appointment.findAll({
                where: {
                    patientId: patientId
                },
                include: [
                    {
                        model: Specialty,
                        as: 'specialtyAppointment',
                        attributes: {
                            exclude: ['createdAt', 'updatedAt']
                        } 
                    }
                ],
                order: [
                    ['createdAt', 'DESC']
                ]
            });

            if (appointments) {
                resolve({
                    errCode: 0,
                    message: 'OK',
                    data: appointments
                })
            } else {
                resolve({
                    errCode: 1,
                    message: 'Chưa có lịch khám nào.',
                })
            }
        } catch (error) {
            reject(error)
        }
    })
}

let cancelAppointment = (appointmentId) => {
    return new Promise(async (resolve, reject) => {
        try {
            await Appointment.update(
                { status: AppointmentStatusEnum.CANCEL },
                {
                  where: {
                    id: appointmentId,
                  },
                }
            )

            resolve({
                errCode: 0,
                message: 'OK',
            })
        } catch (error) {
            reject(error)
        }
    })
}

module.exports = {
    createNewAppointment,
    getPrices,
    getAllAppointments,
    getAppointmentById,
    getAppointmentsByPatientId,
    cancelAppointment
};
