document.addEventListener("DOMContentLoaded", function () {
    // Populate date dynamically in Date Field //

    // Get today's date
    const today = new Date();

    // Format the date as "DD-MM-YYYY"
    const formattedDate = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;

    // Get the day of the week
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = daysOfWeek[today.getDay()];

    // Set the value of the "Date" input field and make it readonly
    const dateInput = document.getElementById("invoiceDate");
    dateInput.value = `${formattedDate} (${dayOfWeek})`;
    dateInput.setAttribute("readonly", true);

    // Populate Class Field Dynamically based on dropdown value from previous page
    const selectedClass = localStorage.getItem("selectedClass");

    if (selectedClass) {
        // Set the value of the "Class" input field 
        const classInput = document.getElementById("buyerClass");
        classInput.value = selectedClass;

        // Fetch books based on the selected class
        const fetchBooks = fetch("/inventory/generate_invoice/get_books", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ class: selectedClass })
        }).then(response => response.json());

        // Fetch all uniforms
        const fetchUniforms = fetch("/inventory/generate_invoice/get_uniforms").then(response => response.json());

        // Use Promise.all to wait for both requests to complete
        Promise.all([fetchBooks, fetchUniforms])
            .then(([booksData, uniformsData]) => {
                // Populate the books table
                const booksTableBody = document.getElementById("booksTableBody");
                booksData.forEach(book => {
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${book.title}</td>
                        <td><input type="number" class="form-control" value="1" min="1"></td>
                        <td>${book.selling_price}</td>
                        <td class="total-price">${book.selling_price}</td>
                    `;
                    booksTableBody.appendChild(row);
                });

                // Populate the uniforms table
                const groupedUniforms = {};
                uniformsData.forEach(uniform => {
                    if (!groupedUniforms[uniform.uniform_item]) {
                        groupedUniforms[uniform.uniform_item] = [];
                    }
                    groupedUniforms[uniform.uniform_item].push({ size: uniform.size_of_item, price: uniform.selling_price });
                });

                const uniformsTableBody = document.getElementById("uniformsTableBody");
                Object.keys(groupedUniforms).forEach(uniformName => {
                    const row = document.createElement("tr");
                    let sizeOptions = "";
                    groupedUniforms[uniformName].forEach(uniform => {
                        sizeOptions += `<option value="${uniform.size}">${uniform.size}</option>`;
                    });
                    row.innerHTML = `
        <td>${uniformName}</td>
        <td>
            <select class="form-control" onchange="updatePrice(this)">
                ${sizeOptions}
            </select>
        </td>
        <td><input type="number" class="form-control" value="1" min="1"></td>
        <td class="price">${groupedUniforms[uniformName][0].price}</td>
        <td class="total-price">${groupedUniforms[uniformName][0].price}</td>
    `;
                    uniformsTableBody.appendChild(row);
                    row.querySelector('select').addEventListener('change', function () {
                        updatePrice(this);
                    });
                });

                // Update summary once tables are populated
                updateSummary();
            })
            .catch(error => {
                console.error("Error fetching data:", error);
            });

    } else {
        console.log("No selected class available.");
    }


    // Fetch and display the last invoice number
    fetch("/inventory/generate_invoice/getLast_invoice_number")
        .then(response => response.json())
        .then(data => {
            // Display the last invoice number received from the server
            document.getElementById("invoiceNo").value = data.lastInvoiceNumber + 1;
            // Set invoiceNo field as readonly
            document.getElementById("invoiceNo").setAttribute("readonly", true);
        })
        .catch(error => {
            console.error("Error fetching last invoice number:", error);
        });
});



////////////////////////////////////////////////////////////////////////////////////////////////////////////


// Function to update the total amount and balance
function updateSummary() {
    let totalAmount = 0;

    // Calculate total for books
    const booksTableBody = document.getElementById("booksTableBody");
    booksTableBody.querySelectorAll("tr").forEach(row => {
        const quantity = parseInt(row.querySelector("input[type='number']").value) || 0;
        const price = parseFloat(row.cells[2].textContent);
        const totalPriceCell = row.querySelector(".total-price");
        const totalPrice = quantity * price;
        totalPriceCell.textContent = totalPrice; // Update total price for each book
        totalAmount += totalPrice;
    });

    // Calculate total for uniforms
    const uniformsTableBody = document.getElementById("uniformsTableBody");
    uniformsTableBody.querySelectorAll("tr").forEach(row => {
        const quantity = parseInt(row.querySelector("input[type='number']").value) || 0;
        const price = parseFloat(row.querySelector(".price").textContent);
        const totalPriceCell = row.querySelector(".total-price");
        const totalPrice = quantity * price;
        totalPriceCell.textContent = totalPrice; // Update total price for each uniform
        totalAmount += totalPrice;
    });

    document.getElementById("totalAmount").value = totalAmount;

    // Update balance based on amount paid
    const amountPaid = parseFloat(document.getElementById("amountPaid").value) || 0;
    const balanceAmount = totalAmount - amountPaid;
    document.getElementById("balanceAmount").value = balanceAmount;
}

// Event listener for amount paid input
document.getElementById("amountPaid").addEventListener("input", updateSummary);

// Event listeners for quantity inputs
document.addEventListener("input", function (event) {
    if (event.target.matches("input[type='number']")) {
        updateSummary();
    }
});

// Ensure that the updateSummary function runs after the initial DOM update
setTimeout(updateSummary, 100); // Add a slight delay to ensure the DOM is fully updated

// Function to update the price when size is selected
function updatePrice(selectElement) {
    const selectedSize = selectElement.value;
    const row = selectElement.closest('tr');
    const uniformName = row.cells[0].textContent;

    // Fetch price for the selected size from the server
    fetch("/inventory/generate_invoice/get_uniform_price", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ uniformName: uniformName, size: selectedSize })
    })
        .then(response => response.json())
        .then(data => {
            // Update the price column with the fetched price
            row.querySelector('.price').textContent = data.price;
            row.querySelector('.total-price').textContent = (data.price * parseInt(row.querySelector("input[type='number']").value) || 0);
            updateSummary(); // Update summary when price changes
        })
        .catch(error => {
            console.error("Error fetching price:", error);
        });
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/*****************************        GENERATE BUTTON FUNCTIONALITY     *********************** */

document.getElementById("generateButton").addEventListener("click", function () {
    // Get buyer details from input fields
    var buyerName = document.getElementById("buyerName").value;
    var buyerMobile = document.getElementById("buyerMobile").value;
    var amountPaid = document.getElementById("amountPaid").value;
    var buyerClass = document.getElementById("buyerClass").value;

    // Validate required fields
    if (!buyerName || !buyerMobile || !amountPaid) {
        showToast("Name, Mobile, or Paid amount must not be empty.", true);
        return; // Stop execution if validation fails
    }

    // Validate mobile number length
    if (buyerMobile.length !== 10) {
        showToast("Mobile number must be 10 digits long.", true);
        return; // Stop execution if validation fails
    }

    // Send a request to the server to check if the buyer exists for the given class
    fetch("/inventory/generate_invoice/check_buyer", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ buyerName: buyerName, buyerClass: buyerClass })
    })
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error("Error checking buyer");
        })
        .then(data => {
            if (data.exists) {
                // Buyer exists for the given class
                // Show a toast message indicating that the buyer already exists
                showToast("Invoice for this name already exists", 'red');
            } else {
                // Buyer does not exist for the given class
                // Proceed with generating the bill
                generateBill();
            }
        })
        .catch(error => {
            console.error("Error:", error);
            showToast("An error occurred while checking the buyer.", true);
        });
});

function generateBill() {
    showToast('Invoice Generated Successfully.');

    // Logic to Displa the bill goes here //
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////

/*****************************         PRINT BUTTON FUNCTIONALITY       ************************/

document.getElementById("printButton").addEventListener("click", function () {
    
    // Add validation to execute this only when the bill is generated i.e. displayed on the front-end

    // Get buyer details
    var buyerName = document.getElementById("buyerName").value;
    var buyerMobile = document.getElementById("buyerMobile").value;
    var buyerClass = document.getElementById("buyerClass").value;

    // Get invoice details
    var invoiceNo = document.getElementById("invoiceNo").value;

    // Get current date
    var currentDate = new Date();
    var invoiceDate = currentDate.toISOString().split('T')[0];

    // Get invoice summary
    var totalAmount = document.getElementById("totalAmount").value;
    var amountPaid = document.getElementById("amountPaid").value;
    var balanceAmount = document.getElementById("balanceAmount").value;

    // Validate required fields
    if (!buyerName || !buyerMobile || !amountPaid) {
        showToast("Name or Mobile or Paid amount must not be empty.", true);
        return; // Stop execution if validation fails
    }

    // Get book details, filtering out items with quantity 0 or null
    var bookRows = document.querySelectorAll("#booksTableBody tr");
    var bookDetails = [];
    bookRows.forEach(row => {
        var title = row.cells[0].innerText;
        var quantity = row.cells[1].querySelector('input').value; // Get input value instead of cell text

        if (parseInt(quantity) > 0) {
            bookDetails.push({ title, class: buyerClass, quantity });
        }
    });

    // Get uniform details, filtering out items with quantity 0 or null
    var uniformRows = document.querySelectorAll("#uniformsTableBody tr");
    var uniformDetails = [];
    uniformRows.forEach(row => {
        var item = row.cells[0].innerText;
        var size = row.cells[1].querySelector('select').value; // Get select value instead of cell text
        var quantity = row.cells[2].querySelector('input').value; // Get input value instead of cell text

        if (parseInt(quantity) > 0) {
            uniformDetails.push({ item, size, quantity });
        }
    });

    // Create the request body
    var requestBody = JSON.stringify({
        buyerName: buyerName,
        buyerMobile: buyerMobile,
        buyerClass: buyerClass,
        invoiceNo: invoiceNo,
        invoiceDate: invoiceDate,
        totalAmount: totalAmount,
        amountPaid: amountPaid,
        balanceAmount: balanceAmount,
        bookDetails: bookDetails,
        uniformDetails: uniformDetails
    });

    // Send the data to the server for invoice details
    fetch("/inventory/generate_invoice/invoice_details", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: requestBody
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        }
        throw new Error("Error inserting invoice details");
    })
    .then(data => {
        showToast("Invoice saved successfully");

        // Send the data to the server for invoice items
        fetch("/inventory/generate_invoice/invoice_items", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: requestBody
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error("Error inserting invoice items");
        })
        .then(data => {
            showToast("Stock updated successfully.");
            setTimeout(function () {
                window.location.reload(); // Reload the page after showing the toast message
            }, 1000); // Match the duration of the toast message
        })
        .catch(error => {
            console.error("Error:", error);
            showToast("Error: An error occurred while inserting invoice items.");
        });
    })
    .catch(error => {
        console.error("Error:", error);
        if (error.message.includes("Error inserting invoice details: Error: Duplicate entry")) {
            showToast("Error: Duplicate entry found. Please try again.");
        } else {
            showToast("Error: An error occurred while inserting invoice details.");
        }
    });
});


/////////////////////////////////////////////////////////////////////////////////////////////////////////

/*****************************         RESET BUTTON FUNCTIONALITY       ************************/


document.getElementById("resetButton").addEventListener("click", function () {
    // Ask for confirmation before reloading the page
    if (confirm("Are you sure you want to reset the form?")) {
        window.location.reload(); // Reload the page after user confirmation
    }
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////

function showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(function () {
        toast.classList.remove("show");
    }, 4000);
}