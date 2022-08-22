import {
  FindingType,
  FindingSeverity,
  Finding,
  HandleTransaction,
  createTransactionEvent,
  ethers,
  getEthersProvider
} from "forta-agent";

import {
  createAddress,
  MockEthersProvider,
  TestTransactionEvent,
} from "forta-agent-tools/lib/tests";

import {
  SWAP_EVENT,
  UniV3FactoryAddress,
  UniV3PoolABI
} from "./utils";

import { provideHandleTransaction } from "./agent";
import { Interface } from "ethers/lib/utils";

const SWAP_IFACE = new Interface([SWAP_EVENT]);
const FEE_IFACE = new Interface([UniV3PoolABI[0]]);
const TOKEN0_IFACE = new Interface([UniV3PoolABI[1]]);
const TOKEN1_IFACE = new Interface([UniV3PoolABI[2]]);
const USDT_ETH_POOL = "0x4e68Ccd3E89f51C3074ca5072bbAC773960dFa36";
const USDC_ETH_POOL = "0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640";
const WETH_ADDRESS = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const USDC_ADDRESS = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const USDT_ADDRESS = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
const USDC_WETH_MOCK_ADDRESS = createAddress("0xlol")


describe("detect UniswapV3 swap", () => {

  let handleTransaction: HandleTransaction;

  const mockProvider: MockEthersProvider = new MockEthersProvider();

  beforeAll(() => {
    handleTransaction = provideHandleTransaction(mockProvider as any, UniV3PoolABI, UniV3FactoryAddress);
  });

  beforeEach(() => {
    mockProvider.clear()
  })

  it("returns empty findings if there are no Uniswap swaps", async () => {
    const mockTxEvent = new TestTransactionEvent();

    //mockProvider.addCallTo(USDC_WETH_MOCK_ADDRESS, 1, TOKEN0_IFACE, "token0", { inputs: [], outputs: [token0] })

    const findings = await handleTransaction(mockTxEvent);

    expect(findings).toStrictEqual([]);
  });

  it("returns empty finding if swap event emitted from UniV2", async () => {
    const mockTxEvent = new TestTransactionEvent().addEventLog("signature");

    const findings = await handleTransaction(mockTxEvent);

    expect(findings).toStrictEqual([]);
  });

  it("returns a finding if there is a single UniswapV3 swap", async () => {
    const log1 = SWAP_IFACE.encodeEventLog(SWAP_IFACE.getEvent("Swap"), [
      createAddress("0xabc"),
      createAddress("0x123"),
      1,
      2,
      3,
      4,
      5,
    ]);

    const mockTxEvent: TestTransactionEvent = new TestTransactionEvent().addAnonymousEventLog(
      USDT_ETH_POOL,
      log1.data,
      ...log1.topics
    );

    const findings = await handleTransaction(mockTxEvent);

    expect(findings).toStrictEqual([
      Finding.fromObject({
        name: "UniswapV3 Swap",
        description: "A UniswapV3 Swap has been detected",
        alertId: "UNI-1",
        severity: FindingSeverity.Low,
        type: FindingType.Info,
        metadata: {
          pool: USDT_ETH_POOL.toLowerCase(),
          token1: WETH_ADDRESS.toLowerCase(),
          token2: USDT_ADDRESS.toLowerCase(),
        },
      }),
    ]);
  });

  it("returns more than 1 finding for multiple swaps", async () => {
    const log1 = SWAP_IFACE.encodeEventLog(SWAP_IFACE.getEvent("Swap"), [
      createAddress("0xabc"),
      createAddress("0x123"),
      1,
      2,
      3,
      4,
      5,
    ]);

    const log2 = SWAP_IFACE.encodeEventLog(SWAP_IFACE.getEvent("Swap"), [
      createAddress("0xabc"),
      createAddress("0x123"),
      1,
      2,
      3,
      4,
      5,
    ]);

    const mockTxEvent: TestTransactionEvent = new TestTransactionEvent()
      .addAnonymousEventLog(USDT_ETH_POOL, log1.data, ...log1.topics)
      .addAnonymousEventLog(USDC_ETH_POOL, log2.data, ...log2.topics);

    const findings = await handleTransaction(mockTxEvent);

    expect(findings).toStrictEqual([
      Finding.fromObject({
        name: "UniswapV3 Swap",
        description: "A UniswapV3 Swap has been detected",
        alertId: "UNI-1",
        severity: FindingSeverity.Low,
        type: FindingType.Info,
        metadata: {
          pool: USDT_ETH_POOL.toLowerCase(),
          token1: WETH_ADDRESS.toLowerCase(),
          token2: USDT_ADDRESS.toLowerCase(),
        },
      }),
      Finding.fromObject({
        name: "UniswapV3 Swap",
        description: "A UniswapV3 Swap has been detected",
        alertId: "UNI-1",
        severity: FindingSeverity.Low,
        type: FindingType.Info,
        metadata: {
          pool: USDC_ETH_POOL.toLowerCase(),
          token1: USDC_ADDRESS.toLowerCase(),
          token2: WETH_ADDRESS.toLowerCase(),
        },
      }),
    ]);
  });
});
