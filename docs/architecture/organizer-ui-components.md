# Organizer UI Components

## Purpose

The organizer component library provides consistent layout, decision controls,
loading states, validation behavior, and save actions across all client tax
organizer sections.

## Components

### OrganizerSectionCard

Use for major visual sections or business modules.

Supports:

- Title
- Description
- Icon
- Status indicator
- Content
- Optional footer

### OrganizerDecisionCard

Use for a single selectable choice.

Examples:

- Yes or No
- Checking or Savings
- Filing-status choices
- Dependent relationship categories

### OrganizerDecisionCardGroup

Groups related decision cards inside an accessible fieldset.

Supports:

- Group label
- Description
- Validation message
- One, two, or three-column layouts

### OrganizerSection

Existing field-layout component used for structured two-column forms.

Use when the section primarily contains traditional form controls.

### OrganizerSaveBar

Provides the standard organizer actions:

- Save Draft
- Save and Continue
- Saving state
- Safe save messages

### OrganizerLoadingState

Displays the standard organizer loading experience.

### OrganizerErrorState

Displays recoverable organizer-loading errors and retry actions.

### OrganizerYesNoQuestion

Existing compact Yes/No control.

Prefer OrganizerDecisionCardGroup when the choices need explanations or greater
visual emphasis.

## Usage Guidelines

Use OrganizerSectionCard for high-level business sections.

Use OrganizerSection for compact, field-oriented layouts.

Use OrganizerDecisionCardGroup when choices need descriptive text.

Do not create page-specific versions of decision cards, loading states, save
bars, or validation containers unless the shared component cannot support the
requirement.

## Security

Secure values must use SecureTextField.

Organizer UI components must never:

- Store protected plaintext
- Log protected values
- Display full protected values after saving
- Bypass Secure Vault services