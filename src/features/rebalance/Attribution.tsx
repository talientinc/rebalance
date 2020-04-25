import React, { FormEvent, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import {
    updateAttribution,
    deleteAttribution,
    selectFixedPositions,
    selectPositionNameKeyList,
} from "./rebalanceSlice";
import { Col, Form, InputGroup } from "react-bootstrap";
import { normalizePercent, toDisplay } from "./util";
import { AppendIcon } from "./AppendIcon";

export const Attribution: React.FC<{
    fixedPositionKey: number;
    attributionKey: number;
}> = ({ fixedPositionKey: fpk, attributionKey: ak }) => {
    const fp = useSelector(selectFixedPositions);
    const nameList = useSelector(selectPositionNameKeyList);

    const dispatch = useDispatch();
    const deleteHandler = () =>
        dispatch(
            deleteAttribution({
                fixedPositionKey: fpk,
                attributionKey: ak,
            })
        );

    const [percent, setPercent] = useState(
        toDisplay(fp[fpk]?.attributions?.[ak]?.percent)
    );
    const [name, setName] = useState(
        toDisplay(fp[fpk]?.attributions?.[ak]?.name)
    );

    const onChangePercent = (e: FormEvent<HTMLInputElement>) => {
        const updatedPercent = normalizePercent(e.currentTarget.value);
        setPercent(updatedPercent);
        dispatch(
            updateAttribution({
                fixedPositionKey: fpk,
                attributionKey: ak,
                attribution: { percent: Number(updatedPercent) },
            })
        );
    };

    const onChangeName = (e: FormEvent<HTMLInputElement>) => {
        setName(e.currentTarget.value);
        dispatch(
            updateAttribution({
                fixedPositionKey: fpk,
                attributionKey: ak,
                attribution: { name: e.currentTarget.value },
            })
        );
    };

    useEffect(() => {
        if (Number(percent) !== fp[fpk]?.attributions?.[ak]?.percent) {
            setPercent(toDisplay(fp[fpk]?.attributions?.[ak]?.percent));
        }
        if (name !== fp[fpk]?.attributions?.[ak]?.name) {
            setName(toDisplay(fp[fpk]?.attributions?.[ak]?.name));
        }
    }, [fp, fpk, ak, name, percent]);

    return (
        <Form.Row className="mr-0">
            <Form.Group
                as={Col}
                xs={{ span: 3, offset: 2 }}
                sm={{ span: 3, offset: 1 }}
                md={{ span: 2, offset: 1 }}
                lg={{ span: 1, offset: 1 }}
            >
                <Form.Label srOnly>Percent</Form.Label>
                <InputGroup size="sm">
                    <Form.Control
                        className="text-right"
                        placeholder="Pct"
                        value={percent}
                        onChange={onChangePercent}
                    />
                    <InputGroup.Append>
                        <InputGroup.Text>%</InputGroup.Text>
                    </InputGroup.Append>
                    <Form.Control.Feedback>Required</Form.Control.Feedback>
                </InputGroup>
            </Form.Group>
            <Form.Group as={Col} xs={6} sm={7} md={8} lg={9}>
                <Form.Label srOnly>Position</Form.Label>
                <InputGroup size="sm">
                    <Form.Control
                        placeholder="Position"
                        value={name}
                        isInvalid={!Boolean(nameList[name])}
                        onChange={onChangeName}
                    />
                    <AppendIcon
                        icon="minus-circle"
                        deleteHandler={deleteHandler}
                        ariaLabel="remove split"
                    />
                    <Form.Control.Feedback type="invalid">
                        Must match Position
                    </Form.Control.Feedback>
                </InputGroup>
            </Form.Group>
        </Form.Row>
    );
};
