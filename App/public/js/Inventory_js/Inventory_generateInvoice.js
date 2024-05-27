document.addEventListener("DOMContentLoaded", function () {
    // Retrieve the invoice data from local storage
    const selectedClass = localStorage.getItem("selectedClass");

    if (selectedClass) {
        // Parse the JSON data
        const selectedClass = JSON.parse(selectedClass);

        // Log the data to the console
        console.log("Invoice Data:", selectedClass);
    } else {
        console.log("No data available.");
    }
});