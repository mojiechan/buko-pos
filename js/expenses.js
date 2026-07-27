// Miscellaneous Expense Operational Business Management Layer [cite: 221]
const ExpensesController = {
    async addExpense(desc, cat, amt, notes) {
        if (!desc || isNaN(amt) || amt <= 0) return alert("Please enter what you bought (for example: 'Bought 2 Bags of Ice').");

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
