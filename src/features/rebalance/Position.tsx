import React, { FormEvent, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Col, Form, InputGroup, Row } from "react-bootstrap";

import { AppendIcon } from "./AppendIcon";

import {
    selectPositions,
    updatePosition,
    deletePosition,
} from "./rebalanceSlice";
import {
    normalizeDollars,
    normalizePercent,
    toCents,
    toDisplay,
    toDollars,
} from "./util";

export const Position: React.FC<{
    id: number;
}> = ({ id }) => {
    const positions = useSelector(selectPositions);
    const dispatch = useDispatch();
    const deleteHandler = () => dispatch(deletePosition(id));

    const [amount, setAmount] = useState(toDollars(positions[id].cents));
    const [percent, setPercent] = useState(toDisplay(positions[id].percent));
    const [name, setName] = useState(toDisplay(positions[id].name));

    const onChangeCents = (e: FormEvent<HTMLInputElement>) => {
        const dollars = normalizeDollars(e.currentTarget.value);
        setAmount(dollars);
        dispatch(
            updatePosition({
                key: id,
                position: { cents: toCents(dollars) },
            })
        );
    };

    const onChangePercent = (e: FormEvent<HTMLInputElement>) => {
        const updatedPercent = normalizePercent(e.currentTarget.value);
        setPercent(updatedPercent);
        dispatch(
            updatePosition({
                key: id,
                position: { percent: Number(updatedPercent) },
            })
        );
    };

    const onChangeName = (e: FormEvent<HTMLInputElement>) => {
        setName(e.currentTarget.value);
        dispatch(
            updatePosition({
                key: id,
                position: { name: e.currentTarget.value },
            })
        );
    };

    useEffect(() => {
        if (toCents(amount) !== positions[id].cents) {
            setAmount(toDollars(positions[id].cents));
        }
        if (Number(percent) !== positions[id].percent) {
            setPercent(toDisplay(positions[id].percent));
        }
        if (name !== positions[id].name) {
            setName(toDisplay(positions[id].name));
        }
    }, [positions, id, amount, name, percent]);

    return (
        <Row className="me-0">
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
                    <Form.Control.Feedback>Required</Form.Control.Feedback>
                </InputGroup>
            </Form.Group>
            <Form.Group as={Col} xs={3} md={2}>
                <Form.Label visuallyHidden>Percent</Form.Label>
                <InputGroup>
                    <Form.Control
                        className="text-right"
                        aria-label="Percent"
                        placeholder="Pct"
                        value={percent}
                        onChange={onChangePercent}
                    />
                    <InputGroup.Text>%</InputGroup.Text>
                    <Form.Control.Feedback>Required</Form.Control.Feedback>
                </InputGroup>
            </Form.Group>
            <Form.Group as={Col} xs={4} sm={5} md={7} lg={8}>
                <Form.Label visuallyHidden>Name</Form.Label>
                <InputGroup className={"float-start"}>
                    <Form.Control
                        placeholder="Name"
                        value={name}
                        isInvalid={Boolean(!name)}
                        onChange={onChangeName}
                    />
                    <AppendIcon
                        icon="minus-circle"
                        deleteHandler={deleteHandler}
                        ariaLabel="Remove Position"
                    />
                    <Form.Control.Feedback type="invalid">
                        Required
                    </Form.Control.Feedback>
                </InputGroup>
            </Form.Group>
        </Row>
    );
};
