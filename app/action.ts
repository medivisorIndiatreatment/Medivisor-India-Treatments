"use server"

import { wixClient } from "@/lib/wix"
import type { Category } from "@/types/category"

// --- Wix Blog Categories API Actions ---

export async function listCategoriesFunction(): Promise<{ categories: Category[] }> {
  try {
    const result = await wixClient.categories.listCategories()
    const categories = (result.categories || []).map((c: any) => ({
      ...c,
      _id: c._id || ''
    }))
    return { categories }
  } catch (error) {
    return { categories: [] }
  }
}
