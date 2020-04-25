import { configureStore } from '@reduxjs/toolkit';

import rebalanceReducer from '../features/rebalance/rebalanceSlice';

export const store = configureStore({
  reducer: {
    rebalance: rebalanceReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
