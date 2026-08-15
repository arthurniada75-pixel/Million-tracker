/* =========================================================
   MILLION TRACKER
   APPLICATION PRINCIPALE
   Version propre - sans données fictives
========================================================= */


/* =========================================================
   1. CONFIGURATION
========================================================= */

const APP_CONFIG = {

    storageKey: "millionTrackerData_v2",

    goal: 1000000,

    recommendedSavingRate: 0.30

};


/* =========================================================
   2. DONNÉES DE L'APPLICATION
========================================================= */

let appData = loadData();


function createEmptyData() {

    return {

        transactions: [],

        savings: [],

        trading: [],

        settings: {

            goal: APP_CONFIG.goal

        }

    };

}


/* =========================================================
   3. LOCAL STORAGE
========================================================= */

function loadData() {

    try {

        const saved =
            localStorage.getItem(
                APP_CONFIG.storageKey
            );


        if (!saved) {

            return createEmptyData();

        }


        const parsed =
            JSON.parse(saved);


        return {

            transactions:
                Array.isArray(parsed.transactions)
                    ? parsed.transactions
                    : [],

            savings:
                Array.isArray(parsed.savings)
                    ? parsed.savings
                    : [],

            trading:
                Array.isArray(parsed.trading)
                    ? parsed.trading
                    : [],

            settings: {

                goal:
                    Number(
                        parsed.settings?.goal
                    ) ||
                    APP_CONFIG.goal

            }

        };

    } catch (error) {

        console.error(
            "Erreur lors du chargement des données :",
            error
        );

        return createEmptyData();

    }

}


function saveData() {

    try {

        localStorage.setItem(

            APP_CONFIG.storageKey,

            JSON.stringify(appData)

        );

    } catch (error) {

        console.error(
            "Impossible de sauvegarder les données :",
            error
        );

    }

}


/* =========================================================
   4. OUTILS GÉNÉRAUX
========================================================= */

function formatMoney(value) {

    const amount =
        Number(value) || 0;


    return (
        amount.toLocaleString("fr-FR")
        + " F"
    );

}


function formatDate(dateValue) {

    if (!dateValue) {

        return "Date inconnue";

    }


    const date =
        new Date(
            dateValue + "T00:00:00"
        );


    if (Number.isNaN(date.getTime())) {

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


function getTodayISO() {

    const now =
        new Date();


    const year =
        now.getFullYear();


    const month =
        String(
            now.getMonth() + 1
        ).padStart(2, "0");


    const day =
        String(
            now.getDate()
        ).padStart(2, "0");


    return `${year}-${month}-${day}`;

}


function escapeHTML(value) {

    return String(value ?? "")

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}


function setText(id, value) {

    const element =
        document.getElementById(id);


    if (element) {

        element.textContent =
            value;

    }

}


function getIncomeTotal() {

    return appData.transactions

        .filter(
            transaction =>
                transaction.type === "income"
        )

        .reduce(

            (total, transaction) =>

                total +
                (
                    Number(
                        transaction.amount
                    ) || 0
                ),

            0

        );

}


function getExpenseTotal() {

    return appData.transactions

        .filter(
            transaction =>
                transaction.type === "expense"
        )

        .reduce(

            (total, transaction) =>

                total +
                (
                    Number(
                        transaction.amount
                    ) || 0
                ),

            0

        );

}


function getSavingsTotal() {

    return appData.savings

        .reduce(

            (total, saving) =>

                total +
                (
                    Number(
                        saving.amount
                    ) || 0
                ),

            0

        );

}


function getTradingNet() {

    return appData.trading

        .reduce(

            (total, trade) =>

                total +
                (
                    Number(
                        trade.result
                    ) || 0
                ),

            0

        );

}


function getCurrentBalance() {

    return (

        getIncomeTotal()

        -

        getExpenseTotal()

        -

        getSavingsTotal()

    );

}


/* =========================================================
   5. DATE ACTUELLE
========================================================= */

function updateCurrentDate() {

    const element =
        document.getElementById(
            "currentDate"
        );


    if (!element) {

        return;

    }


    const now =
        new Date();


    element.textContent =
        now.toLocaleDateString(
            "fr-FR",
            {

                day: "2-digit",

                month: "long",

                year: "numeric"

            }
        );

}


/* =========================================================
   6. DASHBOARD
========================================================= */

function updateDashboard() {

    const income =
        getIncomeTotal();


    const expenses =
        getExpenseTotal();


    const savings =
        getSavingsTotal();


    const balance =
        getCurrentBalance();


    const goal =
        Number(
            appData.settings.goal
        ) ||
        APP_CONFIG.goal;


    setText(
        "totalIncome",
        formatMoney(income)
    );


    setText(
        "totalExpenses",
        formatMoney(expenses)
    );


    setText(
        "totalSavings",
        formatMoney(savings)
    );


    setText(
        "currentBalance",
        formatMoney(balance)
    );


    /* -----------------------------------------
       TAUX D'ÉPARGNE
    ----------------------------------------- */

    if (income > 0) {

        const savingRate =
            (
                savings /
                income
            ) * 100;


        setText(
            "savingRate",
            `${savingRate.toFixed(1)} %`
        );

    } else {

        setText(
            "savingRate",
            "—"
        );

    }


    /* -----------------------------------------
       STATUT DU SOLDE
    ----------------------------------------- */

    if (balance > 0) {

        setText(
            "balanceStatus",
            "Solde positif"
        );

    } else if (balance < 0) {

        setText(
            "balanceStatus",
            "Solde négatif"
        );

    } else {

        setText(
            "balanceStatus",
            "—"
        );

    }


    /* -----------------------------------------
       OBJECTIF
    ----------------------------------------- */

    updateGoalDisplay(
        savings,
        goal
    );


    /* -----------------------------------------
       SCORE
    ----------------------------------------- */

    updateFinancialScore();


    /* -----------------------------------------
       ALERTES
    ----------------------------------------- */

    updateAlerts();


    /* -----------------------------------------
       SIDEBAR
    ----------------------------------------- */

    updateSidebarGoal(
        savings,
        goal
    );


    /* -----------------------------------------
       GRAPHIQUE
    ----------------------------------------- */

    updateFinancialChart();


    /* -----------------------------------------
       HISTORIQUE
    ----------------------------------------- */

    renderHistory(
        currentHistoryFilter
    );

}


/* =========================================================
   7. OBJECTIF 1 MILLION
========================================================= */

function updateGoalDisplay(
    savings,
    goal
) {

    const safeGoal =
        Math.max(
            Number(goal) || APP_CONFIG.goal,
            1
        );


    const percent =
        Math.min(
            (
                savings /
                safeGoal
            ) * 100,
            100
        );


    const remaining =
        Math.max(
            safeGoal - savings,
            0
        );


    setText(
        "goalPercent",
        `${percent.toFixed(1)} %`
    );


    setText(
        "goalSaved",
        formatMoney(savings)
    );


    setText(
        "goalRemaining",
        formatMoney(remaining)
    );


    const progress =
        document.getElementById(
            "goalProgressBar"
        );


    if (progress) {

        progress.style.width =
            `${percent}%`;

    }


    /* -----------------------------------------
       MOYENNE HEBDOMADAIRE
    ----------------------------------------- */

    const weeklyAverage =
        calculateWeeklyAverage();


    setText(
        "weeklyAverage",
        weeklyAverage > 0
            ? formatMoney(weeklyAverage)
            : "—"
    );

}


function calculateWeeklyAverage() {

    const savings =
        appData.savings;


    if (!savings.length) {

        return 0;

    }


    const dates =
        savings

            .map(
                saving =>
                    new Date(
                        saving.date +
                        "T00:00:00"
                    )
            )

            .filter(
                date =>
                    !Number.isNaN(
                        date.getTime()
                    )
            );


    if (!dates.length) {

        return 0;

    }


    const first =
        Math.min(
            ...dates.map(
                date =>
                    date.getTime()
            )
        );


    const last =
        Math.max(
            ...dates.map(
                date =>
                    date.getTime()
            )
        );


    const weeks =
        Math.max(
            (
                (
                    last -
                    first
                ) /
                (
                    1000 *
                    60 *
                    60 *
                    24 *
                    7
                )
            ),
            1
        );


    return (
        getSavingsTotal() /
        weeks
    );

}


function updateSidebarGoal(
    savings,
    goal
) {

    const safeGoal =
        Math.max(
            Number(goal) || APP_CONFIG.goal,
            1
        );


    const percent =
        Math.min(
            (
                savings /
                safeGoal
            ) * 100,
            100
        );


    const progress =
        document.getElementById(
            "sidebarGoalProgress"
        );


    if (progress) {

        progress.style.width =
            `${percent}%`;

    }


    setText(
        "sidebarGoalPercent",
        `${percent.toFixed(1)} %`
    );

}


/* =========================================================
   8. SCORE FINANCIER
========================================================= */

function updateFinancialScore() {

    const income =
        getIncomeTotal();


    const expenses =
        getExpenseTotal();


    const savings =
        getSavingsTotal();


    const trading =
        getTradingNet();


    const transactionCount =
        appData.transactions.length;


    /*
       Aucun historique :
       on ne fabrique aucun score.
    */

    if (
        income === 0 &&
        expenses === 0 &&
        savings === 0 &&
        transactionCount === 0
    ) {

        setText(
            "financialScore",
            "—"
        );


        setText(
            "scoreStatus",
            "Pas encore assez de données"
        );


        setText(
            "scoreSavings",
            "—"
        );


        setText(
            "scoreExpenses",
            "—"
        );


        setText(
            "scoreBusiness",
            "—"
        );


        setText(
            "scoreTrading",
            "—"
        );


        setText(
            "scoreRegularity",
            "—"
        );


        return;

    }


    /* -----------------------------------------
       ÉPARGNE
    ----------------------------------------- */

    const savingRatio =
        income > 0
            ? (
                savings /
                income
            )
            : 0;


    const savingScore =
        Math.min(
            savingRatio /
            APP_CONFIG.recommendedSavingRate,
            1
        ) * 30;


    /* -----------------------------------------
       DÉPENSES
    ----------------------------------------- */

    let expenseScore = 20;


    if (income > 0) {

        const expenseRatio =
            expenses /
            income;


        if (expenseRatio <= 0.5) {

            expenseScore = 20;

        } else if (
            expenseRatio <= 0.7
        ) {

            expenseScore = 15;

        } else if (
            expenseRatio <= 0.9
        ) {

            expenseScore = 8;

        } else {

            expenseScore = 0;

        }

    }


    /* -----------------------------------------
       BUSINESS
    ----------------------------------------- */

    const businessIncome =
        appData.transactions

            .filter(
                transaction =>
                    transaction.type === "income" &&
                    transaction.category === "Business"
            )

            .reduce(

                (total, transaction) =>

                    total +
                    (
                        Number(
                            transaction.amount
                        ) || 0
                    ),

                0

            );


    const businessScore =
        income > 0

            ? Math.min(
                (
                    businessIncome /
                    income
                ) * 20,
                20
            )

            : 0;


    /* -----------------------------------------
       TRADING
    ----------------------------------------- */

    let tradingScore = 0;


    if (appData.trading.length > 0) {

        tradingScore =
            trading >= 0
                ? 10
                : 0;

    }


    /* -----------------------------------------
       RÉGULARITÉ
    ----------------------------------------- */

    const regularityScore =
        calculateRegularityScore();


    const score =
        Math.round(
            Math.min(
                savingScore +
                expenseScore +
                businessScore +
                tradingScore +
                regularityScore,
                100
            )
        );


    setText(
        "financialScore",
        score
    );


    setText(
        "scoreSavings",
        `${Math.round(
            savingScore
        )}/30`
    );


    setText(
        "scoreExpenses",
        `${Math.round(
            expenseScore
        )}/20`
    );


    setText(
        "scoreBusiness",
        `${Math.round(
            businessScore
        )}/20`
    );


    setText(
        "scoreTrading",
        `${Math.round(
            tradingScore
        )}/10`
    );


    setText(
        "scoreRegularity",
        `${Math.round(
            regularityScore
        )}/20`
    );


    if (score >= 80) {

        setText(
            "scoreStatus",
            "Très bonne gestion"
        );

    } else if (score >= 60) {

        setText(
            "scoreStatus",
            "Gestion correcte"
        );

    } else if (score >= 40) {

        setText(
            "scoreStatus",
            "À améliorer"
        );

    } else {

        setText(
            "scoreStatus",
            "Gestion à surveiller"
        );

    }

}


function calculateRegularityScore() {

    const transactions =
        appData.transactions;


    if (!transactions.length) {

        return 0;

    }


    const uniqueDates =
        new Set(

            transactions.map(
                transaction =>
                    transaction.date
            )

        );


    return Math.min(
        uniqueDates.size * 4,
        20
    );

}


/* =========================================================
   9. ALERTES RÉELLES
========================================================= */

function updateAlerts() {

    const container =
        document.getElementById(
            "alertList"
        );


    if (!container) {

        return;

    }


    const income =
        getIncomeTotal();


    const expenses =
        getExpenseTotal();


    const savings =
        getSavingsTotal();


    const alerts = [];


    if (
        income === 0 &&
        expenses === 0 &&
        savings === 0
    ) {

        container.innerHTML = `

            <div class="alert-item success">

                <div class="alert-icon">
                    ✓
                </div>

                <div>

                    <strong>
                        Aucune donnée enregistrée
                    </strong>

                    <p>
                        Commence par enregistrer ton premier encaissement ou ta première dépense.
                    </p>

                </div>

            </div>

        `;

        return;

    }


    if (
        income > 0 &&
        expenses > income
    ) {

        alerts.push({

            type: "danger",

            icon: "!",

            title:
                "Dépenses supérieures aux revenus",

            text:
                "Tes dépenses enregistrées dépassent tes revenus."

        });

    }


    if (
        income > 0 &&
        savings <
        income *
        APP_CONFIG.recommendedSavingRate
    ) {

        alerts.push({

            type: "warning",

            icon: "!",

            title:
                "Épargne en dessous de la recommandation",

            text:
                "La recommandation actuelle est de mettre de côté 30 % des revenus."

        });

    }


    if (
        income > 0 &&
        expenses <= income &&
        savings >=
        income *
        APP_CONFIG.recommendedSavingRate
    ) {

        alerts.push({

            type: "success",

            icon: "✓",

            title:
                "Bonne discipline financière",

            text:
                "Tes dépenses restent sous tes revenus et ton épargne atteint la recommandation."

        });

    }


    if (!alerts.length) {

        alerts.push({

            type: "success",

            icon: "✓",

            title:
                "Aucune alerte critique",

            text:
                "Continue à enregistrer tes opérations réelles."

        });

    }


    container.innerHTML =
        alerts.map(
            alert => `

                <div class="alert-item ${escapeHTML(
                    alert.type
                )}">

                    <div class="alert-icon">
                        ${escapeHTML(
                            alert.icon
                        )}
                    </div>

                    <div>

                        <strong>
                            ${escapeHTML(
                                alert.title
                            )}
                        </strong>

                        <p>
                            ${escapeHTML(
                                alert.text
                            )}
                        </p>

                    </div>

                </div>

            `
        ).join("");

}


/* =========================================================
   10. MODAL AJOUTER UNE ENTRÉE
========================================================= */

function initializeIncomeModal() {

    const modal =
        document.getElementById(
            "incomeModal"
        );


    const form =
        document.getElementById(
            "incomeForm"
        );


    const closeButton =
        document.getElementById(
            "closeIncomeModal"
        );


    const cancelButton =
        document.getElementById(
            "cancelIncome"
        );


    if (!modal || !form) {

        return;

    }


    /*
       Tous les boutons contenant
       "Ajouter une entrée"
    */

    const openButtons =
        Array.from(
            document.querySelectorAll(
                ".nav-item, .quick-action"
            )
        ).filter(
            button =>
                button.textContent
                    .toLowerCase()
                    .includes(
                        "ajouter une entrée"
                    )
        );


    openButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    openModal(modal);

                }
            );

        }
    );


    closeButton?.addEventListener(
        "click",
        () => closeModal(modal)
    );


    cancelButton?.addEventListener(
        "click",
        () => closeModal(modal)
    );


    modal.addEventListener(
        "click",
        event => {

            if (
                event.target === modal
            ) {

                closeModal(modal);

            }

        }
    );


    const amountInput =
        document.getElementById(
            "incomeAmount"
        );


    amountInput?.addEventListener(
        "input",
        updateSavingPreview
    );


    /*
       Date actuelle par défaut
    */

    setDefaultDate(
        "incomeDate"
    );


    form.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            addIncome();

        }
    );

}


/* =========================================================
   11. AJOUTER UNE ENTRÉE
========================================================= */

function addIncome() {

    const amount =
        Number(
            document.getElementById(
                "incomeAmount"
            )?.value
        );


    const source =
        document.getElementById(
            "incomeSource"
        )?.value.trim();


    const category =
        document.getElementById(
            "incomeCategory"
        )?.value;


    const date =
        document.getElementById(
            "incomeDate"
        )?.value;


    const note =
        document.getElementById(
            "incomeNote"
        )?.value.trim();


    if (
        !amount ||
        amount <= 0 ||
        !source ||
        !date
    ) {

        alert(
            "Veuillez remplir correctement les champs obligatoires."
        );

        return;

    }


    const transaction = {

        id:
            createID(),

        type:
            "income",

        amount:
            amount,

        source:
            source,

        category:
            category || "Autre",

        date:
            date,

        note:
            note,

        createdAt:
            new Date().toISOString()

    };


    appData.transactions.push(
        transaction
    );


    saveData();


    const modal =
        document.getElementById(
            "incomeModal"
        );


    closeModal(modal);


    resetIncomeForm();


    updateDashboard();

}


/* =========================================================
   12. APERÇU ÉPARGNE RECOMMANDÉE
========================================================= */

function updateSavingPreview() {

    const amount =
        Number(
            document.getElementById(
                "incomeAmount"
            )?.value
        ) || 0;


    const recommended =
        amount *
        APP_CONFIG.recommendedSavingRate;


    const preview =
        document.querySelector(
            "#savingPreview strong"
        );


    if (preview) {

        preview.textContent =
            formatMoney(
                recommended
            );

    }

}


/* =========================================================
   13. RÉINITIALISER FORMULAIRE REVENU
========================================================= */

function resetIncomeForm() {

    const form =
        document.getElementById(
            "incomeForm"
        );


    if (form) {

        form.reset();

    }


    setDefaultDate(
        "incomeDate"
    );


    const preview =
        document.querySelector(
            "#savingPreview strong"
        );


    if (preview) {

        preview.textContent =
            "0 F";

    }

}


/* =========================================================
   14. MODAL AJOUTER UNE DÉPENSE
========================================================= */

function initializeExpenseModal() {

    const modal =
        document.getElementById(
            "expenseModal"
        );


    const form =
        document.getElementById(
            "expenseForm"
        );


    const closeButton =
        document.getElementById(
            "closeExpenseModal"
        );


    const cancelButton =
        document.getElementById(
            "cancelExpense"
        );


    const openButton =
        document.getElementById(
            "openExpenseModal"
        );


    if (!modal || !form) {

        return;

    }


    /*
       Bouton sidebar
    */

    openButton?.addEventListener(
        "click",
        event => {

            event.preventDefault();

            openModal(modal);

        }
    );


    /*
       Bouton rapide Dashboard
    */

    const quickExpenseButtons =
        Array.from(
            document.querySelectorAll(
                ".quick-action"
            )
        ).filter(
            button =>
                button.textContent
                    .toLowerCase()
                    .includes(
                        "ajouter une dépense"
                    )
        );


    quickExpenseButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    openModal(modal);

                }
            );

        }
    );


    closeButton?.addEventListener(
        "click",
        () => closeModal(modal)
    );


    cancelButton?.addEventListener(
        "click",
        () => closeModal(modal)
    );


    modal.addEventListener(
        "click",
        event => {

            if (
                event.target === modal
            ) {

                closeModal(modal);

            }

        }
    );


    setDefaultDate(
        "expenseDate"
    );


    form.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            addExpense();

        }
    );

}


/* =========================================================
   15. AJOUTER UNE DÉPENSE
========================================================= */

function addExpense() {

    const amount =
        Number(
            document.getElementById(
                "expenseAmount"
            )?.value
        );


    const category =
        document.getElementById(
            "expenseCategory"
        )?.value;


    const date =
        document.getElementById(
            "expenseDate"
        )?.value;


    const note =
        document.getElementById(
            "expenseNote"
        )?.value.trim();


    if (
        !amount ||
        amount <= 0 ||
        !category ||
        !date
    ) {

        alert(
            "Veuillez remplir correctement les champs obligatoires."
        );

        return;

    }


    const transaction = {

        id:
            createID(),

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


    appData.transactions.push(
        transaction
    );


    saveData();


    const modal =
        document.getElementById(
            "expenseModal"
        );


    closeModal(modal);


    resetExpenseForm();


    updateDashboard();

}


/* =========================================================
   16. RÉINITIALISER FORMULAIRE DÉPENSE
========================================================= */

function resetExpenseForm() {

    const form =
        document.getElementById(
            "expenseForm"
        );


    if (form) {

        form.reset();

    }


    setDefaultDate(
        "expenseDate"
    );

}


/* =========================================================
   17. MODALS
========================================================= */

function openModal(modal) {

    if (!modal) {

        return;

    }


    modal.classList.add(
        "show"
    );

}


function closeModal(modal) {

    if (!modal) {

        return;

    }


    modal.classList.remove(
        "show"
    );

}


function setDefaultDate(id) {

    const input =
        document.getElementById(id);


    if (
        input &&
        !input.value
    ) {

        input.value =
            getTodayISO();

    }

}


function createID() {

    return (

        Date.now().toString(36)

        +

        Math.random()
            .toString(36)
            .substring(2, 8)

    );

}


/* =========================================================
   18. HISTORIQUE
========================================================= */

let currentHistoryFilter =
    "all";


function initializeHistory() {

    const historyButton =
        document.getElementById(
            "openHistory"
        );


    const historyView =
        document.getElementById(
            "historyView"
        );


    if (!historyButton || !historyView) {

        return;

    }


    historyButton.addEventListener(
        "click",
        event => {

            event.preventDefault();

            showView(
                "history"
            );

        }
    );


    const filters =
        document.querySelectorAll(
            ".history-filter"
        );


    filters.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    filters.forEach(
                        item =>
                            item.classList.remove(
                                "active"
                            )
                    );


                    button.classList.add(
                        "active"
                    );


                    currentHistoryFilter =
                        button.dataset.historyFilter ||
                        "all";


                    renderHistory(
                        currentHistoryFilter
                    );

                }
            );

        }
    );


    renderHistory(
        "all"
    );

}


function renderHistory(
    filter = "all"
) {

    const list =
        document.getElementById(
            "historyList"
        );


    if (!list) {

        return;

    }


    let transactions =
        [...appData.transactions];


    if (
        filter === "income" ||
        filter === "expense"
    ) {

        transactions =
            transactions.filter(
                transaction =>
                    transaction.type === filter
            );

    }


    transactions.sort(
        (a, b) => {

            const dateA =
                new Date(
                    `${a.date}T00:00:00`
                ).getTime();


            const dateB =
                new Date(
                    `${b.date}T00:00:00`
                ).getTime();


            return dateB - dateA;

        }
    );


    const income =
        getIncomeTotal();


    const expenses =
        getExpenseTotal();


    setText(
        "historyIncomeTotal",
        formatMoney(income)
    );


    setText(
        "historyExpenseTotal",
        formatMoney(expenses)
    );


    setText(
        "historyBalance",
        formatMoney(
            income -
            expenses
        )
    );


    if (!transactions.length) {

        list.innerHTML = `

            <div class="history-empty">

                <strong>
                    Aucune transaction
                </strong>

                <span>
                    Aucune opération enregistrée pour le moment.
                </span>

            </div>

        `;

        return;

    }


    list.innerHTML =

        transactions.map(
            transaction => {

                const amount =
                    Number(
                        transaction.amount
                    ) || 0;


                const isIncome =
                    transaction.type ===
                    "income";


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


                const note =
                    transaction.note ||
                    "";


                return `

                    <div
                        class="history-item ${
                            isIncome
                                ? "history-income"
                                : "history-expense"
                        }"
                    >

                        <div class="history-item-info">

                            <strong>
                                ${escapeHTML(
                                    title
                                )}
                            </strong>

                            <span>
                                ${escapeHTML(
                                    formatDate(
                                        transaction.date
                                    )
                                )}
                            </span>

                            ${
                                note
                                    ? `
                                        <small>
                                            ${escapeHTML(
                                                note
                                            )}
                                        </small>
                                      `
                                    : ""
                            }

                        </div>


                        <strong class="history-amount">

                            ${
                                isIncome
                                    ? "+"
                                    : "-"
                            }${formatMoney(amount)}

                        </strong>


                        <button
                            type="button"
                            class="history-delete"
                            data-delete-id="${
                                escapeHTML(
                                    transaction.id
                                )
                            }"
                            title="Supprimer"
                        >
                            ×
                        </button>

                    </div>

                `;

            }
        ).join("");


    /*
       Boutons suppression
    */

    list.querySelectorAll(
        ".history-delete"
    ).forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    deleteTransaction(
                        button.dataset.deleteId
                    );

                }
            );

        }
    );

}


/* =========================================================
   19. SUPPRESSION TRANSACTION
========================================================= */

function deleteTransaction(id) {

    const transaction =
        appData.transactions.find(
            item =>
                item.id === id
        );


    if (!transaction) {

        return;

    }


    const amount =
        formatMoney(
            transaction.amount
        );


    const confirmed =
        confirm(
            `Supprimer cette opération de ${amount} ?`
        );


    if (!confirmed) {

        return;

    }


    appData.transactions =
        appData.transactions.filter(
            item =>
                item.id !== id
        );


    saveData();


    updateDashboard();

}


/* =========================================================
   20. NAVIGATION DASHBOARD / HISTORIQUE
========================================================= */

function initializeNavigation() {

    const dashboardButton =
        document.getElementById(
            "openDashboard"
        );


    if (!dashboardButton) {

        return;

    }


    dashboardButton.addEventListener(
        "click",
        event => {

            event.preventDefault();

            showView(
                "dashboard"
            );

        }
    );

}


function showView(view) {

    const dashboard =
        document.querySelector(
            ".dashboard"
        );


    const history =
        document.getElementById(
            "historyView"
        );


    const dashboardButton =
        document.getElementById(
            "openDashboard"
        );


    const historyButton =
        document.getElementById(
            "openHistory"
        );


    if (view === "dashboard") {

        if (dashboard) {

            dashboard.style.display =
                "";

        }


        if (history) {

            history.style.display =
                "none";

        }


        dashboardButton?.classList.add(
            "active"
        );


        historyButton?.classList.remove(
            "active"
        );


        return;

    }


    if (view === "history") {

        if (dashboard) {

            dashboard.style.display =
                "none";

        }


        if (history) {

            history.style.display =
                "block";

        }


        dashboardButton?.classList.remove(
            "active"
        );


        historyButton?.classList.add(
            "active"
        );


        renderHistory(
            currentHistoryFilter
        );

    }

}


/* =========================================================
   21. GRAPHIQUE
========================================================= */

let currentChartPeriod =
    7;


function initializeChart() {

    const buttons =
        document.querySelectorAll(
            ".period-button"
        );


    buttons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    buttons.forEach(
                        item =>
                            item.classList.remove(
                                "active"
                            )
                    );


                    button.classList.add(
                        "active"
                    );


                    const period =
                        button.dataset.period;


                    currentChartPeriod =
                        parsePeriod(
                            period
                        );


                    updateFinancialChart();

                }
            );

        }
    );


    updateFinancialChart();

}


function parsePeriod(
    period
) {

    if (period === "3m") {

        return 90;

    }


    if (period === "6m") {

        return 180;

    }


    if (period === "1y") {

        return 365;

    }


    return (
        Number(period) || 7
    );

}


function updateFinancialChart() {

    const svg =
        document.getElementById(
            "financialChartSvg"
        );


    const empty =
        document.getElementById(
            "chartEmpty"
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


    const pointsGroup =
        document.getElementById(
            "chartPoints"
        );


    if (
        !svg ||
        !incomeLine ||
        !expenseLine ||
        !savingLine
    ) {

        return;

    }


    const data =
        buildChartData(
            currentChartPeriod
        );


    if (!data.length) {

        incomeLine.setAttribute(
            "points",
            ""
        );


        expenseLine.setAttribute(
            "points",
            ""
        );


        savingLine.setAttribute(
            "points",
            ""
        );


        if (pointsGroup) {

            pointsGroup.innerHTML =
                "";

        }


        if (labels) {

            labels.innerHTML =
                "";

        }


        if (empty) {

            empty.style.display =
                "flex";

        }


        return;

    }


    if (empty) {

        empty.style.display =
            "none";

    }


    const width =
        800;


    const height =
        300;


    const paddingX =
        25;


    const paddingY =
        25;


    const maxValue =
        Math.max(

            ...data.map(
                point =>
                    Math.max(
                        point.income,
                        point.expense,
                        point.saving
                    )
            ),

            1

        );


    const xStep =
        data.length > 1

            ? (
                (
                    width -
                    paddingX * 2
                ) /
                (
                    data.length - 1
                )
            )

            : 0;


    function getX(index) {

        return (
            paddingX +
            (
                xStep *
                index
            )
        );

    }


    function getY(value) {

        return (

            height -
            paddingY -
            (
                (
                    value /
                    maxValue
                ) *
                (
                    height -
                    paddingY * 2
                )
            )

        );

    }


    const incomePoints =
        data.map(
            (point, index) =>
                `${getX(index)},${getY(point.income)}`
        ).join(" ");


    const expensePoints =
        data.map(
            (point, index) =>
                `${getX(index)},${getY(point.expense)}`
        ).join(" ");


    const savingPoints =
        data.map(
            (point, index) =>
                `${getX(index)},${getY(point.saving)}`
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
       Points
    */

    if (pointsGroup) {

        pointsGroup.innerHTML =
            data.map(
                (point, index) => {

                    return `

                        <circle
                            cx="${getX(index)}"
                            cy="${getY(point.income)}"
                            r="3"
                            class="chart-point-income"
                        />

                        <circle
                            cx="${getX(index)}"
                            cy="${getY(point.expense)}"
                            r="3"
                            class="chart-point-expense"
                        />

                    `;

                }
            ).join("");

    }


    /*
       Labels
    */

    if (labels) {

        labels.innerHTML =
            createChartLabels(
                data
            );

    }

}


function buildChartData(
    days
) {

    const end =
        new Date();


    end.setHours(
        0,
        0,
        0,
        0
    );


    const start =
        new Date(end);


    start.setDate(
        start.getDate() -
        (
            days - 1
        )
    );


    const buckets = [];


    for (
        let index = 0;
        index < days;
        index++
    ) {

        const date =
            new Date(start);


        date.setDate(
            start.getDate() +
            index
        );


        const key =
            toISODate(
                date
            );


        buckets.push({

            date:
                key,

            income:
                0,

            expense:
                0,

            saving:
                0

        });

    }


    const map =
        new Map();


    buckets.forEach(
        bucket => {

            map.set(
                bucket.date,
                bucket
            );

        }
    );


    appData.transactions.forEach(
        transaction => {

            if (
                !map.has(
                    transaction.date
                )
            ) {

                return;

            }


            const bucket =
                map.get(
                    transaction.date
                );


            const amount =
                Number(
                    transaction.amount
                ) || 0;


            if (
                transaction.type ===
                "income"
            ) {

                bucket.income +=
                    amount;

            }


            if (
                transaction.type ===
                "expense"
            ) {

                bucket.expense +=
                    amount;

            }

        }
    );


    appData.savings.forEach(
        saving => {

            if (
                !map.has(
                    saving.date
                )
            ) {

                return;

            }


            const bucket =
                map.get(
                    saving.date
                );


            bucket.saving +=
                Number(
                    saving.amount
                ) || 0;

        }
    );


    /*
       S'il n'existe aucune donnée
       dans la période, le graphique
       reste vide.
    */

    const hasData =
        buckets.some(
            bucket =>
                bucket.income > 0 ||
                bucket.expense > 0 ||
                bucket.saving > 0
        );


    return hasData
        ? buckets
        : [];

}


function toISODate(date) {

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


function createChartLabels(
    data
) {

    /*
       Pour éviter de surcharger
       le graphique sur 3M/6M/1AN,
       on affiche quelques repères.
    */

    if (!data.length) {

        return "";

    }


    const maxLabels =
        7;


    const step =
        Math.max(
            1,
            Math.ceil(
                data.length /
                maxLabels
            )
        );


    return data

        .filter(
            (point, index) =>

                index % step === 0 ||
                index ===
                    data.length - 1
        )

        .map(
            point => `

                <span>
                    ${escapeHTML(
                        formatShortDate(
                            point.date
                        )
                    )}
                </span>

            `
        )

        .join("");

}


function formatShortDate(
    dateValue
) {

    const date =
        new Date(
            dateValue +
            "T00:00:00"
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return dateValue;

    }


    return date.toLocaleDateString(
        "fr-FR",
        {

            day: "2-digit",

            month: "2-digit"

        }
    );

}


/* =========================================================
   22. NAVIGATION MOBILE
========================================================= */

function initializeMobileMenu() {

    const mobileButton =
        document.querySelector(
            ".mobile-menu"
        );


    const sidebar =
        document.querySelector(
            ".sidebar"
        );


    if (
        !mobileButton ||
        !sidebar
    ) {

        return;

    }


    mobileButton.addEventListener(
        "click",
        () => {

            sidebar.classList.toggle(
                "mobile-open"
            );

        }
    );

}


/* =========================================================
   23. FERMETURE AVEC ESC
========================================================= */

function initializeEscapeKey() {

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key !==
                "Escape"
            ) {

                return;

            }


            document
                .querySelectorAll(
                    ".modal-overlay.show"
                )
                .forEach(
                    modal =>
                        closeModal(modal)
                );

        }
    );

}


/* =========================================================
   24. NOTIFICATIONS
========================================================= */

function initializeNotifications() {

    const button =
        document.querySelector(
            ".notification-button"
        );


    if (!button) {

        return;

    }


    button.addEventListener(
        "click",
        () => {

            updateAlerts();


            const alertList =
                document.getElementById(
                    "alertList"
                );


            if (!alertList) {

                return;

            }


            alertList.scrollIntoView({

                behavior:
                    "smooth",

                block:
                    "center"

            });

        }
    );

}


/* =========================================================
   25. ACTIONS RAPIDES
========================================================= */

function initializeQuickActions() {

    const buttons =
        document.querySelectorAll(
            ".quick-action"
        );


    buttons.forEach(
        button => {

            const text =
                button.textContent
                    .toLowerCase();


            /*
               Ajouter une entrée
               et dépense sont déjà
               connectés dans leurs
               fonctions respectives.
            */


            if (
                text.includes(
                    "ajouter une épargne"
                )
            ) {

                button.addEventListener(
                    "click",
                    event => {

                        event.preventDefault();

                        showSavingsComingSoon();

                    }
                );

            }


            if (
                text.includes(
                    "opération trading"
                )
            ) {

                button.addEventListener(
                    "click",
                    event => {

                        event.preventDefault();

                        showTradingComingSoon();

                    }
                );

            }

        }
    );

}


function showSavingsComingSoon() {

    alert(
        "La saisie de l'épargne sera ajoutée dans la prochaine étape."
    );

}


function showTradingComingSoon() {

    alert(
        "La saisie des opérations de trading sera ajoutée dans la prochaine étape."
    );

}


/* =========================================================
   26. INITIALISATION UNIQUE
========================================================= */

function initApp() {

    console.log(
        "Million Tracker chargé."
    );


    updateCurrentDate();


    initializeIncomeModal();


    initializeExpenseModal();


    initializeHistory();


    initializeNavigation();


    initializeChart();


    initializeMobileMenu();


    initializeEscapeKey();


    initializeNotifications();


    initializeQuickActions();


    /*
       État initial :
       Dashboard visible.
    */

    showView(
        "dashboard"
    );


    updateDashboard();

}


/* =========================================================
   27. LANCEMENT
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initApp
);
