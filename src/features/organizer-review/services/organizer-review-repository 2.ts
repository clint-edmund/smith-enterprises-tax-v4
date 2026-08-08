import type {
  OrganizerReviewOverview,
} from "../types"

export interface OrganizerReviewRepository {
  getOverview(
    clientId: string,
    taxYear: number,
  ): Promise<OrganizerReviewOverview>
}