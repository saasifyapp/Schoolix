document.getElementById('searchTransactionButton').addEventListener('click', function() {
    const overlay = document.getElementById('searchTransactionOverlay');
    overlay.style.display = 'block';

    // Fetch transactions
    fetch('/library/search_transactions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ searchInput: '' }) // Empty string to fetch all transactions
    })
    .then(response => response.json())
    .then(data => {
        console.log('Response data:', data); // Log the response data to the console

        if (data.error) {
            alert(data.error);
        } else {
            const issueTableBody = document.getElementById('issueTableBody');
            const returnTableBody = document.getElementById('returnTableBody');

            issueTableBody.innerHTML = ''; // Clear existing rows
            returnTableBody.innerHTML = ''; // Clear existing rows

            data.issueTransactions.forEach(transaction => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${transaction.transaction_id}</td>
                    <td>${transaction.memberID}</td>
                    <td>${transaction.bookID}</td>
                    <td>${transaction.transaction_date}</td>
                    <td><button class="delete-button" data-id="${transaction.transaction_id}" data-type="issue">Delete</button></td>
                `;
                issueTableBody.appendChild(row);
            });

            data.returnTransactions.forEach(transaction => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${transaction.transaction_id}</td>
                    <td>${transaction.memberID}</td>
                    <td>${transaction.bookID}</td>
                    <td>${transaction.transaction_date}</td>
                    <td><button class="delete-button" data-id="${transaction.transaction_id}" data-type="return">Delete</button></td>
                `;
                returnTableBody.appendChild(row);
            });

            // Add event listeners to delete buttons
            document.querySelectorAll('.delete-button').forEach(button => {
                button.addEventListener('click', handleDelete);
            });
        }
    })
    .catch(error => {
        console.error('Error fetching transactions:', error);
        alert('Error fetching transactions');
    });
});

function handleDelete(event) {
    const button = event.target;
    const transactionId = button.getAttribute('data-id');
    const transactionType = button.getAttribute('data-type');

    if (confirm('Are you sure you want to delete this transaction?')) {
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
                alert(data.error);
            } else {
                alert(data.message);
                // Optionally, refresh the transaction list
                document.getElementById('searchTransactionButton').click();
            }
        })
        .catch(error => {
            console.error('Error deleting transaction:', error);
            alert('Error deleting transaction');
        });
    }
}

// Handle closing the overlay
document.getElementById('closeSearchTransactionOverlay').addEventListener('click', function() {
    const overlay = document.getElementById('searchTransactionOverlay');
    overlay.style.display = 'none';

    // Clear the tables
    const issueTableBody = document.getElementById('issueTableBody');
    const returnTableBody = document.getElementById('returnTableBody');
    issueTableBody.innerHTML = ''; // Clear existing rows
    returnTableBody.innerHTML = ''; // Clear existing rows
});