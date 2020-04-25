import React from "react";
import { RebalanceCard } from "./RebalanceCard";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

import { selectBookmark } from "./rebalanceSlice";
import { encodeBookmark } from "./util";

export function Bookmark() {
    const bookmark = useSelector(selectBookmark);

    return (
        <RebalanceCard
            title="Bookmark"
            help={
                <div>
                    <p>
                        Follow the link below and save it as a bookmark in your
                        browser to restore the current portfolio configuration
                        in the future.{" "}
                        <em>
                            Important! The saved configuration does <u>not</u>{" "}
                            include any amounts you have entered.
                        </em>{" "}
                        When you follow the saved bookmark, just fill in the
                        current balances to get the updated trades.
                    </p>
                </div>
            }
            collapsed
        >
            <div>
                <p>
                    Use this
                    <Link
                        target="_blank"
                        to={"/?bookmark=" + encodeBookmark(bookmark)}
                    >
                        {" "}
                        Bookmark{" "}
                    </Link>
                    to restore current portfolio configuration (except for any
                    amounts you may have entered).
                </p>
            </div>
        </RebalanceCard>
    );
}
