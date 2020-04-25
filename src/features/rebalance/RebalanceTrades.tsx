import React from "react";
import { useSelector } from "react-redux";

import Table from "react-bootstrap/Table";

import { RebalanceCard } from "./RebalanceCard";

import {
    selectAllReferencesResolved,
    selectPositionNameKeyList,
} from "./rebalanceSlice";
import { Trade, selectRebalanceTrades } from "./RebalanceTradesSelectors";
import { formatPortfolioError, usd } from "./util";

const formatDescription = (trade: Trade) => {
    if (!trade.source) {
        return (
            <span>
                <small>Buy </small>
                {trade.destination}
            </span>
        );
    } else if (!trade.destination) {
        return (
            <span>
                <small>Sell </small>
                {trade.source}
            </span>
        );
    } else {
        return (
            <span>
                <small>Sell </small>
                {trade.source}
                <small> and use proceeds to buy </small>
                {trade.destination}
            </span>
        );
    }
};

export function RebalanceTrades() {
    const rebalanceTrades = useSelector(selectRebalanceTrades);
    const positionNameKeyList = useSelector(selectPositionNameKeyList);
    const allReferencesResolved = useSelector(selectAllReferencesResolved);

    const values = Object.values(rebalanceTrades);
    const portfolioError = formatPortfolioError(
        positionNameKeyList,
        allReferencesResolved
    );

    return (
        <RebalanceCard
            title="Rebalance Trades"
            help={
                <div>
                    <p>
                        Show the list of trades necessary to rebalance the
                        portfolio to the target allocations. The table will be
                        empty if there are any errors in the portfolio or fixed
                        positions.
                    </p>
                </div>
            }
        >
            <Table
                striped
                bordered
                hover
                size="sm"
                responsive="sm"
                className="mb-0"
            >
                <caption>Necessary trades to rebalance portfolio</caption>
                <thead>
                    <tr className="d-flex">
                        <th className="col-1 text-center">#</th>
                        <th className="col-4 col-sm-3 col-md-2 text-center">
                            Amount
                        </th>
                        <th className="col">Trade</th>
                    </tr>
                </thead>
                <tbody>
                    {portfolioError && (
                        <tr>
                            <td className="text-danger" colSpan={3}>
                                {portfolioError}
                            </td>
                        </tr>
                    )}
                    {!portfolioError && values.length === 0 && (
                        <tr>
                            <td colSpan={3}>
                                No trades to display. Portfolio is in balance or
                                no tradable positions exist.
                            </td>
                        </tr>
                    )}
                    {values.map((trade, index) => (
                        <tr key={index} className="d-flex">
                            <td className="col-1 text-center">{index + 1}</td>
                            <td className="col-4 col-sm-3 col-md-2 text-center">
                                {usd.format(trade.cents / 100)}
                            </td>
                            <td className="col">{formatDescription(trade)}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </RebalanceCard>
    );
}
