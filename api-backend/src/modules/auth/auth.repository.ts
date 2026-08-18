import { AuthProvider } from "../../generated/prisma/enums";
import { prisma } from "../../lib/prisma"

export const authRepository = {

    //Encontra usuario especifico atraves do email
    findUserByEmail(email: string) {
        return prisma.user.findUnique({ where: { email } });
    },

    //Cria usuario
    createUser(data: { name: string; email: string; passwordHash: string }) {
        return prisma.user.create({
            data,
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
            },
        });
    },

    //Cria usuario utilizando OAUTH sem passwordHash
    createOAuthUser({provider, providerId, email, name}: { provider: AuthProvider, providerId: string, email: string, name?: string}){
        return prisma.user.create({
            data: {
                provider,
                providerId,
                email,
                name: name ?? email.split('@')[0],
                passwordHash: null
            }
        })

    },

    //Encontra usuario pelo ID
    findUserById(id: string) {
        return prisma.user.findUnique({
            where: { id },
            select: { id: true, name: true, email: true, createdAt: true }
        });
    },

    //Cria um novo refreshToken
    createRefreshToken(data: {
        userId: string;
        tokenHash: string;
        expiresAt: Date;
    }) {
        return prisma.refreshToken.create({ data });
    },

    //Encontra o token pelo hash
    findRefreshTokenByHash(tokenHash: string) {
        return prisma.refreshToken.findUnique({
            where: { tokenHash },
            include: { user: true }
        })
    },

    //Revoga o refreshToken
    revokeRefreshToken(id: string, replacedByToken?: string) {
        return prisma.refreshToken.update({
            where: { id },
            data: {
                revokedAt: new Date(),
                ...(replacedByToken && { replacedByToken }),
            },
        });
    },

    //Revoga todos os refreshTokens do usuario
    revokeAllUserRefreshTokens(userId: string) {
        return prisma.refreshToken.updateMany({
            where: { userId, revokedAt: null },
            data: { revokedAt: new Date() },
        });
    },

    findByProviderId(provider: AuthProvider, providerId: string) {
        return prisma.user.findUnique({
            where: {
                provider_providerId: { provider, providerId }
            }
        })
    }

}