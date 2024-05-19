document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("vendorSummary").addEventListener("click", function () {

        // Create table and table body
        const table = document.createElement('table');
        const tbody = document.createElement('tbody');
        tbody.id = 'vendorTablesummaryBody';
        table.appendChild(tbody);

        // Create table headers
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        ['VendorName', 'Vendor For', 'Net Payable', 'Paid Till Now', 'Balance'].forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.insertBefore(thead, tbody);

        // Append the table to the overlay-content div
        const tableContainer = document.getElementById('tableContainer');
        tableContainer.innerHTML = ''; // Clear previous content
        tableContainer.appendChild(table);

        // Fetch data from the server
        fetch('/inventory/vendors_summary')
            .then(response => response.json())
            .then(data => {
                console.log('Data:', data); // Log the data
                displayVendors(data);
            })
            .catch(error => {
                console.error('Error:', error);
                // Handle error if needed
            });

        // Show the overlay
        const overlay = document.getElementById('purchaseReportsOverlay');
        overlay.style.display = 'block';
    });
});

// Function to display vendor summary data
function displayVendors(data) {
    const vendorTableBody = document.getElementById('vendorTablesummaryBody');
    vendorTableBody.innerHTML = ''; // Clear previous data

    try {
        data.forEach(detail => {
            const row = document.createElement('tr');
            row.innerHTML = `
          <td>${detail.vendor_name}</td>
          <td>${detail.vendorFor}</td>
          <td>${detail.net_payable}</td>
          <td>${detail.paid_till_now}</td>
          <td>${detail.balance}</td>
        `;
            vendorTableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error displaying vendor summary:', error);
        // Handle error if needed
    }
}

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("vendorDetails").addEventListener("click", function () {
        // Create table and table body
        const table = document.createElement('table');
        table.id = 'vendorDetailsTable';
        const tbody = document.createElement('tbody');
        tbody.id = 'vendorDetailsTableBody';
        table.appendChild(tbody);

        // Create table headers
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        ['Vendor Name', 'Item Ordered', 'Purchase Price', 'Ordered Quantity', 'Returned Quantity', 'Items in Stock', 'Ordered Price', 'Returned Price', 'Net Payable'].forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.insertBefore(thead, tbody);

        // Append the table to the tableContainer div
        const tableContainer = document.getElementById('tableContainer');
        tableContainer.innerHTML = ''; // Clear previous table content
        tableContainer.appendChild(table);

        // Fetch data from the server
        fetch('/inventory/vendors_details')
            .then(response => response.json())
            .then(data => {
                console.log('Data:', data); // Log the data
                displayVendorDetails(data);
            })
            .catch(error => {
                console.error('Error:', error);
                // Handle error if needed
            });

        // Show the overlay
        const overlay = document.getElementById('purchaseReportsOverlay');
        overlay.style.display = 'block';
    });
});

function displayVendorDetails(data) {
    const vendorDetailsTableBody = document.getElementById('vendorDetailsTableBody');
    vendorDetailsTableBody.innerHTML = ''; // Clear previous data

    try {
        data.forEach(detail => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${detail.vendor_name}</td>
                <td>${detail.item_ordered}</td>
                <td>${detail.purchase_price}</td>
                <td>${detail.ordered_quantity}</td>
                <td>${detail.returned_quantity}</td>
                <td>${detail.no_of_items_in_stock}</td>
                <td>${detail.ordered_price}</td>
                <td>${detail.returned_price}</td>
                <td>${detail.net_payable}</td>
            `;
            vendorDetailsTableBody.appendChild(row);
        });

    } catch (error) {
        console.error('Error displaying vendor details:', error);
        // Handle error if needed
    }
}



document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("profitLoss").addEventListener("click", function () {

        // Create table and table body
        const table = document.createElement('table');
        const tbody = document.createElement('tbody');
        tbody.id = 'profitLossTableBody';
        table.appendChild(tbody);

        // Create table headers
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        ['Item Type', 'Total Purchase Price', 'Total Selling Price', 'Total Profit'].forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.insertBefore(thead, tbody);

        // Append the table to the overlay-content div
        const tableContainer = document.getElementById('tableContainer');
        tableContainer.innerHTML = ''; // Clear previous content
        tableContainer.appendChild(table);

        // Fetch data from the server
        fetch('/inventory/profit_loss')
            .then(response => response.json())
            .then(data => {
                console.log('Data:', data); // Log the data
                displayProfitLoss(data);
            })
            .catch(error => {
                console.error('Error:', error);
                // Handle error if needed
            });

        // Show the overlay
        const overlay = document.getElementById('purchaseReportsOverlay');
        overlay.style.display = 'block';
    });
});

function displayProfitLoss(data) {
    const profitLossTableBody = document.getElementById('profitLossTableBody');
    profitLossTableBody.innerHTML = ''; // Clear previous data

    try {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>Books</td>
            <td>${data.books.total_purchase_price}</td>
            <td>${data.books.total_selling_price}</td>
            <td>${data.books.total_profit}</td>
        `;
        profitLossTableBody.appendChild(row);

        const row2 = document.createElement('tr');
        row2.innerHTML = `
            <td>Uniforms</td>
            <td>${data.uniforms.total_purchase_price}</td>
            <td>${data.uniforms.total_selling_price}</td>
            <td>${data.uniforms.total_profit}</td>
        `;
        profitLossTableBody.appendChild(row2);

    } catch (error) {
        console.error('Error displaying profit/loss:', error);
        // Handle error if needed
    }
}