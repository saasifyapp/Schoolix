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
    document.getElementById('searchBar').value = '';
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
                   <td>
                        <div class="button-container" style="display: flex; justify-content: center; gap: 20px;">
    <button style="background-color: transparent;
        border: none;
        color: black;
        padding: 0;
        text-align: center;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        cursor: pointer;
        max-height: 100%;
        border-radius: 20px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        transition: transform 0.2s, box-shadow 0.2s;
        margin-bottom: 10px;"
        onclick="editBook('${book.bookID}')"
        onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';"
        onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';">
        <img src="../images/edit.png" alt="Edit" style="width: 25px; height: 25px; border-radius: 0px; margin: 5px;">
        <span style="margin-right: 10px;">Edit</span>
    </button>
    <button style="background-color: transparent;
        border: none;
        color: black;
        padding: 0;
        text-align: center;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        cursor: pointer;
        max-height: 100%;
        border-radius: 20px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        transition: transform 0.2s, box-shadow 0.2s;
        margin-bottom: 10px;"
        onclick="deleteBook('${book.bookID}')"
        onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';"
        onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';">
        <img src="../images/delete_vendor.png" alt="Delete" style="width: 25px; height: 25px; border-radius: 0px; margin: 5px;">
        <span style="margin-right: 10px;">Delete</span>
    </button>
</div>

                    </td>

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

// Function to edit a book
async function editBook(bookID) {
    // showBooksLoadingAnimation();
    let newBookDetails = {};

    await fetch(`/library/book/${encodeURIComponent(bookID)}`)
        .then((response) => {
            if (!response.ok) {
                throw new Error("Failed to retrieve book details.");
            }
            return response.json();
        })
        .then((data) => {
            newBookDetails = data; // Initialize newBookDetails with fetched data
            // hideBooksLoadingAnimation();

            // Create custom prompt
            const customPrompt = document.createElement("div");
            customPrompt.classList.add("custom-prompt");

            const editPromptContent = () => {
                customPrompt.innerHTML = `
                    <div class="prompt-content">
                        <button class="close-button" onclick="document.body.removeChild(this.parentElement.parentElement)">&times;</button>
                        <h2>Edit Book: ${newBookDetails.book_name}</h2>
                        <form id="editBookForm">
                            <label for="editBookID">Book ID:</label>
                            <input type="text" id="editBookID" name="editBookID" value="${newBookDetails.bookID}" readonly><br>
                            <label for="editBookName">Book Name:</label>
                            <input type="text" id="editBookName" name="editBookName" value="${newBookDetails.book_name}" required><br>
                            <label for="editBookAuthor">Author:</label>
                            <input type="text" id="editBookAuthor" name="editBookAuthor" value="${newBookDetails.book_author}" required><br>
                            <label for="editBookPublication">Publication:</label>
                            <input type="text" id="editBookPublication" name="editBookPublication" value="${newBookDetails.book_publication}" required><br>
                            <label for="editBookPrice">Price:</label>
                            <input type="number" id="editBookPrice" name="editBookPrice" value="${newBookDetails.book_price}" step="0.01" required><br>
                            <label for="editOrderedQuantity">Ordered Quantity:</label>
                            <input type="number" id="editOrderedQuantity" name="editOrderedQuantity" value="${newBookDetails.ordered_quantity}" required><br>
                            <label for="editDescription">Description:</label>
                            <textarea id="editDescription" name="editDescription" required>${newBookDetails.description}</textarea><br>
                            <button type="submit">Update</button>
                        </form>
                    </div>
                `;
            };
            editPromptContent();
            document.body.appendChild(customPrompt);

            // Add event listener to form submission
            const editBookForm = customPrompt.querySelector("#editBookForm");
            editBookForm.addEventListener("submit", async (e) => {
                e.preventDefault();

                // Collect updated book details
                const updatedBookDetails = {
                    bookID: bookID,
                    book_name: editBookForm.editBookName.value,
                    book_author: editBookForm.editBookAuthor.value,
                    book_publication: editBookForm.editBookPublication.value,
                    book_price: editBookForm.editBookPrice.value,
                    ordered_quantity: editBookForm.editOrderedQuantity.value,
                    description: editBookForm.editDescription.value,
                };

                // Send updated book details to server
                try {
                    const response = await fetch(`/library/book/${encodeURIComponent(bookID)}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(updatedBookDetails)
                    });

                    if (response.ok) {
                        alert('Book updated successfully');
                        customPrompt.remove();
                        refreshBooksData(); // Refresh the books list
                    } else {
                        throw new Error('Failed to update book');
                    }
                } catch (error) {
                    console.error('Error updating book:', error);
                    alert('An error occurred while updating the book.');
                }
            });
        })
        .catch((error) => {
            console.error("Error retrieving book details:", error);
            // Handle error if needed
        });
}

async function searchLibraryBookDetails() {
    const searchTerm = document.getElementById("searchInput").value.trim();

    // Check if the search term is empty
    if (!searchTerm) {
        if (libraryBooksSearchField !== document.activeElement) {
            showToast("Please enter a search term.", true);
        }
        refreshLibraryBooksData();
        return;
    }

    // Fetch data from the server based on the search term
    await fetch(
        `/library/books/search?search=${encodeURIComponent(searchTerm)}`
    )
        .then((response) => response.json())
        .then((data) => {
            const libraryBooksTableBody = document.getElementById("booksTablebody");
            libraryBooksTableBody.innerHTML = ""; // Clear previous data

            if (data.length === 0) {
                // If no results found, display a message
                const noResultsRow = document.createElement("tr");
                noResultsRow.innerHTML = '<td colspan="5">No results found</td>';
                libraryBooksTableBody.appendChild(noResultsRow);
            } else {
                // Append book data to the table
                data.forEach((book) => {
                    const row = document.createElement("tr");
                    row.innerHTML = `
              <td>${book.bookID}</td>
              <td>${book.book_name}</td>
              <td>${book.book_author}</td>
              <td>${book.book_publication}</td>
              <td>${book.book_price}</td>
              <td>${book.ordered_quantity}</td>
              <td>${book.description}</td>
              <td style="text-align: center;">
                  <div class="button-container" style="display: flex; justify-content: center; gap: 20px;">
                            <button 
                                onclick="editBook('${book.bookID}')"
                                onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';"
                                onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';">
                                    <img src="../images/edit.png" alt="Edit" style="width: 25px; height: 25px; border-radius: 0px; margin: 5px;">
                                    <span style="margin-right: 10px;">Edit</span>
                            </button>
                            <button
                                onclick="deleteBook('${book.bookID}')"
                                onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';"
                                onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';">
                                    <img src="../images/delete_vendor.png" alt="Delete" style="width: 25px; height: 25px; border-radius: 0px; margin: 5px;">
                                    <span style="margin-right: 10px;">Delete</span>
                            </button>
                </div>
              </td>
            `;
                    libraryBooksTableBody.appendChild(row);
                });
            }
        })
        .catch((error) => {
            console.error("Error:", error);
        });
}



function deleteBook(bookId) {
    const confirmation = confirm(
        `Are you sure you want to delete the book with ID "${bookId}"?`
    );
    if (confirmation) {
        fetch(`/library/book/${bookId}`, {
            method: 'DELETE'
        })
            .then(response => {
                if (response.ok) {
                    alert('Book deleted successfully');
                    refreshBooksData(); // Refresh the books list
                } else {
                    throw new Error('Failed to delete book');
                }
            })
            .catch(error => console.error('Error deleting book:', error));
    }
}

function exportTableToCSV(tableId, filename) {
    const table = document.getElementById(tableId);
    const rows = table.querySelectorAll('tr');

    let csvContent = '';
    const headers = table.querySelectorAll('th');
    const headerData = [];
    headers.forEach((header) => {
        headerData.push(`"${header.textContent}"`);
    });
    csvContent += headerData.join(',') + '\n';

    rows.forEach((row) => {
        const cells = row.querySelectorAll('td');
        const rowData = [];
        cells.forEach((cell) => {
            rowData.push(`"${cell.textContent}"`);
        });
        csvContent += rowData.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (navigator.msSaveBlob) { // IE 10+
        navigator.msSaveBlob(blob, filename);
    } else {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

function exportBooksTable() {
    exportTableToCSV('booksTable', 'books.csv');
}

refreshBooksData();