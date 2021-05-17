import { injectable } from "inversify";
import { DB } from "../db";
import { FormSubmission } from "../models";
import { DateTimeHelper } from '../helpers';
import { UniqueIdHelper } from "../helpers";

@injectable()
export class FormSubmissionRepository {

    public async save(formSubmission: FormSubmission) {
        if (UniqueIdHelper.isMissing(formSubmission.id)) return this.create(formSubmission); else return this.update(formSubmission);
    }

    public async create(formSubmission: FormSubmission) {
        const submissionDate = DateTimeHelper.toMysqlDate(formSubmission.submissionDate);
        const revisionDate = DateTimeHelper.toMysqlDate(formSubmission.revisionDate);
        formSubmission.id = UniqueIdHelper.shortId();
        return DB.query(
            "INSERT INTO formSubmissions (id, churchId, formId, contentType, contentId, submissionDate, submittedBy, revisionDate, revisedBy) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);",
            [formSubmission.id, formSubmission.churchId, formSubmission.formId, formSubmission.contentType, formSubmission.contentId, submissionDate, formSubmission.submittedBy, revisionDate, formSubmission.revisedBy]
        ).then(() => { return formSubmission; });
    }

    public async update(formSubmission: FormSubmission) {
        return DB.query(
            "UPDATE formSubmissions SET revisionDate=NOW(), contentId=?, revisedBy=? WHERE id=? and churchId=?",
            [formSubmission.contentId, formSubmission.revisedBy, formSubmission.id, formSubmission.churchId]
        ).then(() => { return formSubmission });
    }

    public async delete(churchId: string, id: string) {
        const sql = "DELETE FROM formSubmissions WHERE id=? AND churchId=?;";
        // const params = [id, churchId];  //I can't figure ot why, but "id" is a string here.
        const params = [parseInt(id.toString(), 0), churchId];
        DB.query(sql, params);
    }

    public async load(churchId: string, id: string) {
        return DB.queryOne("SELECT * FROM formSubmissions WHERE id=? AND churchId=?;", [id, churchId]);
    }

    public async loadAll(churchId: string) {
        return DB.query("SELECT * FROM formSubmissions WHERE churchId=?;", [churchId]);
    }

    public async loadForContent(churchId: string, contentType: string, contentId: string) {
        return DB.query("SELECT * FROM formSubmissions WHERE churchId=? AND contentType=? AND contentId=?;", [churchId, contentType, contentId]);
    }

    public convertToModel(churchId: string, data: any) {
        const result: FormSubmission = { id: data.id, formId: data.formId, contentType: data.contentType, contentId: data.contentId, submissionDate: data.subissionDate, submittedBy: data.submittedBy, revisionDate: data.revisionDate, revisedBy: data.revisedBy };
        return result;
    }

    public convertAllToModel(churchId: string, data: any[]) {
        const result: FormSubmission[] = [];
        data.forEach(d => result.push(this.convertToModel(churchId, d)));
        return result;
    }

}
