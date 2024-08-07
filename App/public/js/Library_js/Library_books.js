let booksData = {}; // Object to store books by ID
let bookNamesSet = new Set(); 

async function refreshBooksData() {
  document.getElementById('searchBar').value = '';
  try {
    const response = await fetch('/library/books');
    if (!response.ok) {
      throw new Error('Failed to fetch books');
    }
    const data = await response.json();
    storeBooksData(data);
    displayBooks(data);
  } catch (error) {
    console.error('Error fetching books:', error);
  }
}

function storeBooksData(data) {
  booksData = {}; // Clear existing data
  bookNamesSet.clear(); // Clear existing data

  data.forEach(book => {
    booksData[book.bookID] = book; // Store book by ID
    bookNamesSet.add(book.book_name); // Store book name in Set
  });
}

function isDuplicateBookID(bookID) {
  return booksData.hasOwnProperty(bookID);
}

function isDuplicateBookName(bookName) {
  return bookNamesSet.has(bookName);
}

function formatInput(input) {
  return input.trim().replace(/\s+/g, ' ');
}

// Example usage
document.addEventListener('DOMContentLoaded', () => {
  const addBookForm = document.getElementById('addBookForm');

  addBookForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const bookID = formatInput(document.getElementById('bookID').value);
    const bookName = formatInput(document.getElementById('bookName').value);
    const authorName = formatInput(document.getElementById('authorName').value);
    const bookPublication = formatInput(document.getElementById('bookPublication').value);
    const bookPrice = formatInput(document.getElementById('bookPrice').value);
    const orderedQuantity = formatInput(document.getElementById('orderedQuantity').value);
    const description = formatInput(document.getElementById('description').value);

    const btn = document.querySelector("#btn");
    const btnText = document.querySelector("#btnText");

    // Check if any field is empty
    const fields = [bookID, bookName, authorName, bookPublication, bookPrice, orderedQuantity, description];
    if (fields.some(field => field === '')) {
      alert('All fields are required.');
      return;
    }

    // Check for duplicate book ID or name
    if (isDuplicateBookID(bookID)) {
      alert('Book ID already exists.');
      return;
    }
    if (isDuplicateBookName(bookName)) {
      alert('Book name already exists.');
      return;
    }

    const bookDetails = {
      bookID,
      book_name: bookName,
      book_author: authorName,
      book_publication: bookPublication,
      book_price: bookPrice,
      ordered_quantity: orderedQuantity,
      description
    };

    try {
      const response = await fetch("/library/add_book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookDetails),
      });

      if (response.ok) {
        // Trigger button animation
        btnText.innerHTML = "Saved";
        btn.classList.add("active");
        addBookForm.reset();
        refreshBooksData(); // Refresh data after adding book
      } else {
        throw new Error('Failed to add book');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while adding the book.');
    }
  });
});



function displayBooks(data) {
  const bookTableBody = document.getElementById("booksTablebody");
  bookTableBody.innerHTML = ""; // Clear existing rows

  try {
    // Reverse the data array
    // data.reverse();

    if (data.length === 0) {
      // hideBookLoadingAnimation();
      const noResultsRow = document.createElement("tr");
      noResultsRow.innerHTML = '<td colspan="7">No results found</td>';
      bookTableBody.appendChild(noResultsRow);
    } else {
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
    console.error("Error displaying books:", error);
    // hideBookLoadingAnimation();
  }
}

// Function to edit a book
async function editBook(bookID) {
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

      // Create custom prompt
      const customPrompt = document.createElement("div");
      customPrompt.classList.add("custom-prompt");

      const editPromptContent = () => {
        customPrompt.innerHTML = `
            <div class="prompt-content">                
                <h2>Edit Book: ${newBookDetails.book_name}</h2>
                <form id="editBookForm">
                    <div class="form-group">
                        <input type="text" class="form-control" id="editBookID" name="editBookID" value="${newBookDetails.bookID}" readonly style="width:6rem; text-align: center;" placeholder=" ">
                        <span class="form-control-placeholder">Book ID</span>
                    </div>
                    <div class="form-group">
                        <input type="text" class="form-control" id="editBookName" name="editBookName" value="${newBookDetails.book_name}" required style="width:6rem; text-align: center;" placeholder=" ">
                        <span class="form-control-placeholder">Book Name</span>
                    </div>
                    <div class="form-group">
                        <input type="text" class="form-control" id="editBookAuthor" name="editBookAuthor" value="${newBookDetails.book_author}" required style="width:6rem; text-align: center;" placeholder=" ">
                        <span class="form-control-placeholder">Author</span>
                    </div>
                    <div class="form-group">
                        <input type="text" class="form-control" id="editBookPublication" name="editBookPublication" value="${newBookDetails.book_publication}" required style="width:6rem; text-align: center;" placeholder=" ">
                        <span class="form-control-placeholder">Publication</span>
                    </div>
                    <div class="form-group">
                        <input type="number" class="form-control" id="editBookPrice" name="editBookPrice" value="${newBookDetails.book_price}" step="0.01" required style="width:6rem; text-align: center;" placeholder=" ">
                        <span class="form-control-placeholder">Price</span>
                    </div>
                    <div class="form-group">
                        <input type="number" class="form-control" id="editOrderedQuantity" name="editOrderedQuantity" value="${newBookDetails.ordered_quantity}" readonly style="width:6rem; text-align: center;" placeholder=" ">
                        <span class="form-control-placeholder">Previously Ordered</span>
                    </div>
                    <div class="form-group">
                        <input type="number" class="form-control" id="editNewOrderedQuantity" name="editNewOrderedQuantity" value="0" required style="width:6rem; text-align: center;" placeholder=" ">
                        <span class="form-control-placeholder">New Ordered</span>
                    </div>
                    <div class="form-group">
                        <textarea id="editDescription" class="form-control" name="editDescription" required style="width:6rem; text-align: center;" placeholder=" ">${newBookDetails.description}</textarea>
                        <span class="form-control-placeholder" style="top:-0.7rem;">Description</span>
                    </div>
                    <div class="button-group">
                        <button id="saveButton" style="background-color: transparent; border: none; color: black; padding: 0; text-align: center; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; font-size: 14px; cursor: pointer; max-height: 100%; border-radius: 20px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); transition: transform 0.2s, box-shadow 0.2s; margin-bottom: 10px;"
                                onclick=""
                                onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';"
                                onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';">
                            <img src="../images/conform.png" alt="Save" style="width: 25px; height: 25px; border-radius: 0px; margin: 5px;">
                            <span style="margin-right: 10px;">Save</span>
                        </button>
                        
                        <button id="cancelButton" style="background-color: transparent; border: none; color: black; padding: 0; text-align: center; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; font-size: 14px; cursor: pointer; max-height: 100%; border-radius: 20px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); transition: transform 0.2s, box-shadow 0.2s; margin-bottom: 10px;"
                                onclick=""
                                onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';"
                                onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';">
                            <img src="../images/cancel.png" alt="Cancel" style="width: 25px; height: 25px; border-radius: 0px; margin: 5px;">
                            <span style="margin-right: 10px;">Cancel</span>
                        </button>
                    </div>
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

        // Collect updated book details and format them
        const updatedBookDetails = {
          bookID: bookID,
          book_name: formatInput(editBookForm.editBookName.value),
          book_author: formatInput(editBookForm.editBookAuthor.value),
          book_publication: formatInput(editBookForm.editBookPublication.value),
          book_price: formatInput(editBookForm.editBookPrice.value),
          ordered_quantity: Number(editBookForm.editOrderedQuantity.value) + Number(editBookForm.editNewOrderedQuantity.value),
          new_ordered_quantity: Number(editBookForm.editNewOrderedQuantity.value),
          description: formatInput(editBookForm.editDescription.value),
        };

        // Check if any field has been changed and log each comparison
        const changesMade = Object.keys(updatedBookDetails).some((key) => {
          const originalValue = newBookDetails[key]?.toString();
          const updatedValue = updatedBookDetails[key]?.toString();

          return updatedValue !== originalValue;
        });

        if (!changesMade) {
          alert("No changes have been made.");
          return;
        }
        // Validate that no fields are empty
        const fields = Object.values(updatedBookDetails);
        if (fields.some(field => field === '')) {
          alert('All fields are required.');
          return;
        }

        // Check for duplicate book name
        if (isDuplicateBookName(updatedBookDetails.book_name) && updatedBookDetails.book_name !== newBookDetails.book_name) {
          alert('Book name already exists.');
          return;
        }

        // Send updated book details to server
        try {
          const response = await fetch(
            `/library/book/${encodeURIComponent(bookID)}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(updatedBookDetails),
            }
          );

          if (response.ok) {
            alert("Book updated successfully");
            customPrompt.remove();
            refreshBooksData(); // Refresh the books list
          } else {
            throw new Error("Failed to update book");
          }
        } catch (error) {
          console.error("Error updating book:", error);
          alert("An error occurred while updating the book.");
        }
      });
    })
    .catch((error) => {
      console.error("Error retrieving book details:", error);
      // Handle error if needed
    });
}

// async function searchLibraryBookDetails() {
//   const searchTerm = document.getElementById("searchBar").value.trim();

//   // Check if the search term is empty
//   if (!searchTerm) {
//     if (libraryBooksSearchField !== document.activeElement) {
//       showToast("Please enter a search term.", true);
//     }
//     refreshLibraryBooksData();
//     return;
//   }

//   // Fetch data from the server based on the search term
//   await fetch(`/library/books/search?search=${encodeURIComponent(searchTerm)}`)
//     .then((response) => response.json())
//     .then((data) => {
//       const libraryBooksTableBody = document.getElementById("booksTablebody");
//       libraryBooksTableBody.innerHTML = ""; // Clear previous data

//       if (data.length === 0) {
//         // If no results found, display a message
//         const noResultsRow = document.createElement("tr");
//         noResultsRow.innerHTML = '<td colspan="5">No results found</td>';
//         libraryBooksTableBody.appendChild(noResultsRow);
//       } else {
//         // Append book data to the table
//         data.forEach((book) => {
//           const row = document.createElement("tr");
//           row.innerHTML = `
//               <td>${book.bookID}</td>
//               <td>${book.book_name}</td>
//               <td>${book.book_author}</td>
//               <td>${book.book_publication}</td>
//               <td>${book.book_price}</td>
//               <td>${book.ordered_quantity}</td>
//               <td>${book.description}</td>
//               <td style="text-align: center;">
//                   <div class="button-container" style="display: flex; justify-content: center; gap: 20px;">
//                             <button 
//                                 onclick="editBook('${book.bookID}')"
//                                 onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';"
//                                 onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';">
//                                     <img src="../images/edit.png" alt="Edit" style="width: 25px; height: 25px; border-radius: 0px; margin: 5px;">
//                                     <span style="margin-right: 10px;">Edit</span>
//                             </button>
//                             <button
//                                 onclick="deleteBook('${book.bookID}')"
//                                 onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';"
//                                 onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';">
//                                     <img src="../images/delete_vendor.png" alt="Delete" style="width: 25px; height: 25px; border-radius: 0px; margin: 5px;">
//                                     <span style="margin-right: 10px;">Delete</span>
//                             </button>
//                 </div>
//               </td>
//             `;
//           libraryBooksTableBody.appendChild(row);
//         });
//       }
//     })
//     .catch((error) => {
//       console.error("Error:", error);
//     });
// }
function searchLibraryBookDetails() {
  const searchTerm = document.getElementById("searchBar").value.trim().toLowerCase();

  // Check if the search term is empty
  if (!searchTerm) {
      // showToast("Please enter a search term.", true);
      displayBooks(Object.values(booksData)); // Display all books
      return;
  }

  // Filter the books data based on the search term
  const filteredBooks = Object.values(booksData).filter(book =>
      book.bookID.toLowerCase().includes(searchTerm) ||
      book.book_name.toLowerCase().includes(searchTerm) 
  );

  // Display the filtered data
  displayBooks(filteredBooks);

  // Check if no results were found
  if (filteredBooks.length === 0) {
      const libraryBooksTableBody = document.getElementById("booksTablebody");
      libraryBooksTableBody.innerHTML = '<tr><td colspan="8">No results found</td></tr>';
  }
}

function deleteBook(bookId) {
  const confirmation = confirm(
    `Are you sure you want to delete the book with ID "${bookId}"?`
  );
  if (confirmation) {
    fetch(`/library/book/${bookId}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (response.ok) {
          alert("Book deleted successfully");
          refreshBooksData(); // Refresh the books list
        } else {
          throw new Error("Failed to delete book");
        }
      })
      .catch((error) => console.error("Error deleting book:", error));
  }
}

function exportbooksTableToCSV(tableId, filename) {
  const table = document.getElementById(tableId);
  const rows = table.querySelectorAll("tr");

  let csvContent = "";
  const headers = table.querySelectorAll("th");
  const headerData = [];
  headers.forEach((header) => {
    headerData.push(`"${header.textContent}"`);
  });
  csvContent += headerData.join(",") + "\n";

  rows.forEach((row) => {
    const cells = row.querySelectorAll("td");
    const rowData = [];
    cells.forEach((cell) => {
      rowData.push(`"${cell.textContent}"`);
    });
    csvContent += rowData.join(",") + "\n";
  });

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  if (navigator.msSaveBlob) {
    // IE 10+
    navigator.msSaveBlob(blob, filename);
  } else {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

function exportBooksTable() {
  exportbooksTableToCSV("booksTable", "Library_Books.csv");
}

refreshBooksData();
