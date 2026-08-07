import type {
  SupabaseClient,
  User,
} from "@supabase/supabase-js"

import {
  atlasSeederConfig,
} from "../config"

import {
  developmentStaff,
  type AtlasDevelopmentStaffMember,
} from "../staff"

import {
  logHeader,
} from "../utils/logger"

export interface StaffModuleResult {
  users: User[]
  administrator: User
}

async function findExistingUser(
  supabase: SupabaseClient,
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
  supabase: SupabaseClient,
  staffMember: AtlasDevelopmentStaffMember,
): Promise<User> {
  const existingUser =
    await findExistingUser(
      supabase,
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
      email:
        staffMember.email,

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
  supabase: SupabaseClient,
  user: User,
  staffMember: AtlasDevelopmentStaffMember,
): Promise<void> {
  const {
    data,
    error,
  } = await supabase
    .from("profiles")
    .update({
      email:
        staffMember.email,

      first_name:
        staffMember.firstName,

      last_name:
        staffMember.lastName,

      display_name:
        staffMember.displayName,

      role:
        staffMember.role,

      is_active: true,
    })
    .eq(
      "id",
      user.id,
    )
    .select(`
      id,
      email,
      role,
      is_active
    `)
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

async function verifyStaff(
  supabase: SupabaseClient,
): Promise<void> {
  logHeader(
    "Verifying Development Staff",
  )

  const {
    data,
    error,
  } = await supabase
    .from("profiles")
    .select(`
      id,
      email,
      display_name,
      role,
      is_active
    `)
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

  if (
    invalidProfiles.length > 0
  ) {
    throw new Error(
      "One or more development profiles are inactive.",
    )
  }

  for (
    const profile
    of data
  ) {
    console.log(
      `✓ ${profile.email} (${profile.role})`,
    )
  }
}

export async function runStaffModule(
  supabase: SupabaseClient,
): Promise<StaffModuleResult> {
  logHeader(
    "Seeding Atlas Development Staff",
  )

  const users: User[] = []

  for (
    const staffMember
    of developmentStaff
  ) {
    const user =
      await createOrUpdateAuthUser(
        supabase,
        staffMember,
      )

    await promoteProfile(
      supabase,
      user,
      staffMember,
    )

    users.push(
      user,
    )
  }

  await verifyStaff(
    supabase,
  )

  const administrator =
    users.find(
      (user) =>
        user.email ===
        "admin@atlas.local",
    )

  if (!administrator) {
    throw new Error(
      "Development administrator could not be resolved.",
    )
  }

  return {
    users,
    administrator,
  }
}