const jwt = require('jsonwebtoken');
const config = process.env;

const verifyToken = (req, res, next) => {
    const token = req.body.token || req.query.token || req.headers["authorization"];

    if (! token) {
        return res.status(403).send("A token is required for authentication");
    }

    try { // Remove 'Bearer ' prefix if present
        const cleanToken = token.replace(/^Bearer\s+/, "");
        const decoded = jwt.verify(cleanToken, process.env.TOKEN_KEY || "secret_key");
        req.user = decoded;
    } catch (err) {
        return res.status(401).send("Invalid Token");
    }
    return next();
};

const checkRole = (roles) => {
    return(req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({message: "Access denied. Insufficient permissions."});
        }
        next();
    };
};

module.exports = {
    verifyToken,
    checkRole
};
