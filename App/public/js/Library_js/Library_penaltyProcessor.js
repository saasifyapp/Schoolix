

document.getElementById('openPenaltyProcessorOverlay').addEventListener('click', function() {
    document.getElementById('penaltyProcessorOverlay').style.display = 'flex';
    fetchPenaltyDetails();
});

document.getElementById('closePenaltyProcessorOverlay').addEventListener('click', function() {
    document.getElementById('penaltyProcessorOverlay').style.display = 'none';
});

let penaltyData = [];

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
        penaltyData = data.penalties; // Store the fetched data in the global object
        console.log(penaltyData)
        displayPenaltyData(penaltyData); // Call function to display data
    })
    .catch(error => {
        console.error('Error fetching penalties:', error);
        alert('Error fetching penalties');
    });
}

function displayPenaltyData(penalties) {
    const penaltyTableBody = document.getElementById('penaltyTableBody');
    penaltyTableBody.innerHTML = ''; // Clear existing rows

    if (penalties.length === 0) {
        const noResultsRow = document.createElement('tr');
        noResultsRow.innerHTML = '<td colspan="6">No results found</td>';
        penaltyTableBody.appendChild(noResultsRow);
        return;
    }

    penalties.forEach(penalty => {
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
            <td><button class="pay-penalty-button" 
        data-transaction-id="${penalty.id}" 
        data-penalty-amount="${penalty.penalty_amount}"
        style="background-color: transparent; border: none; color: black; padding: 0; text-align: center; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; font-size: 14px; cursor: pointer; max-height: 100%; border-radius: 20px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); transition: transform 0.2s, box-shadow 0.2s, background-color 0.2s; margin-bottom: 10px;"
        onclick="payAndReturn('${penalty.id}', '${penalty.penalty_amount}')"
        onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)'; this.style.backgroundColor='#76D7C4';"
        onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)'; this.style.backgroundColor='transparent';">
    <img src="../images/investment.png" alt="Pay and Return" style="width: 25px; height: 25px; border-radius: 0px; margin: 5px;">
    <span style="margin-right: 10px;">Pay and Return</span>
</button>
</td>
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
}

// Function to search penalty transactions
function searchPenaltyTransactions() {
    // Access the first element with the class 'penaltysearch'
    const searchInput = document.getElementsByClassName('penaltysearch')[0];
    const searchQuery = searchInput.value.toLowerCase();
    // console.log(searchQuery);

    // Filter the penalty data based on the search query
    const filteredPenalties = penaltyData.filter(penalty =>
        penalty.memberID.toLowerCase().includes(searchQuery) || 
        penalty.member_name.toLowerCase().includes(searchQuery)
    );

    // Display the filtered data
    displayPenaltyData(filteredPenalties);

    // Check if no results were found
    const penaltyTableBody = document.getElementById('penaltyTableBody');
    if (filteredPenalties.length === 0) {
        penaltyTableBody.innerHTML = '<tr><td colspan="6">No results found</td></tr>';
    }
}

function exportPenaltiesToCSV() {
    // Define the table headers
    const headers = ["Member Details", "Contact", "Book Details", "Return/Due Date", "Penalty Amount", "Action"];
    const table = document.querySelector('.penaltyuniquetable');
    const rows = table.querySelectorAll('tbody tr');

    // Prepare CSV data
    let csvContent = headers.join(',') + '\n'; // Add headers

    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        const rowData = [];
        cells.forEach(cell => {
            // Escape quotes and commas
            const cellText = cell.innerText.replace(/"/g, '""');
            rowData.push(`"${cellText}"`);
        });
        csvContent += rowData.join(',') + '\n'; // Add row data
    });

    // Create a Blob with CSV data
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        // Create a link element, set the URL using createObjectURL, and trigger a click
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'Penalties_Report.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
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