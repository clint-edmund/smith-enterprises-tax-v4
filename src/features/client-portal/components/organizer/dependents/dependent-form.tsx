import {
  useEffect,
  useState,
  type FormEvent,
} from "react"

import {
  dependentRelationships,
} from "@/features/client-portal/constants/dependent-relationships"

import {
  OrganizerDateField,
  OrganizerFormActions,
  OrganizerSelectField,
  OrganizerTextField,
} from "@/features/client-portal/components/organizer/form"

import type {
  AddOrganizerDependentRequest,
  OrganizerDependent,
  UpdateOrganizerDependentRequest,
} from "@/features/client-portal/types/organizer-dependent.types"

interface DependentFormProps {
  organizerId: string
  dependent?: OrganizerDependent | null
  isSaving?: boolean
  onCancel: () => void
  onAdd: (
    request: AddOrganizerDependentRequest,
  ) => Promise<void>
  onUpdate: (
    request: UpdateOrganizerDependentRequest,
  ) => Promise<void>
}

interface DependentFormState {
  firstName: string
  lastName: string
  relationship: string
  birthDate: string
}

interface DependentFormErrors {
  firstName?: string
  lastName?: string
  relationship?: string
  birthDate?: string
  form?: string
}

const emptyForm: DependentFormState = {
  firstName: "",
  lastName: "",
  relationship: "",
  birthDate: "",
}

function createFormState(
  dependent: OrganizerDependent | null,
): DependentFormState {
  if (!dependent) {
    return emptyForm
  }

  return {
    firstName: dependent.firstName,
    lastName: dependent.lastName,
    relationship: dependent.relationship,
    birthDate: dependent.birthDate,
  }
}

export function DependentForm({
  organizerId,
  dependent = null,
  isSaving = false,
  onCancel,
  onAdd,
  onUpdate,
}: DependentFormProps) {
  const isEditing =
    dependent !== null

  const [
    form,
    setForm,
  ] = useState<DependentFormState>(
    () =>
      createFormState(
        dependent,
      ),
  )

  const [
    errors,
    setErrors,
  ] = useState<DependentFormErrors>(
    {},
  )

  useEffect(() => {
    setForm(
      createFormState(
        dependent,
      ),
    )

    setErrors({})
  }, [dependent])

  function updateField<
    Field extends keyof DependentFormState,
  >(
    field: Field,
    value: DependentFormState[Field],
  ) {
    setForm(
      (currentForm) => ({
        ...currentForm,
        [field]: value,
      }),
    )

    setErrors(
      (currentErrors) => ({
        ...currentErrors,
        [field]: undefined,
        form: undefined,
      }),
    )
  }

  function validateForm():
    DependentFormErrors {
    const nextErrors:
      DependentFormErrors = {}

    if (!form.firstName.trim()) {
      nextErrors.firstName =
        "First name is required."
    }

    if (!form.lastName.trim()) {
      nextErrors.lastName =
        "Last name is required."
    }

    if (!form.relationship) {
      nextErrors.relationship =
        "Relationship is required."
    }

    if (!form.birthDate) {
      nextErrors.birthDate =
        "Birth date is required."
    } else {
      const selectedDate =
        new Date(
          `${form.birthDate}T00:00:00`,
        )

      const today =
        new Date()

      today.setHours(
        0,
        0,
        0,
        0,
      )

      if (
        Number.isNaN(
          selectedDate.getTime(),
        )
      ) {
        nextErrors.birthDate =
          "Enter a valid birth date."
      } else if (
        selectedDate > today
      ) {
        nextErrors.birthDate =
          "Birth date cannot be in the future."
      }
    }

    return nextErrors
  }

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    const nextErrors =
      validateForm()

    setErrors(
      nextErrors,
    )

    if (
      Object.keys(
        nextErrors,
      ).length > 0
    ) {
      return
    }

    try {
      if (
        isEditing &&
        dependent
      ) {
        await onUpdate({
          organizerId,
          dependentId:
            dependent.dependentId,
          firstName:
            form.firstName.trim(),
          middleName:
            dependent.middleName,
          lastName:
            form.lastName.trim(),
          suffix:
            dependent.suffix,
          relationship:
            form.relationship as
              UpdateOrganizerDependentRequest["relationship"],
          birthDate:
            form.birthDate,
          isFullTimeStudent:
            dependent.isFullTimeStudent,
          isPermanentlyDisabled:
            dependent.isPermanentlyDisabled,
          livedWithTaxpayerAllYear:
            dependent.livedWithTaxpayerAllYear,
          monthsLivedWithTaxpayer:
            dependent.monthsLivedWithTaxpayer,
          usCitizenOrResident:
            dependent.usCitizenOrResident,
          claimedByAnotherTaxpayer:
            dependent.claimedByAnotherTaxpayer,
        })

        return
      }

      await onAdd({
        organizerId,
        firstName:
          form.firstName.trim(),
        middleName: "",
        lastName:
          form.lastName.trim(),
        suffix: "",
        relationship:
          form.relationship as
            AddOrganizerDependentRequest["relationship"],
        birthDate:
          form.birthDate,
        isFullTimeStudent:
          false,
        isPermanentlyDisabled:
          false,
        livedWithTaxpayerAllYear:
          true,
        monthsLivedWithTaxpayer:
          12,
        usCitizenOrResident:
          true,
        claimedByAnotherTaxpayer:
          false,
      })

      setForm(
        emptyForm,
      )
    } catch {
      setErrors(
        (currentErrors) => ({
          ...currentErrors,
          form:
            isEditing
              ? "The dependent could not be updated. Review the page message and try again."
              : "The dependent could not be added. Review the page message and try again.",
        }),
      )
    }
  }

  return (
    <form
      onSubmit={
        handleSubmit
      }
      className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div>
        <h2 className="text-xl font-semibold text-slate-950">
          {isEditing
            ? "Edit Dependent"
            : "Add Dependent"}
        </h2>

        <p className="mt-1 text-sm leading-6 text-slate-600">
          {isEditing
            ? "Update the dependent’s basic information."
            : "Add a person who may qualify as a dependent on this tax organizer."}
        </p>
      </div>

      {errors.form && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {errors.form}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <OrganizerTextField
          id="dependent-first-name"
          label="First Name"
          required
          value={
            form.firstName
          }
          error={
            errors.firstName
          }
          disabled={isSaving}
          autoComplete="given-name"
          maxLength={100}
          onChange={(event) => {
            updateField(
              "firstName",
              event.target.value,
            )
          }}
        />

        <OrganizerTextField
          id="dependent-last-name"
          label="Last Name"
          required
          value={
            form.lastName
          }
          error={
            errors.lastName
          }
          disabled={isSaving}
          autoComplete="family-name"
          maxLength={100}
          onChange={(event) => {
            updateField(
              "lastName",
              event.target.value,
            )
          }}
        />
      </div>

      <OrganizerSelectField
        id="dependent-relationship"
        label="Relationship"
        required
        value={
          form.relationship
        }
        options={
          dependentRelationships
        }
        error={
          errors.relationship
        }
        disabled={isSaving}
        onChange={(event) => {
          updateField(
            "relationship",
            event.target.value,
          )
        }}
      />

      <OrganizerDateField
        id="dependent-birth-date"
        label="Birth Date"
        required
        value={
          form.birthDate
        }
        error={
          errors.birthDate
        }
        disabled={isSaving}
        max={
          new Date()
            .toISOString()
            .slice(
              0,
              10,
            )
        }
        onChange={(event) => {
          updateField(
            "birthDate",
            event.target.value,
          )
        }}
      />

      <OrganizerFormActions
        isSaving={
          isSaving
        }
        saveLabel={
          isEditing
            ? "Save Changes"
            : "Save Dependent"
        }
        cancelLabel="Cancel"
        onCancel={
          onCancel
        }
      />
    </form>
  )
}
