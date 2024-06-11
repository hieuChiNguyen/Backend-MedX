import Appointment_Doctor from "../model/appointment_doctor"
import Doctor from "../model/doctor"
import Appointment from "../model/appointment"
import User from "../model/user"
import Schedule from "../model/schedule"
import { AppointmentStatusEnum } from "../enum/appointment_status.enum"
import formatDate from "../utils/format"
import { DoctorStatusEnum } from "../enum/doctor_status.enum"
import { Op } from "sequelize"

let calculatePatientAge = (birthDateString) => {
    const today = new Date();
    const birthDate = new Date(birthDateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    return age;
}

let addDoctorToAppointment = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            let doctor = await Doctor.findOne({
                where: { 
                    id: data.doctorId,
                    status: DoctorStatusEnum.ACTIVE
                }
            })

            const appointmentDoctor = await Appointment_Doctor.findOne({
                where: {
                    appointmentId: data.appointmentId
                }
            })

            const schedule = await Schedule.findOne({
                where: {
                    [Op.and]: [
                        { date: new Date(data.date) },
                        { timeSlot: data.timeSlot },
                        { doctorId: data.doctorId }
                    ]
                }
            })

            const appointment =  await Appointment.findOne({
                where: { 
                    id: data.appointmentId
                },
                include: [
                    {
                        model: User,
                        required: true,
                        as: 'patientAppointment',
                        attributes: ['createdAt', 'updatedAt', 'password'] 
                    },
                ]
            })

            const patient = await User.findOne({
                where: { id: appointment.patientId }
            })

            let priority = 0
            const patientAge = calculatePatientAge(patient.birthday)

            if (patientAge <= 10 || patientAge >= 70) {
                priority = 1
            } else if ((10 < patientAge && patientAge <= 15) || 60 <= patientAge && patientAge < 70 ) {
                priority = 2
            } else {
                priority = 3
            }

            if (!doctor) {
                resolve({
                    errCode: 1,
                    message: 'Không tìm thấy bác sĩ'
                })
            }

            if (appointmentDoctor) {
                resolve({
                    errCode: 2,
                    message: 'Lịch khám đã có bác sĩ'
                })
            }

            if (!schedule) {
                resolve({
                    errCode: 3,
                    message: 'Bác sĩ không đăng ký lịch khám này'
                })
            }

            if (schedule?.currentNumber >= 2) {
                resolve({
                    errCode: 4,
                    message: 'Lịch khám đã đủ số lượng'
                })
            }

            if (doctor && (!appointmentDoctor) && (schedule?.currentNumber < 2)) {
                let new_appointment_doctor = await Appointment_Doctor.create({
                    doctorId: data.doctorId,
                    appointmentId: data.appointmentId,
                    date: data.date,
                    timeSlot: data.timeSlot,
                    createBy: data.createBy,
                    priority: priority
                });

                let updated = await Appointment.update(
                    { status: AppointmentStatusEnum.ACCEPTED },
                    {
                      where: {
                        id: data.appointmentId,
                      },
                    }
                )

                let _updated = await Schedule.update(
                    { currentNumber: schedule.currentNumber + 1 },
                    {
                      where: {
                        id: schedule.id,
                      },
                    }
                )

                resolve({
                    errCode: 0,
                    message: 'OK',
                    data: new_appointment_doctor
                }); 
            }
        } catch (error) {
            reject(error);
        }
    });
}

let getAllAppointmentsByDoctorId = (doctorId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let allAppointments = [];

            allAppointments = await Appointment_Doctor.findAll({
                where: {
                    doctorId: doctorId
                },
                attributes: {
                    exclude: ['createdAt', 'updatedAt']
                },
                include: [
                    {
                        model: Appointment,
                        required: true,
                        as: 'doctorAppointment_appointment',
                        attributes: {
                            exclude: ['createdAt', 'updatedAt']
                        } 
                    },
                ]
            });

            resolve({
                errCode: 0,
                message: 'OK',
                data: allAppointments
            })
        } catch (error) {
            reject(error)
        }
    })
}

module.exports = {
    addDoctorToAppointment,
    getAllAppointmentsByDoctorId
};
