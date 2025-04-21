import { controller, httpGet, interfaces, requestParam } from "inversify-express-utils";
import express from "express";
import { ReportingBaseController } from "./ReportingBaseController";
import { Report, ReportResult, Permission } from "../models";
import fs from "fs";
import { ArrayHelper, AuthenticatedUser, IPermission } from "@churchapps/apihelper";
import { ReportResultHelper } from "../helpers/ReportResultHelper";
import { RunReportHelper } from "../helpers/RunReportHelper";

@controller("/reports")
export class ReportController extends ReportingBaseController {

  // just for the group attendance download
  @httpGet("/groupAttendanceDownload/run")
  public async groupAttDownload(req: express.Request<{}, {}, null>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapper(req, res, async (au) => {
      const contents = fs.readFileSync("./reports/" + "groupAttendanceDownload" + ".json", "utf8");
      const report: Report = JSON.parse(contents);

      if (!this.checkPermissions(report, au)) return this.json({}, 401);
      else {
        this.populateRootParamters(report, au, req);
        await RunReportHelper.runAllQueries(report);

        const resultTable = this.combineGroupAttDwnldResult(report);
        return this.convertToResult(report, resultTable);
      }
    });
  }

  @httpGet("/:keyName")
  public async get(@requestParam("keyName") keyName: string, req: express.Request<{}, {}, null>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapper(req, res, async (au) => {
      const contents = fs.readFileSync("./reports/" + keyName + ".json", "utf8");
      const report: Report = JSON.parse(contents);
      return report;
    });
  }

  @httpGet("/:keyName/run")
  public async run(@requestParam("keyName") keyName: string, req: express.Request<{}, {}, null>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapper(req, res, async (au) => {
      const contents = fs.readFileSync("./reports/" + keyName + ".json", "utf8");
      const report: Report = JSON.parse(contents);

      console.log("report loaded");

      if (!this.checkPermissions(report, au)) return this.json({}, 401);
      else {
        console.log("permission check passed");
        this.populateRootParamters(report, au, req);
        console.log("parameters populated");
        await RunReportHelper.runAllQueries(report);
        console.log("queries ran");

        const resultTable = ReportResultHelper.combineResults(report);
        console.log("result table generated");
        return this.convertToResult(report, resultTable);
      }
    });
  }

  private checkPermissions(report: Report, au: AuthenticatedUser) {
    let result = true;
    report.permissions.forEach((rpg) => {
      const groupResult = this.checkGroup(rpg.requireOne, au);
      if (!groupResult) result = false; // between groups use AND
    });
    return result;
  }

  // Within groups use OR
  private checkGroup(pa: Permission[], au: AuthenticatedUser) {
    let result = false;
    pa.forEach((p) => {
      const ip: IPermission = { action: p.action, contentType: p.contentType, apiName: p.api };
      if (au.checkAccess(ip)) result = true;
    });
    return result;
  }

  private convertToResult(report: Report, table: any[]) {
    const result: ReportResult = { displayName: report.displayName, description: report.description, outputs: report.outputs };
    // report.queries.forEach(q => result.tables.push({ keyName: q.keyName, data: q.value }));
    result.table = table;
    return result;
  }

  private populateRootParamters(report: Report, au: AuthenticatedUser, req: express.Request<{}, {}, null>) {
    report.parameters?.forEach((p) => {
      if (p.source === "au") {
        if (p.sourceKey === "churchId") p.value = au.churchId;
      } else {
        p.value = req.query[p.keyName]?.toString() || "";
      }
    });
  }

  private combineGroupAttDwnldResult(report: Report) {
    const result: any[] = [];
    const serviceArray: any[] = [];
    const { value: attendance } = ArrayHelper.getOne(report.queries, "keyName", "main");
    const { value: groups } = ArrayHelper.getOne(report.queries, "keyName", "groups");
    const { value: groupMembers } = ArrayHelper.getOne(report.queries, "keyName", "groupMembers");
    const { value: people } = ArrayHelper.getOne(report.queries, "keyName", "people");

    // get all the unique headings of service and times.
    const serviceIds = ArrayHelper.getUniqueValues(attendance, "serviceId");
    serviceIds?.forEach((id) => {
      const timeIds = ArrayHelper.getAll(attendance, "serviceId", id);
      const uniqueTimeIds = ArrayHelper.getUniqueValues(timeIds, "serviceTimeId");
      uniqueTimeIds?.forEach((tId) => {
        const att = ArrayHelper.getOne(timeIds, "serviceTimeId", tId);
        serviceArray.push({
          name: att.serviceName + "-" + att.serviceTimeName,
          value: att.serviceId + "//" + att.serviceTimeId,
        });
      });
    });

    // for each group and it's members, decide it's attendance status
    groups?.forEach((g: any) => {
      const getGroupMembers = ArrayHelper.getAll(groupMembers, "groupId", g.id);
      getGroupMembers?.forEach((gm: any) => {
        const person = ArrayHelper.getOne(people, "id", gm.personId);
        const attendanceStatus: any = {};
        serviceArray?.forEach((ser) => {
          const serId = ser?.value.split("//")[0];
          const serTimeId = ser?.value.split("//")[1];
          const getValue = attendance.filter(
            (a: any) =>
              a.groupId === g.id &&
              a.personId === person.id &&
              a.serviceId === serId &&
              a.serviceTimeId === serTimeId
          );
          if (getValue.length > 0) {
            attendanceStatus[ser.name] = "present";
          } else {
            attendanceStatus[ser.name] = "absent";
          }
        });

        result.push({
          displayName: person.displayName,
          personId: person.id,
          groupName: g.groupName,
          groupId: g.id,
          ...attendanceStatus,
        });
      });
    });

    return result;
  }
}
