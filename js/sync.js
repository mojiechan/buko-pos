// Background Synchronization Queue Processing Engine [cite: 294, 303]
const SyncEngine = {
    // PASTE YOUR DEPLOYED GOOGLE APPS SCRIPT WEB APP URL LINK HERE
    webAppUrl: "",

    async queueItem(type, data) {
        const queueObj = { type, data: JSON.parse(JSON.stringify(data)), timestamp: Date.now() };
        await DB.save('syncQueue', queueObj);
        this.processQueue();
    },

    async processQueue() {
        if (!navigator.onLine || !this.webAppUrl) {
            this.updateBadge();
            return;
        }

        const items = await DB.getAll('syncQueue');
        if (items.length === 0) {
            this.updateBadge();
            return;
        }

        document.getElementById('sync-badge').className = "bg-yellow-500 text-white px-2 py-0.5 rounded-full text-xs animate-pulse";
        document.getElementById('sync-badge').innerText = `Syncing (${items.length})`;

        for (let item of items) {
            try {
                const res = await fetch(this.webAppUrl, {
                    method: 'POST',
                    mode: 'cors',
                    body: JSON.stringify({ type: item.type, data: item.data })
                });
                const confirmation = await res.json();
                if (confirmation.status === 'success') {
                    await DB.delete('syncQueue', item.id);
                } else {
                    break;
                }
            } catch (err) {
                console.warn("Spreadsheet reporting interface unreachable. Retaining queue records.", err);
                break;
            }
        }
        this.updateBadge();
    },

    async syncCurrentInventory() {
        const stockItems = await DB.getAll('inventory');
        this.queueItem('inventory', stockItems);
    },

    async updateBadge() {
        const badge = document.getElementById('sync-badge');
        const count = (await DB.getAll('syncQueue')).length;
        
        if (!navigator.onLine) {
            badge.className = "bg-gray-500 text-white px-2 py-0.5 rounded-full text-xs";
            badge.innerText = `Offline (${count})`;
        } else if (count > 0) {
            badge.className = "bg-orange-500 text-white px-2 py-0.5 rounded-full text-xs";
            badge.innerText = `Pending (${count})`;
        } else {
            badge.className = "bg-green-500 text-white px-2 py-0.5 rounded-full text-xs";
            badge.innerText = "Synced";
        }
    }
};

window.addEventListener('online', () => SyncEngine.processQueue());
window.addEventListener('offline', () => SyncEngine.updateBadge());
setInterval(() => SyncEngine.processQueue(), 45000);