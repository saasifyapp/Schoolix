document.getElementById('reportButton').addEventListener('click', function() {
    document.getElementById('reportOverlay').style.display = 'block';
    fetchReportData();
});

document.getElementById('closeReportOverlay').addEventListener('click', function() {
    const overlay = document.getElementById('reportOverlay');
    overlay.style.display = 'none';
});

document.getElementById('reportTypeDropdown').addEventListener('change', function() {
    fetchReportData();
});

function fetchReportData() {
    const reportType = document.getElementById('reportTypeDropdown').value;

    // Clear the table if "Select Report Type" is chosen
    if (!reportType) {
        document.getElementById('reportTableBody').innerHTML = '';
        document.querySelector('.styled-table thead').innerHTML = '';
        return;
    }

    fetch('/library/get_report_data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reportType })
    })
    .then(response => response.json())
    .then(data => {
        const reportTableBody = document.getElementById('reportTableBody');
        const reportTableHead = document.querySelector('.styled-table thead');

        reportTableBody.innerHTML = ''; // Clear existing rows
        reportTableHead.innerHTML = ''; // Clear existing headers

        let headers = [
            'Member ID', 
            'Member Name', 
            'Member Class', 
            'Book ID', 
            'Book Name', 
            'Transaction Date', 
            'Transaction Type'
        ];

        if (reportType === 'penalty') {
            headers.push('Penalty Status', 'Penalty Paid');
        }

        // Create table headers dynamically
        const headerRow = document.createElement('tr');
        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            headerRow.appendChild(th);
        });
        reportTableHead.appendChild(headerRow);

        // Populate table rows
        data.reports.forEach(report => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${report.memberID}</td>
                <td>${report.member_name}</td>
                <td>${report.member_class}</td>
                <td>${report.bookID}</td>
                <td>${report.book_name}</td>
                <td>${formatDateToIST(report.transaction_date)}</td>
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
