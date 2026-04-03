import { createAction, createSlice } from '@reduxjs/toolkit';
import { REMEMBER_REHYDRATED, REMEMBER_PERSISTED } from 'redux-remember';

export const defaultReduxRememberState = {
  isRehydrated: false,
  isPersisted: false,
};

const reduxRemember = createSlice({
  name: 'redux-remember',
  initialState: defaultReduxRememberState,
  reducers: {},
  extraReducers: (builder) =>
    builder
      .addCase(createAction(REMEMBER_REHYDRATED), (state, _action) => {
        state.isRehydrated = true;
      })
      .addCase(createAction(REMEMBER_PERSISTED), (state, _action) => {
        state.isPersisted = true;
      }),
});

export default reduxRemember;
