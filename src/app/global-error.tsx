"use client"

export default function GlobalError({ reset }: Readonly<{ error: Error; reset: () => void }>) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", textAlign: "center", paddingTop: "20vh" }}>
        <h1>Something went wrong</h1>
        <button type="button" onClick={reset}>
          Try again
        </button>
      </body>
    </html>
  )
}
