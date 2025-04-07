import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import config from './config.js';

// Enable verbose logging in development
if (config.development.enableDebugLogs) {
  sqlite3.verbose();
}

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
      this.db = new sqlite3.Database(this.dbPath);

      // Initialize tables
      await this.initializeTables();

      // Start size monitoring
      this.startSizeMonitoring();

      return this.db;
    } catch (error) {
      console.error('Database initialization error:', error);
      throw error;
    }
  }

  async initializeTables() {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        // Create tables if they don't exist
        this.db.run(
          'CREATE TABLE IF NOT EXISTS KeyValuePairs (key TEXT PRIMARY KEY, value TEXT)',
          (err) => {
            if (err) {
              console.error('Error creating tables:', err);
              reject(err);
            } else {
              console.log('Database tables initialized successfully');
              resolve();
            }
          }
        );
      });
    });
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

  // Promisified database methods
  get(query, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(query, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  all(query, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  run(query, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(query, params, function (err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

export default new Database();
