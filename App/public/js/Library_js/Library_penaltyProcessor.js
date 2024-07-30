

document.getElementById('openPenaltyProcessorOverlay').addEventListener('click', function() {
    document.getElementById('penaltyProcessorOverlay').style.display = 'flex';
    fetchPenaltyDetails();
});

document.getElementById('closePenaltyProcessorOverlay').addEventListener('click', function() {
    document.getElementById('penaltyProcessorOverlay').style.display = 'none';
});

function fetchPenaltyDetails() {
    fetch('/library/get_penalties', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
    })
    .then(response => response.json())
    .then(data => {
        const penaltyTableBody = document.getElementById('penaltyTableBody');
        penaltyTableBody.innerHTML = ''; // Clear existing rows

        data.penalties.forEach(penalty => {
            const row = document.createElement('tr');

            // Combine Member ID and Member Name
            const memberDetails = `${penalty.memberID} - ${penalty.member_name}`;

            // Combine Book ID and Book Name
            const bookDetails = `${penalty.bookID} - ${penalty.book_name}`;

            // Convert the return_date to IST before displaying
            const returnDateIST = formatDateToIST(penalty.return_date);

            row.innerHTML = `
                <td>${memberDetails}</td>
                <td>${penalty.member_contact}</td>
                <td>${bookDetails}</td>
                <td>${returnDateIST}</td>
                <td>${penalty.penalty_amount}</td>
                <td><button class="pay-penalty-button" data-transaction-id="${penalty.id}" data-penalty-amount="${penalty.penalty_amount}">Pay and Return</button></td>
            `;

            penaltyTableBody.appendChild(row);
        });

        // Add event listeners to pay penalty buttons
        document.querySelectorAll('.pay-penalty-button').forEach(button => {
            button.addEventListener('click', function() {
                const transactionID = this.getAttribute('data-transaction-id');
                const penaltyAmount = this.getAttribute('data-penalty-amount');
                payPenalty(transactionID, penaltyAmount);
            });
        });
    })
    .catch(error => {
        console.error('Error fetching penalties:', error);
        alert('Error fetching penalties');
    });
}

function payPenalty(transactionID, penaltyAmount) {
    fetch('/library/pay_penalty', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ transactionID, penaltyAmount })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        // Optionally, refresh the penalty list
        fetchPenaltyDetails();
    })
    .catch(error => {
        console.error('Error paying penalty:', error);
        alert('Error paying penalty');
    });
}