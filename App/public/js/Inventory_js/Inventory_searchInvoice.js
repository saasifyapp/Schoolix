let currentInvoice = null; 

// Function to show the loading animation
function showSearchInventoryLoadingAnimation() {
    var loadingOverlay = document.getElementById("loadingOverlaySearchinventory");
    loadingOverlay.style.display = "flex"; // Hide the loading overlay
}

// Function to hide the loading animation
function hideSearchInventoryLoadingAnimation() {
    var loadingOverlay = document.getElementById("loadingOverlaySearchinventory");
    loadingOverlay.style.display = "none"; // Hide the loading overlay
}
async function refreshInvoiceData() {
    showSearchInventoryLoadingAnimation();
    const invoiceTable = document.getElementById('invoiceTable');
    invoiceTable.innerHTML = ''; // Clear previous data
    document.getElementById('searchBar').value = '';
    document.getElementById('classFilter').value = '';
    try {
        const response = await fetch('/inventory/invoices');
        const data = await response.json();
        if (data.length === 0) {
            hideSearchInventoryLoadingAnimation();
            const noResultsRow = document.createElement('tr');
            noResultsRow.innerHTML = '<td colspan="10">No results found</td>';
            invoiceTable.appendChild(noResultsRow);
        } else {
        displayInvoices(data);
        }
    } catch (error) {
        console.error('Error:', error);
        // showToast('Error fetching invoices. Please try again.', true);
    }
}

function displayInvoices(data) {
    const invoiceTable = document.getElementById('invoiceTable');
    invoiceTable.innerHTML = ''; // Clear previous data

    try {
        data.forEach(invoice => {
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
                <td>${invoice.class_of_buyer}</td>
                <td>${invoice.total_payable}</td>
                <td>${invoice.paid_amount}</td>
                <td>${invoice.balance_amount}</td>
                <td>${invoice.mode_of_payment}</td>
                <td>
                <div class="button-container" style="display: flex; justify-content: center; gap: 20px;">
                <button style="background-color: transparent;
                            border: none;
                            color: black; /* Change text color to black */
                            padding: 0;
                            text-align: center;
                            text-decoration: none;
                            display: flex; /* Use flex for centering */
                            align-items: center; /* Center vertically */
                            justify-content: center; /* Center horizontally */
                            font-size: 14px;
                            cursor: pointer;
                            max-height: 100%;
                            border-radius: 20px; /* Round corners */
                            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Add shadow */
                            transition: transform 0.2s, box-shadow 0.2s; /* Transition for transform and box-shadow */
                            margin-bottom: 10px;" /* Added margin bottom for spacing */
                    onclick="showUpdateModal('${invoice.invoiceNo}', '${invoice.total_payable}', '${invoice.paid_amount}', '${invoice.balance_amount}', '${invoice.buyerName}')"
                    onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';"
                    onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';">
                    <img src="/images/update.png" alt="Edit" style="width: 25px; height: 25px; border-radius: 0px; margin: 5px;">
                    <span style="margin-right: 10px;">Update</span>
                </button>
            
                <button style="background-color: transparent;
                            border: none;
                            color: black; /* Change text color to black */
                            padding: 0;
                            text-align: center;
                            text-decoration: none;
                            display: flex; /* Use flex for centering */
                            align-items: center; /* Center vertically */
                            justify-content: center; /* Center horizontally */
                            font-size: 14px;
                            cursor: pointer;
                            max-height: 100%;
                            border-radius: 20px; /* Round corners */
                            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Add shadow */
                            transition: transform 0.2s, box-shadow 0.2s; /* Transition for transform and box-shadow */
                            margin-bottom: 10px;" /* Added margin bottom for spacing */
                    onclick="printInvoice(${invoice.invoiceNo})"
                    onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';"
                    onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';">
                    <img src="/images/printer.gif" alt="Print" style="width: 25px; height: 25px; border-radius: 0px; margin: 5px;">
                    <span style="margin-right: 10px;">Print</span>
                </button>
            
                <button style="background-color: transparent;
                            border: none;
                            color: black; /* Change text color to black */
                            padding: 0;
                            text-align: center;
                            text-decoration: none;
                            display: flex; /* Use flex for centering */
                            align-items: center; /* Center vertically */
                            justify-content: center; /* Center horizontally */
                            font-size: 14px;
                            cursor: pointer;
                            max-height: 100%;
                            border-radius: 20px; /* Round corners */
                            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Add shadow */
                            transition: transform 0.2s, box-shadow 0.2s; /* Transition for transform and box-shadow */
                            margin-bottom: 10px;" /* Added margin bottom for spacing */
                    onclick="deleteInvoice(${invoice.invoiceNo})"
                    onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';"
                    onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';">
                    <img src="/images/deletebill.png" alt="Delete" style="width: 25px; height: 25px; border-radius: 0px; margin: 5px;">
                    <span style="margin-right: 10px;">Delete</span>
                </button>
            </div>
            
                </td>
            `;
            invoiceTable.appendChild(row);
            hideSearchInventoryLoadingAnimation();
        });
    } catch (error) {
        hideSearchInventoryLoadingAnimation();
        console.error('Error displaying invoices:', error);
        showToast('Error displaying invoices. Please try again.', true);
    }
}

async function searchInvoiceDetails() {
    const searchTerm = document.getElementById('searchBar').value.trim();

    if (searchTerm === '') {
        // showToast("Please enter a search term", true)
        refreshInvoiceData();
        return;
    }

    let searchUrl = `/inventory/searchinvoices?`;
    if (isNaN(searchTerm)) {
        searchUrl += `search=${encodeURIComponent(searchTerm)}`;
    } else {
        searchUrl += `invoiceNo=${searchTerm}`;
    }

    try {
        const response = await fetch(searchUrl);
        const data = await response.json();

        const invoiceTable = document.getElementById('invoiceTable');
        invoiceTable.innerHTML = '';

        if (data.length === 0) {
            const noResultsRow = document.createElement('tr');
            noResultsRow.innerHTML = '<td colspan="10">No results found</td>';
            invoiceTable.appendChild(noResultsRow);
        } else {
            data.forEach(invoice => {
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
                    <td>${invoice.class_of_buyer}</td>
                    <td>${invoice.total_payable}</td>
                    <td>${invoice.paid_amount}</td>
                    <td>${invoice.balance_amount}</td>
                    <td>${invoice.mode_of_payment}</td>
                    <td>
                <div class="button-container" style="display: flex; justify-content: center; gap: 20px;">
                <button style="background-color: transparent;
                            border: none;
                            color: black; /* Change text color to black */
                            padding: 0;
                            text-align: center;
                            text-decoration: none;
                            display: flex; /* Use flex for centering */
                            align-items: center; /* Center vertically */
                            justify-content: center; /* Center horizontally */
                            font-size: 14px;
                            cursor: pointer;
                            max-height: 100%;
                            border-radius: 20px; /* Round corners */
                            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Add shadow */
                            transition: transform 0.2s, box-shadow 0.2s; /* Transition for transform and box-shadow */
                            margin-bottom: 10px;" /* Added margin bottom for spacing */
                    onclick="showUpdateModal('${invoice.invoiceNo}', '${invoice.total_payable}', '${invoice.paid_amount}', '${invoice.balance_amount}', '${invoice.buyerName}')"
                    onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';"
                    onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';">
                    <img src="/images/update.png" alt="Edit" style="width: 25px; height: 25px; border-radius: 0px; margin: 5px; mix-blend-mode: multiply; /* Add this property */">
                    <span style="margin-right: 10px;">Update</span>
                </button>
            
                <button style="background-color: transparent;
                            border: none;
                            color: black; /* Change text color to black */
                            padding: 0;
                            text-align: center;
                            text-decoration: none;
                            display: flex; /* Use flex for centering */
                            align-items: center; /* Center vertically */
                            justify-content: center; /* Center horizontally */
                            font-size: 14px;
                            cursor: pointer;
                            max-height: 100%;
                            border-radius: 20px; /* Round corners */
                            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Add shadow */
                            transition: transform 0.2s, box-shadow 0.2s; /* Transition for transform and box-shadow */
                            margin-bottom: 10px;" /* Added margin bottom for spacing */
                    onclick="printInvoice(${invoice.invoiceNo})"
                    onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';"
                    onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';">
                    <img src="/images/printer.gif" alt="Print" style="width: 25px; height: 25px; border-radius: 0px; margin: 5px; mix-blend-mode: multiply; /* Add this property */">
                    <span style="margin-right: 10px;">Print</span>
                </button>
            
                <button style="background-color: transparent;
                            border: none;
                            color: black; /* Change text color to black */
                            padding: 0;
                            text-align: center;
                            text-decoration: none;
                            display: flex; /* Use flex for centering */
                            align-items: center; /* Center vertically */
                            justify-content: center; /* Center horizontally */
                            font-size: 14px;
                            cursor: pointer;
                            max-height: 100%;
                            border-radius: 20px; /* Round corners */
                            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Add shadow */
                            transition: transform 0.2s, box-shadow 0.2s; /* Transition for transform and box-shadow */
                            margin-bottom: 10px;" /* Added margin bottom for spacing */
                    onclick="deleteInvoice(${invoice.invoiceNo})"
                    onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';"
                    onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';">
                    <img src="/images/deletebill.png" alt="Delete" style="width: 25px; height: 25px; border-radius: 0px; margin: 5px;mix-blend-mode: multiply; /* Add this property */">
                    <span style="margin-right: 10px;">Delete</span>
                </button>
            </div>
            
                </td>
                `;
                invoiceTable.appendChild(row);
            });
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('An error occurred while searching for invoices. Please try again.', true);
    }
}

async function deleteInvoice(invoiceNo) {
    const confirmation = confirm(`Are you sure you want to delete the Invoice No: "${invoiceNo}"?`);
    if (confirmation) {
        showSearchInventoryLoadingAnimation();
        try {
            const response = await fetch(`/inventory/deleteInvoice?name=${encodeURIComponent(invoiceNo)}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                throw new Error('Failed to delete invoice.');
                hideSearchInventoryLoadingAnimation();
            }
            hideSearchInventoryLoadingAnimation();
            console.log('Invoice deleted successfully.');
            showToast('Invoice deleted successfully.', false);
            refreshInvoiceData(); // Refresh data after removing the invoice
        } catch (error) {
            console.error('Error deleting invoice:', error);
            showToast('An error occurred while deleting the invoice.', true);
            hideSearchInventoryLoadingAnimation();
            // showToast('An error occurred while deleting the invoice.', true); 
        }
    }
}

function filterByClass() {
    // document.getElementById('searchField').value = '';
    const selectedClass = document.getElementById('classFilter').value;
    console.log(selectedClass)
    const invoiceDetailsContainer = document.getElementById('invoiceTable');
    showSearchInventoryLoadingAnimation();

    if (selectedClass === '') {
        // If no class selected, refresh data to show all students
        refreshData();
        return;
    }

    // Fetch data from the server filtered by class
    fetch(`/inventory/class/${selectedClass}`)
        .then(response => response.json())
        .then(data => {
            invoiceDetailsContainer.innerHTML = ''; // Clear previous data

            if (data.length === 0) {
                // If no results found, display a message
                invoiceDetailsContainer.innerHTML = '<tr><td colspan="10">No results found</td></tr>';
            } else {
                // Append student data to the table
                data.forEach(invoice => {
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
                        <td>${invoice.class_of_buyer}</td>
                        <td>${invoice.total_payable}</td>
                        <td>${invoice.paid_amount}</td>
                        <td>${invoice.balance_amount}</td>
                        <td>${invoice.mode_of_payment}</td>
                        <td>
                <div class="button-container" style="display: flex; justify-content: center; gap: 20px;">
                <button style="background-color: transparent;
                            border: none;
                            color: black; /* Change text color to black */
                            padding: 0;
                            text-align: center;
                            text-decoration: none;
                            display: flex; /* Use flex for centering */
                            align-items: center; /* Center vertically */
                            justify-content: center; /* Center horizontally */
                            font-size: 14px;
                            cursor: pointer;
                            max-height: 100%;
                            border-radius: 20px; /* Round corners */
                            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Add shadow */
                            transition: transform 0.2s, box-shadow 0.2s; /* Transition for transform and box-shadow */
                            margin-bottom: 10px;" /* Added margin bottom for spacing */
                    onclick="showUpdateModal('${invoice.invoiceNo}', '${invoice.total_payable}', '${invoice.paid_amount}', '${invoice.balance_amount}', '${invoice.buyerName}')"
                    onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';"
                    onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';">
                    <img src="/images/update.png" alt="Edit" style="width: 25px; height: 25px; border-radius: 0px; margin: 5px; mix-blend-mode: multiply; /* Add this property */">
                    <span style="margin-right: 10px;">Update</span>
                </button>
            
                <button style="background-color: transparent;
                            border: none;
                            color: black; /* Change text color to black */
                            padding: 0;
                            text-align: center;
                            text-decoration: none;
                            display: flex; /* Use flex for centering */
                            align-items: center; /* Center vertically */
                            justify-content: center; /* Center horizontally */
                            font-size: 14px;
                            cursor: pointer;
                            max-height: 100%;
                            border-radius: 20px; /* Round corners */
                            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Add shadow */
                            transition: transform 0.2s, box-shadow 0.2s; /* Transition for transform and box-shadow */
                            margin-bottom: 10px;" /* Added margin bottom for spacing */
                    onclick="printInvoice(${invoice.invoiceNo})"
                    onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';"
                    onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';">
                    <img src="/images/printer.gif" alt="Print" style="width: 25px; height: 25px; border-radius: 0px; margin: 5px; mix-blend-mode: multiply; /* Add this property */">
                    <span style="margin-right: 10px;">Print</span>
                </button>
            
                <button style="background-color: transparent;
                            border: none;
                            color: black; /* Change text color to black */
                            padding: 0;
                            text-align: center;
                            text-decoration: none;
                            display: flex; /* Use flex for centering */
                            align-items: center; /* Center vertically */
                            justify-content: center; /* Center horizontally */
                            font-size: 14px;
                            cursor: pointer;
                            max-height: 100%;
                            border-radius: 20px; /* Round corners */
                            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Add shadow */
                            transition: transform 0.2s, box-shadow 0.2s; /* Transition for transform and box-shadow */
                            margin-bottom: 10px;" /* Added margin bottom for spacing */
                    onclick="deleteInvoice(${invoice.invoiceNo})"
                    onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';"
                    onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';">
                    <img src="/images/deletebill.png" alt="Delete" style="width: 25px; height: 25px; border-radius: 0px; margin: 5px; mix-blend-mode: multiply; /* Add this property */">
                    <span style="margin-right: 10px;">Delete</span>
                </button>
            </div>
            
                </td>
                    `;
                    invoiceTable.appendChild(row);
                });
            }
            hideSearchInventoryLoadingAnimation();
        })
        .catch(error => console.error('Error:', error));
}


async function showUpdateModal(invoiceNo, totalAmount, paidAmount, balanceAmount, buyerName) {
    currentInvoice = { invoiceNo, totalAmount: parseFloat(totalAmount), paidAmount: parseFloat(paidAmount), balanceAmount: parseFloat(balanceAmount) };

    // Update modal heading
    const modalHeading = document.getElementById('modalHeading');
    modalHeading.innerHTML = `Invoice No: ${invoiceNo}&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;  Buyer: ${buyerName}`;


    document.getElementById('modalTotalAmount').value = totalAmount;
    document.getElementById('modalPaidAmount').value = paidAmount;
    document.getElementById('modalNewPaidAmount').value = '';
    document.getElementById('modalBalanceAmount').value = balanceAmount;

    const modal = document.getElementById('updateModal');
    modal.style.display = "block";
}

function calculateBalance() {
    const newPaidAmount = parseFloat(document.getElementById('modalNewPaidAmount').value);
    if (isNaN(newPaidAmount)) {
        document.getElementById('modalBalanceAmount').value = currentInvoice.balanceAmount;
        return;
    }

    const updatedBalance = currentInvoice.totalAmount - currentInvoice.paidAmount - newPaidAmount;
    document.getElementById('modalBalanceAmount').value = updatedBalance;
}

async function submitUpdatedAmount() {
    const newPaidAmount = parseFloat(document.getElementById('modalNewPaidAmount').value);
    if (isNaN(newPaidAmount)) {
        // alert('Please enter a valid paid amount.');
        showToast('Please enter a valid paid amount.', true);
        return;
    }

    const newTotalPaidAmount = currentInvoice.paidAmount + newPaidAmount;
    const newBalanceAmount = currentInvoice.totalAmount - newTotalPaidAmount;
 
    try {
        showSearchInventoryLoadingAnimation();
        const response = await fetch('/inventory/updatePaidAmount', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                invoiceNo: currentInvoice.invoiceNo,
                paidAmount: newTotalPaidAmount,
                balanceAmount: newBalanceAmount
            })
        });

        if (!response.ok) {
            throw new Error('Failed to update paid amount.');
        }
        hideSearchInventoryLoadingAnimation();
        console.log('Paid amount updated successfully.');
        showToast('Paid amount updated successfully.', false);
        refreshInvoiceData();
        closeModal();
    } catch (error) {
        hideSearchInventoryLoadingAnimation();
        console.error('Error updating paid amount:', error);
        showToast('An error occurred while updating the paid amount.', true);
    }
}

function closeModal() {
    const modal = document.getElementById('updateModal');
    modal.style.display = "none";
}

// Initial data load
refreshInvoiceData();


// Close modal when clicking outside of it
window.onclick = function (event) {
    const modal = document.getElementById('updateModal');
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

// // Close modal when clicking on the close button
// document.querySelector('.close').onclick = function () {
//     closeModal();
// }

// Print Invoice
async function printInvoice(invoiceNo) {
    try {
        const response = await fetch(`/print-invoice/${invoiceNo}`);
        const invoiceData = await response.json();
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`<html><head><title>Invoice #${invoiceNo}</title><style>${getInvoiceStyles()}</style></head><body>${constructInvoiceHTML(invoiceData)}</body></html>`);
        printWindow.document.close();
        printWindow.print();
    } catch (error) {
        console.error('Error printing invoice:', error);
    }
}

function getInvoiceStyles() {
    // Define your CSS styles for the invoice here
    return `
        /* Example styles */
        body { font-family: Arial, sans-serif; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; }
        th { background-color: #f2f2f2; }
        .text-center { text-align: center; }
    `;
}

function constructInvoiceHTML(invoiceData) {
    // Construct HTML for displaying invoice data
    let html = `
        <div class="page-header text-blue-d2">
            <h1 class="page-title text-secondary-d1">Invoice <small class="page-info"><i class="fa fa-angle-double-right text-80"></i> ID: #${invoiceData.invoiceNo}</small></h1>
        </div>
        <div class="container px-0">
            <!-- Invoice data here -->
        </div>
    `;

    // Add more HTML content using invoiceData
    return html;
}

function showToast(message, isError) {
    const toastContainer = document.getElementById("toast-container");

    // Create a new toast element
    const toast = document.createElement("div");
    toast.classList.add("toast");
    if (isError) {
        toast.classList.add("error");
    }
    toast.textContent = message;

    // Append the toast to the container
    toastContainer.appendChild(toast);

    // Show the toast
    toast.style.display = 'block';

    // Remove the toast after 4 seconds
    setTimeout(function () {
        toast.style.animation = 'slideOutRight 0.5s forwards';
        toast.addEventListener('animationend', function () {
            toast.remove();
        });
    }, 4000);
}

 ////////////////////////////// EXPORT TO EXCEL //////////////////////////////////////////////



 function exportToExcel() {

    const selectedClass = document.getElementById('classFilter').value;

    var htmlTable = document.getElementById('invoiceTable');
    var html = htmlTable.outerHTML;

    // Generate a temporary download link
    var downloadLink = document.createElement("a");
    document.body.appendChild(downloadLink);

    // CSV representation of the HTML table
    var csv = [];
    var rows = htmlTable.rows;
    for (var i = 0; i < rows.length; i++) {
        var row = [], cols = rows[i].cells;
        for (var j = 0; j < cols.length - 1; j++)
            row.push(cols[j].innerText);
        csv.push(row.join(","));
    }

    // Convert to CSV string
    var csvContent = csv.join("\n");

    // Set CSV as href and download attributes
    downloadLink.href = 'data:text/csv;charset=utf-8,' + encodeURI(csvContent);

    if (selectedClass == '') {
        downloadLink.download = 'All Invoice Reports.csv';
    }
    else {
        downloadLink.download = selectedClass + ' Invoice Reports.csv';
    }

    // Trigger the download
    downloadLink.click();
}