function capitalizeName(name) {
    return name
        .trim() // Remove leading and trailing spaces
        .split(/\s+/) // Split by one or more spaces to handle multiple spaces
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

function formatInput(input) {
    // Check if the input is not a string and convert it to a string if necessary
    if (typeof input !== "string") {
        input = String(input); // Convert to string
    }

    // Trim whitespace and replace multiple spaces with a single space
    let formattedInput = input.trim().replace(/\s+/g, " ");

    // Prevent unnecessary characters or SQL injection
    formattedInput = formattedInput
        .replace(/'/g, "''") // Escape single quotes
        .replace(/--/g, "") // Remove SQL comment syntax
        .replace(/;/g, "") // Remove semicolons
        .replace(/[^a-zA-Z0-9\s._-]/g, ""); // Allow only alphanumeric characters, spaces, dots, underscores, and hyphens

    return formattedInput;
}