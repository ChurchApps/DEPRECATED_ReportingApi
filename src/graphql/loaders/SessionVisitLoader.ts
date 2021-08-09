import DataLoader from 'dataloader'
import _ from 'lodash'
import { PrismaHelper } from '../helpers'
import { AttendanceVisit } from '../types/SchemaTypes'

export type SessionVisitLoaderType = DataLoader<string, AttendanceVisit[] | null>;

export class SessionVisitLoader {
  private static getVisits = async (args: string[]) => {
    try {
      const sessionIds = _.uniq(args)
      const visits = await PrismaHelper.getAttendanceClient().visitSessions.findMany({
        where: {
          sessionId: {
            in: sessionIds
          }
        },
        include: {
          visit: true
        }
      })

      return args.map((id) => visits.filter((r) => r.sessionId === id).map(item => item.visit));
    } catch (error) {
      console.error(error);
      return args.map(() => null);
    }
  };

  static getLoader = (): SessionVisitLoaderType => new DataLoader<string, AttendanceVisit[] | null>(SessionVisitLoader.getVisits);

}
