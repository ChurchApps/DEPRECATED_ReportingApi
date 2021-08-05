import { PrismaClient as PrismaMembershipClient } from '../../../prisma/membership/client'
import { PrismaClient as PrismaAttendanceClient } from '../../../prisma/attendance/client'

export class PrismaHelper {

    static membershipClient: PrismaMembershipClient = null;
    static attendanceClient: PrismaAttendanceClient = null;

    static getMembershipClient = () => {
        if (PrismaHelper.membershipClient === null) {
            const url = process.env.DB_PRISMA_MEMBERSHIP;
            console.log(url);
            PrismaHelper.membershipClient = new PrismaMembershipClient({ datasources: { db: { url },  } });
        }
        return PrismaHelper.membershipClient;
    }

    static getAttendanceClient = () => {
        if (PrismaHelper.attendanceClient === null) {
            const url = process.env.DB_PRISMA_ATTENDANCE;
            console.log(url);
            PrismaHelper.attendanceClient = new PrismaAttendanceClient({ datasources: { db: { url } } });
        }
        return PrismaHelper.attendanceClient;
    }

}