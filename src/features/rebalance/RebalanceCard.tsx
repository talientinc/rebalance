import React, { ReactNode, useState } from "react";
import { Alert, Button, Card, Collapse } from "react-bootstrap";
import { IconName } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export const RebalanceCard: React.FC<{
    title?: ReactNode;
    help?: ReactNode;
    collapsed?: boolean;
}> = ({ title, help, children, collapsed }) => {
    const [show, setShow] = useState(!Boolean(collapsed));
    const [showHelp, setShowHelp] = useState(false);
    const discloseName: IconName = show
        ? "chevron-circle-down"
        : "chevron-circle-right";
    return (
        <Card>
            <Card.Header>
                <Button
                    className="button-icon float-left"
                    aria-label={`${show ? "Hide" : "Show"} ${title}`}
                    onClick={() => setShow(!show)}
                >
                    <FontAwesomeIcon size="2x" icon={discloseName} />
                </Button>
                <span className="h4 mb-0 pl-3">{title}</span>
                {help && (
                    <Button
                        className="button-icon float-right"
                        aria-label={`help`}
                        onClick={() => {
                            setShowHelp(true);
                            setShow(true);
                        }}
                    >
                        <FontAwesomeIcon size="2x" icon="question-circle" />
                    </Button>
                )}
            </Card.Header>
            <Collapse in={show}>
                <Card.Body>
                    {showHelp && (
                        <Alert
                            variant="info"
                            className="pb-0"
                            dismissible
                            onClose={() => setShowHelp(false)}
                        >
                            {help}
                            <hr className="mb-0" />
                            <div className="text-nowrap">
                                <small>
                                    For further information, see
                                    <span className="font-weight-bold">
                                        {" "}
                                        Detailed Help{" "}
                                    </span>
                                    below.
                                </small>
                            </div>
                        </Alert>
                    )}
                    {children}
                </Card.Body>
            </Collapse>
        </Card>
    );
};
