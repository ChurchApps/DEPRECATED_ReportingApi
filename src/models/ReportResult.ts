import { Output } from "./Output";

export class ReportResult {
  public displayName?: string;
  public description?: string;
  public tables?: { keyName: string, data: any[] }[];
  public outputs?: Output[];
}