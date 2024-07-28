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
                 <td>
                        <div class="button-container" style="display: flex; justify-content: center; gap: 20px;">
                            <button 
                                onclick="editMember('${member.memberID}')"
                                onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';"
                                onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';">
                                    <img src="../images/edit.png" alt="Edit" style="width: 25px; height: 25px; border-radius: 0px; margin: 5px;">
                                    <span style="margin-right: 10px;">Edit</span>
                            </button>
                            <button
                                onclick="deleteMember('${member.memberID}')"
                                onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';"
                                onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';">
                                    <img src="../images/delete_vendor.png" alt="Delete" style="width: 25px; height: 25px; border-radius: 0px; margin: 5px;">
                                    <span style="margin-right: 10px;">Delete</span>
                            </button>
                        </div>
                    </td>
            `;
            memberTableBody.appendChild(row);
        });
    }
}

// Function to edit member details
async function editMember(memberID) {
    // showMembersLoadingAnimation();

    await fetch(`/library/member/${encodeURIComponent(memberID)}`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to retrieve member details.");
            }
            return response.json();
        })
        .then(data => {
            // hideMembersLoadingAnimation();

            const member = data.member;

            // Create custom prompt
            const customPrompt = document.createElement("div");
            customPrompt.classList.add("custom-prompt");

            customPrompt.innerHTML = `
                <div class="prompt-content">
                    <button class="close-button" onclick="this.parentElement.parentElement.remove();">&times;</button>
                    <h2>Edit Member Details</h2>
                    <label for="editMemberID">Member ID:</label>
                    <input type="text" id="editMemberID" value="${member.memberID}" readonly>
                    <label for="editMemberName">Name:</label>
                    <input type="text" id="editMemberName" value="${member.member_name}" required>
                    <label for="editMemberContact">Contact:</label>
                    <input type="text" id="editMemberContact" value="${member.member_contact}" required>
                    <label for="editMemberClass">Class:</label>
                    <select id="editMemberClass" name="classFilter" class="custom-select" required>
                        <option value="" disabled style="display:none;">Select Class</option>
                        <option value="Nursery">Nursery</option>
                        <option value="KG1">KG-1</option>
                        <option value="KG2">KG-2</option>
                        <option value="1st">1st</option>
                        <option value="2nd">2nd</option>
                        <option value="3rd">3rd</option>
                        <option value="4th">4th</option>
                        <option value="5th">5th</option>
                        <option value="6th">6th</option>
                        <option value="7th">7th</option>
                        <option value="8th">8th</option>
                        <option value="9th">9th</option>
                        <option value="10th">10th</option>
                    </select><br>
                    <button id="confirmEditButton" onclick="updateMember('${memberID}')">Update</button>
                </div>
            `;

            // Set the selected value for the class dropdown
            const classFilter = customPrompt.querySelector("#editMemberClass");
            classFilter.value = member.member_class;

            document.body.appendChild(customPrompt);
        })
        .catch(error => {
            console.error("Error retrieving member details:", error);
        });
}

// Function to update member details
async function updateMember(memberID) {
    const memberName = document.getElementById("editMemberName").value;
    const memberContact = document.getElementById("editMemberContact").value;
    const memberClass = document.getElementById("editMemberClass").value;

    // showMembersLoadingAnimation();

    await fetch(`/library/member/${encodeURIComponent(memberID)}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            member_name: memberName,
            member_contact: memberContact,
            member_class: memberClass
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to update member details');
        }
        return response.json();
    })
    .then(data => {
        // hideMembersLoadingAnimation();
        alert('Member details updated successfully');
        refreshMembersData(); // Refresh the members list
        document.querySelector(".custom-prompt").remove(); // Remove the prompt
    })
    .catch(error => {
        console.error('Error updating member details:', error);
        // hideMembersLoadingAnimation();
    });
}



function deleteMember(memberID) {
    const confirmation = confirm(
        `Are you sure you want to delete the book with ID "${memberID}"?`
    );
    if (confirmation) {
        fetch(`/library/member/${memberID}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (response.ok) {
                alert('Member deleted successfully');
                refreshMembersData(); // Refresh the books list
            } else {
                throw new Error('Failed to delete member');
            }
        })
        .catch(error => console.error('Error deleting member:', error));
    }
}

refreshMembersData();
