document.addEventListener("DOMContentLoaded", function () {
    // Get the selected class from local storage
    // const selectedClass = localStorage.getItem("selectedClass");

    // // Display the selected class in the class span
    // if (selectedClass) {
    //     document.getElementById("buyerClass").textContent = selectedClass;
    // }
    // Add event listener to the form submission
    document.getElementById("invoiceForm").addEventListener("submit", function (event) {
        event.preventDefault();

        // Get the selected class from the dropdown
        const classSelect = document.getElementById("classSelect");
        const selectedClass = classSelect.value;

        // Save the selected class in local storage
        localStorage.setItem("selectedClass", selectedClass);

        // Redirect to the new page
        window.location.href = "generate_invoice.html";
    });
});