import BetterSQLite3 from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import config from './config.js';

class Database {
  constructor() {
    this.db = null;
    this.isDatabaseCapacityReached = false;
    this.dbPath = config.database.path;
    this.maxSizeGB = config.database.maxSizeGB;
  }

  async initialize() {
    try {
      // Ensure database directory exists
      const dbDir = path.dirname(this.dbPath);
      if (!fs.existsSync(dbDir)) {
        console.log(`Creating database directory: ${dbDir}`);
        fs.mkdirSync(dbDir, { recursive: true });
      }

      // Open database connection
      console.log(`Connecting to SQLite database at: ${this.dbPath}`);
      this.db = new BetterSQLite3(this.dbPath, {
        verbose: config.development.enableDebugLogs ? console.log : null
      });

      // Initialize tables
      this.initializeTables();

      // Start size monitoring
      this.startSizeMonitoring();

      return this.db;
    } catch (error) {
      console.error('Database initialization error:', error);
      throw error;
    }
  }

  initializeTables() {
    try {
      // Create tables if they don't exist
      this.db.exec(
        'CREATE TABLE IF NOT EXISTS KeyValuePairs (key TEXT PRIMARY KEY, value TEXT)'
      );
      console.log('Database tables initialized successfully');
    } catch (error) {
      console.error('Error creating tables:', error);
      throw error;
    }
  }

  startSizeMonitoring() {
    // Check database size periodically
    setInterval(() => {
      try {
        if (fs.existsSync(this.dbPath)) {
          const stats = fs.statSync(this.dbPath);
          const fileSizeInBytes = stats.size;
          const fileSizeInGB = fileSizeInBytes / (1024 * 1024 * 1024);

          if (config.development.enableDebugLogs) {
            console.log(`Current database size: ${fileSizeInGB.toFixed(2)} GB`);
          }

          this.isDatabaseCapacityReached = fileSizeInGB > this.maxSizeGB;

          if (this.isDatabaseCapacityReached) {
            console.warn(
              `Database size limit reached: ${fileSizeInGB.toFixed(2)} GB / ${this.maxSizeGB} GB`
            );
          }
        }
      } catch (error) {
        console.error('Error checking database size:', error);
      }
    }, config.database.checkInterval);
  }

  // Database methods
  get(query, params = []) {
    try {
      const stmt = this.db.prepare(query);
      return stmt.get(...params);
    } catch (error) {
      console.error('Database get error:', error);
      throw error;
    }
  }

  all(query, params = []) {
    try {
      const stmt = this.db.prepare(query);
      return stmt.all(...params);
    } catch (error) {
      console.error('Database all error:', error);
      throw error;
    }
  }

  run(query, params = []) {
    try {
      const stmt = this.db.prepare(query);
      const result = stmt.run(...params);
      return {
        lastID: result.lastInsertRowid,
        changes: result.changes
      };
    } catch (error) {
      console.error('Database run error:', error);
      throw error;
    }
  }

  close() {
    try {
      if (this.db) {
        this.db.close();
      }
    } catch (error) {
      console.error('Error closing database:', error);
      throw error;
    }
  }
}

export default new Database();
