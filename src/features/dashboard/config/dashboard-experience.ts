import type {
  AppRole,
} from "@/features/auth/types/auth.types"

export type DashboardExperience =
  | "executive"
  | "preparation"
  | "review"
  | "front-desk"
  | "observation"

export function getDashboardExperience(
  role: AppRole,
): DashboardExperience {
  switch (role) {
    case "administrator":
    case "manager":
      return "executive"

    case "preparer":
      return "preparation"

    case "reviewer":
      return "review"

    case "receptionist":
      return "front-desk"

    case "read_only":
    default:
      return "observation"
  }
}