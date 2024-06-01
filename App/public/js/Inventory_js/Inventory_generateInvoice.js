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

    // Retrieve buyer details
    const buyerName = document.getElementById("buyerName").value;
    const buyerMobile = document.getElementById("buyerMobile").value;
    const buyerClass = document.getElementById("buyerClass").value;

    // Retrieve invoice details
    const invoiceNo = document.getElementById("invoiceNo").value;
    const invoiceDate = new Date().toISOString().split('T')[0];

    // Retrieve invoice summary
    const totalAmount = document.getElementById("totalAmount").value;
    const amountPaid = document.getElementById("amountPaid").value;
    const balanceAmount = document.getElementById("balanceAmount").value;

    // Retrieve book details
    const bookRows = document.querySelectorAll("#booksTableBody tr");
    const bookDetails = [];
    bookRows.forEach((row, index) => {
        const title = row.cells[0].innerText;
        const quantity = row.cells[1].querySelector('input').value;
        const unitPrice = row.cells[2].innerText;
        const price = row.cells[3].innerText;

        if (parseInt(quantity) > 0) {
            bookDetails.push({ title, quantity, unitPrice, price });
        }
    });

    // Retrieve uniform details
    const uniformRows = document.querySelectorAll("#uniformsTableBody tr");
    const uniformDetails = [];
    uniformRows.forEach((row, index) => {
        const item = row.cells[0].innerText;
        const size = row.cells[1].querySelector('select').value;
        const quantity = row.cells[2].querySelector('input').value;
        const unitPrice = row.cells[3].innerText;
        const price = row.cells[4].innerText;

        if (parseInt(quantity) > 0) {
            uniformDetails.push({ item, size, quantity, unitPrice, price });
        }
    });

    // Construct the bill HTML
    const billHtml = `
    <div class="page-header text-blue-d2">
        <h1 class="page-title text-secondary-d1">Invoice <small class="page-info"><i class="fa fa-angle-double-right text-80"></i> ID: #${invoiceNo}</small></h1>
    </div>
    <div class="container px-0">
        <div class="row mt-4">
            <div class="col-12 col-lg-12">                
                
                <div class="row">
                    <div class="col-sm-6">
                        <div>
                            <span class="text-sm text-grey-m2 align-middle">To:</span>
                            <span class="text-600 text-110 text-blue align-middle">${buyerName}</span>
                        </div>
                        <div class="text-grey-m2">
                            <div class="my-1">Class: ${buyerClass}</div>
                            <div class="my-1"><i class="fa fa-phone fa-flip-horizontal text-secondary"></i> <b class="text-600">${buyerMobile}</b></div>
                        </div>
                    </div>
                    <div class="text-95 col-sm-6 align-self-start d-sm-flex justify-content-end">
                        <div class="text-grey-m2">
                            <div class="mt-1 mb-2 text-secondary-m1 text-600 text-125">Invoice</div>
                            <div class="my-2"><i class="fa fa-circle text-blue-m2 text-xs mr-1"></i> <span class="text-600 text-90">ID:</span> #${invoiceNo}</div>
                            <div class="my-2"><i class="fa fa-circle text-blue-m2 text-xs mr-1"></i> <span class="text-600 text-90">Issue Date:</span> ${invoiceDate}</div>
                            <div class="my-2"><i class="fa fa-circle text-blue-m2 text-xs mr-1"></i> <span class="text-600 text-90">Status:</span> <span class="badge badge-warning badge-pill px-25">Unpaid</span></div>
                        </div>
                    </div>
                </div>
                <div class="table-container"  >
                    <table class="table table-striped table-borderless border-0 border-b-2 brc-default-l1" style="height:100%">
                        <thead class="bg-none bgc-default-tp1">
                            <tr class="text-white">
                                <th class="opacity-2">#</th>
                                <th>Title</th>
                                <th>Qty</th>
                                <th>Unit Price</th>
                                <th width="140">Amount</th>
                            </tr>
                        </thead>
                        <tbody class="text-95 text-secondary-d3" style="overflow: auto; ">
                            ${bookDetails.map((book, index) => `
                                <tr>
                                    <td>${index + 1}</td>
                                    <td>${book.title}</td>
                                    <td>${book.quantity}</td>
                                    <td>${book.unitPrice}</td>
                                    <td>${book.price}</td>
                                </tr>
                            `).join('')}
                            ${uniformDetails.map((uniform, index) => `
                                <tr>
                                    <td>${index + bookDetails.length + 1}</td>
                                    <td>${uniform.item} (Size: ${uniform.size})</td>
                                    <td>${uniform.quantity}</td>
                                    <td>${uniform.unitPrice}</td>
                                    <td>${uniform.price}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                <div class="row mt-3">
                    <div class="col-12 col-sm-7 text-grey-d2 text-95 mt-2 mt-lg-0">
                        
                    </div>
                    <div class="col-12 col-sm-5 text-grey text-90 order-first order-sm-last">
                        <div class="row my-2">
                            <div class="col-7 text-right">SubTotal</div>
                            <div class="col-5"><span class="text-120 text-secondary-d1">${totalAmount}</span></div>
                        </div>
                        <div class="row my-2">
                            <div class="col-7 text-right">Paid Amount</div>
                            <div class="col-5"><span class="text-110 text-secondary-d1">${amountPaid}</span></div>
                        </div>
                        <div class="row my-2 align-items-center bgc-primary-l3 p-2">
                            <div class="col-7 text-right">Balance Amount</div>
                            <div class="col-5"><span class="text-150 text-success-d3 opacity-2">${balanceAmount}</span></div>
                        </div>
                    </div>
                </div>
                <hr />
                <div>
                    <span class="text-secondary-d1 text-105">Thank you for your business</span>
                    <a href="#" class="btn btn-info btn-bold px-4 float-right mt-3 mt-lg-0">Pay Now</a>
                </div>
            </div>
        </div>
    </div>
`;


    // Insert the bill HTML into the display container
    document.querySelector(".section.bill .table-container .page-content").innerHTML = billHtml;
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


function printContainer() {
    var printContents = document.getElementById("printableContainer").innerHTML;
    var originalContents = document.body.innerHTML;

    // Create a new window to hold the content for printing
    var printWindow = window.open('', '', 'height=500, width=800');

    // Write the container content to the new window
    printWindow.document.write('<html><head><title>Print Invoice</title>');
    printWindow.document.write('<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">');
    printWindow.document.write('</head><body>');
    printWindow.document.write(printContents);
    printWindow.document.write('</body></html>');

    printWindow.document.close(); // Close the document to trigger the onload event
    printWindow.print(); // Print the content

    // Close the print window
    printWindow.close();
}
