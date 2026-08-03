import {
  liveOrganizerReviewRepository,
} from "./live-organizer-review-repository"

import {
  mockOrganizerReviewRepository,
} from "./mock-organizer-review-repository"

import type {
  OrganizerReviewRepository,
} from "./organizer-review-repository"

const useMockRepository =
  import.meta.env.DEV

export function getOrganizerReviewRepository():
  OrganizerReviewRepository {
  return useMockRepository
    ? mockOrganizerReviewRepository
    : liveOrganizerReviewRepository
}