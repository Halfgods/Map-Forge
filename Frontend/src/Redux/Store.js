import { configureStore } from '@reduxjs/toolkit'
import orgDataSlice from './Slice'
export const store = configureStore({
    reducer: {
        orgdata: orgDataSlice
    },
})