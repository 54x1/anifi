<template>
  <div :class="theme">
    <!-- Theme Toggle Button -->
    <div class="theme-toggle">
      <button class="theme-toggle-btn" @click="toggleTheme">
        <span v-if="theme === 'dark'">☀️</span>
        <span v-else>🌙</span>
      </button>
    </div>
    <!-- Controls for Adding Data -->
    <div class="controls">
      <form @submit.prevent="addEntry">
        <h3>Add Transaction</h3>
        <div>
          <label for="date">Transaction Date:</label>
          <vue-datepicker v-model="newEntry.date" id="date" :min-date="viewStartDate" :max-date="viewEndDate" />
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
          <input type="text" v-model="newEntry.incomeCategory" placeholder="Category (optional)" />
        </div>
        <div v-if="newEntry.type === 'spending'">
          <label for="spent">Spending Amount:</label>
          <input type="number" v-model="newEntry.spent" @input="formatSpent" step="0.01" />
          <label for="spentCategory">Category:</label>
          <input type="text" v-model="newEntry.spentCategory" placeholder="Category (optional)" />
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
        <vue-datepicker v-model="viewStartDate" id="viewStartDate" @change="filterTransactions" />
      </div>
      <div>
        <label for="viewEndDate">End Date:</label>
        <vue-datepicker v-model="viewEndDate" id="viewEndDate" @change="filterTransactions" />
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
      <div class="category-filter">
  <label for="categoryFilter">Filter by Categories:</label>
  <multiselect
  v-model="selectedCategories"
  :options="availableCategories"
  :multiple="true"
  placeholder="Select categories"
  :close-on-select="false"
  tag-placeholder="Add a category"
></multiselect>
  <button @click="toggleSelectAllCategories">
    {{ allCategoriesSelected ? "Unselect All" : "Select All" }}
  </button>
  <div>
    <label for="categoryColors">Set Category Colors:</label>
  <div v-for="category in availableCategories" :key="category" class="category-color-row">
    <span>{{ category }}</span>
    <input
      type="color"
      v-model="categoryColors[category]"
      @input="setCustomColor(category, categoryColors[category])"
    />
    <button @click="setCustomColor(category, generateRandomColor())">🎲 Random</button>
  </div>
</div>

</div>
      <div class="chart-container">
        <canvas ref="financialChart"></canvas>
      </div>
    </div>


    <!-- Search and Filter -->
    <div class="search-controls">
      <label for="search">Search Transactions:</label>
      <input type="text" v-model="searchQuery" placeholder="Search by category or amount" />

      <label for="filterType">Filter by Type:</label>
      <select v-model="filterType">
        <option value="">All</option>
        <option value="income">Income</option>
        <option value="spending">Spending</option>
      </select>
    </div>


    <!-- Transactions Table -->
    <div class="transaction-table">
      <h3>Transactions</h3>
      <table>
        <thead>
  <tr>
    <th @click="sortBy('date')">Date <span>{{ getSortIndicator('date') }}</span></th>
    <th @click="sortBy('type')">Type <span>{{ getSortIndicator('type') }}</span></th>
    <th @click="sortBy('amount')">Amount <span>{{ getSortIndicator('amount') }}</span></th>
    <th @click="sortBy('category')">Category <span>{{ getSortIndicator('category') }}</span></th>
    <th>Actions</th>
  </tr>
</thead>
        <tbody>
          <tr v-for="(entry, index) in filteredTransactions" :key="index">
            <td>{{ formatDate(entry.date) }}</td>
            <td>{{ entry.type }}</td>
            <td>{{ entry.type === 'income' ? entry.income : Math.abs(entry.spent) }}</td>
            <td>{{ entry.type === 'income' ? entry.incomeCategory : entry.spentCategory }}</td>
            <td>
              <button @click="editEntry(index)">Edit</button>
              <button @click="deleteEntry(index)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>


<script>
import dayjs from "dayjs"; 
import Multiselect from "vue-multiselect";
import "vue-multiselect/dist/vue-multiselect.min.css";
import { Chart, registerables } from "chart.js";
import Datepicker from "vue3-datepicker";
import { ref, watch, computed, onMounted, onBeforeUnmount, nextTick } from "vue";

// Register Chart.js components
Chart.register(...registerables);

export default {
  components: {
    vueDatepicker: Datepicker,
    Multiselect,
  },
  setup() {
    const financialChart = ref(null);
    return { financialChart };
  },
  data() {
  return {
    theme: "light",
    processedData: [],
    recurringData: [],
    hiddenCategories: JSON.parse(localStorage.getItem("hiddenCategories")) || {},
    newEntry: {
      date: new Date(),
      type: "spending",
      income: 0,
      incomeCategory: "",
      spent: 0,
      spentCategory: "",
      recurring: false,
      recurringFrequency: "daily",
    },
    editingIndex: null,
    editingRecurringIndex: null,
    searchQuery: "",
    filterType: "",
    viewStartDate: localStorage.getItem("viewStartDate")
      ? new Date(localStorage.getItem("viewStartDate"))
      : new Date(new Date().setMonth(new Date().getMonth() - 1)), // Default to one month ago
    viewEndDate: localStorage.getItem("viewEndDate")
      ? new Date(localStorage.getItem("viewEndDate"))
      : new Date(new Date().setMonth(new Date().getMonth() + 1)), // Default to one month ahead
    groupBy: "daily",
    chart: null,
    chartType: "line",
    sortField: "date", // Default sort field
    sortOrder: "asc", // Default sort order
    selectedCategories: [],
    allCategoriesSelected: false,
    categoryColors: {}, // Stores colors for each category
    customColorInput: '', 
  };
},

computed:{


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
    },
    availableCategories() {
      const combinedData = [...(this.processedData || []), ...(this.recurringData || [])];

      const categories = combinedData.flatMap((entry) => {
        if (entry.type === "income") {
          return entry.incomeCategory?.trim() || "Uncategorized";
        } else if (entry.type === "spending") {
          return entry.spentCategory?.trim() || "Uncategorized";
        }
        return [];
      });

      return [...new Set(categories)];
    },


    filteredTransactions() {
    const combinedData = [...this.processedData, ...this.recurringData];

    // Deduplicate by unique key
    const uniqueTransactions = Array.from(
      new Map(
        combinedData.map((entry) => [`${entry.date}-${entry.type}-${entry.income || entry.spent}`, entry])
      ).values()
    );

    // Filter by search query
    const filteredData = uniqueTransactions.filter((entry) => {
      const matchesSearch = !this.searchQuery || (
        entry.incomeCategory?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        entry.spentCategory?.toLowerCase().includes(this.searchQuery.toLowerCase())
      );

      const matchesType = !this.filterType || entry.type === this.filterType;

      return matchesSearch && matchesType;
    });

    // Filter by date range
    const startDate = new Date(this.viewStartDate);
    const endDate = new Date(this.viewEndDate);

    const dateFilteredData = filteredData.filter((entry) => {
      const entryDate = new Date(entry.date);
      return entryDate >= startDate && entryDate <= endDate;
    });

    // Sort data
    dateFilteredData.sort((a, b) => {
      let valueA, valueB;
      switch (this.sortField) {
        case "date":
          valueA = new Date(a.date);
          valueB = new Date(b.date);
          break;
        case "type":
          valueA = a.type;
          valueB = b.type;
          break;
        case "amount":
          valueA = a.type === "income" ? a.income : Math.abs(a.spent);
          valueB = b.type === "income" ? b.income : Math.abs(b.spent);
          break;
        case "category":
          valueA = a.type === "income" ? a.incomeCategory : a.spentCategory;
          valueB = b.type === "income" ? b.incomeCategory : b.spentCategory;
          break;
        default:
          valueA = valueB = null;
      }
      if (valueA < valueB) return this.sortOrder === "asc" ? -1 : 1;
      if (valueA > valueB) return this.sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return dateFilteredData;
  },
},
  watch: {
    viewStartDate: {
    handler(newVal) {
      localStorage.setItem("viewStartDate", newVal.toISOString()); // Save to localStorage
      this.filterTransactions(); // Reapply filters
    },
    immediate: true,
  },
  viewEndDate: {
    handler(newVal) {
      localStorage.setItem("viewEndDate", newVal.toISOString()); // Save to localStorage
      this.filterTransactions(); // Reapply filters
    },
    immediate: true,
  },
    selectedCategories: {
    handler() {
      this.filterTransactions(); // Update filtered data
      this.updateChart(); // Update the chart
    },
    deep: true,
  },
  },
  mounted() {
    this.loadData();
  this.setDefaultDate(); // Ensure defaults if dates are missing
  this.setRandomColorsForCategories();
  this.selectedCategories = [...this.availableCategories];
  this.allCategoriesSelected = true;
  this.filterTransactions(); // Apply filters on mount
  
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) {
    this.theme = savedTheme;
    document.documentElement.className = this.theme;
  }

  const groupedData = this.processData();
  this.updateChart(groupedData);
},
  beforeUnmount() {
    if (this.chart) {
      this.chart.destroy();
    }
  },
  methods: {
    processData() {
  const dataFromStorage = JSON.parse(localStorage.getItem("financialData")) || [];
  const groupedData = {};

  let cumulativeBalance = 0;

  // Sort data by date
  const sortedData = dataFromStorage.sort((a, b) => new Date(a.date) - new Date(b.date));

  sortedData.forEach((entry) => {
    const dateKey = dayjs(entry.date).format("YYYY-MM-DD"); // Group by YYYY-MM-DD format

    // Ensure groupedData has the necessary structure
    if (!groupedData[dateKey]) {
      groupedData[dateKey] = { income: 0, spent: 0, balance: cumulativeBalance, categories: {} };
    }

    // Update income, spent, and categories
    if (entry.type === "income") {
      groupedData[dateKey].income += entry.income || 0;
      groupedData[dateKey].categories[entry.incomeCategory || "Uncategorized"] =
        (groupedData[dateKey].categories[entry.incomeCategory || "Uncategorized"] || 0) +
        entry.income;
    } else if (entry.type === "spending") {
      groupedData[dateKey].spent += entry.spent || 0;
      groupedData[dateKey].categories[entry.spentCategory || "Uncategorized"] =
        (groupedData[dateKey].categories[entry.spentCategory || "Uncategorized"] || 0) +
        entry.spent;
    }

    // Calculate the cumulative balance
    cumulativeBalance += (entry.income || 0) + (entry.spent || 0);
    groupedData[dateKey].balance = cumulativeBalance;
  });

  console.log("Processed Grouped Data:", groupedData);
  return groupedData;
},
    generateRandomColor() {
    return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
  },

setRandomColorsForCategories() {
  this.availableCategories.forEach((category) => {
    if (!this.categoryColors[category]) {
      this.categoryColors[category] = this.generateRandomColor();
    }
  });
},

  setCustomColor(category, color) {
    if (/^#([0-9A-F]{3}){1,2}$/i.test(color)) {
      this.categoryColors[category] = color;
    } else {
      alert("Invalid hex color. Please enter a valid hex code (e.g., #ff5733).");
    }
  },
    toggleSelectAllCategories() {
    if (this.allCategoriesSelected) {
      this.selectedCategories = []; // Deselect all
    } else {
      this.selectedCategories = [...this.availableCategories]; // Select all
    }
    this.allCategoriesSelected = !this.allCategoriesSelected;
  },
    updateChartData(transactionsInRange) {
  const groupedData = transactionsInRange.reduce((acc, entry) => {
    const formattedDate = this.formatDate(entry.date);
    if (!acc[formattedDate]) {
      acc[formattedDate] = { date: entry.date, income: 0, spent: 0, balance: 0 };
    }
    acc[formattedDate].income += entry.income || 0;
    acc[formattedDate].spent += entry.spent || 0;
    return acc;
  }, {});

  let cumulativeBalance = 0;
  this.filteredData = Object.values(groupedData)
    .map((entry) => {
      cumulativeBalance += entry.income + entry.spent;
      return {
        ...entry,
        balance: cumulativeBalance,
      };
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  this.updateChart(); // Update the chart with new data
},


filterTransactions() {
  const startDate = new Date(this.viewStartDate);
  const endDate = new Date(this.viewEndDate);

  if (!startDate || !endDate || isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || startDate > endDate) {
    console.warn("Invalid date range:", startDate, endDate);
    this.filteredData = [];
    this.updateChart({}); // Clear chart
    return;
  }

  const combinedData = [...this.processedData, ...this.recurringData];
  console.log("Combined Data:", combinedData);

  const filteredTransactions = combinedData.filter((entry) => {
    const entryDate = new Date(entry.date);
    if (isNaN(entryDate.getTime())) {
      console.warn("Invalid transaction date:", entry.date);
      return false;
    }
    return entryDate >= startDate && entryDate <= endDate;
  });

  console.log("Filtered Transactions:", filteredTransactions);

  const groupedData = filteredTransactions.reduce((acc, entry) => {
    const entryDate = new Date(entry.date);
    if (isNaN(entryDate.getTime())) return acc; // Skip invalid dates

    const formattedDate = entryDate.toISOString().split("T")[0];
    if (!acc[formattedDate]) {
      acc[formattedDate] = { date: entryDate, income: 0, spent: 0, balance: 0 };
    }

    acc[formattedDate].income += entry.income || 0;
    acc[formattedDate].spent += entry.spent || 0;

    return acc;
  }, {});

  console.log("Grouped Data:", groupedData);

  let cumulativeBalance = 0;
  this.filteredData = Object.values(groupedData)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map((entry) => {
      cumulativeBalance += entry.income + entry.spent;
      return {
        ...entry,
        balance: cumulativeBalance,
      };
    });
    this.updateChart(groupedData);
  },

    formatSpent() {
      if (this.newEntry.spent > 0) {
        this.newEntry.spent = -this.newEntry.spent;
      }
    },
    formatDate(date) {
      return dayjs(date).isValid() ? dayjs(date).format("DD/MM/YYYY") : "Invalid Date";
    },
    setDefaultDate() {
      if (!this.viewStartDate) {
        this.viewStartDate = dayjs().subtract(1, "month").toDate();
      }
      if (!this.viewEndDate) {
        this.viewEndDate = dayjs().add(1, "month").toDate();
      }
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
      date: new Date(entry.date), // Ensure valid Date objects
    }));
  }
  if (storedRecurringData) {
    this.recurringData = JSON.parse(storedRecurringData).map((entry) => ({
      ...entry,
      date: new Date(entry.date),
    }));
  }

  console.log("Processed Data:", this.processedData);
  console.log("Recurring Data:", this.recurringData);
},


    resetForm() {
      this.newEntry = {
        date: new Date(),
        type: "spending",
        income: 0,
        incomeCategory: "",
        spent: 0,
        spentCategory: "",
      };
    },
    saveEntry() {
      if (this.editingIndex !== null) {
        // Update the specific transaction
        this.processedData[this.editingIndex] = { ...this.newEntry };
        this.editingIndex = null;
      } else if (this.editingRecurringIndex !== null) {
        // Update all recurring transactions
        const recurringId = this.recurringData[this.editingRecurringIndex].id;
        this.recurringData = this.recurringData.map((entry) =>
          entry.id === recurringId ? { ...this.newEntry } : entry
        );
        this.editingRecurringIndex = null;
      } else {
        this.addTransaction();
      }
      this.saveData();
      this.resetForm();
    },
    addTransaction() {
      if (this.newEntry.recurring) {
        const recurringId = Date.now(); // Generate unique ID for recurring transactions
        for (let i = 0; i < 10; i++) {
          const date = new Date(this.newEntry.date);
          date.setDate(date.getDate() + i * 7); // Example recurrence logic
          this.recurringData.push({ ...this.newEntry, date, id: recurringId });
        }
      } else {
        this.processedData.push({ ...this.newEntry });
      }
      this.saveData();
    },
    editEntry(index) {
      this.editingIndex = index;
      this.newEntry = { ...this.processedData[index] };
    },
    editAllRecurring(index) {
      this.editingRecurringIndex = index;
      this.newEntry = { ...this.recurringData[index] };
    },
    deleteEntry(index) {
      
  const transactionToDelete = this.filteredTransactions[index];

  if (!transactionToDelete) {
    console.error("Transaction not found!");
    return;
  }

  // Check if the transaction is in `processedData`
  const processedIndex = this.processedData.findIndex(
    (entry) =>
      entry.date.getTime() === new Date(transactionToDelete.date).getTime() &&
      entry.type === transactionToDelete.type &&
      (entry.income === transactionToDelete.income || entry.spent === transactionToDelete.spent)
  );

  if (processedIndex !== -1) {
    // Remove from processedData
    this.processedData.splice(processedIndex, 1);
  } else {
    // Check if the transaction is in `recurringData`
    const recurringIndex = this.recurringData.findIndex(
      (entry) =>
        entry.date.getTime() === new Date(transactionToDelete.date).getTime() &&
        entry.type === transactionToDelete.type &&
        (entry.income === transactionToDelete.income || entry.spent === transactionToDelete.spent)
    );

    if (recurringIndex !== -1) {
      // Remove from recurringData
      this.recurringData.splice(recurringIndex, 1);
    } else {
      console.error("Transaction not found in either dataset!");
    }
  }

  // Save the updated data
  this.saveData();

  // Reapply filters to update the table and chart
  this.filterTransactions();
},

    deleteAllRecurring(index) {
      const recurringId = this.recurringData[index].id;
      this.recurringData = this.recurringData.filter((entry) => entry.id !== recurringId);
      this.saveData(); // Save updated data
    },
    cancelEdit() {
      this.editingIndex = null;
      this.editingRecurringIndex = null;
      this.resetForm();
    },
    addEntry() {
  if (!this.newEntry.date) {
    console.error("Date is required.");
    return;
  }

  // Ensure spending is negative
  if (this.newEntry.type === 'spending' && this.newEntry.spent > 0) {
    this.newEntry.spent = -this.newEntry.spent;
  }

  // Normalize the selected date to midnight local time
  const selectedDate = new Date(this.newEntry.date);
  const normalizedDate = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth(),
    selectedDate.getDate()
  );

  // Calculate balance
  const previousBalance = this.processedData.length
    ? this.processedData[this.processedData.length - 1].balance
    : 0;
  const newTransactionBalance =
    previousBalance +
    (this.newEntry.type === "income"
      ? this.newEntry.income
      : this.newEntry.spent); // Spending is already negative

  const newTransaction = {
    ...this.newEntry,
    income: this.newEntry.type === "income" ? this.newEntry.income : 0,
    spent: this.newEntry.type === "spending" ? this.newEntry.spent : 0,
    balance: newTransactionBalance, // Use the calculated balance
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
    sortBy(field) {
    if (this.sortField === field) {
      // Toggle sort order if the same field is clicked again
      this.sortOrder = this.sortOrder === "asc" ? "desc" : "asc";
    } else {
      // Change the sort field and reset sort order to ascending
      this.sortField = field;
      this.sortOrder = "asc";
    }

    // Apply sorting logic
    this.filteredTransactions.sort((a, b) => {
      let valueA, valueB;

      // Extract field-specific values
      switch (field) {
        case "date":
          valueA = new Date(a.date);
          valueB = new Date(b.date);
          break;
        case "type":
          valueA = a.type;
          valueB = b.type;
          break;
        case "amount":
          valueA = a.type === "income" ? a.income : Math.abs(a.spent);
          valueB = b.type === "income" ? b.income : Math.abs(b.spent);
          break;
        case "category":
          valueA = a.type === "income" ? a.incomeCategory : a.spentCategory;
          valueB = b.type === "income" ? b.incomeCategory : b.spentCategory;
          break;
        default:
          valueA = valueB = null;
      }

      // Compare based on sort order
      if (valueA < valueB) return this.sortOrder === "asc" ? -1 : 1;
      if (valueA > valueB) return this.sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  },

  getSortIndicator(field) {
    return this.sortField === field ? (this.sortOrder === "asc" ? "▲" : "▼") : "";
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
      currentBalance += baseTransaction.income + baseTransaction.spent; // Add income, subtract spending

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
          currentTransactionDate.setDate(
            currentTransactionDate.getDate() + frequencyDays[this.newEntry.recurringFrequency]
          );
        }

        // Recalculate the balance for each recurring transaction
        currentBalance += baseTransaction.income + baseTransaction.spent; // Add income, subtract spending

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
    this.updateChart({}); // Clear chart if invalid date range
    return;
  }

  // Combine processed and recurring data
  const combinedData = [...this.processedData, ...this.recurringData];
  console.log("Combined Data:", combinedData);

  // Filter transactions within the specified date range
  const filteredTransactions = combinedData.filter((entry) => {
    const entryDate = new Date(entry.date);
    return entryDate >= startDate && entryDate <= endDate;
  });
  console.log("Filtered Transactions:", filteredTransactions);

  // Group transactions by date
  const groupedData = filteredTransactions.reduce((acc, entry) => {
    const dateKey = dayjs(entry.date).format("YYYY-MM-DD"); // Group by formatted date
    if (!acc[dateKey]) {
      acc[dateKey] = { income: 0, spent: 0, balance: 0, categories: {} };
    }

    // Aggregate income, spent, and categories
    if (entry.type === "income") {
      acc[dateKey].income += entry.income || 0;
      acc[dateKey].categories[entry.incomeCategory || "Uncategorized"] =
        (acc[dateKey].categories[entry.incomeCategory || "Uncategorized"] || 0) + entry.income;
    } else if (entry.type === "spending") {
      acc[dateKey].spent += entry.spent || 0;
      acc[dateKey].categories[entry.spentCategory || "Uncategorized"] =
        (acc[dateKey].categories[entry.spentCategory || "Uncategorized"] || 0) + entry.spent;
    }

    return acc;
  }, {});
  console.log("Grouped Data:", groupedData);

  // Calculate cumulative balance
  let cumulativeBalance = 0;
  Object.keys(groupedData)
    .sort((a, b) => new Date(a) - new Date(b)) // Sort dates
    .forEach((dateKey) => {
      cumulativeBalance += groupedData[dateKey].income + groupedData[dateKey].spent;
      groupedData[dateKey].balance = cumulativeBalance;
    });

  // Update the chart with grouped data
  this.updateChart(groupedData);
},



    filterTransactions2() {
      // Parse start and end dates
      const startDate = new Date(this.viewStartDate);
      const endDate = new Date(this.viewEndDate);

      if (!startDate || !endDate || startDate > endDate) {
        console.warn("Invalid date range");
        this.filteredData = []; // Clear data if invalid range
        this.updateChart(); // Update chart with no data
        return;
      }

      // Combine regular and recurring transactions
      const combinedData = [...this.processedData, ...this.recurringData];

      // Filter transactions within the date range
         const filteredTransactions = combinedData.filter(
        (entry) => entry.date >= startDate && entry.date <= endDate
    );


      // Sort by date
      const sortedTransactions = filteredTransactions.sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );

      // Group transactions by date and calculate cumulative balance
      const groupedTransactions = [];
      let cumulativeBalance = 0;
      sortedTransactions.forEach((entry) => {
        cumulativeBalance += entry.income + entry.spent;
        groupedTransactions.push({
          date: entry.date,
          income: entry.income,
          spent: entry.spent,
          balance: cumulativeBalance,
        });
      });

      // Update filteredData for the chart
      this.filteredData = groupedTransactions;
      this.updateChart();
    },



    toggleTheme() {
      console.log("Theme toggle button clicked!"); // Debug log
      this.theme = this.theme === "light" ? "dark" : "light";
      document.documentElement.className = this.theme; // Apply theme globally
      localStorage.setItem("theme", this.theme); // Save the theme preference
      this.updateChart(); // Update the chart with the new theme
    },

 

    async updateChart2(groupedData) {
  console.log("Grouped Data for Chart:", groupedData);

  if (!groupedData || Object.keys(groupedData).length === 0) {
    console.warn("No data available to plot.");
    return;
  }

  if (this.chart) {
    this.chart.destroy(); // Destroy existing chart
    this.chart = null;
  }
  await nextTick();

  const canvas = this.$refs.financialChart;
  if (!canvas) {
    console.error("Canvas element not found!");
    return;
  }

  const ctx = canvas.getContext("2d");

  // Generate chart labels (sorted dates)
  const labels = Object.keys(groupedData)
    .filter((date) => dayjs(date).isValid())
    .sort((a, b) => dayjs(a).diff(dayjs(b))); // Sort dates

  if (labels.length === 0) {
    console.warn("No valid labels for the chart.");
    return;
  }

  // Prepare datasets for balance, income, and spent
  const datasets = [
    {
      label: "Balance",
      data: labels.map((date) => groupedData[date]?.balance || 0),
      borderColor: "#00ffff",
      backgroundColor: "rgba(0, 255, 255, 0.2)",
      borderWidth: 2,
      fill: false,
    },
    {
      label: "Income",
      data: labels.map((date) => groupedData[date]?.income || 0),
      borderColor: "#00ff00",
      backgroundColor: "rgba(0, 255, 0, 0.2)",
      borderWidth: 2,
      fill: false,
    },
    {
      label: "Spent",
      data: labels.map((date) => groupedData[date]?.spent || 0),
      borderColor: "#ff4500",
      backgroundColor: "rgba(255, 69, 0, 0.2)",
      borderWidth: 2,
      fill: false,
    },
  ];

  // Dynamically add datasets for each selected category
  this.selectedCategories.forEach((category) => {
    const categoryData = labels.map((date) =>
      groupedData[date]?.categories?.[category] || 0
    );

    datasets.push({
      label: category,
      data: categoryData,
      borderColor: this.categoryColors[category] || this.generateRandomColor(),
      backgroundColor: `${this.categoryColors[category] || this.generateRandomColor()}33`,
      borderWidth: 2,
      fill: false,
    });
  });

  // Create the chart
  const isDarkMode = this.theme === "dark";

  this.chart = new Chart(ctx, {
    type: this.chartType,
    data: {
      labels: labels.map((date) => dayjs(date).format("DD/MM/YYYY")), // Format labels
      datasets,
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animations: false,
      plugins: {
        legend: {
          labels: {
            color: isDarkMode ? "#ffffff" : "#000000",
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: isDarkMode ? "#ffffff" : "#000000",
          },
          grid: {
            color: isDarkMode ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.1)",
          },
        },
        y: {
          ticks: {
            color: isDarkMode ? "#ffffff" : "#000000",
          },
          grid: {
            color: isDarkMode ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.1)",
          },
        },
      },
    },
  });
},


async updateChart(groupedData) {
  console.log("Grouped Data for Chart:", groupedData);

  if (!groupedData || Object.keys(groupedData).length === 0) {
    console.warn("No data available to plot.");
    return;
  }

  if (this.chart) {
    this.chart.destroy(); // Destroy existing chart
    this.chart = null;
  }
  await nextTick();

  const canvas = this.$refs.financialChart;
  if (!canvas) {
    console.error("Canvas element not found!");
    return;
  }

  const ctx = canvas.getContext("2d");

  // Generate chart labels (sorted dates)
  const labels = Object.keys(groupedData)
    .filter((date) => dayjs(date).isValid())
    .sort((a, b) => dayjs(a).diff(dayjs(b))); // Sort dates

  if (labels.length === 0) {
    console.warn("No valid labels for the chart.");
    return;
  }

  // Prepare datasets for balance, income, and spent
  const datasets = [
    {
      label: "Balance",
      data: labels.map((date) => groupedData[date]?.balance || 0),
      borderColor: "#00ffff",
      backgroundColor: "rgba(0, 255, 255, 0.2)",
      borderWidth: 2,
      fill: false,
      hidden: this.hiddenCategories["Balance"] || false, // Restore hidden state
    },
    {
      label: "Income",
      data: labels.map((date) => groupedData[date]?.income || 0),
      borderColor: "#00ff00",
      backgroundColor: "rgba(0, 255, 0, 0.2)",
      borderWidth: 2,
      fill: false,
      hidden: this.hiddenCategories["Income"] || false, // Restore hidden state
    },
    {
      label: "Spent",
      data: labels.map((date) => groupedData[date]?.spent || 0),
      borderColor: "#ff4500",
      backgroundColor: "rgba(255, 69, 0, 0.2)",
      borderWidth: 2,
      fill: false,
      hidden: this.hiddenCategories["Spent"] || false, // Restore hidden state
    },
  ];

  // Dynamically add datasets for each selected category
  this.selectedCategories.forEach((category) => {
    const categoryData = labels.map((date) =>
      groupedData[date]?.categories?.[category] || 0
    );

    datasets.push({
      label: category,
      data: categoryData,
      borderColor: this.categoryColors[category] || this.generateRandomColor(),
      backgroundColor: `${this.categoryColors[category] || this.generateRandomColor()}33`,
      borderWidth: 2,
      fill: false,
      hidden: this.hiddenCategories[category] || false, // Restore hidden state
    });
  });

  // Create the chart
  const isDarkMode = this.theme === "dark";

  this.chart = new Chart(ctx, {
    type: this.chartType,
    data: {
      labels: labels.map((date) => dayjs(date).format("DD/MM/YYYY")), // Format labels
      datasets,
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animations: false,
      plugins: {
        legend: {
          labels: {
            color: isDarkMode ? "#ffffff" : "#000000",
          },
          onClick: (e, legendItem, legend) => {
            const datasetIndex = legendItem.datasetIndex;
            const chart = legend.chart;
            const dataset = chart.data.datasets[datasetIndex];

            // Toggle visibility
            dataset.hidden = !dataset.hidden;

            // Update and save hiddenCategories
            this.hiddenCategories[dataset.label] = dataset.hidden;
            localStorage.setItem(
              "hiddenCategories",
              JSON.stringify(this.hiddenCategories)
            );

            chart.update();
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: isDarkMode ? "#ffffff" : "#000000",
          },
          grid: {
            color: isDarkMode ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.1)",
          },
        },
        y: {
          ticks: {
            color: isDarkMode ? "#ffffff" : "#000000",
          },
          grid: {
            color: isDarkMode ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.1)",
          },
        },
      },
    },
  });
},


  },
};
</script>





<style>
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
  position: relative;
  width: 100%;
}

canvas {
  max-height: 600px;
  height: 600px;
}

label {
  margin-right: 5px;
}

.v3dp__datepicker {
  width: fit-content;
  justify-self: center;
}


/* Dark Theme */
.dark {
  --background-color: #1e1e1e;
  --text-color: #ffffff;
  --button-bg: #444444;
  --button-text: #ffffff;
}

/* Light Theme */
.light {
  --background-color: #ffffff;
  --text-color: #000000;
  --button-bg: #f0f0f0;
  --button-text: #000000;
}

/* Apply theme variables globally */
html,
body,
#app {
  background-color: var(--background-color) !important;
  color: var(--text-color) !important;
}

/* Theme Toggle Button */
.theme-toggle {
  position: fixed;
  top: 10px;
  right: 10px;
  z-index: 1000;
}

.theme-toggle-btn {
  background-color: var(--button-bg);
  color: var(--button-text);
  border: none;
  padding: 10px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  transition: background-color 0.3s, color 0.3s;
}

.theme-toggle-btn:hover {
  opacity: 0.8;
}

/* Responsive adjustments */
@media (max-width: 768px) {

  .controls,
  .view-period-controls {
    flex-direction: column;
    /* Stack items vertically */
    align-items: center;
  }

  .controls form {
    width: 100%;
    /* Expand form to full width */
    padding: 0 10px;
    /* Add padding for smaller screens */
  }

  h3 {
    font-size: 1.2rem;
    /* Adjust header size */
  }

  label {
    font-size: 0.9rem;
    /* Adjust label font size */
  }

  input,
  select,
  button {
    font-size: 1rem;
    /* Adjust input and button font size */
    width: 100%;
    /* Expand inputs to full width */
    margin-bottom: 10px;
    /* Add spacing between inputs */
  }

  canvas {
    height: 400px;
    /* Reduce chart height for smaller screens */
  }
}

/* Mobile-friendly adjustments */
@media (max-width: 480px) {
  canvas {
    height: 300px;
  }

  button {
    padding: 10px;
    /* Add padding to buttons */
    color: black;
  }
}

.transaction-table table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.transaction-table th,
.transaction-table td {
  border: 1px solid #ccc;
  padding: 10px;
  text-align: left;
}

.transaction-table th {
  background-color: var(--button-bg);
  color: var(--button-text);
}

.search-controls {
  margin: 20px 0;
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.search-controls input,
.search-controls select {
  padding: 5px;
  font-size: 1rem;
}

.category-color-row {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 5px;
}

.category-color-row input[type="color"] {
  border: none;
  width: 40px;
  height: 40px;
  cursor: pointer;
}

.category-color-row button {
  padding: 5px 10px;
  border: none;
  border-radius: 5px;
  background-color: #eee;
  cursor: pointer;
}

.category-color-row button:hover {
  background-color: #ddd;
}
</style>