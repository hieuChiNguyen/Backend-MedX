import { Op, Sequelize } from "sequelize"
import Doctor from "../model/doctor"
import Schedule from "../model/schedule"
const { getDay, addDays, format } = require('date-fns')

let checkExistDoctor = (doctorId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let doctor = await Doctor.findOne({
                where: {
                    id: doctorId
                }
            });

            if (doctor) return resolve(true)
            else return resolve(false) 
        } catch (error) {
            reject(error)
        }
    })
}

let getAllSchedulesByDoctorId = (doctorId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let check_doctor = await checkExistDoctor(doctorId)
            if (check_doctor) {
                const now = new Date();
                const currentDate = new Date(now.toISOString().split('T')[0])
                const dayOfWeek = getDay(currentDate)
                let startDate, endDate;
            
                if (dayOfWeek === 6) {
                    startDate = addDays(currentDate, 2); // Next Monday
                    endDate = addDays(currentDate, 6); // Next Friday
                } else if (dayOfWeek === 0) {
                    startDate = addDays(currentDate, 1); // Next Monday
                    endDate = addDays(currentDate, 5); // Next Friday
                } else {
                    const daysUntilFriday = 5 - dayOfWeek; // Calculate days until next Friday
                    startDate = currentDate;
                    endDate = addDays(currentDate, daysUntilFriday); // Calculate the date for the upcoming Friday
                }

                const schedules = await Schedule.findAll({
                    where: {
                        doctorId: doctorId,
                        date: {
                            // [Op.between]: [format(startDate, 'yyyy-MM-dd'), format(endDate, 'yyyy-MM-dd')]
                            [Op.between]: [startDate, endDate]
                        }
                    },
                    attributes: {
                        exclude: ['createdAt', 'updatedAt']
                    },
                    order: [
                        ['date', 'ASC'], 
                        ['timeSlot', 'ASC'] 
                    ] 
                });

                const length = schedules.length

                if (schedules && schedules.length > 0) {
                    resolve({
                        errCode: 0,
                        message: 'OK',
                        data: schedules,
                        length: length
                    })
                } else {
                    resolve({
                        errCode: 1,
                        message: 'Không tìm thấy lịch khám của bác sĩ',
                        data: []
                    })
                }
            } else {
                resolve({
                    errCode: 2,
                    message: 'Không tìm thấy bác sĩ.',
                })
            }
            
        } catch (error) {
            reject(error)
        }
    })
}

let createNewSchedules = (scheduleData) => {
    return new Promise(async (resolve, reject) => {
        try {
            let timeSlots = [...scheduleData.timeSlots]

            if (timeSlots.length < 8) {
                resolve({
                    errCode: 3,
                    message: 'Bác sĩ phải chọn ít nhất 8 khung giờ'
                });
            }

            let newSchedules = []

            let scheduleDate = new Date();
            let dayOfWeek = scheduleDate.getDay();

            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                resolve({
                    errCode: 2,
                    message: 'Bác sĩ chỉ có thể đặt lịch mới vào thứ 7 và chủ nhật'
                });
            }

          
            for (const timeSlot of timeSlots) {
                let existedSchedule = await Schedule.findOne({
                    where: {
                        doctorId: scheduleData.doctorId,
                        date: new Date(scheduleData.date),
                        timeSlot: timeSlot
                    }
                });

                if (!existedSchedule) {
                    let newSchedule = await Schedule.create({
                        currentNumber: 0,
                        maxNumber: 2,
                        date: scheduleData.date,
                        timeSlot: timeSlot,
                        doctorId: scheduleData.doctorId
                    });

                    newSchedules.push(newSchedule);
                }
            }
            
            if (newSchedules.length > 0) {
                resolve({
                    errCode: 0,
                    message: 'OK',
                    data: newSchedules
                });
            } else {
                resolve({
                    errCode: 1,
                    message: 'Các lịch này đã được đặt trước đó',
                    data: []
                });
            }
        } catch (error) {
            reject(error);
        }
    });
}

let getRemainScheduleByDate = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            // const maxNumber = 2
            const remainSchedules = await Schedule.findAll({
                where: {
                    date: new Date(data.date),
                    doctorId: data.doctorId,
                    currentNumber: {
                        [Op.lt]: Sequelize.col('maxNumber')
                    }
                },
                attributes: {
                    exclude: ['createdAt', 'updatedAt']
                },
                order: [
                    [Sequelize.fn('STR_TO_DATE', Sequelize.col('timeSlot'), '%h:%i %p'), 'ASC']
                ]
            })
            
            resolve({
                errCode: 0,
                message: 'OK',
                data: remainSchedules
            });
            
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = {
    getAllSchedulesByDoctorId,
    createNewSchedules,
    getRemainScheduleByDate
};
