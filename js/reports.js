// Shift Management and Reconciliation Controller [cite: 222]
const ReportsController = {
    async openShift(openingAmount) {
        if (isNaN(openingAmount) || openingAmount < 0) return alert("Please type a valid amount for your morning change fund (for example: 500).");
        const shiftObj = { isOpen: true, date: Utils.getTodayDate(), openingCash: parseFloat(openingAmount) };
        await DB.save('settings', shiftObj, 'active_shift');
        App.reloadView();
    },

    async closeShift(actualCount) {
        if (isNaN(actualCount) || actualCount < 0) return alert("Please count the money in the drawer and type the total amount here before closing.");
        
        const activeShift = await DB.get('settings', 'active_shift');
        const sales = await DB.getAll('sales');
        const expenses = await DB.getAll('expenses');
        const today = Utils.getTodayDate();

        const todaySales = sales.filter(s => s.date === today).reduce((sum, s) => sum + s.total, 0);
        const todayExp = expenses.filter(e => e.date === today).reduce((sum, e) => sum + e.amount, 0);
        
        const expectedCash = activeShift.openingCash + todaySales - todayExp;
        const variance = actualCount - expectedCash;

        const summaryLog = {
            date: today,
            openingCash: activeShift.openingCash,
            salesTotal: todaySales,
            expensesTotal: todayExp,
            expectedCash,
            actualCash: parseFloat(actualCount),
            variance
        };

        await DB.delete('settings', 'active_shift');
        SyncEngine.queueItem('shift', summaryLog);
        
        alert(`Shift successfully closed!\nCash Mistake Count (Short/Over): ${Utils.formatPHP(variance)}`);
        App.reloadView();
    }
};
