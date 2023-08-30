import { ArrayHelper } from "@churchapps/apihelper";
import { Query, Report } from "../models";

export class ReportResultHelper {

  public static combineResults(report: Report) {
    const result = [...report.queries[0].value];
    let depth = 0;
    let keepGoing = true;
    while (keepGoing) {
      const queries: Query[] = ArrayHelper.getAll(report.queries, "depth", depth);
      keepGoing = queries.length > 0;
      queries.forEach(q => {
        if (q.keyName !== "main") ReportResultHelper.combineResult(result, q);
      })
      depth++;
    }
    return result;
  }

  private static combineResult(result: any[], query: Query) {
    // Only works with one condition right now
    // Also only works with 1-1 match. Needs to be expanded for many-to-one
    query.value?.forEach(v => {
      query.joinConditions?.forEach(jc => {
        const childValue = v[jc.child];
        ArrayHelper.getAll(result, jc.parent, childValue).forEach(r => {
          ReportResultHelper.copyValues(r, query.keyName, v);
        });
      });
    });
  }

  private static copyValues(target: any, childKey: string, child: any) {
    Object.getOwnPropertyNames(child)?.forEach(name => {
      target[childKey + "." + name] = child[name]
    })
  }

}
