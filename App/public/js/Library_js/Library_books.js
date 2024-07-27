document.addEventListener('DOMContentLoaded', () => {
    const addBookForm = document.getElementById('addBookForm');

    addBookForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const bookDetails = {
            bookID: document.getElementById('bookID').value,
            book_name: document.getElementById('bookName').value,
            book_author: document.getElementById('authorName').value,
            book_publication: document.getElementById('bookPublication').value,
            book_price: document.getElementById('bookPrice').value,
            ordered_quantity: document.getElementById('orderedQuantity').value,
            description: document.getElementById('description').value
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
                    <td>${book.bookID}</td>
                    <td>${book.book_name}</td>
                    <td>${book.book_author}</td>
                    <td>${book.book_publication}</td>
                    <td>${book.book_price}</td>
                    <td>${book.ordered_quantity}</td>
                    <td>${book.description}</td>
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