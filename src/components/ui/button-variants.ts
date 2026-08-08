import { cva } from "class-variance-authority"

export const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-xl border border-transparent bg-clip-padding text-sm font-semibold whitespace-nowrap shadow-sm transition-all duration-200 outline-none select-none focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/30 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-4 aria-invalid:ring-destructive/15 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/30 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-brand-900 text-white hover:bg-brand-800 focus-visible:ring-brand-400/40",
        outline:
          "border-brand-300 bg-white text-brand-800 hover:border-brand-400 hover:bg-brand-50 aria-expanded:bg-brand-100 aria-expanded:text-brand-900 dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        secondary:
          "border-brand-200 bg-brand-100 text-brand-900 hover:bg-brand-200 aria-expanded:bg-brand-200 aria-expanded:text-brand-950",
        ghost:
          "shadow-none hover:bg-brand-100 hover:text-brand-950 aria-expanded:bg-brand-100 aria-expanded:text-brand-950 dark:hover:bg-muted/50",
        destructive:
          "bg-red-700 text-white hover:bg-red-800 focus-visible:border-red-700 focus-visible:ring-red-300/40 dark:bg-red-700 dark:hover:bg-red-800",
        link: "shadow-none text-brand-800 underline-offset-4 hover:text-brand-950 hover:underline",
      },
      size: {
        default:
          "h-10 gap-2 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-9 gap-1.5 rounded-lg px-3 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-11 gap-2 px-5 has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
        icon: "size-10",
        "icon-xs":
          "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)