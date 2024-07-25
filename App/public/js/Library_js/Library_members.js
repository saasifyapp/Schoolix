document.addEventListener('DOMContentLoaded', () => {
    // Form and overlay elements
    const addMemberForm = document.getElementById('addMemberForm');

    // Add Member form submission
    addMemberForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const memberDetails = {
            student_name: document.getElementById('studentName').value,
            enrollment_number: document.getElementById('enrollmentNumber').value,
            student_class: document.getElementById('class').value,
            semester: document.getElementById('semester').value,
            contact: document.getElementById('contact').value
        };

        try {
            const response = await fetch('/library/add_member', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(memberDetails)
            });

            if (response.ok) {
                // Handle successful response
                alert('Member added successfully');
            } else {
                throw new Error('Failed to add member');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while adding the member.');
        }
    });
});

// Fetch and display members
async function refreshMembersData() {
    // showMemberLoadingAnimation();
    document.getElementById('searchMemberInput').value = '';
    try {
        const response = await fetch('/library/members');
        if (!response.ok) {
            throw new Error('Failed to fetch members');
        }
        const data = await response.json();
        displayMembers(data);
    } catch (error) {
        console.error('Error fetching members:', error);
        // hideMemberLoadingAnimation();
    }
}

function displayMembers(data) {
    const memberTableBody = document.getElementById('membersTablebody');
    memberTableBody.innerHTML = ''; // Clear existing rows

    try {
        // Reverse the data array
        // data.reverse();

        if (data.length === 0) {
            // hideMemberLoadingAnimation();
            const noResultsRow = document.createElement('tr');
            noResultsRow.innerHTML = '<td colspan="5">No results found</td>';
            memberTableBody.appendChild(noResultsRow);
        } else {
            data.forEach(member => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${member.student_name}</td>
                    <td>${member.enrollment_number}</td>
                    <td>${member.student_class}</td>
                    <td>${member.semester}</td>
                    <td>${member.contact}</td>
                `;
                memberTableBody.appendChild(row);
            });
        }
        // hideMemberLoadingAnimation();
    } catch (error) {
        console.error('Error displaying members:', error);
        // hideMemberLoadingAnimation();
    }
}

refreshMembersData();
