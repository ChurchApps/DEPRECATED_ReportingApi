import { controller, httpGet, interfaces, requestParam } from "inversify-express-utils";
import express from "express";
import { ReportingBaseController } from "./ReportingBaseController"
import { Report, ReportResult, Permission } from "../models"
import fs from "fs"
import { AuthenticatedUser } from "../apiBase/auth";
import { IPermission } from "../apiBase";
import { ReportResultHelper } from "../helpers/ReportResultHelper";
import { RunReportHelper } from "../helpers/RunReportHelper";

@controller("/reports")
export class ReportController extends ReportingBaseController {

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

      if (!this.checkPermissions(report, au)) return this.json({}, 401);
      else {
        this.populateRootParamters(report, au, req);
        await RunReportHelper.runAllQueries(report);

        const resultTable = ReportResultHelper.combineResults(report);
        return this.convertToResult(report, resultTable);
      }
    });
  }

  private checkPermissions(report: Report, au: AuthenticatedUser) {
    let result = true;
    report.permissions.forEach(rpg => {
      const groupResult = this.checkGroup(rpg.requireOne, au);
      if (!groupResult) result = false;  // between groups use AND
    })
    return result;
  }

  // Within groups use OR
  private checkGroup(pa: Permission[], au: AuthenticatedUser) {
    let result = false;
    pa.forEach(p => {
      const ip: IPermission = { action: p.action, contentType: p.contentType, apiName: p.api }
      if (au.checkAccess(ip)) result = true;
    });
    return result;
  }

  private convertToResult(report: Report, table: any[]) {
    const result: ReportResult = { displayName: report.displayName, description: report.description, outputs: report.outputs }
    // report.queries.forEach(q => result.tables.push({ keyName: q.keyName, data: q.value }));
    result.table = table
    return result;
  }

  private populateRootParamters(report: Report, au: AuthenticatedUser, req: express.Request<{}, {}, null>) {
    report.parameters?.forEach(p => {
      if (p.source === "au") {
        if (p.sourceKey === "churchId") p.value = au.churchId;
      } else {
        p.value = req.query[p.keyName]?.toString() || "";
      }
    })
  }

}
