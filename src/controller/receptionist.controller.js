import receptionistService from '../service/receptionist.service';

let createNewReceptionist= async (req, res) => {
    try {
        let receptionistData = req.body;

        let newReceptionist = await receptionistService.createNewReceptionist(receptionistData);

        if (newReceptionist.errCode === 0) {
            return res.status(201).json(newReceptionist);
        } else if (newReceptionist.errCode !== 0) {
            return res.status(400).json(newReceptionist);
        }
    } catch (error) {
        return res.status(400).json({
            errCode: 4,
            message: 'Chưa điền đủ thông tin tiếp tân.'
        });
    }
}

let getAllReceptionists = async (req, res) => {
    const { gender, province, district, ward } = req.query
    let receptionists = await receptionistService.getAllReceptionists(gender, province, district, ward)
    return res.status(200).json(receptionists)
}

let deleteReceptionist = async (req, res) => {
    try {   
        const receptionistId= req.params.receptionistId
        let deleted = await receptionistService.deleteReceptionist(receptionistId)
        return res.status(200).json(deleted)
    } catch (error) {
        return res.status(400).json({
            errCode: 1,
            message: 'Xóa tiếp tân thất bại.'
        });
    }
}

let editReceptionist = async (req, res) => {
    try {   
        const receptionistId= req.params.receptionistId
        const data = req.body
        let edited = await receptionistService.editReceptionist(receptionistId, data)
        if (edited.errCode === 0) {
            return res.status(200).json(edited)
        } else {
            return res.status(400).json(edited)
        }
    } catch (error) {
        return res.status(400).json({
            errCode: 1,
            message: 'Sửa tiếp tân thất bại.'
        });
    }
}

module.exports = {
    createNewReceptionist,
    getAllReceptionists,
    deleteReceptionist,
    editReceptionist
};