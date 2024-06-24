import patientService from '../service/patient.service';

let getAllProvinces = async (req, res) => {
    let provinces = await patientService.getAllProvinces();
    return res.status(200).json(provinces)
};

let getAllDistrictsByProvinceId = async (req, res) => {
    const provinceId = req.params.provinceId

    let districts = await patientService.getAllDistrictsByProvinceId(provinceId);
    return res.status(200).json(districts)
};

let getAllWardsByDistrictId = async (req, res) => {
    const districtId = req.params.districtId

    let wards = await patientService.getAllWardsByDistrictId(districtId);
    return res.status(200).json(wards)
};

let getPatientInformation = async (req, res) => {
    const patientId = req.params.patientId

    let patient_info = await patientService.getPatientInformation(patientId)
    return res.status(200).json(patient_info)
}

let getAllPatients = async (req, res) => {
    const { gender, province, district, ward } = req.query
    let patients = await patientService.getAllPatients(gender, province, district, ward)
    return res.status(200).json(patients)
}

let createNewPatient= async (req, res) => {
    try {
        let patientData = req.body;

        let newPatient = await patientService.createNewPatient(patientData);

        if (newPatient.errCode === 0) {
            return res.status(201).json(newPatient);
        }
    } catch (error) {
        return res.status(400).json({
            errCode: 2,
            message: 'Chưa điền đủ thông tin bệnh nhân.'
        });
    }
}

// let updateUserAvatar = async (req, res) => {
//     try {
//         let data = req.body;
//         let updatedData = await patientService.updateUserAvatar(data);
//         return res.status(200).json(updatedData);
//     } catch (error) {
//         return res.status(400).json({ errCode: 1, message: 'Tải ảnh lên thất bại.' });
//     }
// };

let updateUserAvatar = async (req, res) => {
    try {
        let data = req.body;
        let newAvatar = await patientService.updateUserAvatar(data);
        if(newAvatar.errCode === 0) {
            return res.status(200).json(newAvatar);
        } else {
            return res.status(400).json(newAvatar);
        }
        
    } catch (error) {
        return res.status(400).json({ errCode: 1, message: 'Tải ảnh lên thất bại' });
    }
}

module.exports = {
    getAllProvinces,
    getAllDistrictsByProvinceId,
    getAllWardsByDistrictId,
    getPatientInformation,
    getAllPatients,
    createNewPatient,
    updateUserAvatar
}