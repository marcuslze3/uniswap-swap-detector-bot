import { getCreate2Address } from "@ethersproject/address";
//import { getJsonRpcUrl } from "forta-agent";
import { ethers } from "forta-agent";
import LRU from "lru-cache"

const cache: LRU<string, string[]> = new LRU<string, string[]>({ max: 10000 });

export const UniV3PoolABI = [
  "function fee() public view returns (uint24)",
  "function token0() public view returns (address)",
  "function token1() public view returns (address)",
];

export const POOL_INIT_HASH = "0xe34f199b19b2b4f47f68442619d555527d244f78a3297ea89325f843f87b8b54";

export const SWAP_EVENT =
  "event Swap(address indexed sender,address indexed recipient, int256 amount0,int256 amount1,uint160 sqrtPriceX96, uint128 liquidity, int24 tick)";

export const UniV3FactoryAddress = "0x1f98431c8ad98523631ae4a59f267346ea31f984";

function getPoolAddress(token0: string, token1: string, fee: string, deployer: string, initHash: string) {
  const salt = ethers.utils.keccak256(
    ethers.utils.defaultAbiCoder.encode(["address", "address", "uint24"], [token0, token1, fee])
  );

  const create2Address = getCreate2Address(deployer, salt, initHash);
  return create2Address;
}

export async function isUniswapV3Pool(provider: ethers.providers.Provider, poolAddress: string, poolAbi: string[], factoryAddress: string) {
  //let provider = new ethers.providers.JsonRpcProvider(getJsonRpcUrl());

  // if poolAddress is in lru cache - just return true
  // if not, process the entire thing and add to cache if true & return true
  // dont add and return false

  if (cache.has(poolAddress)) {
    return true;
  }

  else {
    const poolContract = new ethers.Contract(poolAddress, poolAbi, provider);

    const tokenA = await poolContract.token0();
    const tokenB = await poolContract.token1();
    const fee = await poolContract.fee();

    console.log("TokenA:", tokenA);
    console.log("TokenB:", tokenB);

    const uniswapPoolAddress: string = getPoolAddress(tokenA, tokenB, fee, factoryAddress, POOL_INIT_HASH);

    console.log("Uniswap Pool Address:", uniswapPoolAddress);

    if (uniswapPoolAddress.toLowerCase() === poolAddress.toLowerCase()) {
      cache.set(poolAddress, [tokenA, tokenB, fee])
      return true;
    }

    return false;
  }

  const poolContract = new ethers.Contract(poolAddress, poolAbi, provider);

  const tokenA = await poolContract.token0();
  const tokenB = await poolContract.token1();
  const fee = await poolContract.fee();

  console.log("TokenA:", tokenA);
  console.log("TokenB:", tokenB);

  const uniswapPoolAddress: string = getPoolAddress(tokenA, tokenB, fee, factoryAddress, POOL_INIT_HASH);

  console.log("Uniswap Pool Address:", uniswapPoolAddress);

  return (uniswapPoolAddress.toLowerCase() === poolAddress.toLowerCase())
}

