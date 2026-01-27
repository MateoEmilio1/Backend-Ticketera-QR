import bcrypt from "bcrypt";

const encrypt = async (password: string): Promise<string> => {
    const hash = await bcrypt.hash(password, 10);
    return hash;
};

const verified = async (pass: string, passHash: string): Promise<boolean> => {
    const isCorrect = await bcrypt.compare(pass, passHash);
    return isCorrect;
};

export { encrypt, verified };
