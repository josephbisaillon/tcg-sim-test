import BetterSQLite3 from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import config from './config.js';
import zlib from 'zlib';
import { promisify } from 'util';

// Promisify zlib functions
const gzipAsync = promisify(zlib.gzip);
const gunzipAsync = promisify(zlib.gunzip);

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

      // Schedule cleanup job
      this.scheduleCleanupJob();

      return this.db;
    } catch (error) {
      console.error('Database initialization error:', error);
      throw error;
    }
  }

  initializeTables() {
    try {
      // Create legacy table if it doesn't exist (for backward compatibility)
      this.db.exec(
        'CREATE TABLE IF NOT EXISTS KeyValuePairs (key TEXT PRIMARY KEY, value TEXT)'
      );

      // Create new tables for enhanced schema
      this.db.exec(`
        -- Game rooms table
        CREATE TABLE IF NOT EXISTS Rooms (
          id TEXT PRIMARY KEY,
          created_at INTEGER NOT NULL,
          last_active INTEGER NOT NULL,
          player1_id TEXT,
          player2_id TEXT,
          status TEXT NOT NULL DEFAULT 'active',
          metadata TEXT
        );

        -- Players table
        CREATE TABLE IF NOT EXISTS Players (
          id TEXT PRIMARY KEY,
          username TEXT NOT NULL,
          last_seen INTEGER NOT NULL,
          metadata TEXT
        );

        -- Game snapshots table with indexing and compression
        CREATE TABLE IF NOT EXISTS GameSnapshots (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          room_id TEXT NOT NULL,
          version TEXT NOT NULL,
          created_at INTEGER NOT NULL,
          snapshot_type TEXT NOT NULL DEFAULT 'full',
          compressed BOOLEAN NOT NULL DEFAULT TRUE,
          data BLOB NOT NULL,
          checksum TEXT NOT NULL,
          FOREIGN KEY (room_id) REFERENCES Rooms(id) ON DELETE CASCADE
        );

        -- Create indexes for efficient querying
        CREATE INDEX IF NOT EXISTS idx_snapshots_room_id ON GameSnapshots(room_id);
        CREATE INDEX IF NOT EXISTS idx_snapshots_created_at ON GameSnapshots(created_at);
        CREATE INDEX IF NOT EXISTS idx_rooms_last_active ON Rooms(last_active);
      `);

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

  // Schedule cleanup job to run daily
  scheduleCleanupJob() {
    const CLEANUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
    setInterval(() => {
      this.cleanupOldSnapshots()
        .then(count => {
          console.log(`Cleaned up ${count} old snapshots`);
        })
        .catch(error => {
          console.error('Error during snapshot cleanup:', error);
        });
    }, CLEANUP_INTERVAL);
  }

  // Compress data using gzip
  async compressData(data) {
    try {
      return await gzipAsync(Buffer.from(data));
    } catch (error) {
      console.error('Error compressing data:', error);
      throw error;
    }
  }

  // Decompress data using gunzip
  async decompressData(buffer) {
    try {
      const decompressed = await gunzipAsync(buffer);
      return decompressed.toString();
    } catch (error) {
      console.error('Error decompressing data:', error);
      throw error;
    }
  }

  // Save a game snapshot
  async saveSnapshot(roomId, snapshot, compressed = true) {
    try {
      // Ensure room exists
      await this.ensureRoomExists(roomId);
      
      // Prepare snapshot data
      let dataToStore;
      const snapshotStr = typeof snapshot === 'string' ? snapshot : JSON.stringify(snapshot);
      
      if (compressed) {
        dataToStore = await this.compressData(snapshotStr);
      } else {
        dataToStore = Buffer.from(snapshotStr);
      }
      
      // Extract version and checksum from snapshot
      let version = '1.0.0';
      let checksum = '';
      
      try {
        const snapshotObj = typeof snapshot === 'string' ? JSON.parse(snapshot) : snapshot;
        version = snapshotObj.version || '1.0.0';
        checksum = snapshotObj.checksum || '';
      } catch (error) {
        console.warn('Could not extract version/checksum from snapshot:', error);
      }
      
      // Store in database
      const result = this.run(
        `INSERT INTO GameSnapshots 
         (room_id, version, created_at, snapshot_type, compressed, data, checksum) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          roomId,
          version,
          Date.now(),
          'full',
          compressed ? 1 : 0,
          dataToStore,
          checksum
        ]
      );
      
      // Update room last_active timestamp
      this.run(
        `UPDATE Rooms SET last_active = ? WHERE id = ?`,
        [Date.now(), roomId]
      );
      
      return result.lastID;
    } catch (error) {
      console.error('Error saving snapshot:', error);
      throw error;
    }
  }
  
  // Get the latest snapshot for a room
  async getLatestSnapshot(roomId) {
    try {
      const row = this.get(
        `SELECT id, version, created_at, snapshot_type, compressed, data, checksum 
         FROM GameSnapshots 
         WHERE room_id = ? 
         ORDER BY created_at DESC LIMIT 1`,
        [roomId]
      );
      
      if (!row) return null;
      
      // Process the data based on compression flag
      let snapshotData;
      if (row.compressed) {
        const decompressed = await this.decompressData(row.data);
        snapshotData = JSON.parse(decompressed);
      } else {
        snapshotData = JSON.parse(row.data.toString());
      }
      
      return {
        id: row.id,
        version: row.version,
        createdAt: row.created_at,
        type: row.snapshot_type,
        data: snapshotData
      };
    } catch (error) {
      console.error('Error retrieving snapshot:', error);
      throw error;
    }
  }
  
  // Ensure a room exists in the database
  async ensureRoomExists(roomId) {
    const room = this.get(
      `SELECT id FROM Rooms WHERE id = ?`,
      [roomId]
    );
    
    if (!room) {
      this.run(
        `INSERT INTO Rooms (id, created_at, last_active) VALUES (?, ?, ?)`,
        [roomId, Date.now(), Date.now()]
      );
    }
  }
  
  // Clean up old snapshots
  async cleanupOldSnapshots(retentionDays = 7) {
    const cutoffTime = Date.now() - (retentionDays * 24 * 60 * 60 * 1000);
    
    // Keep the latest snapshot per room regardless of age
    const result = this.run(
      `DELETE FROM GameSnapshots 
       WHERE id NOT IN (
         SELECT id FROM GameSnapshots 
         GROUP BY room_id 
         HAVING MAX(created_at)
       ) 
       AND created_at < ?`,
      [cutoffTime]
    );
    
    // Clean up inactive rooms
    this.run(
      `DELETE FROM Rooms 
       WHERE last_active < ? 
       AND id NOT IN (SELECT DISTINCT room_id FROM GameSnapshots)`,
      [cutoffTime]
    );
    
    return result.changes;
  }
  
  // Check if a saved state exists for a room (either legacy or snapshot)
  async checkSavedState(roomId) {
    // Check for snapshot
    const snapshotRow = this.get(
      `SELECT id FROM GameSnapshots WHERE room_id = ? LIMIT 1`,
      [roomId]
    );
    
    if (snapshotRow) return { hasState: true, type: 'snapshot' };
    
    // Check for legacy state
    const legacyRow = this.get(
      `SELECT key FROM KeyValuePairs WHERE key = ?`,
      [`autosave_${roomId}`]
    );
    
    if (legacyRow) return { hasState: true, type: 'legacy' };
    
    return { hasState: false };
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
