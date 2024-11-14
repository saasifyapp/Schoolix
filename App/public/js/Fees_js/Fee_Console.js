document.addEventListener('DOMContentLoaded', function () {
    // Main Overlay Elements
    const feeCategoryOverlay = document.getElementById('feeCategoryOverlay');
    const feeAmountOverlay = document.getElementById('feeAmountOverlay');
    const createCategoryOverlay = document.getElementById('createCategoryOverlay');
    const editCategoryOverlay = document.getElementById('editCategoryOverlay');
    const setAmountOverlay = document.getElementById('setAmountOverlay'); // Set Amount Overlay
    const editFeeAmountOverlay = document.getElementById('editFeeAmountOverlay'); // Edit Fee Amount Overlay

    // Buttons
    const feeCategoryButton = document.getElementById('feeCategoryButton');
    const feeAmountButton = document.getElementById('feeAmountButton');
    const createCategoryButton = document.getElementById('createCategoryButton');
    const editCategoryButton = document.getElementById('editCategoryButton');
    const setFeeAmountButton = document.getElementById('setFeeAmountButton'); // Set Fee Amount Button
    const editFeeAmountButton = document.getElementById('editFeeAmountButton'); // Edit Fee Amount Button
    const closeFeeCategoryOverlay = document.getElementById('closeFeeCategoryOverlay');
    const closeFeeAmountOverlay = document.getElementById('closeFeeAmountOverlay');
    const closeCreateCategoryOverlay = document.getElementById('closeCreateCategoryOverlay');
    const closeEditCategoryOverlay = document.getElementById('closeEditCategoryOverlay');
    const closeSetAmountOverlay = document.getElementById('closeSetAmountOverlay'); // Close button for Set Amount Overlay
    const closeEditFeeAmountOverlay = document.getElementById('closeEditFeeAmountOverlay'); // Close button for Edit Fee Amount Overlay

    // Initial setup: hide all overlays on page load
    hideAllOverlays();

    // Show Fee Category Overlay
    feeCategoryButton.addEventListener('click', function () {
        hideAllOverlays();
        showOverlay('feeCategoryOverlay');
    });

    // Show Fee Amount Overlay
    feeAmountButton.addEventListener('click', function () {
        hideAllOverlays();
        showOverlay('feeAmountOverlay');
    });

    // Show Create Category Overlay
    createCategoryButton.addEventListener('click', function () {
        hideAllOverlays();
        showOverlay('createCategoryOverlay');
    });

    // Show Edit Category Overlay
    editCategoryButton.addEventListener('click', function () {
        hideAllOverlays();
        showOverlay('editCategoryOverlay');
    });

    // Show Set Amount Overlay (When the button is clicked)
    setFeeAmountButton.addEventListener('click', function () {
        hideAllOverlays();
        showOverlay('setAmountOverlay');
    });

    // Show Edit Fee Amount Overlay (When the button is clicked)
    editFeeAmountButton.addEventListener('click', function () {
        hideAllOverlays();
        showOverlay('editFeeAmountOverlay');
    });

    // Close Fee Category Overlay
    closeFeeCategoryOverlay.addEventListener('click', function () {
        feeCategoryOverlay.style.display = 'none';
    });

    // Close Fee Amount Overlay
    closeFeeAmountOverlay.addEventListener('click', function () {
        feeAmountOverlay.style.display = 'none';
    });

    // Close Create Category Overlay
    closeCreateCategoryOverlay.addEventListener('click', function () {
        createCategoryOverlay.style.display = 'none';
    });

    // Close Edit Category Overlay
    closeEditCategoryOverlay.addEventListener('click', function () {
        editCategoryOverlay.style.display = 'none';
    });

    // Close Set Amount Overlay
    closeSetAmountOverlay.addEventListener('click', function () {
        setAmountOverlay.style.display = 'none';
    });

    // Close Edit Fee Amount Overlay
    closeEditFeeAmountOverlay.addEventListener('click', function () {
        editFeeAmountOverlay.style.display = 'none';
    });

    // Hide all overlays function
    function hideAllOverlays() {
        feeCategoryOverlay.style.display = 'none';
        feeAmountOverlay.style.display = 'none';
        createCategoryOverlay.style.display = 'none';
        editCategoryOverlay.style.display = 'none';
        setAmountOverlay.style.display = 'none'; // Hide Set Amount Overlay
        editFeeAmountOverlay.style.display = 'none'; // Hide Edit Fee Amount Overlay
    }

    // Show overlay by ID function
    function showOverlay(overlayId) {
        const overlay = document.getElementById(overlayId);
        if (overlay) {
            overlay.style.display = 'flex';
        }
    }

    // Optional: Close overlay when clicking outside of content
    window.addEventListener('click', function (event) {
        if (event.target.classList.contains('overlay')) {
            event.target.style.display = 'none';
        }
    });
});


function exportTableToCSV(tableId, filename) {
    const table = document.getElementById(tableId);
    const rows = table.querySelectorAll("tr");

    let csvContent = "";
    const headers = table.querySelectorAll("th");
    const headerData = [];
    headers.forEach((header) => {
        headerData.push(`"${header.textContent}"`);
    });
    csvContent += headerData.join(",") + "\n";

    rows.forEach((row) => {
        const cells = row.querySelectorAll("td");
        if (cells.length > 0) { // Only process rows with data cells
            const rowData = [];
            cells.forEach((cell) => {
                rowData.push(`"${cell.textContent}"`);
            });
            csvContent += rowData.join(",") + "\n";
        }
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (navigator.msSaveBlob) {
        // IE 10+
        navigator.msSaveBlob(blob, filename);
    } else {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

function exportFeeCategoryTable() {
    exportTableToCSV("feeCategoriesTable", "fee_category.csv");
}

function exportFeeStructureTable() {
    exportTableToCSV("feeStructuresTable", "fee_structure.csv");
}