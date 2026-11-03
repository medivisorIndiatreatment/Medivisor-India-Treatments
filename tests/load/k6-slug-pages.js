import http from 'k6/http'
import { check, sleep } from 'k6'

// Run only against a local/staging target you explicitly control:
// k6 run -e BASE_URL=http://localhost:3000 tests/load/k6-slug-pages.js
// Never point this script at production without explicit approval.
const baseUrl = (__ENV.BASE_URL || 'http://localhost:3000').replace(/\/$/, '')
const slugs = [
  '/treatment/cataract-surgery',
  '/doctors/sample-doctor',
  '/hospital-groups/sample-hospital',
]

export const options = {
  stages: [
    { duration: '30s', target: 100 },
    { duration: '60s', target: 500 },
    { duration: '60s', target: 1000 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<2000', 'p(99)<5000'],
    checks: ['rate>0.99'],
  },
  discardResponseBodies: true,
  noConnectionReuse: false,
}

export default function () {
  const path = slugs[(__VU + __ITER) % slugs.length]
  const response = http.get(`${baseUrl}${path}`, {
    headers: { Accept: 'text/html' },
    tags: { route: path },
  })

  check(response, {
    'page responds successfully': (res) => res.status >= 200 && res.status < 400,
    'page is not an error response': (res) => res.status !== 500 && res.status !== 503,
  })
  sleep(1)
}
