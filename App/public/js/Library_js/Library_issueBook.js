document.getElementById('issueBookForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const studentEnrollmentNo = document.getElementById('studentEnrollmentNo').value;
    const bookEnrollmentNo = document.getElementById('bookEnrollmentNo').value;

    fetch('/library/get_details', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ studentEnrollmentNo, bookEnrollmentNo })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Response data:', data); // Log the response data to the console

        if (data.error) {
            alert(data.error);
        } else {
            console.log('Member details:', data.member); // Log member details
            console.log('Book details:', data.book); // Log book details

            // Ensure the data is being assigned correctly
            document.getElementById('studentName').value = data.member.member_name || '';
            document.getElementById('class').value = data.member.member_class || '';
            document.getElementById('contact').value = data.member.member_contact || '';
            document.getElementById('bookName').value = data.book.book_name || '';
            document.getElementById('authorName').value = data.book.author_name || '';
            document.getElementById('bookPublication').value = data.book.book_publication || '';
        }
    })
    .catch(error => {
        console.error('Error fetching details:', error);
        alert('Error fetching details');
    });
});

// Set issue date to today's date and return date to 5 days later
document.addEventListener('DOMContentLoaded', (event) => {
    const issueDateInput = document.getElementById('issueDate');
    const returnDateInput = document.getElementById('returnDate');

    const today = new Date();
    const todayFormatted = today.toISOString().split('T')[0];
    issueDateInput.value = todayFormatted;

    const returnDate = new Date(today);
    returnDate.setDate(returnDate.getDate() + 5);
    const returnDateFormatted = returnDate.toISOString().split('T')[0];
    returnDateInput.value = returnDateFormatted;

    issueDateInput.addEventListener('change', function() {
        const issueDate = new Date(issueDateInput.value);
        const returnDate = new Date(issueDate);
        returnDate.setDate(returnDate.getDate() + 5);
        const returnDateFormatted = returnDate.toISOString().split('T')[0];
        returnDateInput.value = returnDateFormatted;
    });
});

// Handle the submission of the additional info form
document.getElementById('additionalInfoForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const enrollment_number = document.getElementById('studentEnrollmentNo').value;
    const member_name = document.getElementById('studentName').value;
    const member_class = document.getElementById('class').value;
    const member_contact = document.getElementById('contact').value;
    const book_number = document.getElementById('bookEnrollmentNo').value;
    const book_name = document.getElementById('bookName').value;
    const book_author = document.getElementById('authorName').value;
    const book_publication = document.getElementById('bookPublication').value;
    const issue_date = document.getElementById('issueDate').value;
    const return_date = document.getElementById('returnDate').value;

    fetch('/library/issue_book', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            enrollment_number,
            member_name,
            member_class,
            member_contact,
            book_number,
            book_name,
            book_author,
            book_publication,
            issue_date,
            return_date
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
        } else {
            alert(data.message);

            // Reset both forms
            document.getElementById('issueBookForm').reset();
            document.getElementById('additionalInfoForm').reset();

            // Reset issue and return dates to default values
            const issueDateInput = document.getElementById('issueDate');
            const returnDateInput = document.getElementById('returnDate');

            const today = new Date();
            const todayFormatted = today.toISOString().split('T')[0];
            issueDateInput.value = todayFormatted;

            const returnDate = new Date(today);
            returnDate.setDate(returnDate.getDate() + 5);
            const returnDateFormatted = returnDate.toISOString().split('T')[0];
            returnDateInput.value = returnDateFormatted;
        }

    })
    .catch(error => {
        console.error('Error issuing book:', error);
        alert('Error issuing book');
    });
});