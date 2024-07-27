document.addEventListener('DOMContentLoaded', () => {
    // Form and overlay elements
    const addMemberForm = document.getElementById('addMemberForm');

    // Add Member form submission
    addMemberForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const memberDetails = {
            member_name: document.getElementById('memberName').value,
            memberID: document.getElementById('memberID').value,
            member_class: document.getElementById('classFilter').value,
            contact: document.getElementById('contact').value,
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
                addMemberForm.reset(); // Reset the form after successful submission
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
    try {
        const response = await fetch('/library/members');
        if (!response.ok) {
            throw new Error('Failed to fetch members');
        }
        const data = await response.json();
        displayMembers(data);
    } catch (error) {
        console.error('Error fetching members:', error);
    }
}

function displayMembers(data) {
    const memberTableBody = document.getElementById('membersTablebody');
    memberTableBody.innerHTML = ''; // Clear existing rows

    if (data.length === 0) {
        const noResultsRow = document.createElement('tr');
        noResultsRow.innerHTML = '<td colspan="5">No results found</td>';
        memberTableBody.appendChild(noResultsRow);
    } else {
        data.forEach(member => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${member.memberID}</td>
                <td>${member.member_name}</td>
                <td>${member.member_class}</td>
                <td>${member.member_contact}</td>
                <td>${member.books_issued}</td>
            `;
            memberTableBody.appendChild(row);
        });
    }
}

refreshMembersData();
