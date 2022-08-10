import {
  FindingType,
  FindingSeverity,
  Finding,
  HandleTransaction,
  createTransactionEvent,
  ethers,
} from "forta-agent";
import { BigNumber } from "ethers";
import {
  SWAP_EVENT,
  UniV3FactoryAddress,
  UniV3PoolABI,
} from "./utils"
import agent from "./agent"
import { Interface } from "ethers/lib/utils";
import {
  createAddress,
  MockEthersProvider,
  TestTransactionEvent,
} from "forta-agent-tools/lib/tests";

const SWAP_IFACE = new Interface([SWAP_EVENT]);
//const mockProvider = new MockEthersProvider();
const USDT_DAI_POOL = "0x6B175474E89094C44Da98b954EedeAC495271d0F"


describe("detect UniswapV3 swap", () => {
  let handleTransaction: HandleTransaction;


  beforeAll(() => {
    handleTransaction = agent.handleTransaction;
  });

  describe("handleTransaction", () => {
    it("returns empty findings if there are no Uniswap swaps", async () => {
      const mockTxEvent = new TestTransactionEvent();

      const findings = await handleTransaction(mockTxEvent);

      expect(findings).toStrictEqual([]);
    });

    it("returns empty finding if swap event emitted from UniV2", async () => {
      const UniV2PoolAddress = "0xe7A106b416f20e7C808f23E47d181773E434801C"

      const mockTxEvent = new TestTransactionEvent()
        .addEventLog("signature",)

      const findings = await handleTransaction(mockTxEvent);

      expect(findings).toStrictEqual([]);
    });

    it("returns a finding if there is a UniswapV3 swap", async () => {
      const log1 = SWAP_IFACE.encodeEventLog(
        SWAP_IFACE.getEvent("Swap"), [
        createAddress("0xabc"),
        createAddress("0x123"),
        1, 2, 3, 4, 5
      ]);


      const mockTxEvent = new TestTransactionEvent()
        .addAnonymousEventLog(USDT_DAI_POOL, log1.data, ...log1.topics)

      const findings = await handleTransaction(mockTxEvent);

      expect(findings).toStrictEqual([
        Finding.fromObject({
          name: "UniswapV3 Swap",
          description: "A UniswapV3 Swap has been detected",
          alertId: "UNI-1",
          severity: FindingSeverity.Low,
          type: FindingType.Info,
          metadata: {
          },
        }),
      ]);
    });
  });
});
