# Aegis Crypto Dashboard
> **Status:** `OPERATIONAL` | **Market Clearance:** `BROKER_LEVEL_1`

![React](https://img.shields.io/badge/Frontend-React_19-61DAFB?logo=react)
![Node](https://img.shields.io/badge/Backend-Node_22-339933?logo=nodedotjs)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Styling-Tailwind_CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![TanStack](https://img.shields.io/badge/Caching-TanStack_Query-FF4154?style=flat&logo=reactquery&logoColor=white)

A decentralized, multi-threaded intelligence node for intercepting, caching, and mapping high-frequency asset volatility. Features zero-latency session persistence and state-sync barriers engineered to withstand severe public-node throttling.

---

## 📑 OPERATIONAL DIRECTIVES


### 01. MARKET TELEMETRY (THE "STALE-GUARD" PROTOCOL)

Stream live market movements directly from the global network via CoinGecko infrastructure.
> **Defensive Engineering:** This terminal implements aggressive caching layer logic. If you attempt to hammer the manual refresh button like a dopamine-addled day trader, the network will throttle you. Respect the local staleTime defaults to bypass the 429 rate limit matrix.

### 02. ASSET ISOLATION (THE "SPINAL TAP" COMPONENT)

Utilize the modular aside interface to access a curated index of the top 11 crypto assets—because standard terminals only go up to 10.
> **• Process: Open Sidebar** → Execute Focused Search → Select Target Asset.
> **• UI Highlight:** Leverage keyboard and mouse focus configurations to highlight and isolate a single target asset while executing live, side-by-side performance comparisons.

### 03. HISTORICAL CHRONOLOGY

Evaluate market asset health by toggling historic timelines directly inside the primary data viewport.
> **• Data Arrays:** Switch seamlessly between 7-day, 30-day, and 90-day multi-axis tracking matrices powered by recharts.
> **• Micro Telemetry:** Track granular price action fluctuations natively inside the data tables using dynamically rendered, tooltip-mapped sparklines.

## 🛠️ TECH SPECS

• **Core Engine:** React 19, TypeScript, Vite
• **Data Caching & Telemetry:** TanStack Query (Custom-tuned staleTime and cacheTime variables to actively mitigate CoinGecko Tier 429 restrictions)
• **UI Architecture:** Tailwind CSS, CVA (Class Variance Authority), clsx, and Framer Motion for fluent structural transitions.
• **Visualization:** Recharts SVG Engine + AnimatedIcons / React

## 🚀 LOCAL INITIALIZATION

To deploy this decryption terminal locally within your infrastructure:
1. **Provision Dependencies:bash**
    npm install
    Use code with caution.
2. **Configure Environment Matrix:**
    Create a .env file in the root directory and append your telemetry credentials:env
    VITE_COINGECKO_API_KEY=your_free_tier_key_here
    Use code with caution.
3. **Launch Terminal Stream:bash**
    npm run dev
    Use code with caution.

### 🛡️ SECURE NODE CHECKUP: THE INTERCEPT COMPROMISE

Since this infrastructure routes metrics via a personalized **CoinGecko** API Token, exposing this asset on public ledgers is a critical security violation.
• Verify that a `.gitignore` file is fully active in your root directory.
• Ensure `.env` is explicitly declared within that file before executing a git push transaction to GitHub.