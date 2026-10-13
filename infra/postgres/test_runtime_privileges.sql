-- Execute with the API's DATABASE_URL after initialization.
DO $$
BEGIN
  IF current_user <> 'prachi_app' THEN
    RAISE EXCEPTION 'API connection must use the prachi_app runtime role';
  END IF;
  IF has_table_privilege(current_user, 'audit_events', 'UPDATE')
     OR has_table_privilege(current_user, 'audit_events', 'DELETE')
     OR has_table_privilege(current_user, 'audit_events', 'TRUNCATE') THEN
    RAISE EXCEPTION 'API role can mutate audit history';
  END IF;
  IF NOT has_table_privilege(current_user, 'audit_events', 'INSERT') THEN
    RAISE EXCEPTION 'API role cannot append audit events';
  END IF;
  IF NOT has_table_privilege(current_user, 'catalog_items', 'SELECT')
     OR NOT has_table_privilege(current_user, 'catalog_translations', 'UPDATE')
     OR NOT has_table_privilege(current_user, 'commerce_inquiries', 'INSERT') THEN
    RAISE EXCEPTION 'API role lacks the expected catalog permissions';
  END IF;
  IF has_table_privilege(current_user, 'catalog_items', 'DELETE')
     OR has_table_privilege(current_user, 'commerce_inquiries', 'TRUNCATE') THEN
    RAISE EXCEPTION 'API role can destroy commerce history';
  END IF;
END $$;
