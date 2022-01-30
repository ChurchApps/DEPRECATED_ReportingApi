import { PrismaClient } from '../../.prisma/client'

export class PrismaHelper {

  static membershipClient: PrismaClient = null;
  static attendanceClient: PrismaClient = null;
  static givingClient: PrismaClient = null;

  static getMembershipClient = () => {
    if (PrismaHelper.membershipClient === null) {
      const url = process.env.DB_PRISMA_MEMBERSHIP;
      console.log(url);
      PrismaHelper.membershipClient = new PrismaClient({ datasources: { db: { url }, } });
    }
    return PrismaHelper.membershipClient;
  }

  static getAttendanceClient = () => {
    if (PrismaHelper.attendanceClient === null) {
      const url = process.env.DB_PRISMA_ATTENDANCE;
      console.log(url);
      PrismaHelper.attendanceClient = new PrismaClient({ datasources: { db: { url } } });
    }
    return PrismaHelper.attendanceClient;
  }

  static getGivingClient = () => {
    if (PrismaHelper.givingClient === null) {
      const url = process.env.DB_PRISMA_GIVING;
      console.log(url);
      PrismaHelper.givingClient = new PrismaClient({ datasources: { db: { url } } });
    }
    return PrismaHelper.givingClient;
  }

}