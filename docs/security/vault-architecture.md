1. Data Model
Entity relationship diagram
Table purposes
Foreign key relationships
Lifecycle states
2. Threat Model

We'll explicitly identify what we're defending against, for example:

Unauthorized database access
Accidental exposure in application logs
Browser storage leaks
Insider misuse
Injection attacks
Broken access control
Encryption key rotation
3. Cryptographic Design

Rather than simply saying "AES-256," we'll document:

Encryption algorithm (AES-256-GCM)
IV generation
Authentication tag handling
Key versioning
Rotation strategy
Future cloud KMS integration (AWS KMS, Azure Key Vault, or GCP KMS)
4. Authorization Model

We'll define exactly which roles can:

Create
Replace
Verify
View masked values
Request full values
Archive
Audit

This ties directly into the RBAC system we've already been building.

5. Audit Requirements

We'll define what gets logged for every action:

Who
What
When
Why (where appropriate)
Success/failure
Correlation/request ID for tracing