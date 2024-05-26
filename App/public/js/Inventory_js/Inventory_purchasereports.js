document.addEventListener("DOMContentLoaded", function () {

    populateVendorDetailsDropdown();

    var currentButtonName = '';

    // Event listeners for buttons and dropdown
    document.getElementById("exportButton").addEventListener("click", function () {
        exportToExcel(currentButtonName);
    });

    document.getElementById("vendorSummary").addEventListener("click", function () {
        currentButtonName = 'Inventory_Vendor_Summary';
        createAndFetchTable('/inventory/vendors_summary', 'vendorTablesummaryBody', displayVendors, ['VendorName', 'Vendor For', 'Net Payable', 'Paid Till Now', 'Balance']);
    });

    document.getElementById("vendorDetails").addEventListener("change", function () {
        const selectedVendor = this.value;
        currentButtonName = selectedVendor;
    
        // Check if the selected index is 0 (default option)
        if (this.selectedIndex === 0) {
            // Clear the table
            const tableContainer = document.getElementById('table-container');
            tableContainer.innerHTML = '';
            currentButtonName = '';
            displayAnimation();
            }
         else {
            // Fetch and display data for the selected vendor
            createAndFetchTable(`/inventory/vendors_details?vendor=${selectedVendor}`, 'vendorDetailsTableBody', displayVendorDetails, ['Vendor Name', 'Item Ordered', 'Purchase Price', 'Ordered Quantity', 'Returned Quantity', 'Items in Stock', 'Ordered Price', 'Returned Price', 'Net Payable']);
        }
    });

    document.getElementById("vendorDetails").addEventListener("blur", function () {
        // Check if the dropdown is not focused and its value is not selected
        if (!this.value) {
            // Set the dropdown to index 0 (default option)
            this.selectedIndex = 0;
        }
    });

    document.getElementById("profitLoss").addEventListener("click", function () {
        currentButtonName = 'Inventory_Profit_Loss_Report';
        createAndFetchTable('/inventory/profit_loss', 'profitLossTableBody', displayProfitLoss, ['Item Type', 'Total Purchase Price', 'Total Selling Price', 'Total Profit']);
    });

    function createAndFetchTable(url, tableBodyId, displayFunction, headers) {

        const table = document.createElement('table');
        table.classList.add('styled-table');
        const tbody = document.createElement('tbody');
        tbody.id = tableBodyId;
        table.appendChild(tbody);

        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        headers.forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.insertBefore(thead, tbody);

        const tableContainer = document.getElementById('table-container');
        tableContainer.innerHTML = '';
        tableContainer.appendChild(table);

        fetch(url)
            .then(response => response.json())
            .then(data => displayFunction(data))
            .catch(error => console.error('Error:', error));

        const overlay = document.getElementById('purchaseReportsOverlay');
        overlay.style.display = 'block';
    }

    // Function to Display Vendor Summary Table //

    function displayVendors(data) {
        const vendorTableBody = document.getElementById('vendorTablesummaryBody');
        if (!vendorTableBody) return console.error('Error: vendorTablesummaryBody not found');

        let totalNetPayable = 0;
        let totalPaidTillNow = 0;
        let totalBalance = 0;

        vendorTableBody.innerHTML = '';

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

            totalNetPayable += parseFloat(detail.net_payable) || 0;
            totalPaidTillNow += parseFloat(detail.paid_till_now) || 0;
            totalBalance += parseFloat(detail.balance) || 0;
        });

        const totalRow = document.createElement('tr');
        totalRow.innerHTML = `
                <td></td>
                <td style="border-left: 4px solid #2C3E50; border-top: 4px solid #2C3E50; border-bottom: 4px solid #2C3E50;"><strong>Total:</strong></td>
                <td style="border-right: none; border-top: 4px solid #2C3E50; border-bottom: 4px solid #2C3E50;"><strong>${totalNetPayable}</strong></td>
                <td style="border-right: none; border-top: 4px solid #2C3E50; border-bottom: 4px solid #2C3E50;"><strong>${totalPaidTillNow}</strong></td>
                <td style="border-right: 4px solid #2C3E50; border-top: 4px solid #2C3E50; border-bottom: 4px solid #2C3E50;"><strong>${totalBalance}</strong></td>
            `;
        vendorTableBody.appendChild(totalRow);
    }

    // Function to Display Vendor Details Table //

    function displayVendorDetails(data) {
        const vendorDetailsTableBody = document.getElementById('vendorDetailsTableBody');
        if (!vendorDetailsTableBody) return console.error('Error: vendorDetailsTableBody not found');
        vendorDetailsTableBody.innerHTML = '';

        let totalOrderedPrice = 0;
        let totalReturnedPrice = 0;
        let totalNetPayable = 0;

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

            totalOrderedPrice += parseFloat(detail.ordered_price) || 0;
            totalReturnedPrice += parseFloat(detail.returned_price) || 0;
            totalNetPayable += parseFloat(detail.net_payable) || 0;
        });

        const totalRow = document.createElement('tr');
        totalRow.innerHTML = `
            <td colspan="5"></td>
            <td colspan="1" style="text-align: center; border-right: none; border-left: 4px solid #2C3E50; border-top: 4px solid #2C3E50; border-bottom: 4px solid #2C3E50;"><strong>Total :</strong></td>
            <td style="border-right: none; border-top: 4px solid #2C3E50; border-bottom: 4px solid #2C3E50;"><strong>${totalOrderedPrice}</strong></td>
            <td style="border-right: none; border-top: 4px solid #2C3E50; border-bottom: 4px solid #2C3E50;"><strong>${totalReturnedPrice}</strong></td>
            <td style="border-right: 4px solid #2C3E50; border-top: 4px solid #2C3E50; border-bottom: 4px solid #2C3E50;"><strong>${totalNetPayable}</strong></td>
        `;
        vendorDetailsTableBody.appendChild(totalRow);
    }


    // Function to Profit Loss Table //
    function displayProfitLoss(data) {
        const profitLossTableBody = document.getElementById('profitLossTableBody');
        if (!profitLossTableBody) return console.error('Error: profitLossTableBody not found');

        let totalPurchasePrice = 0;
        let totalSellingPrice = 0;
        let totalProfit = 0;

        profitLossTableBody.innerHTML = ''; // Clear the existing table body

        const rows = [
            { type: 'Books', details: data.books },
            { type: 'Uniforms', details: data.uniforms }
        ];

        rows.forEach(rowData => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${rowData.type}</td>
                <td>${rowData.details.total_purchase_price}</td>
                <td>${rowData.details.total_selling_price}</td>
                <td>${rowData.details.total_profit}</td>
            `;
            profitLossTableBody.appendChild(row);

            totalPurchasePrice += parseFloat(rowData.details.total_purchase_price) || 0;
            totalSellingPrice += parseFloat(rowData.details.total_selling_price) || 0;
            totalProfit += parseFloat(rowData.details.total_profit) || 0;
        });

        const totalRow = document.createElement('tr');
        totalRow.innerHTML = `
            <td style= "border: 4px solid #2C3E50; border-right: none;"><strong>Total:</strong></td>
            <td style="border-right: none; border-top: 4px solid #2C3E50; border-bottom: 4px solid #2C3E50;"><strong>${totalPurchasePrice}</strong></td>
            <td style="border-right: none; border-top: 4px solid #2C3E50; border-bottom: 4px solid #2C3E50;"><strong>${totalSellingPrice}</strong></td>
            <td style="border-right: 4px solid #2C3E50; border-top: 4px solid #2C3E50; border-bottom: 4px solid #2C3E50;"><strong>${totalProfit}</strong></td>
        `;
        profitLossTableBody.appendChild(totalRow);
    }

    // Populate Vendor Details Dropdown  //

    /*fetch('/inventory/all_vendor')
        .then(response => response.json())
        .then(data => {
            const vendorDetails = document.getElementById('vendorDetails');
            data.forEach(item => {
                const option = document.createElement('option');
                option.value = item.vendor_name;
                option.text = item.vendor_name;
                vendorDetails.appendChild(option);
            });
        });*/

    function populateVendorDetailsDropdown() {
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
            })
            .catch(error => console.error('Error:', error));
    }



    document.getElementById('closeOverlayButton').addEventListener('click', closeOverlay);

    function closeOverlay(event) {
        const overlay = document.getElementById('purchaseReportsOverlay');
        overlay.style.display = 'none';
        resetOverlay(); // Reset the overlay state when closing
        displayAnimation();

    }

    // Function to RESET Overlay //

    function resetOverlay() {
        const tableContainer = document.getElementById('table-container');
        tableContainer.innerHTML = '';
        currentButtonName = '';

        const vendorDetailsDropdown = document.getElementById('vendorDetails');
        if (vendorDetailsDropdown) {
            vendorDetailsDropdown.selectedIndex = 0; // Reset dropdown to index 0
        }
    }

    // Function to recreate Lottie Animation on overlay reset //
    function displayAnimation() {
        const loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'loadingOverlayReport';
        loadingOverlay.classList.add('loading-overlay');

        const animationContainer = document.createElement('div');
        const script1 = document.createElement('script');
        script1.src = 'https://unpkg.com/@dotlottie/player-component@latest/dist/dotlottie-player.mjs';
        script1.type = 'module';

        const dotlottiePlayer1 = document.createElement('dotlottie-player');
        dotlottiePlayer1.setAttribute('src', 'https://lottie.host/7319098f-7e9e-40eb-8ffe-6c22f55e9d70/qNoQ09vbMn.json');
        dotlottiePlayer1.setAttribute('background', 'transparent');
        dotlottiePlayer1.setAttribute('speed', '1');
        dotlottiePlayer1.setAttribute('style', 'width: 300px; height: 300px;');
        dotlottiePlayer1.setAttribute('autoplay', 'true');
        dotlottiePlayer1.setAttribute('loop', 'true'); // Set loop manually

        animationContainer.appendChild(script1);
        animationContainer.appendChild(dotlottiePlayer1);
        loadingOverlay.appendChild(animationContainer);

        const emptyMessage = document.createElement('div');
        emptyMessage.id = 'emptyMessage';
        emptyMessage.classList.add('empty-message');

        const script2 = document.createElement('script');
        script2.src = 'https://unpkg.com/@dotlottie/player-component@latest/dist/dotlottie-player.mjs';
        script2.type = 'module';

        const dotlottiePlayer2 = document.createElement('dotlottie-player');
        dotlottiePlayer2.setAttribute('src', 'https://lottie.host/5d6fe6dc-d344-4b95-a6b4-17a5e01b88c8/2DhrGZVFGN.json');
        dotlottiePlayer2.setAttribute('background', 'transparent');
        dotlottiePlayer2.setAttribute('speed', '1');
        dotlottiePlayer2.setAttribute('style', 'width: 600px; height: 450px;');
        dotlottiePlayer2.setAttribute('autoplay', 'true');
        dotlottiePlayer2.setAttribute('loop', 'true'); // Set loop manually

        emptyMessage.appendChild(script2);
        emptyMessage.appendChild(dotlottiePlayer2);

        const tableContainer = document.getElementById('table-container');
        tableContainer.innerHTML = '';
        tableContainer.appendChild(loadingOverlay);
        tableContainer.appendChild(emptyMessage);
    }

    // Function to EXPORT TABLE //

    function exportToExcel(currentButtonName) {

        // Check table presence on screen

        const tableContainer = document.getElementById('table-container');
        if (!tableContainer || !tableContainer.getElementsByTagName('table')[0]) {
            showToast("Please select a table to export", "red");
            return; // Exit function
        }



        var htmlTable = document.getElementById('table-container').getElementsByTagName('table')[0];
        var csv = [];
        var rows = htmlTable.rows;

        var sums = [0, 0, 0];
        for (var i = 0; i < rows.length; i++) {
            var row = [], cols = rows[i].cells;
            for (var j = 0; j < cols.length; j++) {
                row.push(cols[j].innerText);
                if (j >= cols.length - 3) sums[j - (cols.length - 3)] += Number(cols[j].innerText) || 0;
            }
            csv.push(row.join(","));
        }

        csv.push("");
        var totalRow = Array(rows[0].cells.length).fill("");
        totalRow[totalRow.length - 4] = "Total:";
        totalRow[totalRow.length - 3] = sums[0];
        totalRow[totalRow.length - 2] = sums[1];
        totalRow[totalRow.length - 1] = sums[2];
        csv.push(totalRow.join(","));

        var csvContent = csv.join("\n");
        var downloadLink = document.createElement("a");
        downloadLink.href = 'data:text/csv;charset=utf-8,' + encodeURI(csvContent);
        downloadLink.download = currentButtonName + '.csv';

        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    }


});


// function refreshAllTables() {
//     document.getElementById("vendorSummary").click();
//     document.getElementById("profitLoss").click();
//     const vendorDetails = document.getElementById("vendorDetails");
//     if (vendorDetails.value) {
//         createAndFetchTable(`/inventory/vendors_details?vendor=${vendorDetails.value}`, 'vendorDetailsTableBody', displayVendorDetails, ['Vendor Name', 'Item Ordered', 'Purchase Price', 'Ordered Quantity', 'Returned Quantity', 'Items in Stock', 'Ordered Price', 'Returned Price', 'Net Payable']);
//     }
// }




