import DataLoader from 'dataloader'
import _ from 'lodash'
import { PrismaHelper } from '../helpers'
import { GivingDonationBatch } from '../types/SchemaTypes'
import { donationBatches } from '../../../prisma/giving/client'

export type DonationBatchLoaderType = DataLoader<string, GivingDonationBatch | null>;

export class DonationBatchLoader {
  private static getDonationBatch = async (args: string[]) => {
    try {
      const ids = _.uniq(args)
      const batches = await PrismaHelper.getGivingClient().donationBatches.findMany({
        where: {
          id: {
            in: ids
          }
        }
      })

      return args.map((id) => batches.find((r: donationBatches) => r.id === id));
    } catch (error) {
      console.error(error);
      return args.map(() => null);
    }
  };

  static getLoader = (): DonationBatchLoaderType => new DataLoader<string, GivingDonationBatch | null>(DonationBatchLoader.getDonationBatch);

}
