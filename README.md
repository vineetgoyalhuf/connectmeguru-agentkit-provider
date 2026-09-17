# ConnectMeGuru Action Provider for Coinbase AgentKit & Autonomous Web3 Agents

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue.svg)](https://www.typescriptlang.org/)
[![Coinbase AgentKit](https://img.shields.io/badge/Coinbase-AgentKit-blue)](https://docs.cdp.coinbase.com/agentkit/docs/welcome)
[![Networks: Polygon | Arbitrum | TRON](https://img.shields.io/badge/Networks-Polygon%20%7C%20Arbitrum%20%7C%20TRON-purple)](https://www.connectmeguru.com/developers/agentic)

Official **Coinbase AgentKit Action Provider** for [ConnectMeGuru](https://www.connectmeguru.com).

Enables autonomous AI agents, on-chain smart wallets, and travel bots to programmatically search and purchase global travel eSIM data plans across 200+ countries with non-custodial **USDT settlements on Polygon, Arbitrum One, and TRON**.

---

## 🌟 Why ConnectMeGuru for AI Agents?

* 📶 **200+ Countries Covered**: Over 3,000+ local and regional travel eSIM plans.
* 🤖 **100% Autonomous**: Standard **HTTP 402 Payment Required** invoice flow with collision-free spot discounts.
* 🔐 **Machine Identity**: One-time email OTP verification issues a permanent Personal Access Token (`cmg_pat_...`) for zero-human runtime checkouts.
* ⚡ **Instant Delivery**: QR code data URLs and SM-DP+ LPA activation strings returned directly in JSON responses upon on-chain block settlement.
* 📄 **OpenAPI 3.1.0 Ready**: Direct LLM ingestion at `https://www.connectmeguru.com/api/agentic/openapi.json`.

---

## 📦 Installation

```bash
npm install connectmeguru-agentkit-provider zod
```

---

## 🚀 Quickstart

### 1. Standalone / LangChain Agent Usage

```typescript
import { ConnectMeGuruActionProvider } from 'connectmeguru-agentkit-provider';

// Initialize with your Machine PAT Token (obtained via https://www.connectmeguru.com/developers/agentic)
const provider = new ConnectMeGuruActionProvider({
  patToken: process.env.CMG_PAT_TOKEN,
});

async function main() {
  // 1. Search for available plans
  const searchResults = await provider.searchPlans({ country: 'Japan' });
  console.log('Available Plans:', searchResults);

  // 2. Generate an autonomous checkout invoice (HTTP 402)
  const invoice = await provider.createInvoice({
    packageCode: 'P4XU0X3CX',
    network: 'POLYGON', // 'POLYGON' | 'ARBITRUM' | 'TRON'
  });
  console.log('Payment Instructions:', invoice);

  // 3. Autonomous agent broadcasts on-chain USDT transfer...
  // 4. Poll order status for instant eSIM activation credentials:
  const order = await provider.checkOrderStatus({
    invoiceId: 'inv_mu560jq4_a1cdcc15',
  });
  console.log('eSIM Credentials:', order);
}

main();
```

---

## 🛠️ Exported Action Provider Actions

| Action | Description | Input Schema |
| :--- | :--- | :--- |
| `searchPlans` | Search travel eSIM packages by country name or ISO-2 code | `{ country: string }` |
| `createInvoice` | Create a spot-discounted crypto invoice (HTTP 402) | `{ packageCode: string, network: "POLYGON" \| "ARBITRUM" \| "TRON", customerEmail?: string }` |
| `checkOrderStatus` | Poll on-chain settlement and retrieve eSIM QR & LPA string | `{ invoiceId: string }` |

---

## 🛡️ Supported Networks & USDT Contracts

ConnectMeGuru validates on-chain transfers against official USDT smart contracts:

| Network | Standard | Official USDT Smart Contract Address |
| :--- | :--- | :--- |
| **Polygon PoS** | PRC-20 | `0xc2132D05D31c914a87C6611C10748AEb04B58e8F` |
| **Arbitrum One** | ERC-20 | `0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9` |
| **TRON** | TRC-20 | `TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t` |

---

## 🔑 Obtaining Your Machine PAT Token

1. **Step 1 (Request OTP)**:
   ```bash
   curl -X POST "https://www.connectmeguru.com/api/agentic/auth/request-otp" \
     -H "Content-Type: application/json" \
     -d '{"email": "your-email@example.com"}'
   ```
2. **Step 2 (Verify & Receive PAT)**:
   ```bash
   curl -X POST "https://www.connectmeguru.com/api/agentic/auth/verify-otp" \
     -H "Content-Type: application/json" \
     -d '{"email": "your-email@example.com", "otp": "YOUR_6_DIGIT_CODE"}'
   ```
3. Set the returned token as an environment variable:
   ```bash
   export CMG_PAT_TOKEN="cmg_pat_..."
   ```

---

## 📚 Resources & Documentation

* **Interactive Developer Portal**: [https://www.connectmeguru.com/developers/agentic](https://www.connectmeguru.com/developers/agentic)
* **Live OpenAPI 3.1.0 Manifest**: [https://www.connectmeguru.com/api/agentic/openapi.json](https://www.connectmeguru.com/api/agentic/openapi.json)
* **Coinbase AgentKit Documentation**: [https://docs.cdp.coinbase.com/agentkit/docs/welcome](https://docs.cdp.coinbase.com/agentkit/docs/welcome)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
