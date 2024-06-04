let currentInvoice = null;

function refreshInvoiceData() {
    document.getElementById('searchBar').value = '';
    fetch('/inventory/invoices')
        .then(response => response.json())
        .then(data => {
            displayInvoices(data);
        })
        .catch(error => {
            console.error('Error:', error);
            // showToast('Error fetching invoices. Please try again.', true);
        });
}

function displayInvoices(data) {
    const invoiceTable = document.getElementById('invoiceTable');
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
                <button onclick="showUpdateModal('${invoice.invoiceNo}', '${invoice.total_payable}', '${invoice.paid_amount}', '${invoice.balance_amount}')">Update</button>
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

function searchInvoiceDetails() {
    // showLoadingAnimation();
  console.log("search")
    const searchTerm = document.getElementById('searchBar').value.trim();
  
    // Check if the search term is empty
    if (searchTerm === '') {
      // alert('Please enter a search term.');
      // showToast('Please enter a search term.', true);
      refreshInvoiceData();
      // hideLoadingAnimation();
      return;
    }
  
    // Build the search URL based on data type
    let searchUrl = `/inventory/searchinvoices?`;
    if (isNaN(searchTerm)) {
      // Search by string (invoice number or buyer name)
      searchUrl += `search=${encodeURIComponent(searchTerm)}`;
    } else {
      // Search by number (invoice number)
      searchUrl += `invoiceNo=${searchTerm}`;
    }
  
    // Fetch data from the server based on the search term
    fetch(searchUrl)
      .then(response => response.json())
      .then(data => {
        const invoiceTable = document.getElementById('invoiceTable');
        invoiceTable.innerHTML = ''; // Clear previous data
  
        if (data.length === 0) {
          // If no results found, display a message
          const noResultsRow = document.createElement('tr');
          noResultsRow.innerHTML = '<td colspan="6">No results found</td>';
          invoiceTable.appendChild(noResultsRow);
        } else {
          // Append invoice data to the table
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
              <td>${invoice.total_payable}</td>
              <td>${invoice.paid_amount}</td>
              <td>${invoice.balance_amount}</td>
              <td>${invoice.mode_of_payment}</td>
              <td>
                <button onclick="showUpdateModal('${invoice.invoiceNo}', '${invoice.total_payable}', '${invoice.paid_amount}', '${invoice.balance_amount}')">Update</button>
                <button onclick="printInvoice(${invoice.invoiceNo})">Print</button>
                <button onclick="deleteInvoice(${invoice.invoiceNo})">Delete</button>
              </td>
            `;
            invoiceTable.appendChild(row);
          });
        }
        // addFadeUpAnimation();
        // hideLoadingAnimation();
      })
      .catch(error => console.error('Error:', error));
  }
  
  function deleteInvoice(invoiceNo) {
    const confirmation = confirm(`Are you sure you want to delete the Invoice No: "${invoiceNo}"?`);
    if (confirmation) {
        // showLoadingAnimation();
        fetch(`/inventory/deleteInvoice?name=${encodeURIComponent(invoiceNo)}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to delete invoice.');
            }
            // hideLoadingAnimation();
            console.log('Invoice deleted successfully.');
            refreshInvoiceData(); // Refresh data after removing the invoice
        })
        .catch(error => {
            console.error('Error deleting invoice:', error);
            // hideLoadingAnimation();
            // showToast('An error occurred while deleting the invoice.', true); 
        });
    }
}



function showUpdateModal(invoiceNo, totalAmount, paidAmount, balanceAmount) {
    currentInvoice = { invoiceNo, totalAmount: parseFloat(totalAmount), paidAmount: parseFloat(paidAmount), balanceAmount: parseFloat(balanceAmount) };

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

    const updatedBalance = currentInvoice.balanceAmount - newPaidAmount;
    document.getElementById('modalBalanceAmount').value = updatedBalance;
}

function submitUpdatedAmount() {
    const newPaidAmount = parseFloat(document.getElementById('modalNewPaidAmount').value);
    if (isNaN(newPaidAmount)) {
        alert('Please enter a valid paid amount.');
        return;
    }

    const newTotalPaidAmount = currentInvoice.paidAmount + newPaidAmount;
    const newBalanceAmount = currentInvoice.totalAmount - newTotalPaidAmount;

    fetch('/inventory/updatePaidAmount', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            invoiceNo: currentInvoice.invoiceNo, 
            paidAmount: newTotalPaidAmount, 
            balanceAmount: newBalanceAmount 
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to update paid amount.');
        }
        console.log('Paid amount updated successfully.');
        refreshInvoiceData();
        closeModal();
    })
    .catch(error => {
        console.error('Error updating paid amount:', error);
        showToast('An error occurred while updating the paid amount.', true);
    });
}

function closeModal() {
    const modal = document.getElementById('updateModal');
    modal.style.display = "none";
}

// Initial data load
document.addEventListener('DOMContentLoaded', (event) => {
    refreshInvoiceData();
});

// Close modal when clicking outside of it
window.onclick = function(event) {
    const modal = document.getElementById('updateModal');
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

// Close modal when clicking on the close button
document.querySelector('.close').onclick = function() {
    closeModal();
}


