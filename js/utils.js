// Shared Global Functional Matrix Utility Module
const Utils = {
    generateUUID() {
        return 'rec_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
    },
    
    formatPHP(amount) {
        return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
    },
    
    getTodayDate() {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }
};