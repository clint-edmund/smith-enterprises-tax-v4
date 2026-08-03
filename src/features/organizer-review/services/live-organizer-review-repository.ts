import {
  getOrganizerReviewOverview,
} from "./organizer-review-service"

import type {
  OrganizerReviewRepository,
} from "./organizer-review-repository"

export const liveOrganizerReviewRepository:
  OrganizerReviewRepository = {
    getOverview:
      getOrganizerReviewOverview,
  }