import { ConnectMeGuruActionProvider } from '../src';

async function main() {
  const provider = new ConnectMeGuruActionProvider({
    patToken: process.env.CMG_PAT_TOKEN || 'cmg_pat_demo_token',
  });

  // 1. Search for eSIM data packages
  console.log('Searching for Japan eSIM packages...');
  const searchResult = await provider.searchPlans({ country: 'Japan' });
  console.log('Search Results:\n', searchResult);

  // 2. Parse and pick a plan
  const parsed = JSON.parse(searchResult);
  if (parsed.availablePlans && parsed.availablePlans.length > 0) {
    const selectedPlan = parsed.availablePlans[0];
    console.log(`\nSelected Plan: ${selectedPlan.name} (${selectedPlan.packageCode})`);

    // 3. Create checkout invoice (HTTP 402)
    console.log('\nCreating checkout invoice on Polygon PoS...');
    const invoiceResult = await provider.createInvoice({
      packageCode: selectedPlan.packageCode,
      network: 'POLYGON',
    });
    console.log('Invoice Details:\n', invoiceResult);

    // In an autonomous agent flow, the agent's wallet executes on-chain transfer
    // of expectedAmountUsdt to receivingAddress, then checks status:
    const invoice = JSON.parse(invoiceResult);
    console.log(`\nChecking order status for ${invoice.invoiceId}...`);
    const statusResult = await provider.checkOrderStatus({
      invoiceId: invoice.invoiceId,
    });
    console.log('Order Status:\n', statusResult);
  }
}

main().catch(console.error);
