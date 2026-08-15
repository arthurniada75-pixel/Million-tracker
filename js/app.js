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

    initializeExpenseModal();

});


/* =========================================
   MODAL AJOUTER UNE DÉPENSE
========================================= */

function initializeExpenseModal() {

    const modal =
        document.getElementById("expenseModal");

    const openButton =
        document.getElementById("openExpenseModal");

    const closeButton =
        document.getElementById("closeExpenseModal");

    const cancelButton =
        document.getElementById("cancelExpense");


    /*
       Vérification
    */

    if (!modal || !openButton) {

        console.error(
            "Modal dépense introuvable."
        );

        return;

    }


    /*
       OUVRIR LE MODAL
    */

    openButton.addEventListener(
        "click",
        function(event) {

            event.preventDefault();

            modal.classList.add("show");

        }
    );


    /*
       FERMER AVEC X
    */

    if (closeButton) {

        closeButton.addEventListener(
            "click",
            function() {

                modal.classList.remove(
                    "active"
                );

            }
        );

    }


    /*
       FERMER AVEC ANNULER
    */

    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            function() {

                modal.classList.remove(
                    "active"
                );

            }
        );

    }


    /*
       FERMER EN CLIQUANT À L'EXTÉRIEUR
    */

    modal.addEventListener(
        "click",
        function(event) {

            if (
                event.target === modal
            ) {

                modal.classList.remove(
                    "active"
                );

            }

        }
    );

}

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

    const transactions = appData.transactions || [];
    const savingsData = appData.savings || [];

    const income = getTotalIncome();
    const expenses = getTotalExpenses();
    const savings = getTotalSavings();

    // Nombre d'opérations réellement enregistrées
    const operationCount = transactions.length;

    // Nombre d'encaissements
    const incomeTransactions = transactions.filter(
        transaction => transaction.type === "income"
    );

    // Le score ne démarre pas trop tôt
    if (
        operationCount < 5 ||
        incomeTransactions.length < 2 ||
        expenses <= 0 ||
        savings <= 0
    ) {
        return null;
    }

    const scores = [];

    /* =====================================
       1. ÉPARGNE — 30%
    ===================================== */

    const savingRate =
        income > 0
            ? (savings / income) * 100
            : 0;

    // Objectif de référence : 20% d'épargne
    const savingsScore = Math.min(
        (savingRate / 20) * 100,
        100
    );

    scores.push({
        name: "savings",
        score: savingsScore,
        weight: 30
    });


    /* =====================================
       2. DÉPENSES — 25%
    ===================================== */

    const expenseRate =
        income > 0
            ? (expenses / income) * 100
            : 0;

    /*
       <= 50% des revenus dépensés :
       excellente maîtrise.

       100% ou plus :
       score nul.
    */

    let expensesScore;

    if (expenseRate <= 50) {

        expensesScore = 100;

    } else {

        expensesScore =
            Math.max(
                0,
                100 -
                ((expenseRate - 50) / 50) * 100
            );

    }

    scores.push({
        name: "expenses",
        score: expensesScore,
        weight: 25
    });


    /* =====================================
       3. BUSINESS — 20%
    ===================================== */

    let businessScore = null;

    if (incomeTransactions.length >= 5) {

        const ordered =
            [...incomeTransactions].sort(
                (a, b) =>
                    new Date(a.date) -
                    new Date(b.date)
            );

        const middle =
            Math.floor(ordered.length / 2);

        const firstPart =
            ordered.slice(0, middle);

        const secondPart =
            ordered.slice(middle);


        const firstAverage =
            firstPart.reduce(
                (total, transaction) =>
                    total +
                    Number(transaction.amount || 0),
                0
            ) /
            Math.max(firstPart.length, 1);


        const secondAverage =
            secondPart.reduce(
                (total, transaction) =>
                    total +
                    Number(transaction.amount || 0),
                0
            ) /
            Math.max(secondPart.length, 1);


        if (firstAverage > 0) {

            const growth =
                (
                    (secondAverage - firstAverage)
                    /
                    firstAverage
                ) * 100;


            /*
               +20% ou plus :
               100

               0% :
               60

               -20% ou moins :
               20
            */

            businessScore =
                Math.min(
                    100,
                    Math.max(
                        20,
                        60 + growth * 2
                    )
                );

        }

    }


    if (businessScore !== null) {

        scores.push({
            name: "business",
            score: businessScore,
            weight: 20
        });

    }


    /* =====================================
       4. TRADING — 15%
    ===================================== */

    /*
       Le module Trading n'est pas encore
       suffisamment développé.

       Donc aucune note fictive.
    */

    const tradingScore = null;


    /* =====================================
       5. RÉGULARITÉ — 10%
    ===================================== */

    let regularityScore = null;

    if (incomeTransactions.length >= 5) {

        const dates =
            incomeTransactions
                .map(
                    transaction =>
                        new Date(transaction.date)
                )
                .sort(
                    (a, b) => a - b
                );


        const firstDate =
            dates[0];

        const lastDate =
            dates[dates.length - 1];


        const days =
            Math.max(
                1,
                (
                    lastDate - firstDate
                ) /
                (1000 * 60 * 60 * 24)
            );


        /*
           On mesure la fréquence moyenne
           des encaissements.
        */

        const frequency =
            incomeTransactions.length /
            days;


        regularityScore =
            Math.min(
                100,
                Math.max(
                    0,
                    frequency * 30
                )
            );

    }


    if (regularityScore !== null) {

        scores.push({
            name: "regularity",
            score: regularityScore,
            weight: 10
        });

    }


    /* =====================================
       SCORE GLOBAL
    ===================================== */

    if (scores.length < 2) {

        return null;

    }


    /*
       On ne donne pas automatiquement
       les points des critères inexistants.

       Le score est calculé uniquement
       avec les critères réellement disponibles.
    */

    const totalWeight =
        scores.reduce(
            (total, item) =>
                total + item.weight,
            0
        );


    const weightedScore =
        scores.reduce(
            (total, item) =>
                total +
                (
                    item.score *
                    item.weight
                ),
            0
        );


    const globalScore =
        weightedScore /
        totalWeight;


    return {

        global:
            Math.round(globalScore),

        savings:
            Math.round(savingsScore),

        expenses:
            Math.round(expensesScore),

        business:
            businessScore === null
                ? null
                : Math.round(businessScore),

        trading:
            tradingScore,

        regularity:
            regularityScore === null
                ? null
                : Math.round(regularityScore)

    };

}

/* =========================================
   AFFICHAGE DU SCORE
========================================= */

function updateFinancialScore() {

    const result =
        calculateFinancialScore();


    const score =
        document.getElementById(
            "financialScore"
        );

    const status =
        document.getElementById(
            "scoreStatus"
        );


    /*
       Pas assez de données
    */

    if (!result) {

        if (score) {

            score.textContent = "—";

        }

        if (status) {

            status.textContent =
                "Pas encore assez de données";

        }


        setScore(
            "scoreSavings",
            null
        );

        setScore(
            "scoreExpenses",
            null
        );

        setScore(
            "scoreBusiness",
            null
        );

        setScore(
            "scoreTrading",
            null
        );

        setScore(
            "scoreRegularity",
            null
        );


        return;

    }


    /*
       Score global
    */

    if (score) {

        score.textContent =
            result.global;

    }


    /*
       Message
    */

    if (status) {

        if (result.global >= 80) {

            status.textContent =
                "Excellente gestion";

        }

        else if (result.global >= 60) {

            status.textContent =
                "Gestion correcte";

        }

        else if (result.global >= 40) {

            status.textContent =
                "Gestion à améliorer";

        }

        else {

            status.textContent =
                "Situation préoccupante";

        }

    }


    /*
       Sous-scores
    */

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

/* =========================================
   GRAPHIQUE — ÉVOLUTION FINANCIÈRE
========================================= */

let currentChartPeriod = "7";


/* =========================================
   RÉCUPÉRER LES DONNÉES
========================================= */

function getChartTransactions() {

    return appData.transactions || [];

}


function getChartSavings() {

    return appData.savings || [];

}


/* =========================================
   DATE DE DÉBUT
========================================= */

function getPeriodStart(period) {

    const now = new Date();

    const start = new Date(now);


    switch (period) {

        case "7":

            start.setDate(
                start.getDate() - 6
            );

            break;


        case "30":

            start.setDate(
                start.getDate() - 29
            );

            break;


        case "3m":

            start.setMonth(
                start.getMonth() - 3
            );

            break;


        case "6m":

            start.setMonth(
                start.getMonth() - 6
            );

            break;


        case "1y":

            start.setFullYear(
                start.getFullYear() - 1
            );

            break;

    }


    start.setHours(0, 0, 0, 0);

    return start;

}


/* =========================================
   FORMAT DE DATE
========================================= */

function dateKey(date) {

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");


    return `${year}-${month}-${day}`;

}


/* =========================================
   CRÉER LES PÉRIODES
========================================= */

function createChartPeriods(period) {

    const now = new Date();

    const start =
        getPeriodStart(period);


    const periods = [];


    /*
       7 JOURS
    */

    if (period === "7") {

        let current =
            new Date(start);


        while (current <= now) {

            periods.push({

                key: dateKey(current),

                date: new Date(current)

            });


            current.setDate(
                current.getDate() + 1
            );

        }

    }


    /*
       30 JOURS
    */

    else if (period === "30") {

        let current =
            new Date(start);


        while (current <= now) {

            periods.push({

                key: dateKey(current),

                date: new Date(current)

            });


            current.setDate(
                current.getDate() + 1
            );

        }

    }


    /*
       3 / 6 / 12 MOIS
    */

    else {

        let current =
            new Date(
                start.getFullYear(),
                start.getMonth(),
                1
            );


        while (current <= now) {

            periods.push({

                key:
                    `${current.getFullYear()}-${String(
                        current.getMonth() + 1
                    ).padStart(2, "0")}`,

                date:
                    new Date(current)

            });


            current.setMonth(
                current.getMonth() + 1
            );

        }

    }


    return periods;

}


/* =========================================
   AGRÉGER LES DONNÉES
========================================= */

function buildChartData(period) {

    const periods =
        createChartPeriods(period);


    const transactions =
        getChartTransactions();


    const savings =
        getChartSavings();


    let cumulativeIncome = 0;

    let cumulativeExpenses = 0;

    let cumulativeSavings = 0;


    const data = periods.map(item => {

        let income = 0;

        let expense = 0;

        let saving = 0;


        transactions.forEach(transaction => {

            const transactionDate =
                new Date(transaction.date);


            let matches = false;


            if (
                period === "7" ||
                period === "30"
            ) {

                matches =
                    dateKey(transactionDate)
                    === item.key;

            }

            else {

                matches =
                    `${transactionDate.getFullYear()}-${String(
                        transactionDate.getMonth() + 1
                    ).padStart(2, "0")}`
                    === item.key;

            }


            if (!matches)
                return;


            if (
                transaction.type === "income"
            ) {

                income +=
                    Number(transaction.amount) || 0;

            }


            if (
                transaction.type === "expense"
            ) {

                expense +=
                    Number(transaction.amount) || 0;

            }

        });


        savings.forEach(itemSaving => {

            const savingDate =
                new Date(itemSaving.date);


            let matches = false;


            if (
                period === "7" ||
                period === "30"
            ) {

                matches =
                    dateKey(savingDate)
                    === item.key;

            }

            else {

                matches =
                    `${savingDate.getFullYear()}-${String(
                        savingDate.getMonth() + 1
                    ).padStart(2, "0")}`
                    === item.key;

            }


            if (matches) {

                saving +=
                    Number(itemSaving.amount) || 0;

            }

        });


        cumulativeIncome += income;

        cumulativeExpenses += expense;

        cumulativeSavings += saving;


        return {

            label: formatChartLabel(item.date, period),

            income: cumulativeIncome,

            expense: cumulativeExpenses,

            saving: cumulativeSavings

        };

    });


    return data;

}


/* =========================================
   LABELS
========================================= */

function formatChartLabel(date, period) {

    if (
        period === "3m" ||
        period === "6m" ||
        period === "1y"
    ) {

        return date.toLocaleDateString(
            "fr-FR",
            {
                month: "short"
            }
        );

    }


    return date.toLocaleDateString(
        "fr-FR",
        {
            day: "numeric",
            month: "short"
        }
    );

}


/* =========================================
   DESSINER LE GRAPHIQUE
========================================= */

function renderFinancialChart() {

    const svg =
        document.getElementById(
            "financialChartSvg"
        );


    if (!svg)
        return;


    const data =
        buildChartData(
            currentChartPeriod
        );


    const incomeLine =
        document.getElementById(
            "incomeLine"
        );

    const expenseLine =
        document.getElementById(
            "expenseLine"
        );

    const savingLine =
        document.getElementById(
            "savingLine"
        );

    const labels =
        document.getElementById(
            "chartLabels"
        );

    const empty =
        document.getElementById(
            "chartEmpty"
        );


    /*
       Aucune opération
    */

    if (
        data.length === 0 ||
        getChartTransactions().length === 0
    ) {

        svg.style.display = "none";

        empty.classList.remove("hidden");

        labels.innerHTML = "";

        return;

    }


    svg.style.display = "block";

    empty.classList.add("hidden");


    /*
       Dimensions SVG
    */

    const width = 800;

    const height = 300;

    const paddingTop = 20;

    const paddingBottom = 35;


    /*
       Trouver le maximum
    */

    const maxValue =
        Math.max(

            ...data.map(item =>
                Math.max(
                    item.income,
                    item.expense,
                    item.saving
                )
            ),

            1

        );


    /*
       Convertir valeur → coordonnées
    */

    function getPoint(value, index) {

        const x =
            data.length === 1
                ? width / 2
                : (index / (data.length - 1))
                  * width;


        const usableHeight =
            height -
            paddingTop -
            paddingBottom;


        const y =
            paddingTop +
            usableHeight -
            (
                value / maxValue
            ) *
            usableHeight;


        return `${x},${y}`;

    }


    const incomePoints =
        data.map(
            (item, index) =>
                getPoint(
                    item.income,
                    index
                )
        ).join(" ");


    const expensePoints =
        data.map(
            (item, index) =>
                getPoint(
                    item.expense,
                    index
                )
        ).join(" ");


    const savingPoints =
        data.map(
            (item, index) =>
                getPoint(
                    item.saving,
                    index
                )
        ).join(" ");


    incomeLine.setAttribute(
        "points",
        incomePoints
    );


    expenseLine.setAttribute(
        "points",
        expensePoints
    );


    savingLine.setAttribute(
        "points",
        savingPoints
    );


    /*
       Labels
    */

    labels.innerHTML =
        data.map(item => {

            return `
                <span>
                    ${item.label}
                </span>
            `;

        }).join("");


    /*
       Limiter le nombre de labels
       pour les longues périodes.
    */

    if (data.length > 8) {

        const labelElements =
            labels.querySelectorAll(
                "span"
            );


        labelElements.forEach(
            (element, index) => {

                if (
                    index !== 0 &&
                    index !== data.length - 1 &&
                    index % Math.ceil(
                        data.length / 6
                    ) !== 0
                ) {

                    element.style.visibility =
                        "hidden";

                }

            }
        );

    }

}


/* =========================================
   BOUTONS 7J / 30J / 3M / 6M / 1AN
========================================= */

function initializeChartPeriods() {

    const buttons =
        document.querySelectorAll(
            ".period-button"
        );


    buttons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                /*
                   Retirer active
                */

                buttons.forEach(
                    item =>
                        item.classList.remove(
                            "active"
                        )
                );


                /*
                   Activer le bouton
                */

                button.classList.add(
                    "active"
                );


                /*
                   Nouvelle période
                */

                currentChartPeriod =
                    button.dataset.period;


                /*
                   Redessiner
                */

                renderFinancialChart();

            }
        );

    });

}


/* =========================================
   INITIALISATION GRAPHIQUE
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    console.log("Million Tracker chargé.");

    updateDashboard();

    initializeExpenseModal();

    initializeHistory();

});

/* =========================================
   DATE ACTUELLE DU DASHBOARD
========================================= */

function updateCurrentDate() {

    const dateElement =
        document.getElementById("currentDate");


    if (!dateElement)
        return;


    const today = new Date();


    const formattedDate =
        today.toLocaleDateString(
            "fr-FR",
            {
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );


    dateElement.textContent =
        formattedDate.toUpperCase();

}

/* =========================================
   AJOUTER UNE DÉPENSE
========================================= */

function initializeExpenseModal() {

    const modal =
        document.getElementById("expenseModal");

    const openButton =
        document.getElementById("openExpenseModal");

    const closeButton =
        document.getElementById("closeExpenseModal");

    const cancelButton =
        document.getElementById("cancelExpense");

    const form =
        document.getElementById("expenseForm");

    const dateInput =
        document.getElementById("expenseDate");


    if (
        !modal ||
        !openButton ||
        !closeButton ||
        !cancelButton ||
        !form
    ) {
        return;
    }


    /* =========================
       OUVRIR
    ========================= */

    openButton.addEventListener(
        "click",
        function(event) {

            event.preventDefault();

           modal.classList.add("show");

            /*
               Date réelle du jour.
               Aucune date fictive.
            */

            if (dateInput) {

                const today =
                    new Date();

                const year =
                    today.getFullYear();

                const month =
                    String(
                        today.getMonth() + 1
                    ).padStart(2, "0");

                const day =
                    String(
                        today.getDate()
                    ).padStart(2, "0");

                dateInput.value =
                    `${year}-${month}-${day}`;
            }

        }
    );


    /* =========================
       FERMER
    ========================= */

    function closeExpenseModal() {

        modal.classList.remove("show");

        form.reset();

    }


    closeButton.addEventListener(
        "click",
        closeExpenseModal
    );


    cancelButton.addEventListener(
        "click",
        closeExpenseModal
    );


    /*
       Fermer en cliquant à l'extérieur
    */

    modal.addEventListener(
        "click",
        function(event) {

            if (
                event.target === modal
            ) {

                closeExpenseModal();

            }

        }
    );


    /* =========================
       ENREGISTRER
    ========================= */

    form.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            const amount =
                Number(
                    document.getElementById(
                        "expenseAmount"
                    ).value
                );


            const category =
                document.getElementById(
                    "expenseCategory"
                ).value;


            const date =
                document.getElementById(
                    "expenseDate"
                ).value;


            const note =
                document.getElementById(
                    "expenseNote"
                ).value.trim();


            /*
               Vérifications
            */

            if (
                !amount ||
                amount <= 0
            ) {

                alert(
                    "Entre un montant valide."
                );

                return;

            }


            if (!category) {

                alert(
                    "Sélectionne une catégorie."
                );

                return;

            }


            if (!date) {

                alert(
                    "Sélectionne une date."
                );

                return;

            }


            /*
               Création de la dépense
            */

            const expense = {

                id:
                    Date.now(),

                type:
                    "expense",

                amount:
                    amount,

                category:
                    category,

                date:
                    date,

                note:
                    note,

                createdAt:
                    new Date().toISOString()

            };


            /*
               Ajouter aux données existantes
            */

            if (
                !Array.isArray(
                    appData.transactions
                )
            ) {

                appData.transactions = [];

            }


            appData.transactions.push(
                expense
            );


            /*
               Sauvegarder
            */

            saveData();


            /*
               Mettre à jour l'application
            */

            closeExpenseModal();


            /*
               Rafraîchir les éléments
               existants du Dashboard
            */

            if (
                typeof updateDashboard ===
                "function"
            ) {

                updateDashboard();

            }


            if (
                typeof updateFinancialScore ===
                "function"
            ) {

                updateFinancialScore();

            }


            if (
                typeof renderFinancialChart ===
                "function"
            ) {

                renderFinancialChart();

            }


            /*
               Message de confirmation
            */

            alert(
                "Dépense enregistrée."
            );

        }
    );

}

/* =========================================
   HISTORIQUE DES TRANSACTIONS
========================================= */

function renderHistory(filter = "all") {

    const historyList =
        document.getElementById("historyList");

    const incomeTotal =
        document.getElementById("historyIncomeTotal");

    const expenseTotal =
        document.getElementById("historyExpenseTotal");

    const balance =
        document.getElementById("historyBalance");


    if (!historyList) {
        return;
    }


    /*
       On utilise uniquement les transactions
       réellement enregistrées.
    */

    const transactions =
        Array.isArray(appData.transactions)
            ? appData.transactions
            : [];


    /*
       Calcul des totaux réels
    */

    let totalIncome = 0;
    let totalExpense = 0;


    transactions.forEach(transaction => {

        const amount =
            Number(transaction.amount) || 0;


        if (transaction.type === "income") {

            totalIncome += amount;

        }


        if (transaction.type === "expense") {

            totalExpense += amount;

        }

    });


    /*
       Mise à jour du résumé
    */

    if (incomeTotal) {

        incomeTotal.textContent =
            formatMoney(totalIncome);

    }


    if (expenseTotal) {

        expenseTotal.textContent =
            formatMoney(totalExpense);

    }


    if (balance) {

        balance.textContent =
            formatMoney(
                totalIncome - totalExpense
            );

    }


    /*
       Filtrage
    */

    let filteredTransactions =
        transactions.filter(transaction => {

            if (filter === "all") {
                return true;
            }

            return transaction.type === filter;

        });


    /*
       Plus récentes en premier
    */

    filteredTransactions.sort(
        (a, b) => {

            return (
                new Date(b.date) -
                new Date(a.date)
            );

        }
    );


    /*
       Aucune transaction
    */

    if (
        filteredTransactions.length === 0
    ) {

        historyList.innerHTML = `
            <div class="history-empty">
                <strong>Aucune transaction</strong>
                <span>
                    Aucune opération enregistrée pour le moment.
                </span>
            </div>
        `;

        return;

    }


    /*
       Affichage des transactions
    */

    historyList.innerHTML =
        filteredTransactions.map(
            transaction => {

                const amount =
                    Number(transaction.amount) || 0;


                const isIncome =
                    transaction.type === "income";


                const typeClass =
                    isIncome
                        ? "history-income"
                        : "history-expense";


                const sign =
                    isIncome ? "+" : "-";


                const title =
                    isIncome
                        ? (
                            transaction.source ||
                            transaction.category ||
                            "Revenu"
                        )
                        : (
                            transaction.category ||
                            "Dépense"
                        );


                const description =
                    transaction.note ||
                    "";


                const formattedDate =
                    formatHistoryDate(
                        transaction.date
                    );


                return `
                    <div class="history-item ${typeClass}">

                        <div class="history-item-info">

                            <strong>
                                ${escapeHistoryText(title)}
                            </strong>

                            <span>
                                ${formattedDate}
                            </span>

                            ${
                                description
                                    ? `
                                        <small>
                                            ${escapeHistoryText(description)}
                                        </small>
                                      `
                                    : ""
                            }

                        </div>


                        <strong class="history-amount">
                            ${sign}${formatMoney(amount)}
                        </strong>

                    </div>
                `;

            }
        ).join("");

}


/* =========================================
   FORMATAGE MONÉTAIRE
========================================= */

function formatMoney(amount) {

    return (
        Number(amount) || 0
    ).toLocaleString(
        "fr-FR"
    ) + " F";

}


/* =========================================
   FORMATAGE DATE HISTORIQUE
========================================= */

function formatHistoryDate(dateValue) {

    if (!dateValue) {
        return "Date inconnue";
    }


    const date =
        new Date(dateValue);


    if (isNaN(date.getTime())) {
        return dateValue;
    }


    return date.toLocaleDateString(
        "fr-FR",
        {
            day: "2-digit",
            month: "long",
            year: "numeric"
        }
    );

}


/* =========================================
   PROTECTION DU TEXTE AFFICHÉ
========================================= */

function escapeHistoryText(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================
   FILTRES HISTORIQUE
========================================= */

function initializeHistory() {

    const filterButtons =
        document.querySelectorAll(
            ".history-filter"
        );


    filterButtons.forEach(button => {

        button.addEventListener(
            "click",
            function() {

                filterButtons.forEach(
                    item => {
                        item.classList.remove(
                            "active"
                        );
                    }
                );


                this.classList.add(
                    "active"
                );


                const filter =
                    this.dataset.historyFilter;


                renderHistory(filter);

            }
        );

    });


    renderHistory("all");

}



    /* =========================
       AFFICHER DASHBOARD
    ========================= */

    dashboardButton.addEventListener(
        "click",
        function(event) {

            event.preventDefault();

            dashboard.style.display = "";

            history.style.display = "none";


            dashboardButton.classList.add(
                "active"
            );

            historyButton.classList.remove(
                "active"
            );

        }
    );


    /* =========================
       AFFICHER HISTORIQUE
    ========================= */

    historyButton.addEventListener(
        "click",
        function(event) {

            event.preventDefault();

            dashboard.style.display = "none";

            history.style.display = "block";


            historyButton.classList.add(
                "active"
            );

            dashboardButton.classList.remove(
                "active"
            );


            /*
               Actualiser les données
            */

            if (
                typeof renderHistory ===
                "function"
            ) {

                renderHistory("all");

            }

        }
    );


    /*
       État initial :
       Dashboard visible,
       Historique caché.
    */

    history.style.display = "none";

}
