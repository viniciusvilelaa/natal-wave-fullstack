import { authRepository } from "./auth.repository";
import { ApiError } from "../../utils/api-error";
import { LoginInput, RegisterInput } from "./auth.validation";
import { compareHashPassword, hashPassword } from "../../utils/hash-password";
import { signToken } from "../../utils/jwt";
import { generateRefreshToken, getRefreshTokenExpiryDate, hashRefreshToken } from "../../utils/refreshToken";
import { AuthProvider } from "../../generated/prisma/enums";
import { verifyGoogleToken } from "../../utils/oauth/google";
import { verifyAppleToken } from "../../utils/oauth/apple";

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
export async function login(data: LoginInput) {
    const user = await authRepository.findUserByEmail(data.email);

    if (!user || !user.passwordHash) {
        throw new ApiError(401, "Invalid email or password");
    }

    const isPasswordValid = await compareHashPassword(data.password, user.passwordHash);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid email or password");
    }

    const accessToken = signToken({ sub: user.id, email: user.email });
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
export async function refresh(rawRefreshToken: string) {


    const tokenHash = hashRefreshToken(rawRefreshToken);

    const refreshToken = await authRepository.findRefreshTokenByHash(tokenHash);

    if (!refreshToken?.user) {
        throw new ApiError(401, "Invalid refresh token!");
    }

    const isExpired = refreshToken.expiresAt < new Date();

    if (isExpired) {
        throw new ApiError(401, "Refresh token is expired, please log in again");
    }

    if (refreshToken.revokedAt) {
        await authRepository.revokeAllUserRefreshTokens(refreshToken.userId);
        throw new ApiError(401, "Session compromised, please log in again")
    }

    const accessToken = signToken({ sub: refreshToken.userId, email: refreshToken.user.email });
    const newRawRefreshToken = generateRefreshToken();
    const newTokenHash = hashRefreshToken(newRawRefreshToken);
    const newExpireAt = getRefreshTokenExpiryDate();

    await authRepository.createRefreshToken({
        userId: refreshToken.userId,
        tokenHash: newTokenHash,
        expiresAt: newExpireAt
    });

    await authRepository.revokeRefreshToken(refreshToken.id, newTokenHash);

    return { accessToken, refreshToken: newRawRefreshToken }


}

//Revoga o token para fazer lgout
export async function logout(rawRefreshToken: string) {
    const tokenHash = hashRefreshToken(rawRefreshToken);

    const refreshToken = await authRepository.findRefreshTokenByHash(tokenHash);

    if (!refreshToken) {
        return;
    }

    await authRepository.revokeRefreshToken(refreshToken.id);
}

//Login utilizando OAUTH
export async function loginWithOAuth(provider: AuthProvider, idToken: string){

    //Verifica o token e retorna as informacoes do usuario fornercida pelo provider
    const {sub: providerId, email, name} = provider === 'GOOGLE' 
        ? await verifyGoogleToken(idToken) 
            : await verifyAppleToken(idToken);

    //Caso o provider nao forneça email cai no catch de erro
    if(!email){
        throw new ApiError(400, "OAuth provider did not return a email");
    }

    
    let oauthUser = await authRepository.findByProviderId(provider, providerId);
    
    //Existe usuario com esse provider ja?
    if(!oauthUser){

        //Verifica se existe conta cadastrada com o email do oauth
        let existingUser = await authRepository.findUserByEmail(email);

        //Se existir faz update do usuario e adiciona as informacoes do provider OAUTH
        if(existingUser){
            oauthUser = await authRepository.linkOAuthToUser(existingUser.id, {provider, providerId});
        
        } else {
            
            //Se nao existir nenhum usuario cria um usuario OAuth direto
            oauthUser = await authRepository.createOAuthUser({provider, providerId, email, name});
        }
    }

    //Emite refresh token
    const acessToken = signToken({sub: oauthUser.id, email: oauthUser.email});
    const refreshToken = generateRefreshToken();
    const hashedRefreshToken = hashRefreshToken(refreshToken);
    
    await authRepository.createRefreshToken({
        userId: oauthUser.id,
        tokenHash: hashedRefreshToken,
        expiresAt: getRefreshTokenExpiryDate()
    });

    return {acessToken, refreshToken, user: {id: oauthUser.id, email: oauthUser.email, name: oauthUser.name}}

    
}