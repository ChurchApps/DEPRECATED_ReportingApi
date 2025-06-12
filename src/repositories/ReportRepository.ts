import { injectable } from "inversify";
import { DBHelper } from "../helpers/DBHelper";

@injectable()
export class ReportRepository {

  public async run(db: string, sql: string, parameters: any[]) {
    return await DBHelper.query(db, sql, parameters)
  }

}
