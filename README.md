# Large Tether Transfer Agent

## Description

This agent detects transactions with large Tether transfers

## Supported Chains

- Ethereum
- List any other chains this agent can support e.g. BSC

## Alerts

Describe each of the type of alerts fired by this agent

- FORTA-1
  - Fired when a transaction contains a Tether transfer over 10,000 USDT
  - Severity is always set to "low" (mention any conditions where it could be something else)
  - Type is always set to "info" (mention any conditions where it could be something else)
  - Mention any other type of metadata fields included with this alert

## Test Data

The agent behaviour can be verified with the following transactions:

- 0xc3e55f69dbf78d1f981caaae84004f17fcba9fd76700fef75afb808420de5e5f (1 finding, UniV3 USDT <> DAI swap)
- 0x28c5cbcfc068ae479b93529a550fe7c7d9a674ff846bfa43d9c36e6593ad0e63 (1 finding, UniV3 USDC <> MATIC swap)
- 0xf12b699acf9b8016c525a034a4c589c32546cab7ac9f57bc206a3d0c4118c670 (0 findings, UniV2 BOND <> USDT swap)