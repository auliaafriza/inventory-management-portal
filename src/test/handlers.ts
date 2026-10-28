import { http, HttpResponse } from "msw"
import { CATEGORIES, PRODUCTS, toResponse } from "./fixtures"

const BASE = "https://dummyjson.com"

export const handlers = [
  http.get(`${BASE}/products/categories`, () => HttpResponse.json(CATEGORIES)),
  http.get(`${BASE}/products/search`, ({ request }) => {
    const q = (new URL(request.url).searchParams.get("q") ?? "").toLowerCase()
    const matches = PRODUCTS.filter((product) => product.title.toLowerCase().includes(q))
    return HttpResponse.json(toResponse(matches))
  }),
  http.get(`${BASE}/products/category/:slug`, ({ params }) => {
    const matches = PRODUCTS.filter((product) => product.category === params.slug)
    return HttpResponse.json(toResponse(matches))
  }),
  http.get(`${BASE}/products/:id`, ({ params }) => {
    const product = PRODUCTS.find((item) => item.id === Number(params.id))
    return product ? HttpResponse.json(product) : HttpResponse.json({ message: "not found" }, { status: 404 })
  }),
  http.get(`${BASE}/products`, ({ request }) => {
    const url = new URL(request.url)
    const skip = Number(url.searchParams.get("skip") ?? 0)
    const limit = Number(url.searchParams.get("limit") ?? 30)
    return HttpResponse.json(toResponse(PRODUCTS, skip, limit))
  }),
  http.post(`${BASE}/products/add`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>
    return HttpResponse.json({ id: 195, ...body }, { status: 201 })
  }),
  http.put(`${BASE}/products/:id`, async ({ request, params }) => {
    const body = (await request.json()) as Record<string, unknown>
    return HttpResponse.json({ id: Number(params.id), ...body })
  }),
  http.delete(`${BASE}/products/:id`, ({ params }) =>
    HttpResponse.json({ id: Number(params.id), isDeleted: true, deletedOn: new Date().toISOString() }),
  ),
]
