import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { DeepPartial } from "@/lib/types"
import { readStorage } from "@/lib/utils/storage"
import { DRAFT_STORAGE_KEY } from "../constants"
import type { ProductWizardValues } from "../schemas/productSchemas"

export type WizardDraftValues = DeepPartial<ProductWizardValues>

export interface SavedDraft {
  values: WizardDraftValues
  step: number
  savedAt: string
}

export type WizardStatus = "loading" | "prompt" | "active"

export interface WizardState {
  status: WizardStatus
  step: number
  values: WizardDraftValues
  savedDraft: SavedDraft | null
  lastSavedAt: string | null
}

export const initialWizardState: WizardState = {
  status: "loading",
  step: 0,
  values: {},
  savedDraft: null,
  lastSavedAt: null,
}

export function hasDraftContent(value: unknown): boolean {
  if (typeof value === "string") return value.trim().length > 0
  if (typeof value === "number") return !Number.isNaN(value)
  if (typeof value === "boolean") return value
  if (Array.isArray(value)) return value.some(hasDraftContent)
  if (value && typeof value === "object") return Object.values(value).some(hasDraftContent)
  return false
}

export const loadDraft = createAsyncThunk("wizard/loadDraft", async (): Promise<SavedDraft | null> => {
  const draft = readStorage<SavedDraft>(DRAFT_STORAGE_KEY)
  return draft && hasDraftContent(draft.values) ? draft : null
})

function resetDraft(state: WizardState) {
  state.step = 0
  state.values = {}
  state.savedDraft = null
  state.lastSavedAt = null
  state.status = "active"
}

const wizardSlice = createSlice({
  name: "wizard",
  initialState: initialWizardState,
  reducers: {
    draftSaved: {
      reducer(state, action: PayloadAction<SavedDraft>) {
        state.values = action.payload.values
        state.step = action.payload.step
        state.lastSavedAt = action.payload.savedAt
      },
      prepare(values: WizardDraftValues, step: number) {
        return { payload: { values, step, savedAt: new Date().toISOString() } }
      },
    },
    draftResumed(state) {
      if (!state.savedDraft) return
      state.values = state.savedDraft.values
      state.step = state.savedDraft.step
      state.lastSavedAt = state.savedDraft.savedAt
      state.savedDraft = null
      state.status = "active"
    },
    draftDiscarded: resetDraft,
    draftCleared: resetDraft,
    stepChanged(state, action: PayloadAction<number>) {
      state.step = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadDraft.pending, (state) => {
        state.status = "loading"
      })
      .addCase(loadDraft.fulfilled, (state, action) => {
        state.savedDraft = action.payload
        state.status = action.payload ? "prompt" : "active"
      })
      .addCase(loadDraft.rejected, (state) => {
        state.status = "active"
      })
  },
})

export const { draftSaved, draftResumed, draftDiscarded, draftCleared, stepChanged } = wizardSlice.actions
export default wizardSlice.reducer
