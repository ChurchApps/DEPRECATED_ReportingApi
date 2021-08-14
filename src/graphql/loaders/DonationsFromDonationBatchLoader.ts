import DataLoader from 'dataloader'
import _ from 'lodash'
import { PrismaHelper } from '../helpers'
import { GivingDonation } from '../types/SchemaTypes'

export type DonationsFromDonationBatchLoaderType = DataLoader<string, GivingDonation[] | null>;

export class DonationsFromDonationBatchLoader {
  private static getDonationsFromDonationBatch = async (args: string[]) => {
    try {
      const ids = _.uniq(args)
      const donations = await PrismaHelper.getGivingClient().donations.findMany({
        where: {
          batchId: { in: ids }
        }
      })
      return args.map((id) => donations.filter((fd) => fd.batchId === id))
    } catch (error) {
      console.error(error)
      return args.map(() => null)
    }
  }

  public static getLoader = (): DonationsFromDonationBatchLoaderType =>
    new DataLoader<string, GivingDonation[] | null>(
      DonationsFromDonationBatchLoader.getDonationsFromDonationBatch,
    )
}
