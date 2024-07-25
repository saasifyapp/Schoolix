document.addEventListener('DOMContentLoaded', () => {
    // Form and overlay elements
    const addBookForm = document.getElementById('addBookForm');

    // Add Book form submission
    addBookForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const bookDetails = {
            book_name: document.getElementById('bookName').value,
            author_name: document.getElementById('authorName').value,
            book_publication: document.getElementById('bookPublication').value,
            book_purchase_date: document.getElementById('bookPurchaseDate').value,
            book_price: document.getElementById('bookPrice').value,
            book_quantity: document.getElementById('bookQuantity').value,
            book_number: document.getElementById('bookNumber').value
        };

        try {
            const response = await fetch('/library/add_book', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bookDetails)
            });

            if (response.ok) {
                // Handle successful response
                alert('Book added successfully');
            } else {
                throw new Error('Failed to add book');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while adding the book.');
        }
    });
});

// Fetch and display books
async function refreshBooksData() {
    // showBookLoadingAnimation();
    document.getElementById('searchInput').value = '';
    try {
        const response = await fetch('/library/books');
        if (!response.ok) {
            throw new Error('Failed to fetch books');
        }
        const data = await response.json();
        displayBooks(data);
    } catch (error) {
        console.error('Error fetching books:', error);
        // hideBookLoadingAnimation();
    }
}

function displayBooks(data) {
    const bookTableBody = document.getElementById('booksTablebody');
    bookTableBody.innerHTML = ''; // Clear existing rows

    try {
        // Reverse the data array
        // data.reverse();

        if (data.length === 0) {
            // hideBookLoadingAnimation();
            const noResultsRow = document.createElement('tr');
            noResultsRow.innerHTML = '<td colspan="7">No results found</td>';
            bookTableBody.appendChild(noResultsRow);
        } else {
            data.forEach(book => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${book.book_number}</td>
                    <td>${book.book_name}</td>
                    <td>${book.author_name}</td>
                    <td>${book.book_publication}</td>
                    <td>${book.book_purchase_date}</td>
                    <td>${book.book_price}</td>
                    <td>${book.book_quantity}</td>
                `;
                bookTableBody.appendChild(row);
            });
        }
        // hideBookLoadingAnimation();
    } catch (error) {
        console.error('Error displaying books:', error);
        // hideBookLoadingAnimation();
    }
}

refreshBooksData();