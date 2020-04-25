import React from "react";
import { useSelector } from "react-redux";
import { Col, Form, InputGroup } from "react-bootstrap";

import { RebalanceCard } from "./RebalanceCard";
import { Core } from "./Core";
import { Positions } from "./Positions";

import {
    selectTotalPortfolioAmount,
    selectTotalPortfolioPercent,
} from "./rebalanceSlice";
import { toDisplay, toDollars } from "./util";

export function Portfolio() {
    const totalAmount = useSelector(selectTotalPortfolioAmount);
    const totalPercent = useSelector(selectTotalPortfolioPercent);
    return (
        <RebalanceCard
            title="Portfolio"
            help={
                <div>
                    <p>
                        List each position in the portfolio. The core account is
                        the cash or cash-equivalent account used to settle
                        trades. The target allocation for each position can be
                        specified explicitly or the portfolio will be balanced
                        evenly across each position (but not the core account).
                        The position name can be anything, but must not be
                        blank. Use the plus button to add a position and the
                        minus button to remove a position.
                    </p>
                </div>
            }
        >
            <div>
                <Core />
                <Positions />
                <span className="h4 pr-2">Total</span>
                <Form.Row>
                    <Form.Group as={Col} xs={5} sm={4} md={3} lg={2}>
                        <Form.Label srOnly>Amount</Form.Label>
                        <InputGroup>
                            <InputGroup.Prepend>
                                <InputGroup.Text>$</InputGroup.Text>
                            </InputGroup.Prepend>
                            <Form.Control
                                className="text-right"
                                placeholder="Amount"
                                disabled
                                readOnly
                                value={toDollars(totalAmount)}
                            />
                            <Form.Control.Feedback>
                                Required
                            </Form.Control.Feedback>
                        </InputGroup>
                    </Form.Group>
                    <Form.Group as={Col} xs={3} md={2}>
                        <Form.Label srOnly>Percent</Form.Label>
                        <InputGroup>
                            <Form.Control
                                className="text-right"
                                placeholder="Pct"
                                disabled
                                readOnly
                                value={toDisplay(totalPercent)}
                            />
                            <InputGroup.Append>
                                <InputGroup.Text>%</InputGroup.Text>
                            </InputGroup.Append>
                            <Form.Control.Feedback>
                                Required
                            </Form.Control.Feedback>
                        </InputGroup>
                    </Form.Group>
                </Form.Row>
            </div>
        </RebalanceCard>
    );
}
