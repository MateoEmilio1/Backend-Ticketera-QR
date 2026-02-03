import jwt from "jsonwebtoken";
const { sign, verify } = jwt;

const JWT_SECRET = process.env.JWT_SECRET || "secreto.01";

const generateToken = (id: string, rol: string) => {
    const jwt = sign({ id, rol }, JWT_SECRET, {
        expiresIn: "2h",
    });
    return jwt;
};

const verifyToken = (jwt: string) => {
    const isOk = verify(jwt, JWT_SECRET);
    return isOk;
};

export { generateToken, verifyToken };
