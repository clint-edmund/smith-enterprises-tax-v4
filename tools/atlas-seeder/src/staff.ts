export type AtlasDevelopmentRole =
  | "administrator"
  | "manager"
  | "preparer"
  | "reviewer"
  | "receptionist"
  | "read_only"

export interface AtlasDevelopmentStaffMember {
  email: string
  firstName: string
  lastName: string
  displayName: string
  role: AtlasDevelopmentRole
}

export const developmentStaff: AtlasDevelopmentStaffMember[] = [
  {
    email: "admin@atlas.local",
    firstName: "Alex",
    lastName: "Administrator",
    displayName: "Atlas Administrator",
    role: "administrator",
  },
  {
    email: "manager@atlas.local",
    firstName: "Morgan",
    lastName: "Manager",
    displayName: "Atlas Office Manager",
    role: "manager",
  },
  {
    email: "senior.preparer@atlas.local",
    firstName: "Jordan",
    lastName: "Preparer",
    displayName: "Senior Preparer",
    role: "preparer",
  },
  {
    email: "junior.preparer@atlas.local",
    firstName: "Taylor",
    lastName: "Preparer",
    displayName: "Junior Preparer",
    role: "preparer",
  },
  {
    email: "reviewer@atlas.local",
    firstName: "Cameron",
    lastName: "Reviewer",
    displayName: "Atlas Reviewer",
    role: "reviewer",
  },
  {
    email: "reception@atlas.local",
    firstName: "Riley",
    lastName: "Reception",
    displayName: "Atlas Receptionist",
    role: "receptionist",
  },
]