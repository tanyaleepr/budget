let db;

const request = indexedDB.open("pwa", 1);


request.onupgradeneeded = function (event) {
  // Reference to the database
  const db = event.target.result;
  // Object store 
  db.createObjectStore("new_transaction", { autoIncrement: true });
};


request.onsuccess = function (event) {

  db = event.target.result;

  if (navigator.onLine) {
    uploadTransaction();
  }
};


request.onerror = function (event) {
  console.log(event.target.errorCode);
};


function saveRecord(record) {
 
  const transaction = db.transaction(["new_transaction"], "readwrite");
 
  const transactionObjectStore = transaction.objectStore("new_transaction");
 
  transactionObjectStore.add(record);
 
  alert("Transaction submitted successfully!");
}


function uploadTransaction() {

  const transaction = db.transaction(["new_transaction"], "readwrite");
  const transactionObjectStore = transaction.objectStore("new_transaction");
  const getAll = transactionObjectStore.getAll();


  getAll.onsuccess = function () {
   
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
          // Open a transaction to clear the store
          const transaction = db.transaction(["new_transaction"], "readwrite");
          const transactionObjectStore =
            transaction.objectStore("new_transaction");
          transactionObjectStore.clear();
          // alert
          alert("Saved transactions submitted!");
        })
        .catch((err) => console.log(err));
    }
  };
}

window.addEventListener("online", uploadTransaction);