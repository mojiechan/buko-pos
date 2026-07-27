// Native CSV Interface Parser for Microsoft Excel [cite: 224]
const ImporterController = {
    exportToCSV(dataList, headerArray, filename) {
        let csvContent = headerArray.join(",") + "\n";
        dataList.forEach(obj => {
            let row = headerArray.map(header => {
                let field = obj[header] !== undefined ? obj[header] : "";
                return `"${String(field).replace(/"/g, '""')}"`;
            });
            csvContent += row.join(",") + "\n";
        });
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
    },

    async parseCSVImport(fileEvent) {
        const file = fileEvent.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (e) => {
            const lines = e.target.result.split(/\r?\n/).filter(line => line.trim() !== "");
            if (lines.length <= 1) return alert("The import sheet file contains no rows.");
            
            const headers = lines[0].split(",").map(h => h.replace(/"/g, '').trim());
            let imported = 0;

            for (let i = 1; i < lines.length; i++) {
                const values = lines[i].split(",").map(v => v.replace(/"/g, '').trim());
                if (values.length < headers.length) continue;

                const name = values[headers.indexOf("Product Name")];
                const price = parseFloat(values[headers.indexOf("Selling Price")]);
                const category = values[headers.indexOf("Category")] || "General";
                const stock = parseInt(values[headers.indexOf("Starting Stock")]) || 0;

                if (name && !isNaN(price)) {
                    const products = await DB.getAll('products');
                    let existing = products.find(p => p.name.toLowerCase() === name.toLowerCase());
                    let id = existing ? existing.id : Utils.generateUUID();

                    await DB.save('products', { id, name, price, category, status: 'Active' });
                    await DB.save('inventory', { id, name, type: 'Finished Item', quantity: stock, threshold: 5 });
                    imported++;
                }
            }
            alert(`Process complete. Successfully uploaded ${imported} records.`);
            SyncEngine.syncCurrentInventory();
            App.reloadView();
        };
        reader.readAsText(file);
    }
};