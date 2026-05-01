import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    organization: "",
    blueprint: "",
    panorama: "",
    buildings: []
}

export const orgDataSlice = createSlice({
    name: 'counter',
    initialState,
    reducers: {
        setData: (state, action) => {
            state.organization = action.payload.organization
            state.blueprint = action.payload.blueprint
            state.panorama = action.payload.panorama
            state.buildings = action.payload.buildings
        },
        removeData: (state) => {
            state.blueprint = ""
            state.panorama = ""
            state.buildings = []
        }
    },
})

// Action creators are generated for each case reducer function
export const { setData, removeData } = orgDataSlice.actions

export default orgDataSlice.reducer