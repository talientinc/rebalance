import React, { FormEvent, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Col, Form, InputGroup } from "react-bootstrap";

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

    const onChangeCents = (e: FormEvent<HTMLInputElement>) => {
        const dollars = normalizeDollars(e.currentTarget.value);
        setAmount(dollars);
        dispatch(updateCore({ cents: toCents(dollars) }));
    };

    const onChangePercent = (e: FormEvent<HTMLInputElement>) => {
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
            <span className="h4 pr-2">Core</span>
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
                            value={amount}
                            onChange={onChangeCents}
                        />
                    </InputGroup>
                </Form.Group>
                <Form.Group as={Col} xs={3} md={2}>
                    <Form.Label srOnly>Percent</Form.Label>
                    <InputGroup>
                        <Form.Control
                            className="text-right"
                            placeholder="Pct"
                            value={percent}
                            onChange={onChangePercent}
                        />
                        <InputGroup.Append>
                            <InputGroup.Text>%</InputGroup.Text>
                        </InputGroup.Append>
                    </InputGroup>
                </Form.Group>
            </Form.Row>
        </div>
    );
}
