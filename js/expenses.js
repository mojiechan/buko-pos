// Miscellaneous Expense Operational Business Management Layer [cite: 221]
const ExpensesController = {
    async addExpense(desc, cat, amt, notes) {
        if (!desc || isNaN(amt) || amt <= 0) return alert("Provide a valid matching description field tracking metric value.");

        const record = {
            id: Utils.generateUUID(),
            date: Utils.getTodayDate(),
            description: desc,
            category: cat,
            amount: parseFloat(amt),
            notes
        };

        await DB.save('expenses', record);
        SyncEngine.queueItem('expense', record);
        App.reloadView();
    }
};