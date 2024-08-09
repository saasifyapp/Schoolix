document.getElementById('reportButton').addEventListener('click', function() {
    document.getElementById('reportOverlay').style.display = 'block';
    fetchReportData();
});

document.getElementById('closeReportOverlay').addEventListener('click', function() {
    const overlay = document.getElementById('reportOverlay');
    overlay.style.display = 'none';
    document.getElementById('reportTypeDropdown').value = '';
    document.getElementById('filterClassDropdown').disabled = true;
    document.getElementById('filterDateInput').disabled = true;
     // Show the Lottie animation and hide the table
     document.getElementById('lottie-container').style.display = 'flex';
     document.querySelector('.reports-table').style.display = 'none';
});

document.getElementById('reportTypeDropdown').addEventListener('change', function() {
    const reportType = document.getElementById('reportTypeDropdown').value;
    const filterClassDropdown = document.getElementById('filterClassDropdown');
    const filterDateInput = document.getElementById('filterDateInput');

    // Reset class filter to default and date filter to empty
    filterClassDropdown.value = '';
    filterDateInput.value = '';

    // Enable or disable fields based on report type selection
    if (reportType) {
        filterClassDropdown.disabled = false;
        filterDateInput.disabled = false;
        // Hide the Lottie animation and show the table
        document.getElementById('lottie-container').style.display = 'none';
        document.querySelector('.reports-table').style.display = 'table';
    } else {
        filterClassDropdown.disabled = true;
        filterDateInput.disabled = true;
        // Show the Lottie animation and hide the table
        document.getElementById('lottie-container').style.display = 'flex';
        document.querySelector('.reports-table').style.display = 'none';
    }

    fetchReportData();
});

document.getElementById('filterClassDropdown').addEventListener('change', function() {
    // Reset date filter to empty
    document.getElementById('filterDateInput').value = '';
    fetchReportData();
});

document.getElementById('filterDateInput').addEventListener('change', function() {
    // Reset class filter to default
    document.getElementById('filterClassDropdown').value = '';
    fetchReportData();
});

function fetchReportData() {
    const reportType = document.getElementById('reportTypeDropdown').value;
    const filterClass = document.getElementById('filterClassDropdown').value;
    const filterDate = document.getElementById('filterDateInput').value;

    // Clear the table if "Select Report Type" is chosen
    if (!reportType) {
        document.getElementById('reportTableBody').innerHTML = '';
        document.querySelector('.reports-table thead').innerHTML = getTableHeaders('');
        return;
    }

    fetch('/library/get_report_data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reportType, filterClass, filterDate })
    })
    .then(response => response.json())
    .then(data => {
        const reportTableBody = document.getElementById('reportTableBody');
        reportTableBody.innerHTML = ''; // Clear existing rows

        // Update table headers based on report type
        document.querySelector('.reports-table thead').innerHTML = getTableHeaders(reportType);

        if (data.reports.length === 0) {
            // Display a message when no results are found
            reportTableBody.innerHTML = '<tr><td colspan="9">No results found</td></tr>';
        } else {
            data.reports.forEach(report => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${report.memberID}</td>
                    <td>${report.member_name}</td>
                    <td>${report.member_class}</td>
                    <td>${report.bookID}</td>
                    <td>${report.book_name}</td>
                    <td>${convertDateToIST(report.transaction_date)}</td>
                    <td>${report.transaction_type}</td>
                `;

                if (reportType === 'penalty') {
                    row.innerHTML += `
                        <td>${report.penalty_status}</td>
                        <td>${report.penalty_paid}</td>
                    `;
                }

                reportTableBody.appendChild(row);
            });
        }
    })
    .catch(error => {
        console.error('Error fetching report data:', error);
        showToast('Error fetching report data', true);
    });
}

function getTableHeaders(reportType) {
    let headers = `
        <tr>
            <th>Member ID</th>
            <th>Member Name</th>
            <th>Member Class</th>
            <th>Book ID</th>
            <th>Book Name</th>
            <th>Transaction Date</th>
            <th>Transaction Type</th>
    `;
    if (reportType === 'penalty') {
        headers += `
            <th>Penalty Status</th>
            <th>Penalty Paid</th>
        `;
    }
    headers += '</tr>';
    return headers;
}

const convertDateToIST = (date) => {
    const istDate = new Date(date);
    const year = istDate.getFullYear();
    const month = String(istDate.getMonth() + 1).padStart(2, '0');
    const day = String(istDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Initially disable the filter fields
document.getElementById('filterClassDropdown').disabled = true;
document.getElementById('filterDateInput').disabled = true;

document.getElementById('exportButton').addEventListener('click', exportTableToCSV);

function exportTableToCSV() {
    const reportType = document.getElementById('reportTypeDropdown').value;
    const filterClass = document.getElementById('filterClassDropdown').value;
    const filterDate = document.getElementById('filterDateInput').value;

    const reportTable = document.querySelector('.styled-table');
    const reportTableBody = document.getElementById('reportTableBody');

    if (reportTableBody.rows.length === 0) {
        showToast('No data to export.', false);
        return;
    }

    let csvContent = '';
    const headers = Array.from(reportTable.querySelectorAll('thead th')).map(th => th.textContent);
    csvContent += headers.join(',') + '\n';

    const rows = Array.from(reportTableBody.querySelectorAll('tr'));
    rows.forEach(row => {
        const cols = Array.from(row.querySelectorAll('td')).map(col => col.textContent);
        csvContent += cols.join(',') + '\n';
    });

    let fileName = `report_${reportType}`;
    if (filterClass) {
        fileName += `_class_${filterClass}`;
    }
    if (filterDate) {
        fileName += `_date_${filterDate}`;
    }
    fileName += '.csv';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}
