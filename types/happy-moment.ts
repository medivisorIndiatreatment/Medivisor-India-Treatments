export interface HappyMoment {
  _id: string
  _createdDate?: string
  _updatedDate?: string
  _owner?: string
  ID?: string
  "Created Date"?: string
  "Updated Date"?: string
  Owner?: string
  date?: string
  activity?: string | null
  coverPhoto?: string
  order?: string
  mediagallery?:
    | Array<{
        slug: string
        alt?: string
        description?: string
        src?: string
        title?: string
        type?: string
        settings?: {
          width: number
          height: number
          focalPoint: [number, number]
        }
      }>
    | string
  shortDescription?: string
  detail?: string
  location?: string
  place?: string
  category?: string
  type?: string
  tags?: string
  hashtags?: string
  coverMedia?: {
    image?: string
  }
  excerpt?: string
  content?: string
  firstPublishedDate?: string
  [key: string]: any
}

export interface PaginationResponse {
  items: HappyMoment[]
  hasMore: boolean
  totalCount: number
}
