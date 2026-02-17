import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt.handle.js";

interface RequestExt extends Request {
    user?: string | object;
}

const checkSession = (req: RequestExt, res: Response, next: NextFunction) => {
    try {
        const jwt = req.cookies.token || "";

        if (!jwt) {
            res.status(401);
            res.send("NO_TIENES_UN_JWT_VALIDO");
            return;
        }

        const isUser = verifyToken(`${jwt}`);
        if (!isUser) {
            res.status(401);
            res.send("NO_TIENES_UN_JWT_VALIDO");
        } else {
            req.user = isUser;
            next();
        }
    } catch (e) {
        console.log({ e });
        res.status(400);
        res.send("SESSION_NO_VALIDA");
    }
};

export { checkSession };
