import { Query, Parameter, Output, PermissionGroup } from ".";

export class Report {
  public displayName?: string;
  public description?: string;
  public queries?: Query[];
  public parameters?: Parameter[];
  public outputs?: Output[];
  public permissions?: PermissionGroup[];
}
