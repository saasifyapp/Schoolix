// Function to show the loading animation
function showInventoryLoadingAnimation() {
    var loadingOverlay = document.getElementById("loadingOverlayInventory");
    loadingOverlay.style.display = "flex"; // Hide the loading overlay
}

// Function to hide the loading animation
function hideInventoryLoadingAnimation() {
    var loadingOverlay = document.getElementById("loadingOverlayInventory");
    loadingOverlay.style.display = "none"; // Hide the loading overlay
}

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
        showInventoryLoadingAnimation();
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
                        <td><input type="number" class="form-control-table" value="1" min="1"  style="width: 3rem"></td>
                        <td>${book.selling_price}</td>
                        <td class="total-price">${book.selling_price}</td>
                        <td class="class-of-title" style="display: none;">${book.class_of_title}</td>
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
            <select class="form-control-table" onchange="updatePrice(this)">
                ${sizeOptions}
            </select>
        </td>
        <td><input type="number" class="form-control-table" value="1" min="1" style="width: 3rem"></td>
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
                hideInventoryLoadingAnimation();
            });

    } else {
        console.log("No selected class available.");
        hideInventoryLoadingAnimation();
    }


    // Fetch and display the last invoice number
    fetch("/inventory/generate_invoice/getLast_invoice_number")
        .then(response => response.json())
        .then(data => {
            // Display the last invoice number received from the server
            document.getElementById("invoiceNo").value = data.lastInvoiceNumber + 1;
            // Set invoiceNo field as readonly
            document.getElementById("invoiceNo").setAttribute("readonly", true);
            hideInventoryLoadingAnimation();
        })
        .catch(error => {
            hideInventoryLoadingAnimation();
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


/////////////////////////////////////////// GENERATE BUTTON FUNCTIONALITY TEST ////////////////////////////////////////////////////////////////////
document.addEventListener('DOMContentLoaded', () => {
    const generateButton = document.getElementById('generateButton');
    const initialImage = document.querySelector('dotlottie-player');
    const billContainer = document.getElementById('invoiceDetails');

    generateButton.addEventListener('click', () => {
        // Call function to generate the bill details
        if (generateBill_test()) {
            // Hide the initial image
            initialImage.style.display = 'none';
            // Show the bill container
            billContainer.style.display = 'block';
        }
    });
});

function generateBill_test() {
    // Validate Buyer Details
    const buyerName = document.getElementById('buyerName').value.trim();
    const buyerMobile = document.getElementById('buyerMobile').value.trim();
    const buyerClass = document.getElementById('buyerClass').value.trim();
    if (!buyerName || !buyerMobile || !buyerClass) {
        alert("Please fill in all the Buyer Details fields.");
        return false;
    }

    // Validate Invoice Summary
    const totalAmount = document.getElementById('totalAmount').value.trim();
    const amountPaid = document.getElementById('amountPaid').value.trim();
    const balanceAmount = document.getElementById('balanceAmount').value.trim();
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked');
    if (!totalAmount || !amountPaid || !balanceAmount || !paymentMethod) {
        alert("Please fill in all the Invoice Summary fields.");
        return false;
    }

    // Fetch and populate books table data
    const booksTableRows = document.querySelectorAll('#booksTable tbody tr');
    const booksData = [];
    booksTableRows.forEach(row => {
        const title = row.children[0].textContent;
        const quantity = parseInt(row.querySelector('input[type="number"]').value);
        const unitPrice = parseFloat(row.children[2].textContent);
        const total = quantity * unitPrice;
        booksData.push({ title, quantity, unitPrice, total });
    });

    // Fetch and populate uniforms table data
    const uniformsTableRows = document.querySelectorAll('#uniformsTable tbody tr');
    const uniformsData = [];
    uniformsTableRows.forEach(row => {
        const item = row.children[0].textContent;
        const size = row.querySelector('select').value;
        const quantity = parseInt(row.querySelector('input[type="number"]').value);
        const unitPrice = parseFloat(row.children[3].textContent);
        const total = quantity * unitPrice;
        uniformsData.push({ item, size, quantity, unitPrice, total });
    });

    // Combine books and uniforms data into one array for the bill
    const billData = [...booksData, ...uniformsData];

    // Clear previous bill details if needed
    const billTableBody = document.getElementById('billTableBody');
    billTableBody.innerHTML = '';

    // Populate items into the bill table
    billData.forEach((item, index) => {
        console.log('Item:', item); // Debugging: Check item data

        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="padding: 8px;">${index + 1}</td>
            <td style="padding: 8px;">${item.title || `${item.item} (Size: ${item.size})`}</td>
            <td style="padding: 8px;">${item.unitPrice.toFixed(2)}</td>
            <td style="padding: 8px;">${item.quantity}</td>
            <td style="padding: 8px;">${item.total.toFixed(2)}</td>
        `;
        billTableBody.appendChild(row);
    });

    // Calculate sub-total and grand total
    let subTotal = 0;
    billData.forEach(item => {
        subTotal += item.total;
    });
    document.getElementById('subTotal').textContent = subTotal.toFixed(2);
    document.getElementById('grandTotal').textContent = subTotal.toFixed(2); // For now, grand total same as sub-total

    // Fetch and populate buyer details in the bill
    const buyerDetails = document.querySelector('#invoiceDetails .buyer-details');
    buyerDetails.querySelector('h6').textContent = buyerName;
    const buyerDetailsList = buyerDetails.querySelectorAll('ul li');
    buyerDetailsList[0].textContent = `Class: ${buyerClass}`;
    buyerDetailsList[1].textContent = `Phone: ${buyerMobile}`;

    // Fetch and populate invoice details in the bill
    const invoiceNo = document.getElementById('invoiceNo').value;
    const invoiceDate = document.getElementById('invoiceDate').value;
    const invoiceStatus = 'Pending'; // Assuming the default status is 'Pending'

    const invoiceDetails = document.querySelector('#invoiceDetails .invoice-details');
    const invoiceDetailsList = invoiceDetails.querySelectorAll('ul li');
    invoiceDetails.querySelector('h6').textContent = buyerName;
    invoiceDetailsList[0].textContent = `Invoice No.: ${invoiceNo}`;
    invoiceDetailsList[1].textContent = `Date: ${invoiceDate}`;
    invoiceDetailsList[2].textContent = `Status: ${invoiceStatus}`;

    return true;
}


/*****************************        GENERATE BUTTON FUNCTIONALITY     *********************** */

// UNCOMMENT WHEN GENERATE INVOICE IS COMPLETELY BUILD ////////

// At the bottom of this function, call a function to create the invoice ///

// document.getElementById("generateButton").addEventListener("click", async function () {
//     showInventoryLoadingAnimation();
//     // Retrieve payment method
//     const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value;

//     // Get buyer details from input fields
//     var buyerName = document.getElementById("buyerName").value;
//     var buyerMobile = document.getElementById("buyerMobile").value;
//     var amountPaid = document.getElementById("amountPaid").value;
//     var buyerClass = document.getElementById("buyerClass").value;

//     // Validate required fields
//     if (!buyerName || !buyerMobile || !amountPaid) {
//         hideInventoryLoadingAnimation();
//         showToast("Name, Mobile, or Paid amount must not be empty.", true);
//         return; // Stop execution if validation fails
//     }

//     // Validate mobile number length
//     if (buyerMobile.length !== 10) {
//         hideInventoryLoadingAnimation();
//         showToast("Mobile number must be 10 digits long.", true);
//         return; // Stop execution if validation fails
//     }

//     // Send a request to the server to check if the buyer exists for the given class
//     try {
//         const response = await fetch("/inventory/generate_invoice/check_buyer", {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json"
//             },
//             body: JSON.stringify({ buyerName: buyerName, buyerClass: buyerClass })
//         });

//         if (response.ok) {
//             const data = await response.json();
//             if (data.exists) {
//                 hideInventoryLoadingAnimation();
//                 // Buyer exists for the given class
//                 // Show a toast message indicating that the buyer already exists
//                 showToast("Invoice for this name already exists", 'red');
//             } else {
//                 hideInventoryLoadingAnimation();
//                 // Check if the payment method is selected
//                 if (!paymentMethod) {
//                     showToast("Please select a payment method", true);
//                     return;
//                 } else {
//                     // Buyer does not exist for the given class
//                     // Proceed with generating the bill
//                     lowStockCheck();
//                 }
//             }
//         } else {
//             throw new Error("Error checking buyer");
//         }
//     } catch (error) {
//         hideInventoryLoadingAnimation();
//         console.error("Error:", error);
//         showToast("An error occurred while checking the buyer.", true);
//     }
// });

// Determine payment status
let paymentStatus = '';
let badgeClass = '';

async function lowStockCheck() {
    // Initialize objects for books and uniforms
    let Books = [];
    let Uniforms = [];

    // Check book details
    const bookRows = document.querySelectorAll("#booksTableBody tr");
    bookRows.forEach((row, index) => {
        const title = row.cells[0].innerText;
        const quantity = row.cells[1].querySelector('input').value;

        if (parseInt(quantity) > 0) {
            Books.push({ title, quantity: parseInt(quantity) });  // Add the non-zero quantity items to Books object
        }
    });

    // Check uniform details
    const uniformRows = document.querySelectorAll("#uniformsTableBody tr");
    uniformRows.forEach((row, index) => {
        const item = row.cells[0].innerText;
        const size = row.cells[1].querySelector('select').value;
        const quantity = row.cells[2].querySelector('input').value;

        if (parseInt(quantity) > 0) {
            Uniforms.push({ item, size, quantity: parseInt(quantity) });  // Add the non-zero quantity items to Uniforms object
        }
    });

    // If both Books and Uniforms arrays are empty, show a toast and return
    if (Books.length === 0 && Uniforms.length === 0) {
        showToast('No items to check in inventory!', 'red');
        return;
    }

    let lowStockMessagesBooks = [];
    let lowStockMessagesUniforms = [];
    let insufficientItemsBooks = [];
    let insufficientItemsUniforms = [];
    let zeroQuantity = false; // Flag to check if any quantity is zero

    // Fetch remaining quantities for books
    try {
        if (Books.length > 0) {
            const responseBooks = await fetch("/inventory/generate_invoice/get_book_quantities", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ bookTitles: Books.map(book => book.title) })
            });

            const dataBooks = await responseBooks.json();
            // Check if any book quantity is below 10
            dataBooks.forEach((book, index) => {
                const enteredQuantity = Books[index].quantity;
                if (book.remaining_quantity < 10) {
                    lowStockMessagesBooks.push(`${book.title}: ${book.remaining_quantity} remaining`);
                }
                if (book.remaining_quantity === 0 || book.remaining_quantity < enteredQuantity) {
                    zeroQuantity = true;
                    insufficientItemsBooks.push(`${book.title}: Entered ${enteredQuantity}, Available ${book.remaining_quantity}`);
                }
            });
        }

        // Fetch remaining quantities for uniforms
        if (Uniforms.length > 0) {
            const responseUniforms = await fetch("/inventory/generate_invoice/get_uniform_quantities", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ uniformItems: Uniforms })
            });

            const dataUniforms = await responseUniforms.json();
            // Check if any uniform quantity is below 10
            dataUniforms.forEach((uniform, index) => {
                const enteredQuantity = Uniforms[index].quantity;
                if (uniform.remaining_quantity < 10) {
                    lowStockMessagesUniforms.push(`${uniform.uniform_item} (${uniform.size_of_item}): ${uniform.remaining_quantity} remaining`);
                }
                if (uniform.remaining_quantity === 0 || uniform.remaining_quantity < enteredQuantity) {
                    zeroQuantity = true;
                    insufficientItemsUniforms.push(`${uniform.uniform_item} (${uniform.size_of_item}): Entered ${enteredQuantity}, Available ${uniform.remaining_quantity}`);
                }
            });
        }

        // Show a single alert with all low-stock messages and insufficient items
        if (lowStockMessagesBooks.length > 0 || lowStockMessagesUniforms.length > 0 || insufficientItemsBooks.length > 0 || insufficientItemsUniforms.length > 0) {
            showLowStockAlert(
                lowStockMessagesBooks.join('<br>'),
                lowStockMessagesUniforms.join('<br>'),
                insufficientItemsBooks.join('<br>'),
                insufficientItemsUniforms.join('<br>'),
                zeroQuantity
            );
        } else {
            // If there are no low stock items and no insufficient items, call generateBill()
            generateBill();
        }
    } catch (error) {
        console.error("Error:", error);
        showToast("An error occurred while checking the stock.", true);
    }
}

function showLowStockAlert(bookMessage, uniformMessage, insufficientBooksMessage, insufficientUniformsMessage, zeroQuantity) {
    const modal = document.getElementById('lowStockAlert');
    const proceedBtn = document.getElementById('proceedBtn');
    const closeBtn = document.getElementById('closeBtn');
    const messageContainerBooks = document.getElementById('lowStockMessagesBooks');
    const messageContainerUniforms = document.getElementById('lowStockMessagesUniforms');
    const insufficientBooksContainer = document.getElementById('insufficientBooksMessages');
    const insufficientUniformsContainer = document.getElementById('insufficientUniformsMessages');

    // Display low stock messages if available
    if (messageContainerBooks) {
        messageContainerBooks.innerHTML = bookMessage ? bookMessage : "";
    }
    if (messageContainerUniforms) {
        messageContainerUniforms.innerHTML = uniformMessage ? uniformMessage : "";
    }

    // Display insufficient stock messages if available
    if (insufficientBooksContainer) {
        insufficientBooksContainer.innerHTML = insufficientBooksMessage ? insufficientBooksMessage : "";
    }
    if (insufficientUniformsContainer) {
        insufficientUniformsContainer.innerHTML = insufficientUniformsMessage ? insufficientUniformsMessage : "";
    }

    // Check if there are any messages, if not, show default messages
    if (!bookMessage && !insufficientBooksMessage) {
        messageContainerBooks.innerHTML = "No low stock items for books.";
    }
    if (!uniformMessage && !insufficientUniformsMessage) {
        messageContainerUniforms.innerHTML = "No low stock items for uniforms.";
    }

    modal.style.display = 'block';

    if (zeroQuantity) {
        proceedBtn.disabled = true;
        proceedBtn.style.backgroundColor = '#ccc';
        proceedBtn.style.cursor = 'not-allowed';
        showToast('Certain items are out of stock. Please Restock!', 'red');
    } else {
        proceedBtn.disabled = false;
        proceedBtn.style.backgroundColor = '#4CAF50';
        proceedBtn.style.cursor = 'pointer';
    }

    closeBtn.onclick = function () {
        modal.style.display = 'none';
    }

    proceedBtn.onclick = function () {
        if (!zeroQuantity) {
            modal.style.display = 'none';
            generateBill();  // Call generateBill() when Proceed is clicked
        }
    }

    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }
}
// Call the function

// FUNCTION TO GENERATE BILL //

function generateBill() {
    showToast('Invoice Generated Successfully.');
    // Retrieve payment method
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value;
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


    if (balanceAmount == 0) {
        paymentStatus = 'Paid';
        badgeClass = 'badge-success';
    } else if (amountPaid == 0) {
        paymentStatus = 'Unpaid';
        badgeClass = 'badge-warning';
    } else {
        paymentStatus = 'Balance';
        badgeClass = 'badge-info';
    }

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
                            <div class="my-2"><i class="fa fa-circle text-blue-m2 text-xs mr-1"></i> <span class="text-600 text-90">Status:</span> <span class="badge badge-warning badge-pill px-25">${paymentStatus}</span></div>
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
                        <div class="row my-2 align-items-center bgc-primary-l3 p-2">
                            <div class="col-7 text-right">Mode of Payment</div>
                            <div class="col-5"><span class="text-150 text-success-d3 opacity-2">${paymentMethod}</span></div>
                        </div>
                    </div>
                </div>
                <hr />
                <div>
                    <span class="text-secondary-d1 text-105">Thank you for your business</span>
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

document.getElementById("printButton").addEventListener("click", async function () {
    // Add validation to execute this only when the bill is generated i.e. displayed on the front-end
    if (paymentStatus === '') {
        showToast("Please generate the bill first", true);
        return;
    }

    showInventoryLoadingAnimation();

    try {
        // Retrieve payment method
        const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value;
        // Get buyer details
        const buyerName = document.getElementById("buyerName").value;
        const buyerMobile = document.getElementById("buyerMobile").value;
        const buyerClass = document.getElementById("buyerClass").value;

        // Get invoice details
        const invoiceNo = document.getElementById("invoiceNo").value;

        // Get current date
        const currentDate = new Date();
        const invoiceDate = currentDate.toISOString().split('T')[0];

        // Get invoice summary
        const totalAmount = document.getElementById("totalAmount").value;
        const amountPaid = document.getElementById("amountPaid").value;
        const balanceAmount = document.getElementById("balanceAmount").value;

        // Validate required fields
        if (!buyerName || !buyerMobile || !amountPaid) {
            showToast("Name, Mobile, or Paid amount must not be empty.", true);
            hideInventoryLoadingAnimation();
            return;
        }

        // Get book details, filtering out items with quantity 0 or null
        const bookRows = document.querySelectorAll("#booksTableBody tr");
        const bookDetails = Array.from(bookRows).map(row => {
            const title = row.cells[0].innerText;
            const quantity = row.cells[1].querySelector('input').value; // Get input value instead of cell text
            const book_type = 'Book'; // Set type as 'Book' for book items
            const class_of_title = row.querySelector('.class-of-title').innerText; // Get hidden class
        
            return (parseInt(quantity) > 0) ? { title, class: class_of_title, quantity, book_type } : null;
        }).filter(item => item);

        // Get uniform details, filtering out items with quantity 0 or null
        const uniformRows = document.querySelectorAll("#uniformsTableBody tr");
        const uniformDetails = Array.from(uniformRows).map(row => {
            const item = row.cells[0].innerText;
            const size = row.cells[1].querySelector('select').value; // Get select value instead of cell text
            const quantity = row.cells[2].querySelector('input').value; // Get input value instead of cell text
            const uniform_type = 'Uniform'; // Set type as 'Uniform' for uniform items

            return (parseInt(quantity) > 0) ? { item, size, quantity, uniform_type } : null;
        }).filter(item => item);

        // Create the request body
        const requestBody = JSON.stringify({
            buyerName,
            buyerMobile,
            buyerClass,
            invoiceNo,
            invoiceDate,
            totalAmount,
            amountPaid,
            balanceAmount,
            bookDetails,
            uniformDetails,
            paymentMethod
        });

        // Send the data to the server for invoice details
        const invoiceDetailsResponse = await fetch("/inventory/generate_invoice/invoice_details", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: requestBody
        });

        if (!invoiceDetailsResponse.ok) {
            throw new Error("Error inserting invoice details");
        }
        showToast("Invoice details saved successfully");

        // Send the data to the server for invoice items
        const invoiceItemsResponse = await fetch("/inventory/generate_invoice/invoice_items", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: requestBody
        });

        if (!invoiceItemsResponse.ok) {
            throw new Error("Error inserting invoice items");
        }
        showToast("Invoice items saved successfully");

        // After successfully inserting invoice items, update the remaining quantities
        const updateQuantitiesResponse = await fetch("/inventory/reduce_quantity", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ invoiceNo })
        });

        if (!updateQuantitiesResponse.ok) {
            throw new Error("Error updating remaining quantities");
        }
        showToast("Stock updated successfully");

        // Reload the page after showing the toast message
        setTimeout(() => {
            window.location.reload();
        }, 1000); // Match the duration of the toast message

        printBill(); // PRINT THE BILL WHEN ALL OPERATIONS ARE SUCCESSFULLY COMPLETED //

    } catch (error) {
        console.error("Error:", error);
        showToast(`Error: ${error.message.includes("Duplicate entry") ? "Duplicate entry found. Please try again." : "An error occurred."}`, true);
    } finally {
        hideInventoryLoadingAnimation();
    }
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

function showToast(message, isError) {
    const toastContainer = document.getElementById("toast-container");

    // Create a new toast element
    const toast = document.createElement("div");
    toast.classList.add("toast");
    if (isError) {
        toast.classList.add("error");
    }
    toast.textContent = message;

    // Append the toast to the container
    toastContainer.appendChild(toast);

    // Show the toast
    toast.style.display = 'block';

    // Remove the toast after 4 seconds
    setTimeout(function () {
        toast.style.animation = 'slideOutRight 0.5s forwards';
        toast.addEventListener('animationend', function () {
            toast.remove();
        });
    }, 4000);
}


function printBill() {
    // Create an iframe for printing
    var printFrame = document.createElement('iframe');
    printFrame.style.position = 'absolute';
    printFrame.style.width = '0px';
    printFrame.style.height = '0px';
    printFrame.style.border = 'none';
    document.body.appendChild(printFrame);

    // Get the content of the printable container
    var printContents = document.getElementById('printableContainer').innerHTML;

    // Write the content to the iframe
    var doc = printFrame.contentWindow.document;
    doc.open();
    doc.write('<html><head><title>Print Invoice</title>');
    doc.write('<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">');
    doc.write('<link rel="stylesheet" href="/css/Inventory_Css/InventoryAll.css">');
    doc.write('<link rel="stylesheet" href="/css/Inventory_Css/GenerateInvoice.css">');
    doc.write('<link rel="stylesheet" href="/css/NavButtons.css">');
    doc.write('<style>@media print { body * { visibility: hidden; } #printableContainer, #printableContainer * { visibility: visible; } #printableContainer { position: absolute; left: 0; top: 0; width: 100%; } }</style>');
    doc.write('</head><body>');
    doc.write('<div id="printableContainer">' + printContents + '</div>');
    doc.write('</body></html>');
    doc.close();

    // Print the iframe content
    printFrame.contentWindow.focus();
    printFrame.contentWindow.print();

    // Remove the iframe after printing
    document.body.removeChild(printFrame);
}
//////////////////////NEW COMMIT FOR TESTING //////////////////////
