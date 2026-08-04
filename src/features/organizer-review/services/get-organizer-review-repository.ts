import {
  liveOrganizerReviewRepository,
} from "./live-organizer-review-repository"

import type {
  OrganizerReviewRepository,
} from "./organizer-review-repository"

export function getOrganizerReviewRepository():
  OrganizerReviewRepository {
  return liveOrganizerReviewRepository
}