import { injectable } from "inversify";
import { DB } from "../apiBase/db";
import { Report } from "../models";
import { UniqueIdHelper } from "../helpers";


@injectable()
export class ReportRepository {

    public async save(report: Report) {
        if (UniqueIdHelper.isMissing(report.id)) return this.create(report); else return this.update(report);
    }

    public async create(report: Report) {
        report.id = UniqueIdHelper.shortId();
        return DB.query(
            "INSERT INTO reports (id, churchId, name, query) VALUES (?, ?, ?, ?);",
            [report.id, report.churchId, report.name, report.query]
        ).then(() => { return report; });
    }

    public async update(report: Report) {
        return DB.query(
            "UPDATE reports SET name=?, query=? WHERE id=? and churchId=?",
            [report.name, report.query, report.id, report.churchId]
        ).then(() => { return report });
    }

    public async delete(churchId: string, id: string) {
        DB.query("DELETE reports SET WHERE id=? AND churchId=?;", [id, churchId]);
    }

    public async load(churchId: string, id: string) {
        return DB.queryOne("SELECT * FROM reports WHERE id=? AND churchId=?;", [id, churchId]);
    }

    public async loadAll(churchId: string) {
        return DB.query("SELECT * FROM reports WHERE churchId=?;", [churchId]);
    }

    public convertToModel(churchId: string, data: any) {
        const result: Report = { id: data.id, name: data.name, query: data.query };
        return result;
    }

    public convertAllToModel(churchId: string, data: any[]) {
        const result: Report[] = [];
        data.forEach(d => result.push(this.convertToModel(churchId, d)));
        return result;
    }

}
