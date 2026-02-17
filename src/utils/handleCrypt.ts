import { hash, compare } from "bcryptjs";

const encrypt = async (password: string): Promise<string> => {
    const passwordHash = await hash(password, 8);
    return passwordHash;
};

const verified = async (password: string, hash: string): Promise<boolean> => {
    const isCorrect = await compare(password, hash);
    return isCorrect;
};

export { encrypt, verified };
