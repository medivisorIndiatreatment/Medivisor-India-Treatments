// Video types for Patient Testimonials

export interface Video {
  videoId: string
  title: string
  thumbnail: string
  publishedAt: string
  description: string
  viewCount: string
  duration: string
  channelTitle: string
}

export interface VideosResponse {
  videos: Video[]
  nextPageToken: string | null
}

export interface VideoSearchParams {
  query?: string
  category?: string
  maxResults?: number
  pageToken?: string
}

export interface TestimonialMeta {
  patientName: string
  country: string
  treatment: string
  hospital: string
  testimonial: string
}

export interface EnrichedVideo extends Video {
  meta?: TestimonialMeta
}
