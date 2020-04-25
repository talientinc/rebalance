import React, { ReactNodeArray } from "react";
import Table from "react-bootstrap/Table";
import { useSelector } from "react-redux";

import { RebalanceCard } from "./RebalanceCard";

import {
    selectAllReferencesResolved,
    selectPositionNameKeyList,
    selectTotalHoldingsAmount,
    selectTotalPortfolioAmount,
    selectTotalPortfolioPercent,
} from "./rebalanceSlice";
import {
    PositionStatus,
    selectPositionStatusList,
} from "./PortfolioSummarySelectors";
import { formatPortfolioError, usd } from "./util";

const formatPercent = (ratio: number): string => {
    return ratio < 0
        ? "(" + (ratio * -100).toFixed(1) + "%)"
        : (ratio * 100).toFixed(1) + "%";
};

const formatShare = (ps: PositionStatus): string => {
    return (
        formatPercent(ps.desiredRatio) +
        " (" +
        ps.share +
        "/" +
        ps.totalShares +
        ")"
    );
};

const formatDollars = (dollars: number): string => {
    return dollars < 0 ? "(" + usd.format(-dollars) + ")" : usd.format(dollars);
};

export function PortfolioSummary() {
    const positionStatusList = useSelector(selectPositionStatusList);
    const totalHoldings = useSelector(selectTotalHoldingsAmount);
    const totalPercent = useSelector(selectTotalPortfolioPercent);
    const totalAmount = useSelector(selectTotalPortfolioAmount);
    const positionNameKeyList = useSelector(selectPositionNameKeyList);
    const allReferencesResolved = useSelector(selectAllReferencesResolved);

    const values = Object.values(positionStatusList);

    const showFixed = totalHoldings !== totalAmount;
    const showShare = totalPercent !== 100;

    const portfolioError = formatPortfolioError(
        positionNameKeyList,
        allReferencesResolved
    );

    const flattenAttributionNodes = (): ReactNodeArray => {
        return values.reduce((positionStatusNodes: ReactNodeArray, ps) => {
            const attributionNodes = Object.entries(ps.attributions).reduce(
                (tableRows: ReactNodeArray, [fp, cents]) => {
                    const tableRow = (
                        <tr key={ps.name + "-" + fp}>
                            <td className="text-center">{fp}</td>
                            <td className="text-center">
                                {ps.name || <em>Core</em>}
                            </td>
                            <td className="text-right">
                                {usd.format(cents / 100)}
                            </td>
                        </tr>
                    );
                    return [...tableRows, tableRow];
                },
                []
            );
            return [...positionStatusNodes, ...attributionNodes];
        }, []);
    };

    return (
        <RebalanceCard
            title="Portfolio Summary"
            help={
                <div>
                    <p>
                        Show the comparison of each position in the portfolio to
                        its target allocation. If any fixed positions have been
                        specified, the table will show the breakdown of the
                        fixed and tradable amount for each position as well as
                        the itemized allocation of each fixed position to the
                        corresponding tradable position.
                    </p>
                    <p>
                        The table will be empty if there are any errors in the
                        portfolio or fixed positions.
                    </p>
                </div>
            }
            collapsed
        >
            <Table
                striped
                bordered
                hover
                size="sm"
                responsive="sm"
                className="mb-0"
            >
                <caption>{`Comparison of portfolio to target allocations${
                    showFixed ? " (includes fixed positions)" : ""
                }`}</caption>
                <thead>
                    <tr>
                        <th className="text-center">Name</th>
                        <th className="text-center">
                            {showFixed ? "Tradable Amount" : "Amount"}
                        </th>
                        {showFixed && [
                            <th key="3" className="text-center">
                                Fixed Amount
                            </th>,
                            <th key="4" className="text-center">
                                Total Amount
                            </th>,
                        ]}
                        <th className="text-center">
                            {"Target Percent" + (showShare ? " (Share)" : "")}
                        </th>
                        <th className="text-center">Actual Percent</th>
                        <th colSpan={2} className="text-center">
                            Shortfall (Excess)
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {portfolioError && (
                        <tr>
                            <td
                                className="text-danger"
                                colSpan={showFixed ? 7 : 5}
                            >
                                {portfolioError}
                            </td>
                        </tr>
                    )}
                    {values.map((ps) => (
                        <tr key={ps.name}>
                            <td className="text-center">
                                {ps.name || <em>Core</em>}
                            </td>
                            <td className="text-right">
                                {usd.format(ps.tradableCents / 100)}
                            </td>
                            {showFixed && [
                                <td key="3" className="text-right">
                                    {usd.format(ps.fixedCents / 100)}
                                </td>,
                                <td key="4" className="text-right">
                                    {usd.format(
                                        (ps.tradableCents + ps.fixedCents) / 100
                                    )}
                                </td>,
                            ]}
                            <td className="text-center">
                                {showShare
                                    ? formatShare(ps)
                                    : formatPercent(ps.desiredRatio)}
                            </td>
                            <td className="text-center">
                                {formatPercent(ps.actualRatio)}
                            </td>
                            <td className="text-right">
                                {formatDollars(ps.desiredChange / 100)}
                            </td>
                            <td className="text-center">
                                {formatPercent(
                                    ps.desiredRatio - ps.actualRatio
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            {showFixed && (
                <Table
                    striped
                    bordered
                    hover
                    size="sm"
                    responsive="sm"
                    className="mt-3 mb-0"
                >
                    <caption>
                        Itemized allocation of fixed positions to tradable
                        positions
                    </caption>
                    <thead>
                        <tr>
                            <th className="text-center">Fixed Position</th>
                            <th className="text-center">Tradable Position</th>
                            <th className="text-center">Amount</th>
                        </tr>
                    </thead>
                    <tbody>{flattenAttributionNodes()}</tbody>
                </Table>
            )}
        </RebalanceCard>
    );
}
