import jwt from 'jsonwebtoken';

// Verify Access token
const verifyToken = async (req, res, next) => {
    const authHeader = req.header("authorization");

    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({ msg: "Chưa xác thực người dùng" });
    }

    try {
        const verified = jwt.verify(
            token, 
            process.env.JWT_ACCESS_KEY,
            { algorithms : ['HS256'] }
        );

        req.user = verified;
        next();
    } catch (err) {
        return res.status(403).json({ msg: "Quyền truy cập bị từ chối" });
    }
}

// Authorization
const verifyRole = (roles) => {
    return (req, res, next) => {
        const user = req.user;

        // Return true if at least one element in array satisfy
        const validRole = roles.some(role => user && user.role === role);
        if (validRole) {
            next();
        } else {
            res.status(403).json({ message: 'Quyền truy cập bị từ chối' });
        }
    };
}

module.exports = {
    verifyToken,
    verifyRole   
}
