document.getElementById('issueBookForm').addEventListener('submit', function(event) {
    event.preventDefault();

    // Get student enrollment no and book no from user to autofill the issue details
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
        console.log('Response from /library/get_details:', data); // Debugging info

        if (data.error) {
            handleErrors(data);
        } else {
            // Ensure the data is being assigned correctly
            document.getElementById('studentName').value = data.member.member_name || '';
            document.getElementById('class').value = data.member.member_class || '';
            document.getElementById('studentcontact').value = data.member.member_contact || '';
            document.getElementById('issuebookName').value = data.book.book_name || '';
            document.getElementById('bookauthorName').value = data.book.book_author || '';
            document.getElementById('bookPublicationName').value = data.book.book_publication || '';
        }
    })
    .catch(error => {
        console.error('Error fetching details:', error);
        showToast('Error fetching details', true);
    });
});

function handleErrors(data) {
    if (data.error === 'Multiple issues found') {
        let showToastMessage = 'Multiple issues found:\n\n';
        if (data.memberError) {
            showToastMessage += `Student Issue:\nEnrollment No: ${data.memberError.details.studentEnrollmentNo}\nName: ${data.memberError.details.member_name}\nClass: ${data.memberError.details.member_class}\n\n`;
        }
        if (data.bookError) {
            showToastMessage += `Book Issue:\nEnrollment No: ${data.bookError.details.bookEnrollmentNo}\nName: ${data.bookError.details.book_name}\nAuthor: ${data.bookError.details.book_author}\nPublication: ${data.bookError.details.book_publication}`;
        }
        showBigToast(showToastMessage);
    } else if (data.error === 'Maximum books issued to this student') {
        showBigToast(`Student Issue:\n\nMaximum books issued to this student.\n\nEnrollment No: ${data.details.studentEnrollmentNo}\nName: ${data.details.member_name}\nClass: ${data.details.member_class}`);
    } else if (data.error === 'Book currently unavailable!') {
        showBigToast(`Book Issue:\n\nBook currently unavailable!\n\nEnrollment No: ${data.details.bookEnrollmentNo}\nName: ${data.details.book_name}\nAuthor: ${data.details.book_author}\nPublication: ${data.details.book_publication}`);
    } else if (data.error === 'Book already issued to this member') {
        showBigToast(`Member ID: ${data.details.studentEnrollmentNo}\nStudent Name: ${data.details.member_name}\nClass: ${data.details.member_class}\n\nBook ID: ${data.details.bookEnrollmentNo}\nBook Name: ${data.details.book_name}\nAuthor: ${data.details.book_author}\n\nThis member has already been issued with the above book. Please proceed with return to issue again.`);
    } else {
        showBigToast(data.error);
    }
}



// Display Date in Issue and Return Date fields in IST //

document.addEventListener('DOMContentLoaded', (event) => {
    const issueDateInput = document.getElementById('issueDate');
    const returnDateInput = document.getElementById('returnDate');

    const today = new Date();
    const localOffset = today.getTimezoneOffset() * 60000; // Local offset in milliseconds
    const istOffset = 5.5 * 60 * 60 * 1000; // IST offset in milliseconds
    const istToday = new Date(today.getTime() + localOffset + istOffset);
   // console.log("IST Issue Date and Time (on load):", istToday.toLocaleString());
    const todayFormatted = istToday.toISOString().split('T')[0];
    issueDateInput.value = todayFormatted;

    const returnDate = new Date(istToday);
    returnDate.setDate(returnDate.getDate() + 5);
    //console.log("IST Return Date and Time (on load):", returnDate.toLocaleString());
    const returnDateFormatted = returnDate.toISOString().split('T')[0];
    returnDateInput.value = returnDateFormatted;

    issueDateInput.addEventListener('change', function() {
        const issueDate = new Date(issueDateInput.value);
        const istIssueDate = new Date(issueDate.getTime() + localOffset + istOffset);
        //console.log("IST Issue Date and Time (on change):", istIssueDate.toLocaleString());
        const returnDate = new Date(istIssueDate);
        returnDate.setDate(returnDate.getDate() + 5);
        //console.log("IST Return Date and Time (on change):", returnDate.toLocaleString());
        const returnDateFormatted = returnDate.toISOString().split('T')[0];
        returnDateInput.value = returnDateFormatted;
    });
});


// Handle the submission of the additional info form
document.getElementById('additionalInfoForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const memberID = document.getElementById('studentEnrollmentNo').value;
    const member_name = document.getElementById('studentName').value;
    const member_class = document.getElementById('class').value;
    const member_contact = document.getElementById('studentcontact').value;
    const bookID = document.getElementById('bookEnrollmentNo').value;
    const book_name = document.getElementById('issuebookName').value;
    const book_author = document.getElementById('bookauthorName').value;
    const book_publication = document.getElementById('bookPublicationName').value;
    const issue_date = document.getElementById('issueDate').value;
    const return_date = document.getElementById('returnDate').value;


    fetch('/library/issue_book', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            memberID,
            member_name,
            member_class,
            member_contact,
            bookID,
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
            showToast(data.error, true);
        } else {
            showToast(data.message, false);

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
        showToast('Error issuing book', true);
    });
});