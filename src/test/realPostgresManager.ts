import fs from 'node:fs';
import { execSync } from 'node:child_process';
import pg from 'pg';

export const REAL_PG_PORT = 5432;
export const DEFAULT_REAL_PG_URL = `postgresql://user:password@127.0.0.1:${REAL_PG_PORT}/hut4devs`;

export interface RealPostgresInfo {
  available: boolean;
  version: string;
  connectionString: string;
  source: 'existing' | 'spawned' | 'none';
}

/**
 * Ensures a real PostgreSQL server is running and accessible.
 * Prefers existing TEST_DATABASE_URL or DATABASE_URL if configured.
 * Otherwise, connects to or starts the local PostgreSQL cluster on port 5432.
 */
export async function ensureRealPostgresServer(): Promise<RealPostgresInfo> {
  const candidateUrls = [
    process.env.TEST_DATABASE_URL,
    process.env.DATABASE_URL,
    DEFAULT_REAL_PG_URL,
    `postgresql://postgres@127.0.0.1:5432/postgres`,
    `postgresql://postgres@127.0.0.1:5433/postgres`,
  ].filter(Boolean) as string[];

  // 1. Probe candidate connection URLs
  for (const url of candidateUrls) {
    try {
      const probePool = new pg.Pool({
        connectionString: url,
        connectionTimeoutMillis: 1500,
      });
      const res = await probePool.query('SELECT version();');
      await probePool.end();
      return {
        available: true,
        version: res.rows[0]?.version || 'Unknown',
        connectionString: url,
        source: 'existing',
      };
    } catch {
      // Continue checking next candidate
    }
  }

  // 2. If no server running, attempt to start local PostgreSQL using binaries in /opt/postgresql-15
  const pgBin = '/opt/postgresql-15/bin/postgres';
  const pgCtl = '/opt/postgresql-15/bin/pg_ctl';
  const initDb = '/opt/postgresql-15/bin/initdb';
  const dataDir = '/tmp/pg_cluster';

  if (fs.existsSync(pgBin) && fs.existsSync(pgCtl)) {
    try {
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
        execSync(`chown -R postgres:postgres ${dataDir}`);
        execSync(`su - postgres -c "${initDb} -D ${dataDir} -U postgres --auth=trust --no-sync"`, {
          stdio: 'ignore',
        });
      }

      // Configure pg_hba.conf for trust
      fs.writeFileSync(
        `${dataDir}/pg_hba.conf`,
        `local all all trust\nhost all all 127.0.0.1/32 trust\nhost all all ::1/128 trust\n`
      );

      // Start server using pg_ctl on port 5432
      execSync(
        `su - postgres -c "${pgCtl} -D ${dataDir} -o '-p 5432 -k /tmp' -l ${dataDir}/server.log start"`,
        { stdio: 'ignore' }
      );

      // Ensure user and database exist
      try {
        execSync(
          `su - postgres -c "/opt/postgresql-15/bin/psql -h localhost -p 5432 -U postgres -c 'CREATE ROLE \\"user\\" WITH LOGIN SUPERUSER PASSWORD \\'password\\';' || true"`,
          { stdio: 'ignore' }
        );
        execSync(
          `su - postgres -c "/opt/postgresql-15/bin/psql -h localhost -p 5432 -U postgres -c 'CREATE DATABASE hut4devs OWNER \\"user\\";' || true"`,
          { stdio: 'ignore' }
        );
      } catch {
        // Ignored if already exist
      }

      const startPool = new pg.Pool({
        connectionString: DEFAULT_REAL_PG_URL,
        connectionTimeoutMillis: 4000,
      });
      const res = await startPool.query('SELECT version();');
      await startPool.end();

      return {
        available: true,
        version: res.rows[0]?.version || 'PostgreSQL 15',
        connectionString: DEFAULT_REAL_PG_URL,
        source: 'spawned',
      };
    } catch {
      // Failed to start
    }
  }

  return {
    available: false,
    version: 'N/A',
    connectionString: '',
    source: 'none',
  };
}
