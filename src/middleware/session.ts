import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt.handle.js";

const checkSession = (req: Request, res: Response, next: NextFunction) => {
    try {
        const jwtByUser = req.headers.authorization || "";
        const jwtToken = jwtByUser.split(" ").pop(); // bearer 123123
        const isUser = verifyToken(`${jwtToken}`) as { id: string, rol: string };

        if (!isUser) {
            res.status(401);
            res.send("NO_TIENES_UN_JWT_VALIDO");
        } else {
            (req as any).user = isUser;
            next();
        }
    } catch (e) {
        res.status(400);
        res.send("SESSION_NO_VALIDA");
    }
};

export { checkSession };
