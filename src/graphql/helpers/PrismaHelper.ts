import { PrismaClient } from '@prisma/client'

export class PrismaHelper {

    static existingClient: PrismaClient = null;

    static getClient = () => {
        if (PrismaHelper.existingClient === null) {
            const url = process.env.DB_PRISMA_MEMBERSHIP;
            console.log(url);
            PrismaHelper.existingClient = new PrismaClient({ datasources: { db: { url } } });
        }
        return PrismaHelper.existingClient;
    }

}