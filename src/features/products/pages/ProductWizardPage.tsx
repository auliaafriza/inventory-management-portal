"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { yupResolver } from "@hookform/resolvers/yup"
import { FormProvider, useForm } from "react-hook-form"
import { Button } from "@/components/ui/Button"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { BasicInfoStep } from "../components/wizard/BasicInfoStep"
import { DraftPrompt } from "../components/wizard/DraftPrompt"
import { PricingStep } from "../components/wizard/PricingStep"
import { ReviewStep } from "../components/wizard/ReviewStep"
import { ShippingStep } from "../components/wizard/ShippingStep"
import { SubmittedPanel } from "../components/wizard/SubmittedPanel"
import { WizardStepper } from "../components/wizard/WizardStepper"
import { REVIEW_STEP_INDEX, WIZARD_STEPS } from "../constants"
import { getStepForField, productWizardSchema, STEP_FIELDS, type ProductWizardValues } from "../schemas/productSchemas"
import { useCreateProductMutation } from "../services/productMutations"
import { toastAdded } from "../store/toastSlice"
import {
  draftCleared,
  draftDiscarded,
  draftResumed,
  draftSaved,
  loadDraft,
  stepChanged,
  type WizardDraftValues,
} from "../store/wizardSlice"
import type { CreatedProduct } from "../types"
import { buildCreatePayload } from "../utils/payload"

const AUTOSAVE_DELAY_MS = 400

const DEFAULT_VALUES: WizardDraftValues = {
  title: "",
  brand: "",
  category: "",
  description: "",
  variations: [],
  requiresFragileHandling: false,
  hazardousDisclaimer: false,
  shippingNotes: "",
}

export function ProductWizardPage() {
  const dispatch = useAppDispatch()
  const { status, step, savedDraft } = useAppSelector((state) => state.wizard)
  const [reached, setReached] = useState(0)
  const [created, setCreated] = useState<CreatedProduct | null>(null)
  const [createProduct, { isLoading: isSubmitting }] = useCreateProductMutation()

  const form = useForm<ProductWizardValues>({
    resolver: yupResolver(productWizardSchema),
    mode: "onChange",
    defaultValues: DEFAULT_VALUES as ProductWizardValues,
  })
  const { trigger, handleSubmit, reset, watch, getValues } = form

  const stepRef = useRef(step)
  useEffect(() => {
    stepRef.current = step
  }, [step])

  useEffect(() => {
    void dispatch(loadDraft())
  }, [dispatch])

  const autosaveEnabled = status === "active" && created === null

  useEffect(() => {
    if (!autosaveEnabled) return

    let timer: ReturnType<typeof setTimeout> | undefined
    const save = () => dispatch(draftSaved(getValues() as WizardDraftValues, stepRef.current))
    const subscription = watch(() => {
      clearTimeout(timer)
      timer = setTimeout(save, AUTOSAVE_DELAY_MS)
    })

    const flush = () => {
      if (timer === undefined) return
      clearTimeout(timer)
      timer = undefined
      save()
    }
    window.addEventListener("pagehide", flush)

    return () => {
      subscription.unsubscribe()
      window.removeEventListener("pagehide", flush)
      clearTimeout(timer)
    }
  }, [autosaveEnabled, dispatch, watch, getValues])

  useEffect(() => {
    if (!autosaveEnabled) return
    dispatch(draftSaved(getValues() as WizardDraftValues, step))
  }, [step, autosaveEnabled, dispatch, getValues])

  const goToStep = useCallback(
    (next: number) => {
      setReached((current) => Math.max(current, next))
      dispatch(stepChanged(next))
      window.scrollTo({ top: 0, behavior: "smooth" })
    },
    [dispatch],
  )

  const handleNext = async () => {
    const valid = await trigger(STEP_FIELDS[step])
    if (valid) goToStep(step + 1)
  }

  const handleBack = () => goToStep(Math.max(0, step - 1))

  const handleResume = () => {
    if (!savedDraft) return
    reset({ ...DEFAULT_VALUES, ...savedDraft.values } as ProductWizardValues)
    setReached(savedDraft.step)
    dispatch(draftResumed())
  }

  const handleDiscard = () => {
    reset(DEFAULT_VALUES as ProductWizardValues)
    setReached(0)
    dispatch(draftDiscarded())
  }

  const handleCreateAnother = () => {
    reset(DEFAULT_VALUES as ProductWizardValues)
    setReached(0)
    setCreated(null)
    dispatch(stepChanged(0))
  }

  const submit = handleSubmit(
    async (values) => {
      try {
        const result = await createProduct(buildCreatePayload(values)).unwrap()
        setCreated(result)
        dispatch(draftCleared())
        dispatch(toastAdded({ kind: "success", message: `"${values.title}" created` }))
      } catch {
        dispatch(toastAdded({ kind: "error", message: "Could not create the product. Please try again." }))
      }
    },
    (errors) => {
      const firstInvalidStep = Math.min(...Object.keys(errors).map(getStepForField))
      goToStep(firstInvalidStep)
      dispatch(toastAdded({ kind: "error", message: "Some fields need your attention." }))
    },
  )

  const isReview = step === REVIEW_STEP_INDEX

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">New product</h1>
        <p className="mt-1 text-sm text-slate-500">Add a product to your inventory in a few steps.</p>
      </div>

      {created ? (
        <SubmittedPanel product={created} onCreateAnother={handleCreateAnother} />
      ) : (
        <FormProvider {...form}>
          <WizardStepper current={step} reached={reached} onSelect={goToStep} />
          <form onSubmit={submit} noValidate className="space-y-6">
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h2 className="mb-6 text-lg font-semibold text-slate-900">{WIZARD_STEPS[step]?.title}</h2>
              {step === 0 && <BasicInfoStep />}
              {step === 1 && <PricingStep />}
              {step === 2 && <ShippingStep />}
              {isReview && <ReviewStep onEdit={goToStep} />}
            </div>

            <div className="flex items-center justify-between">
              <Button variant="secondary" onClick={handleBack} disabled={step === 0}>
                Back
              </Button>
              {isReview ? (
                <Button type="submit" loading={isSubmitting}>
                  Create product
                </Button>
              ) : (
                <Button onClick={() => void handleNext()}>Continue</Button>
              )}
            </div>
          </form>
        </FormProvider>
      )}

      <DraftPrompt
        open={status === "prompt"}
        savedAt={savedDraft?.savedAt}
        onResume={handleResume}
        onDiscard={handleDiscard}
      />
    </div>
  )
}
