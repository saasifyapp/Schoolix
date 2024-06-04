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
        console.log(data)
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
                <button onclick="updateInvoice(${invoice.invoiceNo})">Update</button>
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
  
  function deleteInvoice(InvoiceNo) {
    const confirmation = confirm(`Are you sure you want to delete the Invoice No: "${InvoiceNo}"?`);
    if (confirmation) {
        // showLoadingAnimation();
        fetch(`/inventory/deleteInvoice?name=${encodeURIComponent(InvoiceNo)}`, {
            method: 'DELETE'
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to delete invoice.');
                }
                // hideLoadingAnimation();
                // showToast('Student deleted successfully.', false); // Show error toast
                // alert('Student removed successfully.'); // Log success message
                refreshInvoiceData(); // Refresh data after removing the teacher
            })
            .catch(error => {
                console.error('Error deleting invoice:', error);
                // hideLoadingAnimation();
                // showToast('An error occurred while removing the student.', true); // Show error toast
                // alert('An error occurred while removing the student.');
            });
    }
}


// Initial data load
document.addEventListener('DOMContentLoaded', (event) => {
    refreshInvoiceData();
});

