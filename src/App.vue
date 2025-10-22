<template>
  <div class="min-h-screen bg-base-100 transition-colors duration-300">
    <!-- Skip link (WCAG 2.2) -->
    <a href="#main" class="skip-link">Skip to main content</a>

    <!-- Global toasts / announcements -->
    <div
      class="toast toast-top toast-end z-[70]"
      aria-live="polite"
      aria-atomic="true"
    >
      <div
        v-for="t in toasts"
        :key="t.id"
        class="alert"
        :class="{
          'alert-success': t.kind === 'success',
          'alert-info': t.kind === 'info',
          'alert-warning': t.kind === 'warning',
          'alert-error': t.kind === 'error',
        }"
      >
        <span>{{ t.message }}</span>
        <button
          class="btn btn-ghost btn-xs"
          @click="dismissToast(t.id)"
          aria-label="Dismiss notification"
        >
          ✕
        </button>
      </div>
    </div>

    <!-- Header -->
    <header
      class="navbar bg-base-200 shadow-lg sticky top-0 z-50"
      role="banner"
    >
      <div class="navbar-start">
        <h1 class="text-xl font-bold text-primary flex items-center gap-2">
          <span aria-hidden="true">💰</span>
          <span>My Financial Tracker</span>
        </h1>
      </div>

      <nav class="navbar-center hidden lg:flex" aria-label="Primary">
        <div class="tabs tabs-boxed">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            type="button"
            class="tab"
            :class="{ 'tab-active': activeTab === tab.id }"
            @click="onTab(tab.id)"
            :aria-current="activeTab === tab.id ? 'page' : undefined"
          >
            <span aria-hidden="true">{{ tab.icon }}</span>
            <span class="ml-1">{{ tab.label }}</span>
          </button>
        </div>
      </nav>

      <div class="navbar-end">
        <div class="flex items-center gap-2">
          <div class="stats shadow" aria-label="Account balance">
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

          <!-- Accessible Theme picker -->
          <details class="dropdown dropdown-end">
            <summary
              class="btn btn-ghost btn-circle"
              aria-haspopup="menu"
              aria-expanded="false"
              title="Theme"
            >
              🎨 <span class="sr-only">Choose theme</span>
            </summary>
            <ul
              class="dropdown-content z-[60] menu p-2 shadow bg-base-100 rounded-box w-52 max-h-96 overflow-y-auto"
              role="menu"
            >
              <li v-for="theme in availableThemes" :key="theme" role="none">
                <button
                  role="menuitem"
                  class="justify-between"
                  :class="{ active: currentTheme === theme }"
                  @click="setTheme(theme)"
                >
                  {{ theme }}
                  <span v-if="currentTheme === theme" aria-hidden="true"
                    >✓</span
                  >
                </button>
              </li>
            </ul>
          </details>
        </div>
      </div>
    </header>

    <!-- Mobile Navigation -->
    <nav class="btm-nav lg:hidden z-50 shadow-[0_-2px_6px_0px_rgba(0,0,0,0.1)] border-t border-base-300" aria-label="Primary (mobile)">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="{ active: activeTab === tab.id }"
        @click="onTab(tab.id)"
        type="button"
      >
        <span class="text-xs" aria-hidden="true">{{ tab.icon }}</span>
        <span class="btm-nav-label">{{ tab.label }}</span>
      </button>
    </nav>

    <!-- Main -->
    <!-- Main -->
    <main id="main" class="container mx-auto p-4 pb-24 lg:pb-6" role="main">
      <!-- COMBINED: Landing Page / Onboarding Flow -->
      <!-- Get Started / Onboarding -->
      <section
        v-if="showTour"
        class="fixed inset-0 z-[60] bg-base-100/90 backdrop-blur p-4 lg:p-10"
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboardingTitle"
      >
        <div class="max-w-3xl mx-auto">
          <div class="card bg-base-100 shadow-2xl">
            <div class="card-body p-6 lg:p-8 space-y-6">
              <!-- Stepper -->
              <!-- <ol class="steps w-full">
          <li class="step" :class="{ 'step-primary': onboardingStep >= 0 }">Welcome</li>
          <li class="step" :class="{ 'step-primary': onboardingStep >= 1 }">Add data</li>
        </ol> -->

              <!-- Step 0 -->
              <div v-if="onboardingStep === 0" class="text-center space-y-5">
                <h1
                  id="onboardingTitle"
                  class="text-3xl lg:text-4xl font-extrabold"
                >
                  Let’s get your data in
                </h1>
                <p class="text-base-content/70">
                  Pick one of the options below. You can change your mind later.
                </p>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    class="btn btn-primary"
                    @click="startImportFromOnboarding"
                    data-testid="cta-import"
                  >
                    📥 Import Data
                  </button>
                  <button class="btn" @click="startManualAdd">
                    ✍️ Add Transactions Manually
                  </button>
                  <button class="btn btn-outline" @click="confirmDemo">
                    🥳 Try demo data
                  </button>
                </div>
              </div>

              <!-- Step 1: demo confirm -->
              <div
                v-else-if="onboardingStep === 1"
                class="text-center space-y-5"
              >
                <h2 class="text-2xl lg:text-3xl font-bold">Load demo data?</h2>
                <p class="text-base-content/70">
                  We’ll add a realistic sample so you can explore charts and
                  filters.
                </p>
                <div class="flex justify-center gap-3">
                  <button
                    class="btn btn-primary"
                    @click="loadDemoDataAndFinish"
                  >
                    Load & explore
                  </button>
                  <!-- <button class="btn btn-ghost" @click="onboardingStep = 0">
              Cancel
            </button> -->
                </div>
              </div>
            </div>

            <!-- Tour controls -->
            <div class="card-actions justify-between px-6 pb-6 -mt-2">
              <button class="btn btn-ghost btn-sm" @click="handleTourBack">
                ◀ Back
              </button>
              <button class="btn btn-ghost btn-sm" @click="skipTour">
                Skip for now
              </button>
            </div>
          </div>
        </div>
      </section>

      <template v-else>
        <!-- This template now only shows when the tour is not active -->
        <!-- All other sections (Import, Add, Transactions, etc.) go here -->
        <!-- ... (Your existing Import, Add, Chart, Transactions, and other modals) ... -->
        <!-- For example: The empty state hero -->
        <section
          class="hero min-h-[60vh] card bg-base-100 shadow-xl "
          v-if="
            transactions.length === 0 &&
            !['about', 'add', 'import'].includes(activeTab)
          "
        >
          <div class="hero-content text-center">
            <div class="max-w-md">
              <div class="text-8xl mb-6" aria-hidden="true">📊</div>
              <h2 class="text-3xl font-bold">No transactions yet</h2>
              <p class="py-6 text-base-content/70">
                Import your bank data or add a transaction to get started.
              </p>
              <div class="flex flex-wrap gap-4 justify-center">
                <button
                  class="btn btn-primary"
                  @click="startImportFromEmptyState"
                >
                  📥 Import Data
                </button>
                <button class="btn" @click="startManualAdd">
                  ✍️ Add Transactions Manually
                </button>
                <button class="btn btn-outline" @click="loadDemoDataAndFinish">
                  🥳 Load Demo Data
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- 3. IMPROVED: Dismissible Tip Banner (now final onboarding step) -->

        <section
          v-if="showTips && transactions.length > 0 && activeTab === 'add'"
          class="alert alert-info mb-4"
          role="status"
          aria-live="polite"
        >
          <div>
            <h2 class="font-semibold mb-1">Quick start tips:</h2>
            <ol class="list-decimal ml-5 space-y-1">
              <li>
                Use <strong>Smart Filters</strong> like "uber last 30d >20" to
                find transactions quickly.
              </li>
              <li>
                Select multiple rows and use <strong>Bulk Edit</strong> to clean
                up categories.
              </li>
              <li>
                Create <strong>Custom Categories</strong> in the 'Add'
                transaction form.
              </li>
            </ol>
          </div>
          <button class="btn btn-ghost btn-sm" @click="dismissTips">
            Dismiss
          </button>
        </section>

        <!-- If data exists, show the main content -->
        <template v-if="transactions.length > 0">
          <!-- 5. IMPROVED: Transactions with Progressive Disclosure -->
          <section
            v-show="activeTab === 'transactions'"
            class="card bg-base-100 shadow-xl"
            aria-labelledby="txHeading"
          >
            <div class="card-body">
              <!-- 5.1 BETTER VISUAL HIERARCHY -->
              <div class="flex justify-between items-center mb-6">
                <h2 id="txHeading" class="text-2xl font-bold">
                  📋 Transactions ({{ filteredTransactions.length }})
                </h2>
                <!-- 5.4 PROGRESSIVE DISCLOSURE: TOGGLE -->
                <div class="flex flex-wrap gap-2 items-center">
                  <span class="text-sm text-base-content/60">View:</span>
                  <div class="join">
                    <button
                      class="btn btn-sm"
                      :class="{ 'btn-primary': !showAdvancedTransactionsView }"
                      @click="showAdvancedTransactionsView = false"
                    >
                      Simple
                    </button>
                    <button
                      class="btn btn-sm"
                      :class="{ 'btn-primary': showAdvancedTransactionsView }"
                      @click="showAdvancedTransactionsView = true"
                    >
                      Advanced
                    </button>
                  </div>
                </div>
              </div>
              <!-- 5.2 HIDDEN: Irrelevant Controls (in Simple View) -->
              <div
                v-if="showAdvancedTransactionsView"
                class="flex flex-wrap items-center gap-2 mb-4"
              >
                <!-- Smart bulk toolbar -->
                <!-- Income menu -->
                <details class="dropdown">
                  <summary class="btn btn-outline btn-xs" aria-haspopup="menu">
                    💰 Select Income
                  </summary>
                  <ul
                    class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-48"
                    role="menu"
                  >
                    <li>
                      <button
                        role="menuitem"
                        @click="
                          (e) => selectByTypeAndClose('income', 'page', e)
                        "
                      >
                        Current page
                      </button>
                    </li>
                    <li>
                      <button
                        role="menuitem"
                        @click="(e) => selectByTypeAndClose('income', 'all', e)"
                      >
                        All Transactions
                      </button>
                    </li>
                  </ul>
                </details>

                <!-- Spending menu -->
                <details class="dropdown">
                  <summary class="btn btn-outline btn-xs" aria-haspopup="menu">
                    💸 Select Spending
                  </summary>
                  <ul
                    class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-48"
                    role="menu"
                  >
                    <li>
                      <button
                        role="menuitem"
                        @click="
                          (e) => selectByTypeAndClose('spending', 'page', e)
                        "
                      >
                        Current page
                      </button>
                    </li>
                    <li>
                      <button
                        role="menuitem"
                        @click="
                          (e) => selectByTypeAndClose('spending', 'all', e)
                        "
                      >
                        All Transactions
                      </button>
                    </li>
                  </ul>
                </details>

                <details class="dropdown">
                  <summary
                    class="btn btn-outline btn-xs"
                    aria-haspopup="listbox"
                  >
                    📈 Select Large
                  </summary>
                  <div
                    class="dropdown-content card card-compact p-2 bg-base-100 shadow w-72"
                  >
                    <div class="card-body space-y-2">
                      <div class="form-control">
                        <label class="label" for="thresh"
                          ><span class="label-text">Threshold ($)</span></label
                        >
                        <input
                          id="thresh"
                          v-model.number="largeSelect.threshold"
                          type="number"
                          min="1"
                          class="input input-bordered input-sm"
                          placeholder="50"
                        />
                      </div>
                      <div class="form-control">
                        <label class="cursor-pointer label" for="smartIqr">
                          <span class="label-text"
                            >Use smart threshold (IQR on spending)</span
                          >
                          <input
                            id="smartIqr"
                            v-model="largeSelect.smart"
                            type="checkbox"
                            class="checkbox checkbox-sm"
                          />
                        </label>
                      </div>
                      <div class="form-control">
                        <label class="cursor-pointer label" for="pageOnly">
                          <span class="label-text"
                            >Scope is current page (else all filtered)</span
                          >
                          <input
                            id="pageOnly"
                            v-model="largeSelect.pageOnly"
                            type="checkbox"
                            class="checkbox checkbox-sm"
                          />
                        </label>
                      </div>
                      <button
                        class="btn btn-primary btn-sm"
                        @click="selectLarge()"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </details>

                <button
                  class="btn btn-outline btn-xs"
                  @click="openSmartSelect = true"
                >
                  🎯 Smart Select
                </button>
                <button class="btn btn-outline btn-xs" @click="selectSimilar()">
                  ⚡ Select Similar
                </button>
              </div>

              <div class="mb-4">
                <label class="sr-only" for="txSearch">Search everything</label>
                <input
                  id="txSearch"
                  v-model="searchQuery"
                  type="text"
                  class="input input-bordered input-sm w-full"
                  placeholder="Search anything… e.g. “uber tag:ride type:spending >20 last:30d since:2024-01-01 cat:grocery #family src:nab -starbucks”"
                  autocomplete="off"
                />
                <p class="mt-1 text-xs opacity-70">
                  Tips: <code>type:income</code> | <code>cat:grocery</code> |
                  <code>#work</code> | <code>&gt;25</code> |
                  <code>last:30d</code> | <code>since:2024-01-01</code> |
                  <code>date:2024-01..2024-03</code> | <code>src:nab</code> |
                  NOT: <code>-pizza</code>
                </p>
              </div>

              <!-- 5.3 HIDDEN: Bulk Actions until transactions exist -->
              <div
                v-if="
                  showAdvancedTransactionsView &&
                  filteredTransactions.length > 0
                "
                class="flex flex-wrap justify-between items-center mb-3"
              >
                <label
                  class="label cursor-pointer gap-2 text-sm"
                  for="prioritizeSel"
                >
                  <input
                    id="prioritizeSel"
                    type="checkbox"
                    class="checkbox checkbox-xs"
                    v-model="prioritizeSelected"
                  />
                  <span>Prioritize selected on top</span>
                </label>

                <div class="flex flex-wrap gap-2 items-center">
                  <button
                    class="btn btn-accent btn-xs"
                    :disabled="selectedCount === 0"
                    @click="openBulkEdit"
                  >
                    🛠️ Bulk Edit ({{ selectedCount }} selected)
                  </button>
                  <button class="btn btn-ghost btn-xs" @click="clearSelection">
                    ✕ Clear Selection
                  </button>
                  <button class="btn btn-error btn-xs" @click="bulkDelete">
                    🗑️ Delete Selected
                  </button>
                </div>
              </div>

              <!-- Table (empty state handled by the top-level conditional) -->
              <div class="overflow-x-auto">
                <!-- Mobile cards (≤ md) -->
                <div class="grid gap-3 md:hidden">
                  <article
                    v-for="t in paginatedTransactions"
                    :key="t.id"
                    class="p-3 rounded-xl bg-base-200"
                    :id="`tx-${t.id}`"
                  >
                    <div class="flex items-start justify-between">
                      <div>
                        <div class="font-semibold">
                          {{ formatDate(t.date) }}
                        </div>
                        <div class="text-xs opacity-70">
                          {{ t.source || DEFAULT_SOURCE }}
                        </div>
                      </div>
                      <div
                        class="text-right font-bold"
                        :class="
                          t.type === 'income' ? 'text-success' : 'text-error'
                        "
                      >
                        ${{ t.amount.toFixed(2) }}
                      </div>
                    </div>

                    <div class="mt-1 text-sm flex flex-wrap items-center gap-2">
                      <span class="badge badge-outline">{{ t.category }}</span>
                      <span class="opacity-80">{{ t.description }}</span>
                    </div>

                    <div class="mt-2 flex flex-wrap gap-1">
                      <span
                        v-for="tag in t.tags"
                        :key="t.id + '-tag-' + tag"
                        class="badge sm:badge-ghost"
                      >
                        {{ tag }}
                      </span>
                      <span v-if="!t.tags?.length" class="text-xs opacity-50"
                        >No tags</span
                      >
                    </div>

                    <div class="mt-2 flex flex-wrap gap-2 justify-end">
                      <button
                        class="btn btn-ghost btn-xs"
                        @click="editTransaction(t)"
                        aria-label="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        class="btn btn-ghost btn-xs"
                        @click="duplicateTx(t)"
                        aria-label="Duplicate"
                      >
                        📄
                      </button>
                      <button
                        class="btn btn-ghost btn-xs text-error"
                        @click="deleteTransaction(t.id)"
                        aria-label="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </article>
                </div>

                <!-- Desktop table (≥ md) -->
                <div class="overflow-x-auto hidden md:block">
                  <table
                    class="table table-zebra w-full"
                    role="grid"
                    aria-multiselectable="true"
                  >
                    <caption class="sr-only">
                      Transactions table.
                      {{
                        filteredTransactions.length
                      }}
                      results shown{{
                        typeFilter ? " for type " + typeFilter : ""
                      }}.
                    </caption>
                    <colgroup>
                      <col style="width: 2.75rem" />
                      <col style="width: 9rem" />
                      <col style="width: 8rem" />
                      <col style="width: 9rem" />
                      <col style="width: 12rem" />
                      <col />
                      <!-- TAGS -->
                      <col />
                      <!-- DESCRIPTION -->
                      <col style="width: 7.25rem" />
                    </colgroup>
                    <thead>
                      <tr>
                        <th scope="col">
                          <label>
                            <input
                              type="checkbox"
                              class="checkbox checkbox-sm"
                              :checked="allSelected"
                              :indeterminate="
                                someSelectedOnPage && !allSelected
                              "
                              @change="toggleSelectAll"
                              aria-label="Select all on current page"
                            />
                          </label>
                        </th>
                        <th scope="col">
                          <button
                            class="btn btn-ghost btn-xs"
                            @click="updateSort('date')"
                          >
                            Date
                            <span aria-hidden="true">{{
                              getSortIcon("date")
                            }}</span>
                          </button>
                        </th>
                        <th scope="col">
                          <button
                            class="btn btn-ghost btn-xs"
                            @click="updateSort('type')"
                          >
                            Type
                            <span aria-hidden="true">{{
                              getSortIcon("type")
                            }}</span>
                          </button>
                        </th>
                        <th scope="col">
                          <button
                            class="btn btn-ghost btn-xs"
                            @click="updateSort('amount')"
                          >
                            Amount
                            <span aria-hidden="true">{{
                              getSortIcon("amount")
                            }}</span>
                          </button>
                        </th>
                        <th scope="col">
                          <button
                            class="btn btn-ghost btn-xs"
                            @click="updateSort('category')"
                          >
                            Category
                            <span aria-hidden="true">{{
                              getSortIcon("category")
                            }}</span>
                          </button>
                        </th>
                        <th scope="col">Tags</th>
                        <th scope="col">Description</th>
                        <th scope="col" class="text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="(t, i) in paginatedTransactions"
                        :key="t.id"
                        :id="`tx-${t.id}`"
                        :aria-selected="isSelected(t.id) ? 'true' : 'false'"
                        :class="{ 'bg-base-200': isSelected(t.id) }"
                      >
                        <td>
                          <label>
                            <input
                              type="checkbox"
                              class="checkbox checkbox-sm"
                              :checked="isSelected(t.id)"
                              @change="toggleSelectRow(t.id)"
                              :aria-label="`Select transaction on ${formatDate(
                                t.date
                              )} for $${t.amount.toFixed(2)}`"
                            />
                            <span class="sr-only" v-if="isSelected(t.id)"
                              >Selected</span
                            >
                          </label>
                        </td>
                        <td>{{ formatDate(t.date) }}</td>
                        <td>
                          <span
                            class="badge type-badge"
                            :class="
                              t.type === 'income'
                                ? 'badge-success'
                                : 'badge-error'
                            "
                          >
                            {{
                              t.type === "income" ? "💰 Income" : "💸 Spending"
                            }}
                          </span>
                        </td>
                        <td>${{ t.amount.toFixed(2) }}</td>
                        <td>
                          <span class="badge badge-outline">{{
                            t.category
                          }}</span>
                        </td>
                        <td>
                          <div class="flex flex-wrap gap-1">
                            <span
                              v-for="tag in t.tags"
                              :key="t.id + '-tg-' + tag"
                              class="badge sm:badge-ghost"
                              >{{ tag }}</span
                            >
                            <span
                              v-if="!t.tags?.length"
                              class="text-base-content/50"
                              >—</span
                            >
                          </div>
                        </td>
                        <td>{{ t.description }}</td>
                        <td class="whitespace-nowrap text-right">
                          <button
                            class="btn btn-ghost btn-xs"
                            @click="editTransaction(t)"
                            aria-label="Edit"
                          >
                            ✏️
                          </button>
                          <button
                            class="btn btn-ghost btn-xs"
                            @click="duplicateTx(t)"
                            aria-label="Duplicate"
                          >
                            📄
                          </button>
                          <button
                            class="btn btn-ghost btn-xs text-error"
                            @click="deleteTransaction(t.id)"
                            aria-label="Delete"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Pagination -->
              <div
                v-if="totalPages > 1"
                class="flex justify-center mt-6"
                role="navigation"
                aria-label="Pagination"
              >
                <div class="btn-group">
                  <button
                    class="btn btn-sm"
                    :disabled="currentPage === 1"
                    @click="currentPage = 1"
                    aria-label="First page"
                  >
                    «
                  </button>
                  <button
                    class="btn btn-sm"
                    :disabled="currentPage === 1"
                    @click="currentPage--"
                    aria-label="Previous page"
                  >
                    ‹
                  </button>
                  <button class="btn btn-sm btn-active" aria-current="page">
                    Page {{ currentPage }} / {{ totalPages }}
                  </button>
                  <button
                    class="btn btn-sm"
                    :disabled="currentPage === totalPages"
                    @click="currentPage++"
                    aria-label="Next page"
                  >
                    ›
                  </button>
                  <button
                    class="btn btn-sm"
                    :disabled="currentPage === totalPages"
                    @click="currentPage = totalPages"
                    aria-label="Last page"
                  >
                    »
                  </button>
                </div>
              </div>
            </div>
          </section>
        </template>
        <!-- Add Transaction -->
        <section
          v-show="activeTab === 'add'"
          class="card bg-base-100 shadow-xl mb-6"
          aria-labelledby="addHeading"
        >
          <div class="card-body">
            <h2 id="addHeading" class="card-title">➕ Add Transaction</h2>
            <!-- ... (rest of add transaction content) ... -->
            <form
              @submit.prevent="addTransaction"
              class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              <!-- Date -->
              <div class="form-control">
                <label class="label" for="addDate"
                  ><span class="label-text">Date</span></label
                >
                <div class="join w-full">
                  <input
                    id="addDate"
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
                  <button
                    type="button"
                    class="btn btn-outline join-item"
                    @click="openAddCalendar"
                    title="Open calendar"
                    aria-label="Open calendar"
                  >
                    📅
                  </button>
                  <button
                    type="button"
                    class="btn btn-primary join-item"
                    @click="setAddDateToday"
                  >
                    Today
                  </button>
                </div>
                <p
                  v-if="newTxDateError"
                  id="addDateError"
                  class="text-error text-sm mt-1"
                >
                  {{ newTxDateError }}
                </p>
                <input
                  ref="addDatePickerRef"
                  v-model="newTxDateISO"
                  type="date"
                  class="sr-only"
                  tabindex="-1"
                  aria-hidden="true"
                />
              </div>

              <!-- Type -->
              <div class="form-control">
                <label class="label" for="addType"
                  ><span class="label-text">Type</span></label
                >
                <select
                  id="addType"
                  v-model="newTransaction.type"
                  class="select select-bordered"
                  required
                >
                  <option value="income">💰 Income</option>
                  <option value="spending">💸 Spending</option>
                </select>
              </div>

              <!-- Amount -->
              <div class="form-control">
                <label class="label" for="addAmount"
                  ><span class="label-text">Amount</span></label
                >
                <div class="join">
                  <span class="join-item btn btn-disabled" aria-hidden="true"
                    >$</span
                  >
                  <input
                    id="addAmount"
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

              <!-- Category -->
              <label class="label" :for="ids.input">
  <span class="label-text">Category</span>
  <div class="ml-auto flex items-center gap-2">
    <!-- keep a single Manage button -->
    <button
      type="button"
      class="btn btn-ghost btn-xs"
      @click="openManager('manage')"
      aria-haspopup="dialog"
      title="Manage categories and tags"
    >
      <!-- settings-cog -->
      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
        <path d="M19.4 15a1.6 1.6 0 0 0 .32 1.76l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.6 1.6 0 0 0-1.76-.32 1.6 1.6 0 0 0-1 1.47V21a2 2 0 0 1-4 0v-.1a1.6 1.6 0 0 0-1-1.47 1.6 1.6 0 0 0-1.76.32l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.6 1.6 0 0 0 .32-1.76 1.6 1.6 0 0 0-1.47-1H3a2 2 0 0 1 0-4h.1a1.6 1.6 0 0 0 1.47-1 1.6 1.6 0 0 0-.32-1.76l-.06-.06A2 2 0 1 1 7.02 3.5l.06.06a1.6 1.6 0 0 0 1.76.32A1.6 1.6 0 0 0 10.35 2h.1a2 2 0 0 1 4 0v.1a1.6 1.6 0 0 0 1 1.47 1.6 1.6 0 0 0 1.76-.32l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.6 1.6 0 0 0-.32 1.76c.21.5.68.86 1.22.95H21a2 2 0 0 1 0 4h-.1c-.54.09-1 .45-1.22.95Z"/>
      </svg>
      <span class="hidden sm:inline">Manage</span>
    </button>

    <!-- was “Add custom”; now “Manage custom” and opens manage mode -->
    <button
      type="button"
      class="btn btn-outline btn-xs"
      @click="openManager('manage')"
      title="Manage custom categories"
    >
      <!-- plus icon (kept for visual cue) -->
      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M12 5v14M5 12h14" />
      </svg>
      <span class="hidden sm:inline">Manage custom</span>
    </button>
  </div>
</label>

<!-- Manager Modal -->
<dialog
  v-if="showManager"
  class="modal modal-open"
  aria-modal="true"
  role="dialog"
  :aria-labelledby="ids.heading"
>
  <div class="modal-box w-full max-w-4xl max-h-[80vh] overflow-y-auto p-0">
    <!-- Sticky header -->
    <div class="px-4 py-3 bg-base-200 sticky top-0 z-10 flex items-center justify-between">
      <h3 :id="ids.heading" class="font-bold text-lg text-primary">
        Manage Categories &amp; Tags
      </h3>
      <button
        class="btn btn-circle btn-ghost btn-sm"
        @click="closeManager"
        aria-label="Close"
      >
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

      <div class="p-4">
        <!-- Category Search (also sticky-ish) -->
        <div class="form-control mb-4">
          <label class="label">
            <span class="label-text">Search Categories</span>
            <span class="label-text-alt">{{ filteredCategories.length }} categories</span>
          </label>
          <input
            v-model="categorySearch"
            type="text"
            placeholder="Search categories…"
            class="input input-bordered input-sm"
            data-testid="category-search"
          />
        </div>

                      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <!-- Default (read-only) -->
                        <div>
                          <div class="flex justify-between items-center mb-2">
                            <h4 class="font-semibold text-sm">
                              Default Categories
                            </h4>
                            <span class="text-xs text-base-content/60"
                              >({{ defaultCategories.length }})</span
                            >
                          </div>
                          <div
                            class="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-y-auto"
                          >
                            <button
                              v-for="cat in filteredDefaults"
                              :key="cat"
                              type="button"
                              class="badge sm:badge-ghost badge-outline badge-lg justify-between hover:badge-primary transition-colors"
                              :class="{
                                'badge-primary': newTransaction.category === cat,
                              }"
                              @click="selectCategory(cat)"
                            >
                              <span class="truncate">{{ cat }}</span>
                            </button>
                          </div>
                        </div>

                        <!-- Custom (CRUD) -->
                        <div>
                          <div class="flex justify-between items-center mb-2">
                            <h4 class="font-semibold text-sm">Custom Categories</h4>
                            <span class="text-xs text-base-content/60"
                              >({{ customCategories.length }})</span
                            >
                          </div>
                          <div class="space-y-2 max-h-64 overflow-y-auto">
                            <div
                              v-for="cat in filteredCustoms"
                              :key="cat"
                              class="flex items-center gap-2 p-2 bg-base-200 rounded-lg hover:bg-base-300 transition-colors"
                            >
                              <template v-if="editingCategory === cat">
                                <input
                                  ref="editInputRef"
                                  v-model="editingCategoryName"
                                  type="text"
                                  class="input input-bordered input-xs flex-1"
                                  @keyup.enter="saveEditCategory"
                                  @blur="saveEditCategory"
                                  @keyup.esc="cancelEditCategory"
                                  data-testid="category-edit-input"
                                />
                              </template>
                              <template v-else>
                                <span class="flex-1 truncate">{{ cat }}</span>
                                <div class="flex flex-wrap gap-1">
                                  <button
                                    class="btn btn-ghost btn-xs text-primary"
                                    @click="startEditCategory(cat)"
                                    title="Edit"
                                  >
                                    <svg
                                      class="w-4 h-4"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      stroke-width="2"
                                    >
                                      <path
                                        d="M15.232 5.232l3.536 3.536M4 20l3.536-.707L19.475 7.354a2.5 2.5 0 1 0-3.536-3.536L4 15.757 4 20z"
                                      />
                                    </svg>
                                  </button>
                                  <button
                                    class="btn btn-ghost btn-xs text-error"
                                    @click="deleteCustomCategory(cat)"
                                    title="Delete"
                                  >
                                    <svg
                                      class="w-4 h-4"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      stroke-width="2"
                                    >
                                      <path
                                        d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m-1 0v12a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V6m3 4v8m4-8v8"
                                      />
                                    </svg>
                                  </button>
                                </div>
                              </template>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- Add New Category -->
                      <div class="divider">Add New Category</div>
                      <div class="flex flex-wrap gap-2">
                        <input
                          v-model="newCustomName"
                          type="text"
                          class="input input-bordered input-sm flex-1"
                          placeholder="Enter new category name…"
                          @keyup.enter="addCustomCategory"
                          data-testid="new-category-input"
                        />
                        <button
                          class="btn btn-primary btn-sm"
                          @click="addCustomCategory"
                        >
                          Add Category
                        </button>
                      </div>

                      <!-- Tags -->
                      <div class="divider">Manage Tags</div>
                      <div class="form-control mb-4">
                        <label class="label">
                          <span class="label-text">Tags</span>
                          <span class="label-text-alt"
                            >({{ tags.length }} tags)</span
                          >
                        </label>

                        <div class="flex flex-wrap gap-2 mb-2">
                          <div
                            v-for="tag in filteredTags"
                            :key="tag"
                            class="badge badge-primary gap-1"
                          >
                            <span>{{ tag }}</span>
                            <button
                              type="button"
                              class="btn btn-ghost btn-xs text-error"
                              @click="removeTag(tag)"
                              title="Remove tag"
                            >
                              <svg
                                class="w-3 h-3"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                              >
                                <path d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        <div class="join w-full">
                          <input
                            v-model="tagSearch"
                            type="text"
                            placeholder="Search or add new tag…"
                            class="input input-bordered input-sm join-item w-full"
                            @keydown.enter.prevent="addNewTag"
                          />
                          <button
                            class="btn btn-primary btn-sm join-item"
                            @click="addNewTag"
                          >
                            Add Tag
                          </button>
                        </div>
                        <div v-if="tagSuggestions.length" class="mt-2 text-sm">
                          <span class="opacity-70 mr-2">Suggestions:</span>
                          <button
                            v-for="s in tagSuggestions"
                            :key="s"
                            class="btn btn-ghost btn-xs"
                            @click="quickAddTag(s)"
                          >
                            {{ s }}
                          </button>
                        </div>
                      </div>

                      <div class="modal-action">
                        <button class="btn" @click="closeManager">Close</button>
                      </div>
                    </div>
                    <!-- <div class="modal-action">
      <button class="btn" @click="closeManager">Close</button>
    </div> -->
  </div>

                  </dialog>

                  <!-- Tag selector in Add Transaction form (enhanced) -->
                  <!-- Tags (chips + autocomplete) -->
                  <div class="form-control">
                    <label class="label">
                      <span class="label-text">Tags</span>
                      <span class="label-text-alt"
                        >Type and press Enter (or comma)</span
                      >
                    </label>

                    <!-- Current tags -->
                    <div class="flex flex-wrap gap-2 mb-2">
                      <span
                        v-for="tag in newTransaction.tags"
                        :key="tag"
                        class="badge badge-primary gap-1"
                      >
                        <span>{{ tag }}</span>
                        <button
                          type="button"
                          class="btn btn-ghost btn-xs text-error"
                          @click="removeTagFromTransaction(tag)"
                          aria-label="Remove tag"
                        >
                          <svg
                            class="w-3 h-3"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                          >
                            <path d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                      <span
                        v-if="!newTransaction.tags.length"
                        class="text-xs opacity-60"
                        >No tags yet</span
                      >
                    </div>



        <!-- Category Combobox -->
        <div class="relative">
          <input
            :id="ids.input"
            v-model="query"
            type="text"
            class="input input-bordered w-full pr-20"
            :placeholder="placeholder"
            role="combobox"
            :aria-expanded="String(open)"
            :aria-controls="ids.listbox"
            :aria-activedescendant="open ? activeId : undefined"
            aria-autocomplete="list"
            autocomplete="off"
            @focus="open = true"
            @input="handleInput"
            @keydown.down.prevent="moveActive(1)"
            @keydown.up.prevent="moveActive(-1)"
            @keydown.enter.prevent="handleEnter"
            @keydown.esc.prevent="closeDropdown"
          />

          <!-- Clear button -->
          <button
            v-if="query"
            type="button"
            class="btn btn-ghost btn-xs absolute right-14 top-1/2 -translate-y-1/2"
            @click="query=''; open=true; activeIndex = showCreateOption ? -1 : 0"
            aria-label="Clear search"
            title="Clear"
          >✕</button>

          <!-- Current selection check (readonly visual) -->
          <span
            v-if="newTransaction.category"
            class="badge sm:badge-ghost absolute right-2 top-1/2 -translate-y-1/2 max-w-[8rem] truncate"
            title="Selected category"
          >
            {{ newTransaction.category }}
          </span>

          <!-- Options -->
          <ul
            v-show="open"
            class="menu menu-sm bg-base-100 rounded-box shadow absolute z-40 w-full mt-1 max-h-56 overflow-auto"
            role="listbox"
            :id="ids.listbox"
          >
            <!-- Create option -->
            <li v-if="showCreateOption">
              <button type="button" role="option" @mousedown.prevent="createCustomFromQuery()">
                ➕ Create “{{ trimmedQuery }}”
              </button>
            </li>

            <!-- Existing categories (highlighted matches) -->
            <li v-for="(c, i) in filteredAllCategories" :key="c">
              <button
                type="button"
                role="option"
                :id="optionId(i)"
                :aria-selected="activeIndex === i"
                class="justify-between"
                @mousedown.prevent="selectCategory(c)"
              >
                <span v-html="highlight(c, trimmedQuery)"></span>
                <span v-if="newTransaction.category === c" aria-hidden="true">✓</span>
              </button>
            </li>

            <!-- Empty state -->
            <li v-if="!showCreateOption && !filteredAllCategories.length" class="px-3 py-2 opacity-60">
              No matches. Press Enter to create “{{ trimmedQuery }}”.
            </li>
          </ul>

          <!-- Helper text -->
          <p class="mt-1 text-xs opacity-70">
            Tip: type to search, <kbd>↑/↓</kbd> to navigate, <kbd>Enter</kbd> to select.
          </p>

          <!-- Recently used (quick chips) -->
          <div v-if="recentCategories.length && !trimmedQuery" class="mt-2 flex flex-wrap gap-1">
            <button
              v-for="rc in recentCategories"
              :key="rc"
              type="button"
              class="badge sm:badge-ghost hover:badge-primary"
              @click="selectCategory(rc)"
            >
              {{ rc }}
            </button>
          </div>
        </div>

                <!-- Quick add from existing -->
                <label class="label">
                  <span class="label-text-alt">Tap to add from existing</span>
                </label>
                <div class="flex flex-wrap gap-1">
                  <button
                    v-for="t in tags"
                    :key="t"
                    type="button"
                    class="badge sm:badge-ghost hover:badge-primary"
                    @click="addTagToTransaction(t)"
                  >
                    {{ t }}
                  </button>
                </div>
              </div>

              <!-- Description -->
              <div class="form-control">
                <label class="label" for="addDesc"
                  ><span class="label-text">Description (Optional)</span></label
                >
                <input
                  id="addDesc"
                  v-model="newTransaction.description"
                  type="text"
                  placeholder="Transaction description"
                  class="input input-bordered"
                />
              </div>

              <!-- Recurring -->
              <div class="form-control">
                <label class="label cursor-pointer" for="addRecurring">
                  <span class="label-text">Recurring Transaction</span>
                  <input
                    id="addRecurring"
                    v-model="newTransaction.recurring"
                    type="checkbox"
                    class="checkbox"
                  />
                </label>
                <div v-if="newTransaction.recurring" class="space-y-2">
                  <label class="sr-only" for="addFreq">Frequency</label>
                  <select
                    id="addFreq"
                    v-model="newTransaction.frequency"
                    class="select select-bordered select-sm"
                    aria-describedby="recurringHelp"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="fortnightly">Fortnightly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>

                  <label class="sr-only" for="addRecursions"
                    >Number of occurrences</label
                  >
                  <input
                    id="addRecursions"
                    v-model.number="newTransaction.recursions"
                    type="number"
                    min="1"
                    max="365"
                    placeholder="Number of occurrences"
                    class="input input-bordered input-sm"
                    aria-describedby="recurringHelp"
                  />

                  <!-- Live end date (WCAG: polite updates) -->
                  <p
                    id="recurringHelp"
                    class="text-xs text-base-content/70"
                    aria-live="polite"
                  >
                    Starts
                    <strong>{{ formatDate(newTransaction.date) }}</strong
                    >.
                    <span v-if="derivedEndDateISO">
                      Ends
                      <strong>{{ formatDate(derivedEndDateISO) }}</strong>
                      after
                      <strong>{{
                        Math.max(1, Number(newTransaction.recursions || 1))
                      }}</strong>
                      occurrence{{
                        Math.max(1, Number(newTransaction.recursions || 1)) ===
                        1
                          ? ""
                          : "s"
                      }}
                      ({{ newTransaction.frequency }}).
                    </span>
                  </p>
                </div>
              </div>

              <!-- Submit -->
              <div class="form-control md:col-span-2 lg:col-span-1">
                <label class="label"
                  ><span class="label-text">&nbsp;</span></label
                >
                <div class="join">
                  <button type="submit" class="btn btn-primary join-item">
                    {{ currentlyEditingId ? "Update" : "Add" }} Transaction
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
        <!-- Import / Export -->
        <section
          v-show="activeTab === 'import'"
          class="card bg-base-100 shadow-xl mb-6"
          aria-labelledby="importExportHeading"
        >
          <div class="card-body">
            <h2 id="importExportHeading" class="card-title">
              📥 Import / 📤 Export
            </h2>
            <!-- ... (rest of import/export content) ... -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- Importers -->
              <div class="space-y-6">
                <!-- File upload -->
                <div class="form-control">
                  <label class="label" for="csvUpload"
                    ><span class="label-text">Upload CSV File</span></label
                  >
                  <input
                    id="csvUpload"
                    type="file"
                    accept=".csv"
                    multiple
                    class="file-input file-input-bordered w-full"
                    @change="handleFileUpload"
                    ref="csvInputRef"
                  />

                  <p class="text-xs text-base-content/60 mt-1">
                    After upload you’ll be prompted to label the import (e.g.,
                    “ING Everyday - May 2025”).
                  </p>
                </div>

                <!-- URL / Share code -->
                <div class="form-control">
                  <label class="label" for="importUrl"
                    ><span class="label-text"
                      >Import from URL or Share Code</span
                    ></label
                  >
                  <div class="join">
                    <input
                      id="importUrl"
                      v-model="importUrl"
                      type="text"
                      inputmode="url"
                      autocapitalize="off"
                      autocorrect="off"
                      placeholder="https://... or share code (tx:...)"
                      class="input input-bordered join-item flex-1"
                    />
                    <button
                      class="btn btn-primary join-item"
                      @click="importFromUrlOrCode"
                    >
                      Import
                    </button>
                  </div>
                  <p class="text-xs text-base-content/60 mt-1">
                    Tip: Paste a link with <code>?tx=...</code> or just the
                    share code (starts with <code>tx:</code>).
                  </p>
                </div>

                <!-- Clipboard & Current URL -->
                <div class="flex flex-wrap gap-2">
                  <button
                    class="btn btn-error btn-sm"
                    @click="clearAllTransactions"
                  >
                    🧨 Remove all transactions
                  </button>
                </div>

                <!-- QR Scanner -->
                <div v-if="scanning" class="card bg-base-200 shadow-inner p-3">
                  <div class="flex items-center justify-between">
                    <h3 class="font-semibold">Scanning QR…</h3>
                    <button
                      class="btn btn-ghost btn-sm"
                      @click="stopQrScan"
                      aria-label="Stop scanning"
                    >
                      ✕
                    </button>
                  </div>
                  <video
                    ref="qrVideo"
                    class="w-full rounded-lg mt-2"
                    autoplay
                    playsinline
                    muted
                  ></video>
                  <p class="text-xs mt-2 text-base-content/70">
                    Point your camera at a QR generated by this app. We’ll
                    auto-import on detection.
                  </p>
                </div>
              </div>

              <!-- Exporters -->
              <div class="space-y-6">
                <!-- Share code -->
                <div class="form-control">
                  <label class="label" for="shareCode"
                    ><span class="label-text"
                      >Share Code (compact, paste anywhere)</span
                    >
                    <p class="text-xs text-base-content/60 mt-1">
                      Length:
                      <strong>{{ shareCodeLength }}</strong> characters.
                      <span v-if="shareCodeLength > SHARE_URL_SAFE_LIMIT">
                        (Tip: Use JSON export for very large datasets.)
                      </span>
                    </p>
                  </label>
                  <div class="join">
                    <input
                      id="shareCode"
                      :value="shareCode"
                      readonly
                      class="input input-bordered join-item flex-1 font-mono"
                    />
                    <button class="btn join-item" @click="copy(shareCode)">
                      Copy
                    </button>
                  </div>
                  <p class="text-xs text-base-content/60 mt-1">
                    Paste into the “Import from URL or Share Code” box.
                  </p>
                </div>

                <!-- <div class="form-control">
                    <label class="label"
                      ><span class="label-text">QR Code</span></label
                    >
                    <div class="flex items-center gap-2">
                      <button class="btn btn-outline btn-sm" @click="renderQr">
                        Generate
                      </button>
                      <button class="btn btn-ghost btn-sm" @click="clearQr">
                        Clear
                      </button>
                    </div>
                    <canvas
                      ref="qrCanvas"
                      class="mt-3 max-w-[280px]"
                      role="img"
                      aria-label="QR code for the share link"
                    ></canvas>
                    <div class="text-xs text-error mt-1" v-if="qrError">
                      {{ qrError }}
                    </div>
                  </div> -->
                <!-- JSON Export / Import -->
                <div class="form-control">
                  <label class="label"
                    ><span class="label-text">JSON Export / Import</span></label
                  >
                  <div class="flex flex-wrap gap-2 items-center">
                    <button
                      class="btn btn-outline btn-sm"
                      @click="downloadJson()"
                    >
                      ⬇️ Download JSON
                    </button>
                    <label class="btn btn-outline btn-sm">
                      ⬆️ Upload JSON
                      <input
                        type="file"
                        accept="application/json"
                        class="sr-only"
                        @change="handleJsonImport"
                      />
                    </label>
                  </div>
                  <p class="text-xs text-base-content/60 mt-1">
                    Use JSON to transfer large datasets offline without relying
                    on long links.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 4. HIDDEN: Charts Tab Until Data Exists -->
        <section
          v-show="activeTab === 'chart'"
          class="space-y-6"
          aria-labelledby="chartHeading"
        >
          <!-- ... (rest of chart content) ... -->
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <h3 id="chartHeading" class="card-title">📅 Date Filter</h3>

              <div class="flex flex-wrap gap-2 mb-4">
                <button
                  v-for="preset in datePresets"
                  :key="preset.label"
                  class="btn btn-sm"
                  :class="{
                    'btn-primary': selectedDatePreset === preset.label,
                  }"
                  @click="applyDatePreset(preset)"
                >
                  {{ preset.label }}
                </button>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="form-control">
                  <label class="label" for="startDate"
                    ><span class="label-text">Start Date</span></label
                  >
                  <input
                    id="startDate"
                    v-model="dateFilter.start"
                    type="date"
                    class="input input-bordered"
                  />
                </div>
                <div class="form-control">
                  <label class="label" for="endDate"
                    ><span class="label-text">End Date</span></label
                  >
                  <input
                    id="endDate"
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
                  Reset
                </button>
              </div>
            </div>
          </div>

          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <h3 class="card-title">📊 Financial Analytics</h3>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div class="form-control">
                  <label class="label" for="chartType"
                    ><span class="label-text">Chart Type</span></label
                  >
                  <select
                    id="chartType"
                    v-model="chartConfig.type"
                    class="select select-bordered"
                  >
                    <option value="line">📈 Line</option>
                    <option value="bar">📊 Bar</option>
                    <option value="pie">🥧 Pie</option>
                    <option value="doughnut">🍩 Doughnut</option>
                  </select>
                </div>

                <div class="form-control">
                  <label class="label" for="groupBy"
                    ><span class="label-text">Group By</span></label
                  >
                  <select
                    id="groupBy"
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
                  <div
                    class="flex flex-wrap gap-1 max-h-32 overflow-y-auto"
                    role="listbox"
                    aria-label="Selected categories"
                  >
                    <button
                      v-for="category in chartCategories"
                      :key="category"
                      type="button"
                      class="badge badge-outline cursor-pointer text-xs"
                      :class="{
                        'badge-primary': selectedCategories.includes(category),
                      }"
                      @click="toggleCategory(category)"
                      :aria-pressed="selectedCategories.includes(category)"
                    >
                      {{ category
                      }}<span
                        v-if="selectedCategories.includes(category)"
                        class="ml-1"
                        aria-hidden="true"
                        >✕</span
                      >
                    </button>
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

                <div class="form-control md:col-span-3">
                  <label class="label"
                    ><span class="label-text">Series</span></label
                  >
                  <div class="flex flex-wrap items-center gap-4 text-sm">
                    <label class="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        class="checkbox checkbox-xs"
                        v-model="seriesToggles.income"
                      />
                      <span>Income</span>
                    </label>
                    <label class="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        class="checkbox checkbox-xs"
                        v-model="seriesToggles.spending"
                      />
                      <span>Spending</span>
                    </label>
                    <label class="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        class="checkbox checkbox-xs"
                        v-model="seriesToggles.balance"
                      />
                      <span>Balance (Income − Expenses)</span>
                    </label>
                  </div>
                </div>
              </div>

              <div
                class="bg-base-200 rounded-lg p-4 min-h-[400px] flex items-center justify-center"
              >
                <div
                  v-if="chartData.labels.length === 0"
                  class="text-center text-base-content/60"
                >
                  <div class="text-6xl mb-4" aria-hidden="true">📊</div>
                  <h3 class="text-lg font-semibold mb-2">No Data to Display</h3>
                  <p>Add some transactions to see your financial analytics</p>
                </div>
                <canvas
                  v-else
                  ref="chartCanvas"
                  class="max-w-full max-h-[400px]"
                ></canvas>
              </div>

              <div
                class="stats stats-vertical lg:stats-horizontal shadow mt-6 w-full"
              >
                <div class="stat">
                  <div class="stat-title">Total Income</div>
                  <div class="stat-value text-success">
                    ${{ totalIncome.toFixed(2) }}
                  </div>
                  <div class="stat-desc">
                    {{ incomeTransactions.length }} transactions
                  </div>
                </div>
                <div class="stat">
                  <div class="stat-title">Total Expenses</div>
                  <div class="stat-value text-error">
                    ${{ totalExpenses.toFixed(2) }}
                  </div>
                  <div class="stat-desc">
                    {{ expenseTransactions.length }} transactions
                  </div>
                </div>
                <div class="stat">
                  <div class="stat-title">Net Balance</div>
                  <div
                    class="stat-value"
                    :class="netBalance >= 0 ? 'text-success' : 'text-error'"
                  >
                    ${{ Math.abs(netBalance).toFixed(2) }}
                  </div>
                  <div class="stat-desc">
                    {{ netBalance >= 0 ? "Surplus" : "Deficit" }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </template>

      <!-- About -->
      <section
        v-show="activeTab === 'about'"
        class="card bg-base-100 shadow-xl max-w-4xl mx-auto mt-8"
        aria-labelledby="aboutHeading"
      >
      <div class="card-body">
          <h2 id="aboutHeading" class="card-title text-2xl font-bold">ℹ️ About</h2>
          <div class="prose max-w-none space-y-4">
            <h1 class="text-3xl lg:text-4xl font-bold">
                myAniFi - {{version}}
            </h1>
          
            <p class="lead">
              My Financial Forcaster/Tracker
              Take control of your finances by importing your bank statements or
              adding transactions manually.
            </p>

          

            <h2 class="pt-4 text-2xl font-bold">🔒 Privacy First</h2>
            <p>
              All your data are stored privately and securely on your device!
            </p>
            <div class="divider"></div>

            <!-- The Get Started button for users arriving at the About page -->
            <div v-if="!transactions.length" class="text-center mt-8">
              <button
                class="btn btn-primary btn-wide btn-lg"
                @click="startTourFromAbout"
              >
                Get Started Now
              </button>
            </div>
            <div class="divider" v-if="!transactions.length"></div>

            <h2 class="text-2xl font-bold">🏦 Bank Support</h2>
            <p>Effortlessly import from the 4 major Australian banks.</p>
            <div class="grid grid-cols-1 gap-2">
              <span>✅Westpac</span>
              <span>✅NAB</span>
              <span>✅ANZ</span>
              <span>✅CommBank</span>
              <span>✅St.George</span>
              <span>✅ING</span>
              <span>✅Macquarie</span>
              <span>✅Up Bank</span>
              <span>✅UBank</span>
            </div>

            <div class="divider"></div>

            <h2 class="text-2xl font-bold">✨ Key Features</h2>
            <ul class="space-y-2">
              <li>
                🏷️ <strong>Custom Categories and Tags</strong> - Search and add your own transaction
                categories and tags
              </li>
              <li>
                🎯 <strong>Smart Bulk Operations</strong> - Select and edit
                multiple transactions
              </li>
              <li>
                📊 <strong>Advanced Analytics</strong> - Enhanced charts and
                filtering
              </li>
              <li>
                🔄 <strong>Auto-Categorization</strong> - Smart category
                suggestions
              </li>
              <li>
                📥 <strong>Supports CSV Import</strong> from the 4 major Australian banks
              </li>
              <li>💾 <strong>Auto-Recall</strong> - Seamlessly loads local data from browser</li>
              <li>📈 <strong>Interactive Charts and Analytics</strong></li>
              <li>🔄 <strong>Recurring Transaction Support</strong></li>
              <li>🎨 <strong>Multi-Theme Support</strong></li>
              <li>📱 <strong>Mobile-Responsive Design-ish</strong></li>
              <li></li>

            </ul>

            <div class="divider"></div>

            <h2 class="text-2xl font-bold">🚀 Future Features</h2>
            <ul>
              <li>Improvements on Adding Category and Tags</li>
              <li>Add an interactive bubble map chart type</li>
            </ul>

            <div class="divider"></div>

            <h2 class="text-2xl font-bold">🛠️ Technical Stack</h2>
            <ul>
              <li>Vue 3 with TypeScript</li>
              <li>DaisyUI for styling</li>
              <li>Chart.js for analytics</li>
            </ul>
          </div>
        </div>
      </section>
    </main>

    <!-- Category Manager modal -->
    <dialog
      v-if="catMgr.open"
      class="modal modal-open"
      aria-modal="true"
      role="dialog"
      aria-labelledby="catMgrHeading"
    >
      <div class="modal-box w-full max-w-lg">
        <h3 id="catMgrHeading" class="font-bold text-lg">Manage Categories</h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
          <!-- Default (read-only) -->
          <div>
            <h4 class="font-semibold mb-2 text-sm">Default</h4>
            <ul class="menu bg-base-200 rounded-box p-2 max-h-56 overflow-auto">
              <li v-for="c in categoryNames" :key="c">
                <span class="flex items-center gap-2">
                  <svg
                    class="w-4 h-4 opacity-70"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.75"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                  >
                    <path
                      d="M20.59 13.41a2 2 0 0 0 0-2.82l-7.18-7.18a2 2 0 0 0-2.83 0L3 10.99V21h10.01l7.58-7.59Z"
                    />
                    <path d="M7 7h.01" />
                  </svg>
                  <span>{{ c }}</span>
                </span>
              </li>
            </ul>
          </div>

          <!-- Custom (full CRUD) -->
          <div>
            <h4 class="font-semibold mb-2 text-sm">Custom</h4>
            <ul
              class="bg-base-200 rounded-box p-2 max-h-56 overflow-auto divide-y divide-base-300"
            >
              <li
                v-for="c in customCategories"
                :key="c"
                class="flex items-center gap-2 py-1"
              >
                <template v-if="catMgr.renaming === c">
                  <input
                    v-model="catMgr.renameText"
                    type="text"
                    class="input input-bordered input-xs flex-1"
                    @keyup.enter="saveRenameCategory()"
                    @blur="saveRenameCategory()"
                  />
                  <button
                    class="btn btn-ghost btn-xs"
                    @click="cancelRenameCategory"
                    aria-label="Cancel"
                  >
                    <!-- x icon -->
                    <svg
                      class="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                  </button>
                </template>
                <template v-else>
                  <span class="flex-1 truncate">{{ c }}</span>
                  <button
                    class="btn btn-ghost btn-xs"
                    @click="startRenameCategory(c)"
                    aria-label="Rename"
                  >
                    <!-- pencil -->
                    <svg
                      class="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.75"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M14 4l6 6M16 2l6 6-12 12H4v-6L16 2z" />
                    </svg>
                  </button>
                  <button
                    class="btn btn-ghost btn-xs text-error"
                    @click="deleteCustomCategory(c)"
                    aria-label="Delete"
                  >
                    <!-- trash -->
                    <svg
                      class="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.75"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      aria-hidden="true"
                    >
                      <path
                        d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"
                      />
                      <path d="M10 11v6M14 11v6" />
                    </svg>
                  </button>
                </template>
              </li>
            </ul>

            <div class="join mt-2 w-full">
              <input
                v-model="catMgr.newName"
                type="text"
                class="input input-bordered input-sm join-item flex-1"
                placeholder="New custom category"
                @keyup.enter="addCustomCategory()"
              />
              <button
                class="btn btn-primary btn-sm join-item"
                @click="addCustomCategory"
                aria-label="Add"
              >
                <!-- plus -->
                <svg
                  class="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <p class="text-xs text-base-content/60 mt-3">
          Renaming updates all existing transactions. Deleting reassigns them to
          <strong>Uncategorized</strong>.
        </p>

        <div class="modal-action">
          <button class="btn" @click="catMgr.open = false">Close</button>
        </div>
      </div>
    </dialog>

    <!-- Tag Picker -->
    <dialog
      v-if="tagPicker.open"
      class="modal modal-open"
      aria-modal="true"
      role="dialog"
      aria-labelledby="tagPickerHeading"
    >
      <div class="modal-box w-full max-w-2xl p-0 md:max-h-[80vh]">
        <!-- Sticky search/header -->
        <div class="p-3 bg-base-200 sticky top-0 z-10">
          <div class="flex items-center justify-between gap-2">
            <h3 id="tagPickerHeading" class="font-bold text-lg">Select Tags</h3>
            <button
              class="btn btn-ghost btn-sm"
              @click="closeTagPicker"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          <div class="mt-2 grid grid-cols-[1fr_auto] gap-2">
            <input
              ref="tagPickerInputRef"
              v-model="tagPicker.q"
              type="text"
              class="input input-bordered input-sm w-full"
              placeholder="Search or create…"
              autocomplete="off"
              @keydown.enter.prevent="createTagFromQuery()"
            />
            <button
              class="btn btn-primary btn-sm"
              @click="createTagFromQuery()"
            >
              Add
            </button>
          </div>
          <p class="text-xs opacity-60 mt-1">
            {{ filteredTagList.length }} match{{
              filteredTagList.length === 1 ? "" : "es"
            }}
          </p>
        </div>

        <!-- Scrollable list -->
        <div
          class="px-3 pb-3 max-h-[70vh] md:max-h-[60vh] overflow-y-auto overscroll-contain"
          style="-webkit-overflow-scrolling: touch"
          @scroll.passive="onTagScroll"
          ref="tagPickerScrollRef"
        >
          <ul
            class="menu bg-base-100 rounded-box shadow divide-y divide-base-300"
          >
            <li v-for="t in tagSlice" :key="t" class="py-1">
              <label class="flex items-center gap-2">
                <input
                  type="checkbox"
                  class="checkbox checkbox-sm"
                  :checked="tagPicker.selected.has(t)"
                  @change="toggleTagPick(t, $event.target.checked)"
                />
                <span class="truncate">{{ t }}</span>
              </label>
            </li>
          </ul>

          <div v-if="!tagSlice.length" class="p-4 text-center opacity-70">
            No tags yet. Type above to add.
          </div>

          <div
            v-if="tagSlice.length < filteredTagList.length"
            class="text-center text-xs opacity-60 mt-3"
          >
            Loading more…
          </div>
        </div>

        <div
          class="p-3 flex justify-between items-center border-t border-base-300"
        >
          <div class="text-xs opacity-70">
            Selected: {{ tagPicker.selected.size }}
          </div>
          <div class="flex flex-wrap gap-2">
            <button class="btn btn-ghost btn-sm" @click="closeTagPicker">
              Cancel
            </button>
            <button class="btn btn-primary btn-sm" @click="applyPickedTags">
              Apply
            </button>
          </div>
        </div>
      </div>
    </dialog>

    <!-- Label Import modal -->
    <dialog
      v-if="labelImport.open"
      class="modal modal-open"
      aria-modal="true"
      role="dialog"
      aria-labelledby="labelImportHeading"
    >
      <div class="modal-box w-full max-w-md">
        <h3 id="labelImportHeading" class="font-bold text-lg">
          📝 Label this import
        </h3>
        <p class="mt-2 text-sm text-base-content/70">
          Give this CSV a name so you can filter and report on it later.
          <span v-if="labelImport.filename"
            >(<strong>{{ labelImport.filename }}</strong
            >)</span
          >
        </p>

        <div class="form-control mt-4">
          <label class="label" for="importLabel">
            <span class="label-text">Name / Description</span>
          </label>
          <input
            id="importLabel"
            v-model="labelImport.label"
            type="text"
            class="input input-bordered"
            placeholder="e.g. NAB Credit Card – 2025 Q2"
            required
          />
        </div>

        <div class="form-control mt-3">
          <label class="label" for="importNote">
            <span class="label-text">Notes (optional)</span>
          </label>
          <input
            id="importNote"
            v-model="labelImport.note"
            type="text"
            class="input input-bordered"
            placeholder="Anything to remember about this file"
          />
        </div>

        <div class="mt-4 text-sm text-base-content/70">
          Ready to import
          <strong>{{ labelImport.imported.length }}</strong> transaction{{
            labelImport.imported.length === 1 ? "" : "s"
          }}
        </div>

        <div class="modal-action">
          <button class="btn" @click="cancelLabelImport">Cancel</button>
          <button
            class="btn btn-primary"
            :disabled="!labelImport.label.trim()"
            @click="confirmLabelImport"
          >
            Import
          </button>
        </div>
      </div>
    </dialog>

    <!-- Smart Select modal -->
    <dialog
      v-if="openSmartSelect"
      class="modal modal-open"
      aria-modal="true"
      role="dialog"
      aria-labelledby="smartSelectHeading"
    >
      <div class="modal-box w-full max-w-lg">
        <h3 id="smartSelectHeading" class="font-bold text-lg">
          🎯 Smart Select
        </h3>
        <div class="py-2 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div class="form-control">
            <label class="label" for="ssCategory"
              ><span class="label-text">Category</span></label
            >
            <select
              id="ssCategory"
              v-model="smartSelect.category"
              class="select select-bordered select-sm"
            >
              <option value="">Any</option>
              <option v-for="c in categories" :value="c" :key="c">
                {{ c }}
              </option>
            </select>
          </div>

          <div class="form-control">
            <label class="label" for="ssType"
              ><span class="label-text">Type</span></label
            >
            <select
              id="ssType"
              v-model="smartSelect.type"
              class="select select-bordered select-sm"
            >
              <option value="">Any</option>
              <option value="income">💰 Income</option>
              <option value="spending">💸 Spending</option>
            </select>
          </div>

          <div class="form-control">
            <label class="label" for="ssMin"
              ><span class="label-text">Min Amount</span></label
            >
            <input
              id="ssMin"
              v-model.number="smartSelect.min"
              type="number"
              step="0.01"
              class="input input-bordered input-sm"
            />
          </div>

          <div class="form-control">
            <label class="label" for="ssMax"
              ><span class="label-text">Max Amount</span></label
            >
            <input
              id="ssMax"
              v-model.number="smartSelect.max"
              type="number"
              step="0.01"
              class="input input-bordered input-sm"
            />
          </div>

          <div class="form-control">
            <label class="label" for="ssFrom"
              ><span class="label-text">From</span></label
            >
            <input
              id="ssFrom"
              v-model="smartSelect.from"
              type="date"
              class="input input-bordered input-sm"
            />
          </div>

          <div class="form-control">
            <label class="label" for="ssTo"
              ><span class="label-text">To</span></label
            >
            <input
              id="ssTo"
              v-model="smartSelect.to"
              type="date"
              class="input input-bordered input-sm"
            />
          </div>

          <div class="form-control md:col-span-2">
            <label class="label" for="ssContains"
              ><span class="label-text">Description contains</span></label
            >
            <input
              id="ssContains"
              v-model="smartSelect.contains"
              type="text"
              class="input input-bordered input-sm"
            />
          </div>
        </div>

        <div class="modal-action">
          <button class="btn btn-primary" @click="applySmartSelect">
            Select
          </button>
          <button class="btn" @click="openSmartSelect = false">Close</button>
        </div>
      </div>
    </dialog>

    <!-- Bulk Edit modal -->
    <dialog
      v-if="bulkEdit.open"
      class="modal modal-open"
      aria-modal="true"
      role="dialog"
      aria-labelledby="bulkEditHeading"
    >
      <div class="modal-box w-full max-w-lg">
        <h3 id="bulkEditHeading" class="font-bold text-lg">
          🛠️ Bulk Edit ({{ selectedCount }} selected)
        </h3>

        <div class="mt-3 space-y-3">
          <!-- Category change -->
          <div class="form-control">
            <label class="label" for="beCategory"
              ><span class="label-text">Set Category</span></label
            >
            <select
              id="beCategory"
              v-model="bulkEdit.category"
              class="select select-bordered select-sm"
            >
              <option value="">(no change)</option>
              <option v-for="c in categories" :key="c" :value="c">
                {{ c }}
              </option>
            </select>
          </div>

          <!-- Type change -->
          <div class="form-control">
            <span class="label-text mb-1">Set Type</span>
            <div class="flex flex-wrap gap-3 items-center">
              <label class="inline-flex gap-2 items-center">
                <input
                  type="radio"
                  name="beType"
                  value=""
                  v-model="bulkEdit.type"
                  class="radio radio-xs"
                />
                <span>(no change)</span>
              </label>
              <label class="inline-flex gap-2 items-center">
                <input
                  type="radio"
                  name="beType"
                  value="income"
                  v-model="bulkEdit.type"
                  class="radio radio-xs"
                />
                <span>Income</span>
              </label>
              <label class="inline-flex gap-2 items-center">
                <input
                  type="radio"
                  name="beType"
                  value="spending"
                  v-model="bulkEdit.type"
                  class="radio radio-xs"
                />
                <span>Spending</span>
              </label>
            </div>
          </div>

          <!-- Description edit -->
          <div class="form-control">
            <label class="label" for="beDesc"
              ><span class="label-text">Description</span></label
            >
            <div class="join">
              <select
                v-model="bulkEdit.descMode"
                class="select select-bordered select-sm join-item"
                aria-label="Description mode"
              >
                <option value="none">(no change)</option>
                <option value="replace">Replace</option>
                <option value="prepend">Prepend</option>
                <option value="append">Append</option>
              </select>
              <input
                id="beDesc"
                v-model="bulkEdit.descText"
                type="text"
                class="input input-bordered input-sm join-item flex-1"
                placeholder="Text…"
                :disabled="bulkEdit.descMode === 'none'"
              />
            </div>
          </div>

          <!-- Smart: Find & Replace -->
          <div class="form-control">
            <label class="label" for="beFind"
              ><span class="label-text"
                >Find & Replace (case-insensitive)</span
              ></label
            >
            <div class="join">
              <input
                id="beFind"
                v-model="bulkEdit.findText"
                type="text"
                class="input input-bordered input-sm join-item w-40"
                placeholder="Find…"
              />
              <input
                v-model="bulkEdit.replaceWith"
                type="text"
                class="input input-bordered input-sm join-item flex-1"
                placeholder="Replace with…"
              />
              <label class="label cursor-pointer join-item px-3 gap-2 text-xs">
                <input
                  type="checkbox"
                  class="checkbox checkbox-xs"
                  v-model="bulkEdit.replaceAll"
                />
                <span>Replace all</span>
              </label>
            </div>
          </div>

          <!-- Smart: Description cleanup -->
          <div class="form-control">
            <span class="label-text mb-1">Description cleanup</span>
            <div class="flex flex-wrap items-center gap-3 text-sm">
              <label class="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  class="checkbox checkbox-xs"
                  v-model="bulkEdit.trimWhitespace"
                />
                <span>Trim</span>
              </label>
              <label class="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  class="checkbox checkbox-xs"
                  v-model="bulkEdit.collapseSpaces"
                />
                <span>Collapse spaces</span>
              </label>
              <label class="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  class="checkbox checkbox-xs"
                  v-model="bulkEdit.titleCase"
                />
                <span>Title Case</span>
              </label>
            </div>
          </div>

          <!-- Smart: Save keyword -> category rule -->
          <div class="form-control">
            <span class="label-text mb-1">Save keyword -> category rule</span>
            <div class="flex items-center gap-2">
              <label class="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  class="checkbox checkbox-xs"
                  v-model="bulkEdit.saveRule"
                />
                <span class="text-sm">Save rule</span>
              </label>
              <input
                :disabled="!bulkEdit.saveRule"
                v-model="bulkEdit.ruleKeyword"
                type="text"
                class="input input-bordered input-sm flex-1"
                :placeholder="suggestedKeyword || 'Keyword…'"
              />
            </div>
            <p class="text-xs mt-1 text-base-content/60">
              Also set <strong>Category</strong> above. Future imports matching
              the keyword are auto-categorized.
            </p>
          </div>

          <!-- Optional: date shift -->
          <div class="form-control">
            <label class="label" for="beShift"
              ><span class="label-text">Shift Date (days)</span></label
            >
            <input
              id="beShift"
              v-model.number="bulkEdit.shiftDays"
              type="number"
              class="input input-bordered input-sm w-32"
              placeholder="0"
            />
            <p class="text-xs text-base-content/60 mt-1">
              Positive numbers move dates forward.
            </p>
          </div>
        </div>

        <div class="modal-action">
          <button class="btn btn-ghost" @click="bulkEdit.open = false">
            Cancel
          </button>
          <button
            class="btn btn-primary"
            :disabled="selectedCount === 0"
            @click="applyBulkEdit"
          >
            Apply changes
          </button>
        </div>
      </div>
    </dialog>
  </div>

</template>
<script setup lang="ts">
import {
  ref,
  reactive,
  computed,
  watch,
  onMounted,
  onUnmounted,
  nextTick,
} from "vue";

const props = withDefaults(
  defineProps<{
    modelValue: string;
    defaults: string[];
    initialCustom?: string[];
    initialTags?: string[];
    storageKey?: string;
    placeholder?: string;
  }>(),
  {
    initialCustom: [],
    initialTags: [],
    storageKey: "ani:catmgr",
    placeholder: "Type to search or create a category…",
  }
);

const emit = defineEmits<{
  (e: "update:modelValue", val: string): void;
  (e: "update:custom", val: string[]): void;
  (e: "update:tags", val: string[]): void;
}>();

// --- Match highlight for list items ---
function highlight(text: string, q: string) {
  const esc = (s: string) =>
    s.replace(/[&<>"']/g, (ch) => ({ "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;" }[ch]!));
  const needle = (q || "").trim();
  if (!needle) return esc(text);
  const re = new RegExp(`(${needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "ig");
  return esc(text).replace(re, "<mark>$1</mark>");
}

// --- Recently used categories (persisted) ---
const recentCatLsKey = `${props.storageKey}:recentCats`;
const recentCategories = ref<string[]>([]);
try { recentCategories.value = JSON.parse(localStorage.getItem(recentCatLsKey) || "[]"); } catch {}

function rememberCategory(cat: string) {
  const list = dedupeCI([cat, ...recentCategories.value]).slice(0, 6);
  recentCategories.value = list;
  localStorage.setItem(recentCatLsKey, JSON.stringify(list));
}


/**
 * PROPS
 * - modelValue: v-model for selected category
 * - defaults: your built-in categories (read-only)
 * - initialCustom: starting custom categories (optional)
 * - initialTags: starting tag list (optional)
 * - storageKey: base key for localStorage persistence (optional)
 */

/** ========== BODY SCROLL LOCK (avoid background scroll under modals) ========== */
function setBodyScrollLocked(locked: boolean) {
  const el = document.documentElement;
  if (locked) el.classList.add("no-scroll");
  else el.classList.remove("no-scroll");
}

/** ========== CATEGORY PICKER ========== */
const catPicker = reactive({
  open: false,
  q: "",
  visible: 80, // lazy-load list (smooth on mobile)
});
const catPickerInputRef = ref<HTMLInputElement | null>(null);
const catPickerScrollRef = ref<HTMLElement | null>(null);

// Reuse your merged categories (default + custom)
const filteredCats = computed(() => {
  const q = catPicker.q.trim().toLowerCase();
  const base = allCategories.value;
  if (!q) return base;
  return base.filter((c) => c.toLowerCase().includes(q));
});
const showCatCreate = computed(() => {
  const q = catPicker.q.trim();
  return q.length > 0 && !containsCaseIns(allCategories.value, q);
});
const catSlice = computed(() => filteredCats.value.slice(0, catPicker.visible));

function openCatPicker() {
  catPicker.q = (query?.value || newTransaction.category || "").trim();
  catPicker.visible = 80;
  catPicker.open = true;
  setTimeout(() => catPickerInputRef.value?.focus(), 0);
  setBodyScrollLocked(true);
}
function closeCatPicker() {
  catPicker.open = false;
  setBodyScrollLocked(false);
}
function onCatScroll(e: Event) {
  const t = e.target as HTMLElement;
  if (t.scrollTop + t.clientHeight >= t.scrollHeight - 48) {
    catPicker.visible = Math.min(
      catPicker.visible + 80,
      filteredCats.value.length
    );
  }
}
function createCategoryFromQuery() {
  const name = norm(catPicker.q);
  if (!name) return;
  if (
    !containsCaseIns(customCategories.value, name) &&
    !containsCaseIns(allCategories.value, name)
  ) {
    customCategories.value = sortAlpha(
      dedupeCI([...customCategories.value, name])
    );
  }
  newTransaction.category =
    allCategories.value.find((c) => eqi(c, name)) || name;
  query.value = newTransaction.category;
  // Do not close yet—let user review. Keep “Apply” explicit.
}
function pickCategory(c: string) {
  newTransaction.category = c;
  query.value = c;
}
function applyPickedCategory() {
  // ensure combobox reflects selection
  query.value = newTransaction.category || "";
  closeCatPicker();
  pushToast(`Category set to "${newTransaction.category || "—"}"`, "success");
}

/** ========== TAG PICKER (multi-select) ========== */
const tagPicker = reactive({
  open: false,
  q: "",
  visible: 120,
  selected: new Set<string>(),
});
const tagPickerInputRef = ref<HTMLInputElement | null>(null);
const tagPickerScrollRef = ref<HTMLElement | null>(null);

const filteredTagList = computed(() => {
  const q = tagPicker.q.trim().toLowerCase();
  const pool = sortAlpha(tags.value);
  if (!q) return pool;
  return pool.filter((t) => t.toLowerCase().includes(q));
});
const tagSlice = computed(() =>
  filteredTagList.value.slice(0, tagPicker.visible)
);

function openTagPicker() {
  tagPicker.q = "";
  tagPicker.visible = 120;
  tagPicker.selected = new Set(newTransaction.tags);
  tagPicker.open = true;
  setTimeout(() => tagPickerInputRef.value?.focus(), 0);
  setBodyScrollLocked(true);
}
function closeTagPicker() {
  tagPicker.open = false;
  setBodyScrollLocked(false);
}
function onTagScroll(e: Event) {
  const t = e.target as HTMLElement;
  if (t.scrollTop + t.clientHeight >= t.scrollHeight - 48) {
    tagPicker.visible = Math.min(
      tagPicker.visible + 120,
      filteredTagList.value.length
    );
  }
}
function toggleTagPick(t: string, on: boolean) {
  if (on) tagPicker.selected.add(t);
  else tagPicker.selected.delete(t);
}
function createTagFromQuery() {
  const name = norm(tagPicker.q);
  if (!name) return;
  // Add to master tags if new
  if (!containsCaseIns(tags.value, name)) {
    tags.value = sortAlpha(dedupeCI([...tags.value, name]));
    saveTags();
  }
  // Add to selected
  const canonical = tags.value.find((x) => eqi(x, name)) || name;
  tagPicker.selected.add(canonical);
  tagPicker.q = "";
}
function applyPickedTags() {
  newTransaction.tags = Array.from(tagPicker.selected);
  closeTagPicker();
  pushToast(`Tags updated (${newTransaction.tags.length})`, "success");
}

/* ---------- Utilities ---------- */
const norm = (s: string) => s.trim().replace(/\s+/g, " ");
const eqi = (a: string, b: string) =>
  a.localeCompare(b, undefined, { sensitivity: "accent" }) === 0;
const containsCaseIns = (arr: string[], val: string) =>
  arr.some((x) => eqi(x, val));
const dedupeCI = (arr: string[]) => {
  const out: string[] = [];
  for (const s of arr.map(norm).filter(Boolean)) {
    if (!containsCaseIns(out, s)) out.push(s);
  }
  return out;
};
const sortAlpha = (arr: string[]) =>
  [...arr].sort((a, b) => a.localeCompare(b));

/* ---------- State (persisted) ---------- */
const ls = {
  custom: `${props.storageKey}:custom`,
  tags: `${props.storageKey}:tags`,
};

const customCategories = ref<string[]>(
  (() => {
    try {
      const saved = JSON.parse(localStorage.getItem(ls.custom) || "[]");
      return dedupeCI([
        ...(props.initialCustom || []),
        ...(Array.isArray(saved) ? saved : []),
      ]);
    } catch {
      return dedupeCI(props.initialCustom || []);
    }
  })()
);

const tags = ref<string[]>(
  (() => {
    try {
      const saved = JSON.parse(localStorage.getItem(ls.tags) || "[]");
      return dedupeCI([
        ...(props.initialTags || []),
        ...(Array.isArray(saved) ? saved : []),
      ]);
    } catch {
      return dedupeCI(props.initialTags || []);
    }
  })()
);

const csvInputRef = ref<HTMLInputElement | null>(null);

async function  openTour(opts: { closeTour?: boolean } = {}) {
  console.log(opts.closeTour)
  if (opts.closeTour) {
    console.log(opts.closeTour)
    showTour.value = false; // close overlay so the picker is clickable
  }
  // navigate to Import and trigger file input
  activeTab.value = "import";
  await nextTick();

  // capture "cancel" (there's no cancel event, so listen for focus returning)
  awaitingFile.value = true;
  // const onFocusBack = () => {
  //   // allow a tiny delay for browsers to settle
  //   setTimeout(() => {
  //     if (awaitingFile.value && !pendingFilename.value) {
  //       // no selection happened => re-open the tour
  //       showTour.value = true;
  //       onboardingStep.value = 0;
  //     }
  //     awaitingFile.value = false;
  //     window.removeEventListener("focus", onFocusBack, true);
  //   }, 50);
  // };
  // window.addEventListener("focus", onFocusBack, true);

  // csvInputRef.value?.focus();
  // csvInputRef.value?.click();
}

function startImportFromOnboarding() {
  console.log("startImportFromOnboarding")
   openTour({ closeTour: true });
}

function startImportFromEmptyState() {
  console.log("startImportFromEmptyState")
   openTour({ closeTour: true });
  //  openTour(); // just open picker
}

/* ---------- Category Combobox ---------- */
const open = ref(false);
const query = ref("");
const activeIndex = ref<number>(0);
  const ids: { input: string; listbox: string; heading: string; tagList: string } = {
  input: `cat-cbx-${Math.random().toString(36).slice(2)}`,
  listbox: `cat-lb-${Math.random().toString(36).slice(2)}`,
  heading: `catmgr-h-${Math.random().toString(36).slice(2)}`,
  tagList: `tag-lb-${Math.random().toString(36).slice(2)}`,
};


function normalizeTx(t: any): Transaction {
  return {
    id: String(t?.id ?? `${Date.now()}-${Math.floor(Math.random() * 10000)}`),
    date: String(t?.date ?? todayLocalISO()),
    type: t?.type === "income" ? "income" : "spending",
    amount: Number(t?.amount ?? 0),
    category: String(t?.category ?? "Uncategorized"),
    tags: Array.isArray(t?.tags) ? t.tags : [],
    description: String(t?.description ?? ""),
    recurring: !!t?.recurring,
    frequency: (t?.frequency as RecurringFrequency) ?? "monthly",
    recursions: Number(t?.recursions ?? 1),
    endDate: String(t?.endDate ?? ""),
    source: String(t?.source ?? DEFAULT_SOURCE),
  };
}

function hydrateTransactionsFromStorage() {
  try {
    const raw = localStorage.getItem("financial-tracker-transactions");
    if (!raw) return;
    const parsed = JSON.parse(raw);

    // Accept either an array or legacy { transactions: [...] }
    const arr = Array.isArray(parsed)
      ? parsed
      : Array.isArray((parsed as any)?.transactions)
      ? (parsed as any).transactions
      : [];

    transactions.value = arr.map(normalizeTx);
  } catch (e) {
    console.warn("Bad transactions in storage, clearing.", e);
    localStorage.removeItem("financial-tracker-transactions");
    transactions.value = [];
  }
}

/* ========= Add page: tag chips input state ========= */
const tagInput = ref("");
const openTagSuggest = ref(false);

const tagSuggestionsForInput = computed(() => {
  const q = norm(tagInput.value).toLowerCase();
  const pool = tags.value.filter((t) => !newTransaction.tags.includes(t));
  if (!q) return pool.slice(0, 8);
  return pool.filter((t) => t.toLowerCase().includes(q)).slice(0, 8);
});

function commitTagInput() {
  const bits = (tagInput.value || "")
    .split(/[,\s]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  bits.forEach((b) => addTagToTransaction(b));
  tagInput.value = "";
  openTagSuggest.value = false;
}

/* ========= Transactions: tag filter helpers ========= */
function addTagFilter(t: string) {
  const name = norm(String(t || "")).toLowerCase();
  if (!name) return;
  if (!selectedTagsForFilter.value.includes(name)) {
    selectedTagsForFilter.value.push(name);
  }
  tagFilterInput.value = "";
}

function removeTagFilter(t: string) {
  selectedTagsForFilter.value = selectedTagsForFilter.value.filter(
    (x) => x !== t
  );
}

const optionId = (i: number) => `${ids.listbox}-opt-${i}`;
const activeId = computed(() => optionId(activeIndex.value));

// Categories source
const defaultCategories = computed(() => sortAlpha(dedupeCI(categoryNames)));
const allCategories = computed(() =>
  sortAlpha(dedupeCI([...defaultCategories.value, ...customCategories.value]))
);

const trimmedQuery = computed(() => norm(query.value));
const filteredAllCategories = computed(() => {
  const q = trimmedQuery.value.toLowerCase();
  if (!q) return allCategories.value;
  return allCategories.value.filter((c) => c.toLowerCase().includes(q));
});
const showCreateOption = computed(() => {
  const q = trimmedQuery.value;
  return q.length > 0 && !containsCaseIns(allCategories.value, q);
});

function handleInput() {
  open.value = true;
  // when filtering changes, reset activeIndex to first real option or -1 if create-option exists
  activeIndex.value = showCreateOption.value ? -1 : 0;
}
function moveActive(dir: 1 | -1) {
  const opts = filteredAllCategories.value.length;
  if (showCreateOption.value) {
    // include the "create" option at index -1
    const order = [-1, ...Array.from({ length: opts }, (_, i) => i)];
    const cur = order.indexOf(activeIndex.value);
    const next = (cur + dir + order.length) % order.length;
    activeIndex.value = order[next];
  } else {
    // only real options
    const next = (activeIndex.value + dir + opts) % Math.max(opts, 1);
    activeIndex.value = next;
  }
}
function handleEnter() {
  if (activeIndex.value === -1 && showCreateOption.value) {
    createCustomFromQuery();
    return;
  }
  const choice = filteredAllCategories.value[activeIndex.value];
  if (choice) selectCategory(choice);
  else if (showCreateOption.value) createCustomFromQuery();
}
function closeDropdown() {
  open.value = false;
}
function selectCategory(cat: string) {
  emit("update:modelValue", cat);
  newTransaction.category = cat;
  query.value = cat;
  open.value = false;
  rememberCategory(cat); 
}


function createCustomFromQuery() {
  const name = trimmedQuery.value;
  if (!name) return;
  if (!containsCaseIns(customCategories.value, name)) {
    customCategories.value = sortAlpha(
      dedupeCI([...customCategories.value, name])
    );
  }
  selectCategory(name);
}

/* Close dropdown on outside click */
function onDocClick(e: MouseEvent) {
  const target = e.target as HTMLElement;
  const root = document.getElementById(ids.input)?.parentElement;
  if (root && !root.contains(target)) open.value = false;
}
onMounted(() => document.addEventListener("mousedown", onDocClick));
onUnmounted(() => document.removeEventListener("mousedown", onDocClick));

/* Keep input synced with v-model externally */
watch(
  () => props.modelValue,
  (val) => {
    if (val && !eqi(val, query.value)) query.value = val;
  },
  { immediate: true }
);

/* Persist + emit changes */
watch(
  customCategories,
  (val) => {
    localStorage.setItem(ls.custom, JSON.stringify(val));
    emit("update:custom", val);
  },
  { deep: true }
);
watch(
  tags,
  (val) => {
    localStorage.setItem(ls.tags, JSON.stringify(val));
    emit("update:tags", val);
  },
  { deep: true }
);

/* ---------- Manager Modal ---------- */
const showManager = ref(false);
const managerMode = ref<"manage" | "add">("manage");
function openManager(mode: "manage" | "add" = "manage") {
  managerMode.value = mode;
  showManager.value = true;
  nextTick(() => {
    // focus search when opening manage; prefill new name when "add"
    if (mode === "manage") {
      const el = document.querySelector<HTMLInputElement>('[data-testid="category-search"]');
      el?.focus();
    } else {
      newCustomName.value = trimmedQuery.value || "";
    }
  });
}

function closeManager() {
  showManager.value = false;
}

/* Category search in modal */
const categorySearch = ref("");
const filteredCategories = computed(() => {
  const q = norm(categorySearch.value).toLowerCase();
  const merged = allCategories.value;
  if (!q) return merged;
  return merged.filter((c) => c.toLowerCase().includes(q));
});
const filteredDefaults = computed(() =>
  filteredCategories.value.filter((c) => defaultCategories.value.includes(c))
);
const filteredCustoms = computed(() =>
  filteredCategories.value.filter((c) => customCategories.value.includes(c))
);

/* Add new custom category */
const newCustomName = ref("");
function addCustomCategory() {
  const name = norm(newCustomName.value);
  if (!name) return;
  if (containsCaseIns(allCategories.value, name)) {
    // already exists: just select it
    selectCategory(allCategories.value.find((c) => eqi(c, name))!);
  } else {
    customCategories.value = sortAlpha(
      dedupeCI([...customCategories.value, name])
    );
    selectCategory(name);
  }
  newCustomName.value = "";
}

/* Edit custom category */
const editingCategory = ref<string | null>(null);
const editingCategoryName = ref("");
const editInputRef = ref<HTMLInputElement | null>(null);
function startEditCategory(cat: string) {
  editingCategory.value = cat;
  editingCategoryName.value = cat;
  nextTick(() => editInputRef.value?.focus());
}
function cancelEditCategory() {
  editingCategory.value = null;
  editingCategoryName.value = "";
}
function saveEditCategory() {
  const original = editingCategory.value;
  const next = norm(editingCategoryName.value);
  if (!original) return cancelEditCategory();
  if (!next) return cancelEditCategory();
  if (eqi(original, next)) return cancelEditCategory();

  if (
    containsCaseIns(
      allCategories.value.filter((c) => !eqi(c, original)),
      next
    )
  ) {
    // If it conflicts, just select that existing one and remove original if it was custom
    const existing = allCategories.value.find((c) => eqi(c, next))!;
    if (customCategories.value.includes(original)) {
      customCategories.value = customCategories.value.filter(
        (c) => !eqi(c, original)
      );
    }
    if (eqi(props.modelValue, original)) emit("update:modelValue", existing);
  } else {
    // Update the custom list entry
    customCategories.value = sortAlpha(
      customCategories.value.map((c) => (eqi(c, original) ? next : c))
    );
    if (eqi(props.modelValue, original)) emit("update:modelValue", next);
  }
  cancelEditCategory();
}
function deleteCustomCategory(cat: string) {
  customCategories.value = customCategories.value.filter((c) => !eqi(c, cat));
  if (eqi(props.modelValue, cat)) emit("update:modelValue", "");
}

/* ---------- Tags ---------- */
const tagSearch = ref("");
const filteredTags = computed(() => {
  const q = norm(tagSearch.value).toLowerCase();
  if (!q) return sortAlpha(tags.value);
  return sortAlpha(tags.value.filter((t) => t.toLowerCase().includes(q)));
});
function addNewTag() {
  const name = norm(tagSearch.value);
  if (!name) return;
  if (!containsCaseIns(tags.value, name)) {
    tags.value = sortAlpha(dedupeCI([...tags.value, name]));
  }
  tagSearch.value = "";
}
function quickAddTag(name: string) {
  if (!containsCaseIns(tags.value, name)) {
    tags.value = sortAlpha(dedupeCI([...tags.value, name]));
  }
}
function removeTag(name: string) {
  tags.value = tags.value.filter((t) => !eqi(t, name));
}

/* Suggestions (demo: infer from categories) */
const tagSuggestions = computed(() => {
  const base = ["recurring", "one-off", "work", "family", "health", "urgent"];
  // Add some simple category-derived suggestions:
  const cats = allCategories.value.slice(0, 6).map((c) => c.toLowerCase());
  const union = dedupeCI([...base, ...cats]).filter(
    (t) => !containsCaseIns(tags.value, t)
  );
  return union.slice(0, 8);
});

/* Public computed for template compatibility if needed */
const placeholder = computed(() => props.placeholder);

const version = ref("v3.0");

/** ========= NEW STATE FOR IMPROVEMENTS ========= */
// Onboarding Tour State
const showTour = ref(false);
const onboardingStep = ref(0);

// Progressive Disclosure for Transactions View
const showAdvancedTransactionsView = ref(false);

// Tag Management
const newTag = ref("");
const showCategoryManager = ref(false);

// Demo Data
const DEMO_DATA: Transaction[] = [
  // ─────────────── Income (salary, side gigs, investment income) ───────────────
  {
    id: "demo-1",
    date: "2023-10-01",
    type: "income",
    amount: 3500,
    category: "Income",
    description: "Monthly Salary",
    source: "Demo Data",
    recurring: true,
    frequency: "monthly",
    tags: ["income", "salary", "recurring", "monthly", "work"],
  },
  {
    id: "demo-2",
    date: "2023-11-01",
    type: "income",
    amount: 3500,
    category: "Income",
    description: "Monthly Salary",
    source: "Demo Data",
    recurring: true,
    frequency: "monthly",
    tags: ["income", "salary", "recurring", "monthly", "work"],
  },
  {
    id: "demo-3",
    date: "2023-12-01",
    type: "income",
    amount: 3500,
    category: "Income",
    description: "Monthly Salary",
    source: "Demo Data",
    recurring: true,
    frequency: "monthly",
    tags: ["income", "salary", "recurring", "monthly", "work"],
  },
  {
    id: "demo-4",
    date: "2024-01-01",
    type: "income",
    amount: 3500,
    category: "Income",
    description: "Monthly Salary",
    source: "Demo Data",
    recurring: true,
    frequency: "monthly",
    tags: ["income", "salary", "recurring", "monthly", "work"],
  },
  {
    id: "demo-5",
    date: "2024-02-01",
    type: "income",
    amount: 3500,
    category: "Income",
    description: "Monthly Salary",
    source: "Demo Data",
    recurring: true,
    frequency: "monthly",
    tags: ["income", "salary", "recurring", "monthly", "work"],
  },
  {
    id: "demo-6",
    date: "2023-10-15",
    type: "income",
    amount: 150,
    category: "Investment Income",
    description: "ETF Dividend",
    source: "Demo Data",
    tags: ["income", "investment", "dividend", "asx", "etf"],
  },
  {
    id: "demo-7",
    date: "2024-01-15",
    type: "income",
    amount: 120,
    category: "Investment Income",
    description: "ETF Dividend",
    source: "Demo Data",
    tags: ["income", "investment", "dividend", "asx", "etf"],
  },
  {
    id: "demo-8",
    date: "2023-10-20",
    type: "income",
    amount: 320,
    category: "Income",
    description: "Freelance Web Fix",
    source: "Demo Data",
    tags: ["income", "freelance", "one-off", "tech"],
  },
  {
    id: "demo-9",
    date: "2023-11-17",
    type: "income",
    amount: 300,
    category: "Income",
    description: "Freelance UI Tweak",
    source: "Demo Data",
    tags: ["income", "freelance", "one-off", "tech"],
  },
  {
    id: "demo-10",
    date: "2024-01-21",
    type: "income",
    amount: 260,
    category: "Income",
    description: "Freelance Bug Bash",
    source: "Demo Data",
    tags: ["income", "freelance", "one-off", "tech"],
  },
  {
    id: "demo-11",
    date: "2023-11-30",
    type: "income",
    amount: 4.12,
    category: "Investment Income",
    description: "Savings Interest",
    source: "Demo Data",
    tags: ["income", "interest", "bank"],
  },
  {
    id: "demo-12",
    date: "2023-12-31",
    type: "income",
    amount: 3.87,
    category: "Investment Income",
    description: "Savings Interest",
    source: "Demo Data",
    tags: ["income", "interest", "bank"],
  },
  {
    id: "demo-13",
    date: "2023-12-28",
    type: "income",
    amount: 45.0,
    category: "Refunds",
    description: "Amazon Return",
    source: "Demo Data",
    tags: ["income", "refund", "shopping"],
  },
  {
    id: "demo-14",
    date: "2024-01-05",
    type: "income",
    amount: 12.0,
    category: "Cashback",
    description: "Credit Card Cashback",
    source: "Demo Data",
    tags: ["income", "cashback", "card"],
  },

  // ─────────────── Housing & Bills (recurring) ───────────────
  {
    id: "demo-15",
    date: "2023-10-03",
    type: "spending",
    amount: 1800,
    category: "Rent & Mortgage",
    description: "Monthly Rent",
    source: "Demo Data",
    recurring: true,
    frequency: "monthly",
    tags: ["housing", "rent", "recurring", "monthly"],
  },
  {
    id: "demo-16",
    date: "2023-11-03",
    type: "spending",
    amount: 1800,
    category: "Rent & Mortgage",
    description: "Monthly Rent",
    source: "Demo Data",
    recurring: true,
    frequency: "monthly",
    tags: ["housing", "rent", "recurring", "monthly"],
  },
  {
    id: "demo-17",
    date: "2023-12-03",
    type: "spending",
    amount: 1800,
    category: "Rent & Mortgage",
    description: "Monthly Rent",
    source: "Demo Data",
    recurring: true,
    frequency: "monthly",
    tags: ["housing", "rent", "recurring", "monthly"],
  },
  {
    id: "demo-18",
    date: "2024-01-03",
    type: "spending",
    amount: 1800,
    category: "Rent & Mortgage",
    description: "Monthly Rent",
    source: "Demo Data",
    recurring: true,
    frequency: "monthly",
    tags: ["housing", "rent", "recurring", "monthly"],
  },
  {
    id: "demo-19",
    date: "2024-02-03",
    type: "spending",
    amount: 1800,
    category: "Rent & Mortgage",
    description: "Monthly Rent",
    source: "Demo Data",
    recurring: true,
    frequency: "monthly",
    tags: ["housing", "rent", "recurring", "monthly"],
  },
  {
    id: "demo-20",
    date: "2023-10-25",
    type: "spending",
    amount: 150.0,
    category: "Bills & Services",
    description: "Electricity Bill",
    source: "Demo Data",
    tags: ["utilities", "electricity", "recurring", "quarterly"],
  },
  {
    id: "demo-21",
    date: "2024-01-25",
    type: "spending",
    amount: 160.0,
    category: "Bills & Services",
    description: "Electricity Bill",
    source: "Demo Data",
    tags: ["utilities", "electricity", "recurring", "quarterly"],
  },
  {
    id: "demo-22",
    date: "2023-10-07",
    type: "spending",
    amount: 89.0,
    category: "Internet & Phone",
    description: "NBN + Mobile Bundle",
    source: "Demo Data",
    recurring: true,
    frequency: "monthly",
    tags: ["utilities", "internet", "mobile", "nbn", "recurring"],
  },
  {
    id: "demo-23",
    date: "2023-11-07",
    type: "spending",
    amount: 89.0,
    category: "Internet & Phone",
    description: "NBN + Mobile Bundle",
    source: "Demo Data",
    recurring: true,
    frequency: "monthly",
    tags: ["utilities", "internet", "mobile", "nbn", "recurring"],
  },
  {
    id: "demo-24",
    date: "2023-12-07",
    type: "spending",
    amount: 89.0,
    category: "Internet & Phone",
    description: "NBN + Mobile Bundle",
    source: "Demo Data",
    recurring: true,
    frequency: "monthly",
    tags: ["utilities", "internet", "mobile", "nbn", "recurring"],
  },
  {
    id: "demo-25",
    date: "2024-01-07",
    type: "spending",
    amount: 89.0,
    category: "Internet & Phone",
    description: "NBN + Mobile Bundle",
    source: "Demo Data",
    recurring: true,
    frequency: "monthly",
    tags: ["utilities", "internet", "mobile", "nbn", "recurring"],
  },
  {
    id: "demo-26",
    date: "2024-02-07",
    type: "spending",
    amount: 89.0,
    category: "Internet & Phone",
    description: "NBN + Mobile Bundle",
    source: "Demo Data",
    recurring: true,
    frequency: "monthly",
    tags: ["utilities", "internet", "mobile", "nbn", "recurring"],
  },
  {
    id: "demo-27",
    date: "2023-10-12",
    type: "spending",
    amount: 110.0,
    category: "Insurance",
    description: "Car Insurance",
    source: "Demo Data",
    recurring: true,
    frequency: "monthly",
    tags: ["insurance", "car", "recurring", "monthly"],
  },
  {
    id: "demo-28",
    date: "2023-11-12",
    type: "spending",
    amount: 110.0,
    category: "Insurance",
    description: "Car Insurance",
    source: "Demo Data",
    recurring: true,
    frequency: "monthly",
    tags: ["insurance", "car", "recurring", "monthly"],
  },
  {
    id: "demo-29",
    date: "2023-12-12",
    type: "spending",
    amount: 110.0,
    category: "Insurance",
    description: "Car Insurance",
    source: "Demo Data",
    recurring: true,
    frequency: "monthly",
    tags: ["insurance", "car", "recurring", "monthly"],
  },
  {
    id: "demo-30",
    date: "2024-01-12",
    type: "spending",
    amount: 110.0,
    category: "Insurance",
    description: "Car Insurance",
    source: "Demo Data",
    recurring: true,
    frequency: "monthly",
    tags: ["insurance", "car", "recurring", "monthly"],
  },
  {
    id: "demo-31",
    date: "2024-02-12",
    type: "spending",
    amount: 110.0,
    category: "Insurance",
    description: "Car Insurance",
    source: "Demo Data",
    recurring: true,
    frequency: "monthly",
    tags: ["insurance", "car", "recurring", "monthly"],
  },

  // ─────────────── Day-to-day spending ───────────────
  {
    id: "demo-32",
    date: "2023-10-05",
    type: "spending",
    amount: 85.5,
    category: "Grocery",
    description: "Woolworths Shop",
    source: "Demo Data",
    tags: ["grocery", "supermarket", "household"],
  },
  {
    id: "demo-33",
    date: "2023-10-12",
    type: "spending",
    amount: 92.3,
    category: "Grocery",
    description: "Coles Shop",
    source: "Demo Data",
    tags: ["grocery", "supermarket", "household"],
  },
  {
    id: "demo-34",
    date: "2023-10-19",
    type: "spending",
    amount: 78.1,
    category: "Grocery",
    description: "ALDI Shop",
    source: "Demo Data",
    tags: ["grocery", "discount", "household"],
  },
  {
    id: "demo-35",
    date: "2023-11-09",
    type: "spending",
    amount: 89.2,
    category: "Grocery",
    description: "Woolworths Shop",
    source: "Demo Data",
    tags: ["grocery", "supermarket"],
  },
  {
    id: "demo-36",
    date: "2023-12-14",
    type: "spending",
    amount: 94.6,
    category: "Grocery",
    description: "Coles Shop",
    source: "Demo Data",
    tags: ["grocery", "supermarket"],
  },
  {
    id: "demo-37",
    date: "2024-01-11",
    type: "spending",
    amount: 82.0,
    category: "Grocery",
    description: "ALDI Shop",
    source: "Demo Data",
    tags: ["grocery", "discount"],
  },
  {
    id: "demo-38",
    date: "2023-10-06",
    type: "spending",
    amount: 12.5,
    category: "Cafes & Coffees",
    description: "Local Cafe",
    source: "Demo Data",
    tags: ["coffee", "food", "treat"],
  },
  {
    id: "demo-39",
    date: "2023-10-18",
    type: "spending",
    amount: 8.9,
    category: "Cafes & Coffees",
    description: "Starbucks",
    source: "Demo Data",
    tags: ["coffee", "chain"],
  },
  {
    id: "demo-40",
    date: "2023-11-24",
    type: "spending",
    amount: 7.5,
    category: "Cafes & Coffees",
    description: "Flat White",
    source: "Demo Data",
    tags: ["coffee", "quick-bite"],
  },
  {
    id: "demo-41",
    date: "2024-01-08",
    type: "spending",
    amount: 5.2,
    category: "Cafes & Coffees",
    description: "Espresso",
    source: "Demo Data",
    tags: ["coffee", "quick-bite"],
  },
  {
    id: "demo-42",
    date: "2023-10-10",
    type: "spending",
    amount: 55.8,
    category: "Restaurant & Takeaway",
    description: "Restaurant Dinner",
    source: "Demo Data",
    tags: ["dining", "restaurant"],
  },
  {
    id: "demo-43",
    date: "2023-11-22",
    type: "spending",
    amount: 28.5,
    category: "Restaurant & Takeaway",
    description: "Pizza Place",
    source: "Demo Data",
    tags: ["dining", "pizza", "takeaway"],
  },
  {
    id: "demo-44",
    date: "2023-12-15",
    type: "spending",
    amount: 64.0,
    category: "Restaurant & Takeaway",
    description: "Thai Dinner",
    source: "Demo Data",
    tags: ["dining", "restaurant"],
  },
  {
    id: "demo-45",
    date: "2023-11-18",
    type: "spending",
    amount: 38.0,
    category: "Entertainment",
    description: "Cinema Tickets",
    source: "Demo Data",
    tags: ["entertainment", "movies"],
  },

  // ─────────────── Transport & Vehicle ───────────────
  {
    id: "demo-46",
    date: "2023-10-14",
    type: "spending",
    amount: 30.0,
    category: "Transport",
    description: "MyWay Top-Up",
    source: "Demo Data",
    tags: ["transport", "public-transport"],
  },
  {
    id: "demo-47",
    date: "2023-10-23",
    type: "spending",
    amount: 70.0,
    category: "Fuel",
    description: "BP Fuel",
    source: "Demo Data",
    tags: ["fuel", "car", "transport"],
  },
  {
    id: "demo-48",
    date: "2023-11-27",
    type: "spending",
    amount: 85.0,
    category: "Fuel",
    description: "Shell Fuel",
    source: "Demo Data",
    tags: ["fuel", "car", "transport"],
  },
  {
    id: "demo-49",
    date: "2024-01-19",
    type: "spending",
    amount: 78.0,
    category: "Fuel",
    description: "Caltex Fuel",
    source: "Demo Data",
    tags: ["fuel", "car", "transport"],
  },
  {
    id: "demo-50",
    date: "2023-11-10",
    type: "spending",
    amount: 350.0,
    category: "Vehicle Expenses",
    description: "Car Service",
    source: "Demo Data",
    tags: ["car", "maintenance"],
  },

  // ─────────────── Subscriptions ───────────────
  {
    id: "demo-51",
    date: "2023-11-02",
    type: "spending",
    amount: 22.99,
    category: "Subscriptions",
    description: "Netflix",
    source: "Demo Data",
    recurring: true,
    frequency: "monthly",
    tags: ["entertainment", "subscription", "recurring"],
  },
  {
    id: "demo-52",
    date: "2023-12-02",
    type: "spending",
    amount: 22.99,
    category: "Subscriptions",
    description: "Netflix",
    source: "Demo Data",
    recurring: true,
    frequency: "monthly",
    tags: ["entertainment", "subscription", "recurring"],
  },
  {
    id: "demo-53",
    date: "2024-01-02",
    type: "spending",
    amount: 22.99,
    category: "Subscriptions",
    description: "Netflix",
    source: "Demo Data",
    recurring: true,
    frequency: "monthly",
    tags: ["entertainment", "subscription", "recurring"],
  },

  // ─────────────── Shopping / Home ───────────────
  {
    id: "demo-54",
    date: "2023-12-05",
    type: "spending",
    amount: 1200.0,
    category: "Household & Appliances",
    description: "New Fridge",
    source: "Demo Data",
    tags: ["home", "appliance", "one-off"],
  },
  {
    id: "demo-55",
    date: "2023-12-18",
    type: "spending",
    amount: 50.0,
    category: "Gifts & Donations",
    description: "Holiday Gift",
    source: "Demo Data",
    tags: ["gift", "holiday", "family"],
  },

  // ─────────────── Travel ───────────────
  {
    id: "demo-56",
    date: "2023-12-20",
    type: "spending",
    amount: 450.0,
    category: "Travel",
    description: "Return Flights",
    source: "Demo Data",
    tags: ["travel", "airfare", "holiday"],
  },
  {
    id: "demo-57",
    date: "2023-12-22",
    type: "spending",
    amount: 380.0,
    category: "Travel",
    description: "Hotel Stay",
    source: "Demo Data",
    tags: ["travel", "hotel", "holiday"],
  },

  // ─────────────── BNPL Installments (3 x 100) ───────────────
  {
    id: "demo-58",
    date: "2023-12-25",
    type: "spending",
    amount: 100.0,
    category: "BNPL Installments",
    description: "Headphones (Afterpay 1/3)",
    source: "Demo Data",
    tags: ["bnpl", "installment", "electronics", "afterpay"],
  },
  {
    id: "demo-59",
    date: "2024-01-25",
    type: "spending",
    amount: 100.0,
    category: "BNPL Installments",
    description: "Headphones (Afterpay 2/3)",
    source: "Demo Data",
    tags: ["bnpl", "installment", "electronics", "afterpay"],
  },
  {
    id: "demo-60",
    date: "2024-02-25",
    type: "spending",
    amount: 100.0,
    category: "BNPL Installments",
    description: "Headphones (Afterpay 3/3)",
    source: "Demo Data",
    tags: ["bnpl", "installment", "electronics", "afterpay"],
  },

  // ─────────────── Education / Fees / Investing ───────────────
  {
    id: "demo-61",
    date: "2023-11-05",
    type: "spending",
    amount: 45.0,
    category: "Education",
    description: "Tech Book",
    source: "Demo Data",
    tags: ["education", "book", "learning"],
  },
  {
    id: "demo-62",
    date: "2023-11-30",
    type: "spending",
    amount: 10.0,
    category: "Fees & Charges",
    description: "Monthly Account Fee",
    source: "Demo Data",
    recurring: true,
    frequency: "monthly",
    tags: ["bank", "fee", "recurring"],
  },
  {
    id: "demo-63",
    date: "2023-10-27",
    type: "spending",
    amount: 500.0,
    category: "Investments (Buy/Sell)",
    description: "ETF Buy (DCA)",
    source: "Demo Data",
    tags: ["investment", "buy", "etf", "asx", "brokerage"],
  },
  {
    id: "demo-64",
    date: "2024-02-12",
    type: "spending",
    amount: 200.0,
    category: "Insurance",
    description: "pneumonoultramicroscopicsilicovolcanoconiosis and Pseudopseudohypoparathyroidism and Hippopotomonstrosesquippedaliophobia Insurance",
    source: "Demo Data",
    frequency: "monthly",
    tags: ["insurance", "health", "monthly"],
  },
];

// Tips banner state
const showTips = ref(true);
const dismissTips = () => {
  showTips.value = false;
  localStorage.setItem("financial-tracker-tips-dismissed", "true");
};

/** ========= HELPER FUNCTIONS ========= */
//  flags/state
const awaitingFile = ref(false);

//  go to demo confirmation
function confirmDemo() {
  onboardingStep.value = 1;
}

//  manual add path (mark tour as done so we don't pop it again)
function startManualAdd() {
  activeTab.value = "add";
  finishTour();
}

//  proper back behavior
function handleTourBack() {
  if (onboardingStep.value > 0) {
    onboardingStep.value--;
  } else {
    skipTour(); // exits the overlay
  }
}

// Tag Management Functions
function saveTags() {
  localStorage.setItem(ls.tags, JSON.stringify(tags.value));
}

function loadTags() {
  // Prefer new key; fall back to legacy if present
  const saved = localStorage.getItem(ls.tags)
    ?? localStorage.getItem("financial-tracker-tags"); // legacy
  if (saved) {
    try { tags.value = dedupeCI(JSON.parse(saved)); } catch {}
  }
}

// Onboarding Functions

function prevOnboardingStep() {
  if (onboardingStep.value > 0) onboardingStep.value--;
}
function startTourFromAbout() {
  showTour.value = true;
  onboardingStep.value = 0; // show the welcome step
  window.scrollTo(0, 0);
}

// function startImportFromOnboarding() {
//   activeTab.value = "import";
//   nextOnboardingStep();
// }

function nextOnboardingStep() {
  if (onboardingStep.value < 2) {
    onboardingStep.value++;
  }
}

function skipTour() {
  showTour.value = false;
  onboardingStep.value = 0;
  localStorage.setItem("hasSeenOnboarding", "true");
}

function finishTour() {
  showTour.value = false;
  onboardingStep.value = 0;
  localStorage.setItem("hasSeenOnboarding", "true");
  // loadDemoDataAndFinish();
}

function loadDemoDataAndFinish() {
  transactions.value = [...DEMO_DATA];
  showTour.value = false;
  onboardingStep.value = 0;
  localStorage.setItem("hasSeenOnboarding", "true");
  activeTab.value = "transactions";
  pushToast("Demo data loaded! Explore the features.", "success", 3000);
}

// function startImportFromEmptyState() {
//   activeTab.value = "import";
// }

/** Close any open <details.dropdown> when clicking outside or pressing Esc */
function closeOpenDropdowns(ev?: Event) {
  const target = ev?.target as Node | undefined;
  document
    .querySelectorAll<HTMLDetailsElement>("details.dropdown[open]")
    .forEach((d) => {
      if (target && d.contains(target)) return;
      d.open = false;
    });
}
function handleKeydown(e: KeyboardEvent) {
  if (e.key === "Escape") closeOpenDropdowns();
}

onMounted(() => {
  
  document.addEventListener("click", closeOpenDropdowns);
  document.addEventListener("keydown", handleKeydown);

  loadTags();
  hydrateTransactionsFromStorage();

  if (transactions.value.length === 0) {
    activeTab.value = "about";
  }
});

onUnmounted(() => {
  document.removeEventListener("click", closeOpenDropdowns);
  document.removeEventListener("keydown", handleKeydown);
});

/** ========= Types ========= */
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
  tags: string[]; // NEW: Tags array
  recurring?: boolean;
  frequency?: RecurringFrequency;
  recursions?: number;
  description: string;
  endDate?: string;
  source?: string;
}
const shareCodeLength = ref(0);
const SHARE_URL_SAFE_LIMIT = 1800;
const DEFAULT_SOURCE = "Unlabeled";
const sourceFilter = ref<string>("");
const uniqueSources = computed(() => {
  const s = new Set<string>();
  const arr = Array.isArray(transactions.value) ? transactions.value : [];
  arr.forEach((t) => {
    if (t.source) s.add(t.source);
  });
  return Array.from(s).sort();
});

const chartCategories = computed(() => {
  const s = new Set<string>();
  const arr = Array.isArray(transactions.value) ? transactions.value : [];
  for (const t of arr) s.add(t.category);
  return Array.from(s).sort((a, b) => a.localeCompare(b));
});

const categories = computed(() => {
  const s = new Set<string>();
  const arr = Array.isArray(transactions.value) ? transactions.value : [];
  arr.forEach((t) => s.add(t.category));
  categoryNames.forEach((c) => s.add(c));
  customCategories.value.forEach((c) => s.add(c));
  return Array.from(s).sort((a, b) => a.localeCompare(b));
});

/** ========= Tabs / Theme ========= */
// Use a computed property to hide the 'chart' tab when there's no data
const allTabs = [
  { id: "import", label: "Import", icon: "📥" },
  { id: "add", label: "Add", icon: "➕" },
  { id: "chart", label: "Chart", icon: "📊" },
  { id: "transactions", label: "Transactions", icon: "📋" },
  { id: "about", label: "About", icon: "ℹ️" },
];
const tabs = computed(() =>
  allTabs.filter((tab) => tab.id !== "chart" || transactions.value.length > 0)
);

const activeTab = ref<"import" | "add" | "chart" | "transactions" | "about">(
  "about"
);
function onTab(id: typeof activeTab.value) {
  activeTab.value = id;
  if (id === "chart") ensureAllCatsSelected();
}

const currentTheme = ref("cupcake");
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
    //document.documentElement.className = theme;
    localStorage.setItem("financial-tracker-theme", theme);
    window.dispatchEvent(new CustomEvent("theme-changed", { detail: theme }));
  }
}

/** ========= Toasts (live feedback) ========= */
type ToastKind = "success" | "info" | "warning" | "error";
const toasts = ref<{ id: number; message: string; kind: ToastKind }[]>([]);
let toastId = 1;

function pushToast(message: string, kind: ToastKind = "info", ms = 3500) {
  const id = toastId++;
  toasts.value.push({ id, message, kind });
  if (ms > 0) setTimeout(() => dismissToast(id), ms);
}
function dismissToast(id: number) {
  toasts.value = toasts.value.filter((t) => t.id !== id);
}

/** ========= Data ========= */
const transactions = ref<Transaction[]>([]);
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
  "Uncategorized",
];

/** Simple user rules (keyword -> category) for smart CRUD; persisted */
type Rule = { keyword: string; category: string };
const userRules = ref<Rule[]>(
  JSON.parse(localStorage.getItem("financial-tracker-rules") || "[]")
);

// /** Chart-category list reflects what's present in data only */
// const chartCategories = computed(() => {
//   const s = new Set<string>();
//   transactions.value.forEach((t) => s.add(t.category));
//   return Array.from(s).sort((a, b) => a.localeCompare(b));
// });

// /** All categories for inputs/filters - ALWAYS ALPHABETICAL */
// const categories = computed(() => {
//   const s = new Set<string>();
//   transactions.value.forEach((t) => s.add(t.category));
//   categoryNames.forEach((c) => s.add(c));
//   customCategories.value.forEach((c) => s.add(c));
//   return Array.from(s).sort((a, b) => a.localeCompare(b));
// });

// Enhanced Category Manager state
const catMgr = reactive<{
  open: boolean;
  newName: string;
  renaming: string;
  renameText: string;
  startMode: "" | "add" | "manage";
}>({
  open: false,
  newName: "",
  renaming: "",
  renameText: "",
  startMode: "",
});

function openCategoryManager(mode: "add" | "manage" = "manage") {
  openManager(mode);
  showCategoryManager.value = true;
  catMgr.startMode = mode;
  categorySearch.value = "";
  if (mode === "add") {
    nextTick(() => {
      const el = document.querySelector<HTMLInputElement>(
        '[data-testid="new-category-input"]'
      );
      el?.focus();
    });
  }
}

function normalizeCatName(n: string) {
  return (n || "")
    .replace(/\u00a0/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

const allCategoryLower = computed(
  () =>
    new Set<string>(
      [...categoryNames, ...customCategories.value].map((c) => c.toLowerCase())
    )
);

// // Persist custom categories
onMounted(() => {

  try {
    const legacy = localStorage.getItem("financial-tracker-custom-categories");
    if (legacy && !localStorage.getItem(ls.custom)) {
      localStorage.setItem(ls.custom, legacy);
      localStorage.removeItem("financial-tracker-custom-categories");
    }
  } catch {}
});
// onMounted(() => {
//   try {
//     const legacy = localStorage.getItem("financial-tracker-custom-categories");
//     if (legacy && !localStorage.getItem(ls.custom)) {
//       localStorage.setItem(ls.custom, legacy);
//       localStorage.removeItem("financial-tracker-custom-categories");
//     }
//     const savedCustom = localStorage.getItem(
//       "financial-tracker-custom-categories"
//     );
//     if (savedCustom) {
//       const parsed = JSON.parse(savedCustom);
//       if (Array.isArray(parsed)) {
//         customCategories.value = parsed
//           .map((x) => String(x || ""))
//           .filter(Boolean)
//           .sort((a, b) => a.localeCompare(b));
//       }
//     }
//   } catch {}

//   const raw = localStorage.getItem("financial-tracker-transactions");
//   if (raw) {
//     try {
//       transactions.value = JSON.parse(raw);
//     } catch {}
//   }
//   // tips dismissed flag
//   showTips.value =
//     localStorage.getItem("financial-tracker-tips-dismissed") !== "true" &&
//     transactions.value.length > 0;
//   if (transactions.value.length) renderChart();
// });

/** ========= Import / Export (seamless) ========= */
const isImporting = ref(false);
const importUrl = ref("");
const importStatus = ref("");
const importError = ref(false);
const lastImportSummary = ref("");

let suppressUrlWriteUntil = 0;

function beginImport(suppressMs = 4000) {
  isImporting.value = true;
  suppressUrlWriteUntil = Date.now() + suppressMs;
}
function endImport() {
  queueMicrotask(() => (isImporting.value = false));
}

function stripTxFromAddressBar() {
  try {
    const base =
      location.pathname +
      location.search
        .replace(/(\?|&)tx=[^&#]*/i, "")
        .replace(/\?&/, "?")
        .replace(/\?$/, "");
    const hash = location.hash.startsWith("#tx=") ? "" : location.hash;
    history.replaceState(null, "", base + hash);
  } catch {}
}

/** Compression helpers (fallback to URL-safe base64) */
let lz: any = null;
async function ensureLz() {
  if (!lz) {
    try {
      lz = await import("lz-string");
    } catch {
      lz = null;
    }
  }
}

function base64urlEncode(s: string) {
  const b64 = btoa(unescape(encodeURIComponent(s)));
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function base64urlDecode(b64u: string) {
  const b64 = b64u.replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64 + "===".slice((b64.length + 3) % 4);
  return decodeURIComponent(escape(atob(padded)));
}

async function encodeTxString(json: string) {
  await ensureLz();
  try {
    if (lz?.compressToEncodedURIComponent) {
      return "tx:" + lz.compressToEncodedURIComponent(json);
    }
  } catch {}
  return "tx:" + base64urlEncode(json);
}
async function decodeTxString(payload: string) {
  const s = payload.startsWith("tx:") ? payload.slice(3) : payload;
  await ensureLz();
  try {
    if (lz?.decompressFromEncodedURIComponent) {
      const out = lz.decompressFromEncodedURIComponent(s);
      if (out) return out;
    }
  } catch {}
  return base64urlDecode(s);
}

/** File upload */
const pendingFilename = ref<string | undefined>(undefined);
function handleFileUpload(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) {
    awaitingFile.value = false; // NEW: user likely cancelled
    return;
  }

  pendingFilename.value = file.name;

  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      parseCSV(String(ev.target?.result || ""), pendingFilename.value);
    } catch (err: any) {
      setImportStatus(
        "Error parsing CSV: " + (err?.message || String(err)),
        true
      );
    } finally {
      input.value = "";
      awaitingFile.value = false; // NEW
    }
  };
  reader.readAsText(file);
}

/** Import from input (URL or share code) */
async function importFromUrlOrCode() {
  const raw = importUrl.value.trim();
  if (!raw) return;
  try {
    if (raw.startsWith("tx:") || /^[A-Za-z0-9\-_]+$/.test(raw)) {
      beginImport();
      try {
        const json = await decodeTxString(
          raw.startsWith("tx:") ? raw : "tx:" + raw
        );
        loadTransactionsFromJSON(json);
        stripTxFromAddressBar();
        setImportStatus("Imported from share code.");
        importUrl.value = "";
      } finally {
        endImport();
      }
      return;
    }

    const parsed = new URL(raw, window.location.origin);
    const maybeTx =
      parsed.searchParams.get("tx") ||
      (parsed.hash.startsWith("#tx=") ? parsed.hash.slice(4) : "");
    if (maybeTx) {
      beginImport();
      try {
        const json = await decodeTxString(
          maybeTx.startsWith("tx:") ? maybeTx : "tx:" + maybeTx
        );
        loadTransactionsFromJSON(json);
        stripTxFromAddressBar();
        setImportStatus("Imported from share link.");
        importUrl.value = "";
      } finally {
        endImport();
      }
      return;
    }

    setImportStatus("Fetching…", false, { toast: false });
    const res = await fetch(raw);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    parseCSV(text);
    importUrl.value = "";
  } catch (err: any) {
    setImportStatus("Failed to import: " + (err?.message || String(err)), true);
  }
}

/** Import from clipboard */
async function importFromClipboard() {
  try {
    const txt = await navigator.clipboard.readText();
    importUrl.value = txt;
    await importFromUrlOrCode();
  } catch {
    setImportStatus(
      "Clipboard read failed. Paste the code/link manually.",
      true
    );
  }
}

function tryImportFromLocation() {
  const url = new URL(window.location.href);
  const tx =
    url.searchParams.get("tx") ||
    (url.hash.startsWith("#tx=") ? url.hash.slice(4) : "");
  if (!tx) {
    setImportStatus("No tx payload in current URL.");
    return;
  }
  (async () => {
    try {
      const json = await decodeTxString(tx.startsWith("tx:") ? tx : "tx:" + tx);
      loadTransactionsFromJSON(json);
      setImportStatus("Imported from current URL.");
    } catch (err: any) {
      setImportStatus(
        "Failed to decode payload from URL: " + (err?.message || String(err)),
        true
      );
    }
  })();
}

function setImportStatus(
  msg: string,
  isError = false,
  opts?: { toast?: boolean; ms?: number }
) {
  importStatus.value = msg;
  importError.value = isError;
  if (opts?.toast === false) return;
  pushToast(msg, isError ? "error" : "info", opts?.ms ?? 3500);
}

/** ========= CSV parser with bank detection + debit/credit handling ========= */
function parseCSV(csvText: string, filename?: string) {
  const linesRaw = csvText.split(/\r?\n/);
  const lines = linesRaw.filter((l) => l.trim().length > 0);
  if (lines.length < 1) {
    setImportStatus("CSV empty/invalid", true);
    return;
  }

  const headerCellsRaw = smartSplit(lines[0]).map((h) =>
    h
      .replace(/^\uFEFF/, "")
      .replace(/^"|"$/g, "")
      .trim()
  );
  const headersLower = headerCellsRaw.map((h) =>
    h.toLowerCase().replace(/\s+/g, " ").replace(/[()]/g, "")
  );

  const findIndex = (headers: string[], needles: string[]) => {
    for (const key of needles) {
      const idx = headers.findIndex((h) => h === key || h.includes(key));
      if (idx >= 0) return idx;
    }
    return -1;
  };

  let iDate = findIndex(headersLower, [
    "date",
    "transaction date",
    "posted date",
    "settled date",
    "date and time",
  ]);
  let iDesc = findIndex(headersLower, [
    "transaction description",
    "description",
    "details",
    "narrative",
    "merchant",
    "transaction details",
    "payee",
  ]);
  let iAmt = findIndex(headersLower, [
    "amount",
    "amount aud",
    "total aud",
    "value",
    "total (aud)",
    "total",
  ]);
  let iDebit = findIndex(headersLower, ["debit amount", "debit", "withdrawal"]);
  let iCredit = findIndex(headersLower, ["credit amount", "credit", "deposit"]);

  if (iDebit >= 0 && iCredit >= 0) iAmt = -1;

  const headerLooksLikeData = () => {
    const cols = smartSplit(lines[0]);
    return /^\d/.test((cols[0] || "").trim()) && cols.length >= 3;
  };
  const startRow = headerLooksLikeData() ? 0 : 1;

  if (
    startRow === 0 &&
    (iDate < 0 || iDesc < 0) &&
    iAmt < 0 &&
    (iDebit < 0 || iCredit < 0)
  ) {
    iDate = 0;
    iAmt = 1;
    iDesc = 2;
  }

  const haveSingleAmount = iAmt >= 0;
  const haveDebitCredit = iDebit >= 0 && iCredit >= 0;
  if (iDate < 0 || iDesc < 0 || (!haveSingleAmount && !haveDebitCredit)) {
    setImportStatus(
      "Missing required columns (need date/description and amount or debit+credit).",
      true
    );
    return;
  }

  const parseMoney = (s: string): number => {
    if (!s) return 0;
    let t = s.trim();
    const negParen = /^\(.*\)$/.test(t);
    t = t
      .replace(/^\$\-/, "-$")
      .replace(/[,$]/g, "")
      .replace(/\s+/g, "")
      .replace(/^\$|^\(|\)$/g, "");
    if (/^\d{1,3}(\.\d{3})+,\d{2}$/.test(t))
      t = t.replace(/\./g, "").replace(",", ".");
    const n = Number(t);
    if (!isFinite(n)) return 0;
    return negParen ? -Math.abs(n) : n;
  };

  let amountConvention: "normal" | "expensesPositive" = "normal";
  if (haveSingleAmount) {
    let pos = 0,
      neg = 0;
    const scanRows = lines.slice(
      startRow,
      Math.min(lines.length, startRow + 200)
    );
    for (const ln of scanRows) {
      const cols = smartSplit(ln).map((c) => c.replace(/^"|"$/g, "").trim());
      const v = parseMoney(cols[iAmt] ?? "");
      if (v > 0) pos++;
      else if (v < 0) neg++;
    }
    if (pos > 0 && neg === 0) amountConvention = "expensesPositive";
    else if (pos > neg * 10) amountConvention = "expensesPositive";
  }

  const imported: Transaction[] = [];
  let skipped = 0;

  for (let r = startRow; r < lines.length; r++) {
    const rawLine = lines[r];
    const cols = smartSplit(rawLine).map((c) => c.replace(/^"|"$/g, "").trim());
    if (!cols.length) {
      skipped++;
      continue;
    }

    const iso = parseDateGuess(cols[iDate] ?? "");
    if (!iso) {
      skipped++;
      continue;
    }

    const description = String(cols[iDesc] ?? "").trim();

    let kind: TransactionType = "spending";
    let amtAbs = 0;

    if (haveDebitCredit) {
      const d = parseMoney(cols[iDebit] ?? "");
      const c = parseMoney(cols[iCredit] ?? "");
      if (Math.abs(d) < 1e-9 && Math.abs(c) < 1e-9) {
        skipped++;
        continue;
      }
      if (Math.abs(d) >= Math.abs(c)) {
        kind = "spending";
        amtAbs = Math.abs(d || -c);
      } else {
        kind = "income";
        amtAbs = Math.abs(c || -d);
      }
    } else {
      const a = parseMoney(cols[iAmt] ?? "");
      if (amountConvention === "expensesPositive") {
        kind = a >= 0 ? "spending" : "income";
      } else {
        kind = a >= 0 ? "income" : "spending";
      }
      amtAbs = Math.abs(a);
      if (amtAbs < 1e-9) {
        skipped++;
        continue;
      }
    }

    const ruleHit = userRules.value.find((r) =>
      description.toLowerCase().includes(r.keyword.toLowerCase())
    );
    const category = ruleHit ? ruleHit.category : autoCategory(description);

    imported.push({
      id: `${Date.now()}-${r}-${Math.floor(Math.random() * 10000)}`,
      date: iso,
      type: kind,
      amount: Number(amtAbs.toFixed(2)),
      category,
      tags: [], // Initialize with empty tags for imported transactions
      description,
      recurring: false,
      frequency: "monthly",
      recursions: 1,
      endDate: "",
    });
  }

  if (!imported.length) {
    setImportStatus("No valid rows found in CSV.", true);
    return;
  }

  labelImport.open = true;
  labelImport.filename = filename;
  labelImport.imported = imported;
  labelImport.skipped = skipped;

  lastImportSummary.value =
    `Parsed ${imported.length} transaction${
      imported.length === 1 ? "" : "s"
    }. ` + `Please label this import to complete.`;
}

const labelImport = reactive<{
  open: boolean;
  filename?: string;
  imported: Transaction[];
  skipped: number;
  label: string;
  note: string;
}>({
  open: false,
  filename: undefined,
  imported: [],
  skipped: 0,
  label: "",
  note: "",
});

function confirmLabelImport() {
  const label =
    labelImport.label.trim() ||
    (labelImport.filename || "").replace(/\.[^.]+$/, "") ||
    "Imported";
  const merged = labelImport.imported.map((t) => ({ ...t, source: label }));
  transactions.value = [...transactions.value, ...merged];

  // ✅ mark onboarding as seen after a successful import
  localStorage.setItem("hasSeenOnboarding", "true");

  const count = merged.length;
  lastImportSummary.value = `Imported ${count} transaction${
    count === 1 ? "" : "s"
  } from "${label}"`;
  setImportStatus(lastImportSummary.value);

  Object.assign(labelImport, {
    open: false,
    imported: [],
    skipped: 0,
    filename: undefined,
    label: "",
    note: "",
  });
}

function cancelLabelImport() {
  Object.assign(labelImport, {
    open: false,
    imported: [],
    skipped: 0,
    filename: undefined,
    label: "",
    note: "",
  });
  setImportStatus("Import cancelled.", true);
}

/** ========= Safer CSV split ========= */
function smartSplit(line: string) {
  const out: string[] = [];
  let cur = "";
  let q = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (q && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else q = !q;
    } else if (ch === "," && !q) {
      out.push(cur);
      cur = "";
    } else cur += ch;
  }
  out.push(cur);
  return out;
}

/** ========= Select similar ========= */
function duplicateTx(t: Transaction) {
  const copy: Transaction = {
    ...t,
    id: `${Date.now()}-${Math.floor(Math.random() * 10000)}`,
  };
  transactions.value.push(copy);
  pushToast("Transaction duplicated", "success");
}

/** ========= Date helpers ========= */
function parseDateGuess(raw: string) {
  let s = (raw || "").trim();
  if (!s) return "";

  const isoDateAtStart = s.match(/^(\d{4}-\d{2}-\d{2})/);
  if (isoDateAtStart) return isoDateAtStart[1];

  let m = s.match(/^(\d{1,2})[\/](\d{1,2})[\/](\d{2,4})/);
  if (m) {
    const d = Number(m[1]),
      mo = Number(m[2]),
      y = m[3];
    const yyyy = y.length === 2 ? (Number(y) >= 70 ? "19" + y : "20" + y) : y;
    return `${yyyy}-${String(mo).padStart(2, "0")}-${String(d).padStart(
      2,
      "0"
    )}`;
  }

  m = s.match(/^(\d{1,2})-(\d{1,2})-(\d{2,4})/);
  if (m) {
    const d = Number(m[1]),
      mo = Number(m[2]),
      y = m[3];
    const yyyy = y.length === 2 ? (Number(y) >= 70 ? "19" + y : "20" + y) : y;
    return `${yyyy}-${String(mo).padStart(2, "0")}-${String(d).padStart(
      2,
      "0"
    )}`;
  }

  m = s.match(/^(\d{1,2})\s+([A-Za-z]{3,9})\s+(\d{2,4})/);
  if (m) {
    const d = Number(m[1]);
    const mon = m[2].toLowerCase().slice(0, 3);
    const map: Record<string, string> = {
      jan: "01",
      feb: "02",
      mar: "03",
      apr: "04",
      may: "05",
      jun: "06",
      jul: "07",
      aug: "08",
      sep: "09",
      oct: "10",
      nov: "11",
      dec: "12",
    };
    const mm = map[mon] || "01";
    const y = m[3];
    const yyyy = y.length === 2 ? (Number(y) >= 70 ? "19" + y : "20" + y) : y;
    return `${yyyy}-${mm}-${String(d).padStart(2, "0")}`;
  }

  const t = Date.parse(s);
  return isNaN(t) ? "" : new Date(t).toISOString().slice(0, 10);
}
function todayLocalISO() {
  return toLocalISO(new Date());
}
function pad2(n: number) {
  return String(n).padStart(2, "0");
}
function toLocalISO(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/** ========= Categoriser + rules ========= */
function autoCategory(description?: string) {
  const lower = (description || "").toLowerCase();
  if (/mcdonald|kfc|subway|domino/.test(lower)) return "Restaurant & Takeaway";
  if (/woolworths|coles|aldi/.test(lower)) return "Grocery";
  if (/chemists?|pharmacy|chemist warehouse/.test(lower))
    return "Health & Medical";
  return "Uncategorized";
}
function addRuleFromSelection(keyword: string, category: string) {
  if (!keyword || !category) return;
  userRules.value.push({ keyword, category });
  localStorage.setItem(
    "financial-tracker-rules",
    JSON.stringify(userRules.value)
  );
  pushToast(`Rule added: "${keyword}" → ${category}`, "success");
}

/** ========= Export / Share ========= */
const shareCode = ref("tx:");
const shareUrl = computed(() => {
  const base = `${location.origin}${location.pathname}`;
  const cached = localStorage.getItem("financial-tracker-last-share");
  return cached ? `${base}?tx=${cached}` : base;
});

async function recomputeShareArtifactsNow() {
  const base = `${location.origin}${location.pathname}`;
  const json = JSON.stringify(transactions.value);

  const encoded = await encodeTxString(json);
  const payload = encoded.replace(/^tx:/, "");

  shareCode.value = encoded;
  shareCodeLength.value = payload.length;
  localStorage.setItem("financial-tracker-last-share", payload);

  const canWriteUrl =
    payload.length <= SHARE_URL_SAFE_LIMIT &&
    Date.now() > suppressUrlWriteUntil &&
    !isImporting.value;

  if (canWriteUrl) {
    try {
      history.replaceState(null, "", `${base}?tx=${payload}`);
    } catch {}
  }
}

let recomputeTimer: number | null = null;
function scheduleRecomputeShareArtifacts() {
  if (recomputeTimer) window.clearTimeout(recomputeTimer);
  recomputeTimer = window.setTimeout(() => {
    recomputeTimer = null;
    recomputeShareArtifactsNow();
  }, 250);
}

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    pushToast("Copied to clipboard", "success");
  } catch {
    pushToast("Copy failed — select and copy manually", "warning");
  }
}
const canWebShare = "share" in navigator;
async function webShare(url: string) {
  if (!canWebShare) return;
  try {
    await (navigator as any).share({
      title: "myAniFi",
      text: "My transactions (auto-import link)",
      url,
    });
  } catch {}
}

/** ========= QR create / clear ========= */
const qrCanvas = ref<HTMLCanvasElement | null>(null);
const qrError = ref("");
async function renderQr() {
  try {
    const QR = await import("qrcode")
      .then((m) => m.default || m)
      .catch(() => null as any);
    const canvas = qrCanvas.value;
    if (!QR || !canvas) {
      throw new Error('QR module missing. Add dependency "qrcode".');
    }
    await QR.toCanvas(canvas, shareUrl.value, { margin: 1, width: 280 });
    qrError.value = "";
  } catch (err: any) {
    qrError.value = err?.message || 'QR generation failed. Install "qrcode".';
  }
}
function clearQr() {
  const ctx = qrCanvas.value?.getContext("2d");
  if (ctx && qrCanvas.value) {
    ctx.clearRect(0, 0, qrCanvas.value!.width, qrCanvas.value!.height);
  }
}

/** ========= QR scan (BarcodeDetector API) ========= */
const scanning = ref(false);
const qrVideo = ref<HTMLVideoElement | null>(null);
let mediaStream: MediaStream | null = null;
let scanHandle: number | null = null;

async function startQrScan() {
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
      audio: false,
    });
    const video = qrVideo.value!;
    video.srcObject = mediaStream;
    await video.play();
    scanning.value = true;

    const hasDetector = "BarcodeDetector" in window;
    if (!hasDetector) {
      pushToast(
        "BarcodeDetector not supported. Use the share link or code instead.",
        "warning",
        6000
      );
      return;
    }
    const Detector = (window as any).BarcodeDetector;
    const detector = new Detector({ formats: ["qr_code"] });

    const tick = async () => {
      if (!scanning.value) return;
      try {
        const barcodes = await detector.detect(video);
        if (barcodes?.length) {
          const raw = barcodes[0].rawValue || "";
          await handleQRPayload(raw);
          stopQrScan();
          return;
        }
      } catch {}
      scanHandle = requestAnimationFrame(tick);
    };
    scanHandle = requestAnimationFrame(tick);
  } catch {
    pushToast(
      "Camera unavailable. Grant permission or use share code.",
      "error",
      6000
    );
  }
}
function stopQrScan() {
  scanning.value = false;
  if (scanHandle) {
    cancelAnimationFrame(scanHandle);
    scanHandle = null;
  }
  try {
    const tracks = mediaStream?.getTracks() || [];
    tracks.forEach((t) => t.stop());
    mediaStream = null;
  } catch {}
}
async function handleQRPayload(raw: string) {
  try {
    if (!raw) return;
    const u = safeUrl(raw);
    if (u) {
      const tx =
        u.searchParams.get("tx") ||
        (u.hash.startsWith("#tx=") ? u.hash.slice(4) : "");
      if (tx) {
        const json = await decodeTxString(
          tx.startsWith("tx:") ? tx : "tx:" + tx
        );
        loadTransactionsFromJSON(json);
        setImportStatus("Imported from QR share link.");
        return;
      }
    }
    const json = await decodeTxString(
      raw.startsWith("tx:") ? raw : "tx:" + raw
    );
    loadTransactionsFromJSON(json);
    setImportStatus("Imported from QR share code.");
  } catch {
    setImportStatus("QR content not recognised.", true);
  }
}
function safeUrl(maybe: string) {
  try {
    return new URL(maybe);
  } catch {
    return null;
  }
}

/** ========= JSON load (shape guard) ========= */
function loadTransactionsFromJSON(json: string) {
  const arr = JSON.parse(json) as Transaction[];
  if (!Array.isArray(arr)) throw new Error("Invalid payload");

  const clean: Transaction[] = arr.map((t: any) => ({
    id: String(t.id ?? `${Date.now()}-${Math.floor(Math.random() * 10000)}`),
    date: String(t.date ?? todayLocalISO()),
    type: t.type === "income" ? "income" : "spending",
    amount: Number(t.amount ?? 0),
    category: String(t.category ?? "Uncategorized"),
    tags: Array.isArray(t.tags) ? t.tags : [],
    description: String(t.description ?? ""),
    recurring: !!t.recurring,
    frequency: t.frequency ?? "monthly",
    recursions: Number(t.recursions ?? 1),
    endDate: String(t.endDate ?? ""),
    source: String(t.source ?? DEFAULT_SOURCE),
  }));

  transactions.value = clean;

  const imported = clean.length;
  lastImportSummary.value = `Imported ${imported} transaction${
    imported === 1 ? "" : "s"
  } from shared data.`;
  setImportStatus(lastImportSummary.value);
}

/** ========= Add/Edit Form with Tags ========= */
const newTransaction = reactive<Transaction>({
  id: "",
  date: todayLocalISO(),
  type: "spending",
  amount: 0,
  category: "",
  tags: [],
  description: "",
  recurring: false,
  frequency: "monthly",
  recursions: 1,
  endDate: "",
  source: "Manual",
});
const currentlyEditingId = ref<string | null>(null);
const addDateTextRef = ref<HTMLInputElement | null>(null);
const newTxDateError = ref("");
const addDatePickerRef = ref<HTMLInputElement | null>(null);
const newTxDateISO = computed<string>({
  get() {
    return newTransaction.date || todayLocalISO();
  },
  set(v: string) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) newTransaction.date = v;
  },
});
const newTxDateText = ref(isoToDDMMYYYY(newTransaction.date));
watch(newTxDateISO, (iso) => (newTxDateText.value = isoToDDMMYYYY(iso) || ""));

function onAddDateInput(e: Event) {
  newTxDateError.value = "";
  newTxDateText.value = formatDDMMProgressive(
    (e.target as HTMLInputElement).value
  );
  addDateTextRef.value?.setCustomValidity?.("");
}
function onAddDateBlur() {
  newTxDateError.value = "";
  const ddmmyyyy = finalizeDDMM(newTxDateText.value);
  if (ddmmyyyy) {
    const iso = ddmmyyyyToISO(ddmmyyyy);
    if (iso) {
      newTxDateText.value = ddmmyyyy;
      newTxDateISO.value = iso;
      addDateTextRef.value?.setCustomValidity?.("");
      return;
    }
  }
  newTxDateText.value = "";
  newTxDateISO.value = "";
  newTxDateError.value = "Please use dd-mm-yyyy (e.g. 05-01-2025).";
  addDateTextRef.value?.setCustomValidity?.(newTxDateError.value);
  addDateTextRef.value?.reportValidity?.();
}
function onDateKeydownDigitsOnly(e: KeyboardEvent) {
  const ok = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", "-"];
  if (ok.includes(e.key)) return;
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

// Tag management in add form
function addTagToTransaction(name: string) {
  const t = norm(String(name));
  if (!t) return;

  // Ensure master list contains it
  if (!containsCaseIns(tags.value, t)) {
    tags.value = sortAlpha(dedupeCI([...tags.value, t]));
    saveTags(); // unified below
  }

  // Add to the current transaction (no dupes)
  const canonical = tags.value.find(x => eqi(x, t)) || t;
  if (!newTransaction.tags.some(x => eqi(x, canonical))) {
    newTransaction.tags = [...newTransaction.tags, canonical];
  }
}

function removeTagFromTransaction(name: string) {
  newTransaction.tags = newTransaction.tags.filter(t => !eqi(t, name));

}

/** ========= Recurring Transactions  ========= */
function generateRecurringTransactions(baseTx: Transaction): Transaction[] {
  const transactions: Transaction[] = [];
  const numOccurrences = Math.max(1, Number(baseTx.recursions || 1));

  for (let i = 0; i < numOccurrences; i++) {
    let occurrenceDate: string;

    if (i === 0) {
      occurrenceDate = baseTx.date;
    } else {
      occurrenceDate = calculateNextOccurrenceDate(
        baseTx.date,
        baseTx.frequency || "monthly",
        i
      );
    }

    transactions.push({
      ...baseTx,
      id: `${Date.now()}-${Math.floor(Math.random() * 10000)}-${i}`,
      date: occurrenceDate,
      recurring: i === 0 ? baseTx.recurring : false,
      recursions: i === 0 ? baseTx.recursions : 1,
      endDate: i === 0 ? baseTx.endDate : "",
    });
  }

  return transactions;
}

function calculateNextOccurrenceDate(
  startDate: string,
  frequency: RecurringFrequency,
  occurrenceIndex: number
): string {
  const date = new Date(startDate);

  switch (frequency) {
    case "daily":
      date.setDate(date.getDate() + occurrenceIndex);
      break;
    case "weekly":
      date.setDate(date.getDate() + occurrenceIndex * 7);
      break;
    case "fortnightly":
      date.setDate(date.getDate() + occurrenceIndex * 14);
      break;
    case "monthly":
      date.setMonth(date.getMonth() + occurrenceIndex);
      break;
    case "quarterly":
      date.setMonth(date.getMonth() + occurrenceIndex * 3);
      break;
    case "yearly":
      date.setFullYear(date.getFullYear() + occurrenceIndex);
      break;
  }

  return toLocalISO(date);
}

function addTransaction() {
  if (newTransaction.amount <= 0 || !newTransaction.category) return;

  if (currentlyEditingId.value) {
    const i = transactions.value.findIndex(
      (t) => t.id === currentlyEditingId.value
    );
    if (i > -1) {
      transactions.value[i] = {
        ...newTransaction,
        id: currentlyEditingId.value,
      };
    }
    currentlyEditingId.value = null;
    resetForm();
    pushToast("Transaction updated", "success");
    return;
  }

  const baseTx = {
    ...newTransaction,
    id: `${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    source: newTransaction.source || "Manual",
  };

  if (newTransaction.recurring) {
    const recurringTransactions = generateRecurringTransactions(baseTx);
    transactions.value.push(...recurringTransactions);
    pushToast(
      `Added ${recurringTransactions.length} recurring transactions`,
      "success"
    );
  } else {
    transactions.value.push(baseTx);
    pushToast("Transaction added", "success");
  }

  resetForm();
}

function resetForm() {
  Object.assign(newTransaction, {
    id: "",
    date: todayLocalISO(),
    type: "spending",
    amount: 0,
    category: "",
    tags: [],
    description: "",
    recurring: false,
    frequency: "monthly",
    recursions: 1,
    endDate: "",
  });
  currentlyEditingId.value = null;
}

function editTransaction(t: Transaction) {
  Object.assign(newTransaction, t);
  currentlyEditingId.value = t.id;
  activeTab.value = "add";
}
const deleteTransaction = (id: string) => {
  if (confirm("Delete this transaction?")) {
    const i = transactions.value.findIndex((t) => t.id === id);
    if (i > -1) transactions.value.splice(i, 1);
    pushToast("Transaction deleted", "success");
  }
};
function clearAllTransactions() {
  if (!transactions.value) {
    alert("Nothing to remove.");
    return;
  }
  if (
    confirm(
      `Remove ALL ${transactions.value.length} transactions? This cannot be undone.`
    )
  ) {
    transactions.value = [];
    localStorage.removeItem("financial-tracker-transactions");
    pushToast("All transactions removed", "success");
  }
}

/** ========= Filtering / Sorting / Selection with Tags ========= */
const searchQuery = ref("");
const selectedTagsForFilter = ref<string[]>([]);
const smartFilter = ref<{ text: string }>({ text: "" });
const typeFilter = ref<TransactionType | "">("");
const sortField = ref<"date" | "type" | "amount" | "category">("date");
const sortOrder = ref<"asc" | "desc">("desc");
const prioritizeSelected = ref(true);

// Date filter
const dateFilter = ref<{ start: string; end: string }>({ start: "", end: "" });
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
function applyDatePreset(preset: any) {
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
      const start = new Date(today.getTime() - preset.days * 86400000);
      dateFilter.value.start = toLocalISO(start);
      dateFilter.value.end = toLocalISO(today);
  }
}
function resetDateFilter() {
  applyDatePreset(datePresets.find((p) => p.label === "All Time")!);
}
function formatDateRange() {
  if (!dateFilter.value.start || !dateFilter.value.end) return "All time";
  const s = new Date(dateFilter.value.start),
    e = new Date(dateFilter.value.end);
  const diff = Math.ceil(Math.abs(+e - +s) / 86400000);
  return `${formatDate(dateFilter.value.start)} - ${formatDate(
    dateFilter.value.end
  )} (${diff} days)`;
}

type AmountCond = { op: ">" | "<" | ">=" | "<=" | "="; n: number };
type UnifiedQuery = {
  terms: string[];
  notTerms: string[];
  types: Array<"income" | "spending">;
  categories: string[];
  tags: string[];
  notTags: string[];
  sources: string[];
  amount: AmountCond[]; // all must pass
  dateStart?: string; // inclusive YYYY-MM-DD
  dateEnd?: string; // inclusive YYYY-MM-DD
};

const cmpOps = [">=", "<=", ">", "<", "="] as const;

function stripQuotes(s: string) {
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    return s.slice(1, -1);
  }
  return s;
}

function parseRelRange(spec: string): { start: string; end: string } | null {
  // spec like 30d, 12m, 2y, 8w
  const m = spec.match(/^(\d+)\s*([dwmy])$/i);
  if (!m) return null;
  const n = Number(m[1]);
  const unit = m[2].toLowerCase();
  const end = new Date();
  const start = new Date(end);
  if (unit === "d") start.setDate(end.getDate() - (n - 1));
  if (unit === "w") start.setDate(end.getDate() - (n * 7 - 1));
  if (unit === "m") start.setMonth(end.getMonth() - (n - 1));
  if (unit === "y") start.setFullYear(end.getFullYear() - (n - 1));
  return { start: toLocalISO(start), end: toLocalISO(end) };
}

function parseDateRangeToken(v: string): { start?: string; end?: string } {
  // date:YYYY-MM-DD..YYYY-MM-DD  OR YYYY-MM..YYYY-MM
  if (v.includes("..")) {
    const [a, b] = v.split("..").map((x) => x.trim());
    const start = parseDateGuess(a) || "";
    const end = parseDateGuess(b) || "";
    return { start: start || undefined, end: end || undefined };
  }
  const iso = parseDateGuess(v);
  return { start: iso || undefined, end: iso || undefined };
}

function parseUnifiedQuery(q: string): UnifiedQuery {
  const out: UnifiedQuery = {
    terms: [],
    notTerms: [],
    types: [],
    categories: [],
    tags: [],
    notTags: [],
    sources: [],
    amount: [],
  };
  if (!q?.trim()) return out;

  // Tokenize: "quoted strings", '#tag', key:"quoted val", key:val, comparators, or bare tokens
  const re =
    /(\w+:(?:"[^"]+"|'[^']+'|[^\s]+))|#[^\s]+|"(?:[^"\\]|\\.)+"|'(?:[^'\\]|\\.)+'|(?:>=|<=|>|<|=)\s*\d+(?:\.\d+)?|\S+/g;
  const tokens = (q.match(re) || []).map((t) => t.trim());

  for (let raw of tokens) {
    const neg = raw.startsWith("-");
    if (neg) raw = raw.slice(1);

    // amount comparator without key (e.g., >20, <= 100)
    if (cmpOps.some((op) => raw.startsWith(op))) {
      const op = cmpOps.find((o) => raw.startsWith(o))!;
      const n = Number(raw.slice(op.length).trim());
      if (!Number.isNaN(n)) out.amount.push({ op, n });
      continue;
    }

    // #tag
    if (raw.startsWith("#")) {
      const tag = raw.slice(1).toLowerCase();
      if (tag) (neg ? out.notTags : out.tags).push(tag);
      continue;
    }

    // key:value
    const kv = raw.match(/^([A-Za-z]+):(.*)$/);
    if (kv) {
      const key = kv[1].toLowerCase();
      const val = stripQuotes(kv[2]).trim();

      if (!val) continue;
      switch (key) {
        case "type":
        case "t":
          if (val === "income" || val === "spending") out.types.push(val);
          break;
        case "category":
        case "cat":
        case "c":
          out.categories.push(val.toLowerCase());
          break;
        case "tag":
        case "tags":
          (neg ? out.notTags : out.tags).push(val.toLowerCase());
          break;
        case "source":
        case "src":
        case "s":
          out.sources.push(val.toLowerCase());
          break;
        case "amount":
        case "amt":
        case "$": {
          const op = cmpOps.find((o) => val.startsWith(o)) || "=";
          const num = Number(val.slice(op.length).trim());
          if (!Number.isNaN(num)) out.amount.push({ op, n: num });
          break;
        }
        case "date": {
          const { start, end } = parseDateRangeToken(val);
          if (start) out.dateStart = start;
          if (end) out.dateEnd = end;
          break;
        }
        case "since":
        case "from":
        case "after": {
          const iso = parseDateGuess(val);
          if (iso) out.dateStart = iso;
          break;
        }
        case "until":
        case "to":
        case "before": {
          const iso = parseDateGuess(val);
          if (iso) out.dateEnd = iso;
          break;
        }
        case "last":
        case "past": {
          const r = parseRelRange(val);
          if (r) {
            out.dateStart = r.start;
            out.dateEnd = r.end;
          }
          break;
        }
        case "desc":
        case "description":
        case "q":
        case "text":
          (neg ? out.notTerms : out.terms).push(val.toLowerCase());
          break;
        default:
          // Unknown key → treat as free text
          (neg ? out.notTerms : out.terms).push(`${key}:${val}`.toLowerCase());
      }
      continue;
    }

    // bare text → free-term
    (neg ? out.notTerms : out.terms).push(stripQuotes(raw).toLowerCase());
  }

  return out;
}

function matchAmount(n: number, conds: AmountCond[]) {
  return conds.every((c) => {
    if (c.op === ">") return n > c.n;
    if (c.op === ">=") return n >= c.n;
    if (c.op === "<") return n < c.n;
    if (c.op === "<=") return n <= c.n;
    return n === c.n;
  });
}

function inDateRangeISO(d: string, start?: string, end?: string) {
  if (start && d < start) return false;
  if (end && d > end) return false;
  return true;
}

function matchesUnified(t: Transaction, uq: UnifiedQuery) {
  // date
  if (!inDateRangeISO(t.date, uq.dateStart, uq.dateEnd)) return false;

  // type
  if (uq.types.length && !uq.types.includes(t.type)) return false;

  // amount
  if (uq.amount.length && !matchAmount(t.amount, uq.amount)) return false;

  // category (substring match)
  if (uq.categories.length) {
    const cat = (t.category || "").toLowerCase();
    if (!uq.categories.every((c) => cat.includes(c))) return false;
  }

  // tags
  if (uq.tags.length) {
    const txTags = (t.tags || []).map((x) => x.toLowerCase());
    if (!uq.tags.every((tg) => txTags.includes(tg))) return false;
  }
  if (uq.notTags.length) {
    const txTags = (t.tags || []).map((x) => x.toLowerCase());
    if (uq.notTags.some((tg) => txTags.includes(tg))) return false;
  }

  // source
  if (uq.sources.length) {
    const s = (t.source || "").toLowerCase();
    if (!uq.sources.every((sv) => s.includes(sv))) return false;
  }

  // free terms across desc/category/tags/source
  if (uq.terms.length || uq.notTerms.length) {
    const hay = [
      (t.description || "").toLowerCase(),
      (t.category || "").toLowerCase(),
      (t.source || "").toLowerCase(),
      ...(t.tags || []).map((x) => x.toLowerCase()),
    ].join(" ");
    if (uq.terms.length && !uq.terms.every((w) => hay.includes(w)))
      return false;
    if (uq.notTerms.length && uq.notTerms.some((w) => hay.includes(w)))
      return false;
  }

  return true;
}

// Enhanced filteredTransactions with tags
const unified = computed(() => parseUnifiedQuery(searchQuery.value));

const filteredTransactions = computed(() => {
  const uq = { ...unified.value };

  // ALSO respect the chart Date Filter UI if set
  const df = dateFilter.value || { start: "", end: "" };
  if (df.start) uq.dateStart = df.start;
  if (df.end) uq.dateEnd = df.end;

  // (Optional) keep supporting the tag chip filter if you still show it
  if (selectedTagsForFilter.value?.length) {
    // force AND for each tag chip
    selectedTagsForFilter.value.forEach((tg) => uq.tags.push(tg.toLowerCase()));
  }

  // (Optional) if you keep the old dropdowns around, they still work
  if (typeFilter.value) uq.types = [typeFilter.value as "income" | "spending"];
  if (sourceFilter.value) uq.sources.push(sourceFilter.value.toLowerCase());

  const out = transactions.value.filter((t) => matchesUnified(t, uq));

  // sort
  const field = sortField.value;
  const order = sortOrder.value === "asc" ? 1 : -1;
  out.sort((a: any, b: any) => {
    let av = a[field];
    let bv = b[field];
    if (field === "amount") {
      return (av - bv) * order;
    }
    return String(av).localeCompare(String(bv)) * order;
  });

  return out;
});

function compareBy(
  field: typeof sortField.value,
  a: Transaction,
  b: Transaction
) {
  let av: any = a[field],
    bv: any = b[field];
  if (field === "date") {
    av = new Date(av).getTime();
    bv = new Date(bv).getTime();
  }
  if (field === "amount") {
    av = Number(av);
    bv = Number(bv);
  }
  if (sortOrder.value === "asc") return av < bv ? -1 : av > bv ? 1 : 0;
  return av > bv ? -1 : av < bv ? 1 : 0;
}

const sortedTransactions = computed(() => {
  const list = filteredTransactions.value.slice();
  const sel = selectedIds.value;
  list.sort((a, b) => {
    if (prioritizeSelected.value) {
      const pa = sel.has(a.id) ? 1 : 0;
      const pb = sel.has(b.id) ? 1 : 0;
      if (pa !== pb) return pb - pa;
    }
    return compareBy(sortField.value, a, b);
  });
  return list;
});

const currentPage = ref(1);
const itemsPerPage = 20;
const totalPages = computed(() =>
  Math.max(1, Math.ceil(sortedTransactions.value.length / itemsPerPage))
);
const pageOffset = computed(() => (currentPage.value - 1) * itemsPerPage);
const paginatedTransactions = computed(() =>
  sortedTransactions.value.slice(
    pageOffset.value,
    pageOffset.value + itemsPerPage
  )
);

/** ========= Selection (ID-based & accessible) ========= */
const selectedIds = ref<Set<string>>(new Set());
const selectedCount = computed(() => selectedIds.value.size);

function isSelected(id: string) {
  return selectedIds.value.has(id);
}
function setSelected(newSet: Set<string>) {
  selectedIds.value = new Set(newSet);
}
const someSelectedOnPage = computed(() =>
  paginatedTransactions.value.some((t) => selectedIds.value.has(t.id))
);

const allSelected = computed(
  () =>
    paginatedTransactions.value.length > 0 &&
    paginatedTransactions.value.every((t) => selectedIds.value.has(t.id))
);

function toggleSelectRow(id: string) {
  const s = new Set(selectedIds.value);
  if (s.has(id)) s.delete(id);
  else s.add(id);
  setSelected(s);

  if (s.size === 1) {
    const seed =
      paginatedTransactions.value.find((x) => x.id === id) ??
      filteredTransactions.value.find((x) => x.id === id);
    if (seed) maybeOfferSelectSimilar(seed);
  }
}

function toggleSelectAll() {
  const s = new Set(selectedIds.value);
  if (allSelected.value) {
    for (const t of paginatedTransactions.value) s.delete(t.id);
  } else {
    for (const t of paginatedTransactions.value) s.add(t.id);
  }
  setSelected(s);
}

function clearSelection() {
  setSelected(new Set());
}

function bulkDelete() {
  if (selectedIds.value.size === 0) return;
  if (!confirm(`Delete ${selectedIds.value.size} selected transaction(s)?`))
    return;
  transactions.value = transactions.value.filter(
    (t) => !selectedIds.value.has(t.id)
  );
  clearSelection();
  pushToast("Selected transactions deleted", "success");
}

function getSortIcon(field: "date" | "type" | "amount" | "category") {
  if (sortField.value !== field) return "↕️";
  return sortOrder.value === "asc" ? "↑" : "↓";
}
function updateSort(field: "date" | "type" | "amount" | "category") {
  if (sortField.value === field)
    sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
  else {
    sortField.value = field;
    sortOrder.value = "desc";
  }
  currentPage.value = 1;
}

/** ========= Bulk Edit state & helpers ========= */
type DescMode = "none" | "replace" | "prepend" | "append";
const bulkEdit = reactive({
  open: false,
  category: "",
  type: "" as "" | TransactionType,
  descMode: "none" as DescMode,
  descText: "",
  findText: "",
  replaceWith: "",
  replaceAll: true,
  trimWhitespace: true,
  collapseSpaces: true,
  titleCase: false,
  shiftDays: null as number | null,
  saveRule: false,
  ruleKeyword: "",
});

const selectedTransactions = computed(() =>
  transactions.value.filter((t) => selectedIds.value.has(t.id))
);

const suggestedKeyword = computed(() => {
  const counts = new Map<string, number>();
  const stop = new Set([
    "the",
    "and",
    "for",
    "with",
    "from",
    "to",
    "of",
    "on",
    "at",
    "in",
    "payment",
    "transfer",
    "online",
    "purchase",
    "debit",
    "visa",
    "card",
    "pos",
    "eftpos",
  ]);
  for (const t of selectedTransactions.value) {
    const words = (t.description || "")
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .split(/\s+/)
      .filter((w) => w.length >= 3 && !stop.has(w) && !/^\d+$/.test(w));
    new Set(words).forEach((w) => counts.set(w, (counts.get(w) || 0) + 1));
  }
  let best = "",
    bestCount = 0;
  counts.forEach((c, w) => {
    if (c > bestCount) {
      bestCount = c;
      best = w;
    }
  });
  return best;
});

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function toTitleCase(s: string) {
  return s.replace(
    /\b([\p{L}][\p{L}'-]*)/gu,
    (m) => m[0].toUpperCase() + m.slice(1).toLowerCase()
  );
}
function cleanDesc(raw: string) {
  let s = raw ?? "";
  if (bulkEdit.trimWhitespace) s = s.trim();
  if (bulkEdit.collapseSpaces) s = s.replace(/\s+/g, " ");
  if (bulkEdit.titleCase) s = toTitleCase(s);
  return s;
}

function openBulkEdit() {
  if (selectedCount.value === 0) {
    pushToast("Select at least one transaction first.", "warning");
    return;
  }
  bulkEdit.open = true;
}

function applyBulkEdit() {
  if (selectedCount.value === 0) return;
  const ids = selectedIds.value;
  const shift = Number(bulkEdit.shiftDays || 0);

  const haveFind = !!bulkEdit.findText.trim();
  const findRe = haveFind
    ? new RegExp(
        escapeRegExp(bulkEdit.findText.trim()),
        bulkEdit.replaceAll ? "gi" : "i"
      )
    : null;

  transactions.value = transactions.value.map((t) => {
    if (!ids.has(t.id)) return t;

    let desc = t.description || "";

    if (bulkEdit.descMode === "replace") {
      desc = bulkEdit.descText;
    } else if (bulkEdit.descMode === "prepend" && bulkEdit.descText) {
      desc = bulkEdit.descText + desc;
    } else if (bulkEdit.descMode === "append" && bulkEdit.descText) {
      desc = desc + bulkEdit.descText;
    }

    if (findRe) {
      desc = desc.replace(findRe, bulkEdit.replaceWith ?? "");
    }

    desc = cleanDesc(desc);

    let date = t.date;
    if (shift) {
      const d = new Date(t.date);
      d.setDate(d.getDate() + shift);
      date = toLocalISO(d);
    }

    return {
      ...t,
      category: bulkEdit.category || t.category,
      type: (bulkEdit.type as TransactionType) || t.type,
      description: desc,
      date,
    };
  });

  if (bulkEdit.saveRule && bulkEdit.category) {
    const kw = (bulkEdit.ruleKeyword || suggestedKeyword.value || "").trim();
    if (kw) addRuleFromSelection(kw, bulkEdit.category);
  }

  bulkEdit.open = false;
  pushToast("Bulk changes applied", "success");
}

function selectByType(type: TransactionType, scope: "page" | "all") {
  const s = new Set(selectedIds.value);
  const src =
    scope === "page" ? paginatedTransactions.value : filteredTransactions.value;
  for (const t of src) if (t.type === type) s.add(t.id);
  setSelected(s);
}

function selectLarge() {
  const scopeList = largeSelect.value.pageOnly
    ? paginatedTransactions.value
    : filteredTransactions.value;
  let threshold = Number(largeSelect.value.threshold || 50);

  if (largeSelect.value.smart) {
    const spend = scopeList
      .filter((t) => t.type === "spending")
      .map((t) => t.amount)
      .sort((a, b) => a - b);
    if (spend.length) {
      const q1 = percentile(spend, 0.25),
        q3 = percentile(spend, 0.75);
      const iqr = Math.max(1, q3 - q1);
      threshold = Math.max(threshold, q3 + 1.5 * iqr);
    }
  }

  const s = new Set(selectedIds.value);
  let added = 0;
  for (const t of scopeList) {
    if (t.type === "spending" && t.amount >= threshold) {
      if (!s.has(t.id)) added++;
      s.add(t.id);
    }
  }
  if (!added) {
    alert("No large transactions found for current settings.");
    return;
  }
  setSelected(s);
  prioritizeSelected.value = true;
}

function applySmartSelect() {
  const s = new Set<string>();
  filteredTransactions.value.forEach((t) => {
    if (smartSelect.value.category && t.category !== smartSelect.value.category)
      return;
    if (smartSelect.value.type && t.type !== smartSelect.value.type) return;
    if (smartSelect.value.min != null && t.amount < smartSelect.value.min)
      return;
    if (smartSelect.value.max != null && t.amount > smartSelect.value.max)
      return;
    if (smartSelect.value.from && t.date < smartSelect.value.from) return;
    if (smartSelect.value.to && t.date > smartSelect.value.to) return;
    if (
      smartSelect.value.contains &&
      !t.description
        .toLowerCase()
        .includes(smartSelect.value.contains.toLowerCase())
    )
      return;
    s.add(t.id);
  });
  setSelected(s);
  openSmartSelect.value = false;
}

function runSmartFilter() {
  const txt = smartFilter.value.text.trim();
  if (!txt) return;

  const mDays = txt.match(/last\s+(\d+)\s*d/i);
  if (mDays) {
    const days = Number(mDays[1]);
    const end = new Date();
    const start = new Date(end.getTime() - days * 86400000);
    dateFilter.value.start = toLocalISO(start);
    dateFilter.value.end = toLocalISO(end);
  }
  const gt = txt.match(/>(\d+(\.\d+)?)/);
  const lt = txt.match(/<(\d+(\.\d+)?)/);
  const type = /income/i.test(txt)
    ? ("income" as const)
    : /spending/i.test(txt)
    ? ("spending" as const)
    : "";
  const contains = txt
    .replace(/last\s+\d+\s*d|>\d+(\.\d+)?|<\d+(\.\d+)?|income|spending/gi, "")
    .trim();

  const s = new Set<string>();
  filteredTransactions.value.forEach((t) => {
    if (type && t.type !== type) return;
    if (gt && t.amount <= Number(gt[1])) return;
    if (lt && t.amount >= Number(lt[1])) return;
    if (
      contains &&
      !t.description.toLowerCase().includes(contains.toLowerCase())
    )
      return;
    s.add(t.id);
  });
  setSelected(s);
  prioritizeSelected.value = true;
}

function selectSimilar(seed?: Transaction) {
  let base = seed;
  if (!base && selectedIds.value.size) {
    const first = Array.from(selectedIds.value)[0];
    base = filteredTransactions.value.find((t) => t.id === first) || undefined;
  }
  if (!base && paginatedTransactions.value.length) {
    base = paginatedTransactions.value[0];
  }
  if (!base) {
    pushToast("Pick a row first, or select text to filter.", "info");
    return;
  }

  const target = normDesc(base.description);
  const s = new Set(selectedIds.value);
  let added = 0;
  for (const t of filteredTransactions.value) {
    if (normDesc(t.description) === target) {
      if (!s.has(t.id)) added++;
      s.add(t.id);
    }
  }
  if (!added) {
    pushToast("No similar transactions found.", "info");
    return;
  }
  setSelected(s);
  prioritizeSelected.value = true;
  pushToast(`Selected ${added} similar transaction(s).`, "success");
}

function bulkUpdateSelected({
  category,
  type,
  addRuleKeyword,
}: {
  category?: string;
  type?: TransactionType;
  addRuleKeyword?: string;
}) {
  if (selectedIds.value.size === 0) return;
  transactions.value = transactions.value.map((t) => {
    if (!selectedIds.value.has(t.id)) return t;
    return {
      ...t,
      category: category ?? t.category,
      type: (type as TransactionType) ?? t.type,
    };
  });
  if (category && addRuleKeyword)
    addRuleFromSelection(addRuleKeyword, category);
  pushToast("Bulk update applied", "success");
}

/** Large amounts selection with smart IQR */
const largeSelect = ref({ threshold: 50, smart: true, pageOnly: false });

/** Smart Select modal */
const openSmartSelect = ref(false);
const smartSelect = ref<{
  category: string;
  type: "" | TransactionType;
  min: number | null;
  max: number | null;
  from: string;
  to: string;
  contains: string;
}>({
  category: "",
  type: "",
  min: null,
  max: null,
  from: "",
  to: "",
  contains: "",
});

function normDesc(s: string) {
  return (s || "")
    .toLowerCase()
    .replace(/\d+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
function maybeOfferSelectSimilar(seed: Transaction) {
  const countSimilar = filteredTransactions.value.filter(
    (t) => normDesc(t.description) === normDesc(seed.description)
  ).length;
  if (countSimilar > 1) {
    pushToast(
      `Tip: many transactions look like "${seed.description}". Use Smart Select or click "Select Spending/Income" dropdowns.`,
      "info",
      6000
    );
  }
}

/** ========= Chart.js ========= */
const chartConfig = ref<{
  type: "line" | "bar" | "pie" | "doughnut";
  groupBy:
    | "daily"
    | "weekly"
    | "fortnightly"
    | "monthly"
    | "quarterly"
    | "yearly";
}>({ type: "line", groupBy: "monthly" });
const seriesToggles = ref<{
  income: boolean;
  spending: boolean;
  balance: boolean;
}>({ income: true, spending: true, balance: true });
const selectedCategories = ref<string[]>([]);
const chartCanvas = ref<HTMLCanvasElement | null>(null);
let chartInstance: any = null;

function toggleCategory(c: string) {
  const i = selectedCategories.value.indexOf(c);
  if (i > -1) selectedCategories.value.splice(i, 1);
  else selectedCategories.value.push(c);
}
function selectAllCategories() {
  selectedCategories.value = [...chartCategories.value];
}
function unselectAllCategories() {
  selectedCategories.value = [];
}
function ensureAllCatsSelected() {
  if (selectedCategories.value.length === 0)
    selectedCategories.value = [...chartCategories.value];
}

const chartData = computed(() => {
  const base =
    selectedCategories.value.length > 0
      ? filteredTransactions.value.filter((t) =>
          selectedCategories.value.includes(t.category)
        )
      : filteredTransactions.value;

  if (
    chartConfig.value.type === "pie" ||
    chartConfig.value.type === "doughnut"
  ) {
    const byCat: Record<string, number> = {};
    base.forEach((t) => {
      if (t.type === "spending") {
        byCat[t.category] = (byCat[t.category] || 0) + t.amount;
      }
    });
    return {
      labels: Object.keys(byCat),
      datasets: [{ data: Object.values(byCat) }],
    };
  }

  const bucket: Record<string, { income: number; spending: number }> = {};
  for (const t of base) {
    const d = new Date(t.date);
    let key = "";
    switch (chartConfig.value.groupBy) {
      case "daily":
        key = t.date;
        break;
      case "weekly": {
        const dt = new Date(d);
        dt.setDate(d.getDate() - d.getDay());
        key = toLocalISO(dt);
        break;
      }
      case "fortnightly": {
        const dt = new Date(d);
        dt.setDate(d.getDate() - ((d.getDay() + 7) % 14));
        key = toLocalISO(dt);
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
    }
    if (!bucket[key]) bucket[key] = { income: 0, spending: 0 };
    bucket[key][t.type] += t.amount;
  }

  const labels = Object.keys(bucket).sort();
  const income = labels.map((k) => bucket[k].income);
  const spending = labels.map((k) => bucket[k].spending);
  const balance = labels.map((_, i) => (income[i] || 0) - (spending[i] || 0));

  const t = chartConfig.value.type;
  const datasets: any[] = [];
  if (seriesToggles.value.income)
    datasets.push({ label: "Income", data: income, type: t, tension: 0.3 });
  if (seriesToggles.value.spending)
    datasets.push({ label: "Spending", data: spending, type: t, tension: 0.3 });
  if (seriesToggles.value.balance)
    datasets.push({
      label: "Balance",
      data: balance,
      type: t === "bar" ? "line" : t,
      borderWidth: 3,
      pointRadius: 3,
      tension: 0.25,
      fill: false,
    });
  return { labels, datasets };
});

async function renderChart() {
  if (!chartCanvas.value || chartData.value.labels.length === 0) return;
  if (chartInstance) chartInstance.destroy();
  const { Chart, registerables } = await import("chart.js");
  Chart.register(...registerables);
  const data = JSON.parse(JSON.stringify(chartData.value));
  if (chartConfig.value.type === "bar")
    data.datasets.forEach((ds: any) => (ds.type = "bar"));
  if (chartConfig.value.type === "line")
    data.datasets.forEach((ds: any) => (ds.type = "line"));
  chartInstance = new Chart(chartCanvas.value.getContext("2d")!, {
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
            label: (ctx: any) =>
              `${ctx.dataset.label}: $${Number(
                ctx.parsed?.y ?? ctx.parsed
              ).toFixed(2)}`,
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
                ticks: { callback: (v: any) => "$" + Number(v).toFixed(2) },
              },
            },
    },
  });
}

/** ========= Stats ========= */
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

/** ========= Utilities ========= */
function closeClosestDetails(ev?: Event) {
  const el = (ev?.target as HTMLElement | null)?.closest(
    "details.dropdown"
  ) as HTMLDetailsElement | null;
  if (el) el.open = false;
}

function selectByTypeAndClose(
  type: TransactionType,
  scope: "page" | "all",
  ev?: Event
) {
  selectByType(type, scope);
  closeClosestDetails(ev);
}

/** ===== Recurring end-date helpers ===== */
function addMonthsClamped(iso: string, months: number) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  const target = new Date(dt.getFullYear(), dt.getMonth() + months, 1);
  const last = new Date(
    target.getFullYear(),
    target.getMonth() + 1,
    0
  ).getDate();
  const day = Math.min(d, last);
  target.setDate(day);
  return toLocalISO(target);
}
function addDays(iso: string, days: number) {
  const dt = new Date(iso);
  dt.setDate(dt.getDate() + days);
  return toLocalISO(dt);
}
function computeRecurringEndDate(
  startISO: string,
  freq: RecurringFrequency,
  recursions: number
) {
  const n = Math.max(1, Number(recursions || 1));
  if (!startISO || n <= 1) return startISO;
  const steps = n - 1;
  switch (freq) {
    case "daily":
      return addDays(startISO, steps);
    case "weekly":
      return addDays(startISO, steps * 7);
    case "fortnightly":
      return addDays(startISO, steps * 14);
    case "monthly":
      return addMonthsClamped(startISO, steps);
    case "quarterly":
      return addMonthsClamped(startISO, steps * 3);
    case "yearly":
      return addMonthsClamped(startISO, steps * 12);
  }
  return startISO;
}

/** Live end-date for the Add/Edit form */
const derivedEndDateISO = computed(() => {
  if (!newTransaction.recurring) return "";
  const start = newTransaction.date;
  const freq = newTransaction.frequency || "monthly";
  const recs = Number(newTransaction.recursions || 1);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || recs < 1) return "";
  return computeRecurringEndDate(start, freq, recs);
});

watch(derivedEndDateISO, (v) => {
  if (newTransaction.recurring) newTransaction.endDate = v || "";
});
watch(showManager, (on) => setBodyScrollLocked(!!on));


function normalizeTransaction(raw: any): Transaction {
  // Keep your date guard logic consistent
  const iso = parseDateGuess(String(raw?.date ?? "")) || todayLocalISO();
  const freqOptions: RecurringFrequency[] = [
    "daily",
    "weekly",
    "fortnightly",
    "monthly",
    "quarterly",
    "yearly",
  ];
  const freq = freqOptions.includes(raw?.frequency) ? raw.frequency : "monthly";

  return {
    id: String(raw?.id ?? `${Date.now()}-${Math.floor(Math.random() * 10000)}`),
    date: iso,
    type,
    amount,
    category: String(raw?.category ?? "Uncategorized"),
    tags,
    description: String(raw?.description ?? ""),
    recurring: !!raw?.recurring,
    frequency,
    recursions: Math.max(1, Number(raw?.recursions ?? 1)),
    endDate: String(raw?.endDate ?? ""),
    source: String(raw?.source ?? DEFAULT_SOURCE),
  };
}

function parseTransactionsFromJSON(json: string): Transaction[] {
  const arr = JSON.parse(json);
  if (!Array.isArray(arr))
    throw new Error("JSON must be an array of transactions");
  return arr.map(normalizeTransaction);
}

async function downloadJson() {
  try {
    const data = JSON.stringify(transactions.value, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const dateStr = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `myAniFI-transactions-${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    pushToast("JSON downloaded.", "success");
  } catch (e: any) {
    pushToast("JSON download failed: " + (e?.message || String(e)), "error");
  }
}

function handleJsonImport(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const text = String(reader.result || "");
      const incoming = parseTransactionsFromJSON(text);

      const replace = confirm(
        'Replace ALL existing transactions with this file?\n\nClick "OK" to Replace, or "Cancel" to Append/Merge.'
      );

      if (replace) {
        transactions.value = incoming;
      } else {
        // Merge by id, making sure not to lose anything
        const byId = new Map<string, Transaction>();
        for (const t of transactions.value) byId.set(t.id, t);
        for (const t of incoming) {
          // If collision, mint a fresh id for the incoming record
          let nextId = t.id;
          while (byId.has(nextId)) {
            nextId = `${t.id}-${Math.floor(Math.random() * 10000)}`;
          }
          byId.set(nextId, { ...t, id: nextId });
        }
        transactions.value = Array.from(byId.values());
      }

      pushToast("JSON imported.", "success");
    } catch (err: any) {
      pushToast("Invalid JSON: " + (err?.message || String(err)), "error");
    } finally {
      // allow re-uploading the same file
      input.value = "";
    }
  };
  reader.readAsText(file);
}

// function ddmmyyyyToISO(s: string) {
//   const clean = finalizeDDMM(s);
//   if (!clean) return "";
//   const [dd, mm, yyyy] = clean.split("-");
//   return `${yyyy}-${mm}-${dd}`;
// }
// function isoToDDMMYYYY(iso: string) {
//   const m = iso?.match(/^(\d{4})-(\d{2})-(\d{2})$/);
//   if (!m) return "";
//   const [, y, mo, d] = m;
//   return `${d}-${mo}-${y}`;
// }
function isoToDDMMYYYY(iso?: string) {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return "";
  const [y, m, d] = iso.split("-");
  return `${d}-${m}-${y}`;
}
function ddmmyyyyToISO(ddmmyyyy?: string) {
  const m = /^(\d{2})-(\d{2})-(\d{4})$/.exec(ddmmyyyy || "");
  if (!m) return "";
  const [, d, mo, y] = m;
  const dt = new Date(Number(y), Number(mo) - 1, Number(d));
  if (Number.isNaN(+dt)) return "";
  return toLocalISO(dt);
}
// function formatDDMMProgressive(s: string) {
//   const digits = s.replace(/[^\d]/g, "").slice(0, 8);
//   const p1 = digits.slice(0, 2);
//   const p2 = digits.slice(2, 4);
//   const p3 = digits.slice(4);
//   return [p1, p2, p3].filter(Boolean).join("-");
// }
// function finalizeDDMM(s: string) {
//   const m = /^(\d{2})-(\d{2})-(\d{4})$/.exec(s);
//   if (!m) return "";
//   const d = Number(m[1]),
//     mo = Number(m[2]),
//     y = Number(m[3]);
//   if (mo < 1 || mo > 12 || d < 1 || d > 31) return "";
//   const dt = new Date(y, mo - 1, d);
//   return dt.getMonth() + 1 === mo ? s : "";
// }
// function formatDate(iso?: string) {
//   if (!iso) return "";
//   const d = new Date(iso);
//   if (Number.isNaN(+d)) return iso;
//   return d.toLocaleDateString(undefined, {
//     day: "2-digit",
//     month: "short",
//     year: "numeric",
//   });
// }
// function percentile(sortedAscNumbers: number[], p: number) {
//   if (!sortedAscNumbers.length) return 0;
//   const i = (sortedAscNumbers.length - 1) * p;
//   const lo = Math.floor(i),
//     hi = Math.ceil(i);
//   if (lo === hi) return sortedAscNumbers[lo];
//   const h = i - lo;
//   return sortedAscNumbers[lo] * (1 - h) + sortedAscNumbers[hi] * h;
// }

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return isoToDDMMYYYY(dateStr);
  const dt = new Date(dateStr);
  if (isNaN(+dt)) return dateStr;
  return `${pad2(dt.getDate())}-${pad2(dt.getMonth() + 1)}-${dt.getFullYear()}`;
}
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
function finalizeDDMM(raw: string) {
  if (!raw) return "";
  let s = raw.replace(/[–—.\s/]+/g, "-").trim();
  const digits = s.replace(/\D/g, "");
  if (digits.length === 6 || digits.length === 8) {
    const dd = digits.slice(0, 2),
      mm = digits.slice(2, 4),
      yy = digits.slice(4);
    s = `${dd}-${mm}-${yy}`;
  }
  const m = s.match(/^(\d{1,2})-(\d{1,2})-(\d{2}|\d{4})$/);
  if (!m) return "";
  let [, dStr, mStr, yStr] = m;
  let day = Number(dStr),
    month = Number(mStr),
    year =
      yStr.length === 2
        ? Number(yStr) >= 70
          ? 1900 + Number(yStr)
          : 2000 + Number(yStr)
        : Number(yStr);
  if (!Number.isFinite(year) || year < 1000 || year > 9999) return "";
  if (month < 1 || month > 12) return "";
  if (day < 1 || day > daysInMonthSafe(year, month)) return "";
  return `${pad2(day)}-${pad2(month)}-${year}`;
}
function percentile(sorted: number[], p: number) {
  if (!sorted.length) return 0;
  const idx = (sorted.length - 1) * p;
  const lo = Math.floor(idx),
    hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

/** ========= Watches & Lifecycle ========= */
// // Render / re-render charts on config or data changes
watch(transactions, (val) => {
  localStorage.setItem("financial-tracker-transactions", JSON.stringify(val)),
    // Keep share artifacts fresh

    scheduleRecomputeShareArtifacts(),
    [chartData, chartConfig, seriesToggles, selectedCategories],
    () => {
      renderChart();
    },
    customCategories,
    () =>
      localStorage.setItem(
        "financial-tracker-custom-categories",
        JSON.stringify(customCategories.value)
      ),
    { deep: true };
});
watch(
  () => newTransaction.category,
  (val) => {
    if (val && !eqi(val, query.value)) query.value = val;
  },
  { immediate: true }
);

watch(
  [searchQuery, typeFilter, sourceFilter, selectedTagsForFilter],
  () => (currentPage.value = 1)
);
watch(totalPages, (n) => {
  if (currentPage.value > n) currentPage.value = n;
  if (currentPage.value < 1) currentPage.value = 1;
});
watch(
  transactions,
  () => {
    try {
      localStorage.setItem(
        "financial-tracker-transactions",
        JSON.stringify(transactions.value)
      );
    } catch {}
    if (isImporting.value) return;
    scheduleRecomputeShareArtifacts();
  },
  { deep: true }
);

watch([searchQuery, typeFilter], () => (currentPage.value = 1));
watch(activeTab, (tab) => {
  if (tab === "chart")
    nextTick(() => {
      ensureAllCatsSelected();
      renderChart();
    });
});
watch(chartCategories, () => {
  if (selectedCategories.value.length === 0)
    selectedCategories.value = [...chartCategories.value];
});
watch(
  [selectedCategories, chartConfig, dateFilter, seriesToggles],
  () => nextTick(renderChart),
  {
    deep: true,
  }
);
watch(filteredTransactions, () => nextTick(renderChart));
watch(
  transactions,
  (val) => {
    if (!Array.isArray(val)) return;
    localStorage.setItem("financial-tracker-transactions", JSON.stringify(val));
    scheduleRecomputeShareArtifacts?.();
  },
  { deep: true }
);

onMounted(async () => {
  const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding");

  if (
    window.location.pathname === "/" ||
    window.location.pathname.endsWith("/index.html")
  ) {
    if (!hasSeenOnboarding && transactions.value.length === 0) {
      //activeTab.value = "chart";
      // showTour.value = true;
    } else {
      activeTab.value = "about";
    }
  } else {
    activeTab.value = "about";
    showTour.value = false;
  }

  const savedViewPref = localStorage.getItem("financial-tracker-advanced-view");
  showAdvancedTransactionsView.value = savedViewPref === "true";

  const savedTheme = localStorage.getItem("financial-tracker-theme");
  if (savedTheme && availableThemes.includes(savedTheme)) setTheme(savedTheme);
  else
    setTheme(
      window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
    );

  const savedTx = localStorage.getItem("financial-tracker-transactions");
  if (savedTx) {
    try {
      const raw = JSON.parse(savedTx);
      transactions.value = normalizeTransaction(raw);
    } catch {
      transactions.value = [];
    }
  } else {
    if (onboardingStep.value === null) {
      pushToast(
        "Tip: Import a CSV or use a Share Code to get started.",
        "info",
        6000
      );
    }
  }

  resetDateFilter();

  const savedCfg = localStorage.getItem("financial-tracker-chart-config");
  if (savedCfg) {
    try {
      chartConfig.value = JSON.parse(savedCfg);
    } catch {}
  }
  const savedCats = localStorage.getItem(
    "financial-tracker-selected-categories"
  );
  if (savedCats) {
    try {
      const parsed = JSON.parse(savedCats);
      if (Array.isArray(parsed) && parsed.length > 0)
        selectedCategories.value = parsed;
    } catch {}
  }
  const savedSeries = localStorage.getItem("financial-tracker-series-toggles");
  if (savedSeries) {
    try {
      seriesToggles.value = {
        income: true,
        spending: true,
        balance: true,
        ...JSON.parse(savedSeries),
      };
    } catch {}
  }
  await recomputeShareArtifactsNow();
});

watch(showAdvancedTransactionsView, (isAdvanced) => {
  localStorage.setItem("financial-tracker-advanced-view", String(isAdvanced));
});

/* Persist transactions + refresh share artifacts on any change */
watch(
  transactions,
  (val) => {
    try {
      localStorage.setItem(
        "financial-tracker-transactions",
        JSON.stringify(val)
      );
    } catch {}
    scheduleRecomputeShareArtifacts?.();
  },
  { deep: true }
);

watch(
  selectedCategories,
  () =>
    localStorage.setItem(
      "financial-tracker-selected-categories",
      JSON.stringify(selectedCategories.value)
    ),
  { deep: true }
);
watch(
  chartConfig,
  () =>
    localStorage.setItem(
      "financial-tracker-chart-config",
      JSON.stringify(chartConfig.value)
    ),
  { deep: true }
);
watch(
  seriesToggles,
  () =>
    localStorage.setItem(
      "financial-tracker-series-toggles",
      JSON.stringify(seriesToggles.value)
    ),
  { deep: true }
);
watch(
  transactions,
  (val) => {
    localStorage.setItem("financial-tracker-transactions", JSON.stringify(val));
    scheduleRecomputeShareArtifacts();
  },
  { deep: true }
);
</script>

<style scoped>
/* Try break me heheh */
.opacity-80 {
  word-break: break-word;
}
/* WCAG-friendly skip link */
.skip-link{
  position:absolute;left:-9999px;top:auto;width:1px;height:1px;overflow:hidden;
}
.skip-link:focus{
  position:fixed;left:1rem;top:1rem;width:auto;height:auto;padding:.5rem .75rem;
  background:CanvasText;color:Canvas;border-radius:.375rem;z-index:9999;
}
/* Modal background scroll lock */
.no-scroll{ overflow:hidden; }

.menu li > a:focus {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}

/* ===== Tour/Onboarding Overlay ===== */
.fixed.inset-0 {
  position: fixed;
  inset: 0;
  /* The background will slightly blur the main content underneath */
  backdrop-filter: blur(1px);
}

.badge.badge-outline {
  width: max-content;
}

/* ===== Accessibility & focus ===== */
:focus-visible {
  outline: 3px solid oklch(var(--bc) / 0.9);
  outline-offset: 2px;
  border-radius: 6px;
}

/* Screen-reader helper (fallback if not provided by your CSS framework) */
.sr-only {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border-width: 0 !important;
}

/* ===== Skip link (WCAG 2.2) ===== */
.skip-link {
  position: absolute;
  left: -9999px;
  top: -9999px;
  background: oklch(var(--b1));
  color: oklch(var(--bc));
  padding: 0.5rem 0.75rem;
  z-index: 80;
  border-radius: 0.5rem;
  box-shadow: 0 2px 8px oklch(var(--bc) / 0.15);
}
.skip-link:focus-visible {
  left: 0.75rem;
  top: 0.75rem;
}

/* ===== Dropdown (details/summary) polish ===== */
details.dropdown {
  position: relative;
  display: inline-block;
}
.dropdown > summary {
  list-style: none;
  cursor: pointer;
}
.dropdown > summary::-webkit-details-marker {
  display: none;
}
.dropdown .dropdown-content {
  display: none;
  position: absolute;
  right: 0;
  margin-top: 0.5rem;
  z-index: 60;
  max-height: 60vh;
  overflow: auto;
  overscroll-behavior: contain;
  border-radius: 0.75rem;
  box-shadow: 0 10px 30px oklch(var(--bc) / 0.15);
}
/* Show only when <details> is actually open (so it toggles correctly). */
details.dropdown[open] > .dropdown-content {
  display: block;
}

/* ===== Transaction table usability ===== */
.table {
  border-collapse: separate;
  border-spacing: 0 2px; /* gentle breathing room */
}
.table thead th {
  position: sticky;
  top: 0;
  z-index: 10;
  background: oklch(var(--b2));
}
.table th .btn {
  white-space: nowrap;
}

/* Selected row emphasis */
tbody tr.bg-base-200 {
  outline: 2px solid oklch(var(--p) / 0.25);
  box-shadow: inset 0 0 0 9999px oklch(var(--p) / 0.05);
}

/* Compact badges in table */
.type-badge {
  width: 8.5rem;
  justify-content: center;
}

/* Hide less-critical columns on small screens to reduce overwhelm */
@media (max-width: 480px) {
  /* Description column (6th) */
  table thead th:nth-child(6),
  table tbody td:nth-child(6) {
    display: none;
  }
  /* Category badge remains; keep actions visible */
}

/* Improve zebra contrast slightly on dark themes */
.table-zebra tbody tr:nth-child(even) td,
.table-zebra tbody tr:nth-child(even) th {
  background-color: color-mix(
    in oklab,
    oklch(var(--b1)) 90%,
    oklch(var(--bc)) 10%
  );
}

/* ===== Cards / sections ===== */
.card {
  border-radius: 1rem;
}
.card-body {
  gap: 0.75rem;
}

.card:hover {
  transform: none !important;
}
/* ===== Stats tiles ===== */
.stats {
  border-radius: 0.75rem;
}

/* ===== Chart area ===== */
canvas {
  image-rendering: -webkit-optimize-contrast;
}

/* ===== Toast stack spacing ===== */
.toast .alert {
  gap: 0.5rem;
  align-items: center;
}

/* ===== Modal tweaks ===== */
.modal-box {
  border-radius: 1rem;
}

/* ===== Prefer reduced motion ===== */
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
    scroll-behavior: auto !important;
  }
}

/* ===== Minor utilities ===== */
.max-w-xs {
  max-width: 20rem;
}
</style>
