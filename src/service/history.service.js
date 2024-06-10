import History from "../model/history";
import Appointment from "../model/appointment"
import User from "../model/user";
import Code from "../model/code"
import { AppointmentStatusEnum } from "../enum/appointment_status.enum";
import { sendEmail } from "./email.service"

let getAppointmentInfo = (appointmentId) => {
    return new Promise(async (resolve, reject) => {
        try {
            const history = await History.findOne({
                where: {
                    appointmentId: appointmentId
                },
                attributes: {
                    exclude: ['createdAt', 'updatedAt', 'doctorId', 'appointmentId']
                },
                include: [
                    {
                        model: Appointment,
                        as: 'appointmentHistory',
                        attributes: {
                            exclude: ['createdAt', 'updatedAt', 'status', 'expectedTime', 'expectedPosition']
                        } 
                    },
                ]
            });

            if (!history) {
                resolve({
                    errCode: 1,
                    message: "Bác sĩ chưa cập nhật kết quả khám"
                })
            }

            const patient = await User.findOne({
                where: {
                    id: history.appointmentHistory.patientId
                },
                attributes: {
                    exclude: ['password', 'createdAt', 'updatedAt', 'avatar', 'role', 'id', 'username']
                }
            });

            const data = {
                patient: patient,
                history: history
            }

            resolve({
                errCode: 0,
                message: 'OK',
                data: data
            })
        } catch (error) {
            reject(error)
        }
    })
}

let createHistoryAppointment = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const appointment = await History.findOne({
                where: {
                    appointmentId: data.appointmentId
                }
            })

            if (appointment) {
                resolve({
                    errCode: 1,
                    message: 'Kết quả khám đã được cập nhật',
                })
            } else {
                // let files = data.files;
                // if (typeof files !== 'string') {
                //     // Nếu `files` không phải là một chuỗi, chuyển đổi nó thành chuỗi JSON
                //     files = JSON.stringify(files);
                // }

                const result = await History.create({
                    description: data.description,
                    files: data.files,
                    doctorId: data.doctorId,
                    appointmentId: data.appointmentId
                });

                await Appointment.update(
                    { status: AppointmentStatusEnum.COMPLETED },
                    {
                      where: {
                        id: data.appointmentId,
                      },
                    }
                )
    
                resolve({
                    errCode: 0,
                    message: 'OK',
                    data: result
                })
            }
        } catch (error) {
            reject(error)
        }
    })
}

let shareAppointmentInfo = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const code = await Code.findOne({
                where: {
                    appointmentId: data.appointmentId
                },
            });

            const appointment = await Appointment.findOne({
                where: {
                    id: data.appointmentId
                },
                include: [
                    {
                        model: User,
                        as: 'patientAppointment',
                        attributes: ['email']
                    },
                ]
            });

            if (code) {
                await Code.update(
                    { code: data.code },
                    {
                      where: {
                        appointmentId: data.appointmentId,
                      },
                    }
                )

                for (const email of data.emails) {
                    try {
                        const from = 'nguyenchihieu1707@gmail.com';
                        const subject = 'Truy cập kết quả lịch khám';
                        const text = `Mã xác nhận: ${data.code}`
                        await sendEmail(from, email, subject, text, '');
                    } catch (emailError) {
                        console.error('Failed to send email: ', emailError);
                    }
                }       

                resolve({
                    errCode: 1,
                    message: 'Chia sẻ thành công',
                })
            } else {
                const newCode = await Code.create({
                    appointmentId: data.appointmentId,
                    url: data.url,
                    code: data.code,
                });

                for (const email of data.emails) {
                    try {
                        const from = 'nguyenchihieu1707@gmail.com'
                        const subject = 'Truy cập kết quả lịch khám';
                        const text = `Mã xác nhận: ${data.code}`
                        await sendEmail(from, email, subject, text, '')
                    } catch (emailError) {
                        console.error('Failed to send email: ', emailError)
                    }
                }     


                resolve({
                    errCode: 0,
                    message: 'OK',
                })
            }
        } catch (error) {
            reject(error)
        }
    })
}

let checkVerifyCode = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const checkCode = await Code.findOne({
                where: {
                    code: data.code
                },
                raw: true
            });

            if (!checkCode) {
                resolve({
                    errCode: 2,
                    message: "Mã code không hợp lệ",
                    data: {
                        check: false
                    }
                })
            }

            const current = new Date() 
            const createdCodeTime = checkCode.updatedAt

            const isExpired = current.getTime() - createdCodeTime.getTime() > 5 * 60000;

            if (isExpired) {
                resolve({
                    errCode: 1,
                    message: 'Mã code đã hết hạn',
                    data: {
                        check: false,
                    }
                });
            }

            if (checkCode && !isExpired) {
                resolve({
                    errCode: 0,
                    message: 'OK',
                    data: {
                        check: true,
                        url: checkCode.url
                    }
                })
            }
        } catch (error) {
            reject(error)
        }
    })
}

module.exports = {
    getAppointmentInfo,
    createHistoryAppointment,
    shareAppointmentInfo,
    checkVerifyCode
};