import React, { ReactNode } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Form } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { RebalanceCard } from "./RebalanceCard";
import { FixedPosition } from "./FixedPosition";
import { Attribution } from "./Attribution";

import { selectFixedPositions, createFixedPosition } from "./rebalanceSlice";

export function FixedPositions() {
    const fixedPositions = useSelector(selectFixedPositions);
    const dispatch = useDispatch();

    // Generate a row for each fixed position with additional rows inserted
    // between them for each attribution defined for the fixed position.
    const flattenFixedPositionNodes = (): ReactNode[] => {
        return Object.keys(fixedPositions).reduce(
            (nodes: ReactNode[], fpk) => {
                const fixedPositionNode = (
                    <FixedPosition key={fpk} id={Number(fpk)} />
                );
                const attributions = fixedPositions[Number(fpk)]?.attributions;
                const attributionNodes = attributions
                    ? Object.keys(attributions).reduce(
                          (aNodes: ReactNode[], ak) => {
                              const attributionNode = (
                                  <Attribution
                                      key={fpk + "-" + ak}
                                      fixedPositionKey={Number(fpk)}
                                      attributionKey={Number(ak)}
                                  />
                              );
                              return [...aNodes, attributionNode];
                          },
                          []
                      )
                    : [];
                return [...nodes, fixedPositionNode, ...attributionNodes];
            },
            []
        );
    };

    return (
        <RebalanceCard
            title="Fixed Positions"
            help={
                <div>
                    <p>
                        Define any fixed positions in the portfolio. A fixed
                        position is any position that is <em>not tradable, </em>
                        but which should be considered part of the target
                        allocation for a tradable position when rebalancing the
                        portfolio or when contributing or withdrawing from the
                        portfolio. However, the fixed amount will not be
                        included in any trades when rebalancing the portfolio or
                        when withdrawing from the portfolio.
                    </p>
                    <p>
                        Every fixed position must be attributed to a tradable
                        position. If a fixed position has the same name as a
                        tradable position, the amount will count towards the
                        tradable position&rsquo;s target allocation.
                    </p>
                    <p>
                        A fixed position can be split proportionately among
                        multiple tradable positions. If the fixed position is
                        split, each split must match the name of a tradable
                        position and the name of the fixed position itself can
                        be anything (but not blank). The portion of each split
                        can be specified explicitly or the splits will be
                        allocated evenly if left blank.
                    </p>
                    <p>
                        Use the plus button to add a fixed position to the list
                        and the minus button to the right of each fixed position
                        to remove it. Use the plus button to the right of each
                        fixed position to add a split and the minus button by
                        each split to remove it.
                    </p>
                </div>
            }
            collapsed
        >
            <div>
                <span className="h4 pr-2">Fixed Positions</span>
                <button
                    aria-label="Add Fixed Position"
                    className="button-icon"
                    onClick={() => dispatch(createFixedPosition({}))}
                >
                    <FontAwesomeIcon icon="plus-circle" />
                </button>
                <Form>{flattenFixedPositionNodes()}</Form>
            </div>
        </RebalanceCard>
    );
}
