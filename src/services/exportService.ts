
export const exportService = {
    downloadCsv: (data: any[], filename: string) => {
        if (!data || data.length === 0) {
            console.warn("Nenhum dado para exportar");
            return;
        }

        try {
            // Get headers from the first object
            // We explicitly select the keys we want to show to avoid internal React keys or raw data mess
            const headers = ['Nome', 'DataNascimento', 'Celular'];

            const csvContent = [
                headers.join(';'), // Header row (using ; for Excel Brazil compatibility usually, or ,)
                ...data.map(row => {
                    return headers.map(fieldName => {
                        let cell = row[fieldName] || '';
                        // Ensure string
                        cell = String(cell);
                        // Escape quotes
                        cell = cell.replace(/"/g, '""');
                        // Quote if needed
                        if (cell.search(/("|,|;|\n)/g) >= 0) {
                            cell = `"${cell}"`;
                        }
                        return cell;
                    }).join(';');
                })
            ].join('\n');

            const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${filename}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            console.error('Erro ao exportar CSV', err);
        }
    }
};
