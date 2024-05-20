document.addEventListener("DOMContentLoaded", function () {

    var currentButtonName = '';

    document.getElementById("exportButton").addEventListener("click", function() {
        exportToExcel(currentButtonName);
    });

    // Vendor Summary button click event
    document.getElementById("vendorSummary").addEventListener("click", function () {
        currentButtonName = 'Inventory_Vendor_Summary';
        createAndFetchTable('/inventory/vendors_summary', 'vendorTablesummaryBody', displayVendors, ['VendorName', 'Vendor For', 'Net Payable', 'Paid Till Now', 'Balance']);
    });

    // Vendor Details dropdown change event
    document.getElementById("vendorDetails").addEventListener("change", function () {
        const selectedVendor = this.value;
        currentButtonName = selectedVendor;
        createAndFetchTable(`/inventory/vendors_details?vendor=${selectedVendor}`, 'vendorDetailsTableBody', displayVendorDetails, ['Vendor Name', 'Item Ordered', 'Purchase Price', 'Ordered Quantity', 'Returned Quantity', 'Items in Stock', 'Ordered Price', 'Returned Price', 'Net Payable']);
    });
    // Profit/Loss button click event
    document.getElementById("profitLoss").addEventListener("click", function () {
        currentButtonName = 'Inventory_Profit_Loss_Report';
        createAndFetchTable('/inventory/profit_loss', 'profitLossTableBody', displayProfitLoss, ['Item Type', 'Total Purchase Price', 'Total Selling Price', 'Total Profit']);
    });

    function createAndFetchTable(url, tableBodyId, displayFunction, headers, currentButtonName) {
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

    // Fetching vendor data and populating the dropdown
    fetch('/inventory/all_vendor')
        .then(response => response.json())
        .then(data => {
            const vendorDetails = document.getElementById('vendorDetails');
            data.forEach(item => {
                const option = document.createElement('option');
                option.value = item.vendor_name;
                option.text = item.vendor_name;
                vendorDetails.appendChild(option);
            });
        });

    // Vendor Details dropdown change event
    document.getElementById("vendorDetails").addEventListener("change", function () {
        const selectedVendor = this.value;
        const tableContainer = document.getElementById('tableContainer');

        // Remove existing table if any
        while (tableContainer.firstChild) {
            tableContainer.removeChild(tableContainer.firstChild);
        }

        // If a vendor is selected, create and fetch table
        if (selectedVendor) {
            createAndFetchTable(`/inventory/vendors_details?vendor=${selectedVendor}`, 'vendorDetailsTableBody', displayVendorDetails, ['Vendor Name', 'Item Ordered', 'Purchase Price', 'Ordered Quantity', 'Returned Quantity', 'Items in Stock', 'Ordered Price', 'Returned Price', 'Net Payable']);
        }
    });

    // Sample function to close the overlay
    function closeOverlay(event) {
        const overlay = document.getElementById('purchaseReportsOverlay');
        overlay.style.display = 'none';
    }

    function exportToExcel(currentButtonName) {
        // Get the current table in the overlay
        var htmlTable = document.getElementById('tableContainer').getElementsByTagName('table')[0];
    
        // CSV representation of the HTML table
        var csv = [];
        var rows = htmlTable.rows;
    
        // Arrays to hold the sums of the last three columns
        var sums = [0, 0, 0];
    
        for (var i = 0; i < rows.length; i++) {
            var row = [], cols = rows[i].cells;
            for (var j = 0; j < cols.length; j++) {
                row.push(cols[j].innerText);
    
                // Sum the last three columns
                if (j >= cols.length - 3) {
                    sums[j - (cols.length - 3)] += Number(cols[j].innerText) || 0;
                }
            }
            csv.push(row.join(","));
        }
    
        // Add an empty line
        csv.push("");
    
        // Create an array for the total row
        var totalRow = Array(rows[0].cells.length).fill("");
        totalRow[totalRow.length - 4] = "Total:";
        totalRow[totalRow.length - 3] = sums[0];
        totalRow[totalRow.length - 2] = sums[1];
        totalRow[totalRow.length - 1] = sums[2];
    
        // Add the total row to the csv
        csv.push(totalRow.join(","));
    
        // Convert to CSV string
        var csvContent = csv.join("\n");
    
        // Generate a temporary download link
        var downloadLink = document.createElement("a");
        downloadLink.href = 'data:text/csv;charset=utf-8,' + encodeURI(csvContent);
        downloadLink.download = currentButtonName + '.csv'; // Use the button name as the file name
    
        // Append the download link to the body (required for Firefox)
        document.body.appendChild(downloadLink);
    
        // Trigger the download
        downloadLink.click();
    
        // Remove the download link after triggering the download
        document.body.removeChild(downloadLink);
    }
});




