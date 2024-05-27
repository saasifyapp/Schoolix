document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("invoiceForm").addEventListener("submit", function (event) {
        event.preventDefault();

        // Get the selected class from the dropdown
        const classSelect = document.getElementById("classSelect");
        const selectedClass = classSelect.value;

        //console.log("Selected class:", selectedClass); // Debugging line to check selected class

        // Save the selected class in local storage
        localStorage.setItem("selectedClass", selectedClass); // Save as plain string

        // Redirect to the new page
        window.location.href = "/inventory/generateInvoice";
    });
});
