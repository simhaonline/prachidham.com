-- Apply after 030_runtime_role.sh; may be re-run after deploying 020_commerce.sql on existing volumes.
GRANT SELECT, INSERT, UPDATE ON catalog_items TO prachi_app;
GRANT SELECT, INSERT, UPDATE ON catalog_translations TO prachi_app;
GRANT SELECT, INSERT, UPDATE ON commerce_inquiries TO prachi_app;
GRANT SELECT, INSERT ON commerce_inquiry_items TO prachi_app;
