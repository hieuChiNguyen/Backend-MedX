import Doctor from "../model/doctor";
import Schedule from "../model/schedule";

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
                let currentDate = new Date();
                let currentDay = currentDate.getDay();
                
                // Nếu ngày hiện tại là thứ 7 (6) hoặc chủ nhật (0), chuyển đến thứ 2 tuần sau
                if (currentDay === 0) {
                    currentDate.setDate(currentDate.getDate() + 1);
                } else if (currentDay === 6) {
                    currentDate.setDate(currentDate.getDate() + 2);
                }
                
                let startOfWeek = new Date(currentDate);
                let endOfWeek = new Date(currentDate);

                startOfWeek.setDate(currentDate.getDate() - (currentDay - 1));
                endOfWeek.setDate(startOfWeek.getDate() + 4);

                const schedules = await Schedule.findAll({
                    where: {
                        doctorId: doctorId,
                        date: {
                            [Op.between]: [startOfWeek, endOfWeek]
                        }
                    }
                });

                if (schedules && schedules.length > 0) {
                    resolve({
                        errCode: 0,
                        message: 'OK',
                        data: schedules
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
            // check doctor was already existed
            let doctor = await Doctor.findOne({
                where: { id: scheduleData.doctorId }
            })

            let timeSlots = [...scheduleData.timeSlots]

            let newSchedules = []

            if (doctor) {
                for (const timeSlot of timeSlots) {
                    let newSchedule = await Schedule.create({
                        currentNumber: 0,
                        maxNumber: 2,
                        date: scheduleData.date,
                        timeSlot: timeSlot,
                        doctorId: scheduleData.doctorId
                    });

                    newSchedules.push(newSchedule);
                }
               
                resolve({
                    errCode: 0,
                    message: 'OK',
                    data: newSchedules
                });
            } else {
                resolve({
                    errCode: 1,
                    message: 'Không tìm thấy bác sĩ'
                })
            }
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = {
    getAllSchedulesByDoctorId,
    createNewSchedules,
};
