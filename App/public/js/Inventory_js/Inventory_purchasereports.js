document.addEventListener("DOMContentLoaded", function () {
    // Vendor Summary button click event
    document.getElementById("vendorSummary").addEventListener("click", function () {
        createAndFetchTable('/inventory/vendors_summary', 'vendorTablesummaryBody', displayVendors, ['VendorName', 'Vendor For', 'Net Payable', 'Paid Till Now', 'Balance']);
    });

    // Vendor Details button click event
    document.getElementById("vendorDetails").addEventListener("click", function () {
        createAndFetchTable('/inventory/vendors_details', 'vendorDetailsTableBody', displayVendorDetails, ['Vendor Name', 'Item Ordered', 'Purchase Price', 'Ordered Quantity', 'Returned Quantity', 'Items in Stock', 'Ordered Price', 'Returned Price', 'Net Payable']);
    });

    // Profit/Loss button click event
    document.getElementById("profitLoss").addEventListener("click", function () {
        createAndFetchTable('/inventory/profit_loss', 'profitLossTableBody', displayProfitLoss, ['Item Type', 'Total Purchase Price', 'Total Selling Price', 'Total Profit']);
    });

    function createAndFetchTable(url, tableBodyId, displayFunction, headers) {
        // Create table and table body
        const table = document.createElement('table');
        const tbody = document.createElement('tbody');
        tbody.id = tableBodyId;
        table.appendChild(tbody);

        // Create table headers
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        headers.forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.insertBefore(thead, tbody);

        // Append the table to the tableContainer div
        const tableContainer = document.getElementById('tableContainer');
        tableContainer.innerHTML = ''; // Clear previous content
        tableContainer.appendChild(table);

        // Fetch data from the server
        fetch(url)
            .then(response => response.json())
            .then(data => {
                console.log('Data:', data); // Log the data
                displayFunction(data);
            })
            .catch(error => {
                console.error('Error:', error);
                // Handle error if needed
            });

        // Show the overlay
        const overlay = document.getElementById('purchaseReportsOverlay');
        overlay.style.display = 'block';
    }

    // Function to display vendor summary data
    function displayVendors(data) {
        const vendorTableBody = document.getElementById('vendorTablesummaryBody');
        if (!vendorTableBody) {
            console.error('Error: vendorTablesummaryBody not found');
            return;
        }
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

    // Function to display vendor details data
    function displayVendorDetails(data) {
        const vendorDetailsTableBody = document.getElementById('vendorDetailsTableBody');
        if (!vendorDetailsTableBody) {
            console.error('Error: vendorDetailsTableBody not found');
            return;
        }
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

    // Function to display profit/loss data
    function displayProfitLoss(data) {
        const profitLossTableBody = document.getElementById('profitLossTableBody');
        if (!profitLossTableBody) {
            console.error('Error: profitLossTableBody not found');
            return;
        }
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

    // Sample function to close the overlay
    function closeOverlay(event) {
        const overlay = document.getElementById('purchaseReportsOverlay');
        overlay.style.display = 'none';
    }
});
