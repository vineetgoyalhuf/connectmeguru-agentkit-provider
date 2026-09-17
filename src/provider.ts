import { z } from 'zod';
import { SearchEsimSchema, PurchaseEsimSchema, CheckOrderStatusSchema } from './schemas';

export interface ConnectMeGuruConfig {
  patToken?: string;
  baseUrl?: string;
}

export interface EsimPlan {
  packageCode: string;
  name: string;
  dataAmount: number;
  duration: number;
  retailPrice: number;
}

export interface EsimInvoice {
  status: string;
  invoiceId: string;
  orderRef: string;
  plan: {
    packageCode: string;
    name: string;
    dataAmountGb: number;
    durationDays: number;
    basePriceUsd: number;
  };
  payment: {
    currency: string;
    network: string;
    networkName: string;
    contractAddress: string;
    receivingAddress: string;
    expectedAmount: number;
    spotDiscountOffset: number;
    qrDataUrl: string;
    expiresAt: number;
    expiresAtIso: string;
    pollingUrl: string;
  };
}

export interface EsimOrderResult {
  status: 'PENDING_PAYMENT' | 'CONFIRMED_AWAITING_FULFILLMENT' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'EXPIRED';
  invoiceId: string;
  orderId?: string;
  esim?: {
    iccid: string;
    lpaString: string;
    qrCodeUrl: string;
    smdpAddress: string;
    matchingId: string;
  };
  instructions?: string;
}

/**
 * ConnectMeGuru Action Provider for Coinbase AgentKit & Autonomous Web3 Agents.
 * Enables AI agents to autonomously discover and buy travel eSIMs with USDT on Polygon, Arbitrum, and TRON.
 */
export class ConnectMeGuruActionProvider {
  public readonly name = 'connectmeguru';
  private patToken: string;
  private baseUrl: string;

  constructor(config?: ConnectMeGuruConfig) {
    this.patToken = config?.patToken || process.env.CMG_PAT_TOKEN || '';
    this.baseUrl = (config?.baseUrl || process.env.CMG_BASE_URL || 'https://www.connectmeguru.com/api').replace(/\/$/, '');
  }

  /**
   * Action 1: Search available eSIM plans for a destination
   */
  async searchPlans(args: z.infer<typeof SearchEsimSchema>): Promise<string> {
    const url = `${this.baseUrl}/products/search?country=${encodeURIComponent(args.country)}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`ConnectMeGuru search failed with HTTP ${res.status}: ${res.statusText}`);
    }
    const data = await res.json();
    const plans: EsimPlan[] = (data.plans || []).slice(0, 8);
    return JSON.stringify({
      country: args.country,
      totalFound: data.totalCount || plans.length,
      availablePlans: plans.map((p) => ({
        packageCode: p.packageCode,
        name: p.name,
        dataAmountGb: p.dataAmount,
        durationDays: p.duration,
        priceUsd: p.retailPrice,
      })),
    }, null, 2);
  }

  /**
   * Action 2: Create an autonomous checkout invoice (HTTP 402)
   */
  async createInvoice(args: z.infer<typeof PurchaseEsimSchema>): Promise<string> {
    if (!this.patToken) {
      throw new Error(
        'ConnectMeGuru PAT Token is required. Set CMG_PAT_TOKEN environment variable or pass patToken to constructor. Obtain token via https://www.connectmeguru.com/developers/agentic'
      );
    }

    const url = `${this.baseUrl}/agentic/checkout`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.patToken}`,
      },
      body: JSON.stringify({
        packageCode: args.packageCode,
        preferredNetwork: args.network || 'POLYGON',
        customerEmail: args.customerEmail,
      }),
    });

    if (res.status !== 200 && res.status !== 402) {
      const errText = await res.text();
      throw new Error(`ConnectMeGuru checkout failed with HTTP ${res.status}: ${errText}`);
    }

    const data: EsimInvoice = await res.json();
    return JSON.stringify({
      message: 'Payment Required: Transfer the exact USDT amount to the receiving address.',
      invoiceId: data.invoiceId,
      network: data.payment.network,
      contractAddress: data.payment.contractAddress,
      receivingAddress: data.payment.receivingAddress,
      expectedAmountUsdt: data.payment.expectedAmount,
      spotDiscountOffset: data.payment.spotDiscountOffset,
      expiresAt: data.payment.expiresAtIso,
      pollingUrl: data.payment.pollingUrl,
      instructions: `Send ${data.payment.expectedAmount} USDT on ${data.payment.network} to ${data.payment.receivingAddress}. Once broadcast, call checkOrderStatus with invoiceId "${data.invoiceId}".`,
    }, null, 2);
  }

  /**
   * Action 3: Check order delivery status and retrieve eSIM credentials
   */
  async checkOrderStatus(args: z.infer<typeof CheckOrderStatusSchema>): Promise<string> {
    const url = `${this.baseUrl}/agentic/order/${encodeURIComponent(args.invoiceId)}`;
    const headers: Record<string, string> = {};
    if (this.patToken) {
      headers['Authorization'] = `Bearer ${this.patToken}`;
    }

    const res = await fetch(url, { headers });
    if (!res.ok) {
      throw new Error(`ConnectMeGuru order lookup failed with HTTP ${res.status}: ${res.statusText}`);
    }

    const order: EsimOrderResult = await res.json();
    return JSON.stringify(order, null, 2);
  }
}
