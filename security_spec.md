# Security Specification: Aego

## Data Invariants
1. A booking cannot exist without a valid client ID that belongs to the requesting user.
2. Only an admin can change the role of a user.
3. Users can only update their own profile data, and immutable fields like 'uid' and 'createdAt' cannot be changed.
4. Messages cannot be edited once created.
5. Users can only read messages for bookings they are a party to (client, assigned company, or assigned personnel).
6. A booking's status can only be modified by the authorized roles for that specific state transition.

## The "Dirty Dozen" Payloads
1. **PII Blanket Read:** A user attempts to list all users in the `/users` collection.
2. **Identity Spoofing:** A user tries to create a booking setting `clientId` to another user's UID.
3. **Admin Escalation:** A user attempts to change their own role to `admin` in the `/users` collection.
4. **Offline Auth:** A user attempts to create a document without being authenticated.
5. **Schema Evasion:** A user attempts to create a booking with a status of 'invalid_status'.
6. **Denial of Wallet (ID Poisoning):** A user attempts to target a document with an ID greater than 200 characters.
7. **Cross-Tenant Read (Messages):** A user attempts to read messages for a booking they are not part of.
8. **Orphaned Write:** A user creates a message for a `bookingId` that does not exist.
9. **State Shortcutting:** A company tries to mark a pending booking directly as 'completed'.
10. **Ghost Field Injection:** A user includes a `bypassSecurity: true` field when updating their user profile.
11. **Immutable Property Bypass:** A user attempts to update their user document's `createdAt` timestamp.
12. **Query Scraping Cost Attack:** A user queries `messages` without providing a narrow filter, relying on `resource.data` lookups.

## Test Runner
The `firestore.rules.test.ts` will verify these payloads.
