import Schedule from '../model/schedule';
import scheduleService from '../service/schedule.service'

let getAllSchedules = async (req, res) => {
    const doctorId = req.params.doctorId;

    let schedules = await scheduleService.getAllSchedulesByDoctorId(doctorId);
    if (schedules.errCode === 0) {
        return res.status(200).json(schedules)
    } else {
        return res.status(404).json(schedules)
    }  
};

let createNewSchedules = async (req, res) => {
    try {
        await Schedule.sync();
        let scheduleData = req.body;

        let newSchedules = await scheduleService.createNewSchedules(scheduleData);

        if (newSchedules.errCode === 0) {
            return res.status(201).json(newSchedules);
        } else {
            return res.status(400).json(newSchedules)
        }
    } catch (error) {
        return res.status(400).json({
            errCode: 4,
            message: 'Chưa đăng ký đủ thông tin lịch khám.'
        });
    }
}

let getRemainScheduleByDate = async (req, res) => {
    const data = req.body;

    let remainSchedules = await scheduleService.getRemainScheduleByDate(data);
    if (remainSchedules.errCode === 0) {
        return res.status(200).json(remainSchedules)
    } else {
        return res.status(404).json(remainSchedules)
    }  
}

module.exports = {
    getAllSchedules,
    createNewSchedules,
    getRemainScheduleByDate
}