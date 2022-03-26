import { controller, httpPost, httpGet, interfaces, requestParam, httpDelete } from "inversify-express-utils";
import express from "express";
import { ReportingBaseController } from "./ReportingBaseController"
import { OldReport, Report, Query, ReportResult, Parameter } from "../models"
import { ReportingPermissions } from '../helpers/ReportingPermissions'
import fs from "fs"
import { AuthenticatedUser } from "../apiBase/auth";
import { ArrayHelper } from "../apiBase";



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
      let depth = 0;
      let keepGoing = true;
      while (keepGoing) {
        keepGoing = await this.runQueries(report, depth);
        if (keepGoing) this.populateQueryResultParameters(report, depth)
        depth++;
      }


      // format data

      // return report;
      return this.convertToResult(report);

      // if (!au.checkAccess(ReportingPermissions.reports.edit)) return this.json({}, 401);
      // else return this.repositories.report.convertToModel(au.churchId, await this.repositories.report.load(au.churchId, id));
    });
  }

  private convertToResult(report: Report) {
    const result: ReportResult = { displayName: report.displayName, description: report.description, tables: [], outputs: report.outputs }
    report.queries.forEach(q => result.tables.push({ keyName: q.keyName, data: q.value }));
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

  private populateQueryResultParameters(report: Report, depth: number) {
    report.parameters?.forEach(p => {
      if (p.source === "query") {
        const table = p.sourceKey.split('.')[0];
        const field = p.sourceKey.split('.')[1];
        report.queries.forEach(q => {
          if (q.keyName === table && q.depth === depth && q.value) {
            p.value = [];
            q.value.forEach(v => { p.value.push(v[field]); })
          }
        })
      }
    })
  }

  private async runQueries(report: Report, depth: number) {
    const queries: Query[] = ArrayHelper.getAll(report.queries, "depth", depth);
    if (queries.length > 0) {
      const promises: Promise<void>[] = []
      queries.forEach(q => { promises.push(this.runQuery(q, report)) });
      await Promise.all(promises)
      return true;
    } else return false;
  }


  private async runQuery(query: Query, report: Report) {
    const parameters: any[] = [];

    const storedSql = query.sqlLines.join(" ");

    storedSql.match(/:[A-Za-z0-9]{1,99}/g)?.forEach(m => {
      const keyName = m.replace(":", "");
      const p: Parameter = ArrayHelper.getOne(report.parameters, "keyName", keyName)
      parameters.push(p.value);
    });

    let sql = storedSql;
    storedSql.match(/:[A-Za-z0-9]{1,99}/g)?.forEach(m => { sql = sql.replace(m, "?") });
    query.value = await this.repositories.report.run(query.db, sql, parameters);
  }


}
