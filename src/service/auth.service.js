import User from '../model/user';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { RoleEnum } from '../enum/role.enum';
import Doctor from '../model/doctor';

const { Op } = require('sequelize');
const salt = bcrypt.genSaltSync(10);

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

// check email is existed or not
let checkUserEmail = (userEmail) => {
    return new Promise(async (resolve, reject) => {
        try {
            let user = await User.findOne({
                where: { email: userEmail }
            });
            if (user) {
                resolve(true);
            } else {
                resolve(false);
            }
        } catch (error) {
            reject(error);
        }
    });
};

// check username is existed or not
let checkExistUsername = (username) => {
    return new Promise(async (resolve, reject) => {
        try {
            let user = await User.findOne({
                where: {
                    username: username,
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

// check username is existed or not
let checkExistPhoneNumber = (phone) => {
    return new Promise(async (resolve, reject) => {
        try {
            let user = await User.findOne({
                where: {
                    phone: phone,
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

// Generate Access Token
let generateAccessToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role
        },
        process.env.JWT_ACCESS_KEY,
        { expiresIn: '1h' }
    );
};

// Sign in as a customer
let handleLogin = (email, password) => {
    return new Promise(async (resolve, reject) => {
        try {
            let userData = {};
            let isExist = await checkUserEmail(email);

            if (isExist) {
                // user exist
                let user = await User.findOne({
                    where: { email: email },
                    attributes: ['email', 'role', 'password', 'username', 'id'],
                    raw: true
                });

                if (user) {
                    // compare password
                    let checkPassword = bcrypt.compareSync(password, user.password);

                    if (checkPassword) {
                        // Access Token -> short-lived token
                        const accessToken = generateAccessToken(user);

                        userData.errCode = 0;
                        userData.message = 'OK';
                        delete user.password;
                        userData.data = user;
                        userData.data.accessToken = accessToken;

                        if (user.role === RoleEnum.DOCTOR) {
                            let doctor = await Doctor.findOne({
                                where: {
                                    userId: user.id
                                },
                                raw: true
                            })

                            userData.data.doctorId = doctor?.id,
                            userData.data.doctorStatus = doctor?.status,
                            userData.data.doctorPosition = doctor?.position
                        } else {}
                    } else {
                        userData.errCode = 4;
                        userData.message = 'Sai mật khẩu.';
                    }
                }
            } else {
                // user not found
                userData.errCode = 3;
                userData.message = 'Email này chưa được đăng ký.';
            }

            resolve(userData);
        } catch (error) {
            reject(error);
        }
    });
};

// return data of new customer account
let createNewUser = (userData) => {
    return new Promise(async (resolve, reject) => {
        try {
            // check existed email
            const checkEmail = await checkUserEmail(userData.email)
            if (checkEmail === true) {
                resolve({
                    errCode: 1,
                    message: 'Email này đã tồn tại.'
                })
            }

            // check existed username
            const checkUsername = await checkExistUsername(userData.username)
            if (checkUsername === true) {
                resolve({
                    errCode: 2,
                    message: 'Username này đã tồn tại.'
                })
            }

            // check valid phone number
            const phoneNumberRegex = /([\+84|84|0]+(3|5|7|8|9|1[2|6|8|9]))+([0-9]{8})\b/;
            const isValidPhoneNumber = phoneNumberRegex.test(userData.phone);
            if (isValidPhoneNumber === false) {
                resolve({
                    errCode: 3,
                    message: 'Số điện thoại không hợp lệ'
                });
            }

            // check existed username
            const checkPhone = await checkExistPhoneNumber(userData.phone)
            if (checkPhone === true) {
                resolve({
                    errCode: 4,
                    message: 'Số điên thoại này đã tồn tại.'
                })
            }

            if (!checkEmail && !checkUsername && !checkPhone && isValidPhoneNumber === true ) {
                let hashPasswordBcrypt = await hashUserPassword(userData.password);
                let newUser = await User.create({
                    fullName: userData.fullName,
                    email: userData.email,
                    username: userData.username,
                    password: hashPasswordBcrypt,
                    address: userData.address,
                    phone: userData.phone,
                    birthday: userData.birthday,
                    gender: userData.gender,
                    role: userData.role
                });

                if (newUser) {
                    resolve({
                        errCode: 0,
                        message: 'OK',
                        data: newUser
                    });
                }
            }
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = {
    handleLogin,
    createNewUser,
    generateAccessToken
};
