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

/* =========================================
   MODAL AJOUTER UNE ENTRÉE
========================================= */

const incomeModal = document.getElementById("incomeModal");

const incomeForm = document.getElementById("incomeForm");

const closeIncomeModal =
    document.getElementById("closeIncomeModal");

const cancelIncome =
    document.getElementById("cancelIncome");

const incomeAmount =
    document.getElementById("incomeAmount");

const incomeDate =
    document.getElementById("incomeDate");

const savingPreview =
    document.getElementById("savingPreview");


/* OUVRIR LA FENÊTRE */

function openIncomeModal() {

    incomeModal.classList.add("show");

    incomeAmount.focus();

}


/* FERMER */

function closeIncomeModalFunction() {

    incomeModal.classList.remove("show");

}


/* BOUTONS SIDEBAR */

document.querySelectorAll(".nav-item").forEach(item => {

    const text = item.textContent.trim();

    if (text.includes("Ajouter une entrée")) {

        item.addEventListener("click", event => {

            event.preventDefault();

            openIncomeModal();

        });

    }

});


/* ACTION RAPIDE */

document.querySelectorAll(".quick-action").forEach(button => {

    const text = button.textContent;

    if (text.includes("Ajouter une entrée")) {

        button.addEventListener("click", () => {

            openIncomeModal();

        });

    }

});


/* FERMETURE */

closeIncomeModal.addEventListener(
    "click",
    closeIncomeModalFunction
);


cancelIncome.addEventListener(
    "click",
    closeIncomeModalFunction
);


/* CLIQUER EN DEHORS */

incomeModal.addEventListener("click", event => {

    if (event.target === incomeModal) {

        closeIncomeModalFunction();

    }

});


/* =========================================
   DATE PAR DÉFAUT
========================================= */

const today = new Date();

const formattedDate =
    today.toISOString().split("T")[0];

incomeDate.value = formattedDate;


/* =========================================
   CALCUL ÉPARGNE RECOMMANDÉE
========================================= */

incomeAmount.addEventListener("input", () => {

    const amount =
        Number(incomeAmount.value) || 0;

    const recommendation =
        getSavingsRecommendation(amount);

    savingPreview.querySelector("strong").textContent =
        recommendation.toLocaleString("fr-FR") + " F";

});


/* =========================================
   ENREGISTREMENT
========================================= */

incomeForm.addEventListener("submit", event => {

    event.preventDefault();


    const amount =
        Number(incomeAmount.value);

    const source =
        document.getElementById("incomeSource").value.trim();

    const category =
        document.getElementById("incomeCategory").value;

    const date =
        incomeDate.value;

    const note =
        document.getElementById("incomeNote").value.trim();


    if (!amount || amount <= 0) {

        alert("Veuillez entrer un montant valide.");

        return;

    }


    const transaction = addIncome({

        amount,

        source,

        category,

        date,

        note

    });


    console.log(
        "Nouvelle entrée enregistrée :",
        transaction
    );


    alert(
        "Entrée de " +
        amount.toLocaleString("fr-FR") +
        " F enregistrée avec succès."
    );


    incomeForm.reset();

    incomeDate.value = formattedDate;

    savingPreview.querySelector("strong").textContent =
        "0 F";

    closeIncomeModalFunction();

});
