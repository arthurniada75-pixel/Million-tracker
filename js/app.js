/* =========================================
   MILLION TRACKER
   SYSTÈME DE DONNÉES
========================================= */

const STORAGE_KEY = "millionTrackerData";

let appData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
    transactions: [],
    savings: [],
    trading: [],
    settings: {
        goal: 1000000
    }
};


/* =========================================
   SAUVEGARDE
========================================= */

function saveData() {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(appData)
    );
}


/* =========================================
   CALCULS
========================================= */

function getTotalIncome() {

    return appData.transactions
        .filter(transaction => transaction.type === "income")
        .reduce((total, transaction) => {
            return total + Number(transaction.amount);
        }, 0);
}


function getTotalExpenses() {

    return appData.transactions
        .filter(transaction => transaction.type === "expense")
        .reduce((total, transaction) => {
            return total + Number(transaction.amount);
        }, 0);
}


function getTotalSavings() {

    return appData.savings
        .reduce((total, saving) => {
            return total + Number(saving.amount);
        }, 0);
}


function getBalance() {

    return getTotalIncome() - getTotalExpenses() - getTotalSavings();
}


function getSavingsRecommendation(amount) {

    return Number(amount) * 0.30;
}


/* =========================================
   AJOUTER UNE ENTRÉE
========================================= */

function addIncome(data) {

    const transaction = {

        id: Date.now(),

        type: "income",

        amount: Number(data.amount),

        source: data.source,

        category: data.category,

        date: data.date,

        note: data.note || "",

        createdAt: new Date().toISOString()

    };

    appData.transactions.push(transaction);

    saveData();

    updateDashboard();

    return transaction;
}


/* =========================================
   INITIALISATION
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    console.log("Million Tracker chargé.");

    updateDashboard();

});


/* =========================================
   DASHBOARD
========================================= */

function updateDashboard() {

    const income = getTotalIncome();

    const expenses = getTotalExpenses();

    const savings = getTotalSavings();

    const balance = getBalance();

    console.log({
        revenus: income,
        dépenses: expenses,
        épargne: savings,
        solde: balance
    });

}
