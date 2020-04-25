import {
    selectDesiredChanges,
    selectRebalanceTrades,
} from "./RebalanceTradesSelectors";
import {
    NormalizedPortfolio,
    NormalizedPosition,
} from "./rebalanceSlice";

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

const emptyDesiredTrades: Readonly<Record<string, number>> = {};

const run = (
    testPortfolio: NormalizedPortfolio
): Readonly<Record<string, number>> => {
    // Invoke the selectDesiredTrades result function with a self-consistent
    // set of parameters built from the test portfolio.
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
    return selectDesiredChanges.resultFunc(
        totalPercent,
        totalCents + totalFixedCents,
        testPortfolio
    );
};

describe("select pending trades", () => {
    test("should handle empty portfolio", () => {
        expect(run(emptyPortfolio)).toEqual(emptyDesiredTrades);
    });
    test("should handle single-position portfolio", () => {
        const testPortfolio: NormalizedPortfolio = {
            "": build(0, 60000, 0),
        };
        expect(run(testPortfolio)).toEqual(emptyDesiredTrades);
    });
    test("should handle balanced portfolio", () => {
        expect(run(basicPortfolio)).toEqual(emptyDesiredTrades);
    });
    test("should handle unbalanced portfolio", () => {
        const testPortfolio: NormalizedPortfolio = {
            ...basicPortfolio,
            "": build(0, 10000, 0),
        };
        expect(run(testPortfolio)).toEqual({
            "": -10000,
            STOCK: 6000,
            BONDS: 4000,
        });
    });
    test("should handle fixed amounts", () => {
        const testPortfolio: NormalizedPortfolio = {
            ...basicPortfolio,
            STOCK: build(60, 0, 160000),
        };
        expect(run(testPortfolio)).toEqual({
            BONDS: 40000,
        });
    });
    test("should handle even proportions", () => {
        const testPortfolio: NormalizedPortfolio = {
            ...basicPortfolio,
            STOCK: build(0, 60000, 0),
            BONDS: build(0, 40000, 0),
        };
        expect(run(testPortfolio)).toEqual({
            BONDS: 10000,
            STOCK: -10000,
        });
    });
});

describe("select rebalance trades", () => {
    test("should handle empty desired changes", () => {
        expect(selectRebalanceTrades.resultFunc({})).toEqual([]);
    });
    test("should handle balanced changes", () => {
        expect(
            selectRebalanceTrades.resultFunc({
                STOCKS: 20,
                BONDS: -14,
                OTHER: -6,
            })
        ).toEqual([
            {
                cents: 14,
                destination: "STOCKS",
                source: "BONDS",
            },
            {
                cents: 6,
                destination: "STOCKS",
                source: "OTHER",
            },
        ]);
    });
    test("should handle unbalanced changes", () => {
        expect(
            selectRebalanceTrades.resultFunc({
                STOCKS: 20,
                BONDS: -14,
            })
        ).toEqual([
            {
                cents: 14,
                destination: "STOCKS",
                source: "BONDS",
            },
        ]);
    });
});
