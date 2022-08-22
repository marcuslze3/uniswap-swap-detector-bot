import {
  Finding,
  HandleTransaction,
  TransactionEvent,
  FindingSeverity,
  getJsonRpcUrl,
  FindingType,
  ethers,
  getEthersProvider
} from "forta-agent";

import { SWAP_EVENT, UniV3FactoryAddress, UniV3PoolABI, isUniswapV3Pool } from "./utils";

export function provideHandleTransaction(provider: ethers.providers.Provider, poolAbi: string[], factoryAddress: string): HandleTransaction {
  return async (txEvent: TransactionEvent) => {
    const findings: Finding[] = [];

    // filter the transaction logs for any Swap events
    const swapEvents = txEvent.filterLog(SWAP_EVENT);

    for (var swapEvent of swapEvents) {
      // poolAddress of swap
      const poolAddress = swapEvent.address;

      let provider = new ethers.providers.JsonRpcProvider(getJsonRpcUrl());
      let poolContract = new ethers.Contract(poolAddress, poolAbi, provider);

      const tokenA = await poolContract.token0();
      const tokenB = await poolContract.token1();

      // if checker function returns true for the swap pool's address, add to findings
      if (await isUniswapV3Pool(provider, poolAddress, poolAbi, factoryAddress)) {
        findings.push(
          Finding.fromObject({
            name: "UniswapV3 Swap",
            description: "A UniswapV3 Swap has been detected",
            alertId: "UNI-1",
            severity: FindingSeverity.Info,
            type: FindingType.Info,
            protocol: "Uniswap",
            metadata: {
              pool: poolAddress.toLowerCase(),
              token1: tokenA.toLowerCase(),
              token2: tokenB.toLowerCase(),
            },
          })
        );
      }
    }

    return findings;
  };
}

export default {
  handleTransaction: provideHandleTransaction(getEthersProvider(), UniV3PoolABI, UniV3FactoryAddress),
};
