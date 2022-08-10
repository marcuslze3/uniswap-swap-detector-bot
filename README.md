# UniswapV3 Swap Bot

## Description

This bot detects transactions with UniswapV3 swaps

## Supported Chains
- Ethereum

## Alerts

- UNI-1
  - Fired when a transaction contains a UniswapV3 swap
  - Severity is always set to "low" (mention any conditions where it could be something else)
  - Type is always set to "info" (mention any conditions where it could be something else)

## Test Data

The bot behaviour can be verified with the following transactions:

- 0xc3e55f69dbf78d1f981caaae84004f17fcba9fd76700fef75afb808420de5e5f (1 finding, UniV3 USDT <> DAI swap)
- 0x28c5cbcfc068ae479b93529a550fe7c7d9a674ff846bfa43d9c36e6593ad0e63 (2 findings, 
UniV3 USDC <> MATIC swap,
UniV3 USDC <> WETH swap)
- 0xf12b699acf9b8016c525a034a4c589c32546cab7ac9f57bc206a3d0c4118c670 (0 findings, UniV2 BOND <> USDT swap)
