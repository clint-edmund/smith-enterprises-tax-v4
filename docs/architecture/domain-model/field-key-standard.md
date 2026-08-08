# Organizer Field-Key Standard

Evidence links and field attribution require stable field identifiers.

## Format

Use lowercase snake_case.

```text
first_name
birth_date
relationship
months_lived_with_taxpayer
us_citizen_or_resident
```

## Fully qualified reference

A complete field reference consists of:

```text
section_key
subject_type
subject_id
field_key
```

Example:

```text
section_key: dependents
subject_type: dependent
subject_id: 2561bc32-...
field_key: birth_date
```

## Rules

- Field keys must not contain display labels.
- Field keys must remain stable after release.
- Renaming a display label must not change the field key.
- Sensitive values must never appear in a field key.
- Module-specific keys should be documented before use.

## Initial Dependents keys

```text
first_name
middle_name
last_name
suffix
birth_date
relationship
lived_with_taxpayer_all_year
months_lived_with_taxpayer
is_full_time_student
is_permanently_disabled
us_citizen_or_resident
claimed_by_another_taxpayer
taxpayer_identifier_documentation
support_test
supporting_documentation
```
