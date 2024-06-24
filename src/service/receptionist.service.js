import bcrypt from 'bcryptjs';
const salt = bcrypt.genSaltSync(10);
const { Op } = require("sequelize");
const { GenderEnum } = require("../enum/gender.enum");
const { RoleEnum } = require("../enum/role.enum");
const User = require("../model/user");

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

let createNewReceptionist = (receptionistData) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!receptionistData.email || !receptionistData.username || !receptionistData.password || !receptionistData.phone) {
                resolve({
                    errCode: 1,
                    message: 'Chưa điền đủ thông tin tiếp tân'
                });
            }

            // check user was already existed
            let checkExist = await checkExistInformation(receptionistData);
            const phoneNumberRegex = /([\+84|84|0]+(3|5|7|8|9|1[2|6|8|9]))+([0-9]{8})\b/;
            const isValidPhoneNumber = phoneNumberRegex.test(receptionistData.phone);

            if (checkExist === true) {
                resolve({
                    errCode: 2,
                    message: 'Tiếp tân này đã có tài khoản.'
                });
            } else {
                if (isValidPhoneNumber === false) {
                    resolve({
                        errCode: 3,
                        message: 'Số điện thoại không hợp lệ'
                    });
                } else {
                    let hashPasswordBcrypt = await hashUserPassword(receptionistData.password);
                    let newReceptionist = await User.create({
                        fullName: receptionistData.fullName,
                        email: receptionistData.email,
                        username: receptionistData.username,
                        password: hashPasswordBcrypt,
                        address: receptionistData.address,
                        phone: receptionistData.phone,
                        birthday: receptionistData.birthday,
                        gender: receptionistData.gender,
                        role: RoleEnum.RECEPTIONIST
                    });

                    if (newReceptionist) {
                        resolve({
                            errCode: 0,
                            message: 'OK',
                            data: newReceptionist
                        });
                    }
                }
            }
        } catch (error) {
            reject(error);
        }
    });
}

let getAllReceptionists = (gender, province, district, ward) => {
    return new Promise(async (resolve, reject) => {
        try {
            let whereClause = {};
            whereClause.role = RoleEnum.RECEPTIONIST

            if (gender === 'male') {
                whereClause.gender = GenderEnum.MALE
            } else if (gender === 'female') {
                whereClause.gender = GenderEnum.FEMALE
            } else if (gender === 'others') {
                whereClause.gender = GenderEnum.OTHERS
            }

            let addressConditions = [];
            if (province) {
                addressConditions.push({ address: { [Op.like]: `%${province}` } });
            }
            if (district) {
                addressConditions.push({ address: { [Op.like]: `%${district}%` } });
            }
            if (ward) {
                addressConditions.push({ address: { [Op.like]: `${ward}%` } });
            }

            if (addressConditions.length > 0) {
                whereClause[Op.and] = addressConditions;
            }

            const receptionists = await User.findAll({
                where: whereClause,
                attributes: ['id', 'fullName', 'email', 'username', 'phone', 'address', 'gender', 'birthday']
            });

            const length = receptionists.length;

            resolve({
                errCode: 0,
                message: 'OK',
                data: receptionists,
                length: length
            })
        } catch (error) {
            reject(error)
        }
    })
}

let deleteReceptionist = (receptionistId) => {
    return new Promise(async (resolve, reject) => {
        try {
            const result = await User.destroy({
                where: { id: receptionistId }
            });
    
            if (result === 1) {
                resolve({
                    errCode: 0,
                    message: 'Xóa tiếp tân thành công'
                })
            }
        } catch (error) {
            reject(error)
        }
    })
}

let editReceptionist = (receptionistId, data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const phoneNumberRegex = /([\+84|84|0]+(3|5|7|8|9|1[2|6|8|9]))+([0-9]{8})\b/;
            const isValidPhoneNumber = phoneNumberRegex.test(data.phone);

            if (isValidPhoneNumber === false) {
                resolve({
                    errCode: 2,
                    message: 'Số điện thoại không hợp lệ'
                });
            } else {
                const [result] = await User.update(
                    { phone: data.phone },
                    {
                        where: { id: receptionistId }
                    }
                )
        
                if (result === 1) {
                    resolve({
                        errCode: 0,
                        message: 'Sửa tiếp tân thành công'
                    })
                }
            }
        } catch (error) {
            reject(error)
        }
    })
}

module.exports = {
    createNewReceptionist,
    getAllReceptionists,
    deleteReceptionist,
    editReceptionist
};