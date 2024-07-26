document.getElementById('studentRadio').addEventListener('change', function() {
    document.getElementById('formControlPlaceholder').textContent = 'Enter Student Enrollment No.';
    document.getElementById('studentOrBookNo').placeholder = 'Enter Student Enrollment No.';
});

document.getElementById('bookRadio').addEventListener('change', function() {
    document.getElementById('formControlPlaceholder').textContent = 'Enter Book No.';
    document.getElementById('studentOrBookNo').placeholder = 'Enter Book No.';
});

document.getElementById('returnBookForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const inputType = document.querySelector('input[name="inputType"]:checked').value;
    const studentOrBookNo = document.getElementById('studentOrBookNo').value;

    fetch('/library/get_return_details', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ inputType, studentOrBookNo })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Response data:', data); // Log the response data to the console

        if (data.error) {
            alert(data.error);
        } else {
            const detailsContainer = document.getElementById('detailsContainer');
            detailsContainer.innerHTML = ''; // Clear existing details

            const newDetailsContainer = document.createElement('div');
            newDetailsContainer.classList.add('details-container');

            if (data.type === 'student') {
                newDetailsContainer.innerHTML = `
                    <p><strong>Member Name:</strong> ${data.details.member_name}</p>
                    <p><strong>Contact:</strong> ${data.details.member_contact}</p>
                    <p><strong>Class:</strong> ${data.details.member_class}</p>
                    <p><strong>Books Issued:</strong> ${data.details.books_issued}</p>
                `;
            } else if (data.type === 'book') {
                newDetailsContainer.innerHTML = `
                    <p><strong>Book Name:</strong> ${data.details.book_name}</p>
                    <p><strong>Author:</strong> ${data.details.author_name}</p>
                    <p><strong>Publication:</strong> ${data.details.book_publication}</p>
                    <p><strong>Available Quantity:</strong> ${data.details.available_quantity}</p>
                `;
            }

            detailsContainer.appendChild(newDetailsContainer);

            const tableHeaders = document.getElementById('tableHeaders');
            const tableBody = document.querySelector('.details-table tbody');

            tableHeaders.innerHTML = ''; // Clear existing headers
            tableBody.innerHTML = ''; // Clear existing rows

            if (data.type === 'student') {
                tableHeaders.innerHTML = `
                    <th>Book Number</th>
                    <th>Book Name</th>
                    <th>Book Author</th>
                    <th>Book Publication</th>
                    <th>Issue Date</th>
                    <th>Return Date</th>
                    <th>Action</th>
                `;

                data.issues.forEach(issue => {
                    const row = document.createElement('tr');
                    row.dataset.id = issue.id; // Store the id in a data attribute
                    row.innerHTML = `
                        <td>${issue.book_number}</td>
                        <td>${issue.book_name}</td>
                        <td>${issue.book_author}</td>
                        <td>${issue.book_publication}</td>
                        <td>${issue.issue_date}</td>
                        <td>${issue.return_date}</td>
                        <td><button class="return-button" data-id="${issue.id}">Return</button></td>
                    `;
                    tableBody.appendChild(row);
                });
            } else if (data.type === 'book') {
                tableHeaders.innerHTML = `
                    <th>Enrollment Number</th>
                    <th>Member Name</th>
                    <th>Member Class</th>
                    <th>Member Contact</th>
                    <th>Issue Date</th>
                    <th>Return Date</th>
                    <th>Action</th>
                `;

                data.issues.forEach(issue => {
                    const row = document.createElement('tr');
                    row.dataset.id = issue.id; // Store the id in a data attribute
                    row.innerHTML = `
                        <td>${issue.enrollment_number}</td>
                        <td>${issue.member_name}</td>
                        <td>${issue.member_class}</td>
                        <td>${issue.member_contact}</td>
                        <td>${issue.issue_date}</td>
                        <td>${issue.return_date}</td>
                        <td><button class="return-button" data-id="${issue.id}">Return</button></td>
                    `;
                    tableBody.appendChild(row);
                });
            }

            // Add event listeners to the return buttons
            document.querySelectorAll('.return-button').forEach(button => {
                button.addEventListener('click', function() {
                    const id = this.dataset.id;
                    handleReturn(id);
                });
            });
        }
    })
    .catch(error => {
        console.error('Error fetching details:', error);
        alert('Error fetching details');
    });
});

// Handle returning a book
function handleReturn(id) {
    // Implement the logic to handle the return action
    // For example, you can send a request to the server to process the return
    fetch('/library/return_book', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
        } else {
            alert(data.message);
            // Optionally, refresh the table or remove the returned book from the table
            document.querySelector(`tr[data-id="${id}"]`).remove();
        }
    })
    .catch(error => {
        console.error('Error returning book:', error);
        alert('Error returning book');
    });
}

// Handle closing the overlay
document.getElementById('closeReturnBookOverlay').addEventListener('click', function() {
    const overlay = document.getElementById('returnBookOverlay');
    overlay.style.display = 'none';

    // Clear the form and table
    document.getElementById('returnBookForm').reset();
    const detailsContainer = document.getElementById('detailsContainer');
    detailsContainer.innerHTML = ''; // Clear existing details
    const tableHeaders = document.getElementById('tableHeaders');
    const tableBody = document.querySelector('.details-table tbody');
    tableHeaders.innerHTML = ''; // Clear existing headers
    tableBody.innerHTML = ''; // Clear existing rows
});