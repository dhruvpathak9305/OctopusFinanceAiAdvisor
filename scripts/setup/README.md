# Setup Scripts

Initial setup and configuration scripts for the OctopusFinancer system.

## Scripts

### Authentication Setup
**`setup-service-key.sh`**
- Sets up the Supabase service role key for bypassing RLS
- Interactive script that prompts for the key and saves to config
- **Run once** during initial setup

```bash
bash scripts/setup/setup-service-key.sh
```

### Balance History Population
**`populate-with-service-key.js`**
- Populates historical balance data for all accounts
- Generates 12 months of month-end snapshots
- Uses service role key to bypass RLS
- **Required for MoM calculations**

```bash
# After setting up service key:
node scripts/setup/populate-with-service-key.js
```

### Quick Population (Wrapper)
**`quick-populate-history.sh`**
- Quick wrapper script for balance history population
- Checks for service key and runs populate script

```bash
bash scripts/setup/quick-populate-history.sh
```

## Setup Order

1. **First Time Setup:**
   ```bash
   # 1. Set up service key
   bash scripts/setup/setup-service-key.sh
   
   # 2. Populate balance history
   node scripts/setup/populate-with-service-key.js
   ```

2. **Verify Setup:**
   ```bash
   # Check if data populated correctly
   node scripts/utilities/check-mom-calculation.js
   ```

## When to Run

- **setup-service-key.sh**: Once during initial setup
- **populate-with-service-key.js**: 
  - Initially to backfill 12 months of data
  - Monthly to add new month-end snapshots
  - After major data corrections

## Related Documentation

- [docs/guides/authentication-setup.md](../../docs/guides/authentication-setup.md) - Authentication guide
- [scripts/utilities/](../utilities/) - Diagnostic tools
- [scripts/maintenance/](../maintenance/) - Maintenance scripts

