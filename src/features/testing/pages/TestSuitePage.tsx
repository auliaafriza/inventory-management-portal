import type { ReactNode } from "react"
import { CheckIcon } from "@/components/ui/icons"

interface Suite {
  title: string
  description: string
  covers: string[]
  files: string[]
}

const SUITES: Suite[] = [
  {
    title: "Yup schema tests",
    description: "Validation rules for the product wizard and the quick edit dialog.",
    covers: [
      "SKU format SKU-[A-Z]{3}-[0-9]{4} and duplicate SKU detection per row",
      "Price, stock and discount bounds, including empty and NaN input",
      "Conditional fragile handling rules built with yup.when",
    ],
    files: ["src/features/products/schemas/productSchemas.test.ts"],
  },
  {
    title: "Redux slice tests",
    description: "Reducers, listeners and thunks that hold client state.",
    covers: [
      "Draft saving, resuming, discarding and localStorage persistence",
      "Filter updates, URL hydration and page resets",
      "Optimistic operations, rollback state and committed overrides",
    ],
    files: [
      "src/features/products/store/wizardSlice.test.ts",
      "src/features/products/store/filtersSlice.test.ts",
      "src/features/products/store/optimisticSlice.test.ts",
      "src/features/products/services/productMutations.test.ts",
    ],
  },
  {
    title: "Integration tests with MSW",
    description: "React Testing Library against a mocked DummyJSON API.",
    covers: [
      "Full wizard submission that intercepts POST /products/add",
      "Debounced search, URL restore, pagination and empty states",
      "Optimistic delete, failure rollback and the Retry action",
    ],
    files: [
      "src/features/products/pages/ProductWizardPage.test.tsx",
      "src/features/products/pages/ProductsPage.test.tsx",
      "src/features/products/services/productsApi.test.ts",
    ],
  },
]

function Card({ children }: Readonly<{ children: ReactNode }>) {
  return <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">{children}</div>
}

export function TestSuitePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Test IMS</h1>
        <p className="mt-1 text-sm text-slate-500">
          Automated unit and integration tests run with Vitest, React Testing Library and Mock Service Worker.
        </p>
      </div>

      <Card>
        <h2 className="text-base font-semibold text-slate-900">Run the tests</h2>
        <pre className="mt-3 overflow-x-auto rounded-lg bg-navy-900 p-4 text-sm text-slate-100">
          <code>{"npm test\nnpm run test:coverage"}</code>
        </pre>
        <p className="mt-3 text-sm text-slate-500">
          Coverage is enforced at 80% for validation schemas, helper functions and Redux slices. The report is written
          to <code className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-700">coverage/index.html</code>.
        </p>
      </Card>

      <div className="grid gap-6 xl:grid-cols-3">
        {SUITES.map((suite) => (
          <Card key={suite.title}>
            <h2 className="text-base font-semibold text-slate-900">{suite.title}</h2>
            <p className="mt-1 text-sm text-slate-500">{suite.description}</p>
            <ul className="mt-4 space-y-2.5">
              {suite.covers.map((item) => (
                <li key={item} className="flex gap-2.5 text-sm text-slate-700">
                  <CheckIcon className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                  {item}
                </li>
              ))}
            </ul>
            <ul className="mt-5 space-y-1 border-t border-slate-100 pt-4">
              {suite.files.map((file) => (
                <li key={file} className="break-all font-mono text-xs text-slate-500">
                  {file}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </div>
  )
}
