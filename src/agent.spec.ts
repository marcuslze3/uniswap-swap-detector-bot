import {
  FindingType,
  FindingSeverity,
  Finding,
  HandleTransaction,
  createTransactionEvent,
  ethers,
} from "forta-agent";
import {
  SWAP_EVENT,
  UNISWAPV3FACTORY_ADDRESS,
  UniV3FactoryABI,
  UniV3PoolABI,
} from "./utils"
import agent from "./agent"
import { Interface } from "ethers/lib/utils";
import { TestTransactionEvent } from "forta-agent-tools/lib/tests";

const UNI_IFACE = new Interface([SWAP_EVENT]);

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
      const UniV3PoolAddress = "0xFAaCE66BD25abFF62718AbD6DB97560E414eC074"

      const mockTxEvent = new TestTransactionEvent()
        .addEventLog("signature", UniV3PoolAddress)
        .addTraces({
          to: "0xabc",
          from: "0xdef",
          input: UNI_IFACE.encodeFunctionData("Swap", [
            "0xabc",
            "0xcde",
            100,
            100,
            5,
            5,
            5
          ])
        })

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
