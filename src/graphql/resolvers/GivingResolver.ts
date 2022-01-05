import _ from 'lodash'
import {
  QueryGivingFundsArgs,
  QueryGivingFundDonationsArgs,
  QueryGivingDonationBatchesArgs,
  GivingFund,
  ReqContext,
  GivingFundDonation,
  Person,
  GivingDonationBatch,
  GivingDonation,
} from '../types'
import { Authorization, PaginationHelper, PrismaHelper } from '../helpers'
import { funds, donations, fundDonations, donationBatches } from '../../../prisma/giving/client'
import { DonationPermissions } from '../../helpers'

export class GivingResolver {

  private static givingFundsQuery = async (root: any, args: QueryGivingFundsArgs, ctx: ReqContext): Promise<GivingFund[] | null> => {
    Authorization.requirePermission(ctx.me, DonationPermissions.donations.view);
    const churchId = ctx.me?.churchId;
    if (!churchId) {
      return []
    }
    const { from, size } = PaginationHelper.initPagination(args.pagination);
    const result = await PrismaHelper.getGivingClient().funds.findMany({
      skip: from,
      take: size,
      where: {
        churchId
      }
    });

    return result
  }
  private static givingFundDonationsQuery = async (root: any, args: QueryGivingFundDonationsArgs, ctx: ReqContext): Promise<GivingFundDonation[] | null> => {
    Authorization.requirePermission(ctx.me, DonationPermissions.donations.view);
    const churchId = ctx.me?.churchId;
    if (!churchId) {
      return []
    }
    const { from, size } = PaginationHelper.initPagination(args.pagination);
    const result = await PrismaHelper.getGivingClient().fundDonations.findMany({
      skip: from,
      take: size,
      where: {
        churchId
      }
    });

    return result
  }
  private static givingDonationBatchesQuery = async (root: any, args: QueryGivingDonationBatchesArgs, ctx: ReqContext): Promise<GivingDonationBatch[] | null> => {
    Authorization.requirePermission(ctx.me, DonationPermissions.donations.view);
    const churchId = ctx.me?.churchId;
    if (!churchId) {
      return []
    }
    const { from, size } = PaginationHelper.initPagination(args.pagination);
    const result = await PrismaHelper.getGivingClient().donationBatches.findMany({
      skip: from,
      take: size,
      where: {
        churchId
      }
    });

    return result
  }

  private static fundDonationsResolver = async (root: funds, args: null, ctx: ReqContext): Promise<GivingFundDonation[] | null> => {
    if (root.id) {
      return ctx.fundDonationFromFundLoader.load(root.id);
    }
    return
  }

  private static donationResolver = async (root: fundDonations, args: null, ctx: ReqContext): Promise<GivingDonation | null> => {
    if (root.donationId) {
      return ctx.donationsLoader.load(root.donationId);
    }
    return
  }

  private static personResolver = async (root: donations, args: null, ctx: ReqContext): Promise<Person | null> => {
    if (root.personId) {
      return ctx.personLoader.load(root.personId);
    }
    return
  }

  private static donationBatchResolver = async (root: donations, args: null, ctx: ReqContext): Promise<GivingDonationBatch | null> => {
    if (root.batchId) {
      return ctx.donationBatchLoader.load(root.batchId);
    }
    return
  }

  private static donationsFromDonationBatchResolver = async (root: donationBatches, args: null, ctx: ReqContext): Promise<GivingDonation[] | null> => {
    if (root.id) {
      return ctx.donationsFromDonationBatchLoader.load(root.id);
    }
    return
  }

  public static getResolver = () => {
    return {
      Query: {
        givingFunds: GivingResolver.givingFundsQuery,
        givingFundDonations: GivingResolver.givingFundDonationsQuery,
        givingDonationBatches: GivingResolver.givingDonationBatchesQuery,
      },
      GivingFund: {
        fundDonations: GivingResolver.fundDonationsResolver
      },
      GivingFundDonation: {
        donation: GivingResolver.donationResolver
      },
      GivingDonation: {
        person: GivingResolver.personResolver,
        donationBatch: GivingResolver.donationBatchResolver
      },
      GivingDonationBatch: {
        donations: GivingResolver.donationsFromDonationBatchResolver
      }
    }
  }

}

