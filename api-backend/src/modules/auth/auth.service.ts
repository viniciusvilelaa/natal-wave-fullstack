import { authRepository } from "./auth.repository";
import { ApiError } from "../../utils/api-error";
import { LoginInput, RegisterInput } from "./auth.validation";
import { compareHashPassword, hashPassword } from "../../utils/hash-password";
import { signToken } from "../../utils/jwt";
import { generateRefreshToken, getRefreshTokenExpiryDate, hashRefreshToken } from "../../utils/refreshToken";

type RegisterServiceInput = Omit<RegisterInput, "confirmPassword">;


export async function registerUser(data: RegisterServiceInput) {

    const existUser = await authRepository.findUserByEmail(data.email);

    if (existUser) {
        throw new ApiError(409, "Email already registred");
    }

    const passwordHash = await hashPassword(data.password);

    const user = await authRepository.createUser({
        name: data.name,
        email: data.email,
        passwordHash
    });

    const acessToken = signToken({ sub: user.id, email: user.email });

    const rawRefreshToken = generateRefreshToken();
    const tokenHash = hashRefreshToken(rawRefreshToken);
    const expiresAt = getRefreshTokenExpiryDate();

    await authRepository.createRefreshToken({
        userId: user.id,
        tokenHash,
        expiresAt
    });

    return { user, acessToken, refreshToken: rawRefreshToken }
}

export async function login(data: LoginInput){
    const user = await authRepository.findUserByEmail(data.email);

    if(!user){
        throw new ApiError(401, "Invalid email or password");
    }

    const isPasswordValid = await compareHashPassword(data.password, user.passwordHash);

    if(!isPasswordValid){
        throw new ApiError(401, "Invalid email or password");
    }
    
    const accessToken = signToken({sub: user.id, email: user.email});
    const rawRefreshToken = generateRefreshToken();
    const tokenHash = hashRefreshToken(rawRefreshToken);
    const expiresAt = getRefreshTokenExpiryDate();

    await authRepository.createRefreshToken({
        userId: user.id,
        tokenHash,
        expiresAt
    });

    const { passwordHash, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, accessToken, refreshToken: rawRefreshToken };
}