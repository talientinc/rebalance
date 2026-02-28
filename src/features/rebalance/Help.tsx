import React from "react";

import { RebalanceCard } from "./RebalanceCard";
import { Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import { encodeBookmark } from "./util";

export function Help() {
    return (
        <RebalanceCard title="Detailed Help" collapsed>
            <Alert variant="danger">
                <Alert.Heading>Legal Disclaimer</Alert.Heading>
                <p>
                    Nothing on this site constitutes legal or financial advice.{" "}
                    <b>
                        Any action you take upon the information on this site is
                        strictly at your own risk.
                    </b>{" "}
                    You alone assume the sole responsibility for verifying the
                    accuracy of any calculations and the applicability to your
                    individual situation. We will not be responsible for any
                    losses or damages in connection with use of this calculator
                    or site.
                </p>
            </Alert>
            <h5>Privacy</h5>
            <p>
                All calculations performed by this application are executed
                locally on your device within the web browser. Nothing is
                transmitted to the server. This web site does not use cookies or
                any similar technologies to collect any other information. (The
                company hosting the web site may monitor connections to manage
                bandwidth.)
            </p>
            <h5>Live</h5>
            <p>
                All of the calculations are live. The portfolio summary, list of
                trades to rebalance the portfolio and list of purchases or sales
                for a pending contribution or withdrawal (as well as the
                bookmark link) are updated immediately as you enter information
                into the portfolio along with any fixed positions you may have.
            </p>
            <h5>Names</h5>
            <p>
                While each position is required to have a non-blank name, there
                is no specific requirement for what name you wish to use. When
                using this calculator on a small device, it may be suitable to
                use trading symbols instead of longer names or descriptive
                phrases, but the choice is yours. As described in the help text
                for <i>Fixed Positions</i>, those names (or splits) must exactly
                match the names of tradable positions.
            </p>
            <h5>Duplicate Names</h5>
            <p>
                The names do not need to be unique. If more than one position
                has the same name, any amounts entered for the duplicate
                positions will be aggregated together when summarizing the
                portfolio or calculating any transactions. This can be useful
                when dealing with similar positions in multiple accounts, but
                keep in mind that the resulting calculations will not
                differentiate between the two entries. For example, if you have
                $2,000 in one position and $3,000 in another position with the
                same name and the calculator determines that $4,000 needs to be
                sold from the aggregated holdings with that name, it will not
                split that $4,000 trade into two separate transactions.
            </p>
            <p>
                Similarly, the target allocations for identically-named
                positions are aggregated together. If you have two positions for
                which you are targeting a combined share of 60%, you can enter
                the number in either row while leaving the other blank, or enter
                30% in each row or split the numbers any way you like. The
                calculator only cares about the aggregate totals for positions
                with the same name.
            </p>
            <h5>Percentages</h5>
            <p>
                While the fields containing the target allocations are labeled
                as <i>Percent</i> and while most sample portfolio allocations
                are expressed as percentages, the percentages entered do not
                need to add up to 100. The calculator treats each value entered
                as a corresponding share of the total. For example, to rebalance
                a portfolio such that one position is twice the other, it is
                sufficient to specify the share for the lesser position to be{" "}
                <samp>1</samp> and the share for the other to be <samp>2</samp>.
                That is easier that specifying the percentages as{" "}
                <samp>33.3333</samp> and <samp>66.6667</samp> respectively. (As
                discussed later, adding decimal fractions is an inherently
                imprecise operation for computers.) When the allocations do not
                add up to 100, the <i>Portfolio Summary</i> will show both the
                aggregated target shares allocated to each position as well as
                the corresponding percentage.
            </p>
            <h5>Fixed Positions</h5>
            <p>
                You only need to specify a fixed position if you have a holding
                that you need to consider when calculating the target
                allocations for your portfolio, but which should not be changed
                by any of the resulting transactions. Perhaps you do not want to
                trigger a taxable event by selling a part of the fixed position.
                Perhaps the fixed position is being held in a separate account
                for which you are not in position to make changes at this time.
                Any position that must not be reduced can be listed there.
            </p>
            <p>
                It is important to note that fixed positions may interfere with
                any calculation that involves withdrawing from a position that
                includes a fixed amount. If rebalancing the portfolio involves
                withdrawing more money than is available in the tradable portion
                of a position, the portfolio will not reach the target
                allocations after executing the resulting trades. Similarly,
                when withdrawing from a portfolio, the calculator will not list
                a sale greater than the tradable portion of a position, leaving
                the portfolio further out of balance than it would otherwise be.
            </p>
            <h5>Bookmark</h5>
            <p>
                When following the <i>Bookmark</i> link, the browser will open a
                new tab or page with the same portfolio structure, but without
                any amounts populated. The URL for the new page encodes the
                portfolio structure. Add a bookmark for the new page in your
                browser or store the link anywhere else you would like. When you
                follow the link or refresh the page for that link, the
                calculator will be reset to the encoded portfolio structure.
                Just fill in the most recent amounts.
            </p>
            <h5>Rounding</h5>
            <p>
                This calculator is implemented as a javascript application
                running within your browser. Like most computer languages,
                javascript uses the IEEE 754 standard for floating point
                arithmetic. Because all computers have to make compromises in
                representing decimal fractions, not every value can be
                represented precisely. Most famously, the sum of{" "}
                <samp>0.1</samp> plus <samp>0.2</samp> does not{" "}
                <em>precisely</em> equal <samp>0.3</samp>. Also, there are
                limitations on the largest integer value that can be stored
                safely. For example, <samp>9,007,199,254,740,992</samp> is
                treated the same as <samp>9,007,199,254,740,993</samp>.
            </p>
            <p>
                If you don‘t enter portfolios totaling in the billions and you
                don‘t enter tiny fractional allocations, the calculator will
                handle everything cleanly, distributing any residual rounding
                effects evenly throughout the resulting set of transactions.
                Despite any rounding, however, no sale will exceed the tradable
                amount of a position and the sum of all transactions will
                exactly match any contribution or withdrawal from the portfolio.
            </p>
            <h5>Rebalance Trades</h5>
            <p>
                The list of necessary trades to rebalance the portfolio is
                chosen to minimize the number of separate transactions involved,
                where selling a portion of one position and using the proceeds
                to buy another position is treated as a single transaction (and
                can be executed as such in many financial institutions). While
                the algorithm will not violate the trading constraints put upon
                it by the presence of any fixed positions, it calculates the
                resulting transactions assuming that fixed positions will not
                interfere. That means that if a fixed position does interfere
                with reaching a balanced allocation by preventing the sale of a
                fixed position, the portfolio not only won‘t be fully balanced,
                it might not result in the least worst approximation to the
                target allocation.
            </p>
            <h5>Contribute or Withdraw</h5>
            <p>
                On the other hand, when calculating the list of purchases to
                make when contributing to a portfolio or the sales to fund
                withdrawing from a portfolio, the algorithm assumes that it will
                not be likely to bring the portfolio into complete balance.
                Instead, it chooses transactions to minimize the final{" "}
                <a
                    href="https://en.wikipedia.org/wiki/Approximation_error#Formal_Definition"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    relative error
                </a>{" "}
                compared to the target portfolio allocation.
            </p>
            <p>
                For example, the calculator will prioritize purchasing a
                position that is $200 short of a $1000 target allocation (20%)
                before a position that is $500 short of a $5000 target
                allocation (10%). After executing the resulting set of purchases
                or sales, the maximum difference between the actual allocation
                percentage and the target allocation percentage in the resulting
                portfolio will be the smallest it can be.
            </p>
            <h5>Examples</h5>
            <p>
                These bookmarks demonstrate some of the possible ways you can
                define a portfolio when using the calculator. Like all
                bookmarks, there are no amounts. Put in some test amounts to see
                how the calculator computes the trades to rebalance to portfolio
                or fund withdrawals from fixed positions.
            </p>
            <p>
                (None of the examples are intended to be investment advice. Any
                correspondence to actual symbols is purely coincidental.)
            </p>
            <p>
                <Link
                    target="_blank"
                    to={
                        "/?bookmark=" +
                        encodeBookmark({
                            core: {},
                            positions: {
                                0: { percent: 60, name: "STOCK" },
                                1: { percent: 40, name: "BONDS" },
                            },
                            fixedPositions: {},
                        })
                    }
                >
                    Basic Portfolio
                </Link>
            </p>
            <p>This is an example of the common 60/40 portfolio.</p>
            <p>
                <Link
                    target="_blank"
                    to={
                        "/?bookmark=" +
                        encodeBookmark({
                            core: {},
                            positions: {
                                0: { percent: 3, name: "STOCK" },
                                1: { percent: 2, name: "BONDS" },
                            },
                            fixedPositions: {},
                        })
                    }
                >
                    Portfolio Using Shares
                </Link>
            </p>
            <p>
                This is the same as the basic portfolio above, but with the
                shares being split in a 3:2 ratio. Note how the target
                percentages are displayed in the <i>Portfolio Summary</i>. When
                populated with identical amounts, the calculator will produce
                identical transactions for both portfolios.
            </p>
            <p>
                <Link
                    target="_blank"
                    to={
                        "/?bookmark=" +
                        encodeBookmark({
                            core: {},
                            positions: {
                                0: { percent: 50, name: "DOMEQ" },
                                1: { percent: 35, name: "INTEQ" },
                                2: { percent: 15, name: "BONDS" },
                            },
                            fixedPositions: {
                                0: {
                                    name: "FIXED",
                                    attributions: {
                                        0: { percent: 30, name: "DOMEQ" },
                                        1: { percent: 25, name: "INTEQ" },
                                        2: { percent: 35, name: "BONDS" },
                                    },
                                },
                            },
                        })
                    }
                >
                    Fixed Position
                </Link>
            </p>
            <p>
                This portfolio includes an example of a Fixed Position, perhaps
                a lifecycle fund being held in a workplace retirement account
                that is being allocated to different sector funds held
                individually in the tradable portion of the portfolio. Note that
                the allocation of the fixed position to the corresponding
                tradable positions does not need to match the target allocations
                of the tradable position.
            </p>
            <p>
                <Link
                    target="_blank"
                    to={
                        "/?bookmark=" +
                        encodeBookmark({
                            core: {},
                            positions: {
                                0: { percent: 5, name: "FUND A" },
                                1: { percent: 32, name: "FUND B" },
                                2: { percent: 8, name: "FUND C" },
                                3: { percent: 5, name: "FUND D" },
                                4: { percent: 5, name: "FUND E" },
                                5: { percent: 5, name: "FUND F" },
                                6: { percent: 40, name: "FUND G" },
                            },
                            fixedPositions: {
                                0: {
                                    name: "FIXED",
                                    attributions: {
                                        0: { name: "FUND D" },
                                        1: { name: "FUND E" },
                                        2: { name: "FUND G" },
                                    },
                                },
                            },
                        })
                    }
                >
                    Complex Portfolio
                </Link>
            </p>
            <p>
                This is a more complex portfolio with seven tradable positions
                and a fixed position that is split equally across three tradable
                positions that have significantly different target allocations.
                Experiment with different balances and withdrawals to see how
                the fixed positions affect the calculations.
            </p>
            <h5>Open Source</h5>
            <p>
                The <i>Rebalance Calculator</i> application is open source under
                the MIT license and can be found at{" "}
                <a
                    href="https://github.com/talientinc/rebalance"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    https://github.com/talientinc/rebalance
                </a>
                .
            </p>
            <p>
                <small>Release {`${import.meta.env.VITE_APP_VERSION}`}</small>
            </p>
        </RebalanceCard>
    );
}
