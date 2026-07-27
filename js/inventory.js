// Core Storage Operations Asset Adjustment Engine
const InventoryController = {
    async updateStock(id, amount) {
        const item = await DB.get('inventory', id);
        if (item) {
            item.quantity = Math.max(0, item.quantity + parseInt(amount));
            await DB.save('inventory', item);
            SyncEngine.syncCurrentInventory();
            App.reloadView();
        }
    }
};