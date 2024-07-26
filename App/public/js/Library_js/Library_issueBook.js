document.getElementById('issueBookForm').addEventListener('submit', function(event) {
    event.preventDefault();


    // Get student enrollment no and book no from user to autofill the issue details //

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


        // Validations to check if the student has taken maximum (3) books, if so dont allow further book issue.
        // Also check if the book requested is available or not.

        if (data.error) {
            if (data.error === 'Multiple issues found') {
                let alertMessage = 'Multiple issues found:\n\n';
                if (data.memberError) {
                    alertMessage += `Student Issue:\nEnrollment No: ${data.memberError.details.studentEnrollmentNo}\nName: ${data.memberError.details.member_name}\nClass: ${data.memberError.details.member_class}\n\n`;
                }
                if (data.bookError) {
                    alertMessage += `Book Issue:\nEnrollment No: ${data.bookError.details.bookEnrollmentNo}\nName: ${data.bookError.details.book_name}\nAuthor: ${data.bookError.details.author_name}\nPublication: ${data.bookError.details.book_publication}`;
                }
                alert(alertMessage);
            } else if (data.error === 'Maximum books issued to this student') {
                alert(`Student Issue:\n\nMaximum books issued to this student.\n\nEnrollment No: ${data.details.studentEnrollmentNo}\nName: ${data.details.member_name}\nClass: ${data.details.member_class}`);
            } else if (data.error === 'Book currently unavailable!') {
                alert(`Book Issue:\n\nBook currently unavailable!\n\nEnrollment No: ${data.details.bookEnrollmentNo}\nName: ${data.details.book_name}\nAuthor: ${data.details.author_name}\nPublication: ${data.details.book_publication}`);
            } else {
                alert(data.error);
            }
        } else {
            
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