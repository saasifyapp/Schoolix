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

    // Reverse the data array
    data.reverse();

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





// Print Invoice //


/* function getInvoiceStyles() {
    // Define your CSS styles for the invoice here
    return `

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
}*/

/*
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
}*/



async function printInvoice(invoiceNo) {
    try {
        showSearchInventoryLoadingAnimation();
        const response = await fetch(`/get_invoice/${invoiceNo}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch invoice details: ${response.status} ${response.statusText}`);
        }
        const invoiceData = await response.json();

        // Populate invoice details in HTML
        populateInvoiceDetails(invoiceData);

        // After successful population, open print window
        printInvoiceWindow();
    } catch (error) {
        hideSearchInventoryLoadingAnimation();
        console.error('Error generating bill:', error);
        // Handle error as needed (e.g., show error message to user)
    }
}

function populateInvoiceDetails(invoiceData) {
    // Populate invoice header
    document.getElementById('invoiceNumberDisplay').textContent = `Invoice No: #${invoiceData.invoiceDetails.invoiceNo}`;

    // Populate buyer details
    const buyerDetailsList = document.querySelector('.buyer-details-list');
    buyerDetailsList.innerHTML = `
        <li>${invoiceData.invoiceDetails.buyerName}</li>
        <li>${invoiceData.invoiceDetails.buyerPhone}</li>
        <li>${invoiceData.invoiceDetails.class_of_buyer}</li>
    `;

    // Extract the date part (YYYY-MM-DD) from the full date-time string
    const fullDate = new Date(invoiceData.invoiceDetails.billDate);
    const billDateFormatted = fullDate.toISOString().split('T')[0];

    // Populate the formatted date in the HTML element
    document.querySelector('.invoice-details-list .item .value').textContent = billDateFormatted;

    // Determine invoice status based on paid_amount and balance_amount
    let invoiceStatusText = '';
    if (invoiceData.invoiceDetails.paid_amount === 0) {
        invoiceStatusText = 'Unpaid';
    } else if (invoiceData.invoiceDetails.balance_amount !== 0) {
        invoiceStatusText = 'Balance';
    } else {
        invoiceStatusText = 'Paid';
    }

    // Populate invoice status in the HTML
    document.querySelectorAll('.invoice-details-list .item .value')[1].textContent = invoiceStatusText;

    // Populate bill items table
    const billTableBody = document.getElementById('billTableBody');
    billTableBody.innerHTML = ''; // Clear previous items

    invoiceData.invoiceItems.forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="padding: 8px; border: 1px solid #dee2e6;">${index + 1}</td>
            <td style="padding: 8px; border: 1px solid #dee2e6;">${item.item_name}</td>
            <td style="padding: 8px; border: 1px solid #dee2e6;">${item.purchase_price.toFixed(2)}</td>
            <td style="padding: 8px; border: 1px solid #dee2e6;">${item.quantity}</td>
            <td style="padding: 8px; border: 1px solid #dee2e6;">${item.total.toFixed(2)}</td>
        `;
        billTableBody.appendChild(row);
    });

    // Populate total amounts
    document.getElementById('totalAmountDisplay').textContent = invoiceData.invoiceDetails.total_payable.toFixed(2);
    document.getElementById('amountPaidDisplay').textContent = invoiceData.invoiceDetails.paid_amount.toFixed(2);
    document.getElementById('balanceAmountDisplay').textContent = invoiceData.invoiceDetails.balance_amount.toFixed(2);
}


function printInvoiceWindow() {
    // Open a new window for printing
    const printWindow = window.open('', '_blank');
    printWindow.document.write('<html><head><title>Print Invoice</title>');

    // Include external CSS files
    printWindow.document.write('<link href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" rel="stylesheet">');
    printWindow.document.write('<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">');
    printWindow.document.write('<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons/font/bootstrap-icons.css">');
    // // printWindow.document.write('<link rel="stylesheet" href="/css/Inventory_Css/searchInvoice.css">');
    // // // Include external JavaScript files
    printWindow.document.write('<script src="https://code.jquery.com/jquery-3.5.1.slim.min.js"></script>');
    printWindow.document.write('<script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.5.3/dist/umd/popper.min.js"></script>');
    printWindow.document.write('<script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>');
    // printWindow.document.write('<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/js/bootstrap.bundle.min.js" integrity="sha384-ENjdO4Dr2bkBIFxQpeoTz1HIcje39Wm4jDKdf19U8gI4ddQ3GYNS7NTKfAdVQSZe" crossorigin="anonymous"></script>');
    printWindow.document.write('<script src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js"></script>');
    // printWindow.document.write('<script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.9.2/html2pdf.bundle.min.js"></script>');
    // printWindow.document.write('<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.min.js"></script>');

    // printWindow.document.write('<link rel="preconnect" href="https://fonts.googleapis.com">');
    // printWindow.document.write('<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>');
    // printWindow.document.write(' <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">');


    // Append the HTML content of the invoice details container
    const invoiceDetailsHtml = document.getElementById('invoiceDetails').innerHTML;
    printWindow.document.write(invoiceDetailsHtml);

    // Close the HTML document
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    hideSearchInventoryLoadingAnimation();
    // Wait for content to load before printing
    printWindow.onload = function () {
        printWindow.focus();
        printWindow.print();
        // printWindow.close(); 
    };
}

// function printInvoiceWindow() {
//     hideSearchInventoryLoadingAnimation();
//    // Get the invoice details container
//    const invoiceDetails = document.getElementById('invoice');

//    // Define the options for html2pdf
//    const opt = {
//        margin: 0,
//        filename: 'invoice.pdf',
//        image: { type: 'jpeg', quality: 0.98 },
//        html2canvas: { scale: 2 },
//        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
//    };

//    // Adjust the scaling factor to fit content to one page
//    const contentHeight = invoiceDetails.scrollHeight;
//    const a4Height = 297; // A4 height in mm
//    const scaleFactor = a4Height / (contentHeight * 0.264583); // Convert px to mm

//    // Apply CSS transform to scale the content
//    invoiceDetails.style.transform = `scale(${scaleFactor})`;
//    invoiceDetails.style.transformOrigin = 'top left';
//    invoiceDetails.style.width = `calc(210mm / ${scaleFactor})`;
//    invoiceDetails.style.height = `calc(297mm / ${scaleFactor})`;

//    // Generate the PDF
//    html2pdf().from(invoiceDetails).set(opt).outputPdf('blob').then(function (pdfBlob) {
//        // Reset the scaling after PDF generation
//        invoiceDetails.style.transform = '';
//        invoiceDetails.style.width = '';
//        invoiceDetails.style.height = '';

//        // Create a URL for the PDF blob
//        const pdfUrl = URL.createObjectURL(pdfBlob);

//        // Open the PDF in a new window
//        const pdfWindow = window.open(pdfUrl, '_blank');

//        // Add an event listener to trigger the print dialog once the PDF is loaded
//        pdfWindow.onload = function () {
//            pdfWindow.focus();
//            pdfWindow.print();

//            // If you want the print window to only show 1 page in print preview,
//            // you can customize the print window settings here.
//            // Some browsers might require a manual step for advanced settings.
//        };
//    });
// }




