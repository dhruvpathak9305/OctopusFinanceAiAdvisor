# Auth Schema Indexes

This document details all indexes in the `auth` schema, which handles Supabase authentication and user management.

## Core User Management

### users

- `users_pkey` - Primary key (id)
- `users_email_partial_key` - Unique email constraint (WHERE is_sso_user = false)
- `users_phone_key` - Unique phone constraint
- `users_instance_id_idx` - Instance-based queries
- `users_instance_id_email_idx` - Composite lookup (instance_id, lower(email))
- `users_is_anonymous_idx` - Anonymous user filtering

### Token Management (users table)

- `confirmation_token_idx` - Unique confirmation tokens (partial index)
- `email_change_token_current_idx` - Current email change tokens (partial index)
- `email_change_token_new_idx` - New email change tokens (partial index)
- `recovery_token_idx` - Password recovery tokens (partial index)
- `reauthentication_token_idx` - Reauthentication tokens (partial index)

## Session Management

### sessions

- `sessions_pkey` - Primary key (id)
- `sessions_user_id_idx` - User-based session queries
- `sessions_not_after_idx` - Session expiry queries (DESC)
- `user_id_created_at_idx` - User session history (user_id, created_at)

### refresh_tokens

- `refresh_tokens_pkey` - Primary key (id)
- `refresh_tokens_token_unique` - Unique token constraint
- `refresh_tokens_instance_id_idx` - Instance-based queries
- `refresh_tokens_instance_id_user_id_idx` - Composite lookup
- `refresh_tokens_parent_idx` - Token hierarchy
- `refresh_tokens_session_id_revoked_idx` - Session revocation queries
- `refresh_tokens_updated_at_idx` - Temporal queries (DESC)

## Multi-Factor Authentication

### mfa_factors

- `mfa_factors_pkey` - Primary key (id)
- `mfa_factors_user_id_idx` - User-based MFA queries
- `mfa_factors_last_challenged_at_key` - Unique challenge timestamp
- `mfa_factors_user_friendly_name_unique` - Unique friendly names per user
- `factor_id_created_at_idx` - Factor creation history
- `unique_phone_factor_per_user` - One phone factor per user

### mfa_challenges

- `mfa_challenges_pkey` - Primary key (id)
- `mfa_challenge_created_at_idx` - Challenge creation queries (DESC)

### mfa_amr_claims

- `amr_id_pk` - Primary key (id)
- `mfa_amr_claims_session_id_authentication_method_pkey` - Unique constraint

## Identity Providers

### identities

- `identities_pkey` - Primary key (id)
- `identities_provider_id_provider_unique` - Unique provider constraint
- `identities_user_id_idx` - User identity relationships
- `identities_email_idx` - Email-based identity searches (text_pattern_ops)

### sso_providers

- `sso_providers_pkey` - Primary key (id)
- `sso_providers_resource_id_idx` - Unique resource ID (lower case)
- `sso_providers_resource_id_pattern_idx` - Pattern matching (text_pattern_ops)

### sso_domains

- `sso_domains_pkey` - Primary key (id)
- `sso_domains_domain_idx` - Unique domain constraint (lower case)
- `sso_domains_sso_provider_id_idx` - Provider relationships

## SAML Authentication

### saml_providers

- `saml_providers_pkey` - Primary key (id)
- `saml_providers_entity_id_key` - Unique entity ID
- `saml_providers_sso_provider_id_idx` - SSO provider relationships

### saml_relay_states

- `saml_relay_states_pkey` - Primary key (id)
- `saml_relay_states_sso_provider_id_idx` - Provider relationships
- `saml_relay_states_for_email_idx` - Email-based queries
- `saml_relay_states_created_at_idx` - Creation time queries (DESC)

## OAuth Management

### oauth_clients

- `oauth_clients_pkey` - Primary key (id)
- `oauth_clients_client_id_key` - Unique client ID
- `oauth_clients_client_id_idx` - Client ID queries
- `oauth_clients_deleted_at_idx` - Soft deletion queries

## Flow State Management

### flow_state

- `flow_state_pkey` - Primary key (id)
- `flow_state_created_at_idx` - Creation time queries (DESC)
- `idx_auth_code` - Authorization code lookups
- `idx_user_id_auth_method` - User authentication method queries

## One-Time Tokens

### one_time_tokens

- `one_time_tokens_pkey` - Primary key (id)
- `one_time_tokens_user_id_token_type_key` - Unique constraint per user/type
- `one_time_tokens_relates_to_hash_idx` - Hash-based relation lookups
- `one_time_tokens_token_hash_hash_idx` - Hash-based token lookups

## System Management

### instances

- `instances_pkey` - Primary key (id)

### audit_log_entries

- `audit_log_entries_pkey` - Primary key (id)
- `audit_logs_instance_id_idx` - Instance-based audit queries

### schema_migrations

- `schema_migrations_pkey` - Primary key (version)

## Index Types Summary

### Unique Indexes

- Primary keys for all tables
- Unique constraints on tokens, emails, phone numbers
- Provider-specific unique constraints

### Composite Indexes

- Multi-column indexes for complex authentication queries
- User + instance combinations
- Session + revocation status

### Partial Indexes

- Conditional indexes for non-empty tokens
- SSO user filtering
- Active/non-deleted records

### Hash Indexes

- Token hash lookups for performance
- Relation hash queries

### Text Pattern Indexes

- Email pattern matching
- Resource ID pattern searches

## Performance Characteristics

### High-Performance Areas

- **User Authentication**: Optimized email/phone lookups
- **Session Management**: Fast session validation and cleanup
- **Token Validation**: Hash-based token verification
- **MFA Processing**: Efficient factor and challenge queries

### Security Features

- **Token Uniqueness**: Prevents token reuse attacks
- **Audit Trail**: Indexed audit log for security monitoring
- **Session Tracking**: Comprehensive session lifecycle management

---

_Total Auth Schema Indexes: 65+_
_Optimized for secure, high-performance authentication_
