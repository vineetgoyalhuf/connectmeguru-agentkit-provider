import { z } from 'zod';

export const SearchEsimSchema = z.object({
  country: z
    .string()
    .describe('Destination country name or 2-letter ISO code (e.g., "Japan", "JP", "Europe", "United States")'),
});

export const PurchaseEsimSchema = z.object({
  packageCode: z
    .string()
    .describe('The unique packageCode of the desired eSIM plan (e.g., "P4XU0X3CX") returned from search'),
  network: z
    .enum(['POLYGON', 'ARBITRUM', 'TRON'])
    .default('POLYGON')
    .describe('Blockchain network for the USDT payment transfer (POLYGON, ARBITRUM, or TRON)'),
  customerEmail: z
    .string()
    .email()
    .optional()
    .describe('Optional recipient email to receive backup installation instructions and order receipt'),
});

export const CheckOrderStatusSchema = z.object({
  invoiceId: z
    .string()
    .describe('Invoice identifier (e.g., "inv_mu560jq4_a1cdcc15") returned from the checkout action'),
});
