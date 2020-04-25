import { Bookmark } from "./rebalanceSlice";

const dollarsCharsetRegEx = /[^0-9.]/g;
const negativeDollarsCharsetRegEx = /[^0-9-.]/g;
const dollarPatternRegEx = /[0-9-][0-9]*(\.[0-9]{0,2})?/;

export const normalizeDollars = (
    dollars: string,
    allowNegative: boolean = false
) => {
    return (dollars
        .replace(
            allowNegative ? negativeDollarsCharsetRegEx : dollarsCharsetRegEx,
            ""
        )
        .match(dollarPatternRegEx) || [""])[0];
};

export const toDollars = (cents: number | undefined): string => {
    return cents === null || cents === undefined
        ? ""
        : (cents / 100).toFixed(2);
};

export const toCents = (dollars: string): number => {
    return Math.round(Number(dollars) * 100);
};

const percentCharsetRegEx = /[^0-9.]/g;
const percentPatternRegEx = /[0-9]+(\.[0-9]*)?/;

export const normalizePercent = (percent: string) => {
    return (percent
        .replace(percentCharsetRegEx, "")
        .match(percentPatternRegEx) || [""])[0];
};

export const toDisplay = (value: string | number | undefined): string => {
    return value === null || value === undefined ? "" : String(value);
};

export const usd = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
});

export const encodeBookmark = (bookmark: Bookmark): string => {
    return encodeURIComponent(JSON.stringify(bookmark));
};

export const decodeBookmark = (bookmark: string | null): Bookmark | null => {
    if (!bookmark) {
        return null;
    }
    return JSON.parse(decodeURIComponent(bookmark));
};

export const formatPortfolioError = (
    positionNameKeyList: Record<string, number[]>,
    allReferencesResolved: boolean
): string => {
    if (!allReferencesResolved && positionNameKeyList[""]) {
        return "Please fix errors in Portfolio and Fixed Positions";
    } else if (!allReferencesResolved && !positionNameKeyList[""]) {
        return "Please fix errors in Fixed Positions";
    } else if (allReferencesResolved && positionNameKeyList[""]) {
        return "Please fix errors in Positions";
    } else {
        return "";
    }
};
