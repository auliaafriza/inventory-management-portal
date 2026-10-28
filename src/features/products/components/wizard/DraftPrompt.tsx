import { Button } from "@/components/ui/Button"
import { Modal } from "@/components/ui/Modal"
import { formatDateTime } from "@/lib/utils/format"

interface DraftPromptProps {
  open: boolean
  savedAt?: string
  onResume: () => void
  onDiscard: () => void
}

export function DraftPrompt({ open, savedAt, onResume, onDiscard }: Readonly<DraftPromptProps>) {
  const formatted = savedAt ? formatDateTime(savedAt) : ""

  return (
    <Modal
      open={open}
      title="Resume saved product draft?"
      description={
        formatted ? `You have an unfinished product saved on ${formatted}.` : "You have an unfinished product."
      }
      onClose={onDiscard}
      dismissible={false}
    >
      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={onDiscard}>
          Start over
        </Button>
        <Button onClick={onResume}>Resume draft</Button>
      </div>
    </Modal>
  )
}
