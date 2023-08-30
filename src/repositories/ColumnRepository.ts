import { injectable } from "inversify";

@injectable()
export class ColumnRepository {
  /*

  public async save(column: Column) {
    if (UniqueIdHelper.isMissing(column.id)) return this.create(column); else return this.update(column);
  }

  public async create(column: Column) {
    column.id = UniqueIdHelper.shortId();
    return DB.query(
      "INSERT INTO columns (id, churchId, columnId, depth, field, title, sort) VALUES (?, ?, ?, ?, ?, ?, ?);",
      [column.id, column.churchId, column.reportId, column.depth, column.field, column.title, column.sort]
    ).then(() => { return column; });
  }

  public async update(column: Column) {
    return DB.query(
      "UPDATE columns SET depth=?, field=?, title=?, sort=? WHERE id=? and churchId=?",
      [column.depth, column.field, column.title, column.sort, column.id, column.churchId]
    ).then(() => { return column });
  }

  public async delete(churchId: string, id: string) {
    DB.query("DELETE columns WHERE id=? AND churchId=?;", [id, churchId]);
  }

  public async load(churchId: string, id: string) {
    return DB.queryOne("SELECT * FROM columns WHERE id=? AND churchId=?;", [id, churchId]);
  }

  public async loadAll(churchId: string) {
    return DB.query("SELECT * FROM columns WHERE churchId=?;", [churchId]);
  }

  public async loadForReport(reportId: string) {
    return DB.query("SELECT * FROM columns WHERE reportId=?;", [reportId]);
  }

  public convertToModel(churchId: string, data: any) {
    const result: Column = { id: data.id, reportId: data.reportId, depth: data.depth, field: data.field, title: data.title, sort: data.sort };
    return result;
  }

  public convertAllToModel(churchId: string, data: any[]) {
    const result: Column[] = [];
    data.forEach(d => result.push(this.convertToModel(churchId, d)));
    return result;
  }*/

}
