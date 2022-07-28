import {
  BlockEvent,
  Finding,
  HandleBlock,
  HandleTransaction,
  TransactionEvent,
  FindingSeverity,
  FindingType,
  getJsonRpcUrl,
} from "forta-agent";

import {
  SWAP_EVENT,
  UNISWAPV3FACTORY_ADDRESS,
  UniV3FactoryABI,
  UniV3PoolABI,
} from "./utils"

const ethers = require('ethers');

//let provider = ethers.getDefaultProvider(); //- whats the diff between this and the line below?
let provider = new ethers.providers.JsonRpcProvider(getJsonRpcUrl())
let UniswapV3FactoryContract = new ethers.Contract(UNISWAPV3FACTORY_ADDRESS,
  UniV3FactoryABI, provider);

// function to check if a poolAddress is a UniswapV3 pool
// logic should take advantage of getPool(), which returns the pools address
// when a swap event is emitted in a transaction.
async function isUniswapV3Pool(poolAddress: string) {
  let UniswapV3PoolContract = new ethers.Contract(poolAddress, UniV3PoolABI, provider);
  const tokenA = await UniswapV3PoolContract.token0();
  const tokenB = await UniswapV3PoolContract.token1();
  const fee = await UniswapV3PoolContract.fee();

  console.log("TokenA:", tokenA)
  console.log("TokenB:", tokenB)

  let uniswapPoolAddress: string = await UniswapV3FactoryContract.getPool(tokenA, tokenB, fee);

  console.log("Uniswap Pool Address:", uniswapPoolAddress)

  if (uniswapPoolAddress.toLowerCase() == poolAddress.toLowerCase()) {
    return true;
  }

  return false;
}

const handleTransaction: HandleTransaction = async (
  txEvent: TransactionEvent
) => {
  const findings: Finding[] = [];

  // filter the transaction logs for any Swap events
  const swapEvents = txEvent.filterLog(
    SWAP_EVENT
  );

  for (var swapEvent of swapEvents) {
    // get the pool Address of the swap
    const poolAddress = swapEvent.address
    console.log(poolAddress)

    // if checker function returns true for the swap pool's address, add to findings
    if (await isUniswapV3Pool(poolAddress)) {
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

// const handleBlock: HandleBlock = async (blockEvent: BlockEvent) => {
//   const findings: Finding[] = [];
//   // detect some block condition
//   return findings;
// }

export default {
  handleTransaction,
  // handleBlock
};
