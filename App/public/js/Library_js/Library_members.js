let membersData = {}; // Object to store members by ID
let memberNamesInClass = {}; // Object to store member names by class

async function refreshMembersData() {
    document.getElementById('searchMemberInput').value = '';
    try {
        showLibraryLoadingAnimation();
        const response = await fetch('/library/members');
        if (!response.ok) {
            hidelibraryLoadingAnimation();
            throw new Error('Failed to fetch members');
        }
        const data = await response.json();
        storeMembersData(data);
        displayMembers(data);
    } catch (error) {
        hidelibraryLoadingAnimation();
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
        showLibraryLoadingAnimation();
        const memberDetails = {
            member_name: formatInput(document.getElementById('memberName').value),
            memberID: formatInput(document.getElementById('memberID').value),
            member_class: formatInput(document.getElementById('classFilter').value),
            contact: formatInput(document.getElementById('contact').value),
        };

        // Validation for duplicate Member ID
        if (isDuplicateMemberID(memberDetails.memberID)) {
            hidelibraryLoadingAnimation();
            showToast('Member ID already exists. Please use a different Member ID.', true);
            return;
        }

        // Validation for same member name in the same class
        if (isDuplicateMemberNameInClass(memberDetails.member_name, memberDetails.member_class)) {
            hidelibraryLoadingAnimation();
            showToast('Member with the same name already exists in the same class. Please use a different name or class.', true);
            return;
        }

        // Validate mobile number length
        if (!isValidMobileNumber(memberDetails.contact)) {
            hidelibraryLoadingAnimation();
            showToast('Contact number must be exactly 10 digits.', true);
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
                hidelibraryLoadingAnimation();
                // Handle successful response
                showToast('Member added successfully', false);
                addMemberForm.reset(); // Reset the form after successful submission
            } else {
                hidelibraryLoadingAnimation();
                throw new Error('Failed to add member');
            }
        } catch (error) {
            hidelibraryLoadingAnimation();
            console.error('Error:', error);
            showToast('An error occurred while adding the member.', true);
        }
    });
});

function displayMembers(data) {
    const memberTableBody = document.getElementById('membersTablebody');
    memberTableBody.innerHTML = ''; // Clear existing rows

    // Reverse the data array
    data.reverse();

    if (data.length === 0) {
        hidelibraryLoadingAnimation();
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
            hidelibraryLoadingAnimation();
        });
    }
}

// Function to edit member details
async function editMember(memberID) {
    // showMembersLoadingAnimation();

    let member = membersData[memberID];

    if (!member) {
        console.error("Member details not found locally.");
        showToast("Member details not found.", true);
        return;
    }

    // Create custom prompt
    const customPrompt = document.createElement("div");
    customPrompt.classList.add("custom-prompt");

    customPrompt.innerHTML = `
            <div class="prompt-content">                
                <h2>Edit Member Details</h2>
                
                <div class="form-group">
                    <input type="text" class="form-control" id="editMemberID" value="${member.memberID}" readonly style="width:6rem;text-align: center;" placeholder=" ">
                    <span class="form-control-placeholder">Member ID</span>
                </div>
                
                <div class="form-group">
                    <input type="text" class="form-control" id="editMemberName" value="${member.member_name}" required style="width:6rem;text-align: center;" placeholder=" ">
                    <span class="form-control-placeholder">Name</span>
                </div>
                
                <div class="form-group">
                    <input type="text" class="form-control" id="editMemberContact" value="${member.member_contact}" required style="width:6rem;text-align: center;" placeholder=" ">
                    <span class="form-control-placeholder">Contact</span>
                </div>
                
                <div class="form-group">
                    <select id="editMemberClass" class="form-control" required style="width: 10rem; text-align: center;" placeholder=" ">
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
                    </select>
                    <span class="form-control-placeholder">Class</span>
                </div>
                
                <button id="confirmEditButton" style="background-color: transparent; border: none; color: black; padding: 0; text-align: center; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; font-size: 14px; cursor: pointer; max-height: 100%; border-radius: 20px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); transition: transform 0.2s, box-shadow 0.2s; margin-bottom: 10px;"

                        onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';"
                        onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';">
                    <img src="../images/conform.png" alt="Update" style="width: 25px; height: 25px; border-radius: 0px; margin: 5px;">
                    <span style="margin-right: 10px;">Update</span>
                </button>
        
                <button id="cancelButton" style="background-color: transparent; border: none; color: black; padding: 0; text-align: center; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; font-size: 14px; cursor: pointer; max-height: 100%; border-radius: 20px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); transition: transform 0.2s, box-shadow 0.2s; margin-bottom: 10px;"
                        onclick=""
                        onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';"
                        onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';">
                    <img src="../images/cancel.png" alt="Cancel" style="width: 25px; height: 25px; border-radius: 0px; margin: 5px;">
                    <span style="margin-right: 10px;">Cancel</span>
                </button>
            </div>
        `;


    // Set the selected value for the class dropdown
    const classFilter = customPrompt.querySelector("#editMemberClass");
    classFilter.value = member.member_class;

    document.body.appendChild(customPrompt);

    // Add event listener to form submission
    const confirmbuttonmember = customPrompt.querySelector("#confirmEditButton");
    confirmbuttonmember.addEventListener("click", (e) => {
        e.preventDefault();
        updateMember(memberID, member);
    });

    // Add event listener to the cancel button
    customPrompt.querySelector("#cancelButton").addEventListener("click", () => {
        customPrompt.remove();
    });
}

// Function to update member details
async function updateMember(memberID, originalMemberDetails) {
    // showLibraryLoadingAnimation();
    const editMemberName = document.getElementById("editMemberName");
    const editMemberContact = document.getElementById("editMemberContact");
    const editMemberClass = document.getElementById("editMemberClass");

    // // Fetch original member details
    // let originalMemberDetails;
    // try {
    //     const response = await fetch(`/library/member/${encodeURIComponent(memberID)}`);
    //     if (!response.ok) {
    //         throw new Error('Failed to retrieve member details');
    //     }
    //     originalMemberDetails = await response.json();
    // } catch (error) {
    //     hidelibraryLoadingAnimation();
    //     console.error('Error retrieving member details:', error);
    //     return;
    // }
    // console.log(originalMemberDetails)

    // Extract original member details
    const originalMemberName = originalMemberDetails.member_name;
    const originalMemberClass = originalMemberDetails.member_class;
    const originalMembernumber = originalMemberDetails.member_contact;

    const updatedMemberName = editMemberName.value;
    const updatedMemberContact = editMemberContact.value;
    const updatedMemberClass = editMemberClass.value;

    if (originalMemberName === updatedMemberName && originalMemberClass === updatedMemberClass && originalMembernumber === updatedMemberContact) {
        hidelibraryLoadingAnimation();
        showToast("No changes made", true);
        return;
    }

    // Validate for duplicate member name or class changes
    if ((updatedMemberName !== originalMemberName || updatedMemberClass !== originalMemberClass) &&
        isDuplicateMemberNameInClass(updatedMemberName, updatedMemberClass)) {
        hidelibraryLoadingAnimation();
        showToast('A member with this name already exists in the selected class.', true);
        return;
    }

    // Validate mobile number length
    if (!isValidMobileNumber(updatedMemberContact)) {
        hidelibraryLoadingAnimation();
        showToast('Contact number must be exactly 10 digits.', true);
        return;
    }

    // Proceed with update
    try {
        showLibraryLoadingAnimation();
        const response = await fetch(`/library/member/${encodeURIComponent(memberID)}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                member_name: updatedMemberName,
                member_contact: updatedMemberContact,
                member_class: updatedMemberClass
            })
        });

        if (!response.ok) {
            hidelibraryLoadingAnimation();
            throw new Error('Failed to update member details');
        }
        hidelibraryLoadingAnimation();
        showToast(`Member ${memberID} details updated successfully`, false);
        refreshMembersData(); // Refresh the members list
        document.querySelector(".custom-prompt").remove(); // Remove the prompt

    } catch (error) {
        hidelibraryLoadingAnimation();
        console.error('Error updating member details:', error);
    }
}



// async function searchMemberDetails() {
//     const searchTerm = document.getElementById("searchMemberInput").value.trim();

//     // Check if the search term is empty
//     if (!searchTerm) {
//         if (memberssearchField !== document.activeElement) {
//             showToast("Please enter a search term.", true);
//         }
//         refreshMembersData();
//         return;
//     }

//     // Fetch data from the server based on the search term
//     await fetch(`/library/members/search?search=${encodeURIComponent(searchTerm)}`)
//         .then((response) => response.json())
//         .then((data) => {
//             const membersTableBody = document.getElementById("membersTablebody");
//             membersTableBody.innerHTML = ""; // Clear previous data

//             if (data.length === 0) {
//                 // If no results found, display a message
//                 const noResultsRow = document.createElement("tr");
//                 noResultsRow.innerHTML = '<td colspan="6">No results found</td>';
//                 membersTableBody.appendChild(noResultsRow);
//             } else {
//                 // Append member data to the table
//                 data.forEach((member) => {
//                     const row = document.createElement("tr");
//                     row.innerHTML = `
//                         <td>${member.memberID}</td>
//                         <td>${member.member_name}</td>
//                         <td>${member.member_class}</td>
//                         <td>${member.member_contact}</td>
//                         <td>${member.books_issued}</td>
//                         <td style="text-align: center;">
//                             <div class="button-container" style="display: flex; justify-content: center; gap: 20px;">
//                                 <button style="background-color: transparent; border: none; color: black; padding: 0; text-align: center; text-decoration: none; display: flex; align-items: center; justify-content: center; font-size: 14px; cursor: pointer; max-height: 100%; border-radius: 20px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); transition: transform 0.2s, box-shadow 0.2s; margin-bottom: 10px;"
//                                     onclick="showMemberUpdateModal('${member.memberID}')"
//                                     onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';"
//                                     onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';">
//                                     <img src="/images/edit.png" alt="Edit" style="width: 25px; height: 25px; border-radius: 0px; margin: 5px;">
//                                     <span style="margin-right: 10px;">Edit</span>
//                                 </button>
//                                 <button style="background-color: transparent; border: none; color: black; padding: 0; text-align: center; text-decoration: none; display: flex; align-items: center; justify-content: center; font-size: 14px; cursor: pointer; max-height: 100%; border-radius: 20px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); transition: transform 0.2s, box-shadow 0.2s; margin-bottom: 10px;"
//                                     onclick="deleteMember('${member.memberID}')"
//                                     onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';"
//                                     onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';">
//                                     <img src="/images/delete.png" alt="Delete" style="width: 25px; height: 25px; border-radius: 0px; margin: 5px;">
//                                     <span style="margin-right: 10px;">Delete</span>
//                                 </button>
//                             </div>
//                         </td>
//                     `;
//                     membersTableBody.appendChild(row);
//                 });
//             }
//         })
//         .catch((error) => {
//             console.error("Error:", error);
//         });
// }

function searchMemberDetails() {
    const searchTerm = document.getElementById("searchMemberInput").value.trim().toLowerCase();

    // Check if the search term is empty
    if (!searchTerm) {
        // showToast("Please enter a search term.", true);
        displayMembers(Object.values(membersData)); // Display all members if no search term
        return;
    }

    // Filter membersData based on the search term
    const filteredMembers = Object.values(membersData).filter(member =>
        member.member_name.toLowerCase().includes(searchTerm) ||
        member.memberID.toLowerCase().includes(searchTerm)
    );

    displayMembers(filteredMembers); // Display filtered members

    // Check if no results were found
    if (filteredMembers.length === 0) {
        const membersTableBody = document.getElementById("membersTablebody");
        membersTableBody.innerHTML = '<tr><td colspan="7">No results found</td></tr>';
    }
}


function deleteMember(memberID) {
    const confirmation = confirm(
        `Are you sure you want to delete the book with ID "${memberID}"?`
    );
    if (confirmation) {
        showLibraryLoadingAnimation();
        fetch(`/library/member/${memberID}`, {
            method: 'DELETE'
        })
            .then(response => {
                if (response.ok) {
                    hidelibraryLoadingAnimation();
                    showToast('Member deleted successfully', false);
                    refreshMembersData(); // Refresh the books list
                } else {
                    hidelibraryLoadingAnimation();
                    throw new Error('Failed to delete member');
                }
            })
            .catch(error => console.error('Error deleting member:', error));
    }
}

function exportTmemberableToCSV(tableId, filename) {
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
    exportTmemberableToCSV('membersTable', 'Library_Members.csv');
}

// refreshMembersData();
