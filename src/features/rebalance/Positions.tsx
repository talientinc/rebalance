import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Form } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { Position } from "./Position";

import { selectPositions, createPosition } from "./rebalanceSlice";

export function Positions() {
    const positions = useSelector(selectPositions);
    const dispatch = useDispatch();
    return (
        <div>
            <span className="h4 pr-2">Positions</span>
            <button
                className="button-icon"
                aria-label="Add Position"
                onClick={() => dispatch(createPosition({}))}
            >
                <FontAwesomeIcon icon="plus-circle" />
            </button>
            <Form>
                {Object.keys(positions).map((key) => (
                    <Position key={key} id={Number(key)} />
                ))}
            </Form>
        </div>
    );
}
