import Appointment from "../model/appointment";
import Appointment_Doctor from "../model/appointment_doctor";
import appointmentService from '../service/appointment.service';

let createNewAppointment = async (req, res) => {
    try {
        await Appointment.sync();
        let appointmentData = req.body;

        let newAppointment = await appointmentService.createNewAppointment(appointmentData);

        if (newAppointment.errCode === 0) {
            return res.status(201).json(newAppointment);
        } else if(newAppointment.errCode === 1) {
            return res.status(400).json(newAppointment);
        }
    } catch (error) {
        return res.status(400).json({
            errCode: 2,
            message: 'Chưa điền đủ thông tin khám bệnh.'
        });
    }
}

let getAllPrices = async(req, res) => {
    try {
        let prices = await appointmentService.getPrices();
        if (prices.errCode === 0) {
            return res.status(200).json(prices)
        }
    } catch (error) {
        return res.status(404).json({
            errCode: 2,
            message: 'Không tìm thấy danh sách giá.'
        });
    }
}

let addDoctorToAppointment = async (req, res) => {
    try {
        await Appointment_Doctor.sync();
        let data = req.body;

        let newAppointmentDoctor = await appointmentService.addDoctorToAppointment(data);

        if (newAppointmentDoctor.errCode === 0) {
            return res.status(201).json(newAppointmentDoctor);
        } else if(newAppointmentDoctor.errCode === 1) {
            return res.status(400).json(newAppointmentDoctor);
        }
    } catch (error) {
        return res.status(400).json({
            errCode: 2,
            message: 'Chưa điền đủ thông tin khám bệnh.'
        });
    }
}

let getAllAppointments = async (req, res) => {
    const { status } = req.query
    let appointments = await appointmentService.getAllAppointments(status);
    return res.status(200).json(appointments)
};

let getAppointmentById = async (req, res) => {
    try {
        const appointmentId = req.params.appointmentId
        let appointment = await appointmentService.getAppointmentById(appointmentId)

        if (appointment.errCode === 0) {
            return res.status(200).json(appointment)
        }
    } catch (error) {
        return res.status(400).json({})
    }
};

let getAppointmentsByPatientId = async (req, res) => {
    const patientId = req.params.patientId
    let appointment = await appointmentService.getAppointmentsByPatientId(patientId)

    if(appointment.errCode === 0) {
        return res.status(200).json(appointment)
    } else {
        return res.status(404).json(appointment)
    }
}

let shareAppointmentInfo = async (req, res) => {
    const appointmentId = req.params.appointmentId
    let appointmentInfo = await appointmentService.shareAppointmentInfo(appointmentId);
    return res.status(200).json(appointmentInfo)
}

let cancelAppointment = async (req, res) => {
    const appointmentId = req.params.appointmentId
    let appointment = await appointmentService.cancelAppointment(appointmentId);
    return res.status(200).json(appointment)
}

module.exports = {
    createNewAppointment,
    getAllPrices,
    addDoctorToAppointment,
    getAllAppointments,
    getAppointmentById,
    getAppointmentsByPatientId,
    shareAppointmentInfo,
    cancelAppointment
}