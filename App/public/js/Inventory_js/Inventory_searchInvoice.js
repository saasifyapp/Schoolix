function refreshInvoiceData() {
    document.getElementById('searchBar').value = '';
    fetch('/inventory/invoices')
        .then(response => response.json())
        .then(data => {
            displayInvoices(data);
        })
        .catch(error => {
            console.error('Error:', error);
            showToast('Error fetching invoices. Please try again.', true);
        });
}

function displayInvoices(data) {
    const invoiceTable = document.getElementById('invoiceTable').getElementsByTagName('tbody')[0];
    invoiceTable.innerHTML = ''; // Clear previous data

    try {
        data.forEach(invoice => {

            // Format the date
            const billDate = new Date(invoice.billDate).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });

            const row = document.createElement('tr');
            row.innerHTML = `
            <td>${invoice.invoiceNo}</td>
            <td>${billDate}</td>
            <td>${invoice.buyerName}</td>
            <td>${invoice.buyerPhone}</td>
            <td>${invoice.total_payable}</td>
            <td>${invoice.paid_amount}</td>
            <td>${invoice.balance_amount}</td>
            <td>${invoice.mode_of_payment}</td>
            <td>
                <button onclick="updateInvoice(${invoice.invoiceNo})">Update</button>
                <button onclick="printInvoice(${invoice.invoiceNo})">Print</button>
                <button onclick="deleteInvoice(${invoice.invoiceNo})">Delete</button>
            </td>
            `;
            invoiceTable.appendChild(row);
        });
        // hideLoadingAnimation();
    } catch (error) {
        console.error('Error displaying invoices:', error);
        showToast('Error displaying invoices. Please try again.', true);
        // hideLoadingAnimation();
    }
}



// Initial data load
document.addEventListener('DOMContentLoaded', (event) => {
    refreshInvoiceData();
});

