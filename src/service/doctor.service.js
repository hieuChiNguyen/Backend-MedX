import Doctor from "../model/doctor";
import User from "../model/user";
import Specialty from "../model/specialty";
import Room from "../model/room";
import Price from "../model/price";
import Schedule from "../model/schedule";
import Appointment from "../model/appointment"
import { DoctorStatusEnum } from "../enum/doctor_status.enum";
import sequelize  from '../config/connectDB';
import { Op } from "sequelize";
import { sendEmail } from "./email.service"

let getAllDoctors = (status, specialty) => {
    return new Promise(async (resolve, reject) => {
        try {
            let whereClause = {};

            if (status === 'active') {
                whereClause.status = DoctorStatusEnum.ACTIVE;
            } else if (status === 'inactive') {
                whereClause.status = DoctorStatusEnum.INACTIVE;
            }

            if (specialty !== 'all' && specialty !== undefined) {
                whereClause.specialtyId = specialty
            }

            const doctors = await Doctor.findAll({
                where: whereClause,
                include: [
                    {
                        model: User,
                        required: true,
                        as: 'doctorInformation',
                        attributes: ['id', 'fullName', 'email', 'gender', 'role'] 
                    },
                    {
                        model: Specialty,
                        required: true,
                        as: 'doctorSpecialty',
                        attributes: ['id', 'nameVi', 'nameEn'] 
                    }
                ]
            });

            const length = doctors.length

            resolve({
                errCode: 0,
                message: 'OK',
                data: doctors,
                length: length
            })
        } catch (error) {
            reject(error)
        }
    })
}

let getAllActiveDoctors = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let doctors = '';

            doctors = await Doctor.findAll({
                where: {
                    status: DoctorStatusEnum.ACTIVE
                },
                include: [
                    // {
                    //     model: Room,
                    //     required: true,
                    //     as: 'doctorRoom',
                    //     attributes: ['id', 'name', 'number'] // Chỉ định các trường muốn lấy ra
                    // },
                    {
                        model: User,
                        required: true,
                        as: 'doctorInformation',
                        attributes: ['id', 'fullName', 'email', 'gender', 'role'] 
                    },
                    {
                        model: Specialty,
                        required: true,
                        as: 'doctorSpecialty',
                        attributes: ['id', 'nameVi', 'nameEn'] 
                    }
                ]
            });

            resolve({
                errCode: 0,
                message: 'OK',
                data: doctors
            })
        } catch (error) {
            reject(error)
        }
    })
}

let createNewDoctor = (userId, doctorData) => {
    return new Promise(async (resolve, reject) => {
        try {
            // check doctor was already existed
            let doctor = await User.findOne({
                where: { id: userId, role: 'Doctor' }
            })

            if (!doctor) {
                resolve({
                    errCode: 1,
                    message: 'Không tìm thấy người dùng này'
                });
            }

            let price_data = await Price.findOne({
                where: { position: doctorData.position }
            })

            let existedDoctor = await Doctor.findOne({
                where: { citizenCard: doctorData.citizenCard }
            });

            if (existedDoctor) {
                resolve({
                    errCode: 2,
                    message: 'Căn cước công dân đã tồn tại'
                });
            } else {
                let newDoctor = await Doctor.create({
                    citizenCard: doctorData.citizenCard,
                    position: doctorData.position,
                    price: price_data.price,
                    userId: userId,
                    specialtyId: doctorData.specialtyId,
                    status: DoctorStatusEnum.INACTIVE
                });

                const from = 'nguyenchihieu1707@gmail.com'
                const to = doctor.email
                const subject = 'Đăng ký hợp tác trên MedX'
                const html = `
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                background-color: #f4f4f4;
                                margin: 0;
                                padding: 0;
                            }
                            .container {
                                background-color: #ffffff;
                                margin: 50px auto;
                                padding: 20px;
                                border-radius: 10px;
                                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                                max-width: 600px;
                            }
                            .header {
                                text-align: center;
                                padding-bottom: 20px;
                                border-bottom: 1px solid #dddddd;
                            }
                            .header h1 {
                                margin: 0;
                                color: #333333;
                            }
                            .content {
                                padding: 20px;
                            }
                            .content p {
                                line-height: 1.6;
                                color: #666666;
                            }
                            .footer {
                                text-align: center;
                                padding-top: 20px;
                                border-top: 1px solid #dddddd;
                                color: #999999;
                                font-size: 12px;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <h1>Chúc mừng bạn đã đăng ký thành công!</h1>
                            </div>
                            <div class="content">
                                <p>Kính gửi Quý Bác sĩ,</p>
                                <p>Chúng tôi xin chúc mừng bạn đã đăng ký tài khoản thành công trên hệ thống của chúng tôi. Để hoàn tất quy trình đăng ký, vui lòng chuẩn bị và gửi lại cho chúng tôi các giấy tờ sau:</p>
                                <ul>
                                    <li>Bản sao hợp lệ văn bằng chuyên môn y phù hợp với phạm vi hoạt động chuyên môn đề nghị cấp chứng chỉ hành nghề.</li>
                                    <li>Giấy xác nhận quá trình thực hành.</li>
                                    <li>Giấy chứng nhận đủ sức khỏe do cơ sở khám bệnh, chữa bệnh cấp.</li>
                                    <li>Phiếu lý lịch tư pháp.</li>
                                    <li>Sơ yếu lý lịch tự thuật.</li>
                                    <li>Hai ảnh màu 04 cm x 06 cm được chụp trên nền trắng trong thời gian không quá 6 tháng.</li>
                                </ul>
                                <p>Vui lòng trả lời email này và đính kèm các giấy tờ cần thiết. Nếu bạn có bất kỳ câu hỏi nào, xin vui lòng liên hệ với chúng tôi qua email này.</p>
                                <p>Trân trọng,</p>
                                <p>Đội ngũ hỗ trợ MedX</p>
                            </div>
                            <div class="footer">
                                <p>MedX - Số 1 Giải Phóng, Hà Nội, Việt Nam</p>
                            </div>
                        </div>
                    </body>
                    </html>
                `
                await sendEmail(from, to, subject, '', html)

                if (newDoctor) {
                    resolve({
                        errCode: 0,
                        message: 'OK',
                        data: newDoctor
                    });
                }
            }
        } catch (error) {
            reject(error);
        }
    });
}

let getDetailDoctorById = (doctorId) => {
    return new Promise(async (resolve, reject) => {
        try {
            const doctor = await Doctor.findOne({
                where: { id: doctorId },
                include: [
                    // {
                    //     model: Room,
                    //     required: true,
                    //     as: 'doctorRoom',
                    //     attributes: ['id', 'name', 'number'] // Chỉ định các trường muốn lấy ra
                    // },
                    {
                        model: User,
                        required: true,
                        as: 'doctorInformation',
                        attributes: ['id', 'fullName', 'email', 'gender', 'role', 'avatar'] 
                    },
                    {
                        model: Specialty,
                        required: true,
                        as: 'doctorSpecialty',
                        attributes: ['id', 'nameVi', 'nameEn'] 
                    }
                ]
            });

            resolve({
                errCode: 0,
                message: 'OK',
                data: doctor
            });
        } catch (error) {
            reject(error);
        }
    });
};

let getDetailDoctorByAdmin = (doctorId) => {
    return new Promise(async (resolve, reject) => {
        try {
            const doctor = await Doctor.findOne({
                where: { id: doctorId },
                include: [
                    // {
                    //     model: Room,
                    //     required: true,
                    //     as: 'doctorRoom',
                    //     attributes: ['id', 'name', 'number'] // Chỉ định các trường muốn lấy ra
                    // },
                    {
                        model: User,
                        required: true,
                        as: 'doctorInformation',
                        attributes: ['id', 'fullName', 'email', 'gender', 'role', 'phone', 'address', 'avatar'] 
                    },
                    {
                        model: Specialty,
                        required: true,
                        as: 'doctorSpecialty',
                        attributes: ['id', 'nameVi', 'nameEn'] 
                    }
                ]
            });

            resolve({
                errCode: 0,
                message: 'OK',
                data: doctor
            });
        } catch (error) {
            reject(error);
        }
    });
};

let getListSpecialties = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const specialties = await Specialty.findAll({
                attributes: ['id', 'description', 'image', 'nameEn', 'nameVi']
            });

            const length = specialties.length

            resolve({
                errCode: 0,
                message: 'OK',
                data: specialties,
                length: length
            })
        } catch (error) {
            reject(error)
        }
    })
}

let getDoctorsBySpecialty = (specialtyId) => {
    return new Promise(async (resolve, reject) => {
        try {
            const doctors = await Doctor.findAll({
                where: { 
                    specialtyId: specialtyId,
                    status: DoctorStatusEnum.ACTIVE
                },
                attributes: {
                    exclude: ['createdAt', 'updatedAt', 'citizenCard']
                },
                include: [
                    // {
                    //     model: Room,
                    //     required: true,
                    //     as: 'doctorRoom',
                    //     attributes: ['id', 'name', 'number'] // Chỉ định các trường muốn lấy ra
                    // },
                    {
                        model: User,
                        required: true,
                        as: 'doctorInformation',
                        attributes: ['id', 'fullName', 'email', 'gender', 'avatar'] 
                    },
                ],
            });

            resolve({
                errCode: 0,
                message: 'OK',
                data: doctors
            });
        } catch (error) {
            reject(error);
        }
    });
};

let getListPositions = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let positions = [];

            positions = await Price.findAll({
                attributes: ['id', 'position']
            });

            resolve({
                errCode: 0,
                message: 'OK',
                data: positions
            })
        } catch (error) {
            reject(error)
        }
    })
}

let activateDoctorAccount = (doctorId) => {
    return new Promise(async (resolve, reject) => {
        try {
            const doctor = await Doctor.findOne({
                where: { id: doctorId },
            });

            if (!doctor) {
                resolve({
                    errCode: 1,
                    message: 'Không tìm thấy bác sĩ',
                })
            } else {
                let activate_doctor
                if (doctor.status === DoctorStatusEnum.INACTIVE) {
                    activate_doctor = await Doctor.update(
                        { status: DoctorStatusEnum.ACTIVE },
                        {
                          where: {
                            id: doctorId,
                          },
                        },
                      );
                } else {
                    activate_doctor = await Doctor.update(
                        { status: DoctorStatusEnum.INACTIVE },
                        {
                          where: {
                            id: doctorId,
                          },
                        },
                      );
                }
                

                resolve({
                    errCode: 0,
                    message: 'OK',
                    data: activate_doctor
                })
            } 
        } catch (error) {
            reject(error)
        }
    })
}

const paginateAllSpecialties = async (page, limit) => {
    return new Promise(async (resolve, reject) => {
        try {
            let data = {}
            const skip = (page - 1) * limit;

            const { count, rows: limit_specialties } = await Specialty.findAndCountAll({
                attributes: ['id', 'description', 'image', 'nameEn', 'nameVi'],
                offset: skip,
                limit: limit,
                raw: true,
            });

            data = {
                specialties: limit_specialties,
                length: count,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                itemsPerPage: limit
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

let findSuitableDoctorForAppointment = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            let list_doctors = [];

            list_doctors = await Doctor.findAll({
                where: {
                    specialtyId: data.specialtyId,
                    position: data.position,
                    status: DoctorStatusEnum.ACTIVE
                },
                include: [
                    {
                        model: User,
                        required: true,
                        as: 'doctorInformation',
                        attributes: ['id', 'fullName', 'email', 'gender', 'role', 'phone', 'address'] 
                    },
                    {
                        model: Specialty,
                        required: true,
                        as: 'doctorSpecialty',
                        attributes: ['id', 'nameVi', 'nameEn'] 
                    }
                ],
                // raw: true
            });

            let list_filter_doctors = []

            for (const doctor of list_doctors) {
                let schedules = await Schedule.findAll({
                    where: {
                        doctorId: doctor.id
                    },
                    raw: true,
                })

                if (schedules.length > 0) {
                    const filter_schedules = schedules.filter(schedule => {
                        const scheduleDate = new Date(schedule.date).toISOString().split('T')[0];

                        return scheduleDate === data.date && 
                            schedule.timeSlot === data.timeSlot && 
                            schedule.currentNumber < schedule.maxNumber;
                    });
                            
                    if (filter_schedules.length > 0) {
                        list_filter_doctors.push(doctor)
                    } else {
                        resolve({
                            errCode: 1,
                            message: 'Lịch khám đã kín',
                        })
                    }
                } else {
                    resolve({
                        errCode: 3,
                        message: "Bác sĩ không đăng ký lịch khám này"
                    })
                }
            }

            if (list_filter_doctors.length > 0) {
                resolve({
                    errCode: 0,
                    message: 'OK',
                    data: list_filter_doctors
                });
            } else {
                resolve({
                    errCode: 4,
                    message: 'Không có bác sĩ nào phù hợp'
                });
            }
        } catch (error) {
            reject(error)
        }
    })
}

let getTopSpecialties = async () => {
    return new Promise(async (resolve, reject) => {
        try {
            const result = await Appointment.findAll({
                attributes: [
                    'specialtyId',
                    [sequelize.fn('COUNT', sequelize.col('specialtyId')), 'appointmentCount']
                ],
                group: ['specialtyId'],
                order: [[sequelize.fn('COUNT', sequelize.col('specialtyId')), 'DESC']],
                limit: 4,
                raw: true
            });
    
            // Get top specialties with their details
            const topSpecialtyIds = result.map(item => item.specialtyId);

            const topSpecialties = await Specialty.findAll({
                where: { id: topSpecialtyIds },
                attributes: {
                    exclude: ['createdAt', 'updatedAt'],
                },
                raw: true
            });
    
            // Combine the counts with specialty details
            const topSpecialtiesWithCount = topSpecialties.map(specialty => {
                const count = result.find(item => item.specialtyId === specialty.id).appointmentCount;
                return {
                    ...specialty,
                    appointmentCount: count
                };
            });

            resolve({
                errCode: 0,
                message: 'OK',
                data: topSpecialtiesWithCount
            })
        } catch (error) {
            reject(error)
        }
    })
};

let getRandomTopDoctors = async () => {
    return new Promise(async (resolve, reject) => {
        try {
            const topSpecialties = await getTopSpecialties();
            const specialtyIds = topSpecialties.data.map(specialty => specialty.id);

            const doctors = await Doctor.findAll({
                where: {
                    specialtyId: {
                        [Op.in]: specialtyIds
                    },
                    status: DoctorStatusEnum.ACTIVE
                },
                attributes: {
                    exclude: ['createdAt', 'updatedAt', 'citizenCard']
                },
                include: [
                    {
                        model: Specialty,
                        required: true,
                        as: 'doctorSpecialty',
                        attributes: ['id', 'nameVi', 'nameEn'] 
                    },
                    {
                        model: User,
                        required: true,
                        as: 'doctorInformation',
                        attributes: ['id', 'fullName', 'email', 'gender', 'role', 'avatar'] 
                    },
                ]
            });

            const shuffledDoctors = doctors.sort(() => Math.random() - 0.5);
            const randomDoctors = shuffledDoctors.slice(0, 3);

            resolve({
                errCode: 0,
                message: 'OK',
                data: randomDoctors
            });
        } catch (error) {
            reject(error);
        }
    });
};

const paginateAllDoctors = async (page, limit) => {
    return new Promise(async (resolve, reject) => {
        try {
            let data = {}
            const skip = (page - 1) * limit;

            const { count, rows: listDoctors } = await Doctor.findAndCountAll({
                where: {
                    status: DoctorStatusEnum.ACTIVE
                },
                attributes: {
                    exclude: ['createdAt', 'updatedAt']
                },
                include: [
                    // {
                    //     model: Room,
                    //     required: true,
                    //     as: 'doctorRoom',
                    //     attributes: ['id', 'name', 'number'] // Chỉ định các trường muốn lấy ra
                    // },
                    {
                        model: User,
                        required: true,
                        as: 'doctorInformation',
                        attributes: ['id', 'fullName', 'email', 'gender', 'role', 'avatar'] 
                    },
                    {
                        model: Specialty,
                        required: true,
                        as: 'doctorSpecialty',
                        attributes: ['id', 'nameVi', 'nameEn'] 
                    }
                ],
                offset: skip,
                limit: limit,
            });

            data = {
                doctors: listDoctors,
                length: count,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                itemsPerPage: limit
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
};

const getSpecialtyById = async (specialtyId) => {
    return new Promise(async (resolve, reject) => {
        try {
            const specialty = await Specialty.findOne({
                where: {
                    id: specialtyId
                },
                attributes: {
                    exclude: ['createdAt', 'updatedAt']
                }
            })

            resolve({
                errCode: 0,
                message: 'OK',
                data: specialty
            })
        } catch (error) {
            reject(error)
        }
    })
};

let createNewSpecialty = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const existedSpecialty = await Specialty.findOne({
                where:{
                    nameEn: data.nameEn,
                    nameVi: data.nameVi
                }
            })

            if(existedSpecialty) {
                resolve({
                    errCode: 1,
                    message: 'Chuyên khoa đã tồn tại',
                })
            } else {
                let newSpecialty = await Specialty.create({
                    nameVi: data.nameVi,
                    nameEn: data.nameEn,
                    image: data.image,
                    description: data.description,
                });

                resolve({
                    errCode: 0,
                    message: 'OK',
                    data: newSpecialty
                })
            }
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = {
    getAllDoctors,
    createNewDoctor,
    getDetailDoctorById,
    getListSpecialties,
    getDoctorsBySpecialty,
    getListPositions,
    getDetailDoctorByAdmin,
    activateDoctorAccount,
    paginateAllSpecialties,
    findSuitableDoctorForAppointment,
    getAllActiveDoctors,
    getTopSpecialties,
    paginateAllDoctors,
    getRandomTopDoctors,
    getSpecialtyById,
    createNewSpecialty
};
