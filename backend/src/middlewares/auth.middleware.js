import { APIerror } from "../utils/APIerror.js";
import { asynchandler } from "../utils/asynchandler.js";
import { User } from "../models/user.model.js";
import pkg from "jsonwebtoken";

const { verify } = pkg;

const verifyAccessToken = asynchandler(async (req, res, next) => {
    const token =
        req.cookies?.accessToken ||
        req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        req.user = null; // Mark user as unauthenticated but allow the request to proceed
        return next();
    }

    try {
        const decodedToken = verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decodedToken?._id).select(
            "-password -refreshToken"
        );

        if (!user) {
            return next(
                new APIerror(401, "Unauthorized - Invalid access token")
            );
        }

        req.user = user;
        next();
    } catch (error) {
        return next(new APIerror(401, "Invalid or expired access token"));
    }
});

export { verifyAccessToken };
