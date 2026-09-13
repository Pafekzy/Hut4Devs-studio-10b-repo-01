import pg from 'pg';
import { newDb } from 'pg-mem';
import { runMigrations } from './migrator';
import { seedDevelopmentDatabase } from './seed';
import { PostgresRepositories } from './postgresRepository';
import { IHut4DevsRepositories } from '../../domain/repositories';

let activePool: pg.Pool | null = null;
let activeRepositories: IHut4DevsRepositories | null = null;
let isDbInitialized = false;
let dbInitializationError: string | null = null;

export interface DatabaseInitOptions {
  connectionString?: string;
  useMemoryFallbackIfNoUrl?: boolean;
}

/**
 * Creates an isolated PostgreSQL database instance for testing or local development
 * using pg-mem, fully migrated and seeded.
 */
export async function createIsolatedTestDatabase(): Promise<{
  pool: pg.Pool;
  repos: IHut4DevsRepositories;
}> {
  const db = newDb({
    autoCreateForeignKeyIndices: true,
  });

  const adapter = db.adapters.createPg();
  const pool = new adapter.Pool();

  // Run migrations
  await runMigrations(pool);

  // Seed deterministic demo data
  await seedDevelopmentDatabase(pool);

  const repos = new PostgresRepositories(pool);
  return { pool, repos };
}

/**
 * Initializes the application database.
 * Respects DATABASE_URL if configured.
 * If DATABASE_URL is unavailable and useMemoryFallbackIfNoUrl is true, uses isolated PostgreSQL engine.
 * If DATABASE_URL is configured but connection fails, fails truthfully.
 */
export async function initializeDatabase(
  options: DatabaseInitOptions = {}
): Promise<IHut4DevsRepositories> {
  const connectionUrl = options.connectionString || (process.env.DATABASE_URL ? process.env.DATABASE_URL.trim() : '');

  // Reset state
  dbInitializationError = null;

  if (connectionUrl && connectionUrl !== 'memory://' && !connectionUrl.includes('localhost:5432/hut4devs_mock')) {
    try {
      const pool = new pg.Pool({
        connectionString: connectionUrl,
        connectionTimeoutMillis: 5000,
      });

      // Probe connectivity
      await pool.query('SELECT 1');

      // Run migrations on authoritative PostgreSQL database
      await runMigrations(pool);

      // Seed deterministic development data if needed
      await seedDevelopmentDatabase(pool);

      activePool = pool;
      activeRepositories = new PostgresRepositories(pool);
      isDbInitialized = true;
      return activeRepositories;
    } catch (err: any) {
      if (options.useMemoryFallbackIfNoUrl === false) {
        dbInitializationError = `Database unavailable: ${err.message || String(err)}`;
        activePool = null;
        activeRepositories = null;
        isDbInitialized = false;
        throw new Error(dbInitializationError);
      }
      console.warn(`[AI Studio] PostgreSQL connection failed (${err.message}). Falling back to in-memory database.`);
      const { pool, repos } = await createIsolatedTestDatabase();
      activePool = pool;
      activeRepositories = repos;
      isDbInitialized = true;
      return repos;
    }
  }

  // If no DATABASE_URL or memory mode requested
  if (options.useMemoryFallbackIfNoUrl !== false) {
    const { pool, repos } = await createIsolatedTestDatabase();
    activePool = pool;
    activeRepositories = repos;
    isDbInitialized = true;
    return repos;
  }

  dbInitializationError = 'Database unavailable: DATABASE_URL is not configured.';
  throw new Error(dbInitializationError);
}

/**
 * Returns the active authoritative repositories.
 * Throws if database is unavailable.
 */
export async function getAuthoritativeRepositories(): Promise<IHut4DevsRepositories> {
  if (activeRepositories && isDbInitialized) {
    return activeRepositories;
  }

  if (dbInitializationError) {
    throw new Error(dbInitializationError);
  }

  return initializeDatabase({ useMemoryFallbackIfNoUrl: true });
}

/**
 * Resets the active database connection (useful for isolated tests).
 */
export function resetDatabaseState(): void {
  if (activePool) {
    activePool.end?.().catch(() => {});
  }
  activePool = null;
  activeRepositories = null;
  isDbInitialized = false;
  dbInitializationError = null;
}
