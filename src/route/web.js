import express from 'express';
import authController from '../controller/auth.controller'
import doctorController from '../controller/doctor.controller'
import appointmentController from '../controller/appointment.controller'
import patientController from '../controller/patient.controller'
import scheduleController from '../controller/schedule.controller'
import appointmentDoctorController from '../controller/appointment_doctor.controller'
import markdownController from '../controller/markdown.controller'
import historyController from '../controller/history.controller'
import authJwt from '../middleware/auth.middleware'
import { RoleEnum } from '../enum/role.enum';

let router = express.Router();

let initWebRouters = (app) => {
    // Auth
    router.post('/api/v1/register', authController.handleRegister);
    router.post('/api/v1/login', authController.handleLogin);
    router.post('/api/v1/logout', authController.handleLogout);

    // Doctor
    router.post('/api/v1/doctor/create/:userId', doctorController.createNewDoctor)
    router.post(
        '/api/v1/doctor/search',
        authJwt.verifyToken, 
        authJwt.verifyRole([RoleEnum.ADMIN, RoleEnum.RECEPTIONIST]),
        doctorController.findSuitableDoctorForAppointment
    )
    router.get(
        '/api/v1/doctor', 
        authJwt.verifyToken, 
        authJwt.verifyRole([RoleEnum.ADMIN]),
        doctorController.getAllDoctors
    );
    router.get('/api/v1/doctor/active', doctorController.getAllActiveDoctors);
    router.get('/api/v1/doctor/active/:page/:limit', doctorController.paginateAllDoctors)
    router.get('/api/v1/doctor/:doctorId', doctorController.getDetailDoctorById)
    router.get('/api/v1/positions', doctorController.getAllPositions)
    router.get(
        '/api/v1/doctor/admin/:doctorId',
        authJwt.verifyToken, 
        authJwt.verifyRole([RoleEnum.ADMIN, RoleEnum.DOCTOR]),
        doctorController.getDetailDoctorByAdmin
    )
    router.patch(
        '/api/v1/doctor/activate/:doctorId',
        authJwt.verifyToken, 
        authJwt.verifyRole([RoleEnum.ADMIN]),
        doctorController.activateDoctorAccount
    )

    // Specialty
    router.get('/api/v1/specialties', doctorController.getListSpecialties)
    router.get('/api/v1/specialty/:specialtyId', doctorController.getDoctorsBySpecialty)
    router.get('/api/v1/specialties/:page/:limit', doctorController.paginateAllSpecialties)
    router.get('/api/v1/specialties/top', doctorController.getTopSpecialties)

    // Patient
    router.get('/api/v1/provinces', patientController.getAllProvinces)
    router.get('/api/v1/districts/:provinceId', patientController.getAllDistrictsByProvinceId)
    router.get('/api/v1/wards/:districtId', patientController.getAllWardsByDistrictId)
    router.get(
        '/api/v1/information/:patientId', 
        authJwt.verifyToken, 
        authJwt.verifyRole([RoleEnum.ADMIN, RoleEnum.PATIENT, RoleEnum.RECEPTIONIST]),
        patientController.getPatientInformation
    )
    router.get(
        '/api/v1/patients',
        authJwt.verifyToken, 
        authJwt.verifyRole([RoleEnum.ADMIN]),
        patientController.getAllPatients
    )
    router.post(
        '/api/v1/patient/create',
        authJwt.verifyToken, 
        authJwt.verifyRole([RoleEnum.RECEPTIONIST, RoleEnum.ADMIN]),
        patientController.createNewPatient
    )
    router.put('/api/v1/user/update-avatar', patientController.updateUserAvatar);

    // Appointment
    router.post(
        '/api/v1/appointment/create', 
        authJwt.verifyToken, 
        authJwt.verifyRole([RoleEnum.PATIENT, RoleEnum.ADMIN, RoleEnum.RECEPTIONIST]), 
        appointmentController.createNewAppointment
    )
    router.get('/api/v1/prices', authJwt.verifyToken, authJwt.verifyRole([RoleEnum.PATIENT, RoleEnum.ADMIN]), appointmentController.getAllPrices)
    router.get(
        '/api/v1/appointment', 
        authJwt.verifyToken, 
        authJwt.verifyRole([RoleEnum.RECEPTIONIST, RoleEnum.ADMIN]), 
        appointmentController.getAllAppointments
    )
    router.get(
        '/api/v1/appointment/:appointmentId', 
        authJwt.verifyToken, authJwt.verifyRole([RoleEnum.RECEPTIONIST, RoleEnum.ADMIN, RoleEnum.PATIENT]), 
        appointmentController.getAppointmentById
    )
    router.get(
        '/api/v1/appointments/history/:patientId', 
        authJwt.verifyToken, 
        authJwt.verifyRole([RoleEnum.PATIENT, RoleEnum.ADMIN]), 
        appointmentController.getAppointmentsByPatientId
    )
    router.patch(
        '/api/v1/appointment/cancel/:appointmentId',
        authJwt.verifyToken, 
        authJwt.verifyRole([RoleEnum.PATIENT, RoleEnum.RECEPTIONIST, RoleEnum.ADMIN]), 
        appointmentController.cancelAppointment
    )

    // Appointment_Doctor
    router.post(
        '/api/v1/appointment/doctor/schedule',
        authJwt.verifyToken,
        authJwt.verifyRole([RoleEnum.RECEPTIONIST, RoleEnum.ADMIN]), 
        appointmentDoctorController.addDoctorToAppointment
    )
    router.get(
        '/api/v1/appointment_doctor/:doctorId',
        authJwt.verifyToken,
        authJwt.verifyRole([RoleEnum.DOCTOR, RoleEnum.ADMIN]), 
        appointmentDoctorController.getAllAppointmentsByDoctorId
    )

    // Schedule
    router.post(
        '/api/v1/schedule/create',
        authJwt.verifyToken,
        authJwt.verifyRole([RoleEnum.DOCTOR]),
        scheduleController.createNewSchedules
    )
    router.get(
        '/api/v1/schedule/:doctorId', 
        authJwt.verifyToken,
        authJwt.verifyRole([RoleEnum.DOCTOR, RoleEnum.RECEPTIONIST, RoleEnum.ADMIN]),
        scheduleController.getAllSchedules
    )

    // Markdown
    router.post(
        '/api/v1/markdown/create', 
        authJwt.verifyToken,
        authJwt.verifyRole([RoleEnum.DOCTOR, RoleEnum.ADMIN]),
        markdownController.saveDoctorDetailContent
    )
    router.get('/api/v1/markdown/doctor/:doctorId', markdownController.getDoctorMarkdownContent)
    router.get('/api/v1/markdown/specialty/:specialtyId', markdownController.getSpecialtyMarkdownContent)

    // History
    router.get(
        '/api/v1/history/:appointmentId', 
        authJwt.verifyToken,
        authJwt.verifyRole([RoleEnum.PATIENT, RoleEnum.DOCTOR]),
        historyController.getAppointmentInfo
    )
    router.post(
        '/api/v1/history/create', 
        authJwt.verifyToken,
        authJwt.verifyRole([RoleEnum.DOCTOR]),
        historyController.createHistoryAppointment
    )
    router.post(
        '/api/v1/history/share',
        authJwt.verifyToken,
        authJwt.verifyRole([RoleEnum.PATIENT]),
        historyController.shareAppointmentInfo
    )
    router.post('/api/v1/history/check', historyController.checkVerifyCode)

    return app.use('/', router);
};

module.exports = initWebRouters;
