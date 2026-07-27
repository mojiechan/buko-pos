// Core Database Management Layer using Native Browser IndexedDB
const DB = {
    dbName: 'BukoPOS_DB',
    version: 2,

    init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains('settings')) db.createObjectStore('settings');
                if (!db.objectStoreNames.contains('products')) db.createObjectStore('products', { keyPath: 'id' });
                if (!db.objectStoreNames.contains('inventory')) db.createObjectStore('inventory', { keyPath: 'id' });
                if (!db.objectStoreNames.contains('sales')) db.createObjectStore('sales', { keyPath: 'id' });
                if (!db.objectStoreNames.contains('expenses')) db.createObjectStore('expenses', { keyPath: 'id' });
                if (!db.objectStoreNames.contains('syncQueue')) db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
            };

            request.onsuccess = (e) => resolve(e.target.result);
            request.onerror = (e) => reject(e.target.error);
        });
    },

    async execute(storeName, mode, callback) {
        const db = await this.init();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(storeName, mode);
            const store = tx.objectStore(storeName);
            const request = callback(store);
            tx.oncomplete = () => resolve(request ? request.result : null);
            tx.onerror = () => reject(tx.error);
        });
    },

    async save(storeName, item, customKey) {
        return this.execute(storeName, 'readwrite', store => customKey ? store.put(item, customKey) : store.put(item));
    },

    async get(storeName, key) {
        return this.execute(storeName, 'readonly', store => store.get(key));
    },

    async getAll(storeName) {
        return this.execute(storeName, 'readonly', store => store.getAll());
    },

    async delete(storeName, key) {
        return this.execute(storeName, 'readwrite', store => store.delete(key));
    },

    async clear(storeName) {
        return this.execute(storeName, 'readwrite', store => store.clear());
    }
};