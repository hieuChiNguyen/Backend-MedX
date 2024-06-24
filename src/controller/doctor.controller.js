import Doctor from '../model/doctor';
import doctorService from '../service/doctor.service'

let getAllDoctors = async (req, res) => {
    const { status, specialty } = req.query
    let doctors = await doctorService.getAllDoctors(status, specialty);
    return res.status(200).json(doctors)
};

let createNewDoctor = async (req, res) => {
    try {
        await Doctor.sync();
        let doctorData = req.body;
        const userId = req.params.userId;

        let newDoctor = await doctorService.createNewDoctor(userId, doctorData);

        if (newDoctor.errCode === 0) {
            return res.status(201).json(newDoctor);
        } else {
            return res.status(404).json(newDoctor);
        }
    } catch (error) {
        return res.status(400).json({
            errCode: 2,
            message: 'Chưa điền đủ thông tin bác sĩ.'
        });
    }
}

let getDetailDoctorById = async (req, res) => {
    let doctorId = req.params.doctorId;

    if (!doctorId) {
        return res.status(400).json({
            errCode: 1,
            message: 'Không tìm thấy id của bác sĩ.'
        });
    }

    let doctor = await doctorService.getDetailDoctorById(doctorId);
    return res.status(200).json(doctor);
};

let getDetailDoctorByAdmin = async (req, res) => {
    let doctorId = req.params.doctorId;

    if (!doctorId) {
        return res.status(400).json({
            errCode: 1,
            message: 'Không tìm thấy id của bác sĩ.'
        });
    }

    let doctor = await doctorService.getDetailDoctorByAdmin(doctorId);
    return res.status(200).json(doctor);
};

let getListSpecialties = async (req, res) => {
    let specialties = await doctorService.getListSpecialties();
    return res.status(200).json(specialties)
};

let getDoctorsBySpecialty = async (req, res) => {
    let specialtyId = req.params.specialtyId;

    if (!specialtyId) {
        return res.status(400).json({
            errCode: 1,
            message: 'Không tìm thấy chuyên khoa!'
        });
    }

    let specialty = await doctorService.getDoctorsBySpecialty(specialtyId);
    return res.status(200).json(specialty);
};

let getAllPositions = async (req, res) => {
    let positions = await doctorService.getListPositions();
    return res.status(200).json(positions)
};

let activateDoctorAccount= async (req, res) => {
    const doctorId = req.params.doctorId

    let activated_doctor = await doctorService.activateDoctorAccount(doctorId)

    if (activated_doctor.errCode === 1) {
        return res.status(404).json(activated_doctor)
    } else {
        return res.status(200).json(activated_doctor)
    }
}

let paginateAllSpecialties = async (req, res) => {
    try {
        const page = parseInt(req.params.page, 10) || 1;
        const limit = parseInt(req.params.limit, 10) || 10;

        let list_specialties = await doctorService.paginateAllSpecialties(page, limit);
        return res.status(200).json(list_specialties);
    } catch (error) {
        return res.status(500).json({
            errCode: 1,
            message: 'Internal server error',
        });
    }
};

let paginateAllDoctors = async (req, res) => {
    try {
        const page = parseInt(req.params.page, 10) || 1;
        const limit = parseInt(req.params.limit, 10) || 10;

        let listDoctors = await doctorService.paginateAllDoctors(page, limit);
        return res.status(200).json(listDoctors);
    } catch (error) {
        return res.status(500).json({
            errCode: 1,
            message: 'Internal server error',
        });
    }
};

let findSuitableDoctorForAppointment = async(req, res) => {
    const data = req.body

    if (data) {
        const list_doctors = await doctorService.findSuitableDoctorForAppointment(data);

        if (list_doctors.errCode === 0) {
            return res.status(200).json(list_doctors);
        } else {
            return res.status(404).json(list_doctors)
        }
    } else {
        return res.status(400).json({
            errCode: 2,
            message: 'Thiếu thông tin yêu cầu'
        })
    }
}

let getAllActiveDoctors = async (req, res) => {
    let doctors = await doctorService.getAllActiveDoctors();
    return res.status(200).json(doctors)
};

let getTopSpecialties = async (req, res) => {
    let topSpecialties = await doctorService.getTopSpecialties();
    return res.status(200).json(topSpecialties)
}

let getRandomTopDoctors = async (req, res) => {
    let topDoctors = await doctorService.getRandomTopDoctors();
    return res.status(200).json(topDoctors)
}

let getSpecialtyById = async (req, res) => {
    const specialtyId = req.params.specialtyId
    let specialty = await doctorService.getSpecialtyById(specialtyId);
    return res.status(200).json(specialty)
}

let createNewSpecialty = async (req, res) => {{
    const data = req.body
    let newSpecialty = await doctorService.createNewSpecialty(data);
    if (newSpecialty.errCode === 0) {
        return res.status(200).json(newSpecialty)
    } else {
        return res.status(400).json(newSpecialty)
    }
}}

module.exports = {
    getAllDoctors,
    createNewDoctor,
    getDetailDoctorById,
    getListSpecialties,
    getDoctorsBySpecialty,
    getAllPositions,
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
}