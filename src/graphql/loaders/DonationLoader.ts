import DataLoader from 'dataloader'
import _ from 'lodash'
import { PrismaHelper } from '../helpers'
import { GivingDonation } from '../types/SchemaTypes'
import { donations } from '../../.prisma/client'

export type DonationLoaderType = DataLoader<string, GivingDonation | null>;

export class DonationLoader {
  private static getDonation = async (args: string[]) => {
    try {
      const ids = _.uniq(args)
      const result = await PrismaHelper.getGivingClient().donations.findMany({
        where: {
          id: {
            in: ids
          }
        }
      })

      return args.map((id) => result.find((r: donations) => r.id === id));
    } catch (error) {
      console.error(error);
      return args.map(() => null);
    }
  };

  static getLoader = (): DonationLoaderType => new DataLoader<string, GivingDonation | null>(DonationLoader.getDonation);

}
