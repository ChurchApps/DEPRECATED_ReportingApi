import DataLoader from 'dataloader'
import _ from 'lodash'
import { PrismaHelper } from '../helpers'
import { GivingFundDonation } from '../types/SchemaTypes'

export type FundDonationFromFundLoaderType = DataLoader<string, GivingFundDonation[] | null>;

export class FundDonationFromFundLoader {
  private static getFundDonationFromFund = async (args: string[]) => {
    try {
      const ids = _.uniq(args)
      const fundDonations = await PrismaHelper.getGivingClient().fundDonations.findMany({
        where: {
          fundId: { in: ids }
        },
        include: {
          donation: true
        }
      })
      console.log('FundDonationFromFundLoader -> fundDonations -> fundDonations', fundDonations)
      return args.map((id) => fundDonations.filter(fd => fd.fundId === id));
    } catch (error) {
      console.error(error);
      return args.map(() => null);
    }
  };

  public static getLoader = (): FundDonationFromFundLoaderType => new DataLoader<string, GivingFundDonation[] | null>(FundDonationFromFundLoader.getFundDonationFromFund);

}
