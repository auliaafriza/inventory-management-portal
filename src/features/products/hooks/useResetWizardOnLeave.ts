import { useEffect, useRef } from "react"
import { useAppDispatch } from "@/store/hooks"
import { draftCleared } from "../store/wizardSlice"

export const WIZARD_PATH = "/products/new"

export function useResetWizardOnLeave(pathname: string) {
  const dispatch = useAppDispatch()
  const previous = useRef(pathname)

  useEffect(() => {
    if (previous.current === WIZARD_PATH && pathname !== WIZARD_PATH) dispatch(draftCleared())
    previous.current = pathname
  }, [pathname, dispatch])
}
