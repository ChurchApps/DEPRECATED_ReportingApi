import _ from 'lodash'
import { AttendanceSession, AttendanceVisit, Group, Person, QueryAttendanceSessionsArgs, ReqContext } from '../types'
import { PaginationHelper, PrismaHelper } from '../helpers'

export class AttendanceResolver {

  private static attendanceSessionsQuery = async (root: any, args: QueryAttendanceSessionsArgs, ctx: ReqContext): Promise<AttendanceSession[] | null> => {
    const { from, size } = PaginationHelper.initPagination(args.pagination);
    const sessions = await PrismaHelper.getAttendanceClient().sessions.findMany({
      skip: from,
      take: size,
    });
    return sessions as AttendanceSession[]
  }

  private static groupQuery = async (root: AttendanceSession, args: null, ctx: ReqContext): Promise<Group | null> => {
    if (!root.group && root.groupId) {
      return ctx.groupLoader.load(root.groupId);
    }
    return root.group;
  }

  private static visitsQuery = async (root: AttendanceSession, args: null, ctx: ReqContext): Promise<AttendanceVisit[] | null> => {
    if (root.id) {
      return ctx.sessionVisitLoader.load(root.id);
    }
    return []
  }

  private static visitPerson = async (root: AttendanceVisit, args: null, ctx: ReqContext): Promise<Person | null> => {
    if (root.personId) {
      return ctx.personLoader.load(root.personId);
    }
    return
  }

  public static getResolver = () => {
    return {
      Query: {
        attendanceSessions: AttendanceResolver.attendanceSessionsQuery,
      },
      AttendanceSession: {
        group: AttendanceResolver.groupQuery,
        visits: AttendanceResolver.visitsQuery,
      },
      AttendanceVisit: {
        person: AttendanceResolver.visitPerson
      }
    }
  }

}

