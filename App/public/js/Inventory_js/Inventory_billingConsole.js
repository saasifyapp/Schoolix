document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("invoiceForm").addEventListener("submit", function (event) {
        event.preventDefault();

        // Get the selected class from the dropdown
        const classSelect = document.getElementById("classSelect");
        const selectedClass = classSelect.value;

        // Validation: Check if a class is selected
        if (selectedClass === "") {
            const validationMessage = document.getElementById("validationMessage");
            validationMessage.style.display = "block";
            return; // Exit the function to prevent form submission
        } else {
            // Hide validation message if a class is selected
            const validationMessage = document.getElementById("validationMessage");
            validationMessage.style.display = "none";
        }

        // Save the selected class in local storage
        localStorage.setItem("selectedClass", selectedClass); // Save as plain string

        // Redirect to the new page
        window.location.href = "/inventory/generateInvoice";
    });
});
