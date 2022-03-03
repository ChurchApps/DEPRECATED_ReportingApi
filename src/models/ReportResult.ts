import { Column } from ".";

export class ReportResult {
  public displayName?: string;
  public description?: string;
  public tables?: { keyName: string, data: any[] }[];
  public columns?: Column[];
}