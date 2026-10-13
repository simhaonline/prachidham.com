import { hash } from 'bcryptjs';
import { Pool } from 'pg';

async function run() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const displayName = process.env.ADMIN_NAME?.trim() || 'Foundation Administrator';
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || !password || password.length < 16) {
    throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD (at least 16 characters) as environment variables.');
  }
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const org = await client.query<{ id: string }>(`
      INSERT INTO organizations (slug, name) VALUES ('prachi-dham', 'Prachi Dham Foundation')
      ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id
    `);
    await client.query(`
      INSERT INTO users (organization_id, email, display_name, password_hash, role)
      VALUES ($1, $2, $3, $4, 'owner')
      ON CONFLICT (email) DO NOTHING
    `, [org.rows[0].id, email, displayName, await hash(password, 12)]);
    await client.query('COMMIT');
    console.log('Bootstrap complete; existing accounts were not changed.');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}
void run();
