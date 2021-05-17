import { injectable } from "inversify";
import { DB } from "../db";
import { Form } from "../models";
import { UniqueIdHelper } from "../helpers";

@injectable()
export class FormRepository {

    public async save(form: Form) {
        if (UniqueIdHelper.isMissing(form.id)) return this.create(form); else return this.update(form);
    }

    public async create(form: Form) {
        form.id = UniqueIdHelper.shortId();
        return DB.query(
            "INSERT INTO forms (id, churchId, name, contentType, createdTime, modifiedTime, removed) VALUES (?, ?, ?, ?, NOW(), NOW(), 0);",
            [form.id, form.churchId, form.name, form.contentType]
        ).then(() => { return form; });
    }

    public async update(form: Form) {
        return DB.query(
            "UPDATE forms SET name=?, contentType=?, modifiedTime=NOW() WHERE id=? and churchId=?",
            [form.name, form.contentType, form.id, form.churchId]
        ).then(() => { return form });
    }

    public async delete(churchId: string, id: string) {
        DB.query("UPDATE forms SET removed=1 WHERE id=? AND churchId=?;", [id, churchId]);
    }

    public async load(churchId: string, id: string) {
        return DB.queryOne("SELECT * FROM forms WHERE id=? AND churchId=? AND removed=0;", [id, churchId]);
    }

    public async loadAll(churchId: string) {
        return DB.query("SELECT * FROM forms WHERE churchId=? AND removed=0;", [churchId]);
    }

    public async loadByIds(churchId: string, ids: string[]) {
        const sql = "SELECT * FROM forms WHERE churchId=? AND removed=0 AND id IN (" + ids.join(",") + ") ORDER by name";
        return DB.query(sql, [churchId]);
    }


    public convertToModel(churchId: string, data: any) {
        const result: Form = { id: data.id, name: data.name, contentType: data.contentType, createdTime: data.createdTime, modifiedTime: data.modifiedTime };
        return result;
    }

    public convertAllToModel(churchId: string, data: any[]) {
        const result: Form[] = [];
        data.forEach(d => result.push(this.convertToModel(churchId, d)));
        return result;
    }

}
