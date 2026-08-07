import {
  createClient,
  type User,
} from "@supabase/supabase-js"

import {
  atlasSeederConfig,
} from "./config"

import {
  developmentStaff,
  type AtlasDevelopmentStaffMember,
} from "./staff"

import {
  generateClients,
} from "./generators/clients"

import {
  seedClients,
  verifyClients,
} from "./services/client.service"

const supabase = createClient(
  atlasSeederConfig.supabaseUrl,
  atlasSeederConfig.secretKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
)

function logHeader(title: string): void {
  console.log("")
  console.log(
    "==============================================",
  )
  console.log(` ${title}`)
  console.log(
    "==============================================",
  )
  console.log("")
}

async function findExistingUser(
  email: string,
): Promise<User | null> {
  let page = 1

  while (true) {
    const {
      data,
      error,
    } = await supabase.auth.admin.listUsers({
      page,
      perPage: 100,
    })

    if (error) {
      throw error
    }

    const match =
      data.users.find(
        (user) =>
          user.email?.toLowerCase() ===
          email.toLowerCase(),
      )

    if (match) {
      return match
    }

    if (data.users.length < 100) {
      return null
    }

    page += 1
  }
}

async function createOrUpdateAuthUser(
  staffMember: AtlasDevelopmentStaffMember,
): Promise<User> {
  const existingUser =
    await findExistingUser(
      staffMember.email,
    )

  if (existingUser) {
    const {
      data,
      error,
    } =
      await supabase.auth.admin.updateUserById(
        existingUser.id,
        {
          password:
            atlasSeederConfig.developmentPassword,

          email_confirm: true,

          user_metadata: {
            first_name:
              staffMember.firstName,

            last_name:
              staffMember.lastName,

            display_name:
              staffMember.displayName,
          },
        },
      )

    if (error) {
      throw error
    }

    console.log(
      `↻ Auth user already exists: ${staffMember.email}`,
    )

    return data.user
  }

  const {
    data,
    error,
  } =
    await supabase.auth.admin.createUser({
      email: staffMember.email,

      password:
        atlasSeederConfig.developmentPassword,

      email_confirm: true,

      user_metadata: {
        first_name:
          staffMember.firstName,

        last_name:
          staffMember.lastName,

        display_name:
          staffMember.displayName,
      },
    })

  if (error) {
    throw error
  }

  if (!data.user) {
    throw new Error(
      `Supabase did not return the created user for ${staffMember.email}.`,
    )
  }

  console.log(
    `✓ Created Auth user: ${staffMember.email}`,
  )

  return data.user
}

async function promoteProfile(
  user: User,
  staffMember: AtlasDevelopmentStaffMember,
): Promise<void> {
  /*
   * handle_new_user() creates the profile automatically
   * with:
   *
   * role      = read_only
   * is_active = false
   *
   * The seeder then promotes that generated profile.
   */

  const {
    data,
    error,
  } = await supabase
    .from("profiles")
    .update({
      email: staffMember.email,

      first_name:
        staffMember.firstName,

      last_name:
        staffMember.lastName,

      display_name:
        staffMember.displayName,

      role: staffMember.role,

      is_active: true,
    })
    .eq(
      "id",
      user.id,
    )
    .select(
      `
        id,
        email,
        role,
        is_active
      `,
    )
    .maybeSingle()

  if (error) {
    throw error
  }

  if (!data) {
    throw new Error(
      `Profile was not created for ${staffMember.email}.`,
    )
  }

  if (
    data.role !== staffMember.role ||
    data.is_active !== true
  ) {
    throw new Error(
      `Profile promotion failed for ${staffMember.email}.`,
    )
  }

  console.log(
    `✓ Profile activated: ${staffMember.role.padEnd(13)} ${staffMember.email}`,
  )
}

async function seedStaff(): Promise<User[]> {
  logHeader(
    "Seeding Atlas Development Staff",
  )

  const seededUsers: User[] = []

  for (
    const staffMember
    of developmentStaff
  ) {
    const user =
      await createOrUpdateAuthUser(
        staffMember,
      )

    await promoteProfile(
      user,
      staffMember,
    )

    seededUsers.push(
      user,
    )
  }

  return seededUsers
}

async function verifyStaff(): Promise<void> {
  logHeader(
    "Verifying Development Staff",
  )

  const {
    data,
    error,
  } = await supabase
    .from("profiles")
    .select(
      `
        id,
        email,
        display_name,
        role,
        is_active
      `,
    )
    .in(
      "email",
      developmentStaff.map(
        (staffMember) =>
          staffMember.email,
      ),
    )
    .order(
      "email",
    )

  if (error) {
    throw error
  }

  if (
    data.length !==
    developmentStaff.length
  ) {
    throw new Error(
      [
        "Development staff verification failed.",
        "",
        `Expected: ${developmentStaff.length}`,
        `Found: ${data.length}`,
      ].join("\n"),
    )
  }

  const invalidProfiles =
    data.filter(
      (profile) =>
        profile.is_active !== true,
    )

  if (invalidProfiles.length > 0) {
    throw new Error(
      "One or more development profiles are inactive.",
    )
  }

  for (const profile of data) {
    console.log(
      `✓ ${profile.email} (${profile.role})`,
    )
  }
}

async function main(): Promise<void> {
  logHeader(
    "Atlas Seeder v0.1.0",
  )

  console.log(
    `Environment: LOCAL`,
  )

  console.log(
    `Supabase:    ${atlasSeederConfig.supabaseUrl}`,
  )

  console.log("")

  const staffUsers =
    await seedStaff()

  await verifyStaff()

  const administrator =
    staffUsers.find(
      (user) =>
        user.email ===
        "admin@atlas.local",
    )

  if (!administrator) {
    throw new Error(
      "Development administrator could not be resolved.",
    )
  }

  logHeader(
    "Seeding Atlas Development Clients",
  )

  const clients =
    generateClients()

  await seedClients(
    supabase,
    clients,
    administrator.id,
  )

  await verifyClients(
    supabase,
    clients.length,
  )

  logHeader(
    "Atlas Seeder Complete",
  )

  console.log(
    `✓ ${developmentStaff.length} development staff accounts ready`,
  )

  console.log("")
  console.log(
    "Development password:",
  )

  console.log(
    atlasSeederConfig.developmentPassword,
  )

  console.log("")
}

main().catch(
  (error: unknown) => {
    console.error("")
    console.error(
      "❌ Atlas Seeder failed.",
    )

    if (
      error instanceof Error
    ) {
      console.error(
        error.message,
      )
    } else {
      console.error(
        error,
      )
    }

    console.error("")

    process.exit(1)
  },
)