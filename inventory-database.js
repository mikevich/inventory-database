    // Set up table, forms, and inputs
    const table = document.querySelector('.inventory-table');
    const tableBody = table.querySelector('tbody');
    const forms = document.querySelectorAll('form');

    const addForm = document.querySelector('.add-form');
    const addFormId = addForm.querySelector('input[name=id]');
    const addFormTitle = addForm.querySelector('input[name=title]');
    const addFormQuantity = addForm.querySelector('input[name=quantity]');
    const addFormSubmit = addForm.querySelector('input[type=submit');

    const editForm = document.querySelector('.edit-form');
    const editFormId = editForm.querySelector('input[name=id]');
    const editFormQuantity = editForm.querySelector('input[name=quantity]');
    const editFormSubmit = editForm.querySelector('input[type=submit');

    const deleteForm = document.querySelector('.delete-form');
    const deleteFormId = deleteForm.querySelector('input[name=id]');
    const deleteFormSubmit = deleteForm.querySelector('input[type=submit]');

    const csvWrapper = document.querySelector('.csv-wrapper');
    const generateButton = document.querySelector('.generate-csv');

    // Submit handler for all forms
    function submit(e) {
        e.preventDefault();
        if (e.target == addForm) {
            const product = {
                id: addFormId.value,
                title: addFormTitle.value,
                quantity: addFormQuantity.value
            }
            if (addRow(product) != false) {
                this.reset();
            }
        } else if (e.target == editForm) {
            const product = {
                id: editFormId.value,
                quantity: editFormQuantity.value
            }
            if (editRow(product) != false) {
                this.reset();
            };
        } else if (e.target == deleteForm) {
            const product = {
                id: deleteFormId.value
            }
            if (deleteRow(product) != false) {
                this.reset();
            };
        }
        saveTable();
        destroyCSVLink();
    }

    //Helper function to check if input ID already exists in table
    function checkIfExists(checkProduct) {
        const existingRows = tableBody.querySelectorAll('tr');
        let alreadyExists = false;
        existingRows.forEach(function (row) {
            if (row.dataset.id == checkProduct.id) {
                alreadyExists = true;
            }
        });
        return alreadyExists;
    }

    //Add product row to table
    function addRow(newProduct) {
        if (newProduct.id == '' || newProduct.title == '') {
            alert('Please enter both a product ID and title to add a new entry.');
            return false;
        } else if (!checkIfExists(newProduct)) {
            const productRow = `<tr data-id='${newProduct.id}'>
                                    <td>${newProduct.id}</td>
                                    <td>${newProduct.title}</td>
                                    <td>${newProduct.quantity}</td>
                                    </tr>`
            tableBody.insertAdjacentHTML('beforeend', productRow);
        } else {
            alert('ID already exists. Please enter a different ID or use Edit form to change existing entry.');
            return false;
        }
    }

    //Edit existing product row
    function editRow(targetProduct) {
        if (checkIfExists(targetProduct)) {
            const rowToEdit = tableBody.querySelector(`[data-id='${targetProduct.id}']`);
            const quantityToEdit = rowToEdit.querySelectorAll('td')[2];
            quantityToEdit.innerHTML = targetProduct.quantity;
        } else {
            alert('ID does not exist yet. Please enter an existing ID to edit, or use the Add form to add a new entry.');
            return false;
        }
    }

    //Delete existing product row
    function deleteRow(targetProduct) {
        if (checkIfExists(targetProduct)) {
            const rowToDelete = tableBody.querySelector(`[data-id='${targetProduct.id}']`);
            rowToDelete.remove();
        } else {
            alert('ID does not exist yet. Please enter an existing ID to delete.');
            return false;
        }
    }

    //Save table to local storage
    function saveTable() {
        const tableArray = [];
        const rows = tableBody.querySelectorAll('tr');
        rows.forEach(function (row) {
            const arrayRow = [];
            const cols = row.querySelectorAll('td, th');
            cols.forEach(function (col) {
                arrayRow.push(col.innerText);
            });

            tableArray.push(arrayRow);
        })
        localStorage.setItem('tableArray', JSON.stringify(tableArray));
    }

    //Populate table from local storage
    function populateTable() {
        const loadedTable = JSON.parse(localStorage.getItem('tableArray')) || '';
        if (loadedTable != "") {
        loadedTable.forEach(function (rowData) {
            const row = document.createElement('tr');
            const rowID = rowData[0];
            row.dataset.id = rowID;
            rowData.forEach(function (colData) {
                const col = document.createElement('td');
                col.innerText = colData;
                row.appendChild(col);
            })
            tableBody.appendChild(row);
        })
        }
    }

    //Convert HTML Table to CSV file
    function tableToCSV() {
        let data = [];
        const rows = table.querySelectorAll('tr');
        rows.forEach(function (row) {
            const csvRow = [];
            const cols = row.querySelectorAll('td, th');

            cols.forEach(function (col) {
                csvRow.push(col.innerText);
            });

            data.push(csvRow.join(','));
        });

        downloadCSV(data.join('\n'));
    }

    //Generate CSV download link
    function downloadCSV(csvData) {
        destroyCSVLink();
        const csvFile = new Blob([csvData], { type: 'text/csv' });
        const downloadLink = document.createElement('a');

        downloadLink.href = window.URL.createObjectURL(csvFile);
        downloadLink.innerHTML = 'Download CSV File';
        downloadLink.download = 'inventory.csv';
        csvWrapper.appendChild(downloadLink);
    }

    //Destroy existing CSV download link
    function destroyCSVLink() {
        const existingLink = csvWrapper.querySelector('a');
        if (existingLink != null) {
            existingLink.remove();
        }
    }

    // Assign submit function to all forms
    forms.forEach(form => form.addEventListener('submit', submit));

    generateButton.addEventListener('click', tableToCSV);

    populateTable();
