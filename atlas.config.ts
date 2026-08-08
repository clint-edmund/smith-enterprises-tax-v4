export const atlasConfig = {
  codename:
    "Atlas",

  projectName:
    "Smith Enterprises Tax Management",

  branches: {
    production:
      "main",

    staging:
      "develop",
  },

  environments: {
    local:
      "Local Development",

    preview:
      "Vercel Preview",

    production:
      "Vercel Production",
  },
} as const