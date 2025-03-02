

document.getElementById('openPenaltyProcessorOverlay').addEventListener('click', function () {
    document.getElementById('penaltyProcessorOverlay').style.display = 'flex';
    fetchPenaltyDetails();
});

document.getElementById('closePenaltyProcessorOverlay').addEventListener('click', function () {
    document.getElementById('penaltyProcessorOverlay').style.display = 'none';
});

let penaltyData = [];

function fetchPenaltyDetails() {
    showLibraryLoadingAnimation();
    document.getElementsByClassName('penaltysearch')[0].value = '';
    fetch('/library/get_penalties', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
    })
        .then(response => response.json())
        .then(data => {
            hidelibraryLoadingAnimation();
            penaltyData = data.penalties; // Store the fetched data in the global object
            // console.log(penaltyData)
            displayPenaltyData(penaltyData); // Call function to display data
        })
        .catch(error => {
            hidelibraryLoadingAnimation();
            console.error('Error fetching penalties:', error);
            showToast('Error fetching penalties', true);
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

<button class="lost-button" 
                    data-transaction-id="${penalty.id}" 
                    style="background-color: transparent; border: none; color: black; padding: 0; text-align: center; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; font-size: 14px; cursor: pointer; max-height: 100%; border-radius: 20px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); transition: transform 0.2s, box-shadow 0.2s, background-color 0.2s; margin-bottom: 10px;"
                    onclick="handleLostPenalty('${penalty.id}', '${penalty.book_name}', '${penalty.bookID}', '${penalty.member_name}', '${penalty.memberID}')"
                    onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)'; this.style.backgroundColor='#F1948A';"
                    onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)'; this.style.backgroundColor='transparent';">
                    <img src="../images/lostbook.png" alt="Lost" style="width: 25px; height: 25px; border-radius: 0px; margin: 5px;">
                    <span style="margin-right: 10px;">Lost</span>
                </button>

</td>
        `;

        penaltyTableBody.appendChild(row);
    });

    // Add event listeners to pay penalty buttons
    document.querySelectorAll('.pay-penalty-button').forEach(button => {
        button.addEventListener('click', function () {
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
    const headers = ["Member Details", "Contact", "Book Details", "Return/Due Date", "Penalty Amount"];
    const table = document.querySelector('.penaltyuniquetable');
    const rows = table.querySelectorAll('tbody tr');

    // Prepare CSV data
    let csvContent = headers.join(',') + '\n'; // Add headers

    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        const rowData = [];

        // Process each cell, excluding the last one (Action column)
        for (let i = 0; i < cells.length - 1; i++) {
            const cell = cells[i];
            // Escape quotes and commas
            const cellText = cell.innerText.replace(/"/g, '""');
            rowData.push(`"${cellText}"`);
        }

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
    // Show confirmation dialog before payment
    Swal.fire({
        title: 'Confirm Penalty Payment',
        html: `Is the penalty of <b> Rs ${penaltyAmount}</b> received from the student ?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, received!'
    }).then((result) => {
        if (result.isConfirmed) {
            showLibraryLoadingAnimation();
            fetch('/library/pay_penalty', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ transactionID, penaltyAmount })
            })
                .then(response => response.json())
                .then(data => {
                    hidelibraryLoadingAnimation();
                    showToast(data.message);
                    // Optionally, refresh the penalty list
                    fetchPenaltyDetails();
                })
                .catch(error => {
                    hidelibraryLoadingAnimation();
                    console.error('Error paying penalty:', error);
                    showToast('Error paying penalty', true);
                });

            // Show success message after confirming the payment
            Swal.fire(
                'Paid!',
                'Your penalty has been paid.',
                'success'
            );
        }
    });
}



function handleLostPenalty(transactionID, bookName, bookID, memberName, memberID) {
    // Show loading when the function is triggered
    showLibraryLoadingAnimation();

    fetch('/library/get_book_mrp', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ bookID: bookID }) // Pass the bookID to get the MRP
    })
    .then(response => response.json())
    .then(data => {
        // Hide loading when data is fetched
        hideLibraryLoadingAnimation();

        if (data.error) {
            showToast(data.error, true);
            return;
        }

        const bookMRP = data.bookMRP ?? '';

        // First SweetAlert to display details and confirm marking as lost
        Swal.fire({
            title: 'Lost Book',
            html: `
                <p style="margin-bottom: 4px;"><b>Book Details:</b> ${bookID} | ${bookName}</p>
                <p style="margin-bottom: 4px;"><b>Member Details:</b> ${memberID} | ${memberName}</p>
                <p style="margin-bottom: 4px;"><b>MRP of Book:</b> Rs ${bookMRP}</p>
                <p style="margin-top: 16px;">Please collect the MRP amount as penalty from the member.</p>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Mark as Lost!'
        }).then((result) => {
            if (result.isConfirmed) {
                // Second SweetAlert to confirm penalty collection
                Swal.fire({
                    title: 'Confirm Penalty Collection',
                    html: `Is the penalty of <b>Rs ${bookMRP}</b> received from the member?`,
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Yes, received!'
                }).then((result) => {
                    if (result.isConfirmed) {
                        showLibraryLoadingAnimation();
                        fetch('/library/mark_lost', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ transactionID, bookMRP })
                        })
                        .then(response => {
                            if (!response.ok) {
                                throw new Error('Network response was not ok');
                            }
                            return response.json(); 
                        })
                        .then(data => {
                            hideLibraryLoadingAnimation();
                            if (data.success) {
                                showToast(data.message || 'The book has been successfully recorded as lost.', false);
                                // Optionally, refresh the penalty list or any relevant data
                                fetchPenaltyDetails();

                                Swal.fire(
                                    'Book Marked as Lost!',
                                    'The book has been successfully recorded as lost.',
                                    'success'
                                );
                            } else {
                                showToast(data.message || 'Error marking book as lost', true);
                            }
                        })
                        .catch(error => {
                            hideLibraryLoadingAnimation();
                            console.error('Error marking book as lost:', error);
                            showToast('Error marking book as lost. Please try again later.', true);
                        });
                    }
                });
            }
        });
    })
    .catch(error => {
        hideLibraryLoadingAnimation();
        console.error('Error fetching book MRP:', error);
        showToast('Error fetching book MRP', true);
    });
}


function showLibraryLoadingAnimation() {
    // Add your code to show the loading animation.
    console.log('Loading animation shown');
}

function hideLibraryLoadingAnimation() {
    // Add your code to hide the loading animation.
    console.log('Loading animation hidden');
}