import { GenderEnum } from "../enum/gender.enum";
import { RoleEnum } from "../enum/role.enum";
import District from "../model/district";
import Province from "../model/province";
import User from "../model/user";
import Ward from "../model/ward"
import bcrypt from 'bcryptjs';

const { Op } = require('sequelize');
const salt = bcrypt.genSaltSync(10);

let getAllProvinces = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let provinces = '';

            provinces = await Province.findAll({
                attributes: ['id', 'fullName']
            });

            resolve({
                errCode: 0,
                message: 'OK',
                data: provinces
            })
        } catch (error) {
            reject(error)
        }
    })
}

let getAllDistrictsByProvinceId = (provinceId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let districts = '';

            districts = await District.findAll({
                where: {
                    provinceId: provinceId
                },
                attributes: ['id', 'fullName']
            });

            resolve({
                errCode: 0,
                message: 'OK',
                data: districts
            })
        } catch (error) {
            reject(error)
        }
    })
}

let getAllWardsByDistrictId = (districtId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let wards = '';

            wards = await Ward.findAll({
                where: {
                    districtId: districtId
                },
                attributes: ['id', 'fullName']
            });

            resolve({
                errCode: 0,
                message: 'OK',
                data: wards
            })
        } catch (error) {
            reject(error)
        }
    })
}

let getPatientInformation = (patientId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let patientInfo = '';

            patientInfo = await User.findOne({
                where: {
                    id: patientId,
                    role: RoleEnum.PATIENT
                },
                attributes: ['id', 'fullName', 'email', 'phone', 'address', 'avatar']
            });

            resolve({
                errCode: 0,
                message: 'OK',
                data: patientInfo
            })
        } catch (error) {
            reject(error)
        }
    })
}

let getAllPatients = (gender) => {
    return new Promise(async (resolve, reject) => {
        try {
            let whereClause = {};
            whereClause.role = RoleEnum.PATIENT

            if (gender === 'male') {
                whereClause.gender = GenderEnum.MALE
            } else if (gender === 'female') {
                whereClause.gender = GenderEnum.FEMALE
            } else if (gender === 'others') {
                whereClause.gender = GenderEnum.OTHERS
            }

            const patients = await User.findAll({
                where: whereClause,
                attributes: ['id', 'fullName', 'email', 'username', 'phone', 'address', 'gender', 'birthday']
            });

            const length = patients.length;

            resolve({
                errCode: 0,
                message: 'OK',
                data: patients,
                length: length
            })
        } catch (error) {
            reject(error)
        }
    })
}

// Encode raw password into hashed password
let hashUserPassword = (password) => {
    return new Promise(async (resolve, reject) => {
        try {
            let hashPassword = bcrypt.hashSync(password, salt);
            resolve(hashPassword);
        } catch (error) {
            reject(error);
        }
    });
};

// check email or username or phone number is existed or not
let checkExistInformation = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            let user = await User.findOne({
                where: {
                    [Op.or]: [{ email: data.email }, { username: data.username }, { phone: data.phone }]
                }
            });
            if (user) {
                // Exist
                resolve(true);
            } else {
                // Not exist
                resolve(false);
            }
        } catch (error) {
            reject(error);
        }
    });
};

let createNewPatient = (patientData) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!patientData.email || !patientData.username || !patientData.password || !patientData.phone) {
                resolve({
                    errCode: 1,
                    message: 'Chưa điền đủ thông tin bệnh nhân.'
                });
            }

            // check user was already existed
            let checkExist = await checkExistInformation(patientData);
            const phoneNumberRegex = /([\+84|84|0]+(3|5|7|8|9|1[2|6|8|9]))+([0-9]{8})\b/;
            const isValidPhoneNumber = phoneNumberRegex.test(patientData.phone);

            if (checkExist === true) {
                resolve({
                    errCode: 2,
                    message: 'Bệnh nhân này đã có tài khoản.'
                });
            } else {
                if (isValidPhoneNumber === false) {
                    resolve({
                        errCode: 3,
                        message: 'Số điện thoại không hợp lệ'
                    });
                } else {
                    let hashPasswordBcrypt = await hashUserPassword(patientData.password);
                    let newPatient = await User.create({
                        fullName: patientData.fullName,
                        email: patientData.email,
                        username: patientData.username,
                        password: hashPasswordBcrypt,
                        address: patientData.address,
                        phone: patientData.phone,
                        birthday: patientData.birthday,
                        gender: patientData.gender,
                        role: RoleEnum.PATIENT
                    });

                    if (newPatient) {
                        resolve({
                            errCode: 0,
                            message: 'OK',
                            data: newPatient
                        });
                    }
                }
            }
        } catch (error) {
            reject(error);
        }
    });
}

let updateUserAvatar = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            let user = await User.update(
                { avatar: data.avatar },
                {
                    where: {
                        id: data.id
                    }
                }
            );
            if (user) {
                resolve({
                    errCode: 0,
                    message: 'OK',
                });
            }
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = {
    getAllProvinces,
    getAllDistrictsByProvinceId,
    getAllWardsByDistrictId,
    getPatientInformation,
    getAllPatients,
    createNewPatient,
    updateUserAvatar
};
