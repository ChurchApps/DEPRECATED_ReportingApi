import DataLoader from 'dataloader'
import _ from 'lodash'
import { PrismaHelper } from '../helpers'
import { Group } from '../types/SchemaTypes'

export type GroupLoaderType = DataLoader<string, Group | null>;

export class GroupLoader {
  private static getGroup = async (args: string[]) => {
    try {
      const ids = _.uniq(args)
      const groups = await PrismaHelper.getMembershipClient().groups.findMany({
        where: {
          id: {
            in: ids
          }
        }
      })

      return args.map((id) => groups.find((r: Group) => r.id === id));
    } catch (error) {
      console.error(error);
      return args.map(() => null);
    }
  };

  static getLoader = (): GroupLoaderType => new DataLoader<string, Group | null>(GroupLoader.getGroup);

}
