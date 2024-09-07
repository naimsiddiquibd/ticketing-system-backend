// const asyncHandler = require('express-async-handler');
// const jwt = require('jsonwebtoken');

// const validateToken = asyncHandler(async(req, res, next) => {
//     let token;
//     let authHeader = req.headers.Authorization || req.headers.authorization;
//     if (authHeader && authHeader.startsWith("Bearer")) {
//         token = authHeader.split(" ")[1];
//         jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
//             if (err) {
//                 res.status(401);
//                 throw new Error("User is not authorized");
//             }
//             req.user = decoded.user;
//             next();
//         });
//     } else {
//         res.status(401);
//         throw new Error("User is not authorized or the token is invalid");
//     }
// });

// module.exports = validateToken;


const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');

const validateToken = asyncHandler(async (req, res, next) => {
    let token;
    const authHeader = req.headers.Authorization || req.headers.authorization;
    
    if (authHeader && authHeader.startsWith("Bearer")) {
        // Extract the token from the Authorization header
        token = authHeader.split(" ")[1];
        
        // Verify the token
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
            if (err) {
                res.status(401);
                throw new Error("User is not authorized");
            }
            console.log("Decoded token:", decoded);
            // Attach the decoded user to the req object
            req.user = decoded.user; // decoded should directly contain the user object if encoded as such
            
            next(); // Proceed to the next middleware or route handler
        });
    } else {
        res.status(401);
        throw new Error("User is not authorized or the token is invalid");
    }
});

module.exports = validateToken;
