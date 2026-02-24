import { openDB, DBSchema, IDBPDatabase } from 'idb';
import type { Tables } from './database.types';

interface ECGDatabase extends DBSchema {
  ecg_records: {
    key: string;
    value: Tables['ecg_records']['Row'] & {
      synced: boolean;
      lastModified: number;
    };
    indexes: { 'by-hospital': string; 'by-status': string; 'by-sync': boolean };
  };
  ecg_files: {
    key: string;
    value: Tables['ecg_files']['Row'] & {
      file_data?: Blob;
      synced: boolean;
    };
    indexes: { 'by-record': string };
  };
  sync_queue: {
    key: number;
    value: {
      id?: number;
      operation: 'create' | 'update' | 'delete';
      table: string;
      data: unknown;
      timestamp: number;
    };
  };
}

class OfflineStorage {
  private db: IDBPDatabase<ECGDatabase> | null = null;
  private readonly DB_NAME = 'ecg_offline_db';
  private readonly DB_VERSION = 1;

  async init() {
    if (this.db) return this.db;

    this.db = await openDB<ECGDatabase>(this.DB_NAME, this.DB_VERSION, {
      upgrade(db) {
        // ECG Records store
        const ecgStore = db.createObjectStore('ecg_records', {
          keyPath: 'id'
        });
        ecgStore.createIndex('by-hospital', 'hospital_id');
        ecgStore.createIndex('by-status', 'status');
        ecgStore.createIndex('by-sync', 'synced');

        // ECG Files store
        const filesStore = db.createObjectStore('ecg_files', {
          keyPath: 'id'
        });
        filesStore.createIndex('by-record', 'ecg_record_id');

        // Sync queue store
        db.createObjectStore('sync_queue', {
          keyPath: 'id',
          autoIncrement: true
        });
      }
    });

    return this.db;
  }

  async saveECGRecord(record: Tables['ecg_records']['Row'], files?: File[]) {
    const db = await this.init();
    const tx = db.transaction(['ecg_records', 'ecg_files'], 'readwrite');

    // Save record
    await tx.objectStore('ecg_records').put({
      ...record,
      synced: false,
      lastModified: Date.now()
    });

    // Save files
    if (files?.length) {
      const filesStore = tx.objectStore('ecg_files');
      for (const file of files) {
        await filesStore.put({
          id: crypto.randomUUID(),
          ecg_record_id: record.id,
          file_path: file.name,
          file_type: file.type.toUpperCase() as any,
          file_data: file,
          synced: false,
          created_at: new Date().toISOString()
        });
      }
    }

    await tx.done;
  }

  async getECGRecord(id: string) {
    const db = await this.init();
    const record = await db.get('ecg_records', id);
    if (!record) return null;

    const files = await db.getAllFromIndex('ecg_files', 'by-record', id);
    return { ...record, files };
  }

  async getECGRecordsByHospital(hospitalId: string) {
    const db = await this.init();
    return db.getAllFromIndex('ecg_records', 'by-hospital', hospitalId);
  }

  async getUnsyncedRecords() {
    const db = await this.init();
    return db.getAllFromIndex('ecg_records', 'by-sync', false);
  }

  async addToSyncQueue(operation: 'create' | 'update' | 'delete', table: string, data: any) {
    const db = await this.init();
    await db.add('sync_queue', {
      operation,
      table,
      data,
      timestamp: Date.now()
    });
  }

  async processSyncQueue() {
    const db = await this.init();
    const keys = await db.getAllKeys('sync_queue');
    for (const key of keys) {
      try {
        await db.delete('sync_queue', key);
      } catch (error) {
        console.error('Error processing sync queue item:', error);
      }
    }
  }

  async clearOldData(daysToKeep = 30) {
    const db = await this.init();
    const cutoff = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);

    const tx = db.transaction(['ecg_records', 'ecg_files'], 'readwrite');
    const records = await tx.objectStore('ecg_records').getAll();

    for (const record of records) {
      if (record.synced && record.lastModified < cutoff) {
        await tx.objectStore('ecg_records').delete(record.id);
        const files = await tx.objectStore('ecg_files')
          .index('by-record')
          .getAll(record.id);
        
        for (const file of files) {
          await tx.objectStore('ecg_files').delete(file.id);
        }
      }
    }

    await tx.done;
  }
}

export const offlineStorage = new OfflineStorage();