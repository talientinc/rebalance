import {
    NormalizedPortfolio,
    NormalizedPosition,
    Pending,
} from "./rebalanceSlice";
import { PendingTrades, selectPendingTrades } from "./PendingSelectors";

const build = (
    percent: number,
    cents: number,
    fixedCents: number
): NormalizedPosition => {
    // Build a test position for the given parameters.  Attributions are not
    // populated because they do not affect the desired result of the selector.
    return {
        percent: percent,
        cents: cents,
        fixedCents: fixedCents,
        attributions: {},
    };
};

const emptyPortfolio: NormalizedPortfolio = {};

const basicPortfolio: NormalizedPortfolio = {
    "": build(0, 0, 0),
    STOCK: build(60, 60000, 0),
    BONDS: build(40, 40000, 0),
};

const emptyTrades: PendingTrades = {};

const run = (
    pendingCents: number | undefined,
    testPortfolio: NormalizedPortfolio
): PendingTrades => {
    // Invoke the selectPendingTrades result function with a self-consistent
    // set of parameters built from the test configuration.
    const pending: Pending =
        pendingCents === undefined ? {} : { cents: pendingCents };
    const [totalPercent, totalCents, totalFixedCents] = Object.values(
        testPortfolio
    ).reduce(
        ([percent, cents, fixedCents], position): [number, number, number] => [
            percent + position.percent,
            cents + position.cents,
            fixedCents + position.fixedCents,
        ],
        [0, 0, 0]
    );
    return selectPendingTrades.resultFunc(
        totalPercent,
        totalCents,
        totalCents + totalFixedCents,
        testPortfolio,
        pending
    );
};

describe("select pending trades", () => {
    test("should handle undefined pending cents", () => {
        expect(run(undefined, basicPortfolio)).toEqual(emptyTrades);
    });
    test("should handle zero pending cents", () => {
        expect(run(0, basicPortfolio)).toEqual(emptyTrades);
    });
    test("should handle empty portfolio", () => {
        expect(run(100000, emptyPortfolio)).toEqual(emptyTrades);
    });
    test("should handle withdrawing all tradable amounts", () => {
        expect(run(-100000, basicPortfolio)).toEqual({
            STOCK: -60000,
            BONDS: -40000,
        });
    });
    test("should handle withdrawing more than all tradable amounts", () => {
        expect(run(-200000, basicPortfolio)).toEqual({
            STOCK: -60000,
            BONDS: -40000,
        });
    });
    test("should handle withdrawing more than all tradable amounts but less than holdings", () => {
        const testPortfolio: NormalizedPortfolio = {
            ...basicPortfolio,
            STOCK: build(100, 60000, 100000),
        };
        expect(run(-150000, testPortfolio)).toEqual({
            STOCK: -60000,
            BONDS: -40000,
        });
    });
    test("should contribute proportionally to balanced portfolio", () => {
        expect(run(50000, basicPortfolio)).toEqual({
            STOCK: 30000,
            BONDS: 20000,
        });
    });
    test("should withdraw proportionally from balanced portfolio", () => {
        expect(run(-50000, basicPortfolio)).toEqual({
            STOCK: -30000,
            BONDS: -20000,
        });
    });
    test("should contribute to shortest position first", () => {
        const testPortfolio: NormalizedPortfolio = {
            ...basicPortfolio,
            STOCK: build(60, 50000, 0),
        };
        expect(run(10000, testPortfolio)).toEqual({
            STOCK: 10000,
        });
    });
    test("should withdraw from longest position first", () => {
        const testPortfolio: NormalizedPortfolio = {
            ...basicPortfolio,
            STOCK: build(60, 70000, 0),
        };
        expect(run(-10000, testPortfolio)).toEqual({
            STOCK: -10000,
        });
    });
    test("should contribute to position with greatest relative error first", () => {
        const testPortfolio: NormalizedPortfolio = {
            STOCK: build(50, 45500, 0),
            BONDS: build(40, 45500, 0),
            OTHER: build(10, 8000, 0),
        };
        expect(run(1000, testPortfolio)).toEqual({
            OTHER: 1000,
        });
    });
    test("should withdraw from position with greatest relative error first", () => {
        const testPortfolio: NormalizedPortfolio = {
            STOCK: build(50, 54500, 0),
            BONDS: build(40, 33500, 0),
            OTHER: build(10, 12000, 0),
        };
        expect(run(-1000, testPortfolio)).toEqual({
            OTHER: -1000,
        });
    });
    test("should contribute to shortest position first and then proportionately", () => {
        const testPortfolio: NormalizedPortfolio = {
            ...basicPortfolio,
            STOCK: build(60, 50000, 0),
        };
        expect(run(60000, testPortfolio)).toEqual({
            STOCK: 40000,
            BONDS: 20000,
        });
    });
    test("should withdraw from longest position first and then proportionately", () => {
        const testPortfolio: NormalizedPortfolio = {
            ...basicPortfolio,
            STOCK: build(60, 70000, 0),
        };
        expect(run(-60000, testPortfolio)).toEqual({
            STOCK: -40000,
            BONDS: -20000,
        });
    });
    test("should not withdraw more than tradable amount from position", () => {
        const testPortfolio: NormalizedPortfolio = {
            ...basicPortfolio,
            STOCK: build(60, 10000, 50000),
        };
        expect(run(-40000, testPortfolio)).toEqual({
            STOCK: -10000,
            BONDS: -30000,
        });
    });
    test("should withdraw from zero-target position first", () => {
        const testPortfolio: NormalizedPortfolio = {
            ...basicPortfolio,
            "": build(0, 10000, 100000),
        };
        expect(run(-60000, testPortfolio)).toEqual({
            "": -10000,
            STOCK: -30000,
            BONDS: -20000,
        });
    });
    test("should withdraw from zero-target position with greatest balance first", () => {
        const testPortfolio: NormalizedPortfolio = {
            ...basicPortfolio,
            "": build(0, 10000, 0),
            OTHER: build(0, 5000, 0),
        };
        expect(run(-5000, testPortfolio)).toEqual({
            "": -5000,
        });
    });
    test("should withdraw from zero-target position with greatest tradable balance first", () => {
        const testPortfolio: NormalizedPortfolio = {
            ...basicPortfolio,
            "": build(0, 10000, 0),
            OTHER: build(0, 5000, 10000),
        };
        expect(run(-5000, testPortfolio)).toEqual({
            "": -5000,
        });
    });
    test("should withdraw from zero-target position with greatest balance first and then proportionately", () => {
        const testPortfolio: NormalizedPortfolio = {
            ...basicPortfolio,
            "": build(0, 10000, 0),
            OTHER: build(0, 5000, 0),
        };
        expect(run(-10000, testPortfolio)).toEqual({
            "": -7500,
            OTHER: -2500,
        });
    });
    test("should handle odd cents when contributing proportionally to balanced portfolio", () => {
        expect(run(50001, basicPortfolio)).toEqual({
            STOCK: 30001,
            BONDS: 20000,
        });
    });
    test("should handle odd cents when withdrawing proportionally from balanced portfolio", () => {
        expect(run(-50001, basicPortfolio)).toEqual({
            STOCK: -30001,
            BONDS: -20000,
        });
    });
    test("should handle odd cents when withdrawing from zero-target positions proportionately", () => {
        const testPortfolio: NormalizedPortfolio = {
            ...basicPortfolio,
            "": build(0, 10000, 0),
            OTHER: build(0, 10000, 0),
            THIRD: build(0, 10000, 0),
        };
        expect(run(-10000, testPortfolio)).toEqual({
            "": -3333,
            OTHER: -3333,
            THIRD: -3334,
        });
    });
    test("should not produce zero-dollar trade for tiny amount when contributing proportionately", () => {
        const testPortfolio: NormalizedPortfolio = {
            ...basicPortfolio,
            STOCK: build(40, 40000, 0),
            OTHER: build(20, 20000, 0),
        };
        expect(run(-1, testPortfolio)).toEqual({
            STOCK: -1,
        });
    });
    test("should not produce zero-dollar trade for tiny amount when withdrawing proportionately", () => {
        const testPortfolio: NormalizedPortfolio = {
            ...basicPortfolio,
            STOCK: build(40, 40000, 0),
            OTHER: build(20, 20000, 0),
        };
        expect(run(-1, testPortfolio)).toEqual({
            STOCK: -1,
        });
    });
    test("should not produce zero-dollar trade for tiny amount when withdrawing from zero-target positions proportionately", () => {
        const testPortfolio: NormalizedPortfolio = {
            ...basicPortfolio,
            "": build(0, 1, 0),
            OTHER: build(0, 1, 0),
        };
        expect(run(-1, testPortfolio)).toEqual({
            OTHER: -1,
        });
    });
});
