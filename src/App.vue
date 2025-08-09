<template>
  <div class="min-h-screen bg-base-100 transition-colors duration-300">
    <!-- Header -->
    <header class="navbar bg-base-200 shadow-lg sticky top-0 z-50">
      <div class="navbar-start">
        <h1 class="text-xl font-bold text-primary">💰 Financial Tracker</h1>
      </div>

      <div class="navbar-center hidden lg:flex">
        <div class="tabs tabs-boxed">
          <a
            v-for="tab in tabs"
            :key="tab.id"
            class="tab"
            :class="{ 'tab-active': activeTab === tab.id }"
            @click="activeTab = tab.id"
          >
            {{ tab.icon }} {{ tab.label }}
          </a>
        </div>
      </div>

      <div class="navbar-end">
        <div class="flex items-center gap-2">
          <div class="stats shadow">
            <div class="stat">
              <div class="stat-title text-xs">Balance</div>
              <div
                class="stat-value text-sm"
                :class="netBalance >= 0 ? 'text-success' : 'text-error'"
              >
                ${{ Math.abs(netBalance).toFixed(2) }}
              </div>
            </div>
          </div>

          <!-- Theme Selector -->
          <div class="dropdown dropdown-end">
            <div tabindex="0" role="button" class="btn btn-ghost btn-circle">
              🎨
            </div>
            <ul
              tabindex="0"
              class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 max-h-96 overflow-y-auto"
            >
              <li v-for="theme in availableThemes" :key="theme">
                <a
                  @click="setTheme(theme)"
                  :class="{ active: currentTheme === theme }"
                >
                  {{ theme }}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </header>

    <!-- Mobile Navigation -->
    <div class="btm-nav lg:hidden">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        <span class="text-xs">{{ tab.icon }}</span>
        <span class="btm-nav-label">{{ tab.label }}</span>
      </button>
    </div>

    <!-- Main Content -->
    <main class="container mx-auto p-4 pb-20 lg:pb-4">
      <!-- Import Section -->
      <section
        v-show="activeTab === 'import'"
        class="card bg-base-100 shadow-xl mb-6"
      >
        <div class="card-body">
          <h2 class="card-title">📥 Import Transactions</h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="form-control">
              <label class="label">
                <span class="label-text">Upload CSV File</span>
              </label>
              <input
                type="file"
                accept=".csv"
                class="file-input file-input-bordered w-full"
                @change="handleFileUpload"
              />
              <div class="text-xs text-base-content/60 mt-1">
                Supports: ING Bank, UBank, Westpac, UpBank formats
              </div>
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text">Import from URL</span>
              </label>
              <div class="join">
                <input
                  v-model="importUrl"
                  type="url"
                  placeholder="https://example.com/data.csv"
                  class="input input-bordered join-item flex-1"
                />
              </div>
            </div>
          </div>
          <button class="btn btn-primary join-item" @click="importFromUrl">
            Import
          </button>
          <!-- Import Status -->
          <div v-if="importStatus" class="alert alert-info mt-4">
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <span>{{ importStatus }}</span>
          </div>

          <!-- Debug Info -->
          <div v-if="debugInfo" class="alert alert-warning mt-4">
            <details>
              <summary class="cursor-pointer">Debug Information</summary>
              <pre class="text-xs mt-2">{{ debugInfo }}</pre>
            </details>
          </div>
        </div>
      </section>

      <!-- Add Transaction Section -->
      <section
        v-show="activeTab === 'add'"
        class="card bg-base-100 shadow-xl mb-6"
      >
        <div class="card-body">
          <h2 class="card-title">➕ Add Transaction</h2>

          <form
            @submit.prevent="addTransaction"
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <div class="form-control">
              <label class="label">
                <span class="label-text">Date</span>
              </label>
              <input
                v-model="newTransaction.date"
                type="date"
                class="input input-bordered"
                required
              />
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text">Type</span>
              </label>
              <select
                v-model="newTransaction.type"
                class="select select-bordered"
                required
              >
                <option value="income">💰 Income</option>
                <option value="spending">💸 Spending</option>
              </select>
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text">Amount</span>
              </label>
              <div class="join">
                <span class="join-item btn btn-disabled">$</span>
                <input
                  v-model.number="newTransaction.amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  class="input input-bordered join-item flex-1"
                  required
                />
              </div>
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text">Category</span>
              </label>
              <select
                v-model="newTransaction.category"
                class="select select-bordered"
                required
              >
                <option value="">Select a category</option>
                <option
                  v-for="category in categoryNames"
                  :key="category"
                  :value="category"
                >
                  {{ category }}
                </option>
              </select>
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text">Description (Optional)</span>
              </label>
              <input
                v-model="newTransaction.description"
                type="text"
                placeholder="Transaction description"
                class="input input-bordered"
              />
            </div>

            <div class="form-control">
              <label class="label cursor-pointer">
                <span class="label-text">Recurring Transaction</span>
                <input
                  v-model="newTransaction.recurring"
                  type="checkbox"
                  class="checkbox"
                />
              </label>
              <div v-if="newTransaction.recurring" class="form-control">
                <label class="label">
                  <span class="label-text">Frequency</span>
                </label>
                <select
                  v-model="newTransaction.frequency"
                  class="select select-bordered"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="fortnightly">Fortnightly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
                <label class="label">
                  <span class="label-text">Repeat</span>
                </label>
                <input
                  v-model.number="newTransaction.recursions"
                  type="number"
                  min="1"
                  max="100"
                  class="input input-bordered"
                />
              </div>
              <div class="text-xs mt-2" v-if="calculatedEndDate">
                <span class="font-semibold">End Date:</span>
                <span>{{ formatDate(calculatedEndDate) }}</span>
              </div>
            </div>

            <div class="form-control md:col-span-2 lg:col-span-1">
              <label class="label">
                <span class="label-text">&nbsp;</span>
              </label>
              <div class="join">
                <button type="submit" class="btn btn-primary join-item">
                  Add Transaction
                </button>
                <button
                  type="button"
                  class="btn btn-ghost join-item"
                  @click="resetForm"
                >
                  Reset
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>

      <!-- Chart Section -->
      <section v-show="activeTab === 'chart'" class="space-y-6">
        <!-- Date Filter -->
        <div class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <h3 class="card-title">📅 Date Filter</h3>

            <div class="flex flex-wrap gap-2 mb-4">
              <button
                v-for="preset in datePresets"
                :key="preset.label"
                class="btn btn-sm"
                :class="{ 'btn-primary': selectedDatePreset === preset.label }"
                @click="applyDatePreset(preset)"
              >
                {{ preset.label }}
              </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="form-control">
                <label class="label">
                  <span class="label-text">Start Date</span>
                </label>
                <input
                  v-model="dateFilter.start"
                  type="date"
                  class="input input-bordered"
                />
              </div>

              <div class="form-control">
                <label class="label">
                  <span class="label-text">End Date</span>
                </label>
                <input
                  v-model="dateFilter.end"
                  type="date"
                  class="input input-bordered"
                />
              </div>
            </div>

            <div class="flex justify-between items-center mt-4">
              <div class="text-sm text-base-content/60">
                Date Range: {{ formatDateRange() }} ({{
                  filteredTransactions.length
                }}
                transactions)
              </div>
              <button class="btn btn-ghost btn-sm" @click="resetDateFilter">
                Reset to Default
              </button>
            </div>
          </div>
        </div>

        <!-- Chart Controls and Display -->
        <div class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <h3 class="card-title">📊 Financial Analytics</h3>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div class="form-control">
                <label class="label">
                  <span class="label-text">Chart Type</span>
                </label>
                <select
                  v-model="chartConfig.type"
                  class="select select-bordered"
                >
                  <option value="line">📈 Line Chart</option>
                  <option value="bar">📊 Bar Chart</option>
                  <option value="pie">🥧 Pie Chart</option>
                  <option value="doughnut">🍩 Doughnut Chart</option>
                </select>
              </div>

              <div class="form-control">
                <label class="label">
                  <span class="label-text">Group By</span>
                </label>
                <select
                  v-model="chartConfig.groupBy"
                  class="select select-bordered"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="fortnightly">Fortnightly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div class="form-control">
                <label class="label">
                  <span class="label-text">Categories</span>
                </label>
                <div class="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                  <div
                    v-for="category in categories"
                    :key="category"
                    class="badge badge-outline cursor-pointer text-xs"
                    :class="{
                      'badge-primary': selectedCategories.includes(category),
                    }"
                    @click="toggleCategory(category)"
                  >
                    {{ category }}
                    <span
                      v-if="selectedCategories.includes(category)"
                      class="ml-1"
                      >✕</span
                    >
                  </div>
                </div>
                <div class="mt-2">
                  <button
                    class="btn btn-xs btn-ghost"
                    @click="selectAllCategories"
                  >
                    Select All
                  </button>
                  <button
                    class="btn btn-xs btn-ghost"
                    @click="unselectAllCategories"
                  >
                    Unselect All
                  </button>
                </div>
              </div>
            </div>

            <!-- Chart Display -->
            <div
              class="bg-base-200 rounded-lg p-4 min-h-[400px] flex items-center justify-center"
            >
              <div
                v-if="chartData.labels.length === 0"
                class="text-center text-base-content/60"
              >
                <div class="text-6xl mb-4">📊</div>
                <h3 class="text-lg font-semibold mb-2">No Data to Display</h3>
                <p>Add some transactions to see your financial analytics</p>
              </div>
              <canvas
                v-else
                ref="chartCanvas"
                class="max-w-full max-h-[400px]"
              ></canvas>
            </div>

            <!-- Statistics -->
            <div
              class="stats stats-vertical lg:stats-horizontal shadow mt-6 w-full"
            >
              <div class="stat">
                <div class="stat-figure text-success">
                  <svg
                    class="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    ></path>
                  </svg>
                </div>
                <div class="stat-title">Total Income</div>
                <div class="stat-value text-success">
                  ${{ totalIncome.toFixed(2) }}
                </div>
                <div class="stat-desc">
                  {{ incomeTransactions.length }} transactions
                </div>
              </div>

              <div class="stat">
                <div class="stat-figure text-error">
                  <svg
                    class="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
                    ></path>
                  </svg>
                </div>
                <div class="stat-title">Total Expenses</div>
                <div class="stat-value text-error">
                  ${{ totalExpenses.toFixed(2) }}
                </div>
                <div class="stat-desc">
                  {{ expenseTransactions.length }} transactions
                </div>
              </div>

              <div class="stat">
                <div
                  class="stat-figure"
                  :class="netBalance >= 0 ? 'text-success' : 'text-error'"
                >
                  <svg
                    class="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    ></path>
                  </svg>
                </div>
                <div class="stat-title">Net Balance</div>
                <div
                  class="stat-value"
                  :class="netBalance >= 0 ? 'text-success' : 'text-error'"
                >
                  ${{ Math.abs(netBalance).toFixed(2) }}
                </div>
                <div class="stat-desc">
                  {{
                    netBalance >= 0 ? "Positive balance" : "Negative balance"
                  }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Transactions Section -->
      <section
        v-show="activeTab === 'transactions'"
        class="card bg-base-100 shadow-xl"
      >
        <div class="card-body">
          <div
            class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4"
          >
            <h2 class="card-title">
              📋 Transactions ({{ filteredTransactions.length }})
            </h2>

            <div class="flex flex-col sm:flex-row gap-2">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search transactions..."
                class="input input-bordered input-sm w-full sm:w-64"
              />
              <select
                v-model="typeFilter"
                class="select select-bordered select-sm"
              >
                <option value="">All Types</option>
                <option value="income">Income Only</option>
                <option value="spending">Spending Only</option>
              </select>
            </div>
          </div>

          <!-- Bulk Actions -->
          <div
            v-if="selectedTransactions.length > 0"
            class="alert alert-info mb-4"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <div>
              <h3 class="font-bold">
                {{ selectedTransactions.length }} transaction(s) selected
              </h3>
              <div class="flex gap-2 mt-2">
                <button class="btn btn-error btn-xs" @click="bulkDelete">
                  Delete Selected
                </button>
                <button class="btn btn-ghost btn-xs" @click="clearSelection">
                  Clear Selection
                </button>
              </div>
            </div>
          </div>

          <!-- Transactions Table -->
          <div class="overflow-x-auto">
            <table class="table table-zebra w-full">
              <thead>
                <tr>
                  <th>
                    <label>
                      <input
                        type="checkbox"
                        class="checkbox checkbox-sm"
                        :checked="allSelected"
                        @change="toggleSelectAll"
                      />
                    </label>
                  </th>
                  <th>
                    <button
                      class="btn btn-ghost btn-sm"
                      @click="updateSort('date')"
                    >
                      Date {{ getSortIcon("date") }}
                    </button>
                  </th>
                  <th>
                    <button
                      class="btn btn-ghost btn-sm"
                      @click="updateSort('type')"
                    >
                      Type {{ getSortIcon("type") }}
                    </button>
                  </th>
                  <th>
                    <button
                      class="btn btn-ghost btn-sm"
                      @click="updateSort('amount')"
                    >
                      Amount {{ getSortIcon("amount") }}
                    </button>
                  </th>
                  <th>
                    <button
                      class="btn btn-ghost btn-sm"
                      @click="updateSort('category')"
                    >
                      Category {{ getSortIcon("category") }}
                    </button>
                  </th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(transaction, index) in paginatedTransactions"
                  :key="transaction.id"
                  class="hover:bg-base-200 transition-colors"
                  :class="{
                    'bg-base-200': selectedTransactions.includes(index),
                  }"
                >
                  <td>
                    <label>
                      <input
                        type="checkbox"
                        class="checkbox checkbox-sm"
                        :checked="selectedTransactions.includes(index)"
                        @change="toggleSelect(index)"
                      />
                    </label>
                  </td>
                  <td>
                    <div class="font-mono text-sm">
                      {{ formatDate(transaction.date) }}
                    </div>
                  </td>
                  <td>
                    <div
                      class="badge"
                      :class="
                        transaction.type === 'income'
                          ? 'badge-success'
                          : 'badge-error'
                      "
                    >
                      {{
                        transaction.type === "income"
                          ? "💰 Income"
                          : "💸 Spending"
                      }}
                    </div>
                  </td>
                  <td>
                    <div
                      class="font-mono font-semibold"
                      :class="
                        transaction.type === 'income'
                          ? 'text-success'
                          : 'text-error'
                      "
                    >
                      ${{ transaction.amount.toFixed(2) }}
                    </div>
                  </td>
                  <td>
                    <div class="badge badge-outline text-xs">
                      {{ transaction.category }}
                    </div>
                  </td>
                  <td>
                    <div class="text-sm text-base-content/70 max-w-xs truncate">
                      {{ transaction.description || "-" }}
                    </div>
                  </td>
                  <td>
                    <div class="flex gap-1">
                      <button
                        class="btn btn-info btn-xs"
                        @click="editTransaction(transaction)"
                        title="Edit transaction"
                      >
                        ✏️
                      </button>
                      <button
                        class="btn btn-error btn-xs"
                        @click="deleteTransaction(transaction.id)"
                        title="Delete transaction"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- Empty State -->
            <div
              v-if="filteredTransactions.length === 0"
              class="text-center py-12"
            >
              <div class="text-6xl mb-4">📝</div>
              <h3 class="text-lg font-semibold text-base-content/60 mb-2">
                No transactions found
              </h3>
              <p class="text-base-content/40">
                Try adjusting your search or filter criteria
              </p>
            </div>
          </div>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="flex justify-center mt-6">
            <div class="btn-group">
              <button
                class="btn btn-sm"
                :disabled="currentPage === 1"
                @click="currentPage = 1"
              >
                «
              </button>
              <button
                class="btn btn-sm"
                :disabled="currentPage === 1"
                @click="currentPage--"
              >
                ‹
              </button>
              <button class="btn btn-sm btn-active">
                Page {{ currentPage }} of {{ totalPages }}
              </button>
              <button
                class="btn btn-sm"
                :disabled="currentPage === totalPages"
                @click="currentPage++"
              >
                ›
              </button>
              <button
                class="btn btn-sm"
                :disabled="currentPage === totalPages"
                @click="currentPage = totalPages"
              >
                »
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- About Section -->
      <section
        v-show="activeTab === 'about'"
        class="card bg-base-100 shadow-xl max-w-2xl mx-auto mt-8"
      >
        <div class="card-body">
          <h2 class="card-title">ℹ️ About This App</h2>
          <div v-if="loadingAbout" class="text-center my-6">
            <span class="loading loading-spinner loading-lg"></span>
          </div>
          <div v-else v-html="aboutHtml" class="prose max-w-none"></div>
          <div class="text-xs text-base-content/50 mt-4 text-right">
            Source:
            <a
              :href="githubReadmeUrl"
              class="link"
              target="_blank"
              rel="noopener"
              >GitHub README.md</a
            >
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted, nextTick } from "vue";
// import { marked } from "marked";

// README.md
const githubRawUrl = "";
const githubReadmeUrl = githubRawUrl;
const aboutHtml = ref("");
const loadingAbout = ref(false);

async function fetchAboutMarkdown() {
  loadingAbout.value = true;
  try {
    const res = await fetch(githubRawUrl);
    if (!res.ok) throw new Error("Failed to fetch README.md");
    const md = await res.text();
    aboutHtml.value = aboutHtml.value = `
    <h2>AniFi - MVP_Ver1.01</h2>
</br>
  <h3>Does not read any personal finances; everything is stored locally on your own machine and only reads in your own local browser!!!</h3>
</br>
  <h3>As of 2025 currently Supports* - Westpac | Nab | ANZ | CommBank | St George | ING | Macquarie | Up | UBank | and more to come...
    <br><em>*Need more testers</em>
  </h3>
</br>
  <h3>Fixes:</h3>
  <ul>
    <li>Fix - Auto select all categories present when loading Chart Page</li>
    <li>Fix - Type padding CSS</li>
    <li>Fix - Bulk Actions - eg BULK CRUD</li>
    <li>Fix - UI date to local browser settings / hard code dd-mm-yyyy / or both mm-dd-yyyy</li>
  </ul>
</br>
  <h3>Future:</h3>
  <ul>
    <li>Add - Mobile first UI/UX centric</li>
    <li>Add - Custom user categories</li>
    <li>Add - Custom user colors</li>
  </ul>
</br>
  <h3>Prerequisites</h3>
  <ul>
    <li>Node.js 22.12+</li>
    <li>npm or yarn</li>
  </ul>
</br>
  <h3>Installation</h3>
  <pre><code># Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
</code></pre>

  <h3>Development Server</h3>
  <p>The application will be available at <b>localhost:3000</b></p>

  <h2>Customization</h2>

  <h3>Adding New Themes</h3>
  <p>Add custom themes to <code>tailwind.config.js</code>:</p>
  <pre><code> daisyui: {
  themes: [
    // ... existing themes
    {
      "custom": {
        "primary": "#your-color",
        "secondary": "#your-color",
        // ... more colors
      }
    }
  ]
}
</code></pre>`;
  } catch (err) {
    aboutHtml.value = `  <h2>AniFi - MVP_Ver1.01</h2>

  <h3>Does not read any personal finances; everything is stored locally on your own machine and only reads in your own local browser!!!</h3>

  <h3>As of 2025 currently Supports* - Westpac | Nab | ANZ | CommBank | St George | ING | Macquarie | Up | UBank | and more to come...
    <br><em>*Need more testers</em>
  </h3>

  <h3>Fixes:</h3>
  <ul>
    <li>Fix - Auto select all categories present when loading Chart Page</li>
    <li>Fix - Type padding CSS</li>
    <li>Fix - Bulk Actions - eg BULK CRUD</li>
    <li>Fix - UI date to local browser settings / hard code dd-mm-yyyy / or both mm-dd-yyyy</li>
  </ul>

  <h3>Future:</h3>
  <ul>
    <li>Add - Custom user categories</li>
    <li>Add - Custom user colors</li>
  </ul>

  <h3>Prerequisites</h3>
  <ul>
    <li>Node.js 22.12+</li>
    <li>npm or yarn</li>
  </ul>

  <h3>Installation</h3>
  <pre><code># Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
</code></pre>

  <h3>Development Server</h3>
  <p>The application will be available at <code>http://localhost:3000</code></p>

  <h2>🔧 Customization</h2>

  <h3>Adding New Themes</h3>
  <p>Add custom themes to <code>tailwind.config.js</code>:</p>
  <pre><code> daisyui: {
  themes: [
    // ... existing themes
    {
      "custom": {
        "primary": "#your-color",
        "secondary": "#your-color",
        // ... more colors
      }
    }
  ]
}
</code></pre>`;
  }
  loadingAbout.value = false;
}

export type TransactionType = "income" | "spending";
export type RecurringFrequency =
  | "daily"
  | "weekly"
  | "fortnightly"
  | "monthly"
  | "quarterly"
  | "yearly";

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  type: TransactionType;
  amount: number;
  category: string;
  recurring?: boolean;
  frequency?: RecurringFrequency;
  recursions?: number;
  description: string;
}

// ==== Bank parsing: helpers + types ====
type BankId =
  | "ING"
  | "UBANK"
  | "WESTPAC"
  | "UPBANK"
  | "MACQUARIE"
  | "COMM_BANK"
  | "ST_GEORGE";

type UnifiedTx = {
  bank: BankId;
  dateISO: string;
  dateRaw: string;
  description: string;
  amount: number; // signed: credit − debit
  debit: number;
  credit: number;
  balance?: number | null;
  account?: string | null;
  category?: string | null;
  subCategory?: string | null;
  original?: string | null;
};

function toNumber(x: any): number {
  if (x === null || x === undefined) return 0;
  const s = String(x).replace(/[, ]/g, "");
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

function parseAusDateToISO(input: string): string {
  const s = (input || "").trim().replace(/\s+/g, " ");
  // "06 Mar 2025"
  if (/^\d{1,2}\s+[A-Za-z]{3,}\s+\d{2,4}$/.test(s)) {
    const d = new Date(Date.parse(s));
    return isNaN(+d) ? "" : d.toISOString();
  }
  // "5/01/2023"
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (m) {
    const [, d, mo, y] = m;
    const yyyy = y.length === 2 ? `20${y}` : y;
    const dt = new Date(Number(yyyy), Number(mo) - 1, Number(d));
    return isNaN(+dt) ? "" : dt.toISOString();
  }
  const t = Date.parse(s);
  return isNaN(t) ? "" : new Date(t).toISOString();
}

// Detect bank by headers (lowercased)
function detectBankByHeaders(headers: string[]): BankId | null {
  const H = headers.map((h) => h.trim().toLowerCase());

  // Existing banks (ING/UBANK/WESTPAC/UPBANK) — keep your current checks as-is above/below
  // New ones:

  // Macquarie
  if (
    H.includes("transaction date") &&
    H.includes("details") &&
    H.includes("debit") &&
    H.includes("credit")
  )
    return "MACQUARIE";

  // CommBank (often 4 cols without real headers)
  if (
    headers.length === 4 &&
    !H.some((h) => /(date|amount|description|balance)/.test(h))
  )
    return "COMM_BANK";
  if (["date", "amount", "description", "balance"].every((k) => H.includes(k)))
    return "COMM_BANK";

  // St.George
  if (
    H.includes("debit") &&
    H.includes("credit") &&
    (H.includes("subcategory") || H.includes("subCategory".toLowerCase()))
  )
    return "ST_GEORGE";

  // Westpac
  if (
    H.includes("bank account") &&
    H.includes("narrative") &&
    H.includes("debit amount") &&
    H.includes("credit amount")
  ) {
    return "WESTPAC";
  }
  return null;
}

// Macquarie (MacTransactions.csv)
function parseMacquarie(rows: Record<string, string>[]): UnifiedTx[] {
  return rows.map((r) => {
    const dateRaw = r["Transaction Date"] ?? "";
    const debit = toNumber(r["Debit"]);
    const credit = toNumber(r["Credit"]);
    return {
      bank: "MACQUARIE",
      dateISO: parseAusDateToISO(dateRaw),
      dateRaw,
      description: (r["Details"] || r["Original Description"] || "").trim(),
      amount: credit - debit,
      debit: Math.max(0, debit),
      credit: Math.max(0, credit),
      balance: r["Balance"] != null ? toNumber(r["Balance"]) : null,
      account: r["Account"] || null,
      category: r["Category"] || null,
      subCategory: (r["Subcategory"] || r["SubCategory"] || null) as any,
      original: r["Original Description"] || r["Notes"] || null,
    };
  });
}

// CommBank (4 columns: Date, Amount, Description, Balance; debits negative)
function parseCommBank(rows: Record<string, string>[]): UnifiedTx[] {
  return rows.map((r) => {
    const dateRaw = r["Date"] ?? "";
    const amt = toNumber(r["Amount"]);
    return {
      bank: "COMM_BANK",
      dateISO: parseAusDateToISO(dateRaw),
      dateRaw,
      description: (r["Description"] || "").trim(),
      amount: amt,
      debit: amt < 0 ? Math.abs(amt) : 0,
      credit: amt > 0 ? amt : 0,
      balance: r["Balance"] != null ? toNumber(r["Balance"]) : null,
    };
  });
}

// St.George (Date, Description, Debit, Credit, Balance, Category, SubCategory)
function parseStGeorge(rows: Record<string, string>[]): UnifiedTx[] {
  return rows.map((r) => {
    const dateRaw = r["Date"] ?? "";
    const debit = toNumber(r["Debit"]);
    const credit = toNumber(r["Credit"]);
    return {
      bank: "ST_GEORGE",
      dateISO: parseAusDateToISO(dateRaw),
      dateRaw,
      description: (r["Description"] || "").trim(),
      amount: credit - debit,
      debit: Math.max(0, debit),
      credit: Math.max(0, credit),
      balance: r["Balance"] != null ? toNumber(r["Balance"]) : null,
      category: r["Category"] || null,
      subCategory: r["SubCategory"] || null,
    };
  });
}

// Westpac
function parseWestpac(rows: Record<string, string>[]): UnifiedTx[] {
  return rows.map((r) => {
    const dateRaw = r["Date"] ?? "";
    const debit = toNumber(r["Debit Amount"]);
    const credit = toNumber(r["Credit Amount"]);
    const balance = r["Balance"] != null ? toNumber(r["Balance"]) : null;

    return {
      bank: "WESTPAC",
      dateISO: parseAusDateToISO(dateRaw),
      dateRaw,
      description: (r["Narrative"] || "").trim(),
      amount: credit - debit, // signed
      debit: Math.max(0, debit),
      credit: Math.max(0, credit),
      balance,
      account: r["Bank Account"] || null,
      category: r["Categories"] || null,
      subCategory: null,
      original: r["Serial"] || null,
    };
  });
}

// Normalize: route to the right parser
function normalizeParsedRows(
  headers: string[],
  rows: Record<string, string>[]
): UnifiedTx[] {
  const bank = detectBankByHeaders(headers);
  switch (bank) {
    case "MACQUARIE":
      return parseMacquarie(rows);
    case "COMM_BANK":
      return parseCommBank(rows);
    case "ST_GEORGE":
      return parseStGeorge(rows);
    case "WESTPAC":
      return parseWestpac(rows);

    // keep your existing cases here for ING/UBANK/WESTPAC/UPBANK
    default:
      return [];
  }
}

// ===== CATEGORY ARRAYS & MAPPING =====
const restaurantAndTakeawayNames = ["MCDONALD", "KFC", "SUBWAY", "Dominos"];
const transportAndParkingNames = ["TRANSPORTFORNSW"];
const donationNames = ["RMHCSYDNEY"];
const afterpayNames = ["Afterpay"];
const groceryNames = ["WOOLWORTHS", "COLES", "ALDI"];
const investmentNames = ["COMMSEC"];
const transfersNames = [];
const vehicleExpenseNames = [" AUTO"];
const billAndServiceNames = ["ActewAGL"];
const BNPLNames = [];
const flightNames = ["Virgin"];
const gamblingNames = ["SPORTSBET"];
const accommodationNames = ["Booking.com"];
const attractionsAndEventsNames = ["TIMEZONE"];
const retailShoppingNames = ["PAYPAL"];
const healthAndMedicalNames = ["CHEMIST"];
const subscriptionNames = ["Anytime"];
const clothingAndPersonalLifeNames = ["KMART"];
const educationNames = ["STACKSOCIAL"];
const cafeAndCoffeeNames = ["COFFEE"];
const fitnessNames = ["CLUB"];
const hobbyNames = [];
const homeStuffNames = ["IKEA"];

const sortArr = [
  donationNames,
  restaurantAndTakeawayNames,
  afterpayNames,
  vehicleExpenseNames,
  transportAndParkingNames,
  billAndServiceNames,
  BNPLNames,
  groceryNames,
  investmentNames,
  transfersNames,
  retailShoppingNames,
  flightNames,
  gamblingNames,
  accommodationNames,
  attractionsAndEventsNames,
  clothingAndPersonalLifeNames,
  educationNames,
  cafeAndCoffeeNames,
  healthAndMedicalNames,
  subscriptionNames,
  fitnessNames,
  hobbyNames,
  homeStuffNames,
];

const categoryNames = [
  "Donations",
  "Restaurant & Takeaway",
  "AfterPay",
  "Vehicle Expenses",
  "Transport & Parking",
  "Bills & Services",
  "BNPL",
  "Grocery",
  "Investment",
  "Transfers",
  "Retail Shopping",
  "Flights",
  "Gambling",
  "Accommodation",
  "Attractions & Events",
  "Clothing & Personal Life",
  "Education",
  "Cafes & Coffees",
  "Health & Medical",
  "Subscriptions",
  "Fitness",
  "Hobbies",
  "Home Stuff",
];

// Month mapping
const monthsLetters: Record<string, string> = {
  Jan: "01",
  Feb: "02",
  Mar: "03",
  Apr: "04",
  May: "05",
  Jun: "06",
  Jul: "07",
  Aug: "08",
  Sep: "09",
  Oct: "10",
  Nov: "11",
  Dec: "12",
};

// ===== THEME MANAGEMENT =====
const currentTheme = ref("light");
const availableThemes = [
  "light",
  "dark",
  "cupcake",
  "bumblebee",
  "emerald",
  "corporate",
  "synthwave",
  "retro",
  "cyberpunk",
  "valentine",
  "halloween",
  "garden",
  "forest",
  "aqua",
  "lofi",
  "pastel",
  "fantasy",
  "wireframe",
  "black",
  "luxury",
  "dracula",
  "cmyk",
  "autumn",
  "business",
  "acid",
  "lemonade",
  "night",
  "coffee",
  "winter",
];

function setTheme(theme: string) {
  if (availableThemes.includes(theme)) {
    currentTheme.value = theme;
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.className = theme;
    localStorage.setItem("financial-tracker-theme", theme);
    window.dispatchEvent(new CustomEvent("theme-changed", { detail: theme }));
  }
}

// ===== NAVIGATION =====
const activeTab = ref<"import" | "add" | "chart" | "transactions">("import");
const tabs = [
  { id: "import", label: "Import", icon: "📥" },
  { id: "add", label: "Add Transaction", icon: "➕" },
  { id: "chart", label: "Chart", icon: "📊" },
  { id: "transactions", label: "Transactions", icon: "📋" },
  { id: "about", label: "About", icon: "ℹ️" },
];

// ===== DATA MANAGEMENT =====
const transactions = ref<Transaction[]>([]);
const categories = computed(() => {
  const uniqueCategories = new Set<string>();
  transactions.value.forEach((t) => uniqueCategories.add(t.category));
  return Array.from(uniqueCategories).sort();
});

// ===== IMPORT FUNCTIONALITY =====
const importUrl = ref("");
const importStatus = ref("");
const debugInfo = ref("");

// Function to categorize transaction based on sortArr
function categorizeTransaction(description?: string): string {
  const desc = description || "No Name";
  for (let i = 0; i < sortArr.length; i++) {
    const categoryKeywords = sortArr[i];
    for (const keyword of categoryKeywords) {
      if (desc.toLowerCase().includes(keyword.toLowerCase())) {
        return categoryNames[i];
      }
    }
  }
  return "Uncategorized";
}

// Function to parse date (as before, with TS types)
function parseTransactionDate(dateStr: string, bankType: string): string {
  if (!dateStr) return new Date().toISOString().split("T")[0];
  try {
    let parsedDate = "";
    if (bankType === "upbank") {
      parsedDate = dateStr.split("T")[0];
    } else if (dateStr.includes("/")) {
      const parts = dateStr.split("/");
      if (parts.length === 3) {
        const day = parts[0].padStart(2, "0");
        const month = parts[1].padStart(2, "0");
        const year = parts[2];
        parsedDate = `${year}-${month}-${day}`;
      }
    } else if (dateStr.includes(" ")) {
      const parts = dateStr.split(" ");
      if (parts.length === 3) {
        const day = parts[0].padStart(2, "0");
        const month = monthsLetters[parts[1]] || "01";
        const year = parts[2];
        parsedDate = `${year}-${month}-${day}`;
      }
    } else if (dateStr.includes("-")) {
      parsedDate = dateStr;
    }
    // Validate
    if (!isNaN(new Date(parsedDate).getTime())) return parsedDate;
  } catch {}
  return new Date().toISOString().split("T")[0];
}

// CSV parsing logic
function parseCSV(csvText: string) {
  try {
    importStatus.value = "Parsing CSV data...";

    // Split into lines and figure out header row
    const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) {
      importStatus.value = "CSV file appears to be empty or invalid";
      return;
    }

    // Try to read headers. If first row looks like data (CommBank), synthesize headers.
    let headers = lines[0]
      .split(",")
      .map((h) => h.replace(/^"|"$/g, "").trim());
    const firstHeaderLooksLikeDate =
      /^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(headers[0]) ||
      /^[0-9-]{8,10}$/.test(headers[0]);
    if (firstHeaderLooksLikeDate && headers.length === 4) {
      // CommBank style without headers
      headers = ["Date", "Amount", "Description", "Balance"];
    }

    // Build row objects (very simple CSV split; if you need quotes/commas-inside-fields robustly, plug PapaParse here)
    const rowsObj: Record<string, string>[] = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(","); // NOTE: upgrade to a real CSV parser if needed
      if (cols.length < 2) continue;
      const o: Record<string, string> = {};
      headers.forEach((h, idx) => {
        o[h] = (cols[idx] ?? "").replace(/^"|"$/g, "").trim();
      });
      rowsObj.push(o);
    }

    // Detect + normalize into UnifiedTx
    const unified = normalizeParsedRows(headers, rowsObj);

    // If detector didn’t match, fall back to your current generic logic
    if (unified.length === 0) {
      // === your old generic block, but simplified ===
      const hLower = headers.map((h) => h.toLowerCase());
      const dateIndex = hLower.findIndex((h) => h.includes("date"));
      const descIndex = hLower.findIndex((h) =>
        /(description|detail|merchant)/.test(h)
      );
      const amtIndex = hLower.findIndex((h) => /(amount|debit|value)/.test(h));
      if (dateIndex === -1 || descIndex === -1 || amtIndex === -1) {
        importStatus.value =
          "Could not find required columns (Date, Description, Amount)";
        return;
      }
      let importedCount = 0;
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(",");
        if (cols.length <= Math.max(dateIndex, descIndex, amtIndex)) continue;
        const rawDate = cols[dateIndex]?.trim() || "";
        const desc =
          (cols[descIndex] || "").replace(/"/g, "").trim() || "Unknown";
        const amount = Math.abs(
          parseFloat((cols[amtIndex] || "").replace(/[^-\d.]/g, "")) || 0
        );
        if (amount > 0) {
          const tx: Transaction = {
            id: Date.now().toString() + importedCount,
            date: parseTransactionDate(rawDate, "generic"),
            type: "spending",
            amount,
            category: categorizeTransaction(desc),
            description: desc,
            recurring: false,
          };
          transactions.value.push(tx);
          importedCount++;
        }
      }
      importStatus.value = `Successfully imported ${importedCount} transactions`;
      return;
    }

    // Map UnifiedTx -> your Transaction model
    let imported = 0;
    for (const u of unified) {
      const iso = u.dateISO
        ? u.dateISO.slice(0, 10)
        : parseTransactionDate(u.dateRaw, "generic");
      let type: TransactionType = "spending";
      let amountAbs = Math.abs(u.amount);

      if (u.amount < 0) {
        type = "income"; // treat negatives as income in your app model
        amountAbs = Math.abs(u.amount);
      } else if (u.amount === 0 && u.debit > 0) {
        type = "spending";
        amountAbs = u.debit;
      } else if (u.amount === 0 && u.credit > 0) {
        type = "income";
        amountAbs = u.credit;
      }

      // Only add positive amounts, following your existing behavior
      if (amountAbs > 0) {
        const desc = u.description || u.original || "Unknown";
        const tx: Transaction = {
          id: Date.now().toString() + imported,
          date: iso,
          type,
          amount: amountAbs,
          category: categorizeTransaction(desc),
          description: desc,
          recurring: false,
        };
        transactions.value.push(tx);
        imported++;
      }
    }

    importStatus.value = `Successfully imported ${imported} transactions`;
    debugInfo.value = `Detected via headers: ${
      detectBankByHeaders(headers) ?? "generic"
    }`;
  } catch (error: any) {
    importStatus.value = "Error parsing CSV: " + error.message;
    debugInfo.value = error.stack;
    console.error("Error parsing CSV:", error);
  }
}

function handleFileUpload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file && file.type === "text/csv") {
    const reader = new FileReader();
    reader.onload = (e) => {
      parseCSV((e.target?.result as string) || "");
    };
    reader.readAsText(file);
  }
}

async function importFromUrl() {
  if (!importUrl.value) return;
  try {
    importStatus.value = "Importing from URL...";
    const response = await fetch(importUrl.value);
    const csvText = await response.text();
    parseCSV(csvText);
    importUrl.value = "";
  } catch (error: any) {
    importStatus.value = "Failed to import from URL: " + error.message;
    console.error("Failed to import from URL:", error);
  }
}

// ===== TRANSACTION FORM =====
const newTransaction = ref<Transaction>({
  id: "",
  date: new Date().toISOString().split("T")[0],
  type: "spending",
  amount: 0,
  category: "",
  description: "",
  recurring: false,
  frequency: "monthly",
  recursions: 1,
  endDate: "",
});

const currentlyEditingId = ref<string | null>(null);

function addTransaction() {
  if (newTransaction.value.amount <= 0 || !newTransaction.value.category)
    return;
  if (currentlyEditingId.value) {
    // Update existing
    const idx = transactions.value.findIndex(
      (tx) => tx.id === currentlyEditingId.value
    );
    if (idx !== -1) {
      transactions.value[idx] = {
        ...newTransaction.value,
        id: currentlyEditingId.value,
      };
    }
    currentlyEditingId.value = null;
    resetForm();
    return;
  }
  // Add new (support recurring)
  const base = {
    ...newTransaction.value,
    id: Date.now().toString() + Math.floor(Math.random() * 10000),
  };
  let newTxs: Transaction[] = [];
  if (
    newTransaction.value.recurring &&
    (newTransaction.value.recursions || 1) > 1
  ) {
    const freq = newTransaction.value.frequency || "monthly";
    let date = new Date(newTransaction.value.date);
    const maxRecursions = newTransaction.value.recursions || 1;
    const endDate = newTransaction.value.endDate
      ? new Date(newTransaction.value.endDate)
      : null;
    let i = 0;
    while (i < maxRecursions) {
      const isoDate = date.toISOString().split("T")[0];
      if (endDate && date > endDate) break;
      newTxs.push({
        ...base,
        id: base.id + "-" + i,
        date: isoDate,
        endDate: newTransaction.value.endDate || "",
      });
      // Increment date
      if (freq === "monthly") date.setMonth(date.getMonth() + 1);
      else if (freq === "quarterly") date.setMonth(date.getMonth() + 3);
      else if (freq === "yearly") date.setFullYear(date.getFullYear() + 1);
      else {
        const addDays = freq === "weekly" ? 7 : freq === "fortnightly" ? 14 : 1;
        date = new Date(date.getTime() + addDays * 24 * 60 * 60 * 1000);
      }
      i++;
      // If next recurrence would exceed endDate, break
      if (endDate && date > endDate) break;
    }
  } else {
    newTxs = [base];
  }
  newTxs.forEach((tx) => transactions.value.push(tx));
  resetForm();
}

function resetForm() {
  newTransaction.value = {
    id: "",
    date: new Date().toISOString().split("T")[0],
    type: "spending",
    amount: 0,
    category: "",
    description: "",
    recurring: false,
    frequency: "monthly",
    recursions: 1,
    endDate: "",
  };
  currentlyEditingId.value = null;
}

// ===== DATE FILTERING =====
const dateFilter = ref({
  start: "",
  end: "",
});

const selectedDatePreset = ref("All Time");

const datePresets = [
  { label: "Last 7 Days", days: 7 },
  { label: "Last 30 Days", days: 30 },
  { label: "This Month", days: 0, type: "month" },
  { label: "Last Month", days: 0, type: "lastMonth" },
  { label: "Last 3 Months", days: 90 },
  { label: "This Year", days: 0, type: "year" },
  { label: "Last Year", days: 0, type: "lastYear" },
  { label: "All Time", days: 0, type: "all" },
];

const applyDatePreset = (preset) => {
  selectedDatePreset.value = preset.label;
  const today = new Date();

  switch (preset.type) {
    case "month":
      dateFilter.value.start = new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      )
        .toISOString()
        .split("T")[0];
      dateFilter.value.end = new Date(
        today.getFullYear(),
        today.getMonth() + 1,
        0
      )
        .toISOString()
        .split("T")[0];
      break;
    case "lastMonth":
      dateFilter.value.start = new Date(
        today.getFullYear(),
        today.getMonth() - 1,
        1
      )
        .toISOString()
        .split("T")[0];
      dateFilter.value.end = new Date(today.getFullYear(), today.getMonth(), 0)
        .toISOString()
        .split("T")[0];
      break;
    case "year":
      dateFilter.value.start = new Date(today.getFullYear(), 0, 1)
        .toISOString()
        .split("T")[0];
      dateFilter.value.end = new Date(today.getFullYear(), 11, 31)
        .toISOString()
        .split("T")[0];
      break;
    case "lastYear":
      dateFilter.value.start = new Date(today.getFullYear() - 1, 0, 1)
        .toISOString()
        .split("T")[0];
      dateFilter.value.end = new Date(today.getFullYear() - 1, 11, 31)
        .toISOString()
        .split("T")[0];
      break;
    case "all":
      dateFilter.value.start = "";
      dateFilter.value.end = "";
      break;
    default:
      const startDate = new Date(
        today.getTime() - preset.days * 24 * 60 * 60 * 1000
      );
      dateFilter.value.start = startDate.toISOString().split("T")[0];
      dateFilter.value.end = today.toISOString().split("T")[0];
  }
};

const resetDateFilter = () => {
  applyDatePreset(datePresets.find((p) => p.label === "All Time"));
};

const formatDateRange = () => {
  if (!dateFilter.value.start || !dateFilter.value.end) {
    return "All time";
  }

  const start = new Date(dateFilter.value.start);
  const end = new Date(dateFilter.value.end);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return `${formatDate(dateFilter.value.start)} - ${formatDate(
    dateFilter.value.end
  )} (${diffDays} days)`;
};

// ===== CHART FUNCTIONALITY =====
const chartConfig = ref({
  type: "line",
  groupBy: "monthly",
});

const selectedCategories = ref([]);
const chartCanvas = ref(null);
let chartInstance = null;

const toggleCategory = (category) => {
  const index = selectedCategories.value.indexOf(category);
  if (index > -1) {
    selectedCategories.value.splice(index, 1);
  } else {
    selectedCategories.value.push(category);
  }
};

const selectAllCategories = () => {
  selectedCategories.value = [...categories.value];
};

const unselectAllCategories = () => {
  selectedCategories.value = [];
};

// ===== TRANSACTION FILTERING AND SORTING =====
const searchQuery = ref("");
const typeFilter = ref("");
const sortField = ref("date");
const sortOrder = ref("desc");
const selectedTransactions = ref([]);
const currentPage = ref(1);
const itemsPerPage = 20;

const calculatedEndDate = computed(() => {
  if (!newTransaction.value.recurring) return null;
  const freq = newTransaction.value.frequency || "monthly";
  const recursions = newTransaction.value.recursions || 1;
  let date = new Date(newTransaction.value.date);
  if (!date || isNaN(date.getTime())) return null;

  let endDate = new Date(date);
  for (let i = 1; i < recursions; i++) {
    switch (freq) {
      case "daily":
        endDate.setDate(endDate.getDate() + 1);
        break;
      case "weekly":
        endDate.setDate(endDate.getDate() + 7);
        break;
      case "fortnightly":
        endDate.setDate(endDate.getDate() + 14);
        break;
      case "monthly":
        endDate.setMonth(endDate.getMonth() + 1);
        break;
      case "quarterly":
        endDate.setMonth(endDate.getMonth() + 3);
        break;
      case "yearly":
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;
    }
  }
  return endDate.toISOString().split("T")[0];
});

const filteredTransactions = computed(() => {
  let filtered = [...transactions.value];

  // Date filter
  if (dateFilter.value.start && dateFilter.value.end) {
    filtered = filtered.filter((t) => {
      const transactionDate = new Date(t.date);
      const startDate = new Date(dateFilter.value.start);
      const endDate = new Date(dateFilter.value.end);
      return transactionDate >= startDate && transactionDate <= endDate;
    });
  }

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter((t) => {
      return (
        t.category.toLowerCase().includes(query) ||
        t.amount.toString().includes(query) ||
        t.type.toLowerCase().includes(query) ||
        t.date.includes(query) ||
        (t.description && t.description.toLowerCase().includes(query))
      );
    });
  }

  // Type filter
  if (typeFilter.value) {
    filtered = filtered.filter((t) => t.type === typeFilter.value);
  }

  // Sort
  filtered.sort((a, b) => {
    let aValue, bValue;

    switch (sortField.value) {
      case "date":
        aValue = new Date(a.date);
        bValue = new Date(b.date);
        break;
      case "type":
        aValue = a.type;
        bValue = b.type;
        break;
      case "amount":
        aValue = a.amount;
        bValue = b.amount;
        break;
      case "category":
        aValue = a.category;
        bValue = b.category;
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortOrder.value === "asc" ? -1 : 1;
    if (aValue > bValue) return sortOrder.value === "asc" ? 1 : -1;
    return 0;
  });

  return filtered;
});

const paginatedTransactions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredTransactions.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(filteredTransactions.value.length / itemsPerPage);
});

const allSelected = computed(() => {
  return (
    paginatedTransactions.value.length > 0 &&
    paginatedTransactions.value.every((_, index) =>
      selectedTransactions.value.includes(
        index + (currentPage.value - 1) * itemsPerPage
      )
    )
  );
});

// ===== STATISTICS =====
const incomeTransactions = computed(() =>
  filteredTransactions.value.filter((t) => t.type === "income")
);

const expenseTransactions = computed(() =>
  filteredTransactions.value.filter((t) => t.type === "spending")
);

const totalIncome = computed(() =>
  incomeTransactions.value.reduce((sum, t) => sum + t.amount, 0)
);

const totalExpenses = computed(() =>
  expenseTransactions.value.reduce((sum, t) => sum + t.amount, 0)
);

const netBalance = computed(() => totalIncome.value - totalExpenses.value);

// ===== CHART DATA =====
const chartData = computed(() => {
  const filtered =
    selectedCategories.value.length > 0
      ? filteredTransactions.value.filter((t) =>
          selectedCategories.value.includes(t.category)
        )
      : filteredTransactions.value;

  if (
    chartConfig.value.type === "pie" ||
    chartConfig.value.type === "doughnut"
  ) {
    // Pie and doughnut: Category-based chart
    const categoryData = {};
    filtered.forEach((t) => {
      if (t.type === "spending") {
        categoryData[t.category] = (categoryData[t.category] || 0) + t.amount;
      }
    });
    return {
      labels: Object.keys(categoryData),
      datasets: [
        {
          data: Object.values(categoryData),
          backgroundColor: [
            "#FF6384",
            "#36A2EB",
            "#FFCE56",
            "#4BC0C0",
            "#9966FF",
            "#FF9F40",
            "#FF6384",
            "#C9CBCF",
            "#4BC0C0",
            "#FF6384",
          ],
        },
      ],
    };
  } else {
    // Time-based charts: line & bar (logic matches, only `type` differs)
    const timeData: Record<string, { income: number; spending: number }> = {};
    filtered.forEach((t) => {
      let key;
      const date = new Date(t.date);
      switch (chartConfig.value.groupBy) {
        case "daily":
          key = t.date;
          break;
        case "weekly":
          key = new Date(date.setDate(date.getDate() - date.getDay()))
            .toISOString()
            .split("T")[0];
          break;
        case "monthly":
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
            2,
            "0"
          )}`;
          break;
        case "quarterly":
          key = `${date.getFullYear()}-Q${Math.floor(date.getMonth() / 3) + 1}`;
          break;
        case "yearly":
          key = date.getFullYear().toString();
          break;
        default:
          key = t.date;
      }
      if (!timeData[key]) timeData[key] = { income: 0, spending: 0 };
      timeData[key][t.type] += t.amount;
    });

    const sortedKeys = Object.keys(timeData).sort();
    const incomeArr = sortedKeys.map((key) => timeData[key].income);
    const spendingArr = sortedKeys.map((key) => timeData[key].spending);
    const balanceArr: number[] = [];
    let cumulative = 0;
    sortedKeys.forEach((key, i) => {
      cumulative += (incomeArr[i] || 0) - (spendingArr[i] || 0);
      balanceArr.push(cumulative);
    });

    // Use same dataset color/type logic for both line & bar
    const chartType = chartConfig.value.type;

    const datasets = [
      {
        label: "Income",
        data: incomeArr,
        borderColor: "#10B981",
        backgroundColor: "rgba(16, 185, 129, 0.4)",
        type: chartType,
        tension: 0.4,
      },
      {
        label: "Spending",
        data: spendingArr,
        borderColor: "#EF4444",
        backgroundColor: "rgba(239, 68, 68, 0.4)",
        type: chartType,
        tension: 0.4,
      },
      {
        label: "Balance",
        data: balanceArr,
        borderColor: "#3B82F6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        // Only show as line, or show as bar too if you want stacked
        type: chartType === "bar" ? "line" : chartType,
        pointRadius: 3,
        borderWidth: 3,
        tension: 0.3,
        fill: false,
        hidden: chartType === "bar", // hide by default for bar, or set to false if you want to display it always
      },
    ];
    // If you want to always show balance (even for bar), set `hidden: false` above
    return { labels: sortedKeys, datasets };
  }
});

// ===== UTILITY FUNCTIONS =====
const formatDate = (date) => {
  return new Date(date).toLocaleDateString();
};

const getSortIcon = (field) => {
  if (sortField.value !== field) return "↕️";
  return sortOrder.value === "asc" ? "↑" : "↓";
};

const updateSort = (field) => {
  if (sortField.value === field) {
    sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
  } else {
    sortField.value = field;
    sortOrder.value = "desc";
  }
  currentPage.value = 1;
};

const toggleSelect = (index) => {
  const actualIndex = index + (currentPage.value - 1) * itemsPerPage;
  const selectedIndex = selectedTransactions.value.indexOf(actualIndex);
  if (selectedIndex > -1) {
    selectedTransactions.value.splice(selectedIndex, 1);
  } else {
    selectedTransactions.value.push(actualIndex);
  }
};

const toggleSelectAll = () => {
  if (allSelected.value) {
    // Deselect all on current page
    const pageIndices = paginatedTransactions.value.map(
      (_, index) => index + (currentPage.value - 1) * itemsPerPage
    );
    selectedTransactions.value = selectedTransactions.value.filter(
      (index) => !pageIndices.includes(index)
    );
  } else {
    // Select all on current page
    const pageIndices = paginatedTransactions.value.map(
      (_, index) => index + (currentPage.value - 1) * itemsPerPage
    );
    pageIndices.forEach((index) => {
      if (!selectedTransactions.value.includes(index)) {
        selectedTransactions.value.push(index);
      }
    });
  }
};

const clearSelection = () => {
  selectedTransactions.value = [];
};

const bulkDelete = () => {
  if (
    confirm(
      `Are you sure you want to delete ${selectedTransactions.value.length} transaction(s)?`
    )
  ) {
    const indicesToDelete = [...selectedTransactions.value].sort(
      (a, b) => b - a
    );
    indicesToDelete.forEach((index) => {
      transactions.value.splice(index, 1);
    });
    selectedTransactions.value = [];
  }
};

function editTransaction(transaction: Transaction) {
  newTransaction.value = { ...transaction };
  currentlyEditingId.value = transaction.id;
  activeTab.value = "add";
}

const deleteTransaction = (id) => {
  if (confirm("Are you sure you want to delete this transaction?")) {
    const index = transactions.value.findIndex((t) => t.id === id);
    if (index > -1) {
      transactions.value.splice(index, 1);
    }
  }
};

// ===== CHART RENDERING =====
const renderChart = async () => {
  if (!chartCanvas.value || chartData.value.labels.length === 0) return;

  if (chartInstance) {
    chartInstance.destroy();
  }

  const { Chart, registerables } = await import("chart.js");
  Chart.register(...registerables);

  // Deep clone chartData and modify datasets for 'bar'
  let data = JSON.parse(JSON.stringify(chartData.value));

  // If 'bar' selected, make all datasets type 'bar'
  if (chartConfig.value.type === "bar") {
    data.datasets.forEach((ds) => (ds.type = "bar"));
  } else if (chartConfig.value.type === "line") {
    data.datasets.forEach((ds) => (ds.type = "line"));
  }

  chartInstance = new Chart(chartCanvas.value.getContext("2d"), {
    type: chartConfig.value.type, // e.g. 'bar', 'line', 'pie', etc.
    data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "top" },
        title: { display: true, text: "Financial Analytics" },
      },
      scales:
        chartConfig.value.type === "pie" ||
        chartConfig.value.type === "doughnut"
          ? {}
          : {
              y: {
                beginAtZero: true,
                ticks: { callback: (value) => "$" + value.toFixed(2) },
              },
            },
    },
  });
};

// ===== WATCHERS =====

watch(activeTab, (tab) => {
  if (tab === "about" && !aboutHtml.value) {
    fetchAboutMarkdown();
  }
});

watch(
  selectedCategories,
  () => {
    localStorage.setItem(
      "financial-tracker-selected-categories",
      JSON.stringify(selectedCategories.value)
    );
  },
  { deep: true }
);

watch(
  transactions,
  () => {
    localStorage.setItem(
      "financial-tracker-transactions",
      JSON.stringify(transactions.value)
    );
  },
  { deep: true }
);

watch(
  chartConfig,
  () => {
    localStorage.setItem(
      "financial-tracker-chart-config",
      JSON.stringify(chartConfig.value)
    );
  },
  { deep: true }
);

watch(
  [chartData, chartConfig],
  () => {
    nextTick(() => {
      renderChart();
    });
  },
  { deep: true }
);

watch(
  categories,
  () => {
    if (selectedCategories.value.length === 0) {
      selectedCategories.value = [...categories.value];
    }
  },
  { deep: true }
);

watch([searchQuery, typeFilter], () => {
  currentPage.value = 1;
});

// ===== LIFECYCLE =====
onMounted(() => {
  // Initialize theme
  const savedTheme = localStorage.getItem("financial-tracker-theme");
  if (savedTheme && availableThemes.includes(savedTheme)) {
    setTheme(savedTheme);
  } else {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    setTheme(prefersDark ? "dark" : "light");
  }

  // Initialize date filter
  resetDateFilter();

  // Initialize selected categories
  selectedCategories.value = [...categories.value];

  // Restore chart config
  const savedConfig = localStorage.getItem("financial-tracker-chart-config");
  if (savedConfig) {
    try {
      chartConfig.value = JSON.parse(savedConfig);
    } catch {}
  }
  // Restore transactions
  const savedTransactions = localStorage.getItem(
    "financial-tracker-transactions"
  );
  if (savedTransactions) {
    try {
      transactions.value = JSON.parse(savedTransactions);
    } catch {}
  }
  // Restore categories
  const savedCats = localStorage.getItem(
    "financial-tracker-selected-categories"
  );
  if (savedCats) {
    try {
      selectedCategories.value = JSON.parse(savedCats);
    } catch {}
  } else {
    selectedCategories.value = [...categories.value];
  }
});
</script>

<style scoped>
/* Custom scrollbar */
.overflow-x-auto::-webkit-scrollbar {
  height: 8px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  @apply bg-base-200 rounded;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  @apply bg-base-content/20 rounded;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  @apply bg-base-content/40;
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .table th,
  .table td {
    padding: 0.5rem 0.25rem;
    font-size: 0.875rem;
  }

  .btn-xs {
    padding: 0.125rem 0.25rem;
  }
}
</style>
