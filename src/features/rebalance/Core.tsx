import React, { ChangeEvent, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Col, Form, InputGroup, Row } from "react-bootstrap";

import { selectCore, updateCore } from "./rebalanceSlice";
import {
    normalizeDollars,
    normalizePercent,
    toCents,
    toDisplay,
    toDollars,
} from "./util";

export function Core() {
    const core = useSelector(selectCore);
    const dispatch = useDispatch();

    const [amount, setAmount] = useState(toDollars(core.cents));
    const [percent, setPercent] = useState(toDisplay(core.percent));

    const onChangeCents = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const dollars = normalizeDollars(e.currentTarget.value);
        setAmount(dollars);
        dispatch(updateCore({ cents: toCents(dollars) }));
    };

    const onChangePercent = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const updatedPercent = normalizePercent(e.currentTarget.value);
        setPercent(updatedPercent);
        dispatch(updateCore({ percent: Number(updatedPercent) }));
    };

    useEffect(() => {
        if (toCents(amount) !== core.cents) {
            setAmount(toDollars(core.cents));
        }
        if (Number(percent) !== core.percent) {
            setPercent(toDisplay(core.percent));
        }
    }, [core, amount, percent]);

    return (
        <div>
            <span className="h4 pe-2">Core</span>
            <Row>
                <Form.Group as={Col} xs={5} sm={4} md={3} lg={2} className="mb-3">
                    <Form.Label visuallyHidden>Amount</Form.Label>
                    <InputGroup>
                        <InputGroup.Text>$</InputGroup.Text>
                        <Form.Control
                            className="text-end"
                            placeholder="Amount"
                            value={amount}
                            onChange={onChangeCents}
                        />
                    </InputGroup>
                </Form.Group>
                <Form.Group as={Col} xs={3} md={2} className="mb-3">
                    <Form.Label visuallyHidden>Percent</Form.Label>
                    <InputGroup>
                        <Form.Control
                            className="text-end"
                            placeholder="Pct"
                            value={percent}
                            onChange={onChangePercent}
                        />
                        <InputGroup.Text>%</InputGroup.Text>
                    </InputGroup>
                </Form.Group>
            </Row>
        </div>
    );
}
