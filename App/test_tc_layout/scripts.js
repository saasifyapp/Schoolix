function printContent() {
    window.print();
}

document.addEventListener('DOMContentLoaded', () => {
    const table = document.querySelector('.content-table');
    const rowCount = table.querySelectorAll('tbody tr').length; // Count rows in tbody
    table.style.setProperty('--row-count', rowCount); // Set CSS variable
});