import { controller, httpPost, httpGet, interfaces, requestParam, httpDelete } from "inversify-express-utils";
import express from "express";
import { ReportingBaseController } from "./ReportingBaseController"
import { OldReport, Report, Query, ReportResult, Parameter } from "../models"
import { ReportingPermissions } from '../helpers/ReportingPermissions'
import fs from "fs"
import { AuthenticatedUser } from "../apiBase/auth";
import { ArrayHelper } from "../apiBase";
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

      // check permissions
      this.populateRootParamters(report, au, req);
      await RunReportHelper.runAllQueries(report);

      const resultTable = ReportResultHelper.combineResults(report);
      // format data

      // return report;
      return this.convertToResult(report, resultTable);

      // if (!au.checkAccess(ReportingPermissions.reports.edit)) return this.json({}, 401);
      // else return this.repositories.report.convertToModel(au.churchId, await this.repositories.report.load(au.churchId, id));
    });
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
