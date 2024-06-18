////Loading Animation
function showBooksLoadingAnimation() {
  console.log("show");
  document.getElementById("loadingOverlaybooks").style.display = "flex";
}

function hideBooksLoadingAnimation() {
  console.log("hide");
  document.getElementById("loadingOverlaybooks").style.display = "none";
}

// Calculate Purchase Price based on Selling Price and % Margin // - For adding books

function calculateBookPurchasePrice() {
  const sellingPrice = parseFloat(
    document.getElementById("book_sellingPrice").value
  );
  const marginPercentage = parseFloat(
    document.getElementById("book_margin").value
  );

  if (
    !isNaN(sellingPrice) &&
    !isNaN(marginPercentage) &&
    document.getElementById("book_sellingPrice").value !== "" &&
    document.getElementById("book_margin").value !== ""
  ) {
    const marginAmount = (marginPercentage / 100) * sellingPrice;
    const purchasePrice = sellingPrice - marginAmount;

    document.getElementById("book_purchasePrice").value =
      purchasePrice.toFixed(2);
  } else {
    document.getElementById("book_purchasePrice").value = "";
  }
}

document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("book_sellingPrice")
    .addEventListener("input", calculateBookPurchasePrice);
  document
    .getElementById("book_margin")
    .addEventListener("input", calculateBookPurchasePrice);
});

/////////////// Class Dropdown ////////////////
// Function to toggle dropdown visibility
function toggleDropdown() {
  const dropdown = document.querySelector(".dropdown-options");
  dropdown.style.display =
    dropdown.style.display === "block" ? "none" : "block";
}

// Event listeners for options
document.querySelectorAll(".option").forEach((option) => {
  option.addEventListener("click", function (event) {
    if (!this.classList.contains("has-submenu")) {
      const selectedText = this.textContent.trim();
      document.querySelector(".dropdown-selected").textContent = selectedText;
      document.getElementById("bookClass").value = this.dataset.value;
      document.querySelector(".dropdown-options").style.display = "none"; // Hide dropdown
    }
  });
});

// Event listeners for sub-options
document.querySelectorAll(".submenu-option").forEach((subOption) => {
  subOption.addEventListener("click", function (event) {
    const selectedText = this.textContent.trim();
    document.querySelector(".dropdown-selected").textContent = selectedText;
    document.getElementById("bookClass").value = this.dataset.value;
    document.querySelector(".dropdown-options").style.display = "none"; // Hide dropdown
    event.stopPropagation();
  });
});

// Event listener to hide dropdown when clicking outside
document.addEventListener("click", function (event) {
  const dropdown = document.querySelector(".dropdown-options");
  const customDropdown = document.getElementById("customDropdown");
  if (!customDropdown.contains(event.target)) {
    dropdown.style.display = "none";
  }
});

//////////////////////////////////

document.addEventListener("DOMContentLoaded", function () {
  // Get the form element
  const booksform = document.getElementById("addBooksForm");

  // Check if the form exists
  if (booksform) {
    // Add submit event listener to the form
    booksform.addEventListener("submit", async function (event) {
      const bookClassValue = document.getElementById("bookClass").value;

      // Check if the bookClass field is empty
      if (!bookClassValue) {
        event.preventDefault(); // Prevent the default form submission
        showToast("Please select a class before submitting", "red");
        return;
      }
      showBooksLoadingAnimation();
      event.preventDefault(); // Prevent the default form submission

      // Get the form data using FormData
      const formData = new FormData(booksform);

      // Convert FormData to JSON
      const jsonData = {};
      formData.forEach((value, key) => {
        // Adjust keys to match server-side expectations
        switch (key) {
          case "bookTitle":
            jsonData["title"] = value;
            break;
          case "bookClass":
            jsonData["class_of_title"] = value;
            break;
          case "book_purchasePrice":
            jsonData["purchase_price"] = value;
            break;
          case "book_sellingPrice":
            jsonData["selling_price"] = value;
            break;
          case "orderedQuantity":
            jsonData["ordered_quantity"] = value;
            break;
          // Add cases for other keys as needed
          default:
            jsonData[key] = value;
        }
      });

      // Make a POST request to the endpoint
      await fetch("/inventory/purchase/add_books", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jsonData),
      })
        .then((response) => {
          if (!response.ok) {
            return response.text().then((text) => {
              throw new Error(text);
            });
          }
          hideBooksLoadingAnimation();
          // Clear input fields after successful submission
          booksform.reset();
          // Reset the dropdown
          resetDropdown();
        })
        .then((data) => {
          hideBooksLoadingAnimation();
          console.log("Book added successfully");
          showToast(`${jsonData.title} added successfully`);
          refreshbooksData();
          refreshData();
          populateBooksVendorDropdown();
          // You can update the UI or do something else here after successful submission
        })
        .catch((error) => {
          hideBooksLoadingAnimation();
          refreshbooksData();
          refreshData();
          if (error.message === "Book title already exists") {
            showToast(`${jsonData.title} is already added`, "red");
          } else {
            showToast("Book added failed", "red");
          }
          console.error("Error:", error);
          // Handle errors here, like displaying an error message to the user
        });
    });
  }
});

function resetDropdown() {
  document.querySelector(".dropdown-selected").textContent = "Class";
  document.getElementById("bookClass").value = "";
  document.querySelector(".dropdown-options").style.display = "none";
}

document.querySelectorAll(".submenu-option").forEach((subOption) => {
  subOption.addEventListener("click", function (event) {
    const selectedText = this.textContent.trim();
    document.querySelector(".dropdown-selected").textContent = selectedText;
    document.getElementById("bookClass").value = this.dataset.value;
    document.querySelector(".dropdown-options").style.display = "none"; // Hide dropdown
    event.stopPropagation();
  });
});

// Function to populate vendor dropdowns
async function populateBooksVendorDropdown() {
  // Fetch vendors from the server
  await fetch("/inventory/books_vendor")
    .then((response) => response.json())
    .then((data) => {
      // Dropdowns to be populated
      const bookvendorDropdowns = [
        document.getElementById("bookvendor"), // For add book
        //document.getElementById('editVendor')    // For edit uniform
      ];

      // Populate each dropdown
      bookvendorDropdowns.forEach((dropdown) => {
        if (dropdown) {
          dropdown.innerHTML = ""; // Clear existing options

          // Create and append the default option
          const defaultOption = document.createElement("option");
          defaultOption.textContent = "Select Vendor";
          defaultOption.value = "";
          defaultOption.selected = true;
          defaultOption.disabled = true;
          dropdown.appendChild(defaultOption);

          // Append options fetched from the server
          data.forEach((vendor) => {
            const option = document.createElement("option");
            option.textContent = vendor.vendor_name;
            dropdown.appendChild(option);
          });
        }
      });
    })
    .catch((error) => {
      console.error("Error fetching vendors:", error);
    });
}

// Call populateVendorDropdown when the page initially loads
document.addEventListener("DOMContentLoaded", function () {
  populateBooksVendorDropdown();
});

// Refresh data function for fetching and displaying books
/*async function refreshbooksData() {
  showBooksLoadingAnimation();
  document.getElementById("bookssearchField").value = "";
  await fetch("/inventory/books")
    .then((response) => response.json())
    .then((data) => displayBooks(data))
    .catch((error) => {
      console.error("Error:", error);
      // Handle error if needed
      hideBooksLoadingAnimation();
    });
}*/

// Function to display book data
function displayBooks(data) {
  const bookTableBody = document.getElementById("booksTableBody");
  bookTableBody.innerHTML = ""; // Clear previous data

  try {
    // Reverse the data array
    data.reverse();

    if (data.length === 0) {
      hideBooksLoadingAnimation();
      const noResultsRow = document.createElement("tr");
      noResultsRow.innerHTML = '<td colspan="9">No results found</td>';
      bookTableBody.appendChild(noResultsRow);
    } else {
      data.forEach((book) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${book.title}</td>
          <td>${book.class_of_title}</td>
          <td>${book.purchase_price}</td>
          <td>${book.selling_price}</td>
          <td>${book.vendor}</td>
          <td>${book.ordered_quantity}</td>
          <td>${book.remaining_quantity}</td>
          <td>${book.returned_quantity}</td>
          <td>
            <div class="button-container" style="display: flex; justify-content: center; gap: 20px;">
             <button style="background-color: transparent;
                              border: none;
                              color: black; /* Change text color to black */
                              padding: 0;
                              text-align: center;
                              text-decoration: none;
                              display: flex; /* Use flex for centering */
                              align-items: center; /* Center vertically */
                              justify-content: center; /* Center horizontally */
                              font-size: 14px;
                              cursor: pointer;
                              max-height: 100%;
                              border-radius: 20px; /* Round corners */
                              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Add shadow */
                              transition: transform 0.2s, box-shadow 0.2s; /* Transition for transform and box-shadow */
                              margin-bottom: 10px;" /* Added margin bottom for spacing */
              onclick="showBookUpdateModal('${book.sr_no}')"
              onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';"
              onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';">
                <img src="/images/edit.png" alt="Edit" style="width: 25px; height: 25px; border-radius: 0px; margin: 5px;">
                <span style="margin-right: 10px;">Edit</span>
              </button>
              <button style="background-color: transparent;
                              border: none;
                              color: black; /* Change text color to black */
                              padding: 0;
                              text-align: center;
                              text-decoration: none;
                              display: flex; /* Use flex for centering */
                              align-items: center; /* Center vertically */
                              justify-content: center; /* Center horizontally */
                              font-size: 14px;
                              cursor: pointer;
                              max-height: 100%;
                              border-radius: 20px; /* Round corners */
                              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Add shadow */
                              transition: transform 0.2s, box-shadow 0.2s; /* Transition for transform and box-shadow */
                              margin-bottom: 10px;" /* Added margin bottom for spacing */
              onclick="updateBook('${book.title}')"
              onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';"
              onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';">
                <img src="/images/add_book.png" alt="Update" style="width: 25px; height: 25px; border-radius: 0px; margin: 5px;">
                <span style="margin-right: 10px;">Restock</span>
              </button>
              <button style="background-color: transparent;
                              border: none;
                              color: black; /* Change text color to black */
                              padding: 0;
                              text-align: center;
                              text-decoration: none;
                              display: flex; /* Use flex for centering */
                              align-items: center; /* Center vertically */
                              justify-content: center; /* Center horizontally */
                              font-size: 14px;
                              cursor: pointer;
                              max-height: 100%;
                              border-radius: 20px; /* Round corners */
                              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Add shadow */
                              transition: transform 0.2s, box-shadow 0.2s; /* Transition for transform and box-shadow */
                              margin-bottom: 10px;" /* Added margin bottom for spacing */
              onclick="returnBook('${book.title}')"
              onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';"
              onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';">
                <img src="/images/return_book.png" alt="Return" style="width: 25px; height: 25px; border-radius: 0px; margin: 5px;">
                <span style="margin-right: 10px;">Return</span>
              </button>
              <button style="background-color: transparent;
                              border: none;
                              color: black; /* Change text color to black */
                              padding: 0;
                              text-align: center;
                              text-decoration: none;
                              display: flex; /* Use flex for centering */
                              align-items: center; /* Center vertically */
                              justify-content: center; /* Center horizontally */
                              font-size: 14px;
                              cursor: pointer;
                              max-height: 100%;
                              border-radius: 20px; /* Round corners */
                              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Add shadow */
                              transition: transform 0.2s, box-shadow 0.2s; /* Transition for transform and box-shadow */
                              margin-bottom: 10px;" /* Added margin bottom for spacing */
              onclick="deleteBook('${book.title}')"
              onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';"
              onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';">
                <img src="/images/delete_vendor.png" alt="Delete" style="width: 25px; height: 25px; border-radius: 0px; margin: 5px;">
                <span style="margin-right: 10px;">Delete</span>
              </button>
            </div>
          </td>
        `;
        bookTableBody.appendChild(row);
      });
    }
    hideBooksLoadingAnimation();
  } catch (error) {
    console.error("Error displaying books:", error);
    // Handle error if needed
    hideBooksLoadingAnimation();
  }
}

// Function to delete a book
async function deleteBook(title) {
  const confirmation = confirm(
    `Are you sure you want to delete the book "${title}"?`
  );
  if (confirmation) {
    showBooksLoadingAnimation();
    await fetch(`/inventory/books/${encodeURIComponent(title)}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to delete book.");
        }
        hideBooksLoadingAnimation();
      })
      .then((data) => {
        hideBooksLoadingAnimation();
        showToast(`${title} deleted successfully`); // Show success toast
        refreshbooksData(); // Refresh data after deleting the book
        refreshData();
        populateBooksVendorDropdown();
      })
      .catch((error) => {
        hideBooksLoadingAnimation();
        console.error("Error deleting book:", error);
        showToast(` An error occured while deleting ${title}`, true); // Show error toast
      });
  }
}

// Function to update a book
async function updateBook(title) {
  showBooksLoadingAnimation();
  await fetch(`/inventory/books/${encodeURIComponent(title)}/quantity`) // Assuming you have modified the endpoint to retrieve both ordered_quantity and remaining_quantity
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to retrieve quantity.");
      }
      return response.json();
    })
    .then((data) => {
      let existingOrderedQuantity = data.ordered_quantity;
      let remainingQuantity = data.remaining_quantity;
      let class_of_title = data.class_of_title;
      let newOrderedQuantity = 0;
      hideBooksLoadingAnimation();
      // Create custom prompt
      const customPrompt = document.createElement("div");
      customPrompt.classList.add("custom-prompt");
      const updatePromptContent = () => {
        customPrompt.innerHTML = `
                    <div class="prompt-content">
                        <h2>${title} (${class_of_title})</h2>
                        <p>Previously Ordered : ${existingOrderedQuantity}</p>
                        <p>Remaining Quantity : ${remainingQuantity}</p>
                        <p>Enter the new order quantity:</p>
                         <div class="form-group">
        <input type="number" class="form-control" id="newQuantityInput" min="0" placeholder=" " required style="width:6rem;">
        <span class="form-control-placeholder">New Order Quantity</span>
    </div>
                        <p id="totalOrder">Total Order : ${existingOrderedQuantity}</p>
                        <p id="newRemainingQuantity">New Remaining Quantity : ${remainingQuantity}</p>
                        <button id="confirmButton" style="background-color: transparent;
                        border: none;
                        color: black; /* Change text color to black */
                        padding: 0;
                        text-align: center;
                        text-decoration: none;
                        display: inline-flex; /* Use flex for centering */
                        align-items: center; /* Center vertically */
                        justify-content: center; /* Center horizontally */
                        font-size: 14px;
                        cursor: pointer;
                        max-height: 100%;
                        border-radius: 20px; /* Round corners */
                        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Add shadow */
                        transition: transform 0.2s, box-shadow 0.2s;
                        margin-bottom: 10px;"                           
                        onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';"
                        onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';">
                            <img src="../images/conform.png" alt="Edit" style="width: 25px; height: 25px; border-radius: 0px; margin: 5px;">
                            <span style="margin-right: 10px;">Confirm</span>
                        </button>

                        <button id="cancelButton" style="background-color: transparent;
                        border: none;
                        color: black; /* Change text color to black */
                        padding: 0;
                        text-align: center;
                        text-decoration: none;
                        display: inline-flex; /* Use flex for centering */
                        align-items: center; /* Center vertically */
                        justify-content: center; /* Center horizontally */
                        font-size: 14px;
                        cursor: pointer;
                        max-height: 100%;
                        border-radius: 20px; /* Round corners */
                        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Add shadow */
                        transition: transform 0.2s, box-shadow 0.2s;
                        margin-bottom: 10px;"                           
                        onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';"
                        onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';">
                            <img src="../images/cancel.png" alt="Edit" style="width: 25px; height: 25px; border-radius: 0px; margin: 5px;">
                            <span style="margin-right: 10px;">Cancel</span>
                        </button>                      
                    
                    </div>
                `;
      };
      updatePromptContent();
      document.body.appendChild(customPrompt);

      // Add event listener to confirm button
      const confirmButton = customPrompt.querySelector("#confirmButton");
      confirmButton.addEventListener("click", () => {
        showBooksLoadingAnimation();
        // Get the new ordered quantity from the input field
        newOrderedQuantity =
          parseInt(customPrompt.querySelector("#newQuantityInput").value, 10) ||
          0;

        // Calculate total order amount and new remaining quantity
        const totalOrder = existingOrderedQuantity + newOrderedQuantity;
        const newRemainingQuantity = remainingQuantity + newOrderedQuantity;

        // Update the ordered quantity on the server
        updateBookOrderedQuantity(title, totalOrder, newRemainingQuantity);

        // Remove the prompt
        customPrompt.remove();
      });

      // Add event listener to input field for updating total order
      const newQuantityInput = customPrompt.querySelector("#newQuantityInput");
      newQuantityInput.addEventListener("input", () => {
        newOrderedQuantity = parseInt(newQuantityInput.value, 10) || 0; // Ensure zero if input is not a number
        const totalOrder = existingOrderedQuantity + newOrderedQuantity;
        const totalOrderElement = customPrompt.querySelector("#totalOrder");
        totalOrderElement.textContent = `Total Order : ${totalOrder}`;

        // Calculate new remaining quantity and display it
        const newRemainingQuantity = remainingQuantity + newOrderedQuantity;
        const newRemainingQuantityElement = customPrompt.querySelector(
          "#newRemainingQuantity"
        );
        newRemainingQuantityElement.textContent = `New Remaining Quantity : ${newRemainingQuantity}`;
      });

      // Add event listener to cancel button
      const cancelButton = customPrompt.querySelector("#cancelButton");
      cancelButton.addEventListener("click", () => {
        // Remove the prompt
        customPrompt.remove();
      });
    })
    .catch((error) => {
      console.error("Error retrieving quantity:", error);
      // Handle error if needed
    });
}

// Function to update ordered quantity on the server
async function updateBookOrderedQuantity(
  title,
  totalOrder,
  newRemainingQuantity
) {
  // showBooksLoadingAnimation();
  await fetch(`/inventory/books/${encodeURIComponent(title)}/quantity`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      total_order: totalOrder,
      remaining_quantity: newRemainingQuantity,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to update quantity.");
      }
      hideBooksLoadingAnimation();
      console.log("Quantity updated successfully.");
      showToast(`${title} restocked successfully`); // Show success toast
      refreshbooksData();
      refreshData();
      populateBooksVendorDropdown();

      // You can perform further actions here, like refreshing the page or updating the UI
    })
    .catch((error) => {
      hideBooksLoadingAnimation();
      console.error("Error updating quantity:", error);
      showToast(`Failed to update ${title}`, "red");
      // Handle error if needed
    });
}

// Function to return a book
async function returnBook(title) {
  showBooksLoadingAnimation();
  let newRemainingQuantity; // Declare newRemainingQuantity here

  await fetch(`/inventory/books/${encodeURIComponent(title)}/quantity`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to retrieve quantity.");
      }
      return response.json();
    })
    .then((data) => {
      let remainingQuantity = data.remaining_quantity;
      let class_of_title = data.class_of_title;
      let returnedQuantity = data.returned_quantity;

      newRemainingQuantity = remainingQuantity; // Initialize newRemainingQuantity here
      hideBooksLoadingAnimation();
      // Create custom prompt
      const customPrompt = document.createElement("div");
      customPrompt.classList.add("custom-prompt");
      const returnPromptContent = () => {
        customPrompt.innerHTML = `
                    <div class="prompt-content">
                        <h2>${title} (${class_of_title})</h2>
                        <p>Remaining Quantity : ${remainingQuantity}</p>
                        <p>Enter the return quantity:</p>                        
                         <div class="form-group">
                        <input type="number" class="form-control wide" id="returnQuantityInput" min="0" placeholder=" " required>
                        <span class="form-control-placeholder">Return Quantity</span>
    </div>
                        <p id="newRemainingQuantity">New Remaining Quantity : ${newRemainingQuantity}</p>
                        <button id="confirmButton" style="background-color: transparent;
                            border: none;
                            color: black; /* Change text color to black */
                            padding: 0;
                            text-align: center;
                            text-decoration: none;
                            display: inline-flex; /* Use flex for centering */
                            align-items: center; /* Center vertically */
                            justify-content: center; /* Center horizontally */
                            font-size: 14px;
                            cursor: pointer;
                            max-height: 100%;
                            border-radius: 20px; /* Round corners */
                            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Add shadow */
                            transition: transform 0.2s, box-shadow 0.2s;
                            margin-bottom: 10px;"                           
                            onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';"
                            onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';">
                                <img src="../images/conform.png" alt="Edit" style="width: 25px; height: 25px; border-radius: 0px; margin: 5px;">
                                <span style="margin-right: 10px;">Confirm</span>
                            </button>

                            <button id="cancelButton" style="background-color: transparent;
                            border: none;
                            color: black; /* Change text color to black */
                            padding: 0;
                            text-align: center;
                            text-decoration: none;
                            display: inline-flex; /* Use flex for centering */
                            align-items: center; /* Center vertically */
                            justify-content: center; /* Center horizontally */
                            font-size: 14px;
                            cursor: pointer;
                            max-height: 100%;
                            border-radius: 20px; /* Round corners */
                            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Add shadow */
                            transition: transform 0.2s, box-shadow 0.2s;
                            margin-bottom: 10px;"                           
                            onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';"
                            onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';">
                                <img src="../images/cancel.png" alt="Edit" style="width: 25px; height: 25px; border-radius: 0px; margin: 5px;">
                                <span style="margin-right: 10px;">Cancel</span>
                            </button>                      
                        
                    </div>
                `;
      };
      returnPromptContent();
      document.body.appendChild(customPrompt);

      // Add event listener to confirm button
      const confirmButton = customPrompt.querySelector("#confirmButton");
      confirmButton.addEventListener("click", () => {
        showBooksLoadingAnimation();
        // Get the return quantity from the input field
        let userReturnedQuantity =
          parseInt(
            customPrompt.querySelector("#returnQuantityInput").value,
            10
          ) || 0;

        // Add the user entered value to the old returned quantity
        returnedQuantity += userReturnedQuantity;

        // Calculate new remaining quantity
        newRemainingQuantity = remainingQuantity - userReturnedQuantity;

        // Update the remaining quantity and returned quantity on the server
        returnBookQuantity(title, returnedQuantity, newRemainingQuantity);

        // Remove the prompt
        customPrompt.remove();
      });

      // Add event listener to input field for updating remaining quantity
      const returnQuantityInput = customPrompt.querySelector(
        "#returnQuantityInput"
      );
      returnQuantityInput.addEventListener("input", () => {
        let userReturnedQuantity = parseInt(returnQuantityInput.value, 10) || 0; // Ensure zero if input is not a number

        // Calculate new remaining quantity and display it
        newRemainingQuantity = remainingQuantity - userReturnedQuantity;
        const newRemainingQuantityElement = customPrompt.querySelector(
          "#newRemainingQuantity"
        );
        newRemainingQuantityElement.textContent = `New Remaining Quantity : ${newRemainingQuantity}`;
      });

      // Add event listener to cancel button
      const cancelButton = customPrompt.querySelector("#cancelButton");
      cancelButton.addEventListener("click", () => {
        // Remove the prompt
        customPrompt.remove();
      });
    })
    .catch((error) => {
      console.error("Error retrieving quantity:", error);
      // Handle error if needed
    });
}

// Function to update ordered quantity on the server
async function returnBookQuantity(
  title,
  returnedQuantity,
  newRemainingQuantity
) {
  // showBooksLoadingAnimation();
  await fetch(`/inventory/return_books/${encodeURIComponent(title)}/quantity`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: title,
      remainingQuantity: newRemainingQuantity,
      returnedQuantity: returnedQuantity,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to update quantity.");
      }
      hideBooksLoadingAnimation();
      console.log("Quantity updated successfully.");
      showToast(`${title} returned successfully`); // Show success toast
      refreshbooksData();
      populateBooksVendorDropdown();

      // You can perform further actions here, like refreshing the page or updating the UI
    })
    .catch((error) => {
      console.error("Error updating quantity:", error);
      // Handle error if needed
      hideBooksLoadingAnimation();
    });
}

async function searchBookDetails() {
  // showBooksLoadingAnimation();

  const searchTerm = document.getElementById("bookssearchField").value.trim();

  // Check if the search term is empty

  if (!searchTerm) {
    if (bookssearchField !== document.activeElement) {
      showToast("Please enter a search term.", true);
    }
    refreshbooksData();
    return;
  }

  // Fetch data from the server based on the search term
  await fetch(
    `/inventory/books/search?search=${encodeURIComponent(searchTerm)}`
  )
    .then((response) => response.json())
    .then((data) => {
      const booksTableBody = document.getElementById("booksTableBody");
      booksTableBody.innerHTML = ""; // Clear previous data

      if (data.length === 0) {
        // If no results found, display a message
        const noResultsRow = document.createElement("tr");
        noResultsRow.innerHTML = '<td colspan="9">No results found</td>';
        booksTableBody.appendChild(noResultsRow);
      } else {
        // Append book data to the table
        data.forEach((book) => {
          const row = document.createElement("tr");
          row.innerHTML = `
                        <td>${book.title}</td>
                        <td>${book.class_of_title}</td>
                        <td>${book.purchase_price}</td>
                        <td>${book.selling_price}</td>
                        <td>${book.vendor}</td>
                        <td>${book.ordered_quantity}</td>
                        <td>${book.remaining_quantity}</td>
                        <td>${book.returned_quantity}</td>
                        <td style="text-align: center;">
                        <div class="button-container" style="display: flex; justify-content: center; gap: 20px;">

                        <button style="background-color: transparent;
                              border: none;
                              color: black; /* Change text color to black */
                              padding: 0;
                              text-align: center;
                              text-decoration: none;
                              display: flex; /* Use flex for centering */
                              align-items: center; /* Center vertically */
                              justify-content: center; /* Center horizontally */
                              font-size: 14px;
                              cursor: pointer;
                              max-height: 100%;
                              border-radius: 20px; /* Round corners */
                              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Add shadow */
                              transition: transform 0.2s, box-shadow 0.2s; /* Transition for transform and box-shadow */
                              margin-bottom: 10px;" /* Added margin bottom for spacing */
              onclick="showBookUpdateModal('${book.sr_no}')"
              onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';"
              onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';">
                <img src="/images/edit.png" alt="Edit" style="width: 25px; height: 25px; border-radius: 0px; margin: 5px;">
                <span style="margin-right: 10px;">Edit</span>
              </button>

                        <button style="background-color: transparent;
                        border: none;
                        color: black; /* Change text color to black */
                        padding: 0;
                        text-align: center;
                        text-decoration: none;
                        display: flex; 
                        align-items: center; 
                        justify-content: center; 
                        font-size: 14px;
                        cursor: pointer;
                        max-height: 100%;
                        border-radius: 20px; /* Round corners */
                        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Add shadow */
                        transition: transform 0.2s, box-shadow 0.2s; /* Transition for transform and box-shadow */
                        margin-bottom: 10px;" /* Added margin bottom for spacing */
                onclick="updateBook('${book.title}')"
                onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';"
                onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';">
            <img src="/images/add_book.png" alt="Update" style="width: 25px; height: 25px; border-radius: 0px; margin: 5px;">
            <span style="margin-right: 10px;">Restock</span>
        </button>
        <button style="background-color: transparent;
                        border: none;
                        color: black; /* Change text color to black */
                        padding: 0;
                        text-align: center;
                        text-decoration: none;
                        display: flex; /* Use flex for centering */
                        align-items: center; /* Center vertically */
                        justify-content: center; /* Center horizontally */
                        font-size: 14px;
                        cursor: pointer;
                        max-height: 100%;
                        border-radius: 20px; /* Round corners */
                        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Add shadow */
                        transition: transform 0.2s, box-shadow 0.2s; /* Transition for transform and box-shadow */
                        margin-bottom: 10px;" /* Added margin bottom for spacing */
                onclick="returnBook('${book.title}')"
                onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';"
                onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';">
            <img src="/images/return_book.png" alt="Update" style="width: 25px; height: 25px; border-radius: 0px; margin: 5px;">
            <span style="margin-right: 10px;">Return</span>
        </button>
        <button style="background-color: transparent;
                        border: none;
                        color: black; /* Change text color to black */
                        padding: 0;
                        text-align: center;
                        text-decoration: none;
                        display: flex; /* Use flex for centering */
                        align-items: center; /* Center vertically */
                        justify-content: center; /* Center horizontally */
                        font-size: 14px;
                        cursor: pointer;
                        max-height: 100%;
                        border-radius: 20px; /* Round corners */
                        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Add shadow */
                        transition: transform 0.2s, box-shadow 0.2s; /* Transition for transform and box-shadow */
                        margin-bottom: 10px;" /* Added margin bottom for spacing */
                onclick="deleteBook('${book.title}')"
                onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';"
                onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';">
            <img src="/images/delete_vendor.png" alt="Update" style="width: 25px; height: 25px; border-radius: 0px; margin: 5px;">
            <span style="margin-right: 10px;">Delete</span>
        </button>
        </div>
        
                        </td>
                    `;
          booksTableBody.appendChild(row);
        });
      }
      // addFadeUpAnimation();
      // hideBooksLoadingAnimation();
    })
    .catch((error) => {
      console.error("Error:", error);
      // hideBooksLoadingAnimation();
    });
}

async function showBookUpdateModal(sr_no) {
  try {
    showBooksLoadingAnimation();
    // Fetch book details by sr_no
    const response = await fetch(
      `/inventory/books/${encodeURIComponent(sr_no)}`
    );
    if (!response.ok) {
      throw new Error("Failed to retrieve book details.");
    }

    const data = await response.json();
    hideBooksLoadingAnimation();
    // Create the custom prompt
    const customPrompt = document.createElement("div");
    customPrompt.classList.add("custom-prompt2");

    // Populate the prompt with book details
    customPrompt.innerHTML = `
      <div class="prompt-content">
        <h2>Update Book</h2>
       
       <div class="form-group">
    <input type="text" class="form-control" id="titleInput" value="${data.title}" required style="width:6rem;text-align: center;" placeholder=" ">
    <span class="form-control-placeholder">Title</span>
</div>

        
        <div class="form-group">
    <select id="classOfTitleInput" class="form-control" required style="width: 10rem; text-align: center;" placeholder=" ">
        <option value="${data.class_of_title}" selected>${data.class_of_title}</option>
        <!-- List of other options -->
        <option value="Nursery to KG2">Nursery to KG2</option>
        <option value="Nursery to 4th">Nursery to 4th</option>
        <option value="1st to 4th">1st to 4th</option>
        <option value="5th to 10th">5th to 10th</option>
        <option value="1st to 10th">1st to 10th</option>
        <option value="All Class">All Class</option>
        <option value="Nursery">Nursery</option>
        <option value="KG1">KG1</option>
        <option value="KG2">KG2</option>
        <option value="1st">1st</option>
        <option value="2nd">2nd</option>
        <option value="3rd">3rd</option>
        <option value="4th">4th</option>
        <option value="5th">5th</option>
        <option value="6th">6th</option>
        <option value="7th">7th</option>
        <option value="8th">8th</option>
        <option value="9th">9th</option>
        <option value="10th">10th</option>
    </select>
    <span class="form-control-placeholder">Class of Title</span>
</div>

       
      <div class="form-group">
    <input type="number" class="form-control" id="sellingPriceInput" value="${data.selling_price}" required style="width:6rem; text-align: center;" placeholder=" ">
    <span class="form-control-placeholder">Selling Price</span>
</div>

       
       <div class="form-group">
    <input type="number" class="form-control" id="percentMarginInput" value="" required style="width:6rem; text-align: center;" placeholder=" ">
    <span class="form-control-placeholder">Percent Margin</span>
</div>


        
        <div class="form-group">
    <input type="number" class="form-control" id="purchasePriceInput" value="${data.purchase_price}" readonly required style="width: 6rem; text-align: center;">
    <span class="form-control-placeholder">Purchase Price</span>
</div>


        <button id="saveButton" style="background-color: transparent; border: none; color: black; padding: 0; text-align: center; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; font-size: 14px; cursor: pointer; max-height: 100%; border-radius: 20px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); transition: transform 0.2s, box-shadow 0.2s; margin-bottom: 10px;"
        onclick="saveVendor()"
        onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';"
        onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';">
    <img src="../images/conform.png" alt="Save" style="width: 25px; height: 25px; border-radius: 0px; margin: 5px;">
    <span style="margin-right: 10px;">Save</span>
</button>

<button id="cancelButton" style="background-color: transparent; border: none; color: black; padding: 0; text-align: center; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; font-size: 14px; cursor: pointer; max-height: 100%; border-radius: 20px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); transition: transform 0.2s, box-shadow 0.2s; margin-bottom: 10px;"
        onclick="cancelVendor()"
        onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';"
        onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';">
    <img src="../images/cancel.png" alt="Cancel" style="width: 25px; height: 25px; border-radius: 0px; margin: 5px;">
    <span style="margin-right: 10px;">Cancel</span>
</button>

      </div>
    `;

    document.body.appendChild(customPrompt);

    // Function to calculate margin percentage
    function calculateMarginPercentage() {
      const sellingPrice = parseFloat(
        document.getElementById("sellingPriceInput").value
      );
      const purchasePrice = parseFloat(
        document.getElementById("purchasePriceInput").value
      );

      if (!isNaN(sellingPrice) && !isNaN(purchasePrice) && sellingPrice !== 0) {
        const marginPercentage =
          ((sellingPrice - purchasePrice) / sellingPrice) * 100;
        document.getElementById("percentMarginInput").value =
          marginPercentage.toFixed(2);
      } else {
        document.getElementById("percentMarginInput").value = "";
      }
    }

    // Function to calculate purchase price
    function calculatePurchasePrice() {
      const sellingPrice = parseFloat(
        document.getElementById("sellingPriceInput").value
      );
      const marginPercentage = parseFloat(
        document.getElementById("percentMarginInput").value
      );

      if (!isNaN(sellingPrice) && !isNaN(marginPercentage)) {
        const purchasePrice =
          sellingPrice - sellingPrice * (marginPercentage / 100);
        document.getElementById("purchasePriceInput").value =
          purchasePrice.toFixed(2);
      } else {
        document.getElementById("purchasePriceInput").value = "";
      }
    }

    // Attach event listeners to the input fields after the overlay is shown
    document
      .getElementById("sellingPriceInput")
      .addEventListener("input", calculatePurchasePrice);
    document
      .getElementById("percentMarginInput")
      .addEventListener("input", calculatePurchasePrice);

    // Initial calculation on overlay display if values are already present
    calculateMarginPercentage();

    const saveButton = customPrompt.querySelector("#saveButton");
    const cancelButton = customPrompt.querySelector("#cancelButton");

    saveButton.addEventListener("click", async () => {
      showBooksLoadingAnimation();
      customPrompt.remove();
      const updatedTitle = customPrompt.querySelector("#titleInput").value;
      const updatedClassOfTitle =
        customPrompt.querySelector("#classOfTitleInput").value;
      const updatedPurchasePrice = parseFloat(
        customPrompt.querySelector("#purchasePriceInput").value
      );
      const updatedSellingPrice = parseFloat(
        customPrompt.querySelector("#sellingPriceInput").value
      );

      // Validate if book with same details already exists
      if (
        await isDuplicateBook(
          updatedTitle,
          updatedClassOfTitle,
          updatedPurchasePrice,
          updatedSellingPrice,
          sr_no
        )
      ) {
        hideBooksLoadingAnimation();
        showToast(
          "A book with the same title, class, purchase and selling price already exists.",
          true
        );
        return;
      }

      // Validate if a book with the same title already exists
      const originalTitle = data.title; // assuming data.title contains the original title fetched from the server
      if (
        updatedTitle !== originalTitle &&
        (await isTitleDuplicate(updatedTitle, sr_no))
      ) {
        showToast("A book with the same title already exists.", true);
        return;
      }

      try {
        // Update the book details by sr_no
        const response = await fetch(
          `/inventory/books/${encodeURIComponent(sr_no)}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              newTitle: updatedTitle,
              class_of_title: updatedClassOfTitle,
              purchase_price: updatedPurchasePrice,
              selling_price: updatedSellingPrice,
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to update book details.");
        }

        showToast("Book details updated successfully", false);
        await refreshbooksData();
        hideBooksLoadingAnimation();
      } catch (error) {
        console.error("Error updating book details:", error);
        showToast("Failed to update book details", true);
        hideBooksLoadingAnimation();
      }
    });

    cancelButton.addEventListener("click", () => {
      customPrompt.remove();
    });
  } catch (error) {
    console.error("Error:", error);
    hideBooksLoadingAnimation();
  }
}
// Helper function to check for duplicate book
async function isDuplicateBook(
  title,
  classOfTitle,
  purchasePrice,
  sellingPrice,
  sr_no
) {
  try {
    const response = await fetch("/inventory/books");
    if (!response.ok) {
      throw new Error("Failed to fetch books.");
    }

    const books = await response.json();

    return books.some(
      (book) =>
        book.title.trim().toLowerCase() === title.trim().toLowerCase() &&
        book.class_of_title.trim().toLowerCase() ===
          classOfTitle.trim().toLowerCase() &&
        book.purchase_price === purchasePrice &&
        book.selling_price === sellingPrice &&
        book.sr_no !== sr_no // Exclude the book being edited
    );
  } catch (error) {
    console.error("Error checking for duplicate book:", error);
    return false;
  }
}

// Helper function to check for duplicate book title
async function isTitleDuplicate(title, sr_no) {
  try {
    const response = await fetch("/inventory/books");
    if (!response.ok) {
      throw new Error("Failed to fetch books.");
    }

    const books = await response.json();

    return books.some(
      (book) =>
        book.title.trim().toLowerCase() === title.trim().toLowerCase() &&
        book.sr_no !== sr_no // Exclude the book being edited
    );
  } catch (error) {
    console.error("Error checking for duplicate title:", error);
    return false;
  }
}

async function refreshbooksData() {
  showBooksLoadingAnimation();
  document.getElementById("bookssearchField").value = "";
  try {
    const response = await fetch("/inventory/books");
    if (!response.ok) {
      throw new Error("Failed to fetch books data.");
    }
    const data = await response.json();
    displayBooks(data);
  } catch (error) {
    console.error("Error:", error);
    // Handle error if needed
  } finally {
    hideBooksLoadingAnimation();
  }
}

// Call refreshData initially to fetch and display book data when the page is loaded
refreshbooksData();
