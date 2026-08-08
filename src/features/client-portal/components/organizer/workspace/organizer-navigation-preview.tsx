import {
  OrganizerSidebar,
} from "./organizer-sidebar"

export function OrganizerNavigationPreview() {

  return (

    <OrganizerSidebar
      taxYear={2026}
      progress={42}
      completedSections={5}
      totalSections={13}
      currentSectionTitle="Banking"

      items={[
        {
          key: "personal",
          title: "Personal Information",
          route: "#",
          completed: true,
          current: false,
          locked: false,
        },
        {
          key: "identity",
          title: "Identity",
          route: "#",
          completed: true,
          current: false,
          locked: false,
        },
        {
          key: "banking",
          title: "Banking",
          route: "#",
          completed: false,
          current: true,
          locked: false,
        },
        {
          key: "dependents",
          title: "Dependents",
          route: "#",
          completed: false,
          current: false,
          locked: true,
        },
      ]}
    />

  )

}