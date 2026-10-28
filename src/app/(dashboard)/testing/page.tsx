import type { Metadata } from "next"
import { TestSuitePage } from "@/features/testing/pages/TestSuitePage"

export const metadata: Metadata = { title: "Test Suite" }

export default function Page() {
  return <TestSuitePage />
}
