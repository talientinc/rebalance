import { PayloadAction } from "@reduxjs/toolkit";

import rebalanceReducer, { updateCore } from "./rebalanceSlice";

import type { Core, PortfolioState } from "./rebalanceSlice";

describe("update core", () => {
    const state: PortfolioState = {
        core: {},
        positions: {},
        fixedPositions: {},
        pending: {},
    };
    const action: PayloadAction<Core> = {
        type: updateCore.type,
        payload: {},
    };
    beforeEach(() => {
        state.core = {};
        action.payload = {};
    });
    test("should update initial state", () => {
        action.payload = {
            percent: 50,
            cents: 12345,
        };
        expect(rebalanceReducer(state, action).core).toEqual(action.payload);
    });
    test("should update percent", () => {
        state.core = {
            percent: 50,
        };
        action.payload = { percent: 25 };
        expect(rebalanceReducer(state, action).core.percent).toEqual(25);
    });
    test("should update amount", () => {
        state.core = {
            cents: 12345,
        };
        action.payload = { cents: 54321 };
        expect(rebalanceReducer(state, action).core.cents).toEqual(54321);
    });
    test("should not affect undefined fields", () => {
        state.core = {
            percent: 50,
            cents: 12345,
        };
        expect(rebalanceReducer(state, action).core).toEqual(state.core);
    });
});
