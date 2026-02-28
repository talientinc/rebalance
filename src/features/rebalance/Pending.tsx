import React, { FormEvent, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import Table from "react-bootstrap/Table";

import { RebalanceCard } from "./RebalanceCard";

import {
    selectAllReferencesResolved,
    selectPositionNameKeyList,
    selectPending,
    updatePending,
} from "./rebalanceSlice";
import { selectPendingTrades } from "./PendingSelectors";
import {
    formatPortfolioError,
    normalizeDollars,
    toCents,
    toDollars,
    usd,
} from "./util";
import { Col, Form, InputGroup, Row } from "react-bootstrap";

export function Pending() {
    const pending = useSelector(selectPending);
    const pendingTrades = useSelector(selectPendingTrades);
    const positionNameKeyList = useSelector(selectPositionNameKeyList);
    const allReferencesResolved = useSelector(selectAllReferencesResolved);
    const dispatch = useDispatch();

    const [amount, setAmount] = useState(toDollars(pending.cents));

    const onChangeCents = (e: FormEvent<HTMLInputElement>) => {
        const dollars = normalizeDollars(e.currentTarget.value, true);
        setAmount(dollars);
        dispatch(updatePending({ cents: toCents(dollars) }));
    };

    const entries = Object.entries(pendingTrades);
    const portfolioError = formatPortfolioError(
        positionNameKeyList,
        allReferencesResolved
    );

    return (
        <RebalanceCard
            title="Contribute or Withdraw"
            help={
                <div>
                    <p>
                        Show the list of purchases to make when contributing to
                        the portfolio or sales to fund a withdrawal from the
                        portfolio. Enter a positive amount for a contribution or
                        a negative amount for a withdrawal.
                    </p>
                    <p>
                        These transactions will be the optimal choices to bring
                        the portfolio closest to its target allocation without
                        performing any additional rebalancing.
                    </p>
                    <p>
                        The table will be empty if there are any errors in the
                        portfolio or fixed positions.
                    </p>
                </div>
            }
            collapsed
        >
            <Form>
                <Row>
                    <Form.Group as={Col} xs={5} sm={4} md={3} lg={2}>
                        <Form.Label visuallyHidden>Amount</Form.Label>
                        <InputGroup>
                            <InputGroup.Text>$</InputGroup.Text>
                            <Form.Control
                                className="text-right"
                                placeholder="Amount"
                                value={amount}
                                onChange={onChangeCents}
                            />
                        </InputGroup>
                    </Form.Group>
                </Row>
            </Form>
            <Table
                striped
                bordered
                hover
                size="sm"
                responsive="sm"
                className="mb-0"
            >
                <caption>
                    {Number(pending.cents) < 0
                        ? "Sales to fund withdrawal"
                        : "Purchases to make with contribution"}
                </caption>
                <thead>
                    <tr className="d-flex">
                        <th className="col-1 text-center">#</th>
                        <th className="col-4 col-sm-3 col-md-2 text-center">
                            Amount
                        </th>
                        <th className="col">
                            {Number(pending.cents) < 0 ? "Sales" : "Purchases"}
                        </th>
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
                    {!portfolioError && entries.length === 0 && !pending.cents && (
                        <tr>
                            <td colSpan={3}>
                                Please enter a pending contribution or
                                withdrawal
                            </td>
                        </tr>
                    )}
                    {!portfolioError &&
                        entries.length === 0 &&
                        Number(pending.cents) < 0 && (
                            <tr>
                                <td colSpan={3}>
                                    No tradable positions exist for withdrawal.
                                </td>
                            </tr>
                        )}
                    {entries.map(([name, cents], index) => (
                        <tr key={index + 1} className="d-flex">
                            <td className="col-1 text-center">
                                {Number(index) + 1}
                            </td>
                            <td className="col-4 col-sm-3 col-md-2 text-center">
                                {usd.format(cents / 100)}
                            </td>
                            <td className="col">{name}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </RebalanceCard>
    );
}
