
const DEMO_EMAIL = "juluse273@gmail.com";
const DEMO_PASSWORD = "M@rzanjulz09";

// =====================================
// LOGIN
// =====================================

const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", function(e) {
        e.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const error = document.getElementById("loginError");

        if (
            email === DEMO_EMAIL &&
            password === DEMO_PASSWORD
        ) {
            sessionStorage.setItem("myBankDemoLoggedIn", "true");
            window.location.href = "dashboard.html";
        } else {
            error.textContent = "Invalid demo email or password.";
        }
    });
}

// =====================================
// AUTHENTICATION
// =====================================

const isDashboard =
    window.location.pathname.toLowerCase().endsWith("dashboard.html");

if (isDashboard) {
    if (sessionStorage.getItem("myBankDemoLoggedIn") !== "true") {
        window.location.replace("index.html");
    }
}

// =====================================
// DEMO ACCOUNT DATA
// =====================================

let balance = 48746.78;

let transactions = [
    {
        name: "Pay Out",
        date: "November 10, 2026",
        amount: 5000,
        type: "cashin"
    },
    {
        name: "Bank Transfer",
        date: "November 09, 2026",
        amount: -850,
        type: "send"
    },
    {
        name: "Pay Out",
        date: "November 08, 2026",
        amount: 2000,
        type: "cashin"
    }
];

// =====================================
// CURRENCY FORMAT
// =====================================

function formatCurrency(amount) {
    return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        minimumFractionDigits: 2
    }).format(amount);
}

// =====================================
// BALANCE
// =====================================

let balanceVisible = true;

function updateBalance() {
    const element = document.getElementById("balance");

    if (!element) return;

    element.textContent = balanceVisible
        ? formatCurrency(balance)
        : "₱ ••••••";
}

function toggleBalance() {
    balanceVisible = !balanceVisible;

    const button = document.getElementById("eyeButton");

    if (button) {
        button.innerHTML = balanceVisible
            ? '<i class="fa-regular fa-eye"></i>'
            : '<i class="fa-regular fa-eye-slash"></i>';
    }

    updateBalance();
}

// =====================================
// ACCOUNT SUMMARY
// =====================================

function updateSummary() {
    let income = 0;
    let expenses = 0;

    transactions.forEach(transaction => {
        if (transaction.amount > 0) {
            income += transaction.amount;
        } else {
            expenses += Math.abs(transaction.amount);
        }
    });

    const incomeElement = document.getElementById("totalIncome");
    const expenseElement = document.getElementById("totalExpenses");

    if (incomeElement) {
        incomeElement.textContent = formatCurrency(income);
    }

    if (expenseElement) {
        expenseElement.textContent = formatCurrency(expenses);
    }
}

// =====================================
// ESCAPE HTML
// =====================================

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, function(char) {
        return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        }[char];
    });
}

// =====================================
// TRANSACTION HISTORY
// =====================================

function renderTransactions() {
    const list = document.getElementById("transactionList");

    if (!list) return;

    if (transactions.length === 0) {
        list.innerHTML = `
            <div class="empty-transactions">
                No demo transactions yet.
            </div>
        `;
        return;
    }

    list.innerHTML = transactions.map(transaction => {

        const positive = transaction.amount > 0;

        const icon = positive
            ? '<i class="fa-solid fa-arrow-down"></i>'
            : '<i class="fa-solid fa-arrow-up"></i>';

        const amountClass = positive ? "positive" : "negative";

        const amountText =
            (positive ? "+" : "-") +
            formatCurrency(Math.abs(transaction.amount));

        return `
            <div class="transaction-item">

                <div class="transaction-left">

                    <div class="transaction-icon">
                        ${icon}
                    </div>

                    <div>
                        <div class="transaction-name">
                            ${escapeHTML(transaction.name)}
                        </div>

                        <div class="transaction-date">
                            ${escapeHTML(transaction.date)}
                        </div>
                    </div>

                </div>

                <div class="transaction-amount ${amountClass}">
                    ${amountText}
                </div>

            </div>
        `;

    }).join("");
}

// =====================================
// MODALS
// =====================================

function openModal(id) {
    const modal = document.getElementById(id);

    if (modal) {
        modal.classList.add("active");
    }
}

function closeModal(id) {
    const modal = document.getElementById(id);

    if (modal) {
        modal.classList.remove("active");
    }
}

// =====================================
// NOTIFICATION
// =====================================

let toastTimer;

function showToast(message) {
    const toast = document.getElementById("toast");

    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

// =====================================
// TRANSACTION PROCESSING
// =====================================

function makeTransaction(event, type) {
    event.preventDefault();

    let amount = 0;
    let transactionName = "";

    if (type === "send") {

        amount = Number(
            document.getElementById("sendAmount").value
        );

        const recipient = document
            .getElementById("recipient")
            .value.trim();

        if (!recipient) {
            showToast("Enter a recipient name.");
            return;
        }

        transactionName = "Bank Transfer to " + recipient;

    } else if (type === "cashin") {

        amount = Number(
            document.getElementById("cashInAmount").value
        );

        transactionName = "Cash In";

    } else if (type === "cashout") {

        amount = Number(
            document.getElementById("cashOutAmount").value
        );

        transactionName = "Cash Out";
    }

    if (!Number.isFinite(amount) || amount <= 0) {
        showToast("Enter a valid amount.");
        return;
    }

    if (type === "send" || type === "cashout") {

        if (amount > balance) {
            showToast("Insufficient demo balance.");
            return;
        }

        balance -= amount;

    } else {

        balance += amount;
    }

    const transactionAmount =
        type === "cashin" ? amount : -amount;

    transactions.unshift({
        name: transactionName,
        date: new Date().toLocaleString("en-PH"),
        amount: transactionAmount,
        type: type
    });

    updateBalance();
    updateSummary();
    renderTransactions();

    const modalId =
        type === "send" ? "sendModal" :
        type === "cashin" ? "cashInModal" :
        "cashOutModal";

    closeModal(modalId);

    event.target.reset();

    showToast("Bank transaction completed!");
}

// =====================================
// NAVIGATION
// =====================================

function showTransactions() {
    const section = document.getElementById("transactions");

    if (section) {
        section.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
}

// =====================================
// LOGOUT
// =====================================

function logout() {

    const confirmed = confirm(
        "Are you sure you want to log out?"
    );

    if (!confirmed) return;

    sessionStorage.removeItem("myBankDemoLoggedIn");

    window.location.replace("index.html");
}

// =====================================
// INITIALIZATION
// =====================================

document.addEventListener("DOMContentLoaded", function() {

    if (isDashboard) {
        updateBalance();
        updateSummary();
        renderTransactions();
    }

});
