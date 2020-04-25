import React, { FormEvent, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Col, Form, InputGroup } from "react-bootstrap";

import { AppendIcon } from "./AppendIcon";

import {
    selectFixedPositions,
    selectPositionNameKeyList,
    createAttribution,
    updateFixedPosition,
    deleteFixedPosition,
} from "./rebalanceSlice";
import { normalizeDollars, toCents, toDisplay, toDollars } from "./util";

export const FixedPosition: React.FC<{
    id: number;
}> = ({ id }) => {
    const fixedPositions = useSelector(selectFixedPositions);
    const nameList = useSelector(selectPositionNameKeyList);
    const dispatch = useDispatch();

    const deleteHandler = () => dispatch(deleteFixedPosition(id));
    const createHandler = () =>
        dispatch(
            createAttribution({
                fixedPositionKey: id,
                attribution: {},
            })
        );

    const [amount, setAmount] = useState(toDollars(fixedPositions[id].cents));
    const [name, setName] = useState(toDisplay(fixedPositions[id].name));

    const onChangeCents = (e: FormEvent<HTMLInputElement>) => {
        const dollars = normalizeDollars(e.currentTarget.value);
        setAmount(dollars);
        dispatch(
            updateFixedPosition({
                key: id,
                fixedPosition: { cents: toCents(dollars) },
            })
        );
    };

    const onChangeName = (e: FormEvent<HTMLInputElement>) => {
        setName(e.currentTarget.value);
        dispatch(
            updateFixedPosition({
                key: id,
                fixedPosition: { name: e.currentTarget.value },
            })
        );
    };

    useEffect(() => {
        if (toCents(amount) !== fixedPositions[id].cents) {
            setAmount(toDollars(fixedPositions[id].cents));
        }
        if (name !== fixedPositions[id].name) {
            setName(toDisplay(fixedPositions[id].name));
        }
    }, [fixedPositions, id, amount, name]);

    const nameError = (): string | null => {
        if (fixedPositions[Number(id)]?.attributions) {
            // If there are attributions, the name doesn't need to match
            // a tradable position name, but it must be populated.
            return Boolean(name) ? null : "Required";
        }
        // The name must be populated and match a tradable position name.
        return name && nameList[name] ? null : "Must match Position";
    };

    return (
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
            <Form.Group as={Col}>
                <Form.Label srOnly>Name</Form.Label>
                <InputGroup className={"float-left"}>
                    <Form.Control
                        placeholder="Name"
                        value={name}
                        isInvalid={Boolean(nameError())}
                        onChange={onChangeName}
                    />
                    <AppendIcon
                        icon="plus-circle"
                        deleteHandler={createHandler}
                        ariaLabel="add split"
                    />
                    <AppendIcon
                        icon="minus-circle"
                        deleteHandler={deleteHandler}
                        ariaLabel="remove fixed position"
                    />
                    <Form.Control.Feedback type="invalid">
                        {nameError()}
                    </Form.Control.Feedback>
                </InputGroup>
            </Form.Group>
        </Form.Row>
    );
};
