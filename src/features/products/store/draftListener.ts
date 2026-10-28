import { createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit"
import { removeStorage, writeStorage } from "@/lib/utils/storage"
import { DRAFT_STORAGE_KEY } from "../constants"
import { draftCleared, draftDiscarded, draftSaved, hasDraftContent } from "./wizardSlice"

export const draftListener = createListenerMiddleware()

draftListener.startListening({
  actionCreator: draftSaved,
  effect: (action) => {
    if (hasDraftContent(action.payload.values)) {
      writeStorage(DRAFT_STORAGE_KEY, action.payload)
    } else {
      removeStorage(DRAFT_STORAGE_KEY)
    }
  },
})

draftListener.startListening({
  matcher: isAnyOf(draftCleared, draftDiscarded),
  effect: () => {
    removeStorage(DRAFT_STORAGE_KEY)
  },
})
