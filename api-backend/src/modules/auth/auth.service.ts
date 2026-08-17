import { authRepository } from "./auth.repository";
import { ApiError } from "../../utils/api-error";
import { LoginInput, RefreshTokenInput, RegisterInput } from "./auth.validation";
import { compareHashPassword, hashPassword } from "../../utils/hash-password";
import { signToken } from "../../utils/jwt";
import { generateRefreshToken, getRefreshTokenExpiryDate, hashRefreshToken } from "../../utils/refreshToken";
import { success } from "zod";

type RegisterServiceInput = Omit<RegisterInput, "confirmPassword">;

//Funcao para registrar usuario novo e gerar automaticamente o refreshToken
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

//Funcao de login de usuario, verifica credenciais e cria refresh token
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

//Atualiza o refreshToken
export async function refresh(rawRefreshToken: string){
    

    const tokenHash = hashRefreshToken(rawRefreshToken);

    const refreshToken = await authRepository.findRefreshTokenByHash(tokenHash);

    if(!refreshToken?.user){
        throw new ApiError(401, "Invalid refresh token!");
    }

    const isExpired = refreshToken.expiresAt < new Date();

    if(isExpired){
        throw new ApiError(401,"Refresh token is expired, please log in again");
    }

    if(refreshToken.revokedAt){
        await authRepository.revokeAllUserRefreshTokens(refreshToken.userId);
        throw new ApiError(401, "Session compromised, please log in again")
    }

    const accessToken = signToken({sub: refreshToken.userId, email: refreshToken.user.email});
    const newRawRefreshToken = generateRefreshToken();
    const newTokenHash = hashRefreshToken(newRawRefreshToken);
    const newExpireAt = getRefreshTokenExpiryDate();

    await authRepository.createRefreshToken({
        userId: refreshToken.userId,
        tokenHash: newTokenHash,
        expiresAt: newExpireAt
    });

    await authRepository.revokeRefreshToken(refreshToken.id, newTokenHash);

    return { accessToken, refreshToken: newRawRefreshToken}


}

//Revoga o token para fazer lgout
export async function Logout(rawRefreshToken: string){
    const tokenHash = hashRefreshToken(rawRefreshToken);

    const refreshToken = await authRepository.findRefreshTokenByHash(tokenHash);

    if(!refreshToken){
        return 
    }

    await authRepository.revokeRefreshToken(refreshToken.id);
}