let membersData = {}; // Object to store members by ID
let memberNamesInClass = {}; // Object to store member names by class

async function refreshMembersData() {
    document.getElementById('searchMemberInput').value = '';
    try {
        const response = await fetch('/library/members');
        if (!response.ok) {
            throw new Error('Failed to fetch members');
        }
        const data = await response.json();
        storeMembersData(data);
        displayMembers(data);
    } catch (error) {
        console.error('Error fetching members:', error);
    }
}

function storeMembersData(data) {
    membersData = {}; // Clear existing data
    memberNamesInClass = {}; // Clear existing data

    data.forEach(member => {
        membersData[member.memberID] = member; // Store member by ID

        // Store member names by class
        if (!memberNamesInClass[member.member_class]) {
            memberNamesInClass[member.member_class] = new Set();
        }
        memberNamesInClass[member.member_class].add(member.member_name);
    });
}

function isDuplicateMemberID(memberID) {
    return membersData.hasOwnProperty(memberID);
}

function isDuplicateMemberNameInClass(memberName, memberClass) {
    return memberNamesInClass[memberClass] && memberNamesInClass[memberClass].has(memberName);
}

function formatInput(input) {
    return input.trim().replace(/\s+/g, ' ');
}

// Function to validate mobile number length
function isValidMobileNumber(number) {
    const formattedNumber = formatInput(number);
    return /^\d{10}$/.test(formattedNumber);
}

document.addEventListener('DOMContentLoaded', () => {
    // Form and overlay elements
    const addMemberForm = document.getElementById('addMemberForm');

    // Add Member form submission
    addMemberForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const memberDetails = {
            member_name: formatInput(document.getElementById('memberName').value),
            memberID: formatInput(document.getElementById('memberID').value),
            member_class: formatInput(document.getElementById('classFilter').value),
            contact: formatInput(document.getElementById('contact').value),
        };

        // Validation for duplicate Member ID
        if (isDuplicateMemberID(memberDetails.memberID)) {
            alert('Member ID already exists. Please use a different Member ID.');
            return;
        }

        // Validation for same member name in the same class
        if (isDuplicateMemberNameInClass(memberDetails.member_name, memberDetails.member_class)) {
            alert('Member with the same name already exists in the same class. Please use a different name or class.');
            return;
        }

        // Validate mobile number length
        if (!isValidMobileNumber(memberDetails.contact)) {
            alert('Contact number must be exactly 10 digits.');
            return;
        }


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
        onclick="editMember('${member.memberID}')"
        onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';"
        onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';">
        <img src="../images/edit.png" alt="Edit" style="width: 25px; height: 25px; border-radius: 0px; margin: 5px;">
        <span style="margin-right: 10px;">Edit</span>
    </button>
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

    // Validate for duplicate member name in the same class
    if (isDuplicateMemberNameInClass(memberName, memberClass)) {
        alert('A member with this name already exists in the selected class.');
        return;
    }

    // Validate mobile number length
    if (!isValidMobileNumber(memberContact)) {
        alert('Contact number must be exactly 10 digits.');
        return;
    }
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

async function searchMemberDetails() {
    const searchTerm = document.getElementById("searchMemberInput").value.trim();

    // Check if the search term is empty
    if (!searchTerm) {
        if (memberssearchField !== document.activeElement) {
            showToast("Please enter a search term.", true);
        }
        refreshMembersData();
        return;
    }

    // Fetch data from the server based on the search term
    await fetch(`/library/members/search?search=${encodeURIComponent(searchTerm)}`)
        .then((response) => response.json())
        .then((data) => {
            const membersTableBody = document.getElementById("membersTablebody");
            membersTableBody.innerHTML = ""; // Clear previous data

            if (data.length === 0) {
                // If no results found, display a message
                const noResultsRow = document.createElement("tr");
                noResultsRow.innerHTML = '<td colspan="6">No results found</td>';
                membersTableBody.appendChild(noResultsRow);
            } else {
                // Append member data to the table
                data.forEach((member) => {
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${member.memberID}</td>
                        <td>${member.member_name}</td>
                        <td>${member.member_class}</td>
                        <td>${member.member_contact}</td>
                        <td>${member.books_issued}</td>
                        <td style="text-align: center;">
                            <div class="button-container" style="display: flex; justify-content: center; gap: 20px;">
                                <button style="background-color: transparent; border: none; color: black; padding: 0; text-align: center; text-decoration: none; display: flex; align-items: center; justify-content: center; font-size: 14px; cursor: pointer; max-height: 100%; border-radius: 20px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); transition: transform 0.2s, box-shadow 0.2s; margin-bottom: 10px;"
                                    onclick="showMemberUpdateModal('${member.memberID}')"
                                    onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';"
                                    onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';">
                                    <img src="/images/edit.png" alt="Edit" style="width: 25px; height: 25px; border-radius: 0px; margin: 5px;">
                                    <span style="margin-right: 10px;">Edit</span>
                                </button>
                                <button style="background-color: transparent; border: none; color: black; padding: 0; text-align: center; text-decoration: none; display: flex; align-items: center; justify-content: center; font-size: 14px; cursor: pointer; max-height: 100%; border-radius: 20px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); transition: transform 0.2s, box-shadow 0.2s; margin-bottom: 10px;"
                                    onclick="deleteMember('${member.memberID}')"
                                    onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';"
                                    onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';">
                                    <img src="/images/delete.png" alt="Delete" style="width: 25px; height: 25px; border-radius: 0px; margin: 5px;">
                                    <span style="margin-right: 10px;">Delete</span>
                                </button>
                            </div>
                        </td>
                    `;
                    membersTableBody.appendChild(row);
                });
            }
        })
        .catch((error) => {
            console.error("Error:", error);
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

function exportTableToCSV(tableId, filename) {
    const table = document.getElementById(tableId);
    const rows = table.querySelectorAll('tr');

    let csvContent = '';
    const headers = table.querySelectorAll('th');
    const headerData = [];
    headers.forEach((header) => {
        headerData.push(`"${header.textContent}"`);
    });
    csvContent += headerData.join(',') + '\n';

    rows.forEach((row) => {
        const cells = row.querySelectorAll('td');
        const rowData = [];
        cells.forEach((cell) => {
            rowData.push(`"${cell.textContent}"`);
        });
        csvContent += rowData.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (navigator.msSaveBlob) { // IE 10+
        navigator.msSaveBlob(blob, filename);
    } else {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

function exportMembersTable() {
    exportTableToCSV('membersTable', 'Library_Members.csv');
}

refreshMembersData();
