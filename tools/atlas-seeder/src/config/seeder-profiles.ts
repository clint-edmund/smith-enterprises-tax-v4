import type {
  AtlasSeedModule,
} from "./seeder-options"

export type AtlasSeederProfile =
  | "office"
  | "dashboard"
  | "payments"
  | "workflow"
  | "documents"
  | "demo"

export interface AtlasSeederProfileDefinition {
  name: AtlasSeederProfile
  description: string
  modules: readonly AtlasSeedModule[]
}

export const atlasSeederProfiles:
Record<
  AtlasSeederProfile,
  AtlasSeederProfileDefinition
> = {
  office: {
    name: "office",
    description:
      "Complete Atlas development office.",
    modules: [
      "staff",
      "clients",
      "returns",
      "documents",
      "workflow",
      "payments",
    ],
  },

  dashboard: {
    name: "dashboard",
    description:
      "Dashboard intelligence and workload development.",
    modules: [
      "staff",
      "clients",
      "returns",
      "documents",
      "workflow",
      "payments",
    ],
  },

  payments: {
    name: "payments",
    description:
      "Payment workflow development.",
    modules: [
      "staff",
      "clients",
      "returns",
      "payments",
    ],
  },

  workflow: {
    name: "workflow",
    description:
      "Workflow history and activity development.",
    modules: [
      "staff",
      "clients",
      "returns",
      "workflow",
    ],
  },

  documents: {
    name: "documents",
    description:
      "Required-document and document workflow development.",
    modules: [
      "staff",
      "clients",
      "returns",
      "documents",
    ],
  },

  demo: {
    name: "demo",
    description:
      "Customer demonstration environment.",
    modules: [
      "staff",
      "clients",
      "returns",
      "documents",
      "workflow",
      "payments",
    ],
  },
}