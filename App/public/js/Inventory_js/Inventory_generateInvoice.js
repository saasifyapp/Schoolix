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


    // Populate Class Field Dynamically based on dropdown value from previous page //
    
    // Retrieve the selected class from local storage
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
                console.log("Books Data:", booksData);
                console.log("Uniforms Data:", uniformsData);

                // Populate the books table
                const booksTableBody = document.getElementById("booksTableBody");
                booksData.forEach(book => {
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${book.title}</td>
                        <td><input type="number" class="form-control" value="1" min="1"></td>
                        <td>${book.selling_price}</td>
                    `;
                    booksTableBody.appendChild(row);
                });

                // Populate the uniform table

                 const uniformsTableBody = document.getElementById("uniformsTableBody");
                 uniformsData.forEach(uniform => {
                     const row = document.createElement("tr");
                     row.innerHTML = `
                         <td>${uniform.uniform_item}</td>
                         <td>${uniform.size_of_item}</td>
                         <td><input type="number" class="form-control" value="1" min="1"></td>
                         <td>${uniform.selling_price}</td>
                     `;
                     uniformsTableBody.appendChild(row);
                 });
            })
            .catch(error => {
                console.error("Error fetching data:", error);
            });
    } else {
        console.log("No selected class available.");
    }
});
