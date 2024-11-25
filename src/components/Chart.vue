<template>
  <div>
    <h1>Financial Dashboard</h1>

    <!-- Controls for Adding Data -->
    <div class="controls">
      <form @submit.prevent="addEntry">
        <h3>Add Transaction</h3>
        <div>
          <label for="date">Transaction Date:</label>
          <vue-datepicker
            v-model="newEntry.date"
            id="date"
            :min-date="viewStartDate"
            :max-date="viewEndDate"
          />
        </div>
        <div>
          <label for="transactionType">Transaction Type:</label>
          <select v-model="newEntry.type" id="transactionType">
            <option value="income">Income</option>
            <option value="spending">Spending</option>
          </select>
        </div>
        <div v-if="newEntry.type === 'income'">
          <label for="income">Income Amount:</label>
          <input type="number" v-model="newEntry.income" step="0.01" />
          <label for="incomeCategory">Category:</label>
          <input
            type="text"
            v-model="newEntry.incomeCategory"
            placeholder="Category (optional)"
          />
        </div>
        <div v-if="newEntry.type === 'spending'">
          <label for="spent">Spending Amount:</label>
          <input type="number" v-model="newEntry.spent" step="0.01" />
          <label for="spentCategory">Category:</label>
          <input
            type="text"
            v-model="newEntry.spentCategory"
            placeholder="Category (optional)"
          />
        </div>
        <div>
          <label for="recurring">Set as Recurring:</label>
          <input type="checkbox" v-model="newEntry.recurring" />
          <div v-if="newEntry.recurring">
            <label for="recurringFrequency">Frequency:</label>
            <select v-model="newEntry.recurringFrequency" id="recurringFrequency">
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="fortnightly">Fortnightly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
            <label for="recursions">How Many Recursions:</label>
            <input type="number" v-model="newEntry.recursions" min="1" step="1" />
            <p>
              Calculated End Date: <strong>{{ calculatedEndDate }}</strong>
            </p>
          </div>
        </div>
        <button type="submit">Add Transaction</button>
      </form>
    </div>

    <!-- Viewing Period Controls -->
    <div class="view-period-controls">
      <h3>Filter Transactions by Date</h3>
      <div>
        <label for="viewStartDate">Start Date:</label>
        <vue-datepicker
          v-model="viewStartDate"
          id="viewStartDate"
          @change="filterTransactions"
        />
      </div>
      <div>
        <label for="viewEndDate">End Date:</label>
        <vue-datepicker
          v-model="viewEndDate"
          id="viewEndDate"
          @change="filterTransactions"
        />
      </div>
    </div>

    <!-- Chart Controls -->
    <div>
      <label for="groupBy">Group By:</label>
      <select v-model="groupBy" id="groupBy" @change="filterTransactions">
        <option value="daily">Daily</option>
        <option value="weekly">Weekly</option>
        <option value="monthly">Monthly</option>
        <option value="yearly">Yearly</option>
      </select>
      <label for="chartType">Select Chart Type:</label>
      <select v-model="chartType" id="chartType" @change="updateChart">
        <option value="line">Line</option>
        <option value="bar">Bar</option>
      </select>
      <canvas id="financialChart"></canvas>
    </div>
  </div>
</template>





<script>
import { Chart, registerables } from "chart.js";
import Datepicker from "vue3-datepicker";
import { computed, watch, nextTick } from "vue";

// Register Chart.js components
Chart.register(...registerables);

export default {
  components: {
    vueDatepicker: Datepicker,
  },
  data() {
    return {
      processedData: [], // Regular transactions
      recurringData: [], // Recurring transactions stored separately
      filteredData: [],
      viewStartDate: null,
      viewEndDate: null,
      newEntry: {
        date: new Date(),
        type: "income", // Default to income
        income: 0,
        incomeCategory: "",
        spent: 0,
        spentCategory: "",
        recurring: false,
        recurringFrequency: "daily",
        recursions: 1,
      },
      groupBy: "daily", // Default grouping type
      chart: null,
      chartType: "line",
    };
  },
  computed: {
    calculatedEndDate() {
  if (!this.newEntry.recurring || !this.newEntry.date || !this.newEntry.recursions) {
    return "N/A";
  }

  const startDate = new Date(
    this.newEntry.date.getFullYear(),
    this.newEntry.date.getMonth(),
    this.newEntry.date.getDate()
  );

  let endDate = new Date(startDate);

  if (this.newEntry.recurringFrequency === "monthly") {
    // Increment month by (recursions - 1) to calculate the last recurring date
    endDate = new Date(
      startDate.getFullYear(),
      startDate.getMonth() + (this.newEntry.recursions - 1),
      startDate.getDate()
    );
  } else if (this.newEntry.recurringFrequency === "yearly") {
    // Increment year by (recursions - 1)
    endDate = new Date(
      startDate.getFullYear() + (this.newEntry.recursions - 1),
      startDate.getMonth(),
      startDate.getDate()
    );
  } else {
    // For daily, weekly, and fortnightly, calculate based on days
    const frequencyDays = {
      daily: 1,
      weekly: 7,
      fortnightly: 14,
    };
    const incrementDays = frequencyDays[this.newEntry.recurringFrequency] || 0;
    endDate.setDate(endDate.getDate() + incrementDays * (this.newEntry.recursions - 1));
  }

  // Format the end date using the user's timezone
  return this.formatDate(endDate);
}


  },
  watch: {
    viewStartDate: "filterTransactions",
    viewEndDate: "filterTransactions",
  },
  mounted() {
    this.loadData();
    this.setDefaultDate();
    this.filterTransactions();
    this.updateChart();
  },
  methods: {
    formatDate(date) {
    return new Intl.DateTimeFormat('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }).format(new Date(date));
  },
    saveData() {
      localStorage.setItem("financialData", JSON.stringify(this.processedData));
      localStorage.setItem("recurringData", JSON.stringify(this.recurringData));
    },
    loadData() {
      const storedData = localStorage.getItem("financialData");
      const storedRecurringData = localStorage.getItem("recurringData");

      if (storedData) {
        this.processedData = JSON.parse(storedData).map((entry) => ({
          ...entry,
          date: new Date(entry.date),
        }));
      }
      if (storedRecurringData) {
        this.recurringData = JSON.parse(storedRecurringData).map((entry) => ({
          ...entry,
          date: new Date(entry.date),
        }));
      }
    },
    setDefaultDate() {
      if (!this.viewStartDate) {
        this.viewStartDate = new Date(new Date().setMonth(new Date().getMonth() - 1));
      }
      if (!this.viewEndDate) {
        this.viewEndDate = new Date(new Date().setMonth(new Date().getMonth() + 1))
      }
    },
    addEntry() {
  if (!this.newEntry.date) {
    console.error("Date is required.");
    return;
  }

  // Normalize the selected date to midnight local time
  const selectedDate = new Date(this.newEntry.date);
  console.log("selectedDate", selectedDate)
  const normalizedDate = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth(),
    selectedDate.getDate()
  );

  const newTransaction = {
    ...this.newEntry,
    income: this.newEntry.type === "income" ? this.newEntry.income : 0,
    spent: this.newEntry.type === "spending" ? this.newEntry.spent : 0,
    balance:
      (this.processedData.length
        ? this.processedData[this.processedData.length - 1].balance
        : 0) +
      (this.newEntry.type === "income"
        ? this.newEntry.income
        : -this.newEntry.spent),
    date: normalizedDate, // Save the normalized date
  };

  if (this.newEntry.recurring) {
    this.generateRecurringTransactions(newTransaction);
  } else {
    this.processedData.push(newTransaction);
  }

  this.saveData();
  this.filterTransactions();

  // Reset the form
  this.newEntry = {
    date: new Date(), // Default to today
    type: "income",
    income: 0,
    incomeCategory: "",
    spent: 0,
    spentCategory: "",
    recurring: false,
    recurringFrequency: "daily",
    recursions: 1,
  };
},

generateRecurringTransactions(baseTransaction) {
  const frequencyDays = {
    daily: 1,
    weekly: 7,
    fortnightly: 14,
  };

  // Start with the user-selected date
  let currentTransactionDate = new Date(
    baseTransaction.date.getFullYear(),
    baseTransaction.date.getMonth(),
    baseTransaction.date.getDate()
  );

  // Initialize the balance
  let currentBalance =
    this.processedData.length > 0
      ? this.processedData[this.processedData.length - 1].balance
      : 0;

  // Add the initial transaction (user-selected date)
  currentBalance += baseTransaction.income - baseTransaction.spent;

  this.recurringData.push({
    ...baseTransaction,
    date: new Date(currentTransactionDate),
    balance: currentBalance,
  });

  // Generate subsequent recurring transactions
  for (let i = 1; i < this.newEntry.recursions; i++) {
    if (this.newEntry.recurringFrequency === "monthly") {
      // Increment month while keeping the day the same
      currentTransactionDate = new Date(
        currentTransactionDate.getFullYear(),
        currentTransactionDate.getMonth() + 1,
        baseTransaction.date.getDate() // Keep the original day of the month
      );
    } else if (this.newEntry.recurringFrequency === "yearly") {
      // Increment year while keeping the month and day the same
      currentTransactionDate = new Date(
        currentTransactionDate.getFullYear() + 1,
        currentTransactionDate.getMonth(),
        baseTransaction.date.getDate()
      );
    } else {
      // Increment by the defined number of days for daily, weekly, fortnightly
      currentTransactionDate.setDate(currentTransactionDate.getDate() + frequencyDays[this.newEntry.recurringFrequency]);
    }

    // Recalculate the balance for each recurring transaction
    currentBalance += baseTransaction.income - baseTransaction.spent;

    // Add the new recurring transaction
    this.recurringData.push({
      ...baseTransaction,
      date: new Date(currentTransactionDate), // Use the calculated date
      balance: currentBalance, // Update balance
    });
  }
},

filterTransactions() {
  const startDate = new Date(this.viewStartDate);
  const endDate = new Date(this.viewEndDate);

  if (!startDate || !endDate || startDate > endDate) {
    console.warn("Invalid date range");
    this.filteredData = [];
    this.updateChart();
    return;
  }

  // Combine regular and recurring data for filtering
  const combinedData = [...this.processedData, ...this.recurringData];

  // Sort all transactions to maintain chronological order
  const transactionsInRange = combinedData
    .filter((entry) => entry.date >= startDate && entry.date <= endDate)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  // Calculate cumulative balance
  let cumulativeBalance = 0;
  this.filteredData = transactionsInRange.map((entry) => {
    cumulativeBalance += entry.income - entry.spent;
    return {
      ...entry,
      balance: cumulativeBalance,
    };
  });

  this.updateChart();
},

    async updateChart() {
      if (this.chart) this.chart.destroy();

      await nextTick();
      const canvas = document.getElementById("financialChart");
      const ctx = canvas.getContext("2d");

      const labels = this.filteredData.map((entry) => this.formatDate(entry.date));
      const balanceData = this.filteredData.map((entry) => entry.balance);
      const incomeData = this.filteredData.map((entry) => entry.income);
      const spentData = this.filteredData.map((entry) => entry.spent);

      this.chart = new Chart(ctx, {
        type: this.chartType,
        data: {
          labels,
          datasets: [
            {
              label: "Balance",
              data: balanceData,
              borderColor: "blue",
              backgroundColor: "rgba(66, 135, 245, 0.2)",
              borderWidth: 1,
            },
            {
              label: "Income",
              data: incomeData,
              borderColor: "green",
              backgroundColor: "rgba(0, 200, 0, 0.2)",
              borderWidth: 1,
            },
            {
              label: "Spent",
              data: spentData,
              borderColor: "red",
              backgroundColor: "rgba(255, 99, 132, 0.2)",
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: true },
          },
          scales: {
            x: { title: { display: true, text: "Date" } },
            y: { title: { display: true, text: "Amount ($)" }, beginAtZero: true },
          },
        },
      });
    },
  },
};
</script>





<style scoped>
h2 {
  text-align: center;
}

.controls {
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  gap: 10px;
}

.chart-container {
  max-width: 1200px;
  margin: auto;
}

canvas {
  max-height: 600px;
  height: 600px;
}

label {
  margin-right: 5px;
}
</style>
