import { createSelector } from "@reduxjs/toolkit";
import {
    selectNormalizedPortfolio,
    selectTotalHoldingsAmount,
    selectTotalPortfolioPercent,
} from "./rebalanceSlice";

export type PositionStatus = Readonly<{
    name: string;
    share: number;
    totalShares: number;
    desiredRatio: number;
    actualRatio: number;
    tradableCents: number;
    fixedCents: number;
    desiredChange: number;
    attributions: {
        [index: string]: number;
    };
}>;

export const selectPositionStatusList = createSelector(
    [
        selectTotalPortfolioPercent,
        selectTotalHoldingsAmount,
        selectNormalizedPortfolio,
    ],
    (totalPercent, totalCents, normalizedPortfolio): PositionStatus[] => {
        const entries = Object.entries(normalizedPortfolio);

        // Total number of positions defined outside of the core account.
        const totalPositions = entries.length - 1;

        // If total percent is non-zero, then it represents the total number
        // of shares specified in the portfolio.  If no percentages were
        // specified, the total number of shares is equal to the total number
        // of positions.  If there were no positions at all in the portfolio,
        // the core position will get the one and only share.
        const totalShares = totalPercent || totalPositions || 1;

        return entries.map(
            ([name, p]): PositionStatus => {
                const share = totalPercent
                    ? p.percent
                    : name || !totalPositions
                    ? 1
                    : 0;
                const desiredRatio = share / totalShares;
                const actualRatio = totalCents
                    ? (p.cents + p.fixedCents) / totalCents
                    : 0;
                const desiredChange =
                    Math.round(totalCents * desiredRatio) -
                    p.cents -
                    p.fixedCents;
                return {
                    name: name,
                    share: share,
                    totalShares: totalShares,
                    desiredRatio: desiredRatio,
                    actualRatio: actualRatio,
                    tradableCents: p.cents,
                    fixedCents: p.fixedCents,
                    desiredChange: desiredChange,
                    attributions: p.attributions,
                };
            }
        );
    }
);
