import { PoolHelper } from "./PoolHelper";
import { PoolConnection } from "mysql2/promise";
import { LoggingHelper } from "@churchapps/apihelper";

export class DBHelper {
  // wraps in promise
  static async getConnection(databaseName: string) {
    const pool = await PoolHelper.getPool(databaseName);
    const connection = await pool.getConnection();
    return connection;
  }

  // wraps in promise
  static async getQuery(connection: PoolConnection, sql: string, params: any[]) {
    try {
      const [rows] = await connection.query(sql, params);
      return rows;
    } catch (ex) {
      LoggingHelper.getCurrent().error(ex);
      throw ex;
    }
  }

  public static async query(db: string, sql: string, params: any[]) {
    let result: any = null;
    const connection = await this.getConnection(db);
    try {
      result = await this.getQuery(connection, sql, params);
    } catch (ex) {
      LoggingHelper.getCurrent().error(ex);
    } finally {
      connection.release();
    }
    return result;
  }
}
