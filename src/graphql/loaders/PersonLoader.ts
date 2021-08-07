import DataLoader from 'dataloader'
import _ from 'lodash'
import { PrismaHelper } from '../helpers'
import { Person } from '../types/SchemaTypes'

export type PersonLoaderType = DataLoader<string, Person | null>;

export class PersonLoader {
  private static getPerson = async (args: string[]) => {
    try {
      const ids = _.uniq(args)
      const people = await PrismaHelper.getMembershipClient().people.findMany({
        where: {
          id: {
            in: ids
          }
        }
      })

      return args.map((id) => people.find((r: Person) => r.id === id));
    } catch (error) {
      console.error(error);
      return args.map(() => null);
    }
  };

  static getLoader = (): PersonLoaderType => new DataLoader<string, Person | null>(PersonLoader.getPerson);

}
