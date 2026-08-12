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

function formatMoney(amount) {

    return Number(amount).toLocaleString("fr-FR") + " F";

}


function updateDashboard() {

    const income = getTotalIncome();

    const expenses = getTotalExpenses();

    const savings = getTotalSavings();

    const balance = getBalance();


    const incomeElement =
        document.getElementById("totalIncome");

    const expensesElement =
        document.getElementById("totalExpenses");

    const savingsElement =
        document.getElementById("totalSavings");

    const balanceElement =
        document.getElementById("currentBalance");


    if (incomeElement) {

        incomeElement.textContent =
            formatMoney(income);

    }


    if (expensesElement) {

        expensesElement.textContent =
            formatMoney(expenses);

    }


    if (savingsElement) {

        savingsElement.textContent =
            formatMoney(savings);

    }


    if (balanceElement) {

        balanceElement.textContent =
            formatMoney(balance);

       updateGoal();
updateSavingRate();
updateBalanceStatus();
updateFinancialScore();
updateAlerts();
    }


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

/* =========================================
   OBJECTIF FINANCIER
========================================= */

function updateGoal() {

    const goal = appData.settings.goal;

    const savings = getTotalSavings();

    let percentage = 0;

    if (goal > 0) {

        percentage =
            (savings / goal) * 100;

    }

    percentage =
        Math.min(percentage, 100);


    const remaining =
        Math.max(goal - savings, 0);


    const goalPercent =
        document.getElementById("goalPercent");

    const goalSaved =
        document.getElementById("goalSaved");

    const goalRemaining =
        document.getElementById("goalRemaining");

    const goalProgressBar =
        document.getElementById("goalProgressBar");

    const sidebarProgress =
        document.getElementById("sidebarGoalProgress");

    const sidebarPercent =
        document.getElementById("sidebarGoalPercent");


    if (goalPercent)
        goalPercent.textContent =
            percentage.toFixed(1) + " %";


    if (goalSaved)
        goalSaved.textContent =
            formatMoney(savings);


    if (goalRemaining)
        goalRemaining.textContent =
            formatMoney(remaining);


    if (goalProgressBar)
        goalProgressBar.style.width =
            percentage + "%";


    if (sidebarProgress)
        sidebarProgress.style.width =
            percentage + "%";


    if (sidebarPercent)
        sidebarPercent.textContent =
            percentage.toFixed(1) + " %";


    updateWeeklyAverage();

}


/* =========================================
   MOYENNE D'ÉPARGNE HEBDOMADAIRE
========================================= */

function updateWeeklyAverage() {

    const weeklyAverageElement =
        document.getElementById("weeklyAverage");


    if (!weeklyAverageElement)
        return;


    if (appData.savings.length === 0) {

        weeklyAverageElement.textContent = "—";

        return;

    }


    const dates =
        appData.savings.map(
            saving => new Date(saving.date)
        );


    const oldestDate =
        Math.min(...dates);


    const now =
        new Date();


    const difference =
        now - oldestDate;


    const weeks =
        Math.max(
            difference / (1000 * 60 * 60 * 24 * 7),
            1
        );


    const average =
        getTotalSavings() / weeks;


    weeklyAverageElement.textContent =
        formatMoney(Math.round(average));

}


/* =========================================
   TAUX D'ÉPARGNE
========================================= */

function updateSavingRate() {

    const income =
        getTotalIncome();

    const savings =
        getTotalSavings();


    const element =
        document.getElementById("savingRate");


    if (!element)
        return;


    if (income <= 0) {

        element.textContent = "—";

        return;

    }


    const rate =
        (savings / income) * 100;


    element.textContent =
        rate.toFixed(1) + " %";

}


/* =========================================
   STATUT DU SOLDE
========================================= */

function updateBalanceStatus() {

    const balance =
        getBalance();


    const element =
        document.getElementById("balanceStatus");


    if (!element)
        return;


    if (balance > 0) {

        element.textContent =
            "Disponible";

        element.className =
            "card-change positive";

    }

    else if (balance === 0) {

        element.textContent =
            "Équilibre";

        element.className =
            "card-change neutral";

    }

    else {

        element.textContent =
            "Déficit";

        element.className =
            "card-change negative";

    }

}


/* =========================================
   SCORE FINANCIER
========================================= */

function calculateFinancialScore() {

    const income =
        getTotalIncome();

    const expenses =
        getTotalExpenses();

    const savings =
        getTotalSavings();


    /*
       Tant qu'on n'a pas suffisamment
       de données, on ne fabrique pas
       un score.
    */

    if (income <= 0) {

        return null;

    }


    /*
       TAUX D'ÉPARGNE
    */

    const savingRate =
        (savings / income) * 100;


    let savingsScore =
        Math.min(savingRate * 2, 100);


    /*
       TAUX DE DÉPENSES
    */

    const expenseRate =
        (expenses / income) * 100;


    let expenseScore =
        Math.max(
            100 - expenseRate,
            0
        );


    /*
       BUSINESS
    */

    const businessScore =
        income > 0 ? 100 : 0;


    /*
       TRADING

       Pour le moment :
       pas suffisamment de données.
    */

    const tradingScore = null;


    /*
       SCORE GLOBAL

       Pour l'instant on utilise
       seulement les données disponibles.
    */

    const scores = [
        savingsScore,
        expenseScore,
        businessScore
    ];


    const validScores =
        scores.filter(
            score => score !== null
        );


    if (validScores.length === 0)
        return null;


    const globalScore =
        validScores.reduce(
            (sum, score) => sum + score,
            0
        ) / validScores.length;


    return {

        global:
            Math.round(globalScore),

        savings:
            Math.round(savingsScore),

        expenses:
            Math.round(expenseScore),

        business:
            Math.round(businessScore),

        trading:
            tradingScore,

        regularity:
            null

    };

}


/* =========================================
   AFFICHAGE DU SCORE
========================================= */

function updateFinancialScore() {

    const result =
        calculateFinancialScore();


    const score =
        document.getElementById("financialScore");

    const status =
        document.getElementById("scoreStatus");


    if (!result) {

        if (score)
            score.textContent = "—";

        if (status)
            status.textContent =
                "Pas encore assez de données";

        return;

    }


    if (score)
        score.textContent =
            result.global;


    if (status) {

        if (result.global >= 80)
            status.textContent =
                "Excellente gestion";

        else if (result.global >= 60)
            status.textContent =
                "Gestion correcte";

        else
            status.textContent =
                "Gestion à améliorer";

    }


    setScore(
        "scoreSavings",
        result.savings
    );


    setScore(
        "scoreExpenses",
        result.expenses
    );


    setScore(
        "scoreBusiness",
        result.business
    );


    setScore(
        "scoreTrading",
        result.trading
    );


    setScore(
        "scoreRegularity",
        result.regularity
    );

}


function setScore(id, value) {

    const element =
        document.getElementById(id);


    if (!element)
        return;


    element.textContent =
        value === null
            ? "—"
            : value;

}


/* =========================================
   ALERTES INTELLIGENTES
========================================= */

function updateAlerts() {

    const alertList =
        document.getElementById("alertList");


    if (!alertList)
        return;


    const income =
        getTotalIncome();

    const expenses =
        getTotalExpenses();

    const savings =
        getTotalSavings();


    const alerts = [];


    /*
       Aucune donnée
    */

    if (
        income === 0 &&
        expenses === 0 &&
        savings === 0
    ) {

        alerts.push({

            type: "success",

            icon: "✓",

            title: "Aucune donnée",

            message:
                "Commence par enregistrer tes revenus et tes dépenses."

        });

    }


    /*
       Dépenses supérieures aux revenus
    */

    if (
        income > 0 &&
        expenses > income
    ) {

        alerts.push({

            type: "danger",

            icon: "!",

            title: "Dépenses trop élevées",

            message:
                "Tes dépenses dépassent actuellement tes revenus."

        });

    }


    /*
       Pas encore d'épargne
    */

    if (
        income > 0 &&
        savings === 0
    ) {

        alerts.push({

            type: "danger",

            icon: "!",

            title: "Aucune épargne enregistrée",

            message:
                "Tu as des revenus mais aucune épargne n'a encore été enregistrée."

        });

    }


    /*
       Bon taux d'épargne
    */

    if (income > 0) {

        const rate =
            (savings / income) * 100;


        if (rate >= 20) {

            alerts.push({

                type: "success",

                icon: "✓",

                title: "Bonne épargne",

                message:
                    "Ton taux d'épargne actuel est de " +
                    rate.toFixed(1) +
                    " %."

            });

        }

    }


    /*
       Si aucune alerte
    */

    if (alerts.length === 0) {

        alerts.push({

            type: "success",

            icon: "✓",

            title: "Aucun problème détecté",

            message:
                "Continue à enregistrer régulièrement tes opérations."

        });

    }


    alertList.innerHTML =
        alerts.map(alert => `

            <div class="alert-item ${alert.type}">

                <div class="alert-icon">
                    ${alert.icon}
                </div>

                <div>

                    <strong>
                        ${alert.title}
                    </strong>

                    <p>
                        ${alert.message}
                    </p>

                </div>

            </div>

        `).join("");

}


/* =========================================
   MISE À JOUR COMPLÈTE
========================================= */

function refreshFinancialDashboard() {

    updateDashboard();

    updateGoal();

    updateSavingRate();

    updateBalanceStatus();

    updateFinancialScore();

    updateAlerts();

}
