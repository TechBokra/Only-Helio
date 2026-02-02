#!/bin/bash

# Array of deprecated SQL files to remove
files=(
    "db_add_billing_cycle.sql"
    "db_add_commission_config.sql"
    "db_add_partner_services.sql"
    "db_add_project_type.sql"
    "db_add_project_type_lookup.sql"
    "db_clean_duplicates.sql"
    "db_enrich_amenities.sql"
    "db_enrich_finishing.sql"
    "db_enrich_home_content.sql"
    "db_enrich_marketplace.sql"
    "db_enrich_quotes.sql"
    "db_enrich_rest_content.sql"
    "db_ensure_forms.sql"
    "db_ensure_partner.sql"
    "db_fix.sql"
    "db_fix_and_seed.sql"
    "db_fix_finishing_visibility.sql"
    "db_fix_messages.sql"
    "db_fix_plans.sql"
    "db_fix_rent_plans.sql"
    "db_fix_types_and_restore.sql"
    "db_force_project_type_fix.sql"
    "db_full_schema_and_seed.sql"
    "db_grant_full_access.sql"
    "db_main_content.sql"
    "db_missing_data_seed.sql"
    "db_optimize_filters.sql"
    "db_optimize_requests.sql"
    "db_plans_forms.sql"
    "db_refactor_finishing_plans.sql"
    "db_remaining_migration.sql"
    "db_restore_missing_tables.sql"
    "db_seed_content.sql"
    "db_seed_estimator_manual.sql"
    "db_update_estimator.sql"
    "db_update_plan_limits.sql"
    "db_update_services_category.sql"
)

echo "🧹 Starting cleanup of deprecated SQL files..."

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        rm "$file"
        echo "✅ Removed $file"
    else
        echo "⚠️  File not found: $file"
    fi
done

echo "🎉 Cleanup complete. Please run 'git add .', 'git commit', and 'git push' to update GitHub."
