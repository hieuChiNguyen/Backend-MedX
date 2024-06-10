import historyService from '../service/history.service'

let getAppointmentInfo = async (req, res) => {
    const appointmentId = req.params.appointmentId

    let appointmentInfo = await historyService.getAppointmentInfo(appointmentId);

    if (appointmentInfo.errCode === 0) {
        return res.status(200).json(appointmentInfo);
    } else {
        return res.status(404).json(appointmentInfo);
    }
}

let createHistoryAppointment = async (req, res) => {
    const data = req.body

    let appointmentHistory = await historyService.createHistoryAppointment(data);

    if (appointmentHistory.errCode === 0) {
        return res.status(200).json(appointmentHistory);
    } else {
        return res.status(400).json(appointmentHistory)
    }
}

let shareAppointmentInfo = async (req, res) => {
    try {
        const data = req.body

        let code = await historyService.shareAppointmentInfo(data);
    
        if (code.errCode === 0) {
            return res.status(201).json(code);
        } else {
            return res.status(200).json(code)
        }
    } catch (error) {
        return res.status(400).json({
            errCode: 2,
            message: 'Chia sẻ thất bại'
        });
    }
}

let checkVerifyCode = async (req, res) => {
    const data = req.body
    let appointmentInfo = await historyService.checkVerifyCode(data);

    if (appointmentInfo.errCode === 0) {
        return res.status(200).json(appointmentInfo);
    } else {
        return res.status(404).json(appointmentInfo);
    }
}

module.exports = {
    getAppointmentInfo,
    createHistoryAppointment,
    shareAppointmentInfo,
    checkVerifyCode
}