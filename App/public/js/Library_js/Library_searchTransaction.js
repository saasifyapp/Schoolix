
let transactionData = {
    issueTransactions: [],
    returnTransactions: []
};

document.getElementById('searchTransactionButton').addEventListener('click', function () {
    const overlay = document.getElementById('searchTransactionOverlay');
    overlay.style.display = 'flex';
    refreshTransactionData();
});

async function refreshTransactionData() {
    document.getElementById("searchTransactionInput").value = '';
    try {
        showLibraryLoadingAnimation();
        const response = await fetch('/library/search_transactions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ searchInput: '' }) // Empty string to fetch all transactions
        });

        const data = await response.json();
        console.log('Response data:', data); // Log the response data to the console

        if (data.error) {
            hidelibraryLoadingAnimation();
            showBigToast(data.error);
        } else {
            hidelibraryLoadingAnimation();
            storeTransactionData(data);
            displayTransactionData(transactionData);
        }
    } catch (error) {
        hidelibraryLoadingAnimation();
        console.error('Error fetching transactions:', error);
        showToast('Error fetching transactions', true);
    }
}

function storeTransactionData(data) {
    transactionData.issueTransactions = data.issueTransactions;
    transactionData.returnTransactions = data.returnTransactions;
}

function displayTransactionData(data) {
    const issueTableBody = document.getElementById('issueTableBody');
    const returnTableBody = document.getElementById('returnTableBody');
    

    data.issueTransactions.reverse();
    data.returnTransactions.reverse();

    // Clear existing rows
    issueTableBody.innerHTML = '';
    returnTableBody.innerHTML = '';

    // Display issue transactions
    if (data.issueTransactions.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="5" style="text-align: center;">No results found</td>';
        issueTableBody.appendChild(row);
    } else {
        data.issueTransactions.forEach(transaction => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${transaction.transaction_id}</td>
                <td>${transaction.memberID}</td>
                <td>${transaction.bookID}</td>
                <td>${transaction.transaction_date}</td>
                <td><button style="background-color: transparent;
                    border: none;
                    color: black;
                    padding: 0;
                    text-align: center;
                    text-decoration: none;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    cursor: pointer;
                    max-height: 100%;
                    border-radius: 20px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                    transition: transform 0.2s, box-shadow 0.2s;
                    margin-bottom: 10px;"
                    data-id="${transaction.transaction_id}" data-type="issue"
                    onclick="deleteTransaction(event)"
                    onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';"
                    onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';">
                    <img src="../images/delete_vendor.png" alt="Delete" style="width: 25px; height: 25px; border-radius: 0px; margin: 5px;">
                    <span style="margin-right: 10px;">Delete</span>
                </button></td>
            `;
            issueTableBody.appendChild(row);
        });
    }

    // Display return transactions
    if (data.returnTransactions.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="5" style="text-align: center;">No results found</td>';
        returnTableBody.appendChild(row);
    } else {
        data.returnTransactions.forEach(transaction => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${transaction.transaction_id}</td>
                <td>${transaction.memberID}</td>
                <td>${transaction.bookID}</td>
                <td>${transaction.transaction_date}</td>
                <td><button style="background-color: transparent;
                    border: none;
                    color: black;
                    padding: 0;
                    text-align: center;
                    text-decoration: none;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    cursor: pointer;
                    max-height: 100%;
                    border-radius: 20px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                    transition: transform 0.2s, box-shadow 0.2s;
                    margin-bottom: 10px;"
                    data-id="${transaction.transaction_id}" data-type="return"
                    onclick="deleteTransaction(event)"
                    onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';"
                    onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';">
                    <img src="../images/delete_vendor.png" alt="Delete" style="width: 25px; height: 25px; border-radius: 0px; margin: 5px;">
                    <span style="margin-right: 10px;">Delete</span>
                </button></td>
            `;
            returnTableBody.appendChild(row);
        });
    }
}


// function searchTransactionDetails() {
//     const searchTerm = document.getElementById("searchTransactionInput").value.trim().toLowerCase();
//     console.log(searchTerm);

//     // Check if the search term is empty
//     if (!searchTerm) {
//         displayTransactionData(transactionData); // Display all transactions
//         return;
//     }

//     // Filter the issue transactions based on the search term
//     const filteredIssueTransactions = transactionData.issueTransactions.filter(transaction =>
//         String(transaction.transaction_id).toLowerCase().includes(searchTerm) ||
//         String(transaction.bookID).toLowerCase().includes(searchTerm) ||
//         String(transaction.memberID).toLowerCase().includes(searchTerm)
//     );

//     // Filter the return transactions based on the search term
//     const filteredReturnTransactions = transactionData.returnTransactions.filter(transaction =>
//         String(transaction.transaction_id).toLowerCase().includes(searchTerm) ||
//         String(transaction.bookID).toLowerCase().includes(searchTerm) ||
//         String(transaction.memberID).toLowerCase().includes(searchTerm)
//     );

//     // Display the filtered data
//     displayTransactionData({
//         issueTransactions: filteredIssueTransactions,
//         returnTransactions: filteredReturnTransactions
//     });

//     // Check if no results were found
//     if (filteredIssueTransactions.length === 0 && filteredReturnTransactions.length === 0) {
//         const issueTableBody = document.getElementById("issueTableBody");
//         const returnTableBody = document.getElementById("returnTableBody");

//         issueTableBody.innerHTML = '<tr><td colspan="5">No results found</td></tr>';
//         returnTableBody.innerHTML = '<tr><td colspan="5">No results found</td></tr>';
//     }
// }

function searchTransactionDetails() {
    const searchTerm = document.getElementById("searchTransactionInput").value.trim();
    console.log(searchTerm);

    // Check if the search term is empty
    if (!searchTerm) {
        displayTransactionData(transactionData); // Display all transactions
        return;
    }

    let filteredIssueTransactions = [];
    let filteredReturnTransactions = [];

    // Determine the type of search based on the search term
    if (/^\d+$/.test(searchTerm)) {
        // Search by transaction_id if the search term is a number
        filteredIssueTransactions = transactionData.issueTransactions.filter(transaction =>
            String(transaction.transaction_id).includes(searchTerm)
        );

        filteredReturnTransactions = transactionData.returnTransactions.filter(transaction =>
            String(transaction.transaction_id).includes(searchTerm)
        );
    } else if (searchTerm.toUpperCase().startsWith("M")) {
        // Search by memberID if the search term starts with "M"
        filteredIssueTransactions = transactionData.issueTransactions.filter(transaction =>
            String(transaction.memberID).toLowerCase().includes(searchTerm.toLowerCase())
        );

        filteredReturnTransactions = transactionData.returnTransactions.filter(transaction =>
            String(transaction.memberID).toLowerCase().includes(searchTerm.toLowerCase())
        );
    } else if (searchTerm.toUpperCase().startsWith("B")) {
        // Search by bookID if the search term starts with "B"
        filteredIssueTransactions = transactionData.issueTransactions.filter(transaction =>
            String(transaction.bookID).toLowerCase().includes(searchTerm.toLowerCase())
        );

        filteredReturnTransactions = transactionData.returnTransactions.filter(transaction =>
            String(transaction.bookID).toLowerCase().includes(searchTerm.toLowerCase())
        );
    } else {
        // Search all fields if the search term does not fit the above criteria
        filteredIssueTransactions = transactionData.issueTransactions.filter(transaction =>
            String(transaction.transaction_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
            String(transaction.bookID).toLowerCase().includes(searchTerm.toLowerCase()) ||
            String(transaction.memberID).toLowerCase().includes(searchTerm.toLowerCase())
        );

        filteredReturnTransactions = transactionData.returnTransactions.filter(transaction =>
            String(transaction.transaction_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
            String(transaction.bookID).toLowerCase().includes(searchTerm.toLowerCase()) ||
            String(transaction.memberID).toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

    // Display the filtered data
    displayTransactionData({
        issueTransactions: filteredIssueTransactions,
        returnTransactions: filteredReturnTransactions
    });

    // Check if no results were found
    if (filteredIssueTransactions.length === 0 ) {
        const issueTableBody = document.getElementById("issueTableBody");
        issueTableBody.innerHTML = '<tr><td colspan="5">No results found</td></tr>';

    } else if (filteredReturnTransactions.length === 0) {
        const returnTableBody = document.getElementById("returnTableBody");
        returnTableBody.innerHTML = '<tr><td colspan="5">No results found</td></tr>';
    }
}




function deleteTransaction(event) {
    const button = event.currentTarget;
    const transactionId = button.getAttribute('data-id');
    const transactionType = button.getAttribute('data-type');

    if (confirm('Are you sure you want to delete this transaction?')) {
        showLibraryLoadingAnimation();
        fetch('/library/delete_transaction', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ transactionId, transactionType })
        })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    hidelibraryLoadingAnimation();
                    showToast(data.error, true);
                } else {
                    hidelibraryLoadingAnimation();
                    showToast(data.message, false);
                    // Optionally, refresh the transaction list
                    document.getElementById('searchTransactionButton').click();
                }
            })
            .catch(error => {
                hidelibraryLoadingAnimation();
                console.error('Error deleting transaction:', error);
                showToast('Error deleting transaction', true);
            });
    }
}

// Handle closing the overlay
document.getElementById('closeSearchTransactionOverlay').addEventListener('click', function () {
    const overlay = document.getElementById('searchTransactionOverlay');
    overlay.style.display = 'none';

    // Clear the tables
    const issueTableBody = document.getElementById('issueTableBody');
    const returnTableBody = document.getElementById('returnTableBody');
    issueTableBody.innerHTML = ''; // Clear existing rows
    returnTableBody.innerHTML = ''; // Clear existing rows
});

function exportTransactionTable() {
    const issueTableBody = document.getElementById("issueTableBody");
    const returnTableBody = document.getElementById("returnTableBody");
    const issueTableHeaders = document.getElementById("issueTableHeaders");
    const returnTableHeaders = document.getElementById("returnTableHeaders");

    // Check if the tables are empty
    if (issueTableBody.children.length === 0 && returnTableBody.children.length === 0) {
        showToast("No results found to export.");
        return;
    }

    // Function to generate CSV from table headers and rows, excluding the last column
    function generateCSV(tableBody, tableHeaders) {
        let csv = [];

        // Add headers, excluding the last column
        const headers = Array.from(tableHeaders.querySelectorAll("th"))
            .map((th, index, array) => index === array.length - 1 ? null : th.innerText)
            .filter(text => text !== null);
        csv.push(headers.join(","));

        // Add rows, excluding the last column
        tableBody.querySelectorAll("tr").forEach(row => {
            const cells = Array.from(row.querySelectorAll("td"))
                .map((td, index, array) => index === array.length - 1 ? null : `"${td.innerText}"`)
                .filter(text => text !== null);
            csv.push(cells.join(","));
        });

        return csv.join("\n");
    }

    // Generate CSV data for both tables
    const issueCSV = generateCSV(issueTableBody, issueTableHeaders);
    const returnCSV = generateCSV(returnTableBody, returnTableHeaders);

    // Combine both CSV contents
    const combinedCSV = `Issue Transactions\n${issueCSV}\n\nReturn Transactions\n${returnCSV}`;

    // Create a blob and download the CSV file
    const blob = new Blob([combinedCSV], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");

    if (link.download !== undefined) { // feature detection
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "Library_transactions.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}