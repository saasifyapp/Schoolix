document.addEventListener('DOMContentLoaded', () => {
    const openDeleteStudentButton = document.getElementById('openDeleteStudentOverlay');
    const closeDeleteOverlayButton = document.getElementById('closeOverlayDelete');
    const deleteStudentFilter = document.getElementById('deleteStudentFilter');

    if (openDeleteStudentButton) {
        openDeleteStudentButton.addEventListener('click', () => {
            fetchAndPopulateDeleteStudents();
            document.getElementById('deleteStudentOverlay').style.display = 'flex';
        });
    }

    if (closeDeleteOverlayButton) {
        closeDeleteOverlayButton.addEventListener('click', () => {
            document.getElementById('deleteStudentOverlay').style.display = 'none';
        });
    }

    if (deleteStudentFilter) {
        deleteStudentFilter.addEventListener('change', fetchAndPopulateDeleteStudents);
    }

    // Fetch and populate primary students by default
    fetchAndPopulateDeleteStudents();
});

let deleteStudentData = [];

// Fetch data from the server and store it for deletion
function fetchAndPopulateDeleteStudents() {
    const studentType = document.getElementById('deleteStudentFilter').value;
    fetch(`/delete_enrolled_students?type=${studentType}`)
        .then(response => response.json())
        .then(data => {
            if (Array.isArray(data)) {
                deleteStudentData = data;
                populateDeleteTable(data);  // Initially populate the table with all data
            } else {
                console.error('Expected an array but got:', data);
            }
        })
        .catch(error => {
            console.error('Error fetching student data:', error);
            alert('An error occurred while fetching student data.');
        });
}

// Search and filter the data for deletion based on the input
function deleteStudentEnrolled() {
    const searchInput = document.getElementById('deleteStudentSearch').value.trim();
    let filteredData = [];

    if (!searchInput) {
        populateDeleteTable(deleteStudentData);  // If search input is empty, display all data
        return;
    }

    if (isNaN(searchInput)) {
        // If input is not a number, search by name
        filteredData = deleteStudentData.filter(student => {
            return student.Name.toLowerCase().includes(searchInput.toLowerCase());
        });
    } else {
        // If input is a number, search by GR number
        filteredData = deleteStudentData.filter(student => {
            return student.Grno && student.Grno == searchInput;
        });
    }

    populateDeleteTable(filteredData);
}

// Populate the delete student table
function populateDeleteTable(data) {
    if (!data.length) {
        return;  // No data to display
    }

    const table = document.getElementById('deleteStudentsTable');
    const tableHead = table.querySelector('thead');
    const tableBody = document.getElementById('deleteStudentsTablebody');
    tableHead.innerHTML = ''; // Clear existing headers
    tableBody.innerHTML = ''; // Clear existing rows

    // Create dynamic table headers
    const headers = ['student_id', 'Grno', 'Name', 'Section', 'Gender', 'Standard', 'Division', 'DOB', 'Action'];
    const headerRow = document.createElement('tr');
    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header.charAt(0).toUpperCase() + header.slice(1);
        headerRow.appendChild(th);
    });
    tableHead.appendChild(headerRow);

    // Create dynamic table rows
    data.forEach(student => {
        const row = document.createElement('tr');
        headers.slice(0, -1).forEach(header => {  // Exclude 'Action' from looping
            const cell = document.createElement('td');
            cell.textContent = student[header] || '';
            row.appendChild(cell);
        });

        // Add the action buttons
        const actionCell = document.createElement('td');
        actionCell.innerHTML = `
            <div class="button-container" style="display: flex; justify-content: center; gap: 20px;">
                <button style="background-color: transparent;
                    border: none;
                    color: black;
                    padding: 0;
                    text-align: center;
                    text-decoration: none;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    cursor: pointer;
                    max-height: 100%;
                    border-radius: 20px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                    transition: transform 0.2s, box-shadow 0.2s;
                    margin-bottom: 10px;"
                    onclick="deleteStudent('${student.student_id}', '${student.Grno}', '${student.Name}', '${student.Section}', '${student.Gender}', '${student.Standard}', '${student.Division}', '${student.DOB}')"
                    onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';"
                    onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';">
                    <img src="../images/delete_vendor.png" alt="Delete" style="width: 25px; height: 25px; border-radius: 0px; margin: 5px;">
                    <span style="margin-right: 10px;">Delete</span>
                </button>
            </div>
        `;
        row.appendChild(actionCell);

        tableBody.appendChild(row);
    });
}

// Function to handle the deletion of a student
function deleteStudent(student_id, Grno, Name, Section) {
    Swal.fire({
        title: 'Delete Student',
        html: `<strong>(${Grno} | ${Name})</strong><br>
               <p>This operation will completely remove the student from the Schoolix system.<br><br>
               <strong>This is not related to TC generation. Be careful before deletion.</strong></p>`,
        icon: 'warning',
        input: 'text',  // Use text input for the password
        inputPlaceholder: 'Enter admin password',
        inputAttributes: {
            'aria-label': 'Admin Password',
            'autocomplete': 'off'  // Disable autocomplete for security purposes
        },
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
        preConfirm: (password) => {
            const correctPassword = 'admin@123';
            if (password !== correctPassword) {
                Swal.showValidationMessage(
                    'Incorrect password. Please try again.'
                );
                return false;
            }
            return true;
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const studentData = {
                student_id,
                Grno,
                Section
            };

            // Log the request payload
            //console.log('Request to delete student:', studentData);

            fetch(`/deleteEnrolledStudent`, {
                method: 'POST',  // Note that we're using POST here. If your server expects DELETE, change this to 'DELETE'.
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(studentData)
            })
            .then(response => response.json())
            .then(result => {
                // Log the response from the server
                //console.log('Response from server:', result);
                if (result.success) {
                    Swal.fire(
                        'Deleted!',
                        'The student has been deleted.',
                        'success'
                    );
                    fetchAndPopulateDeleteStudents();  // Refresh the table to reflect the deletion
                } else {
                    Swal.fire(
                        'Failed!',
                        `Failed to delete student: ${result.message}`,
                        'error'
                    );
                }
            })
            .catch(error => {
                console.error('Error running delete:', error);
                Swal.fire(
                    'Error!',
                    'An error occurred while deleting the student.',
                    'error'
                );
            });
        }
    });
}