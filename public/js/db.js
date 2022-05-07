let db;

const request = indexedDB.open("PWA", 1);


request.onupgradeneeded = function (event) {

  const db = event.target.result;

  db.createObjectStore("new_transaction", { autoIncrement: true });
};

request.onsuccess = function (event) {
 
  db = event.target.result;

  if (navigator.onLine) {
    uploadTransaction();
  }
};

// Handles reporting 
request.onerror = function (event) {
  console.log(event.target.errorCode);
};

// Function to handle offline submits
function saveRecord(record) {
  // Open a new transaction with the db 
  const transaction = db.transaction(["new_transaction"], "readwrite");
  // Access object store
  const transactionObjectStore = transaction.objectStore("new_transaction");
  // Add record 
  transactionObjectStore.add(record);
 
  alert("Transaction submitted successfully!");
}


function uploadTransaction() {
  // Open a transaction 
  const transaction = db.transaction(["new_transaction"], "readwrite");
  const transactionObjectStore = transaction.objectStore("new_transaction");
  const getAll = transactionObjectStore.getAll();


  getAll.onsuccess = function () {
    // Check for data
    if (getAll.result.length > 0) {
      
      fetch("/api/transaction", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((serverResponse) => {
          if (serverResponse.message) {
            throw new Error(serverResponse);
          }
          // Open a transaction
          const transaction = db.transaction(["new_transaction"], "readwrite");
          const transactionObjectStore =
            transaction.objectStore("new_transaction");
          transactionObjectStore.clear();
          // Dev alert
          alert("Saved transactions submitted!");
        })
        .catch((err) => console.log(err));
    }
  };
}

window.addEventListener("online", uploadTransaction);