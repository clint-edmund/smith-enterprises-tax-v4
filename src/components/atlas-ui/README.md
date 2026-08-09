# Atlas UI

Atlas UI is the shared presentation layer for the Smith Enterprises Tax Management application.

It sits above Tailwind CSS and the application's lower-level UI primitives and provides reusable components that define the Atlas visual language.

## Principles

Atlas UI components should:

- Remain presentation-focused.
- Avoid feature-specific business logic.
- Avoid API and database access.
- Avoid direct React Router dependencies where possible.
- Support composition through ReactNode props.
- Use semantic visual states consistently.

## Components

### AtlasCard

Standard Atlas content container.

### AtlasSection

Consistent section heading and content layout.

### AtlasPageHeader

Reusable page-level hero/header.

### AtlasKpiCard

Standard KPI and executive metric presentation.

### AtlasStatusPill

Semantic status badge.

Supported tones:

- neutral
- info
- success
- warning
- danger

### AtlasMetric

Compact label/value presentation for metric lists.

## Usage

Prefer importing from the public barrel:

```tsx
import {
  AtlasCard,
  AtlasKpiCard,
  AtlasMetric,
} from "@/components/atlas-ui"