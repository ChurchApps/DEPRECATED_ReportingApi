import { controller, httpGet, interfaces } from 'inversify-express-utils'
import express from 'express'
import { CustomBaseController } from './CustomBaseController';
import { Permissions } from '../helpers'


@controller("/answers")
export class AnswerController extends CustomBaseController {

    @httpGet("/")
    public async getAll(req: express.Request<{}, {}, null>, res: express.Response): Promise<interfaces.IHttpActionResult> {
        return this.actionWrapper(req, res, async (au) => {
            if (!au.checkAccess(Permissions.forms.view)) return this.json({}, 401);
            else {
                let data = null;
                if (req.query.formSubmissionId !== undefined) data = this.baseRepositories.answer.loadForFormSubmission(au.churchId, req.query.formSubmissionId.toString())
                else data = await this.baseRepositories.answer.loadAll(au.churchId);
                return this.baseRepositories.answer.convertAllToModel(au.churchId, data);
            }
        })
    }
}