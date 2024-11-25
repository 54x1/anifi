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

  const frequencyDays = {
    daily: 1,
    weekly: 7,
    fortnightly: 14,
    monthly: 30,
    quarterly: 90,
    yearly: 365,
  };

  const incrementDays = frequencyDays[this.newEntry.recurringFrequency] || 0;

  // Normalize the user-selected date to midnight local time
  const startDate = new Date(
    this.newEntry.date.getFullYear(),
    this.newEntry.date.getMonth(),
    this.newEntry.date.getDate()
  );

  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + incrementDays * (this.newEntry.recursions - 1));

  // Format the end date to the user's timezone
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
        this.viewEndDate = new Date();
      }
    },
    addEntry() {
  if (!this.newEntry.date) {
    console.error("Date is required.");
    return;
  }

  // Normalize the selected date to midnight local time
  const selectedDate = new Date(this.newEntry.date);
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
    date: normalizedDate, // Save as a normalized local date
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
    date: new Date(),
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
    monthly: 30,
    quarterly: 90,
    yearly: 365,
  };

  const incrementDays = frequencyDays[this.newEntry.recurringFrequency] || 0;

  // Start with the normalized user-selected date
  let currentTransactionDate = new Date(
    baseTransaction.date.getFullYear(),
    baseTransaction.date.getMonth(),
    baseTransaction.date.getDate()
  );

  // Add the initial transaction
  this.recurringData.push({
    ...baseTransaction,
    date: currentTransactionDate, // Use the exact start date
  });

  // Generate subsequent recurring transactions
  for (let i = 1; i < this.newEntry.recursions; i++) {
    currentTransactionDate.setDate(currentTransactionDate.getDate() + incrementDays);

    this.recurringData.push({
      ...baseTransaction,
      date: new Date(currentTransactionDate),
      balance:
        (this.recurringData[i - 1]?.balance || baseTransaction.balance) +
        (this.newEntry.type === "income"
          ? baseTransaction.income
          : -baseTransaction.spent),
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

      const combinedData = [...this.processedData, ...this.recurringData];

      const transactionsInRange = combinedData.filter(
        (entry) => entry.date >= startDate && entry.date <= endDate
      );

      const dates = [];
      const currentDate = new Date(startDate);

      switch (this.groupBy) {
        case "weekly":
          while (currentDate <= endDate) {
            dates.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 7);
          }
          break;
        case "monthly":
          while (currentDate <= endDate) {
            dates.push(new Date(currentDate));
            currentDate.setMonth(currentDate.getMonth() + 1);
          }
          break;
        case "yearly":
          while (currentDate <= endDate) {
            dates.push(new Date(currentDate));
            currentDate.setFullYear(currentDate.getFullYear() + 1);
          }
          break;
        default:
          while (currentDate <= endDate) {
            dates.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
          }
      }

      const groupedData = dates.map((date) => {
        const groupKey = date.toISOString().split("T")[0];

        const transactionsForDate = transactionsInRange.filter((entry) => {
          const entryDate = new Date(entry.date);
          switch (this.groupBy) {
            case "weekly":
              const startOfWeek = new Date(date);
              const endOfWeek = new Date(date);
              endOfWeek.setDate(endOfWeek.getDate() + 6);
              return entryDate >= startOfWeek && entryDate <= endOfWeek;
            case "monthly":
              return (
                entryDate.getFullYear() === date.getFullYear() &&
                entryDate.getMonth() === date.getMonth()
              );
            case "yearly":
              return entryDate.getFullYear() === date.getFullYear();
            default:
              return entryDate.toISOString().split("T")[0] === groupKey;
          }
        });

        const income = transactionsForDate.reduce((sum, t) => sum + t.income, 0);
        const spent = transactionsForDate.reduce((sum, t) => sum + t.spent, 0);
        const balance = income - spent;

        return { date, income, spent, balance };
      });

      this.filteredData = groupedData.sort((a, b) => new Date(a.date) - new Date(b.date));

      this.updateChart();
    },
    async updateChart() {
      if (this.chart) this.chart.destroy();

      await nextTick();
      const canvas = document.getElementById("financialChart");
      const ctx = canvas.getContext("2d");

      const labels = this.filteredData.map((entry) => entry.date.toISOString().split("T")[0]);
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




<!-- <script>
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

      const frequencyDays = {
        daily: 1,
        weekly: 7,
        fortnightly: 14,
        monthly: 30,
        quarterly: 90,
        yearly: 365,
      };

      const incrementDays = frequencyDays[this.newEntry.recurringFrequency] || 0;
      const startDate = new Date(this.newEntry.date);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + incrementDays * (this.newEntry.recursions - 1));

      return endDate.toISOString().split("T")[0]; // Format as YYYY-MM-DD
    },
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
        this.viewEndDate = new Date();
      }
    },

    addEntry() {
  if (!this.newEntry.date) {
    console.error("Date is required.");
    return;
  }

  // Extract the year, month, and day from the user's selected date
  const selectedDate = new Date(this.newEntry.date);
  const normalizedDate = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth(),
    selectedDate.getDate()
  ); // Constructs a local date at midnight without time zone interference

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
    date: normalizedDate, // Use the normalized date
  };

  if (this.newEntry.recurring) {
    this.generateRecurringTransactions(newTransaction);
  } else {
    this.processedData.push(newTransaction);
  }

  this.saveData();
  this.filterTransactions();

  // Reset form
  this.newEntry = {
    date: new Date(),
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
    monthly: 30,
    quarterly: 90,
    yearly: 365,
  };

  const incrementDays = frequencyDays[this.newEntry.recurringFrequency] || 0;

  // Start with the normalized user-selected date
  let currentTransactionDate = new Date(
    baseTransaction.date.getFullYear(),
    baseTransaction.date.getMonth(),
    baseTransaction.date.getDate()
  );

  // Add the initial transaction
  this.recurringData.push({
    ...baseTransaction,
    date: new Date(currentTransactionDate), // Use the normalized date
  });

  // Generate subsequent recurring transactions
  for (let i = 1; i < this.newEntry.recursions; i++) {
    // Increment the date explicitly
    currentTransactionDate.setDate(currentTransactionDate.getDate() + incrementDays);

    // Add the new recurring transaction
    const newTransaction = {
      ...baseTransaction,
      date: new Date(currentTransactionDate), // Use the incremented date
      balance:
        (this.recurringData[i - 1]?.balance || baseTransaction.balance) +
        (this.newEntry.type === "income"
          ? baseTransaction.income
          : -baseTransaction.spent),
    };

    this.recurringData.push(newTransaction);
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

  // Filter transactions within the selected date range
  const transactionsInRange = combinedData.filter(
    (entry) => entry.date >= startDate && entry.date <= endDate
  );

  // Create a list of date intervals based on the selected grouping type
  const dates = [];
  const currentDate = new Date(startDate);

  switch (this.groupBy) {
    case "weekly":
      while (currentDate <= endDate) {
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 7); // Add one week
      }
      break;
    case "monthly":
      while (currentDate <= endDate) {
        dates.push(new Date(currentDate));
        currentDate.setMonth(currentDate.getMonth() + 1); // Add one month
      }
      break;
    case "yearly":
      while (currentDate <= endDate) {
        dates.push(new Date(currentDate));
        currentDate.setFullYear(currentDate.getFullYear() + 1); // Add one year
      }
      break;
    default: // daily
      while (currentDate <= endDate) {
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1); // Add one day
      }
  }

  // Group transactions by the calculated dates
  const groupedData = dates.map((date) => {
    const groupKey = date.toISOString().split("T")[0];

    const transactionsForDate = transactionsInRange.filter((entry) => {
      const entryDate = new Date(entry.date);
      switch (this.groupBy) {
        case "weekly":
          const startOfWeek = new Date(date);
          const endOfWeek = new Date(date);
          endOfWeek.setDate(endOfWeek.getDate() + 6);
          return entryDate >= startOfWeek && entryDate <= endOfWeek;
        case "monthly":
          return (
            entryDate.getFullYear() === date.getFullYear() &&
            entryDate.getMonth() === date.getMonth()
          );
        case "yearly":
          return entryDate.getFullYear() === date.getFullYear();
        default:
          return entryDate.toISOString().split("T")[0] === groupKey;
      }
    });

    const income = transactionsForDate.reduce((sum, t) => sum + t.income, 0);
    const spent = transactionsForDate.reduce((sum, t) => sum + t.spent, 0);
    const balance = income - spent;

    return { date, income, spent, balance };
  });

  // Sort grouped data by date
  this.filteredData = groupedData.sort((a, b) => new Date(a.date) - new Date(b.date));

  // Trigger chart update
  this.updateChart();
},
async updateChart() {
  if (this.chart) this.chart.destroy();

  await nextTick(); // Wait for DOM updates
  const canvas = document.getElementById("financialChart");
  const ctx = canvas.getContext("2d");

  const labels = this.filteredData.map((entry) => {
    const date = new Date(entry.date);
    date.setHours(0, 0, 0, 0); // Normalize to midnight
    switch (this.groupBy) {
      case "weekly":
        const weekStart = new Date(date);
        const weekEnd = new Date(date);
        weekEnd.setDate(weekStart.getDate() + 6);
        return `${weekStart.toISOString().split("T")[0]} to ${weekEnd
          .toISOString()
          .split("T")[0]}`;
      case "monthly":
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      case "yearly":
        return `${date.getFullYear()}`;
      default: // daily
        return date.toISOString().split("T")[0];
    }
  });

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
</script> -->







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
