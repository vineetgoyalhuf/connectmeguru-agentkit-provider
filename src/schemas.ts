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
    .enum(['BASE', 'POLYGON', 'ARBITRUM', 'TRON'])
    .default('BASE')
    .describe('Blockchain network for the payment transfer (BASE, POLYGON, ARBITRUM, or TRON). Defaults to BASE.'),
  currency: z
    .enum(['USDC', 'USDT'])
    .default('USDC')
    .describe('Preferred cryptocurrency stablecoin for payment (USDC or USDT). Defaults to USDC.'),
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
