import {
  BlockEvent,
  Finding,
  HandleBlock,
  HandleTransaction,
  TransactionEvent,
  FindingSeverity,
  FindingType,
} from "forta-agent";

import {
  SWAP_EVENT,
  UniV3FactoryAddress,
  UniV3PoolABI,
  isUniswapV3Pool
} from "./utils"

const ethers = require('ethers');

function provideHandleTransaction(
  poolAbi: string[],
  factoryAddress: string): HandleTransaction {
  return async (
    txEvent: TransactionEvent
  ) => {
    const findings: Finding[] = [];

    // filter the transaction logs for any Swap events
    const swapEvents = txEvent.filterLog(
      SWAP_EVENT
    );

    for (var swapEvent of swapEvents) {
      // poolAddress of swap
      const poolAddress = swapEvent.address

      // if checker function returns true for the swap pool's address, add to findings
      if (await isUniswapV3Pool(poolAddress, poolAbi, factoryAddress)) {
        findings.push(
          Finding.fromObject({
            name: "UniswapV3 Swap",
            description: "A UniswapV3 Swap has been detected",
            alertId: "UNI-1",
            severity: FindingSeverity.Low,
            type: FindingType.Info,
            metadata: {
            },
          })
        );
      }
    }

    return findings;
  };
}

export default {
  handleTransaction: provideHandleTransaction(UniV3PoolABI, UniV3FactoryAddress),
};
