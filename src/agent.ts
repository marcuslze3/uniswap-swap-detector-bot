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

const ethers = require('ethers');

// add these variables to a separate data file
export const SWAP_EVENT =
  "event Swap(address indexed sender,address indexed recipient, int256 amount0,int256 amount1,uint160 sqrtPriceX96, uint128 liquidity, int24 tick)"
export const UNISWAPV3FACTORY_ADDRESS = "0x1f98431c8ad98523631ae4a59f267346ea31f984"

// connecting to the contract
// The Contract ABI - THIS IS BAD, MOVE TO DATA FILE
let UniV3FactoryABI = [{ "inputs": [], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "uint24", "name": "fee", "type": "uint24" }, { "indexed": true, "internalType": "int24", "name": "tickSpacing", "type": "int24" }], "name": "FeeAmountEnabled", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "oldOwner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" }], "name": "OwnerChanged", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "token0", "type": "address" }, { "indexed": true, "internalType": "address", "name": "token1", "type": "address" }, { "indexed": true, "internalType": "uint24", "name": "fee", "type": "uint24" }, { "indexed": false, "internalType": "int24", "name": "tickSpacing", "type": "int24" }, { "indexed": false, "internalType": "address", "name": "pool", "type": "address" }], "name": "PoolCreated", "type": "event" }, { "inputs": [{ "internalType": "address", "name": "tokenA", "type": "address" }, { "internalType": "address", "name": "tokenB", "type": "address" }, { "internalType": "uint24", "name": "fee", "type": "uint24" }], "name": "createPool", "outputs": [{ "internalType": "address", "name": "pool", "type": "address" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint24", "name": "fee", "type": "uint24" }, { "internalType": "int24", "name": "tickSpacing", "type": "int24" }], "name": "enableFeeAmount", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint24", "name": "", "type": "uint24" }], "name": "feeAmountTickSpacing", "outputs": [{ "internalType": "int24", "name": "", "type": "int24" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }, { "internalType": "address", "name": "", "type": "address" }, { "internalType": "uint24", "name": "", "type": "uint24" }], "name": "getPool", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "owner", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "parameters", "outputs": [{ "internalType": "address", "name": "factory", "type": "address" }, { "internalType": "address", "name": "token0", "type": "address" }, { "internalType": "address", "name": "token1", "type": "address" }, { "internalType": "uint24", "name": "fee", "type": "uint24" }, { "internalType": "int24", "name": "tickSpacing", "type": "int24" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_owner", "type": "address" }], "name": "setOwner", "outputs": [], "stateMutability": "nonpayable", "type": "function" }]
//let provider = ethers.getDefaultProvider();
let provider = new ethers.providers.JsonRpcProvider([getJsonRpcUrl()])
let UniswapV3FactoryContract = new ethers.Contract(UNISWAPV3FACTORY_ADDRESS,
  UniV3FactoryABI, provider);


let UniV3PoolABI = [{ "inputs": [], "name": "fee", "outputs": [{ "internalType": "uint24", "name": "", "type": "uint24" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "protocolFees", "outputs": [{ "internalType": "uint128", "name": "token0", "type": "uint128" }, { "internalType": "uint128", "name": "token1", "type": "uint128" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "token0", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }]
// function to check if a poolAddress is a UniswapV3 pool
// logic should take advantage of getPool(), which returns the pools address
// when a swap event is emitted in a transaction.
async function isUniswapV3Pool(poolAddress: string) {
  let UniswapV3PoolContract = new ethers.Contract(poolAddress, UniV3FactoryABI, provider);
  const tokenA = await UniswapV3PoolContract.token0();
  const tokenB = await UniswapV3PoolContract.token1();
  const fee = await UniswapV3PoolContract.fee();

  let uniswapPoolAddress: string = await UniswapV3FactoryContract.getPool(tokenA, tokenB, fee);

  if (uniswapPoolAddress == poolAddress) {
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
    const poolAddress = swapEvent.address // try with txEvent.to also?

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
