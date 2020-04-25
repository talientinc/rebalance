import { createSelector } from "@reduxjs/toolkit";

import {
    selectNormalizedPortfolio,
    selectPending,
    selectTotalHoldingsAmount,
    selectTotalPortfolioAmount,
    selectTotalPortfolioPercent,
} from "./rebalanceSlice";

export type PendingTrades = Readonly<Record<string, number>>;

type PendingPosition = Readonly<{
    name: string;
    share: number;
    totalShares: number;
    tradableCents: number;
    fixedCents: number;
}>;

type ComputedPosition = PendingPosition &
    Readonly<{
        relativeError: number;
    }>;

const applyEqualAmountWithdrawal = (
    [pendingCents, pendingTrades]: [number, PendingTrades],
    position: ComputedPosition,
    index: number,
    positions: readonly ComputedPosition[]
): [number, PendingTrades] => {
    // Split the withdrawal equally among this position and any subsequent
    // positions in the list, rounding as necessary.  Since each subsequent
    // call to this reducer computes the split again, the accumulated rounding
    // errors will be consumed along the way.  Also, do not round a tiny amount
    // down to zero.
    const amount = Math.round(pendingCents / (positions.length - index));

    // Clamp the total of the current amount to apply along with any previously
    // applied withdrawals to the tradable balance of the position to avoid
    // issues with rounding across multiple tiers of zero-share positions.
    const previouslyAppliedAmount = pendingTrades[position.name] || 0;
    const clampedAmount = Math.max(
        amount,
        -previouslyAppliedAmount - position.tradableCents
    );
    if (clampedAmount) {
        return [
            pendingCents - clampedAmount,
            {
                ...pendingTrades,
                [position.name]: previouslyAppliedAmount + clampedAmount,
            },
        ];
    } else {
        // Either the amount rounded down to zero or was already previously
        // applied, so do not generate a gratuitous zero-dollar withdrawal.
        return [pendingCents, pendingTrades];
    }
};

const computeZeroShareWithdrawals = (
    [pendingCents, pendingTrades, lastZeroShareIndex]: [
        number,
        PendingTrades,
        number
    ],
    position: ComputedPosition,
    index: number,
    positions: readonly ComputedPosition[]
): [number, PendingTrades, number] => {
    if (position.share || pendingCents >= 0) {
        // Nothing further to process.  Either all zero-share positions have
        // been processed or the entire withdrawal amount has been satisfied.
        return [pendingCents, pendingTrades, lastZeroShareIndex];
    }

    // Compute the difference in tradable amount with the next position on the
    // list.  If there are not any positions remaining after this one or the
    // next position is not a zero-share position, the difference is the entire
    // tradable amount of this position (which we know is non-zero because all
    // zero-available-balance positions have already been filtered out).
    const delta =
        positions.length === index + 1 || positions[index + 1].share
            ? position.tradableCents
            : position.tradableCents - positions[index + 1].tradableCents;

    if (delta === 0) {
        // The next position is a zero share position with exactly the same
        // remaining tradable amount.  Move on to the next position.
        return [pendingCents, pendingTrades, index];
    }

    // Determine the amount of difference to apply equally to the current and
    // previous positions in the list.  If the total effect of applying the
    // difference is greater than the pending withdrawal, apply the pending
    // withdrawal amount equally to the current and previous positions in the
    // list.
    const amount = Math.max(-delta * (index + 1), pendingCents);
    const [, updatedTrades] = positions
        .slice(0, index + 1)
        .reduce(applyEqualAmountWithdrawal, [amount, pendingTrades]);

    return [pendingCents - amount, updatedTrades, index];
};

const computeRelativeError = (
    [
        relativeError,
        pendingCents,
        cumulativeShares,
        lastIndex,
        pendingHoldings,
    ]: [number, number, number, number, number],
    position: ComputedPosition,
    index: number,
    positions: readonly ComputedPosition[]
): [number, number, number, number, number] => {
    if (pendingCents === 0) {
        // Nothing further to process.  The entire withdrawal amount has been
        // satisfied.
        return [
            relativeError,
            pendingCents,
            cumulativeShares,
            lastIndex,
            pendingHoldings,
        ];
    }

    const updatedShares = cumulativeShares + position.share;
    const nextRelativeError =
        positions.length === index + 1 ? 0 : positions[index + 1].relativeError;
    const delta = nextRelativeError - position.relativeError;

    if (delta === 0) {
        // The next position has the same relative difference, so move on to the
        // next position.
        return [
            relativeError,
            pendingCents,
            updatedShares,
            index,
            pendingHoldings,
        ];
    }

    const necessaryAmount =
        (pendingHoldings * updatedShares * delta) / position.totalShares;

    if (Math.abs(necessaryAmount) <= Math.abs(pendingCents)) {
        // Necessary amount to correct to this relative error does not exceed
        // the pending transaction.  Continue on to next position.
        return [
            nextRelativeError,
            pendingCents - necessaryAmount,
            updatedShares,
            index,
            pendingHoldings,
        ];
    } else {
        // Scale relative error to the partial difference that will consume just
        // the remaining pending amount.
        const partialDelta =
            (pendingCents * position.totalShares) /
            updatedShares /
            pendingHoldings;
        return [
            position.relativeError + partialDelta,
            0,
            updatedShares,
            index,
            pendingHoldings,
        ];
    }
};

const applyRelativeError = (
    [relativeError, pendingCents, pendingHoldings, pendingTrades]: [
        number,
        number,
        number,
        PendingTrades
    ],
    position: ComputedPosition
): [number, number, number, PendingTrades] => {
    if (pendingCents === 0) {
        // The pending amount has been fully applied
        return [relativeError, pendingCents, pendingHoldings, pendingTrades];
    }

    const delta = relativeError - position.relativeError;

    const amount = Math.round(
        (pendingHoldings * position.share * delta) / position.totalShares
    );

    // There are still pending amounts to be applied, so this trade must involve
    // at least one penny (since we may be in a pass where residual rounding
    // amounts are being allocated).
    const pennyAmount = amount ? amount : pendingCents > 0 ? 1 : -1;

    // Clamp the amount to the pending cents still to be applied
    const pendingAmount =
        pendingCents > 0
            ? Math.min(pennyAmount, pendingCents)
            : Math.max(pennyAmount, pendingCents);

    // Clamp the amount to the tradable position available for withdrawal
    const tradableAmount = Math.max(pendingAmount, -position.tradableCents);

    return [
        relativeError,
        pendingCents - tradableAmount,
        pendingHoldings,
        {
            ...pendingTrades,
            [position.name]: tradableAmount,
        },
    ];
};
const computePendingTrades = (
    pendingCents: number,
    pendingHoldings: number,
    pendingPositions: readonly PendingPosition[],
    pendingTrades: PendingTrades
): PendingTrades => {
    const removeZeroShareWhenContributing = (
        pendingPosition: PendingPosition
    ) => !(pendingCents >= 0 && pendingPosition.share === 0);

    const removeZeroTradableAmountWhenWithdrawing = (
        pendingPosition: PendingPosition
    ) => !(pendingCents <= 0 && pendingPosition.tradableCents === 0);

    // Can still use IEEE 754 precision through this stage of computation,
    // which will speed sorting and matching.  Arbitrary-precision
    // arithmetic will take over later.  The relative error is not yet offset
    // by one, which is not needed for the sorting and matching code.
    const computePendingPosition = (
        pendingPosition: PendingPosition
    ): ComputedPosition => {
        const relativeError = pendingPosition.share
            ? ((pendingPosition.tradableCents + pendingPosition.fixedCents) *
                  pendingPosition.totalShares) /
                  pendingHoldings /
                  pendingPosition.share -
              1
            : 0;
        return {
            ...pendingPosition,
            relativeError: relativeError,
        };
    };

    const compareComputedPosition = (
        a: ComputedPosition,
        b: ComputedPosition
    ) => {
        if (pendingCents < 0) {
            // When withdrawing, zero-share positions with greater tradable
            // amounts appear before zero-share positions with lesser amounts
            // and before any positions with target shares.  Otherwise, the
            // positions are sorted from most positive relative error to the
            // least positive relative error.
            if (a.share && b.share) {
                // Compare by relative error, placing most positive error first
                return b.relativeError - a.relativeError;
            } else if (a.share) {
                // Zero-share b should appear first
                return 1;
            } else if (b.share) {
                // Zero-share a should appear first
                return -1;
            } else {
                // Both are zero-share positions, compare by tradable amount.
                return b.tradableCents - a.tradableCents;
            }
        } else {
            // When contributing, the positions are sorted from least positive
            // relative error to the most positive relative error .  There are
            // no zero-share positions included in the list when contributing,
            // so the ordering is strictly by relative error.
            return a.relativeError - b.relativeError;
        }
    };

    const sortedPositions: readonly ComputedPosition[] = pendingPositions
        .filter(removeZeroShareWhenContributing)
        .filter(removeZeroTradableAmountWhenWithdrawing)
        .map(computePendingPosition)
        .sort(compareComputedPosition);

    if (sortedPositions.length === 1) {
        // There is only one eligible position, apply the contribution or
        // withdrawal subject to the limit of tradable amount.
        return {
            ...pendingTrades,
            [sortedPositions[0].name]:
                Math.max(pendingCents, -sortedPositions[0].tradableCents) +
                (pendingTrades[sortedPositions[0].name] || 0),
        };
    }

    // There are at least two eligible positions.

    // Process zero-share withdrawals first.
    const [
        remainingZeroShareCents,
        zeroShareTrades,
        lastZeroShareIndex,
    ] = sortedPositions.reduce(computeZeroShareWithdrawals, [
        pendingCents,
        pendingTrades,
        -1,
    ]);

    if (!remainingZeroShareCents) {
        // The zero-share withdrawals satisfied the pending withdrawal.
        return zeroShareTrades;
    }

    // Apply remaining balance against remaining positions.  Any tradable
    // amounts in zero-share positions will have been consumed, so they can
    // be omitted from the remaining processing steps.
    const remainingPositions = sortedPositions.slice(lastZeroShareIndex + 1);

    const [
        relativeError,
        ,
        ,
        lastIndex,
    ] = remainingPositions.reduce(computeRelativeError, [
        0,
        remainingZeroShareCents,
        0,
        0,
        pendingHoldings,
    ]);

    const [, remainingCents, , appliedTrades] = remainingPositions
        .slice(0, lastIndex + 1)
        .reduce(applyRelativeError, [
            relativeError,
            remainingZeroShareCents,
            pendingHoldings,
            zeroShareTrades,
        ]);

    if (!remainingCents) {
        // The applied trades have satisfied the pending transaction.
        return appliedTrades;
    }

    // At this point, not all of the pending transaction has been allocated to
    // a trade.  This could be the result of accumulated residual rounding
    // effects or, more significantly, because one of the positions did not
    // apply the full amount of the relative error because it was limited by
    // the tradable balance of the position.

    // Update positions with applied trades.
    const appliedPositions: readonly PendingPosition[] = remainingPositions.map(
        (p) => ({
            ...p,
            tradableCents: p.tradableCents + (appliedTrades[p.name] || 0),
        })
    );

    // Recurse to process remaining pending transaction.
    const remainingTrades = computePendingTrades(
        remainingCents,
        pendingHoldings,
        appliedPositions,
        {}
    );

    // Combine remaining trades with applied trades.
    return Object.entries(remainingTrades).reduce(
        (trades, [name, trade]) => ({
            ...trades,
            [name]: trade + (trades[name] || 0),
        }),
        appliedTrades
    );
};
export const selectPendingTrades = createSelector(
    [
        selectTotalPortfolioPercent,
        selectTotalPortfolioAmount,
        selectTotalHoldingsAmount,
        selectNormalizedPortfolio,
        selectPending,
    ],
    (
        totalPercent,
        totalPortfolio,
        totalHoldings,
        normalizedPortfolio,
        pending
    ): PendingTrades => {
        const emptyPendingTrades: Readonly<Record<string, number>> = {};

        if (!pending.cents) {
            // No pending contribution or withdrawal
            return emptyPendingTrades;
        }

        const entries = Object.entries(normalizedPortfolio);

        if (!entries.length) {
            // Error exists in Positions or Fixed Positions
            return emptyPendingTrades;
        }

        if (pending.cents <= 0 - totalPortfolio) {
            // The pending transaction is a withdrawal equal to or greater
            // than the total tradable positions in the portfolio, so just
            // return a list selling all tradable positions.
            return entries.reduce((pendingTrades, [name, position]) => {
                if (position.cents > 0) {
                    return {
                        ...pendingTrades,
                        [name]: -position.cents,
                    };
                } else {
                    return pendingTrades;
                }
            }, emptyPendingTrades);
        }

        // Total number of positions defined outside of the core account.
        const totalPositions = entries.length - 1;

        // If total percent is non-zero, then it represents the total number
        // of shares specified in the portfolio.  If no percentages were
        // specified, the total number of shares is equal to the total number
        // of positions.  If there were no positions at all in the portfolio,
        // the core position will get the one and only share.
        const totalShares = totalPercent || totalPositions || 1;

        const pendingPositions: readonly PendingPosition[] = entries.map(
            ([name, position]): PendingPosition => {
                const share = totalPercent
                    ? position.percent
                    : name || !totalPositions
                    ? 1
                    : 0;
                return {
                    name: name,
                    share: share,
                    totalShares: totalShares,
                    tradableCents: position.cents,
                    fixedCents: position.fixedCents,
                };
            }
        );

        return computePendingTrades(
            pending.cents,
            totalHoldings + pending.cents,
            pendingPositions,
            emptyPendingTrades
        );
    }
);
