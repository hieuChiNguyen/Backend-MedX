import appointmentDoctorService from '../service/appointment_doctor.service';
import Appointment_Doctor from '../model/appointment_doctor'

let addDoctorToAppointment = async (req, res) => {
    try {
        await Appointment_Doctor.sync()
        let data = req.body

        let new_appointment_doctor = await appointmentDoctorService.addDoctorToAppointment(data)

        if (new_appointment_doctor.errCode === 0) {
            return res.status(201).json(new_appointment_doctor)
        } else {
            return res.status(400).json(new_appointment_doctor)
        }
    } catch (error) {
        return res.status(400).json({
            errCode: 5,
            message: 'Chưa điền đủ thông tin.'
        });
    }
}

let getAllAppointmentsByDoctorId = async (req, res) => {
    const doctorId = req.params.doctorId
    let appointment_doctors = await appointmentDoctorService.getAllAppointmentsByDoctorId(doctorId)
    return res.status(200).json(appointment_doctors)
};

module.exports = {
    addDoctorToAppointment,
    getAllAppointmentsByDoctorId
}