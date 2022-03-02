import { Query, Parameter, Column, Permission } from ".";

export class Report {
  public displayName?: string;
  public description?: string;
  public queries?: Query[];
  public parameters?: Parameter[];
  public columns?: Column[];
  public permissions?: Permission[];
}