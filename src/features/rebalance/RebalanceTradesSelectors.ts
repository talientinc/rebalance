import { createSelector } from "@reduxjs/toolkit";

import {
    selectNormalizedPortfolio,
    selectTotalHoldingsAmount,
    selectTotalPortfolioPercent,
} from "./rebalanceSlice";

export const selectDesiredChanges = createSelector(
    [
        selectTotalPortfolioPercent,
        selectTotalHoldingsAmount,
        selectNormalizedPortfolio,
    ],
    (
        totalPercent,
        totalCents,
        normalizedPortfolio
    ): Readonly<Record<string, number>> => {
        const entries = Object.entries(normalizedPortfolio);

        // If the total portfolio percentage is zero, balance across all
        // positions equally except for the core account.
        const shares = totalPercent || entries.length - 1;
        if (shares === 0) {
            // There are no positions defined outside core, so
            // no trades to be made.
            return {};
        }
        return entries.reduce(
            (pc: Readonly<Record<string, number>>, [name, p]) => {
                const ratio = totalPercent
                    ? p.percent / shares
                    : name
                    ? 1 / shares
                    : 0;
                // Clamp desired change to position amount in case the
                // fixed amount exceeds the desired amount.  No trade
                // should exceed the tradable amount, even if the result won't
                // fully satisfy the desired changes.
                const desiredChange = Math.max(
                    Math.round(totalCents * ratio) - p.cents - p.fixedCents,
                    -p.cents
                );
                return desiredChange ? { ...pc, [name]: desiredChange } : pc;
            },
            {}
        );
    }
);

// A blank source or destination for a trade refers to the core account.
export interface Trade {
    readonly source: string;
    readonly destination: string;
    readonly cents: number;
}

// Compute a group of trades that will satisfy the specified desired changes.
// Each key is the name of the position being traded.  The blank key is
// is reserved for the core account. If the desired increases do not balance the
// decreases, executing the computed trades would leave the excess balance in
// place.
const computeRebalanceTrades = (
    desiredChanges: Readonly<Record<string, number>>
): readonly Trade[] => {
    // Find the maximum and minimum desired changes.
    interface Extremes {
        max: { name: string; change: number };
        min: { name: string; change: number };
    }

    const extremes: Extremes = Object.entries(desiredChanges).reduce(
        (e: Extremes, [name, change]) => {
            if (change > e.max.change) {
                return { ...e, max: { name: name, change: change } };
            } else if (change < e.min.change) {
                return { ...e, min: { name: name, change: change } };
            } else {
                return e;
            }
        },
        { max: { name: "", change: 0 }, min: { name: "", change: 0 } }
    );

    // Determine the maximum trade amount between the two extreme positions,
    // which could be zero if there are no desired increases or no desired
    // decreases.
    const cents = Math.min(
        Math.abs(extremes.max.change),
        Math.abs(extremes.min.change)
    );

    if (cents) {
        // Construct the trade.
        const trade: Readonly<Trade> = {
            source: extremes.min.name,
            destination: extremes.max.name,
            cents: cents,
        };
        // Compute the desired changes remaining to be satisfied after the
        // trade.
        const remainingDesiredChanges: Readonly<Record<string, number>> = {
            ...desiredChanges,
            [trade.source]: desiredChanges[trade.source] + cents,
            [trade.destination]: desiredChanges[trade.destination] - cents,
        };
        // Return the trade plus the trades for the remaining desired changes.
        return [trade, ...computeRebalanceTrades(remainingDesiredChanges)];
    } else {
        // No trades to be made.
        return [];
    }
};

export const selectRebalanceTrades = createSelector(
    [selectDesiredChanges],
    (desiredChanges) => {
        return computeRebalanceTrades(desiredChanges);
    }
);
