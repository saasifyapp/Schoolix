document.getElementById('reportButton').addEventListener('click', function() {
    document.getElementById('reportOverlay').style.display = 'block';
    fetchReportData();
});

document.getElementById('closeReportOverlay').addEventListener('click', function() {
    const overlay = document.getElementById('reportOverlay');
    overlay.style.display = 'none';
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
    } else {
        filterClassDropdown.disabled = true;
        filterDateInput.disabled = true;
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
                ${reportType === 'penalty' ? `<td>${report.penalty_status}</td>` : ''}
                ${reportType === 'penalty' ? `<td>${report.penalty_paid}</td>` : ''}
            `;
            reportTableBody.appendChild(row);
        });
    })
    .catch(error => {
        console.error('Error fetching report data:', error);
        alert('Error fetching report data');
    });
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