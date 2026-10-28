import { createSlice, nanoid, type PayloadAction } from "@reduxjs/toolkit"

export type ActivityTone = "success" | "error" | "info"

export interface Activity {
  id: string
  tone: ActivityTone
  title: string
  detail: string
  at: string
}

export interface ActivityState {
  items: Activity[]
}

export const MAX_ACTIVITIES = 8

const activitySlice = createSlice({
  name: "activity",
  initialState: { items: [] } as ActivityState,
  reducers: {
    activityLogged: {
      reducer(state, action: PayloadAction<Activity>) {
        state.items.unshift(action.payload)
        if (state.items.length > MAX_ACTIVITIES) state.items.length = MAX_ACTIVITIES
      },
      prepare(activity: Omit<Activity, "id" | "at">) {
        return { payload: { id: nanoid(), at: new Date().toISOString(), ...activity } }
      },
    },
    activityCleared(state) {
      state.items = []
    },
  },
})

export const { activityLogged, activityCleared } = activitySlice.actions
export default activitySlice.reducer
