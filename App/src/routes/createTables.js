// createTables.js
module.exports = (connection) => {
    const queries = [
        `
        CREATE TABLE IF NOT EXISTS pre_adm_registered_students (
            student_name varchar(25) NOT NULL,
            mobile_no varchar(10) NOT NULL,
            res_address varchar(25) NOT NULL,
            dob varchar(10) NOT NULL,
            standard varchar(8) DEFAULT NULL
        )
        `,
        `
        CREATE TABLE IF NOT EXISTS pre_adm_admitted_students (
            student_name varchar(25) NOT NULL,
            mobile_no varchar(10) NOT NULL,
            res_address varchar(25) NOT NULL,
            dob varchar(10) NOT NULL,
            standard varchar(8) DEFAULT NULL
        )
        `,
        `
        CREATE TABLE IF NOT EXISTS pre_adm_registered_teachers (
            teacher_name varchar(25) NOT NULL,
            mobile_no varchar(10) NOT NULL,
            res_address varchar(30) NOT NULL,
            dob varchar(10) NOT NULL,
            qualification varchar(30) NOT NULL,
            experience varchar(30) NOT NULL
        )
        `,
        `
        CREATE TABLE IF NOT EXISTS pre_adm_admitted_teachers (
            teacher_name varchar(25) NOT NULL,
            mobile_no varchar(10) NOT NULL,
            res_address varchar(30) NOT NULL,
            dob varchar(10) NOT NULL,
            qualification varchar(30) NOT NULL,
            experience varchar(30) NOT NULL
        )
        `,
        `
        CREATE TABLE IF NOT EXISTS inventory_book_details (
            title varchar(30) DEFAULT NULL,
            class_of_title varchar(10) DEFAULT NULL,
            purchase_price decimal(10,2) DEFAULT NULL,
            selling_price int(11) DEFAULT NULL,
            vendor varchar(30) DEFAULT NULL,
            ordered_quantity int(11) DEFAULT NULL,
            remaining_quantity int(11) DEFAULT NULL,
            returned_quantity int(11) DEFAULT NULL
        )
        `,
        `
        CREATE TABLE IF NOT EXISTS inventory_uniform_details (
            uniform_item varchar(30) DEFAULT NULL,
            size_of_item varchar(10) DEFAULT NULL,
            purchase_price decimal(10,2) DEFAULT NULL,
            selling_price int(11) DEFAULT NULL,
            vendor varchar(30) DEFAULT NULL,
            ordered_quantity int(11) DEFAULT NULL,
            remaining_quantity int(11) DEFAULT NULL,
            returned_quantity int(11) DEFAULT NULL
        )
        `,
        `
        CREATE TABLE IF NOT EXISTS inventory_vendor_details (
            vendor_name varchar(30) DEFAULT NULL,
            net_payable decimal(10,2) DEFAULT NULL,
            paid_till_now decimal(10,2) DEFAULT NULL,
            balance decimal(10,2) DEFAULT NULL,
            vendorFor varchar(20) DEFAULT NULL
        )
        `,
        `
        CREATE TABLE IF NOT EXISTS inventory_invoice_details (
            invoiceNo int(11) NOT NULL,
            billDate date DEFAULT NULL,
            buyerName varchar(50) DEFAULT NULL,
            buyerPhone varchar(10) DEFAULT NULL,
            class_of_buyer varchar(15) DEFAULT NULL,
            total_payable int(11) DEFAULT NULL,
            paid_amount int(11) DEFAULT NULL,
            balance_amount int(11) DEFAULT NULL,
            mode_of_payment varchar(5) DEFAULT NULL,
            PRIMARY KEY (invoiceNo)
        )
        `,
        `
        CREATE TABLE IF NOT EXISTS inventory_invoice_items (
            invoiceNo int(11) DEFAULT NULL,
            item_name varchar(30) DEFAULT NULL,
            quantity int(11) DEFAULT NULL,
            class_size varchar(15) DEFAULT NULL,
            type varchar(10) DEFAULT NULL,
            KEY invoiceNo (invoiceNo),
            CONSTRAINT inventory_invoice_items_ibfk_1 FOREIGN KEY (invoiceNo) REFERENCES inventory_invoice_details (invoiceNo)
        )
        `
    ];

    queries.forEach((query, index) => {
        connection.query(query, (err, result) => {
            if (err) {
                console.error(`Error creating table at index ${index}: ${err.stack}`);
                return;
            }
            console.log(`Table at index ${index} created successfully`);
        });
    });
};
