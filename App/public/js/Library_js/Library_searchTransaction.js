document.getElementById('searchTransactionForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const searchInput = document.getElementById('searchTransactionInput').value;

    fetch('/library/search_transactions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ searchInput })
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
                    <td>${transaction.enrollment_number}</td>
                    <td>${transaction.book_number}</td>
                    <td>${transaction.transaction_date}</td>
                    <td>${transaction.status}</td>
                `;
                issueTableBody.appendChild(row);
            });

            data.returnTransactions.forEach(transaction => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${transaction.transaction_id}</td>
                    <td>${transaction.enrollment_number}</td>
                    <td>${transaction.book_number}</td>
                    <td>${transaction.transaction_date}</td>
                    <td>${transaction.status}</td>
                `;
                returnTableBody.appendChild(row);
            });
        }
    })
    .catch(error => {
        console.error('Error fetching transactions:', error);
        alert('Error fetching transactions');
    });
});

// Handle closing the overlay
document.getElementById('closeSearchTransactionOverlay').addEventListener('click', function() {
    const overlay = document.getElementById('searchTransactionOverlay');
    overlay.style.display = 'none';

    // Clear the form and tables
    document.getElementById('searchTransactionForm').reset();
    const issueTableBody = document.getElementById('issueTableBody');
    const returnTableBody = document.getElementById('returnTableBody');
    issueTableBody.innerHTML = ''; // Clear existing rows
    returnTableBody.innerHTML = ''; // Clear existing rows
});