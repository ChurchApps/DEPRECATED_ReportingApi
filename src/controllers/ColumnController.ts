import { controller, httpPost, httpGet, interfaces, requestParam, httpDelete } from "inversify-express-utils";
import express from "express";
import { ReportingBaseController } from "./ReportingBaseController"
import { Column } from "../models"
import { ReportingPermissions } from '../helpers/ReportingPermissions'

@controller("/columns")
export class ColumnController extends ReportingBaseController {

  @httpGet("/report/:reportId")
  public async getForReport(@requestParam("reportId") reportId: string, req: express.Request<{}, {}, null>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapperAnon(req, res, async () => {
      return this.repositories.column.convertAllToModel("", await this.repositories.column.loadForReport(reportId));
    });
  }


  @httpGet("/:id")
  public async get(@requestParam("id") id: string, req: express.Request<{}, {}, null>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapper(req, res, async (au) => {
      if (!au.checkAccess(ReportingPermissions.reports.edit)) return this.json({}, 401);
      else return this.repositories.column.convertToModel(au.churchId, await this.repositories.column.load(au.churchId, id));
    });
  }

  @httpGet("/")
  public async getAll(req: express.Request<{}, {}, null>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapper(req, res, async (au) => {
      if (!au.checkAccess(ReportingPermissions.reports.edit)) return this.json({}, 401);
      else return this.repositories.column.convertAllToModel(au.churchId, await this.repositories.column.loadAll(au.churchId));
    });
  }

  @httpPost("/")
  public async save(req: express.Request<{}, {}, Column[]>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapper(req, res, async (au) => {
      if (!au.checkAccess(ReportingPermissions.reports.edit)) return this.json({}, 401);
      else {
        const promises: Promise<Column>[] = [];
        req.body.forEach(column => { column.churchId = au.churchId; promises.push(this.repositories.column.save(column)); });
        const result = await Promise.all(promises);
        return this.repositories.column.convertAllToModel(au.churchId, result);
      }
    });
  }

  @httpDelete("/:id")
  public async delete(@requestParam("id") id: string, req: express.Request<{}, {}, null>, res: express.Response): Promise<interfaces.IHttpActionResult> {
    return this.actionWrapper(req, res, async (au) => {
      if (!au.checkAccess(ReportingPermissions.reports.edit)) return this.json({}, 401);
      else await this.repositories.column.delete(au.churchId, id);
    });
  }

}
