import { fetchBaseQuery } from "@reduxjs/toolkit/query/react"

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://dummyjson.com"

export const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers) => {
    headers.set("Content-Type", "application/json")
    return headers
  },
})
