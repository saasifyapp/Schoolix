document.addEventListener("DOMContentLoaded", function () {
    // Retrieve the selected class from local storage
    const selectedClass = localStorage.getItem("selectedClass");

    if (selectedClass) {
        // Log the data to the console
        console.log("Selected Class:", selectedClass);

        // Create a request to get books based on the selected class
        const fetchBooks = fetch("/inventory/generate_invoice/get_books", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ class: selectedClass })
        }).then(response => response.json());

        // Create a request to get all uniforms
        const fetchUniforms = fetch("/inventory/generate_invoice/get_uniforms").then(response => response.json());

        // Use Promise.all to wait for both requests to complete
        Promise.all([fetchBooks, fetchUniforms])
            .then(([booksData, uniformsData]) => {
                console.log("Books Data:", booksData);
                console.log("Uniforms Data:", uniformsData);
                // Process the data as needed
            })
            .catch(error => {
                console.error("Error fetching data:", error);
            });
    } else {
        console.log("No selected class available.");
    }
});
