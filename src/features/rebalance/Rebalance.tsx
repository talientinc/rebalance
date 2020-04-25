import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";

import { Portfolio } from "./Portfolio";
import { FixedPositions } from "./FixedPositions";
import { PortfolioSummary } from "./PortfolioSummary";
import { RebalanceTrades } from "./RebalanceTrades";
import { Pending } from "./Pending";
import { Bookmark } from "./Bookmark";
import { Help } from "./Help";

import { restoreBookmark } from "./rebalanceSlice";
import { decodeBookmark } from "./util";

export function Rebalance() {
    const dispatch = useDispatch();

    const location = useLocation();
    const search = new URLSearchParams(location.search);

    useEffect(() => {
        // Restore the bookmarked state if one was specified on the route.
        const decodedBookmark = search.has("bookmark")
            ? decodeBookmark(search.get("bookmark"))
            : "";

        if (decodedBookmark) {
            dispatch(restoreBookmark(decodedBookmark));
        }
    }, [search, dispatch]);

    return (
        <div>
            <Portfolio />
            <FixedPositions />
            <PortfolioSummary />
            <RebalanceTrades />
            <Pending />
            <Bookmark />
            <Help />
        </div>
    );
}
