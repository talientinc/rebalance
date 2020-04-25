import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";

export interface Core {
    percent?: number;
    cents?: number;
}

export interface Position {
    name?: string;
    percent?: number;
    cents?: number;
}

export interface PositionUpdate {
    key: number;
    position: Position;
}

export interface Attribution {
    name?: string;
    percent?: number;
}

export interface AttributionCreation {
    fixedPositionKey: number;
    attribution: Attribution;
}

export interface AttributionUpdate {
    fixedPositionKey: number;
    attributionKey: number;
    attribution: Attribution;
}

export interface AttributionDeletion {
    fixedPositionKey: number;
    attributionKey: number;
}

export interface FixedPosition {
    name?: string;
    cents?: number;
    attributions?: {
        [index: number]: Attribution;
    };
}

export interface FixedPositionUpdate {
    key: number;
    fixedPosition: FixedPosition;
}

export interface Pending {
    cents?: number;
}

export interface PortfolioState {
    core: Core;
    positions: {
        [index: number]: Position;
    };
    fixedPositions: {
        [index: number]: FixedPosition;
    };
    pending: Pending;
}

export type Bookmark = Readonly<{
    core: Readonly<Omit<Core, "cents">>;
    positions: Record<number, Readonly<Omit<Position, "cents">>>;
    fixedPositions: Record<number, Readonly<Omit<FixedPosition, "cents">>>;
}>;

const initialState: PortfolioState = {
    core: {},
    positions: {
        0: {},
    },
    fixedPositions: {},
    pending: {},
};

export const slice = createSlice({
    name: "portfolio",
    initialState,
    reducers: {
        updateCore: (state, action: PayloadAction<Core>) => {
            // Update core with provided values
            Object.assign(state.core, action.payload);
        },
        createPosition: (state, action: PayloadAction<Position>) => {
            // Create new position using any provided values
            const key =
                ((Object.keys(state.positions) as unknown) as Array<
                    number
                >).reduce((max, key) => Math.max(max, key), -1) + 1;
            state.positions[key] = action.payload;
        },
        updatePosition: (state, action: PayloadAction<PositionUpdate>) => {
            // Update existing position with any provided values
            if (action.payload.key in state.positions) {
                Object.assign(
                    state.positions[action.payload.key],
                    action.payload.position
                );
            }
        },
        deletePosition: (state, action: PayloadAction<number>) => {
            delete state.positions[action.payload];
        },
        createFixedPosition: (state, action: PayloadAction<FixedPosition>) => {
            // Create new position using any provided values
            const key =
                ((Object.keys(state.fixedPositions) as unknown) as Array<
                    number
                >).reduce((max, key) => Math.max(max, key), -1) + 1;
            state.fixedPositions[key] = action.payload;
        },
        updateFixedPosition: (
            state,
            action: PayloadAction<FixedPositionUpdate>
        ) => {
            // Update existing position with any provided values
            if (action.payload.key in state.fixedPositions) {
                Object.assign(
                    state.fixedPositions[action.payload.key],
                    action.payload.fixedPosition
                );
            }
        },
        deleteFixedPosition: (state, action: PayloadAction<number>) => {
            delete state.fixedPositions[action.payload];
        },
        createAttribution: (
            state,
            action: PayloadAction<AttributionCreation>
        ) => {
            // Create new position using any provided values
            if (action.payload.fixedPositionKey in state.fixedPositions) {
                const fp =
                    state.fixedPositions[action.payload.fixedPositionKey];
                if (!fp.attributions) {
                    fp.attributions = {};
                }
                const key =
                    ((Object.keys(fp.attributions) as unknown) as Array<
                        number
                    >).reduce((max, key) => Math.max(max, key), -1) + 1;
                fp.attributions[key] = action.payload.attribution;
            }
        },
        updateAttribution: (
            state,
            action: PayloadAction<AttributionUpdate>
        ) => {
            // Update existing position with any provided values
            const attribution =
                state.fixedPositions?.[action.payload.fixedPositionKey]
                    ?.attributions?.[action.payload.attributionKey];
            if (attribution) {
                Object.assign(attribution, action.payload.attribution);
            }
        },
        deleteAttribution: (
            state,
            action: PayloadAction<AttributionDeletion>
        ) => {
            const attributions =
                state.fixedPositions?.[action.payload.fixedPositionKey]
                    ?.attributions;
            if (attributions) {
                delete attributions[action.payload.attributionKey];
            }
        },
        updatePending: (state, action: PayloadAction<Pending>) => {
            // Update pending with provided values
            Object.assign(state.pending, action.payload);
        },
        restoreBookmark: (state, action: PayloadAction<Bookmark>) => {
            // Reset portfolio state with provided values from bookmark
            state.core = action.payload.core;
            state.positions = action.payload.positions;
            state.fixedPositions = action.payload.fixedPositions;
            state.pending = {};
        },
    },
});

export const {
    updateCore,
    createPosition,
    updatePosition,
    deletePosition,
    createFixedPosition,
    updateFixedPosition,
    deleteFixedPosition,
    createAttribution,
    updateAttribution,
    deleteAttribution,
    updatePending,
    restoreBookmark,
} = slice.actions;

export const selectCore = (state: RootState) => state.rebalance.core;
export const selectPositions = (state: RootState) => state.rebalance.positions;
export const selectFixedPositions = (state: RootState) =>
    state.rebalance.fixedPositions;
export const selectPending = (state: RootState) => state.rebalance.pending;

//
// Derived state
//

export const selectTotalPortfolioPercent = createSelector(
    [selectCore, selectPositions],
    (core, positions): number => {
        return Object.values(positions)
            .map((e) => e.percent || 0)
            .reduce((total, percent) => total + percent, core.percent || 0);
    }
);

export const selectTotalPortfolioAmount = createSelector(
    [selectCore, selectPositions],
    (core, positions): number => {
        return (
            (core.cents || 0) +
            Object.values(positions)
                .map((p) => p.cents || 0)
                .reduce((total, cents) => total + cents, 0)
        );
    }
);

export const selectTotalHoldingsAmount = createSelector(
    [selectTotalPortfolioAmount, selectFixedPositions],
    (totalPositionsAmount, fixedPositions): number => {
        return (
            totalPositionsAmount +
            Object.values(fixedPositions)
                .map((p) => p.cents || 0)
                .reduce((total, cents) => total + cents, 0)
        );
    }
);

// Return a map of position names to a list of the position keys with that name.
export const selectPositionNameKeyList = createSelector(
    [selectPositions],
    (positions): Readonly<Record<string, number[]>> => {
        return ((Object.entries(positions) as unknown) as Array<
            [number, Position]
        >).reduce((pnc: Record<string, number[]>, [id, position]): Readonly<
            Record<string, number[]>
        > => {
            const name: string = (position.name as string) || "";
            return { ...pnc, [name]: pnc[name] ? [...pnc[name], id] : [id] };
        }, {});
    }
);

// Return true if all fixed position references to tradable position names are
// not blank and resolve to current names.
export const selectAllReferencesResolved = createSelector(
    [selectFixedPositions, selectPositionNameKeyList],
    (fixedPositions, positionNameKeyList): boolean => {
        for (const fp of Object.values(fixedPositions)) {
            if (!fp.name) {
                // The fixed position name was not populated.
                return false;
            }
            const attributions: Attribution[] = fp.attributions
                ? Object.values(fp.attributions)
                : [];
            if (attributions.length) {
                for (const a of attributions) {
                    if (!(a.name && positionNameKeyList[a.name])) {
                        // The attribution name was either blank or did not
                        // match a tradable position.
                        return false;
                    }
                }
            } else {
                // If there are no attributions, the fixed position name
                // is used to attribute the full value to a tradable position.
                if (!positionNameKeyList[fp.name]) {
                    return false;
                }
            }
        }
        return true;
    }
);

export const selectAllValid = createSelector(
    [selectPositionNameKeyList, selectAllReferencesResolved],
    (positionNameKeyList, allReferencesResolved): boolean => {
        return !positionNameKeyList[""] && allReferencesResolved;
    }
);

// Normalized portfolio indexed by position name.  The blank key is reserved
// for the core account.  The cents field contains only the amount from the
// tradable position(s) with that name.  The fixed cents field contains any
// amount attributed to the position from the fixed positions.  The attributions
// property itemizes the contribution to the fixed cents field from each fixed
// position.
export type NormalizedPosition = Readonly<{
    percent: number;
    cents: number;
    fixedCents: number;
    attributions: Readonly<Record<string, number>>;
}>;

export type NormalizedPortfolio = Readonly<Record<string, NormalizedPosition>>;

export const selectNormalizedPortfolio = createSelector(
    [selectAllValid, selectCore, selectPositions, selectFixedPositions],
    (allValid, core, positions, fixedPositions): NormalizedPortfolio => {
        const emptyPortfolio: NormalizedPortfolio = {};
        if (!allValid) {
            return emptyPortfolio;
        }
        const corePortfolio: NormalizedPortfolio = {
            "": {
                percent: core.percent || 0,
                cents: core.cents || 0,
                fixedCents: 0,
                attributions: {},
            },
        };
        const positionsPortfolio = Object.values(positions).reduce(
            (pp, p): NormalizedPortfolio => {
                return {
                    ...pp,
                    [String(p.name)]: {
                        percent:
                            (pp?.[String(p.name)]?.percent || 0) +
                            (p.percent || 0),
                        cents:
                            (pp?.[String(p.name)]?.cents || 0) + (p.cents || 0),
                        fixedCents: 0,
                        attributions: {},
                    },
                };
            },
            corePortfolio
        );

        return Object.values(fixedPositions).reduce(
            (fpp, fp): NormalizedPortfolio => {
                // Note: all position references have been validated previously.
                // No further reference checking is performed here.
                const attributions: Attribution[] = fp.attributions
                    ? Object.values(fp.attributions)
                    : [];

                if (attributions.length === 0) {
                    // No itemized attributions, allocate the entire fixed
                    // position to the tradable position with the same name
                    const name = String(fp.name);
                    return {
                        ...fpp,
                        [name]: {
                            percent: fpp[name].percent,
                            cents: fpp[name].cents,
                            fixedCents: fpp[name].fixedCents + (fp.cents || 0),
                            attributions: {
                                ...fpp[name].attributions,
                                [name]:
                                    (fpp[name].attributions?.[name] || 0) +
                                    (fp.cents || 0),
                            },
                        },
                    };
                }

                const totalPercent = attributions.reduce(
                    (tp, a) => tp + (a.percent || 0),
                    0
                );
                const fpName = String(fp.name);

                return attributions.reduce((app, a) => {
                    const ratio = totalPercent
                        ? (a.percent || 0) / totalPercent
                        : 1 / attributions.length;
                    const cents = Math.round((fp.cents || 0) * ratio);
                    const name = String(a.name);
                    return {
                        ...app,
                        [name]: {
                            percent: app[name].percent,
                            cents: app[name].cents,
                            fixedCents: app[name].fixedCents + cents,
                            attributions: {
                                ...app[name].attributions,
                                [fpName]:
                                    (app[name].attributions?.[fpName] || 0) +
                                    cents,
                            },
                        },
                    };
                }, fpp);
            },
            positionsPortfolio
        );
    }
);

export const selectBookmark = createSelector(
    [selectCore, selectPositions, selectFixedPositions],
    (core, positions, fixedPositions): Bookmark => {
        const { cents: coreCents, ...coreBookmark } = core;
        const positionsBookmark = Object.entries(positions).reduce(
            (bookmark, entry): Record<number, Omit<Position, "cents">> => {
                const { cents: positionCents, ...positionBookmark } = entry[1];
                return {
                    ...bookmark,
                    [Number(entry[0])]: positionBookmark,
                };
            },
            {}
        );
        const fixedPositionsBookmark = Object.entries(fixedPositions).reduce(
            (bookmark, entry): Record<number, Omit<FixedPosition, "cents">> => {
                const {
                    cents: fixedPositionCents,
                    ...fixedPositionBookmark
                } = entry[1];
                return {
                    ...bookmark,
                    [Number(entry[0])]: fixedPositionBookmark,
                };
            },
            {}
        );
        return {
            core: coreBookmark,
            positions: positionsBookmark,
            fixedPositions: fixedPositionsBookmark,
        };
    }
);

export default slice.reducer;
