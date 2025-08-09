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
                Supports: Westpac✅ | NAB✅ | ANZ✅ | CommBank✅ | St.George✅ |
                ING✅ | Macquarie✅ | Up Bank✅ | UBank✅
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
                <button
                  class="btn btn-primary join-item"
                  @click="importFromUrl"
                >
                  Import
                </button>
              </div>
            </div>
          </div>

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
              />
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
  <label class="label"><span class="label-text">Date</span></label>

  <div class="join w-full">
    <!-- Visible dd-mm-yyyy text field -->
    <input
      ref="addDateTextRef"
      type="text"
      inputmode="numeric"
      placeholder="dd-mm-yyyy"
      v-model="newTxDateText"
      @input="onAddDateInput"
      @blur="onAddDateBlur"
      @keydown="onDateKeydownDigitsOnly"
      :aria-invalid="!!newTxDateError"
      aria-describedby="addDateError"
      class="input input-bordered join-item w-full"
    />

    <!-- Calendar button opens the hidden native date input -->
    <button
      type="button"
      class="btn btn-outline join-item"
      @click="openAddCalendar"
      title="Open calendar"
      aria-label="Open calendar picker"
    >
      📅
    </button>

    <!-- Today button -->
    <button
      type="button"
      class="btn btn-primary join-item"
      @click="setAddDateToday"
      title="Use today’s date"
      aria-label="Use today’s date"
    >
      Today
    </button>
  </div>

  <!-- Inline error text -->
  <p v-if="newTxDateError" id="addDateError" class="text-error text-sm mt-1">
    {{ newTxDateError }}
  </p>

  <!-- Single hidden native date input (used only for the picker) -->
  <input
    ref="addDatePickerRef"
    v-model="newTxDateISO"
    type="date"
    class="absolute opacity-0 w-px h-px -z-10"
    tabindex="-1"
    aria-hidden="true"
  />
</div>


            <div class="form-control">
              <label class="label"><span class="label-text">Type</span></label>
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
              <label class="label"
                ><span class="label-text">Amount</span></label
              >
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
              <label class="label"
                ><span class="label-text">Category</span></label
              >
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
              <label class="label"
                ><span class="label-text">Description (Optional)</span></label
              >
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
                <label class="label"
                  ><span class="label-text">Frequency</span></label
                >
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
                <label class="label"
                  ><span class="label-text">Repeat</span></label
                >
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
              <label class="label"
                ><span class="label-text">&nbsp;</span></label
              >
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
                <label class="label"
                  ><span class="label-text">Start Date</span></label
                >
                <div class="join w-full">
                  <input
                    v-model="dateFilterStartText"
                    type="text"
                    placeholder="dd-mm-yyyy"
                    inputmode="numeric"
                    class="input input-bordered join-item w-full"
                    aria-label="Start date (dd-mm-yyyy)"
                    @input="onStartInput"
                    @blur="onStartBlur"
                    @keydown="onDateKeydownDigitsOnly"
                    autocomplete="off"
                  />
                  <button
                    type="button"
                    class="btn btn-outline join-item"
                    @click="openStartCalendar"
                    title="Open calendar"
                  >
                    📅
                  </button>
                  <button
                    type="button"
                    class="btn btn-primary join-item"
                    @click="setRangeToday"
                    title="Set both to today"
                  >
                    Today
                  </button>
                </div>
                <input
                  ref="startPickerRef"
                  v-model="dateFilterStartISO"
                  type="date"
                  class="sr-only absolute opacity-0 pointer-events-none"
                  tabindex="-1"
                  aria-hidden="true"
                />
              </div>

              <!-- End -->
              <div class="form-control">
                <label class="label"
                  ><span class="label-text">End Date</span></label
                >
                <div class="join w-full">
                  <input
                    v-model="dateFilterEndText"
                    type="text"
                    placeholder="dd-mm-yyyy"
                    inputmode="numeric"
                    class="input input-bordered join-item w-full"
                    aria-label="End date (dd-mm-yyyy)"
                    @input="onEndInput"
                    @blur="onEndBlur"
                    @keydown="onDateKeydownDigitsOnly"
                    autocomplete="off"
                  />
                  <button
                    type="button"
                    class="btn btn-outline join-item"
                    @click="openEndCalendar"
                    title="Open calendar"
                  >
                    📅
                  </button>
                  <button
                    type="button"
                    class="btn btn-primary join-item"
                    @click="dateFilterEndISO = todayLocalISO()"
                    title="End = today"
                  >
                    Today
                  </button>
                </div>
                <input
                  ref="endPickerRef"
                  v-model="dateFilterEndISO"
                  type="date"
                  class="sr-only absolute opacity-0 pointer-events-none"
                  tabindex="-1"
                  aria-hidden="true"
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
                <label class="label"
                  ><span class="label-text">Chart Type</span></label
                >
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
                <label class="label"
                  ><span class="label-text">Group By</span></label
                >
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
                <label class="label"
                  ><span class="label-text">Categories</span></label
                >
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
                    />
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
                    />
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
                    />
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
              />
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

/** ===================== README / About ===================== */
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
    // keeping static HTML content for now
    aboutHtml.value = `
      <h2>AniFi - MVP_Ver1.3</h2>
      </br>
      <h3>Does not read any personal finances; everything is stored locally on your own machine and only reads in your own local browser!!!</h3>
      </br>
      <h3>As of 2025 currently Supports* - Westpac✅ | Nab✅ | ANZ✅ | CommBank✅ | St Geroge✅ | ING✅ | Macquarie✅ | Up Bank✅ | UBank✅
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
    // same fallback as before
    aboutHtml.value = `
      <h2>AniFi - MVP_Ver1.01</h2>
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
  } finally {
    loadingAbout.value = false;
  }
}

/** ===================== Types ===================== */
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
  endDate?: string;
}

type BankId =
  | "ING"
  | "UBANK"
  | "WESTPAC"
  | "UPBANK"
  | "MACQUARIE"
  | "COMM_BANK"
  | "ST_GEORGE"
  | "ANZ";

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

/** ===================== Utils ===================== */

// --- date typing helpers ---
function digitsOnly(s = "") {
  return s.replace(/\D/g, "");
}
function formatDDMMProgressive(raw: string) {
  const d = digitsOnly(raw);
  let out = "";
  if (d.length <= 2) return d;
  out = d.slice(0, 2) + "-";
  if (d.length <= 4) return out + d.slice(2);
  out += d.slice(2, 4) + "-";
  return out + d.slice(4, 8);
}
function isLeap(y: number) {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}
function daysInMonthSafe(y: number, m1to12: number) {
  if (m1to12 === 2) return isLeap(y) ? 29 : 28;
  return [4, 6, 9, 11].includes(m1to12) ? 30 : 31;
}

/**
 * Strict date sanitize: only returns valid "dd-mm-yyyy", never clamps.
 * - Rejects day > max for month/year
 * - Rejects month > 12
 * - Accepts 2-digit year, normalizes to yyyy
 */
function finalizeDDMM(raw: string): string {
  if (!raw) return "";
  let s = raw.replace(/[–—.\s/]+/g, "-").trim();

  const digits = s.replace(/\D/g, "");
  if (digits.length === 6 || digits.length === 8) {
    const dd = digits.slice(0, 2);
    const mm = digits.slice(2, 4);
    const yy = digits.slice(4);
    s = `${dd}-${mm}-${yy}`;
  }

  const m = s.match(/^(\d{1,2})-(\d{1,2})-(\d{2}|\d{4})$/);
  if (!m) return "";

  let [, dStr, mStr, yStr] = m;
  let day = Number(dStr);
  let month = Number(mStr);
  let year =
    yStr.length === 2
      ? Number(yStr) >= 70
        ? 1900 + Number(yStr)
        : 2000 + Number(yStr)
      : Number(yStr);

  if (!Number.isFinite(year) || year < 1000 || year > 9999) return "";
  if (month < 1 || month > 12) return "";
  if (day < 1 || day > daysInMonthSafe(year, month)) return "";

  return `${String(day).padStart(2, "0")}-${String(month).padStart(
    2,
    "0"
  )}-${year}`;
}

function toNumber(x: any): number {
  if (x === null || x === undefined) return 0;
  const s = String(x).replace(/(?<!e)[, ]/gi, "");
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

function parseAusDateToISO(input: string): string {
  const s = (input || "").trim().replace(/\s+/g, " ");
  if (/^\d{1,2}\s+[A-Za-z]{3,}\s+\d{2,4}$/.test(s)) {
    const d = new Date(Date.parse(s));
    return isNaN(+d) ? "" : d.toISOString();
  }
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

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out.map((s) => s.replace(/^"|"$/g, "").trim());
}

/** ===================== Bank detection ===================== */
function detectBankByHeaders(headers: string[]): BankId | null {
  const H = headers.map((h) => h.trim().toLowerCase());

  if (
    H.includes("transaction date") &&
    H.includes("details") &&
    H.includes("debit") &&
    H.includes("credit")
  )
    return "MACQUARIE";

  if (
    headers.length === 4 &&
    !H.some((h) => /(date|amount|description|balance)/.test(h))
  )
    return "COMM_BANK";
  if (["date", "amount", "description", "balance"].every((k) => H.includes(k)))
    return "COMM_BANK";

  if (H.includes("debit") && H.includes("credit") && H.includes("subcategory"))
    return "ST_GEORGE";

  if (
    H.includes("bank account") &&
    H.includes("narrative") &&
    H.includes("debit amount") &&
    H.includes("credit amount")
  )
    return "WESTPAC";

  if (H.includes("date") && H.includes("amount") && H.includes("description"))
    return "ANZ";

  return null;
}

/** ===================== Bank parsers ===================== */
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
      amount: credit - debit,
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
function parseANZ(rows: Record<string, string>[]): UnifiedTx[] {
  return rows.map((r) => {
    const dateRaw = r["Date"] ?? "";
    const amt = toNumber(r["Amount"]);
    const desc = (r["Description"] || "").trim();
    const balance =
      r["Balance"] != null && r["Balance"] !== ""
        ? toNumber(r["Balance"])
        : null;
    return {
      bank: "ANZ",
      dateISO: parseAusDateToISO(dateRaw),
      dateRaw,
      description: desc || "ANZ Transaction",
      amount: amt,
      debit: amt < 0 ? Math.abs(amt) : 0,
      credit: amt > 0 ? amt : 0,
      balance,
      account: null,
      category: null,
      subCategory: null,
      original: null,
    };
  });
}

/** ===================== Normalizer ===================== */
function normalizeParsedRows(
  headers: string[],
  rows: Record<string, string>[],
  forcedBank?: BankId | null
): UnifiedTx[] {
  const bank = forcedBank ?? detectBankByHeaders(headers);
  switch (bank) {
    case "MACQUARIE":
      return parseMacquarie(rows);
    case "COMM_BANK":
      return parseCommBank(rows);
    case "ST_GEORGE":
      return parseStGeorge(rows);
    case "WESTPAC":
      return parseWestpac(rows);
    case "ANZ":
      return parseANZ(rows);
    default:
      return [];
  }
}

/** ===================== Categories ===================== */
const restaurantAndTakeawayNames = ["MCDONALD", "KFC", "SUBWAY", "Dominos"];
const transportAndParkingNames = ["TRANSPORTFORNSW"];
const donationNames = ["RMHCSYDNEY"];
const afterpayNames = ["Afterpay"];
const groceryNames = ["WOOLWORTHS", "COLES", "ALDI"];
const investmentNames = ["COMMSEC"];
const transfersNames: string[] = [];
const vehicleExpenseNames = [" AUTO"];
const billAndServiceNames = ["ActewAGL"];
const BNPLNames: string[] = [];
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
const hobbyNames: string[] = [];
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

/** ===================== Theme ===================== */
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

/** ===================== Navigation ===================== */
const activeTab = ref<"import" | "add" | "chart" | "transactions" | "about">(
  "import"
);
const tabs = [
  { id: "import", label: "Import", icon: "📥" },
  { id: "add", label: "Add Transaction", icon: "➕" },
  { id: "chart", label: "Chart", icon: "📊" },
  { id: "transactions", label: "Transactions", icon: "📋" },
  { id: "about", label: "About", icon: "ℹ️" },
];

/** ===================== Data ===================== */
const transactions = ref<Transaction[]>([]);
const categories = computed(() => {
  const s = new Set<string>();
  transactions.value.forEach((t) => s.add(t.category));
  return Array.from(s).sort();
});

/** ===================== Import ===================== */
const importUrl = ref("");
const importStatus = ref("");
const debugInfo = ref("");

const categoryCache = new Map<string, string>();
function categorizeTransaction(description?: string): string {
  const desc = (description || "No Name").trim();
  if (categoryCache.has(desc)) return categoryCache.get(desc)!;
  const lower = desc.toLowerCase();
  for (let i = 0; i < sortArr.length; i++) {
    for (const keyword of sortArr[i]) {
      if (lower.includes(keyword.toLowerCase())) {
        const cat = categoryNames[i];
        categoryCache.set(desc, cat);
        return cat;
      }
    }
  }
  categoryCache.set(desc, "Uncategorized");
  return "Uncategorized";
}

function parseTransactionDate(dateStr: string, bankType: string): string {
  if (!dateStr) return todayLocalISO();
  const isoFromDDMM = ddmmyyyyToISO(dateStr);
  if (isoFromDDMM) return isoFromDDMM;

  try {
    let parsedDate = "";
    if (bankType === "upbank") {
      parsedDate = dateStr.split("T")[0];
    } else if (dateStr.includes("/")) {
      const parts = dateStr.split("/");
      if (parts.length === 3) {
        const day = parts[0].padStart(2, "0");
        const month = parts[1].padStart(2, "0");
        const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
        parsedDate = `${year}-${month}-${day}`;
      }
    } else if (dateStr.includes(" ")) {
      const parts = dateStr.split(" ");
      if (parts.length === 3) {
        const day = parts[0].padStart(2, "0");
        const month =
          monthsLetters[parts[1] as keyof typeof monthsLetters] || "01";
        const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
        parsedDate = `${year}-${month}-${day}`;
      }
    } else if (dateStr.includes("-")) {
      parsedDate = dateStr;
    }
    if (!isNaN(new Date(parsedDate).getTime())) return parsedDate;
  } catch {}
  return todayLocalISO();
}

function parseCSV(csvText: string) {
  try {
    importStatus.value = "Parsing CSV data...";
    const lines = csvText
      .replace(/\r/g, "\n")
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
    if (lines.length < 2) {
      importStatus.value = "CSV file appears to be empty or invalid";
      return;
    }

    let rawHeader = splitCsvLine(lines[0]);
    let headers = rawHeader.map((h) => h.replace(/^"|"$/g, "").trim());
    const firstLooksDate =
      /^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(headers[0]) ||
      /^[0-9-]{8,10}$/.test(headers[0]);
    let forcedBank: BankId | null = null;

    if (firstLooksDate && headers.length === 4) {
      headers = ["Date", "Amount", "Description", "Balance"];
      forcedBank = "COMM_BANK";
    }
    if (firstLooksDate && headers.length >= 3 && !forcedBank) {
      headers = ["Date", "Amount", "Description"].concat(headers.slice(3));
      forcedBank = "ANZ";
    }

    const rowsObj: Record<string, string>[] = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = splitCsvLine(lines[i]);
      if (cols.length === 0) continue;
      const o: Record<string, string> = {};
      headers.forEach((h, idx) => {
        o[h] = (cols[idx] ?? "").replace(/^"|"$/g, "").trim();
      });
      rowsObj.push(o);
    }

    const unified = normalizeParsedRows(headers, rowsObj, forcedBank);

    if (unified.length === 0) {
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
        const cols = splitCsvLine(lines[i]);
        if (cols.length <= Math.max(dateIndex, descIndex, amtIndex)) continue;
        const rawDate = cols[dateIndex]?.trim() || "";
        const desc =
          (cols[descIndex] || "").replace(/"/g, "").trim() || "Unknown";
        const amount = Math.abs(
          parseFloat((cols[amtIndex] || "").replace(/[^-\d.]/g, "")) || 0
        );
        if (amount > 0) {
          transactions.value.push({
            id: Date.now().toString() + importedCount,
            date: parseTransactionDate(rawDate, "generic"),
            type: "spending",
            amount,
            category: categorizeTransaction(desc),
            description: desc,
            recurring: false,
          });
          importedCount++;
        }
      }
      importStatus.value = `Successfully imported ${importedCount} transactions`;
      debugInfo.value = `Detected via headers: generic`;
      return;
    }

    let imported = 0;
    for (const u of unified) {
      const iso = u.dateISO
        ? u.dateISO.slice(0, 10)
        : parseTransactionDate(u.dateRaw, "generic");
      let type: TransactionType = "spending";
      let amountAbs = Math.abs(u.amount);

      if (u.amount < 0) {
        type = "income";
        amountAbs = Math.abs(u.amount);
      } else if (u.amount === 0 && u.debit > 0) {
        type = "spending";
        amountAbs = u.debit;
      } else if (u.amount === 0 && u.credit > 0) {
        type = "income";
        amountAbs = u.credit;
      }

      if (amountAbs > 0) {
        const desc = u.description || u.original || "Unknown";
        transactions.value.push({
          id: Date.now().toString() + imported,
          date: iso,
          type,
          amount: amountAbs,
          category: categorizeTransaction(desc),
          description: desc,
          recurring: false,
        });
        imported++;
      }
    }

    importStatus.value = `Successfully imported ${imported} transactions`;
    debugInfo.value = `Detected via headers: ${
      forcedBank ?? detectBankByHeaders(headers) ?? "generic"
    }`;
  } catch (error: any) {
    importStatus.value = "Error parsing CSV: " + error.message;
    debugInfo.value = error.stack || String(error);
    console.error("Error parsing CSV:", error);
  }
}

function handleFileUpload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    parseCSV((e.target?.result as string) || "");
  };
  reader.readAsText(file);
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

/** ===================== Add Transaction form ===================== */

const newTransaction = ref<Transaction>({
  id: "",
  date: todayLocalISO(),
  type: "spending",
  amount: 0,
  category: "",
  description: "",
  recurring: false,
  frequency: "monthly",
  recursions: 1,
  endDate: "",
});
const addDateTextRef = ref<HTMLInputElement | null>(null);
const newTxDateError = ref("");
const currentlyEditingId = ref<string | null>(null);
const addDatePickerRef = ref<HTMLInputElement | null>(null);

// ISO backing store (native date input uses ISO)
const newTxDateISO = computed<string>({
  get() {
    return newTransaction.value.date || todayLocalISO();
  },
  set(v: string) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) newTransaction.value.date = v;
  },
});

// Visible dd-mm-yyyy text with live formatting/sanitizing
const newTxDateText = ref(isoToDDMMYYYY(newTransaction.value.date));
watch(newTxDateISO, (iso) => {
  newTxDateText.value = isoToDDMMYYYY(iso) || "";
});
function onAddDateInput(e: Event) {
  newTxDateError.value = ""; // clear feedback while typing
  newTxDateText.value = formatDDMMProgressive(
    (e.target as HTMLInputElement).value
  );
  // also clear any previous native validity message
  addDateTextRef.value?.setCustomValidity?.("");
}

function onAddDateBlur() {
  newTxDateError.value = ""; // reset
  const ddmmyyyy = finalizeDDMM(newTxDateText.value);

  if (ddmmyyyy) {
    const iso = ddmmyyyyToISO(ddmmyyyy);
    if (iso) {
      newTxDateText.value = ddmmyyyy;
      newTxDateISO.value = iso; // keep model in sync
      addDateTextRef.value?.setCustomValidity?.("");
      return;
    }
  }

  // INVALID → clear text and backing ISO, set error, and show native bubble
  newTxDateText.value = "";
  newTxDateISO.value = ""; // <- important: prevents stale valid date
  newTxDateError.value =
    "Please enter a valid date in dd-mm-yyyy (e.g. 05-01-2025).";
  addDateTextRef.value?.setCustomValidity?.(newTxDateError.value);
  addDateTextRef.value?.reportValidity?.();
}
function onDateKeydownDigitsOnly(e: KeyboardEvent) {
  const allowed = [
    "Backspace",
    "Delete",
    "ArrowLeft",
    "ArrowRight",
    "Tab",
    "-",
  ];
  if (allowed.includes(e.key)) return;
  if (!/^\d$/.test(e.key)) e.preventDefault();
}
function openAddCalendar() {
  const el = addDatePickerRef.value;
  if (!el) return;
  (el as any).showPicker?.();
  if (!(el as any).showPicker) el.click();
}
function setAddDateToday() {
  newTxDateISO.value = todayLocalISO();
}

function addTransaction() {
  if (newTransaction.value.amount <= 0 || !newTransaction.value.category)
    return;

  if (currentlyEditingId.value) {
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
      const isoDate = toLocalISO(date);
      if (endDate && date > endDate) break;
      newTxs.push({
        ...base,
        id: base.id + "-" + i,
        date: isoDate,
        endDate: newTransaction.value.endDate || "",
      });
      if (freq === "monthly") date.setMonth(date.getMonth() + 1);
      else if (freq === "quarterly") date.setMonth(date.getMonth() + 3);
      else if (freq === "yearly") date.setFullYear(date.getFullYear() + 1);
      else {
        const addDays = freq === "weekly" ? 7 : freq === "fortnightly" ? 14 : 1;
        date = new Date(date.getTime() + addDays * 24 * 60 * 60 * 1000);
      }
      i++;
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
    date: todayLocalISO(),
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

/** ===================== Date filtering ===================== */
const dateFilter = ref({ start: "", end: "" });
const startPickerRef = ref<HTMLInputElement | null>(null);
const endPickerRef = ref<HTMLInputElement | null>(null);

const dateFilterStartISO = computed<string>({
  get() {
    return dateFilter.value.start || "";
  },
  set(v: string) {
    dateFilter.value.start = v || "";
  },
});
const dateFilterEndISO = computed<string>({
  get() {
    return dateFilter.value.end || "";
  },
  set(v: string) {
    dateFilter.value.end = v || "";
  },
});

// Visible text + handlers (moved below ISO computeds)
const dateFilterStartText = ref("");
const dateFilterEndText = ref("");
watch(
  dateFilterStartISO,
  (iso) => (dateFilterStartText.value = iso ? isoToDDMMYYYY(iso) : "")
);
watch(
  dateFilterEndISO,
  (iso) => (dateFilterEndText.value = iso ? isoToDDMMYYYY(iso) : "")
);
function onStartInput(e: Event) {
  dateFilterStartText.value = formatDDMMProgressive(
    (e.target as HTMLInputElement).value
  );
}
function onStartBlur() {
  const ddmmyyyy = finalizeDDMM(dateFilterStartText.value);
  if (ddmmyyyy) dateFilterStartISO.value = ddmmyyyyToISO(ddmmyyyy) || "";
  dateFilterStartText.value = ddmmyyyy || "";
}
function onEndInput(e: Event) {
  dateFilterEndText.value = formatDDMMProgressive(
    (e.target as HTMLInputElement).value
  );
}
function onEndBlur() {
  const ddmmyyyy = finalizeDDMM(dateFilterEndText.value);
  if (ddmmyyyy) dateFilterEndISO.value = ddmmyyyyToISO(ddmmyyyy) || "";
  dateFilterEndText.value = ddmmyyyy || "";
}

function openStartCalendar() {
  startPickerRef.value?.showPicker?.() ?? startPickerRef.value?.click();
}
function openEndCalendar() {
  endPickerRef.value?.showPicker?.() ?? endPickerRef.value?.click();
}
function setRangeToday() {
  const t = todayLocalISO();
  dateFilterStartISO.value = t;
  dateFilterEndISO.value = t;
}

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
const applyDatePreset = (preset: any) => {
  selectedDatePreset.value = preset.label;
  const today = new Date();
  switch (preset.type) {
    case "month":
      dateFilter.value.start = toLocalISO(
        new Date(today.getFullYear(), today.getMonth(), 1)
      );
      dateFilter.value.end = toLocalISO(
        new Date(today.getFullYear(), today.getMonth() + 1, 0)
      );
      break;
    case "lastMonth":
      dateFilter.value.start = toLocalISO(
        new Date(today.getFullYear(), today.getMonth() - 1, 1)
      );
      dateFilter.value.end = toLocalISO(
        new Date(today.getFullYear(), today.getMonth(), 0)
      );
      break;
    case "year":
      dateFilter.value.start = toLocalISO(new Date(today.getFullYear(), 0, 1));
      dateFilter.value.end = toLocalISO(new Date(today.getFullYear(), 11, 31));
      break;
    case "lastYear":
      dateFilter.value.start = toLocalISO(
        new Date(today.getFullYear() - 1, 0, 1)
      );
      dateFilter.value.end = toLocalISO(
        new Date(today.getFullYear() - 1, 11, 31)
      );
      break;
    case "all":
      dateFilter.value.start = "";
      dateFilter.value.end = "";
      break;
    default:
      const startDate = new Date(
        today.getTime() - preset.days * 24 * 60 * 60 * 1000
      );
      dateFilter.value.start = toLocalISO(startDate);
      dateFilter.value.end = toLocalISO(today);
  }
};
const resetDateFilter = () => {
  applyDatePreset(datePresets.find((p) => p.label === "All Time"));
};
const formatDateRange = () => {
  if (!dateFilter.value.start || !dateFilter.value.end) return "All time";
  const start = dateFromISOLocal(dateFilter.value.start)!;
  const end = dateFromISOLocal(dateFilter.value.end)!;
  const diffDays = Math.ceil(Math.abs(+end - +start) / 86_400_000);
  return `${formatDate(dateFilter.value.start)} - ${formatDate(
    dateFilter.value.end
  )} (${diffDays} days)`;
};

/** ===================== Chart ===================== */
const chartConfig = ref({ type: "line", groupBy: "monthly" });
const selectedCategories = ref<string[]>([]);
const chartCanvas = ref<HTMLCanvasElement | null>(null);
let chartInstance: any = null;

const toggleCategory = (category: string) => {
  const index = selectedCategories.value.indexOf(category);
  if (index > -1) selectedCategories.value.splice(index, 1);
  else selectedCategories.value.push(category);
};
const selectAllCategories = () =>
  (selectedCategories.value = [...categories.value]);
const unselectAllCategories = () => (selectedCategories.value = []);

const searchQuery = ref("");
const typeFilter = ref<TransactionType | "">("");
const sortField = ref<"date" | "type" | "amount" | "category">("date");
const sortOrder = ref<"asc" | "desc">("desc");
const selectedTransactions = ref<number[]>([]);
const currentPage = ref(1);
const itemsPerPage = 20;

const calculatedEndDate = computed(() => {
  if (!newTransaction.value.recurring) return null;
  const freq = newTransaction.value.frequency || "monthly";
  const recursions = newTransaction.value.recursions || 1;

  const start = dateFromISOLocal(newTransaction.value.date);
  if (!start) return null;

  const endDate = new Date(start);
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
  return toLocalISO(endDate);
});

const filteredTransactions = computed(() => {
  let filtered = transactions.value.slice();

  if (dateFilter.value.start && dateFilter.value.end) {
    const start =
      dateFromISOLocal(dateFilter.value.start)?.getTime() ?? -Infinity;
    const end = dateFromISOLocal(dateFilter.value.end)?.getTime() ?? Infinity;
    filtered = filtered.filter((t) => {
      const d = dateFromISOLocal(t.date)?.getTime() ?? 0;
      return d >= start && d <= end;
    });
  }
  // other filters can follow...
  return filtered;
});

const paginatedTransactions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredTransactions.value.slice(start, start + itemsPerPage);
});
const totalPages = computed(() =>
  Math.ceil(filteredTransactions.value.length / itemsPerPage)
);
const allSelected = computed(
  () =>
    paginatedTransactions.value.length > 0 &&
    paginatedTransactions.value.every((_, index) =>
      selectedTransactions.value.includes(
        index + (currentPage.value - 1) * itemsPerPage
      )
    )
);

// Stats
const incomeTransactions = computed(() =>
  filteredTransactions.value.filter((t) => t.type === "income")
);
const expenseTransactions = computed(() =>
  filteredTransactions.value.filter((t) => t.type === "spending")
);
const totalIncome = computed(() =>
  incomeTransactions.value.reduce((s, t) => s + t.amount, 0)
);
const totalExpenses = computed(() =>
  expenseTransactions.value.reduce((s, t) => s + t.amount, 0)
);
const netBalance = computed(() => totalIncome.value - totalExpenses.value);

// Chart data
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
    const categoryTotals: Record<string, number> = {};
    for (const t of filtered) {
      if (t.type === "spending")
        categoryTotals[t.category] =
          (categoryTotals[t.category] || 0) + t.amount;
    }
    return {
      labels: Object.keys(categoryTotals),
      datasets: [
        {
          data: Object.values(categoryTotals),
          backgroundColor: [
            "#FF6384",
            "#36A2EB",
            "#FFCE56",
            "#4BC0C0",
            "#9966FF",
            "#FF9F40",
            "#C9CBCF",
            "#10B981",
            "#F59E0B",
            "#3B82F6",
            "#EF4444",
            "#6366F1",
            "#22C55E",
            "#14B8A6",
            "#E879F9",
          ],
        },
      ],
    };
  }

  const groups: Record<string, { income: number; spending: number }> = {};
  for (const t of filtered) {
    const d = dateFromISOLocal(t.date) || new Date();
    let key: string;
    switch (chartConfig.value.groupBy) {
      case "daily":
        key = toLocalISO(d);
        break;
      case "weekly": {
        const weekStart = new Date(d);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        key = toLocalISO(weekStart);
        break;
      }
      case "fortnightly": {
        const fortnightStart = new Date(d);
        const dayOfWeek = fortnightStart.getDay();
        const offset = (dayOfWeek + 7) % 14;
        fortnightStart.setDate(fortnightStart.getDate() - offset);
        key = toLocalISO(fortnightStart);
        break;
      }
      case "monthly":
        key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        break;
      case "quarterly":
        key = `${d.getFullYear()}-Q${Math.floor(d.getMonth() / 3) + 1}`;
        break;
      case "yearly":
        key = String(d.getFullYear());
        break;
      default:
        key = toLocalISO(d);
    }
    if (!groups[key]) groups[key] = { income: 0, spending: 0 };
    groups[key][t.type] += t.amount;
  }

  const keys = Object.keys(groups).sort();
  const incomeArr = keys.map((k) => groups[k].income);
  const spendingArr = keys.map((k) => groups[k].spending);

  const balanceArr: number[] = [];
  let running = 0;
  for (let i = 0; i < keys.length; i++) {
    running += (incomeArr[i] || 0) - (spendingArr[i] || 0);
    balanceArr.push(running);
  }

  const asType = chartConfig.value.type;
  return {
    labels: keys,
    datasets: [
      {
        label: "Income",
        data: incomeArr,
        borderColor: "#10B981",
        backgroundColor: "rgba(16,185,129,0.35)",
        type: asType,
        tension: 0.35,
      },
      {
        label: "Spending",
        data: spendingArr,
        borderColor: "#EF4444",
        backgroundColor: "rgba(239,68,68,0.35)",
        type: asType,
        tension: 0.35,
      },
      {
        label: "Balance",
        data: balanceArr,
        borderColor: "#3B82F6",
        backgroundColor: "rgba(59,130,246,0.15)",
        type: asType === "bar" ? "line" : asType,
        pointRadius: 3,
        borderWidth: 3,
        tension: 0.28,
        fill: false,
        hidden: asType === "bar",
      },
    ],
  };
});

/** ===================== Utils / Table helpers ===================== */
function dateFromISOLocal(iso: string): Date | null {
  const m = iso?.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const [, y, mo, d] = m;
  const dt = new Date(Number(y), Number(mo) - 1, Number(d));
  return isNaN(+dt) ? null : dt;
}
function todayLocalISO(): string {
  const d = new Date();
  return toLocalISO(d);
}
function pad2(n: number) {
  return String(n).padStart(2, "0");
}
function toLocalISO(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}
function ddmmyyyyToISO(s: string): string {
  const clean = finalizeDDMM(s);
  if (!clean) return "";
  const [dd, mm, yyyy] = clean.split("-");
  return `${yyyy}-${mm}-${dd}`;
}
function isoToDDMMYYYY(iso: string): string {
  const m = iso?.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return "";
  const [, y, mo, d] = m;
  return `${d}-${mo}-${y}`;
}
function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return isoToDDMMYYYY(dateStr);
  const dt = new Date(dateStr);
  if (isNaN(+dt)) return dateStr;
  return `${pad2(dt.getDate())}-${pad2(dt.getMonth() + 1)}-${dt.getFullYear()}`;
}

const getSortIcon = (field: "date" | "type" | "amount" | "category") => {
  if (sortField.value !== field) return "↕️";
  return sortOrder.value === "asc" ? "↑" : "↓";
};
const updateSort = (field: "date" | "type" | "amount" | "category") => {
  if (sortField.value === field)
    sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
  else {
    sortField.value = field;
    sortOrder.value = "desc";
  }
  currentPage.value = 1;
};
const toggleSelect = (indexOnPage: number) => {
  const actualIndex = indexOnPage + (currentPage.value - 1) * itemsPerPage;
  const i = selectedTransactions.value.indexOf(actualIndex);
  if (i > -1) selectedTransactions.value.splice(i, 1);
  else selectedTransactions.value.push(actualIndex);
};
const toggleSelectAll = () => {
  const pageIndices = paginatedTransactions.value.map(
    (_, i) => i + (currentPage.value - 1) * itemsPerPage
  );
  if (allSelected.value) {
    selectedTransactions.value = selectedTransactions.value.filter(
      (i) => !pageIndices.includes(i)
    );
  } else {
    for (const i of pageIndices)
      if (!selectedTransactions.value.includes(i))
        selectedTransactions.value.push(i);
  }
};
const clearSelection = () => (selectedTransactions.value = []);
const bulkDelete = () => {
  if (!selectedTransactions.value.length) return;
  if (
    confirm(
      `Are you sure you want to delete ${selectedTransactions.value.length} transaction(s)?`
    )
  ) {
    const sorted = [...selectedTransactions.value].sort((a, b) => b - a);
    for (const idx of sorted) transactions.value.splice(idx, 1);
    selectedTransactions.value = [];
  }
};
function editTransaction(transaction: Transaction) {
  newTransaction.value = { ...transaction };
  currentlyEditingId.value = transaction.id;
  activeTab.value = "add";
}
const deleteTransaction = (id: string) => {
  if (confirm("Are you sure you want to delete this transaction?")) {
    const index = transactions.value.findIndex((t) => t.id === id);
    if (index > -1) transactions.value.splice(index, 1);
  }
};

/** ===================== Chart rendering ===================== */
const renderChart = async () => {
  if (!chartCanvas.value || chartData.value.labels.length === 0) return;
  if (chartInstance) chartInstance.destroy();
  const { Chart, registerables } = await import("chart.js");
  Chart.register(...registerables);
  const data = JSON.parse(JSON.stringify(chartData.value));
  if (chartConfig.value.type === "bar")
    data.datasets.forEach((ds: any) => (ds.type = ds.type || "bar"));
  else if (chartConfig.value.type === "line")
    data.datasets.forEach((ds: any) => (ds.type = ds.type || "line"));

  const ctx = chartCanvas.value.getContext("2d");
  chartInstance = new Chart(ctx!, {
    type: chartConfig.value.type as any,
    data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "top" },
        title: { display: true, text: "Financial Analytics" },
        tooltip: {
          callbacks: {
            label: (ctx: any) => {
              const val = Number(ctx.parsed?.y ?? ctx.parsed);
              if (!Number.isFinite(val)) return ctx.formattedValue;
              return `${ctx.dataset.label}: $${val.toFixed(2)}`;
            },
          },
        },
      },
      scales:
        chartConfig.value.type === "pie" ||
        chartConfig.value.type === "doughnut"
          ? {}
          : {
              y: {
                beginAtZero: true,
                ticks: { callback: (val: any) => `$${Number(val).toFixed(2)}` },
              },
            },
    },
  });
};

/** ===================== Watchers ===================== */
watch(activeTab, (tab) => {
  if (tab === "about" && !aboutHtml.value) fetchAboutMarkdown();
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
watch([chartData, chartConfig], () => nextTick(() => renderChart()), {
  deep: true,
});
watch(
  categories,
  () => {
    if (selectedCategories.value.length === 0)
      selectedCategories.value = [...categories.value];
  },
  { deep: true }
);
watch([searchQuery, typeFilter], () => (currentPage.value = 1));

/** ===================== Lifecycle ===================== */
onMounted(() => {
  const savedTheme = localStorage.getItem("financial-tracker-theme");
  if (savedTheme && availableThemes.includes(savedTheme)) setTheme(savedTheme);
  else
    setTheme(
      window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
    );

  resetDateFilter();
  selectedCategories.value = [...categories.value];

  const savedConfig = localStorage.getItem("financial-tracker-chart-config");
  if (savedConfig) {
    try {
      chartConfig.value = JSON.parse(savedConfig);
    } catch {}
  }

  const savedTransactions = localStorage.getItem(
    "financial-tracker-transactions"
  );
  if (savedTransactions) {
    try {
      transactions.value = JSON.parse(savedTransactions);
    } catch {}
  }

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
