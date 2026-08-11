import bcrypt from "bcrypt"
import { env } from "../config/env"

export async function hashPassword(plainPassword: string): Promise<string>{
    const passwordHashed = bcrypt.hash(plainPassword, env.BCRYPT_SALT_ROUNDS);

    return passwordHashed;
}

export async function compareHashPassword(plainPassword: string, passwordHash: string): Promise<boolean>{
    return bcrypt.compare(plainPassword, passwordHash);
}