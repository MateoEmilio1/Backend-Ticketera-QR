import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "token.010101";

const generateToken = (id: string, rol: string) => {
    const jwtToken = jwt.sign({ id, rol }, JWT_SECRET, {
        expiresIn: "2h",
    });
    return jwtToken;
};

const verifyToken = (jwtToken: string) => {
    const isOk = jwt.verify(jwtToken, JWT_SECRET);
    return isOk;
};

export { generateToken, verifyToken };
