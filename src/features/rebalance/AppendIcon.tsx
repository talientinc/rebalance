import React, { MouseEventHandler } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconName } from "@fortawesome/fontawesome-svg-core";
import { Button } from "react-bootstrap";

export const AppendIcon: React.FC<{
    deleteHandler: MouseEventHandler<HTMLButtonElement>;
    icon: IconName;
    ariaLabel: string;
}> = ({ deleteHandler, icon, ariaLabel }) => {
    return (
        <div className="append-icon">
            <Button
                aria-label={ariaLabel}
                className="button-icon"
                onClick={deleteHandler}
            >
                <span className="append-icon-text">
                    <FontAwesomeIcon icon={icon} />
                </span>
            </Button>
        </div>
    );
};
