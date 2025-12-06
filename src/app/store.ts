import { configureStore } from '@reduxjs/toolkit';
import todosReducer from './todos/slice';

export const store = configureStore({
  reducer: {
    todos: todosReducer,
  },
   middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: {
        extraArgument: {},
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
