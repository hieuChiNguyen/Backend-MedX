import User from '../model/user';
import authService from '../service/auth.service';
import jwt from 'jsonwebtoken';

// Generate Refresh Token
let generateRefreshToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role
        },
        process.env.JWT_REFRESH_KEY,
        { expiresIn: '30d' }
    );
};

// Create a new user
let handleRegister = async (req, res) => {
    try {
        await User.sync();
        let userData = req.body;

        let user = await authService.createNewUser(userData);
        if (user.errCode === 0) {
            return res.status(201).json(user);
        } else if (user.errCode !== 0) {
            return res.status(400).json(user);
        }
    } catch (error) {
        return res.status(400).json({
            errCode: 5,
            message: 'Chưa điền đủ thông tin người dùng.'
        });
    }
};

// Login an existed user
let handleLogin = async (req, res) => {
    let email = req.body.email;
    let password = req.body.password;

    // validate
    if (!email) {
        return res.status(400).json({
            errCode: 1,
            message: 'Chưa điền email.'
        });
    } else if (!password) {
        return res.status(400).json({
            errCode: 2,
            message: 'Chưa điền mật khẩu.'
        });
    }

    let user = await authService.handleLogin(email, password);

    // validate
    if (user.errCode === 3 || user.errCode === 4) {
        return res.status(404).json(user);
    } else {
        // Refresh Token -> long-lived token
        const refreshToken = generateRefreshToken(user.data);

        // Store refresh token into Cookies
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json(user);
    }
};

// Log out an account
let handleLogout = async (req, res) => {
    res.clearCookie('refreshToken');
    return res.status(200).json({
        message: 'Đăng xuất thành công.'
    });
};

// Reset access token and refresh token
let handleRefreshToken = async (req, res) => {
    // Take refresh token from cookies
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({
            message: 'You are not authenticated !'
        });
    } else {
        jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY, (error, user) => {
            if (error) {
                console.log(error);
            }

            let date = new Date();
            if (user.exp < date.getTime() / 1000) {
                // Create a new refresh token
                const newRefreshToken = generateRefreshToken(user);

                // Store new refresh token into Cookies
                res.cookie('refreshToken', newRefreshToken, {
                    httpOnly: true,
                    secure: false,
                    sameSite: 'strict',
                    maxAge: 30 * 24 * 60 * 60 * 1000
                });
            }

            // Create a new access token
            const newAccessToken = authService.generateAccessToken(user);

            return res.status(200).json({
                message: 'Create new access token successfully !',
                newAccessToken: newAccessToken
            });
        });
    }
};

module.exports = {
    handleLogin,
    handleRegister,
    handleLogout,
    handleRefreshToken
};
