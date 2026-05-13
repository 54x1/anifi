<!-- //  Dev code  -->
<template>
  <div class="min-h-screen bg-base-100 transition-colors duration-300">
    <!-- Global toasts / announcements -->
    <div class="toast toast-top toast-end z-[70]" aria-live="polite" aria-atomic="true">
      <div v-for="t in toasts" :key="t.id" class="alert" :class="{
        'alert-success': t.kind === 'success',
        'alert-info': t.kind === 'info',
        'alert-warning': t.kind === 'warning',
        'alert-error': t.kind === 'error',
      }" :role="t.kind === 'error' ? 'alert' : 'status'" aria-live="polite" aria-atomic="true">
        <span>{{ t.message }}</span>
        <button class="btn-icon-xs focus-ring" @click="dismissToast(t.id)" aria-label="Dismiss notification">
          ✕
        </button>
      </div>
    </div>

    <!-- Header -->
    <header class="navbar bg-base-200 shadow-lg sticky top-0 z-50" role="banner">
      <div class="navbar-start">
        <h1 class="text-xl font-bold text-primary flex items-center gap-2">
          <span aria-hidden="true">💰</span>
          <span>My Financial Forecaster</span>
        </h1>
      </div>
      <nav class="navbar-center hidden lg:flex" aria-label="Primary">
        <div class="tabs tabs-boxed" role="tablist" aria-label="Main sections">
          <button v-for="tab in tabs" :key="tab.id" type="button" role="tab" :id="`tab-${tab.id}`"
            class="tab focus-ring target-min" :class="{ 'tab-active': activeTab === tab.id }" @click="onTab(tab.id)"
            :aria-selected="activeTab === tab.id" :aria-controls="`panel-${tab.id}`">
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
              <div class="stat-value text-sm" :class="netBalance >= 0 ? 'text-success' : 'text-error'">
                ${{ Math.abs(netBalance).toFixed(2) }}
              </div>
            </div>
          </div>
          <!-- Date Format Picker -->
          <details class="dropdown dropdown-end">
            <summary class="btn btn-ghost btn-circle" aria-haspopup="listbox" title="Date format">
              📅 <span class="sr-only">Choose date format</span>
            </summary>
            <ul class="dropdown-content z-[60] menu p-2 shadow bg-base-100 rounded-box w-56" role="listbox"
              aria-label="Date format">
              <li class="menu-title"><span class="text-xs opacity-60">Date Display Format</span></li>
              <li v-for="opt in dateFormatOptions" :key="opt.value">
                <button type="button" role="option" class="justify-between gap-2"
                  :aria-selected="String(selectedDateFormat === opt.value)"
                  :class="{ active: selectedDateFormat === opt.value }" @click="selectedDateFormat = opt.value">
                  <span class="flex flex-col">
                    <span class="font-medium">{{ opt.label }}</span>
                    <span class="text-xs opacity-60">{{ opt.example }}</span>
                  </span>
                  <span v-if="selectedDateFormat === opt.value" aria-hidden="true">✓</span>
                </button>
              </li>
            </ul>
          </details>
          <!-- Accessible Theme picker -->
          <details ref="themeDropdownRef" class="dropdown dropdown-end" @toggle="onThemeToggle">
            <summary class="btn btn-ghost btn-circle" aria-haspopup="listbox" :aria-expanded="String(themeOpen)"
              title="Theme">
              🎨 <span class="sr-only">Choose theme</span>
            </summary>

            <ul class="dropdown-content z-[60] menu p-2 shadow bg-base-100 rounded-box w-60 max-h-96 overflow-y-auto"
              role="listbox" aria-label="Themes">
              <li v-for="theme in availableThemes" :key="theme">
                <button type="button" role="option" class="justify-between gap-2"
                  :aria-selected="String(currentTheme === theme)" :class="{ active: currentTheme === theme }"
                  @click="onThemeSelect(theme)">
                  <span class="inline-flex items-center gap-2">
                    <!-- Live swatch using DaisyUI theme tokens -->
                    <span :data-theme="theme" class="inline-flex items-center gap-1">
                    </span>
                    <span class="capitalize">{{ theme }}</span>
                  </span>
                  <span class="opacity-70" v-if="currentTheme === theme" aria-hidden="true">●</span>
                </button>
              </li>
            </ul>
          </details>



        </div>
      </div>
    </header>

    <!-- Mobile Navigation -->
    <nav class="btm-nav lg:hidden z-50 shadow-[0_-2px_6px_0px_rgba(0,0,0,0.1)] border-t border-base-300"
      aria-label="Primary (mobile)">
      <button v-for="tab in tabs" :key="tab.id" :class="{ active: activeTab === tab.id }" @click="onTab(tab.id)"
        type="button" class="target-min focus-ring">
        <span class="text-xs" aria-hidden="true">{{ tab.icon }}</span>
        <span class="btm-nav-label">{{ tab.label }}</span>
      </button>
    </nav>

    <!-- Main -->
    <main id="main" class="container mx-auto p-4 pb-24 lg:pb-6" role="main">
      <!-- Get Started / Onboarding -->
      <section v-if="showTour" class="fixed inset-0 z-[60] bg-base-100/90 backdrop-blur p-4 lg:p-10" role="dialog"
        aria-modal="true" aria-labelledby="onboardingTitle">
        <div class="max-w-3xl mx-auto">
          <div class="card bg-base-100 shadow-2xl">
            <div class="card-body p-6 lg:p-8 space-y-6">
              <!-- Step 0 -->
              <div v-if="onboardingStep === 0" class="text-center space-y-5">
                <h1 id="onboardingTitle" class="text-3xl lg:text-4xl font-extrabold">
                  Let's get your data in
                </h1>
                <p class="text-base-content/70">
                  Pick one of the options below. You can change your mind later.
                </p>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button class="btn btn-primary" @click="startImportFromOnboarding" data-testid="cta-import">
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
              <div v-else-if="onboardingStep === 1" class="text-center space-y-5">
                <h2 class="text-2xl lg:text-3xl font-bold">Load demo data?</h2>
                <p class="text-base-content/70">
                  We'll add a realistic sample so you can explore charts and
                  filters.
                </p>
                <div class="flex justify-center gap-3">
                  <button class="btn btn-primary" @click="loadDemoDataAndFinish">
                    Load & explore
                  </button>
                </div>
              </div>
            </div>

            <!-- Tour controls -->
            <div class="card-actions justify-between px-6 pb-6 -mt-2">
              <button class="btn btn-ghost btn-sm" @click="handleTourBack" :disabled="onboardingStep === 0">
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
        <!-- Dismissible Tip Banner -->
        <section v-if="
          showTips && transactions.length >= 0 && activeTab === 'transactions'
        " class="alert alert-info mb-4 flex justify-between" role="status" aria-live="polite">
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
        <!-- Empty state hero -->
        <section class="hero min-h-[60vh] card bg-base-100 shadow-xl" v-if="
          transactions.length === 0 &&
          !['about', 'add', 'import'].includes(activeTab)
        ">
          <div class="hero-content text-center">
            <div class="max-w-md">
              <div class="text-8xl mb-6" aria-hidden="true">📊</div>
              <h2 class="text-3xl font-bold">No transactions yet</h2>
              <p class="py-6 text-base-content/70">
                Import your bank data or add a transaction to get started.
              </p>
              <div class="flex flex-wrap gap-4 justify-center">
                <button class="btn btn-primary" @click="startImportFromEmptyState">
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

        <!-- If data exists, show the main content -->
        <template v-if="transactions.length > 0">
          <!-- Transactions Section -->
          <section v-show="activeTab === 'transactions'" :id="'panel-transactions'" role="tabpanel"
            :aria-labelledby="'tab-transactions'" class="card bg-base-100 shadow-xl" aria-labelledby="txHeading">
            <div class="card-body">
              <!-- Header with view toggle -->
              <div class="flex justify-between items-center mb-6">
                <h2 id="txHeading" class="text-2xl font-bold">
                  📋 Transactions ({{ filteredTransactions.length }})
                </h2>
                <!-- Progressive Disclosure: TOGGLE -->
                <div class="flex flex-wrap gap-2 items-center">
                  <span class="text-sm text-base-content/60">View:</span>
                  <!-- Slide pill Simple/Advanced -->
                  <div class="relative inline-grid grid-cols-2 items-center rounded-full bg-base-200 p-1" role="tablist"
                    aria-label="View mode" @keydown.left.prevent="showAdvancedTransactionsView = false"
                    @keydown.right.prevent="showAdvancedTransactionsView = true" tabindex="0">
                    <!-- Sliding thumb -->
                    <span
                      class="absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full bg-primary transition-transform duration-300"
                      :style="{
                        transform: showAdvancedTransactionsView
                          ? 'translateX(100%)'
                          : 'translateX(0%)',
                      }" aria-hidden="true"></span>

                    <!-- Simple -->
                    <button type="button" role="tab" :aria-selected="String(!showAdvancedTransactionsView)"
                      class="relative z-10 px-4 py-1.5 text-sm rounded-full transition-colors" :class="!showAdvancedTransactionsView
                        ? 'text-primary-content font-semibold'
                        : 'text-base-content/70'
                        " @click="showAdvancedTransactionsView = false">
                      Simple
                    </button>

                    <!-- Advanced -->
                    <button type="button" role="tab" :aria-selected="String(showAdvancedTransactionsView)"
                      class="relative z-10 px-4 py-1.5 text-sm rounded-full transition-colors" :class="showAdvancedTransactionsView
                        ? 'text-primary-content font-semibold'
                        : 'text-base-content/70'
                        " @click="showAdvancedTransactionsView = true">
                      Advanced
                    </button>
                  </div>
                </div>
              </div>

              <!-- Advanced Controls (Hidden in Simple View) -->
              <div v-if="showAdvancedTransactionsView" class="flex flex-wrap items-center gap-2 mb-4">
                <!-- Smart bulk toolbar -->
                <!-- Income menu -->
                <details class="dropdown">
                  <summary class="btn btn-outline btn-xs" aria-haspopup="menu">
                    💰 Select Income
                  </summary>
                  <ul class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-48" role="menu">
                    <li>
                      <button type="button" role="menuitem" @click="
                        selectByTypeAndClose('income', 'page', $event);
                      closeClosestDetails($event);
                      ">
                        Current page
                      </button>
                    </li>
                    <li>
                      <button type="button" role="menuitem" @click="selectByTypeAndClose('income', 'all', $event)">
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
                  <ul class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-48" role="menu">
                    <li>
                      <button type="button" role="menuitem" @click="
                        selectByTypeAndClose('spending', 'page', $event)
                        ">
                        Current page
                      </button>
                    </li>
                    <li>
                      <button type="button" role="menuitem" @click="selectByTypeAndClose('spending', 'all', $event)">
                        All Transactions
                      </button>
                    </li>
                  </ul>
                </details>

                <!-- Large Amounts Selector -->
                <details class="dropdown">
                  <summary class="btn btn-outline btn-xs" aria-haspopup="listbox">
                    📈 Select Large
                  </summary>
                  <div class="dropdown-content card card-compact p-2 bg-base-100 shadow w-72">
                    <div class="card-body space-y-2">
                      <div class="form-control">
                        <label class="label" for="thresh">
                          <span class="label-text">Threshold ($)</span>
                        </label>
                        <input id="thresh" v-model.number="largeSelect.threshold" type="number" min="1"
                          class="input input-bordered input-sm" placeholder="50" />
                      </div>
                      <div class="form-control">
                        <label class="cursor-pointer label" for="smartIqr">
                          <span class="label-text">Use smart threshold (IQR on spending)</span>
                          <input id="smartIqr" v-model="largeSelect.smart" type="checkbox"
                            class="checkbox checkbox-sm" />
                        </label>
                      </div>
                      <div class="form-control">
                        <label class="cursor-pointer label" for="pageOnly">
                          <span class="label-text">Scope is current page (else all filtered)</span>
                          <input id="pageOnly" v-model="largeSelect.pageOnly" type="checkbox"
                            class="checkbox checkbox-sm" />
                        </label>
                      </div>
                      <button type="button" class="btn btn-primary btn-sm" @click="selectLarge()">
                        Apply
                      </button>
                    </div>
                  </div>
                </details>

                <button type="button" class="btn btn-outline btn-xs" @click="openSmartSelect = true">
                  🎯 Smart Select
                </button>
                <button type="button" class="btn btn-outline btn-xs" @click="selectSimilar()">
                  ⚡ Select Similar
                </button>
              </div>

              <!-- Search Input -->
              <div class="mb-4">
                <label class="sr-only" for="txSearch">Search everything</label>
                <input id="txSearch" v-model="searchQuery" type="text" class="input input-bordered input-sm w-full"
                  placeholder="Search anything… e.g. 'uber tag:ride type:spending >20 last:30d since:2024-01-01 cat:grocery #family src:nab -starbucks' | amount:50 or $50 for exact match"
                  autocomplete="off" />
                <p class="mt-1 text-xs opacity-70">
                  Tips: <code>type:income</code> | <code>cat:grocery</code> |
                  <code>#work</code> | <code>&gt;25</code> |
                  <code>last:30d</code> | <code>since:2024-01-01</code> |
                  <code>date:2024-01..2024-03</code> | <code>src:nab</code> |
                  Amount: <code>$50</code> or <code>amount:50</code> for exact match, <code>&gt;=50</code> or
                  <code>&lt;=50</code> for ranges |
                  NOT: <code>-pizza</code>
                </p>
                <!-- Active amount filter indicator -->
                <div v-if="activeAmountFilter"
                  class="mt-2 inline-flex items-center gap-1 text-xs font-semibold bg-primary/10 text-primary px-3 py-1 rounded-full">
                  <span>💰</span>
                  <span>{{ activeAmountFilter }}</span>
                  <button type="button"
                    @click="searchQuery = searchQuery.replace(/(amount:\$?\d+(\.\d+)?|\$?\d+(\.\d+)?|>=?\d+(\.\d+)?|<=?\d+(\.\d+)?)\s*/g, '').trim()"
                    class="ml-1 focus-ring hover:bg-primary/20 rounded-full px-1"
                    aria-label="Remove amount filter">✕</button>
                </div>
              </div>

              <!-- Bulk Actions (Hidden until transactions exist) -->
              <div v-if="
                showAdvancedTransactionsView &&
                filteredTransactions.length > 0
              " class="flex flex-wrap justify-between items-center mb-3">
                <label class="label cursor-pointer gap-2 text-sm" for="prioritizeSel">
                  <input id="prioritizeSel" type="checkbox" class="checkbox checkbox-xs" v-model="prioritizeSelected" />
                  <span>Prioritize selected on top</span>
                </label>

                <div class="flex flex-wrap gap-2 items-center">
                  <button type="button" class="btn btn-accent btn-xs" :disabled="selectedCount === 0"
                    @click="openBulkEdit">
                    🛠️ Bulk Edit ({{ selectedCount }} selected)
                  </button>
                  <button type="button" class="btn btn-ghost btn-xs" @click="clearSelection">
                    ✕ Clear Selection
                  </button>
                  <button type="button" class="btn btn-error btn-xs" @click="bulkDelete"
                    :disabled="selectedCount === 0">
                    🗑️ Delete Selected
                  </button>
                </div>
              </div>

              <!-- Table Area -->
              <div class="overflow-x-auto">
                <div class="grid gap-3 overflow-x-auto">
                  <table class="table table-zebra w-full" role="grid" aria-multiselectable="true">
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
                            <input type="checkbox" class="checkbox checkbox-sm" :checked="allSelected" :indeterminate="someSelectedOnPage && !allSelected
                              " @change="toggleSelectAll" aria-label="Select all on current page" />
                          </label>
                        </th>
                        <th scope="col">
                          <button type="button" class="btn btn-ghost btn-xs" @click="updateSort('date')">
                            Date
                            <span aria-hidden="true">{{
                              getSortIcon("date")
                            }}</span>
                          </button>
                        </th>
                        <th scope="col">
                          <button type="button" class="btn btn-ghost btn-xs" @click="updateSort('type')">
                            Type
                            <span aria-hidden="true">{{
                              getSortIcon("type")
                            }}</span>
                          </button>
                        </th>
                        <th scope="col">
                          <button type="button" class="btn btn-ghost btn-xs" @click="updateSort('amount')">
                            Amount
                            <span aria-hidden="true">{{
                              getSortIcon("amount")
                            }}</span>
                          </button>
                        </th>
                        <th scope="col">
                          <button type="button" class="btn btn-ghost btn-xs" @click="updateSort('category')">
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
                      <tr v-for="(t, i) in paginatedTransactions" :key="t.id" :id="`tx-${t.id}`"
                        :aria-selected="isSelected(t.id) ? 'true' : 'false'"
                        :class="{ 'bg-base-200': isSelected(t.id) }">
                        <td>
                          <label>
                            <input type="checkbox" class="checkbox checkbox-sm" :checked="isSelected(t.id)"
                              @change="toggleSelectRow(t.id)" :aria-label="`Select transaction on ${formatDate(
                                t.date
                              )} for $${t.amount.toFixed(2)}`" />
                            <span class="sr-only" v-if="isSelected(t.id)">
                              Selected
                            </span>
                          </label>
                        </td>
                        <td>{{ formatDate(t.date) }}</td>
                        <td>
                          <span class="badge type-badge" :class="t.type === 'income'
                            ? 'badge-success'
                            : 'badge-error'
                            ">
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
                            <span v-for="tag in t.tags" :key="t.id + '-tg-' + tag" class="badge sm:badge-ghost">
                              {{ tag }}
                            </span>
                            <span v-if="!t.tags?.length" class="text-base-content/50">
                              —
                            </span>
                          </div>
                        </td>
                        <td>{{ t.description }}</td>
                        <td class="whitespace-nowrap text-right">
                          <button type="button" class="btn btn-ghost btn-xs" @click="editTransaction(t)"
                            aria-label="Edit">
                            ✏️
                          </button>
                          <button type="button" class="btn btn-ghost btn-xs" @click="duplicateTx(t)"
                            aria-label="Duplicate">
                            📄
                          </button>
                          <button type="button" class="btn btn-ghost btn-xs text-error" @click="deleteTransaction(t.id)"
                            aria-label="Delete">
                            🗑️
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Pagination -->
              <div v-if="totalPages > 1" class="flex justify-center mt-6" role="navigation" aria-label="Pagination">
                <div class="btn-group">
                  <button type="button" class="btn btn-sm" :disabled="currentPage === 1" @click="currentPage = 1"
                    aria-label="First page">
                    «
                  </button>
                  <button type="button" class="btn btn-sm" :disabled="currentPage === 1" @click="currentPage--"
                    aria-label="Previous page">
                    ‹
                  </button>
                  <button class="btn btn-sm btn-active" aria-current="page">
                    Page {{ currentPage }} / {{ totalPages }}
                  </button>
                  <button type="button" class="btn btn-sm" :disabled="currentPage === totalPages"
                    @click="currentPage = Math.min(totalPages, currentPage + 1)" aria-label="Next page">
                    ›
                  </button>
                  <button type="button" class="btn btn-sm" :disabled="currentPage === totalPages"
                    @click="currentPage = totalPages" aria-label="Last page">
                    »
                  </button>
                </div>
              </div>
            </div>
          </section>
        </template>

        <!-- Add Transaction -->
        <section v-show="activeTab === 'add'" ref="addSectionRef" class="card bg-base-100 shadow-xl mb-6"
          aria-labelledby="addHeading">
          <div class="card-body">
            <div class="flex items-center justify-between gap-2">
              <h2 id="addHeading" class="card-title">
                {{
                  currentlyEditingId
                    ? "✏️ Edit Transaction"
                    : "➕ Add Transaction"
                }}
              </h2>
              <span class="badge badge-ghost" :class="newTransaction.type === 'income'
                ? 'badge-success'
                : 'badge-error'
                " aria-live="polite">
                {{ newTransaction.type === "income" ? "Income" : "Spending" }}
              </span>
            </div>
            <!-- <h2 id="addHeading" class="card-title">➕ Add Transaction</h2> -->
            <form @submit.prevent="addTransaction" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <!-- Date -->
              <div class="form-control relative">
                <label class="label" for="addDate">
                  <span class="label-text">Date</span>
                </label>

                <div class="join w-full">
                  <input id="addDate" ref="addDateTextRef" type="text" inputmode="numeric" placeholder="dd-mm-yyyy"
                    v-model="newTxDateText" @input="onAddDateInput" @blur="onAddDateBlur"
                    @keydown="onDateKeydownDigitsOnly" :aria-invalid="!!newTxDateError" aria-describedby="addDateError"
                    class="input input-bordered join-item w-full" enterkeyhint="done" />
                  <button type="button" class="btn btn-outline join-item" @click="openAddCalendar" title="Open calendar"
                    aria-label="Open calendar">
                    📅
                  </button>
                </div>

                <p v-if="newTxDateError" id="addDateError" class="text-error text-sm mt-1">
                  {{ newTxDateError }}
                </p>

                <!-- Optional native date (kept hidden as progressive enhancement/fallback) -->
                <input ref="addDatePickerRef" v-model="newTxDateISO" type="date" class="sr-only" tabindex="-1"
                  aria-hidden="true" />

                <!-- Calendar Popover -->
                <div v-if="addCalOpen"
                  class="absolute z-[80] mt-2 w-[20rem] max-w-[calc(100vw-2rem)] card bg-base-100 shadow-xl border border-base-300"
                  role="dialog" aria-label="Choose a date">
                  <div class="card-body p-3">
                    <div class="flex items-center justify-between mb-2">
                      <button type="button" class="btn btn-ghost btn-xs" @click="calPrevMonth"
                        aria-label="Previous month">
                        ‹
                      </button>
                      <div class="font-semibold">
                        {{
                          new Date(calViewMonthISO).toLocaleString(undefined, {
                            month: "long",
                            year: "numeric",
                          })
                        }}
                      </div>
                      <button type="button" class="btn btn-ghost btn-xs" @click="calNextMonth" aria-label="Next month">
                        ›
                      </button>
                    </div>

                    <div class="grid grid-cols-7 text-center text-xs opacity-70 mb-1">
                      <div>Su</div>
                      <div>Mo</div>
                      <div>Tu</div>
                      <div>We</div>
                      <div>Th</div>
                      <div>Fr</div>
                      <div>Sa</div>
                    </div>

                    <div class="grid grid-cols-7 gap-1">
                      <button v-for="cell in calCells" :key="cell.iso" type="button" class="btn btn-xs" :class="[
                        cell.inMonth ? 'btn-ghost' : 'btn-ghost opacity-50',
                        cell.iso === newTxDateISO ? 'btn-primary' : '',
                        cell.isToday && cell.iso !== newTxDateISO
                          ? 'ring-1 ring-primary/50'
                          : '',
                      ]" @click="pickCalDate(cell.iso)" :aria-pressed="cell.iso === newTxDateISO"
                        :aria-label="formatDate(cell.iso)">
                        {{ Number(cell.iso.split("-")[2]) }}
                      </button>
                    </div>

                    <div class="flex justify-between items-center mt-3">
                      <div class="text-xs opacity-70">
                        Selected:
                        <strong>{{
                          newTxDateISO ? formatDate(newTxDateISO) : "—"
                        }}</strong>
                      </div>
                      <div class="flex gap-2">
                        <button type="button" class="btn btn-ghost btn-xs" @click="clearCalDate">
                          Clear
                        </button>
                        <button type="button" class="btn btn-primary btn-xs" @click="pickCalDate(todayLocalISO())">
                          Today
                        </button>
                        <button type="button" class="btn btn-outline btn-xs" @click="closeAddCalendar">
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Type -->
              <div class="form-control">
                <label class="label" for="addType">
                  <span class="label-text">Type</span>
                </label>
                <select id="addType" v-model="newTransaction.type" class="select select-bordered" required>
                  <option value="income">💰 Income</option>
                  <option value="spending">💸 Spending</option>
                </select>
              </div>

              <!-- Amount -->
              <div class="form-control">
                <label class="label" for="addAmount">
                  <span class="label-text">Amount</span>
                </label>
                <div class="join">
                  <span class="join-item btn btn-disabled" aria-hidden="true">$</span>
                  <input id="addAmount" ref="amountInputRef" v-model.number="newTransaction.amount" type="number"
                    step="0.01" min="0" placeholder="0.00" class="input input-bordered join-item flex-1" required
                    inputmode="decimal" />
                </div>
                <p class="mt-1 text-xs opacity-70">
                  Enter a positive amount. Type switches don’t change the sign.
                </p>
              </div>

              <!-- Category -->
              <div class="form-control">
                <label class="label">
                  <span class="label-text font-medium">Category</span>
                  <button v-if="currentCategory" type="button"
                    class="label-text-alt text-primary hover:underline transition-all" @click="clearCategory">
                    Clear
                  </button>
                </label>

                <details ref="categoryDropdownRef" class="dropdown w-full" @toggle="onCategoryToggle">
                  <summary
                    class="btn w-full justify-between normal-case min-h-[44px] hover:border-primary transition-all duration-200"
                    aria-haspopup="listbox" :aria-expanded="String(categoryOpen)">
                    <span class="capitalize flex items-center gap-2">
                      <span v-if="currentCategory" class="w-2 h-2 rounded-full bg-primary"></span>
                      {{ currentCategory || "Choose a category…" }}
                    </span>
                    <svg class="w-4 h-4 transition-transform duration-200" :class="{ 'rotate-180': categoryOpen }"
                      fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>

                  <div
                    class="dropdown-content z-[60] bg-base-100 shadow-xl rounded-lg w-full sm:w-96 mt-2 border border-base-300 overflow-hidden">
                    <!-- Search and Manage Header -->
                    <div class="p-3 bg-base-200 border-b border-base-300">
                      <div class="flex gap-2">
                        <div class="relative flex-1">
                          <input ref="categorySearchRef" v-model.trim="categoryQuery" type="text"
                            class="input input-bordered w-full pr-8 transition-all duration-200 focus:border-primary"
                            placeholder="Search or add…" @keydown.enter.prevent="onCategoryEnter" autocomplete="off" />
                          <svg v-if="!categoryQuery"
                            class="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 opacity-40" fill="none"
                            stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          <button v-else type="button"
                            class="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 transition-opacity"
                            @click="categoryQuery = ''" aria-label="Clear search">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <button type="button"
                          class="btn btn-ghost btn-sm min-h-[44px] px-4 hover:bg-primary hover:text-primary-content transition-all duration-200"
                          @click="openManager('category')" aria-label="Manage categories" title="Manage categories">
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </button>
                      </div>
                      <p v-if="filteredCategories.length > 0" class="text-xs opacity-60 mt-2">
                        {{ filteredCategories.length }} categor{{
                          filteredCategories.length === 1 ? "y" : "ies"
                        }}
                      </p>
                    </div>

                    <!-- Category List -->
                    <ul role="listbox" class="menu max-h-64 overflow-y-auto p-2">
                      <li v-for="cat in filteredCategories" :key="cat" class="transition-all duration-150">
                        <button type="button" role="option"
                          class="justify-between min-h-[44px] rounded-lg hover:bg-primary hover:text-primary-content transition-all duration-200"
                          :class="{
                            'bg-primary/10 font-semibold':
                              currentCategory === cat,
                          }" :aria-selected="String(currentCategory === cat)" @click="
                            selectCategory(cat);
                          closeClosestDetails($event);
                          ">
                          <span class="capitalize">{{ cat }}</span>
                          <span v-if="currentCategory === cat" class="flex items-center gap-1">
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fill-rule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clip-rule="evenodd" />
                            </svg>
                          </span>
                        </button>
                      </li>

                      <!-- No results state -->
                      <li v-if="filteredCategories.length === 0 && !categoryQuery" class="p-4 text-center opacity-60">
                        <div class="text-sm">No categories yet</div>
                      </li>

                      <!-- Add new category -->
                      <li v-if="categoryQuery && !existsCategory(categoryQuery)"
                        class="mt-2 p-2 border-t border-base-300">
                        <button type="button"
                          class="btn btn-primary btn-block min-h-[44px] gap-2 hover:scale-[1.02] transition-transform duration-200"
                          @click="createCategoryAndSelect(categoryQuery)">
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                          </svg>
                          Add "{{ categoryQuery }}"
                        </button>
                      </li>

                      <!-- No results for search -->
                      <li v-if="
                        filteredCategories.length === 0 &&
                        categoryQuery &&
                        existsCategory(categoryQuery)
                      " class="p-4 text-center">
                        <div class="text-sm opacity-60">
                          Category already exists
                        </div>
                      </li>
                    </ul>
                  </div>
                </details>
              </div>

              <!-- Tags -->
              <div class="form-control">
                <label class="label">
                  <span class="label-text font-medium">Tags</span>
                  <button v-if="selectedTags.length > 0" type="button"
                    class="label-text-alt text-primary hover:underline transition-all" @click="clearTags">
                    Clear all
                  </button>
                </label>

                <details ref="tagsDropdownRef" class="dropdown w-full" @toggle="onTagsToggle">
                  <summary
                    class="btn w-full justify-start flex-wrap gap-2 min-h-[44px] h-auto py-2 hover:border-primary transition-all duration-200"
                    aria-haspopup="listbox" :aria-expanded="String(tagsOpen)">
                    <!-- Selected tags as chips -->
                    <div v-if="selectedTags.length === 0" class="opacity-60 flex items-center gap-2">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      Add tags…
                    </div>

                    <div v-else class="flex flex-wrap gap-2 flex-1">
                      <span v-for="tag in selectedTags" :key="tag"
                        class="badge badge-primary gap-2 px-3 py-3 transition-all duration-200 hover:badge-secondary group">
                        <span class="capitalize truncate max-w-[8rem]">{{
                          tag
                        }}</span>
                        <button type="button" class="hover:scale-125 transition-transform duration-150"
                          aria-label="Remove tag" @click.stop="removeTagFromSelection(tag)">
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    </div>

                    <svg class="w-4 h-4 ml-auto transition-transform duration-200 shrink-0"
                      :class="{ 'rotate-180': tagsOpen }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>

                  <div
                    class="dropdown-content z-[60] bg-base-100 shadow-xl rounded-lg w-full sm:w-96 mt-2 border border-base-300 overflow-hidden">
                    <!-- Search and Manage Header -->
                    <div class="p-3 bg-base-200 border-b border-base-300">
                      <div class="flex gap-2">
                        <div class="relative flex-1">
                          <input ref="tagsSearchRef" v-model.trim="tagsQuery" type="text"
                            class="input input-bordered w-full pr-8 transition-all duration-200 focus:border-primary"
                            placeholder="Search or add tag…" @keydown.enter.prevent="onTagsEnter" autocomplete="off" />
                          <svg v-if="!tagsQuery" class="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 opacity-40"
                            fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          <button v-else type="button"
                            class="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 transition-opacity"
                            @click="tagsQuery = ''" aria-label="Clear search">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <button type="button"
                          class="btn btn-ghost btn-sm min-h-[44px] px-4 hover:bg-primary hover:text-primary-content transition-all duration-200"
                          @click="openManager('tag')" aria-label="Manage tags" title="Manage tags">
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </button>
                      </div>
                      <p v-if="filteredTags.length > 0" class="text-xs opacity-60 mt-2">
                        {{ selectedTags.length }} selected ·
                        {{ filteredTags.length }} available
                      </p>
                    </div>

                    <!-- Tags List with Checkboxes -->
                    <ul role="listbox" class="menu max-h-64 overflow-y-auto p-2">
                      <li v-for="tag in filteredTags" :key="tag" class="transition-all duration-150">
                        <button type="button" role="option"
                          class="justify-between min-h-[44px] rounded-lg hover:bg-primary hover:text-primary-content transition-all duration-200"
                          :class="{
                            'bg-primary/10 font-semibold':
                              selectedTags.includes(tag),
                          }" :aria-selected="String(selectedTags.includes(tag))" @click="
                            toggleTag(tag);
                          closeClosestDetails($event);
                          ">
                          <span class="capitalize truncate flex items-center gap-2">
                            <input type="checkbox"
                              class="checkbox checkbox-sm pointer-events-none transition-all duration-200"
                              :checked="selectedTags.includes(tag)" aria-hidden="true" />
                            {{ tag }}
                          </span>
                        </button>
                      </li>

                      <!-- No results state -->
                      <li v-if="filteredTags.length === 0 && !tagsQuery" class="p-4 text-center opacity-60">
                        <div class="text-sm">No tags yet</div>
                      </li>
                    </ul>

                    <!-- Footer Actions -->
                    <div class="p-3 border-t border-base-300 bg-base-100">
                      <button v-if="tagsQuery && !existsTag(tagsQuery)"
                        class="btn btn-primary btn-block min-h-[44px] gap-2 hover:scale-[1.02] transition-transform duration-200"
                        type="button" @click="createTagAndToggle(tagsQuery)">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Add "{{ tagsQuery }}"
                      </button>

                      <div v-else-if="selectedTags.length > 0" class="text-xs text-center opacity-60">
                        Tip: Click tags to toggle selection
                      </div>
                    </div>
                  </div>
                </details>
              </div>

              <!-- Manager Modal -->
              <dialog ref="managerRef" class="modal modal-bottom sm:modal-middle">
                <div class="modal-box p-0 max-w-[48rem] max-h-[90vh] flex flex-col">
                  <!-- Sticky header with drag handle for mobile -->
                  <div class="p-4 border-b border-base-300 bg-base-200 sticky top-0 z-10">
                    <!-- Mobile drag handle -->
                    <div class="w-12 h-1.5 rounded-full bg-base-300 sm:hidden mx-auto mb-3 opacity-60"></div>

                    <div class="flex items-center gap-3">
                      <div class="p-2 rounded-lg bg-primary/10">
                        <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path v-if="managerType === 'category'" stroke-linecap="round" stroke-linejoin="round"
                            stroke-width="2"
                            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                      </div>
                      <div class="flex-1">
                        <h3 class="font-bold text-lg">
                          Manage
                          {{
                            managerType === "category" ? "Categories" : "Tags"
                          }}
                        </h3>
                        <p class="text-xs opacity-60 mt-0.5">
                          {{ managerItems.length }} total
                        </p>
                      </div>
                      <form method="dialog">
                        <button class="btn btn-ghost btn-sm btn-circle hover:bg-base-300 transition-all duration-200"
                          @click="closeManager" aria-label="Close">
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </form>
                    </div>
                  </div>

                  <!-- Sticky controls -->
                  <div class="p-4 border-b border-base-300 bg-base-100 sticky top-[73px] sm:top-[89px] z-10 space-y-3">
                    <!-- Search -->
                    <div class="relative">
                      <input ref="managerSearchRef" v-model="managerSearch" type="text"
                        class="input input-bordered w-full pl-10 transition-all duration-200 focus:border-primary"
                        :placeholder="`Search ${managerType}s…`" autocomplete="off" />
                      <svg class="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 opacity-40" fill="none"
                        stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <button v-if="managerSearch" type="button"
                        class="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 transition-opacity"
                        @click="managerSearch = ''" aria-label="Clear search">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <!-- Add new -->
                    <div class="flex gap-2">
                      <input ref="managerAddRef" v-model.trim="managerNewName" type="text"
                        class="input input-bordered flex-1 transition-all duration-200 focus:border-primary"
                        :placeholder="`Add new ${managerType}…`" @keydown.enter.prevent="managerAdd()"
                        autocomplete="off" />
                      <button
                        class="btn btn-primary min-h-[44px] px-6 gap-2 hover:scale-[1.02] transition-transform duration-200"
                        :disabled="!managerNewName.trim()" @click="managerAdd()">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                        </svg>
                        <span class="hidden sm:inline">Add</span>
                      </button>
                    </div>
                  </div>

                  <!-- Virtualized list with enhanced cards -->
                  <div ref="virtViewportRef" class="flex-1 overflow-y-auto overscroll-contain"
                    @scroll.passive="onVirtScroll" style="-webkit-overflow-scrolling: touch">
                    <div :style="{
                      height: virtTotalHeight + 'px',
                      position: 'relative',
                    }">
                      <!-- Empty state -->
                      <div v-if="managerItems.length === 0"
                        class="absolute inset-0 flex items-center justify-center p-8">
                        <div class="text-center max-w-sm">
                          <div class="w-20 h-20 mx-auto mb-4 rounded-full bg-base-200 flex items-center justify-center">
                            <svg class="w-10 h-10 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                          </div>
                          <h4 class="font-semibold text-lg mb-2">
                            No {{ managerType }}s
                            {{ managerSearch ? "found" : "yet" }}
                          </h4>
                          <p class="text-sm opacity-60">
                            {{
                              managerSearch
                                ? "Try a different search term"
                                : `Add your first ${managerType} above`
                            }}
                          </p>
                        </div>
                      </div>

                      <!-- Item cards -->
                      <template v-for="(item, i) in virtVisibleItems" :key="item">
                        <div class="px-4 py-3 border-b border-base-200 hover:bg-base-100 transition-all duration-150"
                          :style="{
                            position: 'absolute',
                            top: virtItemTop(i) + 'px',
                            left: '0',
                            right: '0',
                            height: rowH + 'px',
                          }">
                          <!-- Normal view -->
                          <div v-if="renameTarget !== item" class="flex items-center gap-3 h-full">
                            <div class="flex-1 min-w-0">
                              <div class="font-medium capitalize truncate flex items-center gap-2">
                                <span>{{ item }}</span>
                                <span v-if="
                                  managerType === 'category' &&
                                  isDefaultCategory(item)
                                " class="badge badge-ghost badge-xs">default</span>
                                <span v-if="
                                  managerType === 'category' &&
                                  isHiddenCategory(item)
                                " class="badge badge-warning badge-xs">hidden</span>
                              </div>

                              <div class="text-xs opacity-60 mt-0.5">
                                {{ getCategoryUsageCount(item) }} transaction{{
                                  getCategoryUsageCount(item) === 1 ? "" : "s"
                                }}
                              </div>
                            </div>

                            <div class="flex gap-2 shrink-0">
                              <button
                                class="btn btn-ghost btn-sm min-h-[36px] gap-1 hover:bg-primary hover:text-primary-content transition-all duration-200"
                                @click="startRename(item)">
                                <!-- icon omitted for brevity -->
                                <span class="hidden sm:inline">Rename</span>
                              </button>

                              <!-- 👇 NEW: Restore only when category is hidden -->
                              <button v-if="
                                managerType === 'category' &&
                                isHiddenCategory(item)
                              " class="btn btn-ghost btn-sm min-h-[36px]" @click="restoreCategory(item)">
                                Restore
                              </button>

                              <button
                                class="btn btn-ghost btn-sm min-h-[36px] gap-1 text-error hover:bg-error hover:text-error-content transition-all duration-200"
                                @click="confirmDelete(item)">
                                <!-- icon omitted for brevity -->
                                <span class="hidden sm:inline">Delete</span>
                              </button>
                            </div>
                          </div>

                          <!-- Rename view -->
                          <div v-else class="flex items-center gap-2 h-full">
                            <input ref="renameInputRef" v-model.trim="renameValue" type="text"
                              class="input input-bordered flex-1 input-sm transition-all duration-200 focus:border-primary"
                              :placeholder="`Rename '${renameTarget}' to…`" @keydown.enter.prevent="confirmRename"
                              @keydown.esc="cancelRename" autocomplete="off" />
                            <button
                              class="btn btn-primary btn-sm min-h-[36px] gap-1 hover:scale-[1.05] transition-transform duration-200"
                              @click="confirmRename" :disabled="!renameValue.trim()">
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                  d="M5 13l4 4L19 7" />
                              </svg>
                              Save
                            </button>
                            <button class="btn btn-ghost btn-sm min-h-[36px]" @click="cancelRename">
                              Cancel
                            </button>
                          </div>
                        </div>
                      </template>
                    </div>
                  </div>

                  <!-- Footer tip -->
                  <div class="p-3 border-t border-base-300 bg-base-100 text-xs text-center opacity-70">
                    <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Tip: Renaming to an existing {{ managerType }} will merge
                    them
                  </div>
                </div>

                <form method="dialog" class="modal-backdrop">
                  <button @click="closeManager">close</button>
                </form>
              </dialog>

              <!-- Rename Confirmation Modal -->
              <dialog ref="renameConfirmRef" class="modal modal-middle">
                <div class="modal-box max-w-md">
                  <div class="flex items-start gap-3">
                    <div class="p-2 rounded-lg bg-info/10 shrink-0">
                      <svg class="w-6 h-6 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <div class="flex-1">
                      <h3 class="font-bold text-lg">
                        Update {{ managerType }} References?
                      </h3>
                      <p class="text-sm opacity-70 mt-2">
                        Renaming <strong>{{ renameTarget }}</strong> to
                        <strong>"{{ renameValue }}"</strong> will update all
                        transactions with this {{ managerType }}.
                      </p>
                      <p v-if="updateCount > 0" class="text-sm mt-3 p-3 bg-info/10 rounded border-l-4 border-info">
                        This will affect
                        <strong>{{ updateCount }}</strong>
                        transaction{{ updateCount === 1 ? "" : "s" }}.
                      </p>
                    </div>
                  </div>

                  <div class="modal-action">
                    <button class="btn btn-ghost" @click="cancelRename">
                      Cancel
                    </button>
                    <button class="btn btn-primary gap-2" @click="confirmRenameApply">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L9 17" />
                      </svg>
                      Update All
                    </button>
                  </div>
                </div>
                <form method="dialog" class="modal-backdrop">
                  <button @click="cancelRename">close</button>
                </form>
              </dialog>

              <!-- Description -->
              <div class="form-control">
                <label class="label" for="addDesc">
                  <span class="label-text">Description (Optional)</span>
                </label>
                <input id="addDesc" v-model="newTransaction.description" type="text"
                  placeholder="Transaction description" class="input input-bordered" />
              </div>

              <!-- Recurring Transaction -->
              <div class="form-control">
                <label class="label cursor-pointer" for="addRecurring">
                  <span class="label-text">Recurring Transaction</span>
                  <input id="addRecurring" v-model="newTransaction.recurring" type="checkbox" class="checkbox" />
                </label>
                <div v-if="newTransaction.recurring" class="space-y-2 mt-2">
                  <label class="sr-only" for="addFreq">Frequency</label>
                  <select id="addFreq" v-model="newTransaction.frequency"
                    class="select select-bordered select-sm w-full" aria-describedby="recurringHelp">
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="fortnightly">Fortnightly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>

                  <label class="sr-only" for="addRecursions">
                    Number of occurrences
                  </label>
                  <input id="addRecursions" v-model.number="newTransaction.recursions" type="number" min="1" max="365"
                    placeholder="Number of occurrences" class="input input-bordered input-sm w-full"
                    aria-describedby="recurringHelp" />

                  <!-- Live end date display -->
                  <p id="recurringHelp" class="text-xs text-base-content/70" aria-live="polite">
                    Starts
                    <strong>{{ formatDate(newTransaction.date) }}</strong>.
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

              <!-- Submit Buttons -->
              <div class="form-control md:col-span-2 lg:col-span-3">
                <label class="label">
                  <span class="label-text">&nbsp;</span>
                </label>
                <div class="join w-full max-w-md">
                  <button type="submit" class="btn btn-primary join-item flex-1" :disabled="!newTransaction.amount || !newTransaction.category
                    ">
                    {{ currentlyEditingId ? "Update" : "Add" }} Transaction
                  </button>
                  <button type="button" class="btn btn-ghost join-item" @click="resetForm">
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </section>

        <!-- Import / Export -->
        <section v-show="activeTab === 'import'" class="card bg-base-100 shadow-xl mb-6"
          aria-labelledby="importExportHeading">
          <div class="card-body">
            <h2 id="importExportHeading" class="card-title">
              📥 Import / 📤 Export
            </h2>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- Importers -->
              <div class="space-y-6">
                <!-- File upload -->
                <div class="form-control">
                  <label class="label" for="csvUpload">
                    <span class="label-text">Upload CSV File</span>
                  </label>
                  <input id="csvUpload" type="file" accept=".csv" multiple class="file-input file-input-bordered w-full"
                    @change="handleFileUpload" ref="csvInputRef" />
                  <p class="text-xs text-base-content/60 mt-1">
                    After upload you'll be prompted to label the import (e.g.,
                    "ING Everyday - May 2025").
                  </p>
                </div>

                <!-- URL / Share code -->
                <div class="form-control">
                  <label class="label" for="importUrl">
                    <span class="label-text">Import from URL or Share Code</span>
                  </label>
                  <div class="join">
                    <input id="importUrl" v-model="importUrl" type="text" inputmode="url" autocapitalize="off"
                      autocorrect="off" placeholder="https://... or share code (tx:...)"
                      class="input input-bordered join-item flex-1" @keyup.enter="importFromUrlOrCode" />
                    <button type="button" class="btn btn-primary join-item" @click="importFromUrlOrCode"
                      :disabled="!importUrl.trim()">
                      Import
                    </button>
                  </div>
                  <p class="text-xs text-base-content/60 mt-1">
                    Tip: Paste a link with <code>?tx=...</code> or just the
                    share code (starts with <code>tx:</code>).
                  </p>
                </div>

                <!-- Import Actions -->
                <div class="flex flex-wrap gap-2">
                  <button type="button" class="btn btn-outline btn-sm" @click="importFromClipboard">
                    📋 Paste from Clipboard
                  </button>
                  <button type="button" class="btn btn-error btn-sm" @click="clearAllTransactions">
                    🧨 Remove all transactions
                  </button>
                </div>
              </div>

              <!-- Exporters -->
              <div class="space-y-6">
                <!-- Share code -->
                <div class="form-control">
                  <label class="label" for="shareCode">
                    <span class="label-text">Share Code (compact, paste anywhere)</span>
                  </label>
                  <div class="join">
                    <input id="shareCode" :value="shareCode" readonly
                      class="input input-bordered join-item flex-1 font-mono text-sm" />
                    <button type="button" class="btn join-item" @click="copy(shareCode)"
                      :disabled="!shareCode || shareCode === 'tx:'">
                      Copy
                    </button>
                  </div>
                  <p class="text-xs text-base-content/60 mt-1">
                    Length: <strong>{{ shareCodeLength }}</strong> characters.
                    <span v-if="shareCodeLength > SHARE_URL_SAFE_LIMIT" class="text-warning">
                      (Tip: Use JSON export for very large datasets.)
                    </span>
                  </p>
                  <p class="text-xs text-base-content/60 mt-1">
                    Paste into the "Import from URL or Share Code" box.
                  </p>
                </div>

                <!-- JSON Export / Import -->
                <div class="form-control">
                  <label class="label">
                    <span class="label-text">JSON Export / Import</span>
                  </label>
                  <div class="flex flex-wrap gap-2 items-center">
                    <button type="button" class="btn btn-outline btn-sm" @click="downloadJson()"
                      :disabled="transactions.length === 0">
                      ⬇️ Download JSON
                    </button>
                    <label class="btn btn-outline btn-sm cursor-pointer">
                      ⬆️ Upload JSON
                      <input type="file" accept="application/json" class="sr-only" @change="handleJsonImport" />
                    </label>
                  </div>
                  <p class="text-xs text-base-content/60 mt-1">
                    Use JSON to transfer large datasets offline without relying
                    on long links.
                  </p>
                </div>

                <!-- Web Share API -->
                <div v-if="canWebShare" class="form-control">
                  <label class="label">
                    <span class="label-text">Share via Device</span>
                  </label>
                  <button type="button" class="btn btn-outline btn-sm" @click="webShare(shareUrl)"
                    :disabled="!shareCode || shareCode === 'tx:'">
                    📱 Share via...
                  </button>
                  <p class="text-xs text-base-content/60 mt-1">
                    Use your device's native sharing options.
                  </p>
                </div>

                <!-- Import Status -->
                <div v-if="importStatus" class="alert" :class="importError ? 'alert-error' : 'alert-info'">
                  <span>{{ importStatus }}</span>
                </div>

                <!-- Last Import Summary -->
                <div v-if="lastImportSummary" class="alert alert-success">
                  <span>{{ lastImportSummary }}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Charts Section -->
        <section v-show="activeTab === 'chart'" class="space-y-6" aria-labelledby="chartHeading">
          <!-- Date Filter Card -->
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <h3 id="chartHeading" class="card-title">🗓️ Date Filter</h3>
              <div class="flex flex-wrap gap-2 mb-4">
                <button v-for="preset in datePresets" :key="preset.label" class="btn btn-sm"
                  :class="{ 'btn-primary': selectedDatePreset === preset.label }" @click="applyDatePreset(preset)">{{
                    preset.label }}</button>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="form-control">
                  <label class="label" for="startDate"><span class="label-text">Start Date</span></label>
                  <input id="startDate" v-model="dateFilter.start" type="date" class="input input-bordered" />
                </div>
                <div class="form-control">
                  <label class="label" for="endDate"><span class="label-text">End Date</span></label>
                  <input id="endDate" v-model="dateFilter.end" type="date" class="input input-bordered" />
                </div>
              </div>
              <div class="flex justify-between items-center mt-4">
                <div class="text-sm text-base-content/60">Date Range: {{ formatDateRange() }} ({{
                  filteredTransactions.length }}
                  transactions)</div>
                <button class="btn btn-ghost btn-sm" @click="resetDateFilter">Reset</button>
              </div>
            </div>
          </div>

          <!-- Analytics Card -->
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <h3 class="card-title">📊 Financial Analytics</h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div class="form-control">
                  <label class="label" for="chartType"><span class="label-text">Chart Type</span></label>
                  <select id="chartType" v-model="chartConfig.type" class="select select-bordered">
                    <option value="line">📈 Line</option>
                    <option value="bar">📊 Bar</option>
                    <option value="pie">🥧 Pie</option>
                    <option value="doughnut">🍩 Doughnut</option>
                  </select>
                </div>
                <div class="form-control">
                  <label class="label" for="groupBy"><span class="label-text">Group By</span></label>
                  <select id="groupBy" v-model="chartConfig.groupBy" class="select select-bordered">
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="fortnightly">Fortnightly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <!-- Selection Mode Toggle -->
                <div class="form-control">
                  <label class="label"><span class="label-text">Filter Mode</span></label>
                  <div class="join border-base-300 rounded-lg overflow-hidden" role="radiogroup"
                    aria-label="Selection mode">
                    <button type="radio"
                      :class="['join-item btn', chartSelectionMode === 'or' ? 'btn-primary' : 'btn-outline']"
                      :aria-pressed="chartSelectionMode === 'or'" @click="chartSelectionMode = 'or'">
                      Either (OR)
                    </button>
                    <button type="radio"
                      :class="['join-item btn', chartSelectionMode === 'and' ? 'btn-primary' : 'btn-outline']"
                      :aria-pressed="chartSelectionMode === 'and'" @click="chartSelectionMode = 'and'">
                      All (AND)
                    </button>
                  </div>
                </div>
                <div class="form-control">
                  <label class="label"><span class="label-text">Categories</span></label>
                  <div class="flex flex-wrap gap-1 max-h-32 overflow-y-auto p-2 border border-base-300 rounded-lg"
                    role="listbox" aria-label="Selected categories">
                    <button v-for="category in chartCategories" :key="category" type="button"
                      class="badge badge-outline cursor-pointer text-xs"
                      :class="{ 'badge-primary': selectedCategoriesChart.includes(category) }"
                      @click="toggleCategoryForChart(category)"
                      :aria-pressed="selectedCategoriesChart.includes(category)">
                      {{ category }}<span v-if="selectedCategoriesChart.includes(category)" class="ml-1"
                        aria-hidden="true">✕</span>
                    </button>
                  </div>
                  <div class="mt-2 flex gap-2">
                    <button type="button" class="btn btn-xs btn-ghost" @click="selectAllCategoriesChart()">Select
                      All</button>
                    <button type="button" class="btn btn-xs btn-ghost" @click="unselectAllCategoriesChart()">Unselect
                      All</button>
                  </div>
                </div>
                <div class="form-control">
                  <label class="label"><span class="label-text">Tags</span></label>
                  <div class="flex flex-wrap gap-1 max-h-32 overflow-y-auto p-2 border border-base-300 rounded-lg"
                    role="listbox" aria-label="Selected tags">
                    <button v-for="tag in chartTags" :key="tag" type="button"
                      class="badge badge-outline cursor-pointer text-xs"
                      :class="{ 'badge-primary': selectedTagsChart.includes(tag) }" @click="toggleTagForChart(tag)"
                      :aria-pressed="selectedTagsChart.includes(tag)">
                      {{ tag }}<span v-if="selectedTagsChart.includes(tag)" class="ml-1" aria-hidden="true">✕</span>
                    </button>
                  </div>
                  <div class="mt-2 flex gap-2">
                    <button type="button" class="btn btn-xs btn-ghost" @click="selectAllTagsForChart">Select
                      All</button>
                    <button type="button" class="btn btn-xs btn-ghost" @click="unselectAllTagsForChart">Unselect
                      All</button>
                  </div>
                </div>
                <div class="form-control md:col-span-3">
                  <label class="label"><span class="label-text">Series</span></label>
                  <div class="flex flex-wrap items-center gap-4 text-sm">
                    <label class="inline-flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" class="checkbox checkbox-xs"
                        v-model="seriesToggles.income" /><span>Income</span>
                    </label>
                    <label class="inline-flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" class="checkbox checkbox-xs"
                        v-model="seriesToggles.spending" /><span>Spending</span>
                    </label>
                    <label class="inline-flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" class="checkbox checkbox-xs"
                        v-model="seriesToggles.balance" /><span>Avaliable
                        Balance (Period)</span>
                    </label>
                    <label class="inline-flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" class="checkbox checkbox-xs"
                        v-model="seriesToggles.allTimeCumulativeNetBalance" /><span>All-time Net Balance</span>
                    </label>
                  </div>
                </div>
              </div>

              <!-- Chart Canvas -->
              <div class="bg-base-200 rounded-lg p-4 min-h-[400px] flex items-center justify-center">
                <div v-if="chartData.labels.length === 0" class="text-center text-base-content/60">
                  <div class="text-6xl mb-4" aria-hidden="true">📊</div>
                  <h3 class="text-lg font-semibold mb-2">No Data to Display</h3>
                  <p>Add some transactions to see your financial analytics</p>
                </div>
                <canvas v-else ref="chartCanvas" class="max-w-full max-h-[400px]"></canvas>
              </div>

              <!-- Summary Statistics -->
              <div class="stats stats-vertical lg:stats-horizontal shadow mt-6 w-full">
                <div class="stat">
                  <div class="stat-title">Total Income</div>
                  <div class="stat-value text-success">${{ totalIncome.toFixed(2) }}</div>
                  <div class="stat-desc">{{ incomeTransactions.length }} transactions</div>
                </div>
                <div class="stat">
                  <div class="stat-title">Total Expenses</div>
                  <div class="stat-value text-error">${{ totalExpenses.toFixed(2) }}</div>
                  <div class="stat-desc">{{ expenseTransactions.length }} transactions</div>
                </div>
                <div class="stat">
                  <div class="stat-title">Net Balance</div>
                  <div class="stat-value" :class="netBalance >= 0 ? 'text-success' : 'text-error'">
                    ${{ Math.abs(netBalance).toFixed(2) }}
                  </div>
                  <div class="stat-desc">{{ netBalance >= 0 ? 'Surplus' : 'Deficit' }}</div>
                </div>
              </div>
            </div>
          </div>
        </section>



        <!-- About Section -->
        <section v-show="activeTab === 'about'" class="card bg-base-100 shadow-xl max-w-4xl mx-auto mt-8"
          aria-labelledby="aboutHeading">
          <div class="card-body">
            <h2 id="aboutHeading" class="card-title text-2xl font-bold">
              ℹ️ About
            </h2>

            <div class="prose max-w-none space-y-4">
              <h1 class="text-3xl lg:text-4xl font-bold">
                myAniFi - {{ version }}
              </h1>

              <p class="lead">
                <strong>My Financial Forecaster/Tracker.</strong><br />
                Take control of your finances by importing your bank statements or
                adding transactions manually.
              </p>

              <h2 class="pt-4 text-2xl font-bold">🔒 Privacy First</h2>
              <p>All your data is stored privately and securely on your device.</p>

              <div class="divider"></div>

              <!-- Show this CTA only if there are no transactions -->
              <div v-if="!transactions.length" class="text-center mt-8">
                <button type="button" class="btn btn-primary btn-wide btn-lg" @click="startTourFromAbout">
                  Get Started Now
                </button>
              </div>

              <div v-if="!transactions.length" class="divider"></div>

              <h2 class="text-2xl font-bold">🏦 Bank Support</h2>
              <p>Effortlessly import from major Australian banks:</p>

              <div class="grid grid-cols-1 gap-2">
                <span>✅ Westpac</span>
                <span>✅ NAB</span>
                <span>✅ ANZ</span>
                <span>✅ CommBank</span>
                <span>✅ St.George</span>
                <span>✅ ING</span>
                <span>✅ Macquarie</span>
                <span>✅ Up Bank</span>
                <span>✅ UBank</span>
                <span>🧪 Wise Bank - Experimental</span>
              </div>

              <div class="divider"></div>

              <h2 class="text-2xl font-bold">✨ Key Features</h2>

              <ul class="space-y-2">
                <li>
                  🏷️ <strong>Improved Custom Categories and Tags</strong> - Search and
                  add your own transaction categories and tags
                </li>
                <li>
                  🎯 <strong>Smart Bulk Operations</strong> - Select and edit multiple
                  transactions
                </li>
                <li>
                  📊 <strong>Advanced Analytics</strong> - Enhanced charts and filtering
                </li>
                <li>
                  🔄 <strong>Auto-Categorization</strong> - Smart category suggestions
                </li>
                <li>
                  📥 <strong>CSV Import</strong> - Supports the 4 major Australian banks
                </li>
                <li>
                  💾 <strong>Auto-Recall</strong> - Seamlessly loads local data from
                  your browser
                </li>
                <li>📈 <strong>Interactive Charts and Analytics</strong></li>
                <li>🔄 <strong>Recurring Transaction Support</strong></li>
                <li>🎨 <strong>Multi-Theme Support</strong></li>
                <li>📱 <strong>Mobile-Responsive Design-ish</strong></li>
                <li>📅 <strong>Improved Date Selection</strong></li>
              </ul>

              <div class="divider"></div>

              <h2 class="text-2xl font-bold">🚀 Future Features</h2>

              <ul class="space-y-2">
                <li>- Support Remove Tag</li>
                <li>- Improve Wise Bank support</li>
                <li>- Interactive bubble map chart type</li>
                <li>- Select all or select on page</li>
                <li>- Categories and tags need to update on edit</li>
                <li>- Filter by exact amount</li>
                <li>- Improve edit transaction to recurring</li>
                <li>- Remember last selected option</li>
              </ul>

              <div class="divider"></div>

              <h2 class="text-2xl font-bold">🛠️ Technical Stack</h2>

              <ul class="space-y-2">
                <li>Vue 3 with TypeScript</li>
                <li>DaisyUI for styling</li>
                <li>Chart.js for analytics</li>
              </ul>

              <div class="divider"></div>

              <h2 class="text-2xl font-bold">🧾 Licence</h2>

              <ul class="space-y-2">
                <li>
                  Redistributors must ensure all source code is publicly available and
                  accessible
                </li>
                <li>GPLv3 LICENSE</li>
              </ul>
            </div>
          </div>
        </section>
      </template>
    </main>

    <!-- Tag Picker Modal -->
    <dialog v-if="tagPicker.open" class="modal modal-open" aria-modal="true" role="dialog"
      aria-labelledby="tagPickerHeading">
      <div class="modal-box w-full max-w-2xl p-0 md:max-h-[80vh]">
        <!-- Sticky search/header -->
        <div class="p-3 bg-base-200 sticky top-0 z-10">
          <div class="flex items-center justify-between gap-2">
            <h3 id="tagPickerHeading" class="font-bold text-lg">Select Tags</h3>
            <button type="button" class="btn btn-ghost btn-sm" @click="closeTagPicker" aria-label="Close">
              ✕
            </button>
          </div>
          <div class="mt-2 grid grid-cols-[1fr_auto] gap-2">
            <input ref="tagPickerInputRef" v-model="tagPicker.q" type="text"
              class="input input-bordered input-sm w-full" placeholder="Search or create…" autocomplete="off"
              @keydown.enter.prevent="createTagFromQuery()" />
            <button type="button" class="btn btn-primary btn-sm" @click="createTagFromQuery()"
              :disabled="!tagPicker.q.trim()">
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
        <div class="px-3 pb-3 max-h-[70vh] md:max-h-[60vh] overflow-y-auto overscroll-contain"
          style="-webkit-overflow-scrolling: touch" @scroll.passive="onTagScroll" ref="tagPickerScrollRef">
          <ul class="menu bg-base-100 rounded-box shadow divide-y divide-base-300">
            <li v-for="t in tagSlice" :key="t" class="py-1">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" class="checkbox checkbox-sm" :checked="tagPicker.selected.has(t)"
                  @change="toggleTagPick(t, $event.target.checked)" />
                <span class="truncate">{{ t }}</span>
              </label>
            </li>
          </ul>

          <div v-if="!tagSlice.length" class="p-4 text-center opacity-70">
            No tags yet. Type above to add.
          </div>

          <div v-if="tagSlice.length < filteredTagList.length" class="text-center text-xs opacity-60 mt-3">
            Loading more…
          </div>
        </div>

        <div class="p-3 flex justify-between items-center border-t border-base-300">
          <div class="text-xs opacity-70">
            Selected: {{ tagPicker.selected.size }}
          </div>
          <div class="flex flex-wrap gap-2">
            <button type="button" class="btn btn-ghost btn-sm" @click="closeTagPicker">
              Cancel
            </button>
            <button type="button" class="btn btn-primary btn-sm" @click="applyPickedTags">
              Apply
            </button>
          </div>
        </div>
      </div>
    </dialog>

    <!-- Label Import Modal -->
    <dialog v-if="labelImport.open" class="modal modal-open" aria-modal="true" role="dialog"
      aria-labelledby="labelImportHeading">
      <div class="modal-box w-full max-w-md">
        <h3 id="labelImportHeading" class="font-bold text-lg">
          📝 Label this import
        </h3>
        <p class="mt-2 text-sm text-base-content/70">
          Give this CSV a name so you can filter and report on it later.
          <span v-if="labelImport.filename">
            (<strong>{{ labelImport.filename }}</strong>)
          </span>
        </p>

        <div class="form-control mt-4">
          <label class="label" for="importLabel">
            <span class="label-text">Name / Description</span>
          </label>
          <input id="importLabel" v-model="labelImport.label" type="text" class="input input-bordered"
            placeholder="e.g. NAB Credit Card – 2025 Q2" required />
        </div>

        <div class="form-control mt-3">
          <label class="label" for="importNote">
            <span class="label-text">Notes (optional)</span>
          </label>
          <input id="importNote" v-model="labelImport.note" type="text" class="input input-bordered"
            placeholder="Anything to remember about this file" />
        </div>

        <div class="mt-4 text-sm text-base-content/70">
          Ready to import
          <strong>{{ labelImport.imported.length }}</strong> transaction{{
            labelImport.imported.length === 1 ? "" : "s"
          }}
        </div>

        <!-- Tag selection for this import -->
        <div class="form-control mt-3">
          <label class="label" for="importTags">
            <span class="label-text">Tags (optional)</span>
            <span class="label-text-alt">{{ labelImport.tagsSelected.length }} selected</span>
          </label>

          <div class="join w-full">
            <input id="importTags" v-model="labelImport.tagsQuery" type="text"
              class="input input-bordered join-item flex-1" placeholder="Type a tag then press "
              @keydown.enter.prevent="addLabelTagFromQuery()" />
            <button type="button" class="btn join-item" @click="addLabelTagFromQuery()"
              :disabled="!labelImport.tagsQuery.trim()">
              ＋
            </button>
          </div>

          <!-- Selected as chips -->
          <div class="mt-2 flex flex-wrap gap-2">
            <span v-for="tg in labelImport.tagsSelected" :key="`sel-${tg}`" class="badge badge-primary gap-1">
              <span class="capitalize">{{ tg }}</span>
              <button type="button" class="btn btn-ghost btn-xs" @click="toggleLabelTag(tg)" aria-label="Remove tag">
                ✕
              </button>
            </span>
            <span v-if="!labelImport.tagsSelected.length" class="text-xs opacity-60">No tags</span>
          </div>

          <!-- Existing tags to click/toggle -->
          <div class="mt-3 border border-base-300 rounded-lg p-2 max-h-48 overflow-auto">
            <button v-for="tg in labelImportFilteredTags" :key="`opt-${tg}`" type="button" class="badge badge-ghost m-1"
              :class="{
                'badge-primary': labelImport.tagsSelected.some((t) =>
                  eqi(t, tg)
                ),
              }" @click="toggleLabelTag(tg)">
              {{ tg }}
            </button>
            <div v-if="!labelImportFilteredTags.length" class="text-xs opacity-60 p-2">
              No tags yet
            </div>
          </div>
        </div>

        <div class="modal-action">
          <button type="button" class="btn" @click="cancelLabelImport">
            Cancel
          </button>
          <button type="button" class="btn btn-primary" :disabled="!labelImport.label.trim()"
            @click="confirmLabelImport">
            Import
          </button>
        </div>
      </div>
    </dialog>

    <!-- Smart Select Modal -->
    <dialog v-if="openSmartSelect" class="modal modal-open" aria-modal="true" role="dialog"
      aria-labelledby="smartSelectHeading">
      <div class="modal-box w-full max-w-lg">
        <h3 id="smartSelectHeading" class="font-bold text-lg">
          🎯 Smart Select
        </h3>
        <div class="py-2 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div class="form-control">
            <label class="label" for="ssCategory">
              <span class="label-text">Category</span>
            </label>
            <select id="ssCategory" v-model="smartSelect.category" class="select select-bordered select-sm">
              <option value="">Any</option>
              <option v-for="c in categories" :value="c" :key="c">
                {{ c }}
              </option>
            </select>
          </div>

          <div class="form-control">
            <label class="label" for="ssType">
              <span class="label-text">Type</span>
            </label>
            <select id="ssType" v-model="smartSelect.type" class="select select-bordered select-sm">
              <option value="">Any</option>
              <option value="income">💰 Income</option>
              <option value="spending">💸 Spending</option>
            </select>
          </div>

          <div class="form-control">
            <label class="label" for="ssMin">
              <span class="label-text">Min Amount</span>
            </label>
            <input id="ssMin" v-model.number="smartSelect.min" type="number" step="0.01"
              class="input input-bordered input-sm" />
          </div>

          <div class="form-control">
            <label class="label" for="ssMax">
              <span class="label-text">Max Amount</span>
            </label>
            <input id="ssMax" v-model.number="smartSelect.max" type="number" step="0.01"
              class="input input-bordered input-sm" />
          </div>

          <div class="form-control">
            <label class="label" for="ssFrom">
              <span class="label-text">From</span>
            </label>
            <input id="ssFrom" v-model="smartSelect.from" type="date" class="input input-bordered input-sm" />
          </div>

          <div class="form-control">
            <label class="label" for="ssTo">
              <span class="label-text">To</span>
            </label>
            <input id="ssTo" v-model="smartSelect.to" type="date" class="input input-bordered input-sm" />
          </div>

          <div class="form-control md:col-span-2">
            <label class="label" for="ssContains">
              <span class="label-text">Description contains</span>
            </label>
            <input id="ssContains" v-model="smartSelect.contains" type="text" class="input input-bordered input-sm" />
          </div>
        </div>

        <div class="modal-action">
          <button type="button" class="btn btn-primary" @click="applySmartSelect">
            Select
          </button>
          <button type="button" class="btn" @click="openSmartSelect = false">
            Close
          </button>
        </div>
      </div>
    </dialog>

    <!-- Bulk Edit Modal -->
    <dialog v-if="bulkEdit.open" class="modal modal-open" aria-modal="true" role="dialog"
      aria-labelledby="bulkEditHeading">
      <div class="modal-box w-full max-w-lg">
        <h3 id="bulkEditHeading" class="font-bold text-lg">
          🛠️ Bulk Edit ({{ selectedCount }} selected)
        </h3>

        <div class="mt-3 space-y-3">
          <!-- Category change -->
          <div class="form-control">
            <label class="label" for="beCategory">
              <span class="label-text">Set Category</span>
            </label>
            <select id="beCategory" v-model="bulkEdit.category" class="select select-bordered select-sm">
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
              <label class="inline-flex gap-2 items-center cursor-pointer">
                <input type="radio" name="beType" value="" v-model="bulkEdit.type" class="radio radio-xs" />
                <span>(no change)</span>
              </label>
              <label class="inline-flex gap-2 items-center cursor-pointer">
                <input type="radio" name="beType" value="income" v-model="bulkEdit.type" class="radio radio-xs" />
                <span>Income</span>
              </label>
              <label class="inline-flex gap-2 items-center cursor-pointer">
                <input type="radio" name="beType" value="spending" v-model="bulkEdit.type" class="radio radio-xs" />
                <span>Spending</span>
              </label>
            </div>
          </div>

          <!-- Description edit -->
          <div class="form-control">
            <label class="label" for="beDesc">
              <span class="label-text">Description</span>
            </label>
            <div class="join">
              <select v-model="bulkEdit.descMode" class="select select-bordered select-sm join-item"
                aria-label="Description mode">
                <option value="none">(no change)</option>
                <option value="replace">Replace</option>
                <option value="prepend">Prepend</option>
                <option value="append">Append</option>
              </select>
              <input id="beDesc" v-model="bulkEdit.descText" type="text"
                class="input input-bordered input-sm join-item flex-1" placeholder="Text…"
                :disabled="bulkEdit.descMode === 'none'" />
            </div>
          </div>

          <!-- Smart: Find & Replace -->
          <div class="form-control">
            <label class="label" for="beFind">
              <span class="label-text">Find & Replace (case-insensitive)</span>
            </label>
            <div class="join">
              <input id="beFind" v-model="bulkEdit.findText" type="text"
                class="input input-bordered input-sm join-item w-40" placeholder="Find…" />
              <input v-model="bulkEdit.replaceWith" type="text" class="input input-bordered input-sm join-item flex-1"
                placeholder="Replace with…" />
              <label class="label cursor-pointer join-item px-3 gap-2 text-xs">
                <input type="checkbox" class="checkbox checkbox-xs" v-model="bulkEdit.replaceAll" />
                <span>Replace all</span>
              </label>
            </div>
          </div>

          <!-- Smart: Description cleanup -->
          <div class="form-control">
            <span class="label-text mb-1">Description cleanup</span>
            <div class="flex flex-wrap items-center gap-3 text-sm">
              <label class="inline-flex items-center gap-2 cursor-pointer">
                <input type="checkbox" class="checkbox checkbox-xs" v-model="bulkEdit.trimWhitespace" />
                <span>Trim</span>
              </label>
              <label class="inline-flex items-center gap-2 cursor-pointer">
                <input type="checkbox" class="checkbox checkbox-xs" v-model="bulkEdit.collapseSpaces" />
                <span>Collapse spaces</span>
              </label>
              <label class="inline-flex items-center gap-2 cursor-pointer">
                <input type="checkbox" class="checkbox checkbox-xs" v-model="bulkEdit.titleCase" />
                <span>Title Case</span>
              </label>
            </div>
          </div>

          <!-- Smart: Save keyword -> category rule -->
          <div class="form-control">
            <span class="label-text mb-1">Save keyword -> category rule</span>
            <div class="flex items-center gap-2">
              <label class="inline-flex items-center gap-2 cursor-pointer">
                <input type="checkbox" class="checkbox checkbox-xs" v-model="bulkEdit.saveRule" />
                <span class="text-sm">Save rule</span>
              </label>
              <input :disabled="!bulkEdit.saveRule" v-model="bulkEdit.ruleKeyword" type="text"
                class="input input-bordered input-sm flex-1" :placeholder="suggestedKeyword || 'Keyword…'" />
            </div>
            <p class="text-xs mt-1 text-base-content/60">
              Also set <strong>Category</strong> above. Future imports matching
              the keyword are auto-categorized.
            </p>
          </div>

          <!-- Optional: date shift -->
          <div class="form-control">
            <label class="label" for="beShift">
              <span class="label-text">Shift Date (days)</span>
            </label>
            <input id="beShift" v-model.number="bulkEdit.shiftDays" type="number"
              class="input input-bordered input-sm w-32" placeholder="0" />
            <p class="text-xs text-base-content/60 mt-1">
              Positive numbers move dates forward.
            </p>
          </div>
        </div>

        <div class="modal-action">
          <button type="button" class="btn btn-ghost" @click="bulkEdit.open = false">
            Cancel
          </button>
          <button type="button" class="btn btn-primary" :disabled="selectedCount === 0" @click="applyBulkEdit">
            Apply changes
          </button>
        </div>
      </div>
    </dialog>
  </div>
</template>
<script setup lang="ts">
import { Chart, LineController, BarController, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend, PieController, DoughnutController } from 'chart.js';
import {
  ref,
  reactive,
  computed,
  watch,
  onMounted,
  onUnmounted,
  nextTick,
  shallowRef,
} from "vue";

Chart.register(LineController, BarController, PieController, DoughnutController, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend);


// ==== Debug helpers ====
const DEBUG_IMPORT = import.meta.env.MODE === 'development';
const dbg = (...a: any[]) => DEBUG_IMPORT && console.log("[import]", ...a);
const dbgw = (...a: any[]) => DEBUG_IMPORT && console.warn("[import]", ...a);
const dbge = (...a: any[]) => DEBUG_IMPORT && console.error("[import]", ...a);
const dbgg = (label: string) => {
  if (DEBUG_IMPORT) console.group(label);
};
const dbgge = () => {
  if (DEBUG_IMPORT) console.groupEnd();
};

function sample<T>(arr: T[], n = 3): T[] {
  return arr.slice(0, Math.max(0, Math.min(n, arr.length)));
}

// ========= Persistence  Theme boot  cross-tab sync =========
const LS_KEYS = {
  tx: "financial-tracker-transactions",
  cats: "financial-tracker-custom-categories",
  tags: "financial-tracker-tags",
  recent: "financial-tracker-recent-cats",
  catsHidden: "financial-tracker-hidden-categories",
  theme: "financial-tracker-theme",
  tips: "financial-tracker-tips-dismissed",
  view: "financial-tracker-advanced-view",
  dateFormat: "financial-tracker-date-format",
  chartSelection: "financial-tracker-chart-selection",
  recurringDefaults: "financial-tracker-recurring-defaults",
};

const isString = (v: unknown): v is string => typeof v === "string";

function loadPersistedState() {
  const savedView = localStorage.getItem(LS_KEYS.view);
  if (savedView === "true" || savedView === "false") {
    showAdvancedTransactionsView.value = savedView === "true";
  }

  const tipsDismissed =
    (localStorage.getItem(LS_KEYS.tips) || "").trim().toLowerCase() === "true";
  showTips.value = !tipsDismissed;
  // Transactions
  const rawTx = safeLocalStorageGet(LS_KEYS.tx);
  if (Array.isArray(rawTx)) {
    try {
      // Normalize just in case formats changed between versions
      transactions.value = rawTx.map(normalizeTransaction);
    } catch (e) {
      console.warn("Failed to load persisted transactions:", e);
    }
  }

  // Custom categories
  const rawCats = safeLocalStorageGet(LS_KEYS.cats);
  if (Array.isArray(rawCats)) {
    const cats = rawCats.filter(isString);
    customCategories.value = sortAlpha(dedupeCI(cats));
  }

  // Tags
  const rawTags = safeLocalStorageGet(LS_KEYS.tags);
  if (Array.isArray(rawTags)) {
    const tg = rawTags.filter(isString);
    tags.value = sortAlpha(dedupeCI(tg));
  }

  // Recently used categories (used by rememberCategory)
  const recent = safeLocalStorageGet(LS_KEYS.recent);
  if (Array.isArray(recent)) {
    const rc = recent.filter(isString).slice(0, 6);
    recentCategories.value = rc;
  }

  // Last selected category for pre-fill
  const lastCat = safeLocalStorageGet("last-selected-category");
  if (isString(lastCat)) {
    lastSelectedCategory.value = lastCat;
  }

  // Theme
  const savedTheme = (localStorage.getItem(LS_KEYS.theme) || "").trim();
  if (savedTheme) {
    currentTheme.value = savedTheme;
  }
  // Ensure the attribute is applied immediately
  document.documentElement.setAttribute("data-theme", currentTheme.value);

  // If user has data and they're on About/Import by default, land them where it’s useful
  if (transactions.value.length > 0 && activeTab.value === "about") {
    activeTab.value = "transactions";
  }
}

function storageSync(e: StorageEvent) {
  if (!e.key) return;
  // Only respond to our keys
  if (e.key === LS_KEYS.tx) {
    const raw = safeLocalStorageGet(LS_KEYS.tx);
    if (Array.isArray(raw)) {
      transactions.value = raw.map(normalizeTransaction);
    }
  } else if (e.key === LS_KEYS.cats) {
    const raw = safeLocalStorageGet(LS_KEYS.cats);
    if (Array.isArray(raw)) {
      customCategories.value = sortAlpha(dedupeCI(raw.filter(isString)));
    }
  } else if (e.key === LS_KEYS.tags) {
    const raw = safeLocalStorageGet(LS_KEYS.tags);
    if (Array.isArray(raw)) {
      tags.value = sortAlpha(dedupeCI(raw.filter(isString)));
    }
  } else if (e.key === LS_KEYS.recent) {
    const raw = safeLocalStorageGet(LS_KEYS.recent);
    if (Array.isArray(raw)) {
      recentCategories.value = raw.filter(isString).slice(0, 6);
    }
  } else if (e.key === "last-selected-category") {
    const lastCat = safeLocalStorageGet("last-selected-category");
    if (isString(lastCat)) {
      lastSelectedCategory.value = lastCat;
    }
  } else if (e.key === LS_KEYS.theme) {
    const theme = (localStorage.getItem(LS_KEYS.theme) || "").trim();
    if (theme) {
      currentTheme.value = theme;
      document.documentElement.setAttribute("data-theme", theme);
    }
  }
}

onMounted(() => {
  loadPersistedState();
  loadLastRecurringDefaults();
  // In case something else set currentTheme before mount
  document.documentElement.setAttribute("data-theme", currentTheme.value);
  window.addEventListener("storage", storageSync, { passive: true } as any);
});

onUnmounted(() => {
  window.removeEventListener("storage", storageSync);
});

// ========== TYPES ==========
type DateFormatOption = "dd/mm/yyyy" | "mm/dd/yyyy" | "yyyy-mm-dd" | "dd-mmm-yyyy";
const dateFormatOptions: { value: DateFormatOption; label: string; example: string }[] = [
  { value: "dd/mm/yyyy", label: "DD/MM/YYYY", example: "25/12/2024" },
  { value: "mm/dd/yyyy", label: "MM/DD/YYYY", example: "12/25/2024" },
  { value: "yyyy-mm-dd", label: "YYYY-MM-DD", example: "2024-12-25" },
  { value: "dd-mmm-yyyy", label: "DD-Mon-YYYY", example: "25-Dec-2024" },
];

const selectedDateFormat = ref<DateFormatOption>(
  (localStorage.getItem("financial-tracker-date-format") as DateFormatOption) || "dd/mm/yyyy"
);

// Persist on change
watch(selectedDateFormat, (fmt) => {
  localStorage.setItem("financial-tracker-date-format", fmt);
});

// ── The single formatDate function
function formatDate(iso?: string): string {
  if (!iso) return "";

  // Normalise to ISO if it isn't already
  let dateISO = iso;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    const dt = new Date(iso);
    if (isNaN(+dt)) return iso;
    dateISO = toLocalISO(dt);
  }

  const [y, m, d] = dateISO.split("-");
  const day = Number(d);
  const month = Number(m);
  const year = Number(y);

  const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  switch (selectedDateFormat.value) {
    case "dd/mm/yyyy":
      return `${d}/${m}/${y}`;
    case "mm/dd/yyyy":
      return `${m}/${d}/${y}`;
    case "yyyy-mm-dd":
      return dateISO;                          // already ISO
    case "dd-mmm-yyyy":
      return `${d}-${MONTHS_SHORT[month - 1]}-${y}`;
    default:
      return `${d}/${m}/${y}`;
  }
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
  tags: string[];
  recurring?: boolean;
  frequency?: RecurringFrequency;
  recursions?: number;
  description: string;
  endDate?: string;
  source?: string;
}

type ToastKind = "success" | "info" | "warning" | "error";
type DescMode = "none" | "replace" | "prepend" | "append";


const DEFAULT_CATEGORIES = [
  'Salary', 'Freelance', 'Investment Returns', 'Gifts Received', 'Refunds', 'Other Income',
  'Donations', 'Restaurant & Takeaway', 'AfterPay', 'Vehicle Expenses', 'Transport & Parking',
  'Bills & Services', 'BNPL', 'Grocery', 'Investment', 'Transfers', 'Retail Shopping',
  'Flights', 'Gambling', 'Accommodation', 'Attractions & Events', 'Clothing & Personal Life',
  'Education', 'Cafes & Coffees', 'Health & Medical', 'Subscriptions', 'Fitness', 'Hobbies',
  'Home Stuff', 'Fuel', 'Entertainment', 'Travel', 'Fees & Charges', 'Uncategorized',
];


const VIBRANT_COLORS = [
  'rgba(59, 130, 246, 0.7)',   // blue
  'rgba(239, 68, 68, 0.7)',    // red
  'rgba(34, 197, 94, 0.7)',    // green
  'rgba(168, 85, 247, 0.7)',   // purple
  'rgba(249, 115, 22, 0.7)',   // orange
  'rgba(236, 72, 153, 0.7)',   // pink
  'rgba(20, 184, 166, 0.7)',   // teal
  'rgba(234, 179, 8, 0.7)',    // yellow
  'rgba(99, 102, 241, 0.7)',   // indigo
  'rgba(6, 182, 212, 0.7)',    // cyan
  'rgba(244, 63, 94, 0.7)',    // rose
  'rgba(132, 204, 22, 0.7)',   // lime
  'rgba(217, 70, 239, 0.7)',   // fuchsia
  'rgba(251, 146, 60, 0.7)',   // amber
  'rgba(45, 212, 191, 0.7)',   // emerald
  'rgba(156, 163, 175, 0.7)',  // gray
];

const VIBRANT_BORDERS = VIBRANT_COLORS.map(c => c.replace('0.7)', '1)'));

// ── Chart series colors (fixed, readable on any DaisyUI theme) ──
const INCOME_COLOR = { bg: 'rgba(34, 197, 94, 0.6)', border: 'rgba(34, 197, 94, 1)' };
const SPENDING_COLOR = { bg: 'rgba(239, 68, 68, 0.6)', border: 'rgba(239, 68, 68, 1)' };
const BALANCE_COLOR = { bg: 'rgba(59, 130, 246, 0.6)', border: 'rgba(59, 130, 246, 1)' };



// --- Auto-categorisation rules ---
const PRESET_CATEGORY_RULES: Array<{ re: RegExp; category: string }> = [
  // Restaurants & takeaway
  {
    re: /(mcdonald'?s|kfc|subway|domino'?s|hungry\s*jack'?s|nando'?s|oporto|red\s*rooster|grill'?d|mad\s*mex|pizza\s*hut|ubereats|deliveroo|doordash)/i,
    category: "Restaurant & Takeaway",
  },
  // Grocery
  { re: /(woolworths|woolies|coles|aldi|iga|costco)/i, category: "Grocery" },
];

function autoCategoryFor(desc: string): string {
  const d = desc.toLowerCase();
  for (const { re, category } of PRESET_CATEGORY_RULES) {
    if (re.test(d)) return category;
  }
  return ""; // no hit → caller keeps existing/fallback
}

// --- Auto-tagging rules (merchant → tag), optionally scoped by category ---
const PRESET_TAG_RULES: Array<{ re: RegExp; tag: string; category?: string }> =
  [
    // Grocery merchants
    { re: /\baldi\b/i, tag: "aldi", category: "Grocery" },
    { re: /\bcoles\b/i, tag: "coles", category: "Grocery" },
    { re: /\bwoolworths|woolies\b/i, tag: "woolworths", category: "Grocery" },
    { re: /\biga\b/i, tag: "iga", category: "Grocery" },
    { re: /\bcostco\b/i, tag: "costco", category: "Grocery" },
    { re: /\bubereats\b/i, tag: "ubereats", category: "Restaurant & Takeaway" },
    {
      re: /\bdeliveroo\b/i,
      tag: "deliveroo",
      category: "Restaurant & Takeaway",
    },
    { re: /\bdoordash\b/i, tag: "doordash", category: "Restaurant & Takeaway" },
    {
      re: /\bmcdonald'?s\b/i,
      tag: "mcdonalds",
      category: "Restaurant & Takeaway",
    },
    { re: /\bkfc\b/i, tag: "kfc", category: "Restaurant & Takeaway" },
    // Health & Medical
    { re: /(chemist\s*warehouse|pharmacy|chemists?)/i, tag: "chemist", category: "Health & Medical" },
    { re: /(aami|nrma|allianz|bupa|medibank|hbf)/i, tag: "insurance", category: "Insurance" },
  ];

function autoTagsFor(desc: string, category: string): string[] {
  const d = (desc || "").toLowerCase();
  const c = (category || "").toLowerCase();
  const out: string[] = [];
  for (const r of PRESET_TAG_RULES) {
    if (r.category && r.category.toLowerCase() !== c) continue;
    if (r.re.test(d)) out.push(r.tag);
  }
  return sortAlpha(dedupeCI(out));
}

function autoMergeTags(existing: string[], add: string[]): string[] {
  if (!add?.length) return existing || [];
  return sortAlpha(dedupeCI([...(existing || []), ...add]));
}

// ========== DATE UTILITIES ==========
function toLocalISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function todayLocalISO(): string {
  return toLocalISO(new Date());
}

function isoToDDMMYYYY(iso?: string): string {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return "";
  const [y, m, d] = iso.split("-");
  return `${d}-${m}-${y}`;
}

function ddmmyyyyToISO(ddmmyyyy: string): string | "" {
  const m = ddmmyyyy.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (!m) return "";
  const d = Number(m[1]),
    mo = Number(m[2]),
    y = Number(m[3]);
  const dt = new Date(y, mo - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d)
    return "";
  return toLocalISO(dt);
}


function formatDDMMProgressive(raw: string): string {
  const digits = raw.replace(/[^\d]/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
  return `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4)}`;
}

function finalizeDDMM(raw: string): string | "" {
  const m = raw.match(/^(\d{1,2})-(\d{1,2})-(\d{2,4})$/);
  if (!m) return "";
  const d = String(Math.min(31, Number(m[1]))).padStart(2, "0");
  const mo = String(Math.min(12, Number(m[2]))).padStart(2, "0");
  let y = m[3];
  if (y.length === 2) y = String(2000 + Number(y));
  const iso = ddmmyyyyToISO(`${d}-${mo}-${y}`);
  return iso ? `${d}-${mo}-${y}` : "";
}

function parseDateGuess(s: string | undefined | null): string {
  if (!s) return "";
  const t = String(s).trim();

  // ISO date with optional time ("YYYY-MM-DD" or "YYYY-MM-DD HH:mm:ss" or "YYYY-MM-DDTHH:mm:ss")
  const mISO = t.match(/^(\d{4}-\d{2}-\d{2})(?:[ T].*)?$/);
  if (mISO) return mISO[1]; // keep only the date part

  // dd/mm/yyyy or dd-mm-yyyy (optionally with time)
  let m = t.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})(?:[ T].*)?$/);
  if (m) {
    const d = String(m[1]).padStart(2, "0");
    const mo = String(m[2]).padStart(2, "0");
    let y = m[3];
    if (y.length === 2) y = String(2000 + Number(y));
    const iso = ddmmyyyyToISO(`${d}-${mo}-${y}`);
    if (iso) return iso;
  }

  // Last-chance parse: normalize space → 'T'
  const dt = new Date(t.replace(" ", "T"));
  return isNaN(+dt) ? "" : toLocalISO(dt);
}

// ========= CSV parsing  bank column inference =========

function parseCSV(text: string): string[][] {
  // Strip BOM & normalise newlines
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  text = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  const rows: string[][] = [];
  let cur = "";
  let inQuotes = false;
  let row: string[] = [];

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (inQuotes && text[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      row.push(cur);
      cur = "";
    } else if (ch === "\n" && !inQuotes) {
      row.push(cur);
      rows.push(row);
      row = [];
      cur = "";
    } else {
      cur += ch;
    }
  }
  // Flush last field/row
  row.push(cur);
  if (row.length && row.some((c) => c.trim().length)) rows.push(row);

  // Trim cells
  return rows.map((r) => r.map((c) => c.trim()));
}

function toggleLabelTag(tag: string) {
  const idx = labelImport.tagsSelected.findIndex((t) => eqi(t, tag));
  if (idx >= 0) labelImport.tagsSelected.splice(idx, 1);
  else labelImport.tagsSelected.push(tag);
  labelImport.tagsSelected = sortAlpha(dedupeCI(labelImport.tagsSelected));
}

function addLabelTagFromQuery() {
  const name = labelImport.tagsQuery.trim();
  if (!name) return;
  if (!existsTag(name)) {
    tags.value = sortAlpha(dedupeCI([...tags.value, name]));
    safeLocalStorageSet(LS_KEYS.tags, tags.value);
  }
  // toggle canonical
  const canonical = tags.value.find((t) => eqi(t, name)) || name;
  toggleLabelTag(canonical);
  labelImport.tagsQuery = "";
}

// Header helpers
function findIndexByKeywords(headers: string[], kws: string[]): number {
  const lower = headers.map((h) => h.toLowerCase());
  for (const kw of kws) {
    const idx = lower.findIndex((h) => h.includes(kw));
    if (idx !== -1) return idx;
  }
  return -1;
}

function endOfMonthISO(y: number, m1to12: number) {
  return toLocalISO(new Date(y, m1to12, 0));
}
function toISOorEmpty(s: string) {
  const iso = parseDateGuess(s);
  return /^\d{4}-\d{2}-\d{2}$/.test(iso) ? iso : "";
}
type ParsedQuery = {
  text: string[]; // plain includes
  not: string[]; // plain excludes  (e.g. -starbucks)
  type?: "" | TransactionType;
  category?: string | "";
  tagsInclude: string[];
  tagsExclude: string[];
  source?: string | "";
  min?: number;
  max?: number;
  start?: string; // ISO
  end?: string; // ISO
  amount?: number; // exact match (from amount:50 or $50)
};

function parseSmartQuery(raw: string): ParsedQuery {
  const out: ParsedQuery = {
    text: [],
    not: [],
    tagsInclude: [],
    tagsExclude: [],
  };
  const tokens = (raw.match(/"[^"]+"|\S+/g) || []).map((t) =>
    t.replace(/^"|"$/g, "")
  );
  for (const t0 of tokens) {
    const t = t0.trim();
    const low = t.toLowerCase();

    // amount:50 or $50 exact match
    if (/^\$?\d+(\.\d+)?$/.test(low)) {
      const numStr = low.startsWith("$") ? low.slice(1) : low;
      if (/^\d+(\.\d+)?$/.test(numStr)) {
        out.amount = Number(numStr);
        continue;
      }
    }

    // amount comparators
    if (/^[<>]=?\d+(\.\d+)?$/.test(low)) {
      const m = low.match(/^([<>]=?)(\d+(\.\d+)?)$/)!;
      const op = m[1];
      const val = Number(m[2]);
      if (op === ">" || op === ">=")
        out.min = Math.max(
          out.min ?? -Infinity,
          val + (op === ">" ? 1e-12 : 0)
        );
      else if (op === "<" || op === "<=")
        out.max = Math.min(out.max ?? Infinity, val - (op === "<" ? 1e-12 : 0));
      continue;
    }

    // type:
    if (low.startsWith("type:")) {
      const v = low.slice(5);
      if (v === "income" || v === "spending") out.type = v;
      continue;
    }
    // category:
    if (low.startsWith("cat:")) {
      out.category = t.slice(4);
      continue;
    }
    // source:
    if (low.startsWith("src:")) {
      out.source = t.slice(4);
      continue;
    }
    // tags: "#work" (include) / "-#work" (exclude)
    if (low.startsWith("-#")) {
      out.tagsExclude.push(t.slice(2));
      continue;
    }
    if (low.startsWith("#")) {
      out.tagsInclude.push(t.slice(1));
      continue;
    }

    // last:30d
    if (low.startsWith("last:") && /last:\d+d/.test(low)) {
      const days = Number(low.match(/last:(\d+)d/)![1]);
      const end = todayLocalISO();
      const d = new Date(end);
      d.setDate(d.getDate() - (days - 1));
      out.start = toLocalISO(d);
      out.end = end;
      continue;
    }
    // since:YYYY-MM[-DD]
    if (low.startsWith("since:")) {
      const dt = toISOorEmpty(low.slice(6));
      if (dt) out.start = dt;
      continue;
    }
    // date:YYYY-MM..YYYY-MM or YYYY-MM-DD..YYYY-MM-DD
    if (low.startsWith("date:") && low.includes("..")) {
      const [a, b] = low.slice(5).split("..");
      if (/^\d{4}-\d{2}$/.test(a)) {
        const [ya, ma] = a.split("-").map(Number);
        out.start = `${ya}-${String(ma).padStart(2, "0")}-01`;
      } else out.start = toISOorEmpty(a);

      if (/^\d{4}-\d{2}$/.test(b)) {
        const [yb, mb] = b.split("-").map(Number);
        out.end = endOfMonthISO(yb, mb);
      } else out.end = toISOorEmpty(b);
      continue;
    }

    // negatives
    if (low.startsWith("-")) {
      out.not.push(low.slice(1));
      continue;
    }
    // plain include
    out.text.push(low);
  }
  return out;
}

function txMatches(t: Transaction, f: ParsedQuery): boolean {
  const hay = `${t.description} ${t.category} ${t.source || ""}`.toLowerCase();
  if (f.text.length && !f.text.every((q) => hay.includes(q))) return false;
  if (f.not.length && f.not.some((q) => hay.includes(q))) return false;

  if (f.type && t.type !== f.type) return false;
  if (f.category && !eqi(t.category, f.category)) return false;
  if (
    f.source &&
    !(t.source && t.source.toLowerCase().includes(f.source.toLowerCase()))
  )
    return false;

  // exact amount match
  if (f.amount != null && Math.abs(t.amount - f.amount) > 1e-9) return false;

  // range match
  if (f.min != null && !(t.amount >= f.min)) return false;
  if (f.max != null && !(t.amount <= f.max)) return false;

  if (
    f.tagsInclude.length &&
    !f.tagsInclude.every((tag) => t.tags.some((tt) => eqi(tt, tag)))
  )
    return false;
  if (
    f.tagsExclude.length &&
    f.tagsExclude.some((tag) => t.tags.some((tt) => eqi(tt, tag)))
  )
    return false;

  if (f.start && t.date < f.start) return false;
  if (f.end && t.date > f.end) return false;

  return true;
}

type ImportJob = {
  file: File;
  rows: Transaction[];
  filename: string;
};

const importQueue = ref<ImportJob[]>([]);
let importingNow = false;

function startOfISOWeek(d: Date): Date {
  const day = d.getDay(); // 0=Sun..6=Sat
  const diff = (day === 0 ? -6 : 1) - day; // Monday as week start
  const dt = new Date(d);
  dt.setDate(d.getDate() + diff);
  dt.setHours(0, 0, 0, 0);
  return dt;
}
function startOfFortnight(d: Date): Date {
  const w = startOfISOWeek(d);
  // group pairs of ISO weeks: even=0, odd=1 based on week number-ish
  const anchor = new Date(w);
  const dayOfYear = Math.floor(
    (+anchor - +new Date(anchor.getFullYear(), 0, 1)) / 86400000
  );
  const fortnightShift = Math.floor(dayOfYear / 7) % 2 ? -7 : 0;
  anchor.setDate(anchor.getDate() + fortnightShift);
  return anchor;
}
function startOfQuarter(d: Date): Date {
  const q = Math.floor(d.getMonth() / 3) * 3;
  return new Date(d.getFullYear(), q, 1);
}
function bucketKeyByGroup(
  iso: string,
  group: typeof chartConfig.value.groupBy
): string {
  const d = new Date(iso + "T00:00:00");
  let k: Date;
  switch (group) {
    case "daily":
      k = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      break;
    case "weekly":
      k = startOfISOWeek(d);
      break;
    case "fortnightly":
      k = startOfFortnight(d);
      break;
    case "monthly":
      k = new Date(d.getFullYear(), d.getMonth(), 1);
      break;
    case "quarterly":
      k = startOfQuarter(d);
      break;
    case "yearly":
      k = new Date(d.getFullYear(), 0, 1);
      break;
    default:
      k = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }
  return toLocalISO(k);
}

//Amount parsing that handles $, commas, parentheses, DR/CR, trailing minus
function parseAmountNumber(
  raw: string | undefined,
  indicator?: string | undefined
): number {
  if (!raw) return 0;
  let s = String(raw).trim();
  let sign = 1;

  // Direction / DR-CR overrides
  if (indicator) {
    const d = indicator.toLowerCase();
    if (/\bout\b/.test(d)) sign = -1; // OUT → negative
    else if (/\bin\b/.test(d)) sign = 1; // IN  → positive
    else if (/\bdr\b|\bdebit\b/.test(d)) sign = -1;
    else if (/\bcr\b|\bcredit\b/.test(d)) sign = 1;
  }

  // Parentheses mean negative
  if (/^\(.*\)$/.test(s)) {
    sign = -1;
    s = s.slice(1, -1);
  }

  // Trailing minus like "123.45-"
  if (/^-?[\d.,]+-$/.test(s)) {
    sign = -1;
    s = s.slice(0, -1);
  }

  // Strip currency symbols, spaces, and commas
  s = s.replace(/[^\d.-]/g, "").replace(/,/g, "");
  if (/^\d{1,3}(\.\d{3})+,\d{2}$/.test(s)) {
    s = s.replace(/\./g, "").replace(",", ".");
  }
  const n = Number(s);
  if (!isFinite(n)) {
    dbgw("Amount parse failed → treating as 0", { raw, indicator, cleaned: s });
    return 0;
  }

  const out = sign * n;
  dbg("parsed amount", { raw, indicator, cleaned: s, sign, out });
  return out;
}


type InferredCols = {
  date: number;
  amount?: number;

  // Split amount style (CommBank, NAB, some Westpac exports)
  debit?: number;
  credit?: number;

  // Direction / DR-CR / IN-OUT indicator (Wise Desktop has "Direction")
  drcr?: number;

  // Preferred description columns (ordered by priority)
  desc: number[];

  // Generic currency column (if any)
  currency?: number;

  // Wise Desktop flattened source/target columns
  srcAmt?: number;
  srcCur?: number;
  tgtAmt?: number;
  tgtCur?: number;

  // Sheet detection via ID headers
  desktopId?: number;   // header "ID" (Wise Desktop)
  mobileId?: number;    // header "TransferWise ID" (Wise Mobile)

  // Amount convention detected after scanning rows
  // "normal"           → positive = income, negative = spending
  // "expensesPositive" → positive = spending (some bank exports)
  amountConvention?: "normal" | "expensesPositive";
};


// type InferredCols = {
//   date: number;



//   // split amount style (rare in your case but keep support)
//   debit?: number;
//   credit?: number;

//   // direction / DR-CR / IN-OUT indicator (desktop has "Direction")
//   drcr?: number;

//   // preferred description columns (ordered)
//   desc: number[];

//   // generic currency (if any)
//   currency?: number;

//   // flattened source/target amount & currency columns
//   // (used by “desktop” files that have separate Source/Target fields)
//   srcAmt?: number;
//   srcCur?: number;
//   tgtAmt?: number;
//   tgtCur?: number;

//   // sheet detection via ID headers (no brand names in identifiers)
//   desktopId?: number; // header "ID"
//   mobileId?: number; // header "TransferWise ID"
// };



// function inferColumns(headers: string[]): InferredCols {
//   dbg("Headers:", headers);
//   const has = (kws: string[]) => findIndexByKeywords(headers, kws);

//   // Essential columns
//   const date = has(["date", "created on"]);
//   const amount = has(["amount", "source amount (after fees)"]);

//   // Wise format detection
//   const isWiseMobile = has(["transferwise id"]) !== -1;
//   const isWiseDesktop = has(["id"]) !== -1 && has(["direction"]) !== -1;

//   if (date === -1) throw new Error("Could not find Date column in CSV.");

//   // Wise Mobile - include all possible description sources
//   if (isWiseMobile) {
//     return {
//       date,
//       amount,
//       desc: [
//         has(["merchant"]),
//         has(["payer name"]),
//         has(["description"])
//       ].filter(i => i !== -1), // Only include columns that exist
//       mobileId: has(["transferwise id"]),
//     };
//   }

//   // Wise Desktop
//   if (isWiseDesktop) {
//     return {
//       date: has(["created on"]),
//       drcr: has(["direction"]),
//       desc: [has(["target name"])],
//       srcAmt: has(["source amount (after fees)"]),
//       srcCur: has(["source currency"]),
//       desktopId: has(["id"]),
//     };
//   }

//   // Fallback
//   return { date, amount, desc: [has(["description"])] };
// }


function inferColumns(headers: string[]): InferredCols {
  dbg("Headers:", headers);
  const has = (kws: string[]) => findIndexByKeywords(headers, kws);

  // ── Essential column detection (covers ANZ, Westpac, NAB, CommBank, St.George, ING, Macquarie, Up, UBank) ──
  const date = has([
    "date", "transaction date", "posted date", "settled date",
    "date and time", "created on",
  ]);

  const amount = has([
    "amount", "amount aud", "total aud", "value",
    "total (aud)", "total",
  ]);

  const debit = has(["debit amount", "debit", "withdrawal"]);
  const credit = has(["credit amount", "credit", "deposit"]);

  const desc = [
    has(["transaction description", "description", "details",
      "narrative", "merchant", "transaction details", "payee"]),
  ].filter(i => i !== -1);

  // ── Wise format detection ──
  const isWiseMobile = has(["transferwise id"]) !== -1;
  const isWiseDesktop = has(["id"]) !== -1 && has(["direction"]) !== -1;

  if (date === -1) throw new Error("Could not find Date column in CSV.");

  // Wise Mobile
  if (isWiseMobile) {
    return {
      date,
      amount,
      desc: [
        has(["merchant"]),
        has(["payer name"]),
        has(["description"]),
      ].filter(i => i !== -1),
      mobileId: has(["transferwise id"]),
    };
  }

  // Wise Desktop
  if (isWiseDesktop) {
    return {
      date: has(["created on"]),
      drcr: has(["direction"]),
      desc: [has(["target name"])],
      srcAmt: has(["source amount (after fees)"]),
      srcCur: has(["source currency"]),
      desktopId: has(["id"]),
    };
  }

  // ── Generic Australian bank format ──
  // If both debit AND credit columns exist, prefer split-column mode
  const haveSplit = debit !== -1 && credit !== -1;

  return {
    date,
    amount: haveSplit ? undefined : amount,  // ignore single amount when split exists
    debit: haveSplit ? debit : undefined,
    credit: haveSplit ? credit : undefined,
    desc: desc.length ? desc : [2], // fallback: column index 2
  };
}


function scanAmountConvention(
  dataRows: string[][],
  amtColIndex: number,
  maxScan = 200
): "normal" | "expensesPositive" {
  let pos = 0;
  let neg = 0;

  const rows = dataRows.slice(0, maxScan);
  for (const cols of rows) {
    const v = parseAmountNumber(cols[amtColIndex]);
    if (v > 0) pos++;
    else if (v < 0) neg++;
  }

  // If ALL amounts are positive (or vastly more positive than negative),
  // the bank exports expenses as positive numbers
  if (pos > 0 && neg === 0) return "expensesPositive";
  if (pos > neg * 10) return "expensesPositive";

  return "normal";
}


function rowToTransaction(
  row: string[],
  cols: InferredCols,
  source: string
): Transaction | null {
  const dateISO = parseDateGuess(row[cols.date]);
  if (!dateISO) return null;

  let signed = 0;
  let description = "";

  // ── Path A: Wise Mobile ──
  if (cols.mobileId != null) {
    signed = parseAmountNumber(row[cols.amount!]);
    description = cols.desc.map(i => (row[i] || "").trim()).find(Boolean) || "Wise Transaction";
  }
  // ── Path B: Wise Desktop ──
  else if (cols.desktopId != null) {
    if ((row[cols.srcCur!] || "").toUpperCase() !== "AUD") return null;
    signed = parseAmountNumber(row[cols.srcAmt!], row[cols.drcr!]);
    description = (row[cols.desc[0]] || "").trim() || "Wise Transfer";
  }
  // ── Path C: Split debit/credit columns (CommBank, NAB, some Westpac) ──
  else if (cols.debit != null && cols.credit != null) {
    const d = parseAmountNumber(row[cols.debit] ?? "");
    const c = parseAmountNumber(row[cols.credit] ?? "");

    if (Math.abs(d) < 1e-9 && Math.abs(c) < 1e-9) return null;

    if (Math.abs(d) >= Math.abs(c)) {
      signed = -Math.abs(d || -c);  // debit → negative (spending)
    } else {
      signed = Math.abs(c || -d);   // credit → positive (income)
    }

    // Description from first available desc column
    description = cols.desc.map(i => (row[i] || "").trim()).find(Boolean) || "";
  }
  // ── Path D: Single amount column (ANZ, Westpac, ING, Macquarie, Up, UBank, St.George) ──
  else if (cols.amount != null) {
    const raw = parseAmountNumber(row[cols.amount]);
    if (Math.abs(raw) < 1e-9) return null;

    const convention = cols.amountConvention || "normal";

    if (convention === "expensesPositive") {
      // Positive = spending, negative = income
      signed = raw >= 0 ? -raw : Math.abs(raw);
    } else {
      // Normal: positive = income, negative = spending
      signed = raw;
    }

    // Description from first available desc column
    description = cols.desc.map(i => (row[i] || "").trim()).find(Boolean) || "";
  }
  // ── No valid amount path ──
  else {
    dbgw("Row skipped — no amount column matched", { row });
    return null;
  }

  if (signed === 0) return null;

  const type: TransactionType = signed < 0 ? "spending" : "income";
  const amount = Math.abs(signed);
  const cleanDesc = norm(description) || "Transaction";

  // Auto-categorize and auto-tag
  const category = autoCategoryFor(cleanDesc) || "Uncategorized";
  const autoTags = autoTagsFor(cleanDesc, category);

  return {
    id: `import-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    date: dateISO,
    type,
    amount: Number(amount.toFixed(2)),
    category,
    tags: autoTags,
    description: cleanDesc,
    source: cols.mobileId
      ? "Wise Mobile"
      : cols.desktopId
        ? "Wise Desktop"
        : source,
  };
}

// function rowToTransaction(
//   row: string[],
//   cols: InferredCols,
//   source: string
// ): Transaction | null {
//   const dateISO = parseDateGuess(row[cols.date]);
//   if (!dateISO) return null;

//   let signed = 0;
//   let description = "";

//   // Wise Mobile - get first non-empty from merchant → payer name → description
//   if (cols.mobileId != null) {
//     signed = parseAmountNumber(row[cols.amount!]);
//     description = cols.desc.map(i => (row[i] || "").trim()).find(Boolean) || "Wise Transaction";
//   }
//   // Wise Desktop
//   else if (cols.desktopId != null) {
//     if ((row[cols.srcCur!] || "").toUpperCase() !== "AUD") return null;
//     signed = parseAmountNumber(row[cols.srcAmt!], row[cols.drcr]);
//     description = (row[cols.desc[0]] || "").trim() || "Wise Transfer";
//   }
//   // Other banks
//   else {
//     // ... your existing fallback
//   }

//   if (signed === 0) return null;

//   return {
//     id: `import-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
//     date: dateISO,
//     type: signed < 0 ? "spending" : "income",
//     amount: Math.abs(signed),
//     category: autoCategoryFor(description) || "Uncategorized",
//     tags: autoTagsFor(description, description),
//     description: norm(description),
//     source: cols.mobileId ? `Wise Mobile` : cols.desktopId ? `Wise Desktop` : source,
//   };
// }


// Duplicate detection key (ignore id differences, normalise description)
function stableKey(
  tx: Pick<Transaction, "date" | "type" | "amount" | "description">
): string {
  return `${tx.date}|${tx.type}|${tx.amount.toFixed(2)}|${normDesc(
    tx.description
  )}`;
}

// ========== STORAGE UTILITIES ==========
function safeLocalStorageGet(key: string): any {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (e) {
    console.warn(`Failed to read from localStorage key "${key}":`, e);
    return null;
  }
}

function safeLocalStorageSet(key: string, value: any): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Failed to write to localStorage key "${key}":`, e);
  }
}

// ========== UTILITY FUNCTIONS ==========
const norm = (s: string) => s.trim().replace(/\s+/g, " ").toLowerCase();
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

function highlight(text: string, q: string) {
  const esc = (s: string) =>
    s.replace(
      /[&<>"']/g,
      (ch) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[ch]!)
    );
  const needle = (q || "").trim();
  if (!needle) return esc(text);
  const re = new RegExp(
    `(${needle.replace(/[.*?^${}()|[\]\\]/g, "\\$&")})`,
    "ig"
  );
  return esc(text).replace(re, "<mark>$1</mark>");
}

// ========== REACTIVE STATE ==========
// refs for UI
const categorySearchRef = ref<HTMLInputElement | null>(null);
const tagsSearchRef = ref<HTMLInputElement | null>(null);
const managerSearchRef = ref<HTMLInputElement | null>(null);
const managerAddRef = ref<HTMLInputElement | null>(null);
const renameInputRef = ref<HTMLInputElement | null>(null);
const deleteConfirmRef = ref<HTMLDialogElement | null>(null);
const deleteTarget = ref<string>("");

// category dropdown handlers
function onCategoryToggle(e: Event) {
  const el = e.target as HTMLDetailsElement;
  categoryOpen.value = !!el?.open;
  if (categoryOpen.value) {
    nextTick(() => categorySearchRef.value?.focus());
  }
}

function closeCategoryDropdown() {
  const el = categoryDropdownRef.value;
  if (el?.hasAttribute("open")) el.removeAttribute("open");
  categoryOpen.value = false;
  categoryQuery.value = "";
}

function selectCategory(cat: string) {
  currentCategory.value = cat;
  closeCategoryDropdown();
}

function clearCategory() {
  currentCategory.value = "";
}

function onCategoryEnter() {
  const q = categoryQuery.value.trim();
  if (!q) return;

  const exact = filteredCategories.value.find((c) => eqi(c, q));
  if (exact) {
    selectCategory(exact);
    return;
  }

  // Handle case where category exists but is hidden/filtered
  if (existsCategory(q)) {
    pushToast("Category is currently hidden. Please unhide it first.", "info");
    return;
  }

  createCategoryAndSelect(q);
}

function createCategoryAndSelect(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return;

  // Capitalize first letter of each word
  const capitalized = trimmed.replace(/\b\w/g, (c) => c.toUpperCase());

  if (!existsCategory(capitalized)) {
    customCategories.value = sortAlpha(
      dedupeCI([...customCategories.value, capitalized])
    );
    safeLocalStorageSet(LS_KEYS.cats, customCategories.value);
  }

  // Find canonical form and select
  const canonical = allCategories.value.find((c) => eqi(c, capitalized)) || capitalized;
  currentCategory.value = canonical;
  closeCategoryDropdown();
  pushToast(`Category "${canonical}" added`, "success");
}

//  tags dropdown handlers
function onTagsToggle(e: Event) {
  const el = e.target as HTMLDetailsElement;
  tagsOpen.value = !!el?.open;
  if (tagsOpen.value) {
    nextTick(() => tagsSearchRef.value?.focus());
  }
}

function closeTagsDropdown() {
  const el = tagsDropdownRef.value;
  if (el?.hasAttribute("open")) el.removeAttribute("open");
  tagsOpen.value = false;
  tagsQuery.value = "";
}

function toggleTag(tag: string) {
  const current = [...selectedTags.value];
  const idx = current.findIndex((t) => eqi(t, tag));

  if (idx >= 0) {
    current.splice(idx, 1);
  } else {
    current.push(tag);
  }

  selectedTags.value = sortAlpha(dedupeCI(current));
}

function clearTags() {
  selectedTags.value = [];
}

function onTagsEnter() {
  const q = tagsQuery.value.trim();
  if (!q) return;

  // If exact match exists, toggle it
  const exact = filteredTags.value.find((t) => eqi(t, q));
  if (exact) {
    toggleTag(exact);
    tagsQuery.value = "";
    return;
  }

  // Otherwise create and toggle
  if (!existsTag(q)) {
    createTagAndToggle(q);
  }
}

function createTagAndToggle(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return;

  if (!existsTag(trimmed)) {
    tags.value = sortAlpha(dedupeCI([...tags.value, trimmed]));
    safeLocalStorageSet(LS_KEYS.tags, tags.value);
  }

  // Find canonical form and toggle
  const canonical = tags.value.find((t) => eqi(t, trimmed)) || trimmed;
  toggleTag(canonical);
  tagsQuery.value = "";
  pushToast(`Tag "${canonical}" added`, "success");
}

function existsTag(name: string) {
  const n = norm(name);
  return tags.value.some((t) => norm(t) === n);
}

//  manager modal handlers
function openManager(kind: ManagerType) {
  managerType.value = kind;
  managerSearch.value = "";
  managerNewName.value = "";
  renameTarget.value = null;
  renameValue.value = "";

  nextTick(() => {
    managerRef.value?.showModal?.();
    // Focus the add input for quick workflow
    managerAddRef.value?.focus();
  });
}

function closeManager() {
  managerRef.value?.close?.();
  managerSearch.value = "";
  managerNewName.value = "";
  renameTarget.value = null;
  renameValue.value = "";
}

function managerAdd() {
  const n = managerNewName.value.trim();
  if (!n) return;

  const listRef = getListRef();

  if (!existsInManager(n)) {
    listRef.value = sortAlpha(dedupeCI([...listRef.value, n]));
    safeLocalStorageSet(
      managerType.value === "category" ? LS_KEYS.cats : LS_KEYS.tags,
      listRef.value
    );
    pushToast(
      `${managerType.value === "category" ? "Category" : "Tag"} "${n}" added`,
      "success"
    );
  } else {
    pushToast(
      `${managerType.value === "category" ? "Category" : "Tag"} already exists`,
      "info"
    );
  }

  managerNewName.value = "";
  managerAddRef.value?.focus();
}

function startRename(name: string) {
  renameTarget.value = name;
  renameValue.value = name;
  nextTick(() => {
    renameInputRef.value?.focus();
    renameInputRef.value?.select();
  });
}

function confirmRename() {
  const oldName = renameTarget.value;
  const newName = renameValue.value.trim();
  if (!oldName || !newName || eqi(oldName, newName)) return;

  // Count affected transactions before renaming
  let affectedCount = 0;
  if (managerType.value === "category") {
    affectedCount = transactions.value.filter((t) => eqi(t.category, oldName)).length;
  } else {
    affectedCount = transactions.value.filter((t) =>
      t.tags.some((tt) => eqi(tt, oldName))
    ).length;
  }

  updateCount.value = affectedCount;

  // Show confirmation dialog if there are affected transactions
  if (affectedCount > 0) {
    renameConfirmRef.value?.showModal?.();
  } else {
    // No affected transactions, proceed directly
    applyRename(oldName, newName);
  }
}

function confirmRenameApply() {
  const oldName = renameTarget.value;
  const newName = renameValue.value.trim();
  if (oldName && newName) {
    applyRename(oldName, newName);
  }
  renameConfirmRef.value?.close?.();
}

function cancelRename() {
  renameTarget.value = null;
  renameValue.value = "";
  renameConfirmRef.value?.close?.();
}

// Apply category/tag rename to transactions
function applyRename(oldName: string, newName: string) {
  if (managerType.value === "category") {
    // Update current selection if needed
    if (eqi(currentCategory.value || "", oldName)) {
      currentCategory.value = newName;
    }
    // Update all transactions with this category
    transactions.value = transactions.value.map((t) =>
      eqi(t.category, oldName) ? { ...t, category: newName } : t
    );

    // Ensure newName is in custom list
    if (!existsInManager(newName)) {
      customCategories.value = sortAlpha(
        dedupeCI([...customCategories.value, newName])
      );
    }
    // Remove oldName from custom list if it existed there
    customCategories.value = customCategories.value.filter(
      (x) => !eqi(x, oldName)
    );

    // Hide old default category if needed
    if (isDefaultCategory(oldName) && !isHiddenCategory(oldName)) {
      hiddenCategories.value = sortAlpha(
        dedupeCI([...hiddenCategories.value, oldName])
      );
      safeLocalStorageSet(LS_KEYS.catsHidden, hiddenCategories.value);
    }

    pushToast(
      `Renamed category "${oldName}" → "${newName}" (${updateCount.value} transaction${updateCount.value === 1 ? "" : "s"} updated)`,
      "success"
    );
  } else {
    // Update selected tags if needed
    selectedTags.value = selectedTags.value.map((t) =>
      eqi(t, oldName) ? newName : t
    );
    // Update all transactions with this tag
    transactions.value = transactions.value.map((t) => ({
      ...t,
      tags: t.tags.map((tt) => (eqi(tt, oldName) ? newName : tt)),
    }));

    const listRef = getListRef();
    const idx = listRef.value.findIndex((x) => eqi(x, oldName));
    if (idx >= 0) listRef.value[idx] = newName;

    pushToast(
      `Renamed tag "${oldName}" → "${newName}" (${updateCount.value} transaction${updateCount.value === 1 ? "" : "s"} updated)`,
      "success"
    );
  }

  // Persist lists
  safeLocalStorageSet(LS_KEYS.cats, customCategories.value);
  safeLocalStorageSet(LS_KEYS.tags, tags.value);

  cancelRename();
}

function cancelDelete() {
  deleteConfirmRef.value?.close?.();
  deleteTarget.value = "";
}

function executeDelete() {
  if (!deleteTarget.value) return;
  const name = deleteTarget.value;

  if (managerType.value === "category") {
    // If it exists in custom list, remove it; otherwise mark default/discovered as hidden.
    const wasCustom = customCategories.value.some((x) => eqi(x, name));
    if (wasCustom) {
      customCategories.value = customCategories.value.filter(
        (x) => !eqi(x, name)
      );
      safeLocalStorageSet(LS_KEYS.cats, customCategories.value);
    } else if (!isHiddenCategory(name)) {
      hiddenCategories.value = sortAlpha(
        dedupeCI([...hiddenCategories.value, name])
      );
      safeLocalStorageSet(LS_KEYS.catsHidden, hiddenCategories.value);
    }

    // Clear from current selection if needed
    if (eqi(currentCategory.value || "", name)) currentCategory.value = "";

    // Reassign existing transactions to a safe default
    transactions.value = transactions.value.map((t) =>
      eqi(t.category, name) ? { ...t, category: "Uncategorized" } : t
    );

    pushToast(`Deleted category "${name}"`, "success");
  } else {
    // Tag delete unchanged
    const listRef = getListRef();
    listRef.value = listRef.value.filter((x) => !eqi(x, name));
    selectedTags.value = selectedTags.value.filter((t) => !eqi(t, name));
    transactions.value = transactions.value.map((t) => ({
      ...t,
      tags: t.tags.filter((tt) => !eqi(tt, name)),
    }));
    safeLocalStorageSet(LS_KEYS.tags, tags.value);
    pushToast(`Deleted tag "${name}"`, "success");
  }

  cancelDelete();
}

function restoreCategory(name: string) {
  hiddenCategories.value = hiddenCategories.value.filter((c) => !eqi(c, name));
  safeLocalStorageSet(LS_KEYS.catsHidden, hiddenCategories.value);
  pushToast(`Restored category "${name}"`, "success");
}

// Usage count helper
function getCategoryUsageCount(name: string): number {
  if (managerType.value === "category") {
    return transactions.value.filter((t) => eqi(t.category, name)).length;
  } else {
    return transactions.value.filter((t) =>
      t.tags.some((tag) => eqi(tag, name))
    ).length;
  }
}

// Computed for all categories (includes defaults  custom)
const allCategories = computed(() => {
  const set = new Set<string>();
  categoryNames.forEach((c) => set.add(c));
  customCategories.value.forEach((c) => set.add(c));
  transactions.value.forEach((t) => set.add(t.category));
  return Array.from(set)
    .filter((c) => !isHiddenCategory(c)) // 👈 hide deleted/hidden defaults
    .sort((a, b) => a.localeCompare(b));
});

// Core data
const transactions = ref<Transaction[]>([]);
const DEFAULT_SOURCE = "Unlabeled";

// UI state
const activeTab = ref<"import" | "add" | "chart" | "transactions" | "about">(
  "about"
);
const showTour = ref(false);
const onboardingStep = ref(0);
const showTips = ref(true);
const dismissTips = () => {
  showTips.value = false;
  localStorage.setItem(LS_KEYS.tips, "true");
};
const currentTheme = ref("cupcake");
const version = ref("v3.5");

// Transaction form
const newTransaction = reactive<Transaction>({
  id: '',
  date: '',
  type: 'spending',
  amount: 0,
  category: '',
  tags: [],
  description: '',
  recurring: false,
  frequency: 'monthly',
  recursions: 1,
  endDate: '',
  source: '',
});

// Load last recurring defaults from localStorage
const loadLastRecurringDefaults = () => {
  try {
    const raw = safeLocalStorageGet(LS_KEYS.recurringDefaults);
    if (raw && typeof raw === 'object') {
      if (typeof raw.recurring === 'boolean') newTransaction.recurring = raw.recurring;
      if (raw.frequency) newTransaction.frequency = raw.frequency;
      if (typeof raw.recursions === 'number') newTransaction.recursions = raw.recursions;
    }
  } catch (e) {
    console.warn('Failed to load recurring defaults:', e);
  }
};

// Save recurring defaults to localStorage whenever they change
watch(
  [() => newTransaction.recurring, () => newTransaction.frequency, () => newTransaction.recursions],
  ([recurring, frequency, recursions]) => {
    safeLocalStorageSet(LS_KEYS.recurringDefaults, {
      recurring,
      frequency,
      recursions
    });
  },
  { deep: true }
);

// Auto-add tags whenever category/description indicate a known merchant
watch(
  [() => newTransaction.category, () => newTransaction.description],
  ([cat, desc], [prevCat, prevDesc]) => {
    if (!cat || !desc) return;
    const detected = autoTagsFor(desc, cat);
    if (!detected.length) return;

    // Merge into the current transaction’s tags
    newTransaction.tags = autoMergeTags(newTransaction.tags, detected);

    // Keep global tag list in sync so the chips/pickers show them
    tags.value = sortAlpha(dedupeCI([...tags.value, ...detected]));
    safeLocalStorageSet(LS_KEYS.tags, tags.value);
  }
);

const currentlyEditingId = ref<string | null>(null);

// Date input handling
const addDateTextRef = ref<HTMLInputElement | null>(null);
const newTxDateError = ref("");
const addDatePickerRef = ref<HTMLInputElement | null>(null);
const newTxDateText = ref(isoToDDMMYYYY(newTransaction.date));

const newTxDateISO = computed<string>({
  get() {
    return newTransaction.date || todayLocalISO();
  },
  set(v: string) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) newTransaction.date = v;
  },
});

// ========= Universal Date Picker (iOS/Android/Desktop-safe) =========

// Calendar
const addCalOpen = ref(false);
const calViewMonthISO = ref('');
// const newTxDateISO = ref('');
// const newTxDateError = ref('');
// const todayISO = computed(() => toLocalISO(new Date()));
// const addDateTextRef = ref<HTMLInputElement | null>(null);
// const addDatePickerRef = ref<HTMLInputElement | null>(null);
// const amountInputRef = ref<HTMLInputElement | null>(null);
// const addSectionRef = ref<HTMLElement | null>(null);
const hiddenCategories = ref<string[]>([]);

// in loadPersistedState()
const rawHidden = safeLocalStorageGet(LS_KEYS.catsHidden);
if (Array.isArray(rawHidden)) {
  hiddenCategories.value = rawHidden.filter(isString);
}

// persist on change
watch(hiddenCategories, (v) => safeLocalStorageSet(LS_KEYS.catsHidden, v), {
  deep: true,
});

function isDefaultCategory(name: string) {
  return categoryNames.some((c) => eqi(c, name));
}
function isHiddenCategory(name: string) {
  return hiddenCategories.value.some((c) => eqi(c, name));
}

watch(newTxDateISO, (v) => {
  if (v) calViewMonthISO.value = v.slice(0, 7) + "-01";
});

function startOfMonthISO(iso: string): string {
  const [y, m] = iso.split("-").map(Number);
  return toLocalISO(new Date(y, m - 1, 1));
}
function startOfCalendarGrid(isoFirstOfMonth: string): string {
  const dt = new Date(isoFirstOfMonth);
  const dow = dt.getDay(); // Sun=0..Sat=6
  dt.setDate(1 - dow);
  return toLocalISO(dt);
}
function daysInMonthGrid(
  isoFirstOfMonth: string
): { iso: string; inMonth: boolean; isToday: boolean }[] {
  const first = new Date(isoFirstOfMonth);
  const month = first.getMonth();
  const gridStartISO = startOfCalendarGrid(isoFirstOfMonth);
  const cells: { iso: string; inMonth: boolean; isToday: boolean }[] = [];
  let cursor = new Date(gridStartISO);
  const todayISO = todayLocalISO();
  for (let i = 0; i < 42; i++) {
    const iso = toLocalISO(cursor);
    cells.push({
      iso,
      inMonth: cursor.getMonth() === month,
      isToday: iso === todayISO,
    });
    cursor.setDate(cursor.getDate() + 1);
  }
  return cells;
}
const calCells = computed(() =>
  daysInMonthGrid(startOfMonthISO(calViewMonthISO.value))
);

function openAddCalendar() {
  calViewMonthISO.value = newTxDateISO.value
    ? startOfMonthISO(newTxDateISO.value)
    : startOfMonthISO(todayLocalISO());
  addCalOpen.value = true;
}
function closeAddCalendar() {
  addCalOpen.value = false;
}
function calPrevMonth() {
  calViewMonthISO.value = addMonthsClamped(
    startOfMonthISO(calViewMonthISO.value),
    -1
  );
}
function calNextMonth() {
  calViewMonthISO.value = addMonthsClamped(
    startOfMonthISO(calViewMonthISO.value),
    1
  );
}
function pickCalDate(iso: string) {
  newTxDateISO.value = iso;
  newTxDateText.value = isoToDDMMYYYY(iso);
  newTxDateError.value = "";
  addDateTextRef.value?.setCustomValidity?.("");
  addCalOpen.value = false;
}
function clearCalDate() {
  newTxDateISO.value = "";
  newTxDateText.value = "";
  addCalOpen.value = false;
}

watch(newTxDateISO, (iso) => (newTxDateText.value = isoToDDMMYYYY(iso) || ""));

// Categories and tags
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

const customCategories = ref<string[]>([]);
const tags = ref<string[]>([]);
const recentCategories = ref<string[]>([]);

// Last selected category for pre-fill
const lastSelectedCategory = ref<string>("");

// Category combobox
const open = ref(false);
const query = ref("");
const activeIndex = ref<number>(0);
const ids = {
  input: `cat-cbx-${Math.random().toString(36).slice(2)}`,
  listbox: `cat-lb-${Math.random().toString(36).slice(2)}`,
  heading: `catmgr-h-${Math.random().toString(36).slice(2)}`,
  tagList: `tag-lb-${Math.random().toString(36).slice(2)}`,
};
// Tag input
const tagInput = ref("");
const openTagSuggest = ref(false);

// Modals
const showManager = ref(false);
const managerMode = ref<"manage" | "add">("manage");
const tagPicker = reactive({
  open: false,
  q: "",
  visible: 120,
  selected: new Set<string>(),
});
const labelImport = reactive({
  open: false,
  filename: "",
  label: "",
  note: "",
  imported: [] as Transaction[],
  tagsSelected: [] as string[],
  tagsQuery: "",
});
// const openSmartSelect = ref(false);
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

// Transactions view
const showAdvancedTransactionsView = ref(false);
const searchQuery = ref('');
const typeFilter = ref<TransactionType | ''>('');
const sourceFilter = ref('');
const sortField = ref<'date' | 'type' | 'amount' | 'category'>('date');
const sortOrder = ref<'asc' | 'desc'>('desc');
const currentPage = ref(1);
const itemsPerPage = 20;
const selectedIds = ref<Set<string>>(new Set());
const prioritizeSelected = ref(true);
const largeSelect = ref({ threshold: 50, smart: true, pageOnly: false });
const openSmartSelect = ref(false);
const smartSelect = ref({
  category: '',
  type: '' as '' | TransactionType,
  min: null as number | null,
  max: null as number | null,
  from: '',
  to: '',
  contains: '',
});

// Charts
const dateFilter = ref<{ start: string; end: string }>({ start: '', end: '' });
const selectedDatePreset = ref('All Time');
const chartConfig = ref({
  type: 'line' as 'line' | 'bar' | 'pie' | 'doughnut',
  groupBy: 'monthly' as 'daily' | 'weekly' | 'fortnightly' | 'monthly' | 'quarterly' | 'yearly',
});

// Reset series toggles to show all when switching back to line/bar charts
watch(chartConfig, (newCfg, oldCfg) => {
  if ((oldCfg?.type === 'pie' || oldCfg?.type === 'doughnut') &&
    (newCfg.type === 'line' || newCfg.type === 'bar')) {
    seriesToggles.value = { income: true, spending: true, balance: true, allTimeCumulativeNetBalance: true };
  }
});
const seriesToggles = ref({ income: true, spending: true, balance: true, allTimeCumulativeNetBalance: true });
const selectedCategories = ref<string[]>([]);
// Chart tab state
const chartSelectionMode = ref<'or' | 'and'>('or');
const selectedCategoriesChart = ref<string[]>([]);
const selectedTagsChart = ref<string[]>([]);
const chartCanvas = ref<HTMLCanvasElement | null>(null);
// let chartInstance: Chart | null = null;
const bubbleHierarchyContainer = ref<HTMLDivElement | null>(null);
const bubbleHierarchySvg = ref<SVGSVGElement | null>(null);

// Import/Export
const importUrl = ref("");
const importStatus = ref("");
const importError = ref(false);
const lastImportSummary = ref("");
const csvInputRef = ref<HTMLInputElement | null>(null);
const SHARE_URL_SAFE_LIMIT = 2000;

// ========= page UX helpers (focus  scroll) =========
const addSectionRef = ref<HTMLElement | null>(null);
const amountInputRef = ref<HTMLInputElement | null>(null);
const tagInputElRef = ref<HTMLInputElement | null>(null);

function scrollAddIntoView() {
  nextTick(() => {
    addSectionRef.value?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}
function focusAmount() {
  nextTick(() => amountInputRef.value?.focus());
}
function focusTags() {
  nextTick(() => tagInputElRef.value?.focus());
}

// Toasts
const toasts = ref<{ id: number; message: string; kind: ToastKind }[]>([]);
let toastId = 1;

// Themes
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

// Theme dropdown control
const themeOpen = ref(false);
const themeDropdownRef = ref<HTMLDetailsElement | null>(null);

function onThemeToggle(e: Event) {
  const el = e.target as HTMLDetailsElement;
  themeOpen.value = !!el?.open;
}

function closeThemeDropdown() {
  const el = themeDropdownRef.value;
  if (el?.hasAttribute("open")) el.removeAttribute("open");
  themeOpen.value = false;
}

function onThemeSelect(theme: string) {
  setTheme(theme); // uses your existing setTheme()
  closeThemeDropdown(); // close after choosing
}

// ---------- Category & Tags state ----------
// Bind UI directly to the transaction being edited
const currentCategory = computed<string>({
  get() {
    return newTransaction.category || "";
  },
  set(v) {
    newTransaction.category = v || "";
    if (v) rememberCategory(v);
  },
});

const selectedTags = computed<string[]>({
  get() {
    return Array.isArray(newTransaction.tags) ? newTransaction.tags : [];
  },
  set(v) {
    newTransaction.tags = sortAlpha(dedupeCI(v));
  },
});

// Category dropdown plumbing
const categoryOpen = ref(false);
const categoryDropdownRef = ref<HTMLDetailsElement | null>(null);
const categoryQuery = ref("");

const filteredCategories = computed(() => {
  const q = norm(categoryQuery.value);
  const list = allCategories.value.slice();
  if (!q) return list;
  return list
    .filter((c) => norm(c).includes(q))
    .sort((a, b) => {
      const A = norm(a),
        B = norm(b);
      const ap = A.startsWith(q) ? 0 : 1;
      const bp = B.startsWith(q) ? 0 : 1;
      return ap - bp || A.localeCompare(B);
    });
});

function existsCategory(name: string) {
  const n = norm(name);
  return allCategories.value.some((c) => norm(c) === n);
}

// Tags dropdown  manager share a single master list: `tags`
const tagsOpen = ref(false);
const tagsDropdownRef = ref<HTMLDetailsElement | null>(null);
const tagsQuery = ref("");

const filteredTags = computed(() => {
  const q = norm(tagsQuery.value);
  const list = sortAlpha(dedupeCI(tags.value.slice()));
  if (!q) return list;
  return list
    .filter((t) => norm(t).includes(q))
    .sort((a, b) => {
      const A = norm(a),
        B = norm(b);
      const ap = A.startsWith(q) ? 0 : 1;
      const bp = B.startsWith(q) ? 0 : 1;
      return ap - bp || A.localeCompare(B);
    });
});

// Manager edits customCategories (not defaults) and global tags
type ManagerType = "category" | "tag";
const managerType = ref<ManagerType>("category");
const managerRef = ref<HTMLDialogElement | null>(null);
const managerSearch = ref("");
const managerNewName = ref("");
const renameTarget = ref<string | null>(null);
const renameValue = ref("");
const renameConfirmRef = ref<HTMLDialogElement | null>(null);
const updateCount = ref(0);

function getListRef() {
  return managerType.value === "category" ? customCategories : tags;
}
function existsInManager(name: string) {
  const n = norm(name);
  return getListRef().value.some((x) => norm(x) === n);
}
function addToList(name: string) {
  const listRef = getListRef();
  if (!existsInManager(name)) {
    listRef.value = sortAlpha(dedupeCI([...listRef.value, name.trim()]));
    safeLocalStorageSet(LS_KEYS.cats, customCategories.value);
    safeLocalStorageSet(LS_KEYS.tags, tags.value);
  }
}
function removeFromList(name: string) {
  const listRef = getListRef();
  const n = norm(name);
  listRef.value = listRef.value.filter((x) => norm(x) !== n);

  if (managerType.value === "category") {
    // If current selection shows the removed category, clear it
    if (eqi(currentCategory.value || "", name)) currentCategory.value = "";
    // Reassign existing transactions to a safe default
    transactions.value = transactions.value.map((t) =>
      eqi(t.category, name) ? { ...t, category: "Uncategorized" } : t
    );
  } else {
    // Remove tag from any selected chips
    selectedTags.value = selectedTags.value.filter((t) => !eqi(t, name));
    // Strip the tag from all transactions
    transactions.value = transactions.value.map((t) => ({
      ...t,
      tags: t.tags.filter((tt) => !eqi(tt, name)),
    }));
  }

  safeLocalStorageSet(LS_KEYS.cats, customCategories.value);
  safeLocalStorageSet(LS_KEYS.tags, tags.value);
  pushToast(`Deleted ${managerType.value} “${name}”`, "success");
}

watch(showAdvancedTransactionsView, (v) => {
  localStorage.setItem(LS_KEYS.view, String(v));
});

// Persist lists if not already elsewhere
watch(customCategories, (v) => safeLocalStorageSet(LS_KEYS.cats, v), {
  deep: true,
});
watch(tags, (v) => safeLocalStorageSet(LS_KEYS.tags, v), { deep: true });

// Filtered manager items (case-insensitive, prefix weighted)
const managerItems = computed<string[]>(() => {
  // Build the source list
  let src: string[];
  if (managerType.value === "category") {
    const set = new Set<string>();
    categoryNames.forEach((c) => set.add(c));
    customCategories.value.forEach((c) => set.add(c));
    transactions.value.forEach((t) => set.add(t.category));
    // NOTE: We intentionally do NOT filter out hidden categories here
    // so users can search and restore them from the manager.
    src = Array.from(set);
  } else {
    src = getListRef().value.slice();
  }

  const q = norm(managerSearch.value);
  if (!q) {
    return src.filter((x) => norm(x)).sort((a, b) => a.localeCompare(b));
  }

  // Prefix hits first, then general includes
  return src
    .filter((x) => norm(x).includes(q))
    .sort((a, b) => {
      const A = norm(a);
      const B = norm(b);
      const ap = A.startsWith(q) ? 0 : 1;
      const bp = B.startsWith(q) ? 0 : 1;
      return ap - bp || A.localeCompare(B);
    });
});

const labelImportFilteredTags = computed(() => {
  const q = norm(labelImport.tagsQuery);
  const list = sortAlpha(dedupeCI(tags.value));
  if (!q) return list;
  return list.filter((t) => norm(t).includes(q));
});

// --- Lightweight virtualization (windowed rendering) ---
const virtViewportRef = ref<HTMLElement | null>(null);
const rowH = 52; // px per row (matches h in template)
const overscan = 10;

const virtScrollTop = ref(0);
const virtViewportH = ref(0);

function onVirtScroll() {
  const el = virtViewportRef.value;
  if (!el) return;
  virtScrollTop.value = el.scrollTop;
  virtViewportH.value = el.clientHeight;
}

onMounted(() => {
  const el = virtViewportRef.value;
  if (el) {
    virtViewportH.value = el.clientHeight;
    virtScrollTop.value = el.scrollTop;
  }
  window.addEventListener("resize", onVirtScroll, { passive: true });
});
onUnmounted(() => window.removeEventListener("resize", onVirtScroll));

const virtCount = computed(() => managerItems.value.length);
const virtTotalHeight = computed(() => virtCount.value * rowH);
const virtStartIndex = computed(() =>
  Math.max(0, Math.floor(virtScrollTop.value / rowH) - overscan)
);
const virtVisibleCount = computed(
  () => Math.ceil((virtViewportH.value || 0) / rowH) + overscan * 2
);
const virtEndIndex = computed(() =>
  Math.min(virtCount.value, virtStartIndex.value + virtVisibleCount.value)
);
const virtVisibleItems = computed(() =>
  managerItems.value.slice(virtStartIndex.value, virtEndIndex.value)
);
function virtItemTop(localIndex: number) {
  return (virtStartIndex.value + localIndex) * rowH;
}

// ---------- Global click-outside / Esc handling for ALL dropdowns ----------
function closeClosestDetails(e: Event) {
  const el = (e.target as HTMLElement)?.closest(
    "details[open]"
  ) as HTMLDetailsElement | null;
  el?.removeAttribute("open");
}

function onDocClick(ev: MouseEvent) {
  // Close any open dropdown if click happens outside it
  const target = ev.target as Node;
  // Close any open <details.dropdown> that wasn't clicked inside
  document
    .querySelectorAll<HTMLDetailsElement>("details.dropdown[open]")
    .forEach((d) => {
      if (!d.contains(target)) d.removeAttribute("open");
    });
}

function onDocKeydown(ev: KeyboardEvent) {
  if (ev.key !== "Escape") return;
  document
    .querySelectorAll<HTMLDetailsElement>("details[open]")
    .forEach((d) => d.removeAttribute("open"));
}

onMounted(() => {
  document.addEventListener("click", onDocClick, true);
  document.addEventListener("keydown", onDocKeydown);
});

onUnmounted(() => {
  document.removeEventListener("click", onDocClick, true);
  document.removeEventListener("keydown", onDocKeydown);
});

// ========== COMPUTED PROPERTIES ==========
const tabs = computed(() => {
  const allTabs = [
    { id: "import", label: "Import", icon: "📥" },
    { id: "add", label: "Add", icon: "➕" },
    { id: "chart", label: "Chart", icon: "📊" },
    { id: "transactions", label: "Transactions", icon: "📋" },
    { id: "about", label: "About", icon: "ℹ️" },
  ];
  return allTabs.filter(
    (tab) => tab.id !== "chart" || transactions.value.length > 0
  );
});

// const defaultCategories = computed(() => sortAlpha(dedupeCI(categoryNames)));
// const allCategories = computed(() =>
//   sortAlpha(dedupeCI([...defaultCategories.value, ...customCategories.value]))
// );

const categories = computed(() => {
  const s = new Set<string>();
  transactions.value.forEach((t) => s.add(t.category));
  categoryNames.forEach((c) => s.add(c));
  customCategories.value.forEach((c) => s.add(c));
  return Array.from(s).sort((a, b) => a.localeCompare(b));
});

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
const optionId = (i: number) => `${ids.listbox}-opt-${i}`;
const activeId = computed(() => optionId(activeIndex.value));

const tagSuggestionsForInput = computed(() => {
  const q = norm(tagInput.value).toLowerCase();
  const pool = tags.value.filter((t) => !newTransaction.tags.includes(t));
  if (!q) return pool.slice(0, 8);
  return pool.filter((t) => t.toLowerCase().includes(q)).slice(0, 8);
});

const derivedEndDateISO = computed(() => {
  if (!newTransaction.recurring) return "";
  const start = newTransaction.date;
  const freq = newTransaction.frequency || "monthly";
  const recs = Number(newTransaction.recursions || 1);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || recs < 1) return "";
  return computeRecurringEndDate(start, freq, recs);
});

// Transaction filtering and selection
// Base = smart search only (NO chart date filter here)
const baseFilteredBySearch = computed(() => {
  const f = parseSmartQuery(searchQuery.value);
  return transactions.value.filter((t) => txMatches(t, f));
});

watch(
  [searchQuery, typeFilter, () => sortField.value, () => sortOrder.value],
  () => {
    currentPage.value = 1;
  }
);

// Table view uses ONLY smart search (+ optional typeFilter), NOT the chart's date range
const filteredTransactions = computed(() => {
  let list = baseFilteredBySearch.value;
  if (typeFilter.value) list = list.filter((t) => t.type === typeFilter.value);
  // Keep your existing sort:
  const field = sortField.value;
  const order = sortOrder.value === "asc" ? 1 : -1;
  return list
    .slice()
    .sort((a: any, b: any) =>
      field === "amount"
        ? (a[field] - b[field]) * order
        : String(a[field]).localeCompare(String(b[field])) * order
    );
});

// Active amount filter display helper
const activeAmountFilter = computed(() => {
  const f = parseSmartQuery(searchQuery.value);
  if (f.amount !== undefined) return `amount:$${f.amount.toFixed(2)}`;
  if (f.min !== undefined || f.max !== undefined) {
    const parts: string[] = [];
    if (f.min !== undefined) parts.push(`≥$${f.min.toFixed(2)}`);
    if (f.max !== undefined) parts.push(`≤$${f.max.toFixed(2)}`);
    return parts.join(" ");
  }
  return "";
});

// Chart view applies the chart date range on top of the same base
const chartFilteredTransactions = computed(() => {
  const { start, end } = dateFilter.value;
  return baseFilteredBySearch.value.filter(
    (t) => (!start || t.date >= start) && (!end || t.date <= end)
  );
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredTransactions.value.length / itemsPerPage))
);

const pageOffset = computed(() => (currentPage.value - 1) * itemsPerPage);

const paginatedTransactions = computed(() => {
  const list = filteredTransactions.value.slice(
    pageOffset.value,
    pageOffset.value + itemsPerPage
  );

  const sel = selectedIds.value;
  if (prioritizeSelected.value) {
    list.sort((a, b) => {
      const pa = sel.has(a.id) ? 1 : 0;
      const pb = sel.has(b.id) ? 1 : 0;
      if (pa !== pb) return pb - pa;
      return 0;
    });
  }

  return list;
});

const selectedCount = computed(() => selectedIds.value.size);
const selectedTransactions = computed(() =>
  transactions.value.filter((t) => selectedIds.value.has(t.id))
);
const someSelectedOnPage = computed(() =>
  paginatedTransactions.value.some((t) => selectedIds.value.has(t.id))
);
const allSelected = computed(
  () =>
    paginatedTransactions.value.length > 0 &&
    paginatedTransactions.value.every((t) => selectedIds.value.has(t.id))
);

// Statistics
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
  expenseTransactions.value
    .filter((t) => t.type === "spending")
    .reduce((s, t) => s + t.amount, 0)
);
const netBalance = computed(() => totalIncome.value - totalExpenses.value);

// Charts
const chartCategories = computed(() => {
  const s = new Set<string>();
  transactions.value.forEach((t) => s.add(t.category));
  return Array.from(s).sort((a, b) => a.localeCompare(b));
});

const chartTags = computed(() => {
  const s = new Set<string>();
  transactions.value.forEach((t) => t.tags.forEach(tag => s.add(tag)));
  return Array.from(s).sort((a, b) => a.localeCompare(b));
});


const chartData = computed(() => {

  const sourceList = typeof chartFilteredTransactions !== 'undefined'
    ? chartFilteredTransactions.value
    : filteredTransactions.value;

  let base = sourceList;

  if (chartSelectionMode.value === 'or') {
    // OR mode: must have selected category OR selected tag
    if (selectedCategoriesChart.value.length > 0 || selectedTagsChart.value.length > 0) {
      base = base.filter(t =>
        (selectedCategoriesChart.value.length === 0 ||
          selectedCategoriesChart.value.includes(t.category)) ||
        (selectedTagsChart.value.length === 0 ||
          t.tags.some(tag => selectedTagsChart.value.some(selectedTag => eqi(tag, selectedTag))))
      );
    }
  } else if (chartSelectionMode.value === 'and') {
    // AND mode: must have ALL selected categories AND ALL selected tags
    if (selectedCategoriesChart.value.length > 0 && selectedTagsChart.value.length > 0) {
      base = base.filter(t =>
        selectedCategoriesChart.value.includes(t.category) &&
        selectedTagsChart.value.every(selectedTag => t.tags.some(tag => eqi(tag, selectedTag)))
      );
    } else if (selectedCategoriesChart.value.length > 0) {
      // Only categories selected
      base = base.filter(t => selectedCategoriesChart.value.includes(t.category));
    } else if (selectedTagsChart.value.length > 0) {
      // Only tags selected
      base = base.filter(t =>
        selectedTagsChart.value.some(selectedTag => t.tags.some(tag => eqi(tag, selectedTag)))
      );
    }
  }

  // ── Pie / Doughnut ──
  if (chartConfig.value.type === 'pie' || chartConfig.value.type === 'doughnut') {
    const byCat: Record<string, number> = {};
    base.forEach(t => {
      if (t.type === 'spending') {
        byCat[t.category] = (byCat[t.category] || 0) + t.amount;
      }
    });

    const labels = Object.keys(byCat).sort((a, b) => byCat[b] - byCat[a]);
    const data = labels.map(k => byCat[k]);

    return {
      labels,
      datasets: [{
        data,
        backgroundColor: labels.map((_, i) => VIBRANT_COLORS[i % VIBRANT_COLORS.length]),
        borderColor: labels.map((_, i) => VIBRANT_BORDERS[i % VIBRANT_BORDERS.length]),
        borderWidth: 2,
      }],
    };
  }

  function getChartBucketKey(dateInput: string | Date) {
    const d = dateInput instanceof Date ? new Date(dateInput) : new Date(dateInput);
    switch (chartConfig.value.groupBy) {
      case 'daily': return toLocalISO(d);
      case 'weekly': {
        const dt = new Date(d);
        dt.setDate(dt.getDate() - dt.getDay());
        return toLocalISO(dt);
      }
      case 'fortnightly': {
        const dt = new Date(d);
        dt.setDate(dt.getDate() - ((dt.getDay() + 7) % 14));
        return toLocalISO(dt);
      }
      case 'monthly': return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      case 'quarterly': return `${d.getFullYear()}-Q${Math.floor(d.getMonth() / 3) + 1}`;
      case 'yearly': return String(d.getFullYear());
    }
  }

  // ── Line / Bar (time series) ──
  const bucket: Record<string, { income: number; spending: number }> = {};

  for (const t of base) {
    const key = getChartBucketKey(t.date);
    if (!bucket[key]) bucket[key] = { income: 0, spending: 0 };
    bucket[key][t.type] += t.amount;
  }

  const labels = Object.keys(bucket).sort();
  const income = labels.map(k => bucket[k].income);
  const spending = labels.map(k => bucket[k].spending);
  const balance = labels.map((_, i) => (income[i] || 0) - (spending[i] || 0));

  const t = chartConfig.value.type;
  const datasets: any[] = [];

  if (seriesToggles.value.income) {
    datasets.push({
      label: "Income",
      data: income,
      type: t,
      tension: 0.3,
    });
  }

  if (seriesToggles.value.spending) {
    datasets.push({
      label: "Spending",
      data: spending,
      type: t,
      tension: 0.3,
    });
  }

  if (seriesToggles.value.balance) {
    datasets.push({
      label: "Avaliable Balance",
      data: balance,
      type: t,
      borderWidth: 3,
      pointRadius: 3,
      tension: 0.25,
      fill: false,
    });
  }

  let allTimeBase = sourceList;

  if (chartSelectionMode.value === 'or') {
    // OR mode: must have selected category OR selected tag
    if (selectedCategoriesChart.value.length > 0 || selectedTagsChart.value.length > 0) {
      allTimeBase = allTimeBase.filter(t =>
        (selectedCategoriesChart.value.length === 0 ||
          selectedCategoriesChart.value.includes(t.category)) ||
        (selectedTagsChart.value.length === 0 ||
          t.tags.some(tag => selectedTagsChart.value.some(selectedTag => eqi(tag, selectedTag))))
      );
    }
  } else if (chartSelectionMode.value === 'and') {
    // AND mode: must have ALL selected categories AND ALL selected tags
    if (selectedCategoriesChart.value.length > 0 && selectedTagsChart.value.length > 0) {
      allTimeBase = allTimeBase.filter(t =>
        selectedCategoriesChart.value.includes(t.category) &&
        selectedTagsChart.value.every(selectedTag => t.tags.some(tag => eqi(tag, selectedTag)))
      );
    } else if (selectedCategoriesChart.value.length > 0) {
      // Only categories selected
      allTimeBase = allTimeBase.filter(t => selectedCategoriesChart.value.includes(t.category));
    } else if (selectedTagsChart.value.length > 0) {
      // Only tags selected
      allTimeBase = allTimeBase.filter(t =>
        selectedTagsChart.value.some(selectedTag => t.tags.some(tag => eqi(tag, selectedTag)))
      );
    }
  }

  const allTimeSorted = [...allTimeBase].sort((a, b) =>
    String(a.date).localeCompare(String(b.date))
  );

  const allTimeBucketDelta: Record<string, number> = {};

  for (const t of allTimeSorted) {
    const key = getChartBucketKey(t.date);
    const delta = t.type === "income" ? t.amount : -t.amount;
    allTimeBucketDelta[key] = (allTimeBucketDelta[key] || 0) + delta;
  }

  const allTimeLabels = Object.keys(allTimeBucketDelta).sort();
  const allTimeCumulativeLookup: Record<string, number> = {};
  let runningNet = 0;

  for (const key of allTimeLabels) {
    runningNet += allTimeBucketDelta[key];
    allTimeCumulativeLookup[key] = runningNet;
  }

  const allTimeCumulativeNetBalance = labels.map(
    key => allTimeCumulativeLookup[key] ?? 0
  );

  if (seriesToggles.value.allTimeCumulativeNetBalance) {
    datasets.push({
      label: "All-time Net Balance",
      data: allTimeCumulativeNetBalance,
      type: "line",
      borderWidth: 3,
      pointRadius: 3,
      tension: 0.2,
      fill: false,
    });
  }

  return { labels, datasets };

});



let chartInstance: any = null;

async function renderChart() {
  if (!chartCanvas.value || chartData.value.labels.length === 0) {
    // Destroy if no data
    if (chartInstance) { chartInstance.destroy(); chartInstance = null; }
    return;
  }

  // Destroy previous instance
  if (chartInstance) { chartInstance.destroy(); chartInstance = null; }

  // Dynamic import (works without build tooling)
  const { Chart, registerables } = await import('chart.js');
  Chart.register(...registerables);

  const data = JSON.parse(JSON.stringify(chartData.value));
  const type = chartConfig.value.type;
  const isPieish = type === 'pie' || type === 'doughnut';

  data.datasets = data.datasets.map((ds: any) => ({
    ...ds,
    type: ds.type ?? chartConfig.value.type,
  }));
  chartInstance = new Chart(chartCanvas.value.getContext('2d')!, {
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
                ctx.parsed?.y ?? ctx.parsed,
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


// Single watcher for all chart-related changes
watch(
  [chartData, chartConfig, seriesToggles, selectedCategoriesChart, selectedTagsChart, chartSelectionMode, dateFilter],
  () => {
    if (activeTab.value === 'chart') {
      nextTick(() => renderChart());
    }
  },
  { deep: true }
);

// Re-render when switching to chart tab
watch(activeTab, (tab) => {
  if (tab === 'chart') {
    nextTick(() => {
      ensureAllCatsSelected();
      renderChart();
    });
  }
});

// Auto-select categories when they change
watch(chartCategories, () => {
  // Auto-select all categories if none selected (first visit)
  if (selectedCategoriesChart.value.length === 0 && chartCategories.value.length > 0) {
    selectedCategoriesChart.value = [...chartCategories.value];
  }
});

// Re-render on theme change
watch(currentTheme, () => {
  if (activeTab.value === 'chart') {
    nextTick(() => renderChart());
  }
});

// Auto-select tags when they change
watch(chartTags, () => {
  // Auto-select all tags if none selected (first visit)
  if (selectedTagsChart.value.length === 0 && chartTags.value.length > 0) {
    selectedTagsChart.value = [...chartTags.value];
  }
});



// async function renderChart() {
//   if (!chartCanvas.value || chartData.value.labels.length === 0) return;
//   if (chartInstance) chartInstance.destroy();

//   const data = JSON.parse(JSON.stringify(chartData.value));

//   chartInstance = new Chart(chartCanvas.value.getContext('2d')!, {
//     type: chartConfig.value.type as any,
//     data,
//     options: {
//       responsive: true,
//       maintainAspectRatio: false,
//       animation: {
//         duration: 800,
//         easing: 'easeOutQuart',
//       },
//       plugins: {
//         legend: {
//           position: 'top',
//           labels: {
//             usePointStyle: true,
//             padding: 15,
//             font: { size: 12, weight: 'bold' },
//           },
//         },
//         title: {
//           display: true,
//           text: 'Financial Analytics',
//           font: { size: 16, weight: 'bold' },
//           padding: { bottom: 20 },
//         },
//         tooltip: {
//           backgroundColor: 'rgba(0, 0, 0, 0.8)',
//           titleFont: { size: 14, weight: 'bold' },
//           bodyFont: { size: 13 },
//           padding: 12,
//           cornerRadius: 8,
//           callbacks: {
//             label: (ctx: any) => `${ctx.dataset.label}: $${Number(ctx.parsed?.y ?? ctx.parsed).toFixed(2)}`,
//           },
//         },
//       },
//       scales: chartConfig.value.type === 'pie' || chartConfig.value.type === 'doughnut' ? {} : {
//         y: {
//           beginAtZero: true,
//           grid: { color: 'rgba(0, 0, 0, 0.1)' },
//           ticks: {
//             callback: (v: any) => '$' + Number(v).toFixed(0),
//             font: { size: 11 },
//           },
//         },
//         x: {
//           grid: { display: false },
//           ticks: { font: { size: 11 } },
//         },
//       },
//       interaction: {
//         intersect: false,
//         mode: 'index',
//       },
//     },
//   });
// }

// // Watch for chart updates
// watch([chartData, () => chartConfig.value.type, () => chartConfig.value.groupBy], () => {
//   if (activeTab.value === 'chart') {
//     nextTick(() => renderChart());
//   }
// }, { deep: true });

// watch(() => activeTab.value, (tab) => {
//   if (tab === 'chart') {
//     ensureAllCatsSelected();
//     nextTick(() => renderChart());
//   }
// });
// --- DaisyUI → Chart.js color helpers ---
// Theme color token mapping
type Token =
  | "primary"
  | "primaryContent"
  | "secondary"
  | "secondaryContent"
  | "accent"
  | "accentContent"
  | "neutral"
  | "neutralContent"
  | "base1"
  | "base2"
  | "base3"
  | "baseContent"
  | "info"
  | "success"
  | "warning"
  | "error";

const TOKEN_VAR: Record<Token, string> = {
  primary: "--p",
  primaryContent: "--pc",
  secondary: "--s",
  secondaryContent: "--sc",
  accent: "--a",
  accentContent: "--ac",
  neutral: "--n",
  neutralContent: "--nc",
  base1: "--b1",
  base2: "--b2",
  base3: "--b3",
  baseContent: "--bc",
  info: "--in",
  success: "--su",
  warning: "--wa",
  error: "--er",
};

// Probe element to resolve CSS colors
let _probeEl: HTMLSpanElement | null = null;

function cssVarToRGB(varName: string): string {
  if (!_probeEl) {
    _probeEl = document.createElement("span");
    _probeEl.style.position = "absolute";
    _probeEl.style.left = "-9999px";
    _probeEl.style.top = "-9999px";
    _probeEl.style.pointerEvents = "none";
    _probeEl.style.opacity = "0";
    document.body.appendChild(_probeEl);
  }
  _probeEl.style.backgroundColor = `var(${varName})`;
  return getComputedStyle(_probeEl).backgroundColor || "rgb(0,0,0)";
}

function withAlpha(rgbOrRgba: string, alpha = 1): string {
  const m = rgbOrRgba.match(
    /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/i
  );
  if (!m) return rgbOrRgba;
  const r = +m[1], g = +m[2], b = +m[3];
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function themeColor(token: Token, alpha = 1): string {
  return withAlpha(cssVarToRGB(TOKEN_VAR[token]), alpha);
}

function themePalette(n: number): string[] {
  const seeds: Token[] = [
    "primary",
    "secondary",
    "accent",
    "info",
    "success",
    "warning",
    "error",
    "neutral",
  ];
  const out: string[] = [];
  for (let i = 0; i < n; i++)
    out.push(themeColor(seeds[i % seeds.length], 0.85));
  return out;
}
// type Token =
//   | "primary"
//   | "primaryContent"
//   | "secondary"
//   | "secondaryContent"
//   | "accent"
//   | "accentContent"
//   | "neutral"
//   | "neutralContent"
//   | "base1"
//   | "base2"
//   | "base3"
//   | "baseContent"
//   | "info"
//   | "success"
//   | "warning"
//   | "error";

// const TOKEN_VAR: Record<Token, string> = {
//   primary: "--p",
//   primaryContent: "--pc",
//   secondary: "--s",
//   secondaryContent: "--sc",
//   accent: "--a",
//   accentContent: "--ac",
//   neutral: "--n",
//   neutralContent: "--nc",
//   base1: "--b1",
//   base2: "--b2",
//   base3: "--b3",
//   baseContent: "--bc",
//   info: "--in",
//   success: "--su",
//   warning: "--wa",
//   error: "--er",
// };

// // tiny singleton probe → resolves any CSS color (oklch/hsl/hex) to computed rgb(a)
// let _probeEl: HTMLSpanElement | null = null;
// function cssVarToRGB(varName: string): string {
//   if (!_probeEl) {
//     _probeEl = document.createElement("span");
//     _probeEl.style.position = "absolute";
//     _probeEl.style.left = "-9999px";
//     _probeEl.style.top = "-9999px";
//     _probeEl.style.pointerEvents = "none";
//     _probeEl.style.opacity = "0";
//     document.body.appendChild(_probeEl);
//   }
//   _probeEl.style.backgroundColor = `var(${varName})`;
//   return getComputedStyle(_probeEl).backgroundColor || "rgb(0,0,0)";
// }

// function withAlpha(rgbOrRgba: string, alpha = 1): string {
//   const m = rgbOrRgba.match(
//     /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/i
//   );
//   if (!m) return rgbOrRgba;
//   const r = +m[1],
//     g = +m[2],
//     b = +m[3];
//   return `rgba(${r}, ${g}, ${b}, ${alpha})`;
// }

// function themeColor(token: Token, alpha = 1): string {
//   return withAlpha(cssVarToRGB(TOKEN_VAR[token]), alpha);
// }

// function themePalette(n: number): string[] {
//   const seeds: Token[] = [
//     "primary",
//     "secondary",
//     "accent",
//     "info",
//     "success",
//     "warning",
//     "error",
//     "neutral",
//   ];
//   const out: string[] = [];
//   for (let i = 0; i < n; i++)
//     out.push(themeColor(seeds[i % seeds.length], 0.85));
//   return out;
// }

import type {
  Chart as ChartJS,
  ChartData,
  ChartOptions,
  ChartType,
  ScriptableContext,
} from "chart.js";

let themeObserver: MutationObserver | null = null;

// When data-theme attribute flips
onMounted(() => {
  themeObserver = new MutationObserver(() => {
    const cur = document.documentElement.getAttribute("data-theme") || currentTheme.value;
    currentTheme.value = cur;
    if (chartInstance.value) updateChart();
  });
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
});

onUnmounted(() => {
  themeObserver?.disconnect();
  themeObserver = null;
});

watch(currentTheme, async () => {
  document.documentElement.setAttribute("data-theme", currentTheme.value);
  await nextTick();
  if (chartInstance.value) updateChart();
});
// const chartInstance = shallowRef<Chart | null>(null);

function destroyChart() {
  chartInstance.value?.destroy();
  chartInstance.value = null;
}

// ========= Hierarchical Bubble Map (D3.js) =========
const bubbleHierarchyData = computed(() => {
  if (chartConfig.value.type !== "bubbleHierarchy") return null;

  const base =
    selectedCategories.value.length > 0
      ? filteredTransactions.value.filter((t) =>
        selectedCategories.value.includes(t.category)
      )
      : filteredTransactions.value;

  const categoryMap: Record<
    string,
    {
      total: number;
      tags: Record<string, { total: number; count: number }>;
      untagged: { total: number; count: number };
    }
  > = {};

  base.forEach((t) => {
    const cat = t.category || "Uncategorized";
    if (!categoryMap[cat]) {
      categoryMap[cat] = {
        total: 0,
        tags: {},
        untagged: { total: 0, count: 0 },
      };
    }

    const amount = Math.abs(t.amount);
    categoryMap[cat].total += amount;

    if (t.tags && t.tags.length > 0) {
      t.tags.forEach((tag: string) => {
        if (!categoryMap[cat].tags[tag]) {
          categoryMap[cat].tags[tag] = { total: 0, count: 0 };
        }
        categoryMap[cat].tags[tag].total += amount;
        categoryMap[cat].tags[tag].count += 1;
      });
    } else {
      categoryMap[cat].untagged.total += amount;
      categoryMap[cat].untagged.count += 1;
    }
  });

  const children = Object.entries(categoryMap).map(([category, data]) => {
    const tagChildren = Object.entries(data.tags).map(([tag, tagData]) => ({
      name: tag,
      value: tagData.total,
      count: tagData.count,
      type: "tag",
      category,
    }));

    if (data.untagged.count > 0) {
      tagChildren.push({
        name: "Untagged",
        value: data.untagged.total,
        count: data.untagged.count,
        type: "untagged",
        category,
      });
    }

    return {
      name: category,
      value: data.total,
      type: "category",
      children: tagChildren,
    };
  });

  return { name: "All Transactions", children };
});

let bubbleHierarchyInstance: any = null;

async function renderBubbleHierarchy() {
  if (!bubbleHierarchySvg.value || !bubbleHierarchyData.value) return;

  try {
    const d3 = await import("https://cdn.jsdelivr.net/npm/d3@7/+esm");

    if (bubbleHierarchyInstance) {
      d3.select(bubbleHierarchySvg.value).selectAll("*").remove();
    }

    const container = bubbleHierarchyContainer.value;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const svg = d3
      .select(bubbleHierarchySvg.value)
      .attr("viewBox", [0, 0, width, height])
      .attr("width", width)
      .attr("height", height);

    const root = d3
      .hierarchy(bubbleHierarchyData.value)
      .sum((d: any) => d.value || 0)
      .sort((a: any, b: any) => (b.value || 0) - (a.value || 0));

    const pack = d3.pack().size([width, height]).padding(3);
    pack(root);

    // Get theme colors dynamically
    const themeColors = [
      themeColor("primary", 0.85),
      themeColor("secondary", 0.85),
      themeColor("accent", 0.85),
      themeColor("info", 0.85),
      themeColor("success", 0.85),
      themeColor("warning", 0.85),
      themeColor("error", 0.85),
      themeColor("neutral", 0.85),
    ];

    const categoryNames = Array.from(
      new Set(
        root
          .descendants()
          .filter((d) => d.depth === 1)
          .map((d) => d.data.name)
      )
    );
    const colorMap: Record<string, string> = {};
    categoryNames.forEach((name, i) => {
      colorMap[name] = themeColors[i % themeColors.length];
    });

    let focus = root;
    let view: any;

    const g = svg.append("g");

    const node = g
      .selectAll("g")
      .data(root.descendants())
      .join("g")
      .attr("transform", (d: any) => `translate(${d.x},${d.y})`)
      .style("cursor", (d: any) => (d.children ? "pointer" : "default"))
      .on("click", (event, d: any) => {
        if (focus !== d && d.children) {
          zoomToNode(event, d);
          event.stopPropagation();
        }
      });

    node
      .append("circle")
      .attr("r", (d: any) => d.r)
      .attr("fill", (d: any) => {
        if (d.depth === 0) return "transparent";
        if (d.depth === 1) return colorMap[d.data.name] || themeColors[0];
        if (d.data.type === "untagged") return themeColor("neutral", 0.6);
        const parentColor = colorMap[d.parent.data.name] || themeColors[0];
        return withAlpha(parentColor, 0.5);
      })
      .attr("stroke", (d: any) =>
        d.depth === 0 ? "none" : themeColor("base1")
      )
      .attr("stroke-width", 2)
      .attr("opacity", 0.85)
      .on("mouseenter", function (event, d: any) {
        if (d.depth === 0) return;
        d3.select(this)
          .transition()
          .duration(200)
          .attr("opacity", 1)
          .attr("stroke-width", d.children ? 4 : 3)
          .attr(
            "stroke",
            d.children ? themeColor("warning") : themeColor("base1")
          );
      })
      .on("mouseleave", function (event, d: any) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("opacity", 0.85)
          .attr("stroke-width", 2)
          .attr("stroke", themeColor("base1"));
      });

    const textColor = themeColor("baseContent");
    const label = node
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.3em")
      .style("font-size", (d: any) => `${Math.min(d.r / 3, 24)}px`)
      .style("font-weight", (d: any) => (d.depth === 1 ? "600" : "400"))
      .style("fill", textColor)
      .style("pointer-events", "none")
      .style("user-select", "none")
      .style("text-shadow", "0 1px 2px rgba(0,0,0,0.3)");

    label
      .append("tspan")
      .attr("x", 0)
      .text((d: any) => {
        if (d.depth === 0 || d.r < 20) return "";
        const name = d.data.name;
        return d.r < 40
          ? name.slice(0, 10) + (name.length > 10 ? "..." : "")
          : name;
      });

    label
      .append("tspan")
      .attr("x", 0)
      .attr("dy", "1.2em")
      .style("font-size", (d: any) => `${Math.min(d.r / 4, 16)}px`)
      .style("opacity", 0.9)
      .text((d: any) => {
        if (d.depth === 0 || d.r < 30) return "";
        return currencyFmt(d.value || 0);
      });

    label
      .append("tspan")
      .attr("x", 0)
      .attr("dy", "1.1em")
      .style("font-size", (d: any) => `${Math.min(d.r / 5, 12)}px`)
      .style("opacity", 0.8)
      .text((d: any) => {
        if (d.depth === 0 || !d.data.count || d.r < 40) return "";
        return `${d.data.count} tx`;
      });

    const tooltip = d3
      .select(bubbleHierarchyContainer.value)
      .append("div")
      .attr(
        "class",
        "absolute bg-base-100 shadow-xl rounded-lg p-3 text-sm pointer-events-none opacity-0 z-20 border-2 border-primary max-w-xs"
      )
      .style("transition", "opacity 0.2s ease");

    node
      .on("mouseenter", function (event, d: any) {
        if (d.depth === 0) return;

        let html = `<div class="font-bold text-base mb-2 text-primary">${d.data.name}</div>`;
        html += `<div class="text-sm mb-1"><span class="font-semibold">Amount:</span> ${currencyFmt(
          d.value || 0
        )}</div>`;
        if (d.data.count) {
          html += `<div class="text-sm mb-1"><span class="font-semibold">Transactions:</span> ${d.data.count}</div>`;
        }
        if (d.data.type === "category") {
          const tagCount = d.children ? d.children.length : 0;
          html += `<div class="text-xs opacity-70 mt-2 pt-2 border-t border-base-300">💡 Click to see ${tagCount} group${tagCount !== 1 ? "s" : ""
            }</div>`;
        }

        tooltip
          .html(html)
          .style("opacity", 1)
          .style("left", `${event.pageX - container.offsetLeft + 15}px`)
          .style("top", `${event.pageY - container.offsetTop - 15}px`);
      })
      .on("mousemove", function (event) {
        tooltip
          .style("left", `${event.pageX - container.offsetLeft + 15}px`)
          .style("top", `${event.pageY - container.offsetTop - 15}px`);
      })
      .on("mouseleave", function () {
        tooltip.style("opacity", 0);
      });

    function zoomTo(v: any) {
      const k = width / v[2];
      view = v;

      label.attr("transform", (d: any) => {
        const scale = Math.min((k * d.r) / width, 1);
        return `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k
          }) scale(${scale})`;
      });

      node.attr(
        "transform",
        (d: any) => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`
      );
      node.select("circle").attr("r", (d: any) => d.r * k);
    }

    function zoomToNode(event: any, d: any) {
      focus = d;

      g.transition()
        .duration(750)
        .ease(d3.easeCubicInOut)
        .tween("zoom", () => {
          const i = d3.interpolateZoom(view, [
            focus.x,
            focus.y,
            focus.r * 2 + 50,
          ]);
          return (t: number) => zoomTo(i(t));
        });

      node.style("cursor", (n: any) => {
        if (n === d || !n.children) return "default";
        return "pointer";
      });
    }

    zoomTo([root.x, root.y, root.r * 2]);

    svg.on("click", (event) => {
      if (focus !== root) {
        zoomToNode(event, root);
      }
    });

    bubbleHierarchyInstance = { svg, tooltip };
    console.log("Bubble hierarchy rendered");
  } catch (error) {
    console.error("Error rendering bubble hierarchy:", error);
    pushToast("Failed to load bubble hierarchy", "error");
  }
}

function rebuildChart() {
  destroyChart();
  const el = chartCanvas.value;
  if (!el) return;
  const ctx = el.getContext("2d");
  if (!ctx) return;

  const type = chartConfig.value.type as ChartType;
  const inst = new Chart(ctx, {
    type,
    data: makeData(type),
    options: makeOptions(),
  });

  chartInstance.value = inst;
  inst.update("none");
}

function updateChart() {
  if (!chartInstance.value) return rebuildChart();

  const inst = chartInstance.value;
  const type = chartConfig.value.type as ChartType;

  // Rebuild if switching between shape families
  const hard = new Set(["pie", "doughnut", "bubble"]);
  if (
    inst.config.type !== type &&
    (hard.has(type) || hard.has(inst.config.type as string))
  ) {
    return rebuildChart();
  }

  inst.config.type = type;
  inst.data = makeData(type);
  inst.options = makeOptions();
  inst.update();
}



onMounted(async () => {
  await nextTick();
  rebuildChart();
});
onUnmounted(destroyChart);

watch(
  [
    chartData,
    chartConfig,
    seriesToggles,
    selectedCategories,
    () => activeTab.value,
  ],
  async () => {
    if (activeTab.value !== "chart") return;
    await nextTick();
    updateChart();
  },
  { deep: true }
);

// Re-apply colors on theme switch:
watch(currentTheme, async () => {
  document.documentElement.setAttribute("data-theme", currentTheme.value);
  await nextTick();
  if (chartInstance.value) {
    chartInstance.value.update("none");
  }
});

watch(
  () => chartConfig.value.type,
  (t) => {
    if (t === "pie" || t === "doughnut") {
      // Only spending for share charts
      seriesToggles.value = { income: false, spending: true, balance: false };
      // Ensure all categories are selected so the pie/doughnut has data
      if (selectedCategories.value.length === 0) {
        selectedCategories.value = [...chartCategories.value];
      }
    } else {
      // Sensible defaults for time series / bubble
      if (
        !seriesToggles.value.income &&
        !seriesToggles.value.spending &&
        !seriesToggles.value.balance
      ) {
        seriesToggles.value = { income: true, spending: true, balance: true };
      }
      // Keep user selection if any; otherwise prefill
      if (selectedCategories.value.length === 0) {
        selectedCategories.value = [...chartCategories.value];
      }
    }
  },
  { immediate: true }
);

function currencyFmt(n: number) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "AUD",
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    // Fallback if currency isn't available in the runtime
    return `$${n.toFixed(2)}`;
  }
}

// Compute y-extent across visible datasets for line/bar (supports negatives)
function yExtent(): [number, number] {
  const t = chartConfig.value.type;
  if (t !== "line" && t !== "bar") return [0, 0];

  const ds: any[] = (chartData.value as any).datasets || [];
  let min = 0,
    max = 0;

  for (const d of ds) {
    for (const v of d.data as number[]) {
      if (typeof v !== "number" || !isFinite(v)) continue;
      min = Math.min(min, v);
      max = Math.max(max, v);
    }
  }

  if (min === 0 && max === 0) return [0, 1]; // empty protection
  const pad = Math.max(1, (max - min) * 0.05);
  return [min - pad, max + pad];
}

function makeOptions(): ChartOptions {
  const type = chartConfig.value.type;

  // Get theme colors
  const grid = withAlpha(cssVarToRGB("--bc"), 0.2);
  const ticks = cssVarToRGB("--bc");
  const neutralBG = themeColor("neutral", 0.95);
  const borderColor = cssVarToRGB("--bc");
  const titleColor = themeColor("neutralContent");
  const bodyColor = themeColor("neutralContent");

  const base: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 250 },
    plugins: {
      legend: {
        display: true,
        labels: {
          usePointStyle: type !== "bar",
          color: ticks
        },
      },
      tooltip: {
        backgroundColor: neutralBG,
        borderColor,
        borderWidth: 1,
        titleColor,
        bodyColor,
        callbacks: {
          label: (ctx) => {
            if (type === "pie" || type === "doughnut") {
              const label = ctx.label || "";
              const val = Array.isArray(ctx.parsed)
                ? ctx.parsed[0]
                : (ctx.parsed as number);
              return `${label}: $${val.toFixed(2)}`;
            }
            const label = ctx.dataset?.label || "";
            const y = (ctx.parsed as any)?.y ?? 0;
            return `${label}: $${Number(y).toFixed(2)}`;
          },
        },
      },
    },
  };

  if (type === "line" || type === "bar") {
    base.scales = {
      x: {
        type: "category",
        ticks: { autoSkip: true, maxRotation: 0, color: ticks },
        grid: { color: grid, borderColor: grid },
      },
      y: {
        type: "linear",
        ticks: {
          callback: (v) => `$${Number(v).toFixed(2)}`,
          color: ticks
        },
        grid: { color: grid, borderColor: grid },
      },
    };
  }

  return base;
}
// function makeOptions(): ChartOptions {
//   const type = chartConfig.value.type;

//   // theme colors resolved from CSS vars (plain strings)
//   const grid = withAlpha(cssVarToRGB("--bc"), 0.2);
//   const ticks = cssVarToRGB("--bc");
//   const neutralBG = themeColor("neutral", 0.95);
//   const borderColor = cssVarToRGB("--bc");
//   const titleColor = themeColor("neutralContent");
//   const bodyColor = themeColor("neutralContent");

//   const base: ChartOptions = {
//     responsive: true,
//     maintainAspectRatio: false,
//     animation: { duration: 250 },
//     plugins: {
//       legend: {
//         display: true,
//         labels: { usePointStyle: type !== "bar", color: ticks },
//       },
//       tooltip: {
//         backgroundColor: neutralBG,
//         borderColor,
//         borderWidth: 1,
//         titleColor,
//         bodyColor,
//         callbacks: {
//           title: (items) => {
//             if (!items?.length) return "";
//             if (type === "bubble") {
//               const labels = (chartData.value as any).labels as
//                 | string[]
//                 | undefined;
//               const xi = (items[0].raw as any)?.x ?? 0;
//               return labels?.[xi] ?? "";
//             }
//             return items[0].label ?? "";
//           },
//           label: (ctx) => {
//             if (type === "pie" || type === "doughnut") {
//               const label = ctx.label || "";
//               const val = Array.isArray(ctx.parsed)
//                 ? ctx.parsed[0]
//                 : (ctx.parsed as number);
//               return `${label}: ${currencyFmt(val || 0)}`;
//             }
//             if (type === "bubble") {
//               const labels = (chartData.value as any).labels as
//                 | string[]
//                 | undefined;
//               const yCats = (chartData.value as any).yCats as
//                 | string[]
//                 | undefined;
//               const raw = ctx.raw as any; // { x, y, r, amt }
//               const xi = raw?.x ?? 0;
//               const yi = raw?.y ?? 0;
//               return `${yCats?.[yi] ?? ""}: ${currencyFmt(raw?.amt || 0)} @ ${
//                 labels?.[xi] ?? ""
//               }`;
//             }
//             const label = ctx.dataset?.label || "";
//             const y = (ctx.parsed as any)?.y ?? 0;
//             return `${label}: ${currencyFmt(Number(y))}`;
//           },
//         },
//       },
//       // backgroundColor on root is fine, but optional:
//       // decors: we can skip setting chart.options.backgroundColor to avoid touching proxies
//     },
//   };

//   if (type === "line" || type === "bar") {
//     const [min, max] = yExtent();
//     base.scales = {
//       x: {
//         type: "category",
//         ticks: { autoSkip: true, maxRotation: 0, color: ticks },
//         grid: { color: grid, borderColor: grid },
//       },
//       y: {
//         type: "linear",
//         suggestedMin: min,
//         suggestedMax: max,
//         ticks: { callback: (v) => currencyFmt(Number(v)), color: ticks },
//         grid: { color: grid, borderColor: grid },
//       },
//     };
//   } else if (type === "bubble") {
//     const yCats = (chartData.value as any).yCats as string[] | undefined;
//     base.scales = {
//       x: {
//         type: "category",
//         ticks: {
//           callback: (_: any, i: number) =>
//             (chartData.value as any).labels?.[i] ?? "",
//           maxRotation: 0,
//           autoSkip: true,
//           color: ticks,
//         },
//         grid: { color: grid, borderColor: grid },
//       },
//       y: {
//         type: "category",
//         ticks: {
//           autoSkip: false,
//           callback: (_: any, i: number) => yCats?.[i] ?? "",
//           color: ticks,
//         },
//         grid: { color: grid, borderColor: grid },
//       },
//     };
//   }

//   return base;
// }

function makeData(type: ChartType): ChartData {
  if (type === "pie" || type === "doughnut") {
    const cd: any = chartData.value;
    const labels = cd.labels || [];
    const data = cd.datasets?.[0]?.data || [];
    const colors = themePalette(labels.length || 6);
    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: colors,
          borderColor: themeColor("base1"),
          borderWidth: 1,
        },
      ],
    };
  }

  if (type === "bubble") {
    const cd: any = chartData.value;
    const base = themeColor("primary");
    return {
      labels: cd.labels,
      datasets: [
        {
          label: "Spending (bubble size)",
          data: cd.datasets?.[0]?.data || [],
          parsing: { xAxisKey: "x", yAxisKey: "y" },
          borderColor: withAlpha(base, 1),
          backgroundColor: withAlpha(base, 0.7),
          radius: (ctx: ScriptableContext<"bubble">) => {
            const r = Number((ctx.raw as any)?.r ?? 3);
            return Math.max(3, Math.min(24, r));
          },
        },
      ],
    };
  }

  // line / bar
  const cd: any = chartData.value;
  return {
    labels: cd.labels,
    datasets: (cd.datasets || []).map((d: any, i: number) => {
      const palette = themePalette(8);
      const name = String(d.label || "").toLowerCase();
      const base = name.includes("income")
        ? themeColor("success")
        : name.includes("spend")
          ? themeColor("error")
          : name.includes("balance")
            ? themeColor("primary")
            : palette[i % palette.length];

      return {
        ...d,
        type,
        borderWidth: type === "bar" ? 0 : 2,
        tension: type === "line" ? 0.25 : 0,
        pointRadius: type === "line" ? 2 : 0,
        borderColor: withAlpha(base, 1),
        backgroundColor: withAlpha(base, type === "line" ? 0.12 : 0.8),
      };
    }),
  };
}

// function makeData(type: ChartType): ChartData {
//   if (type === "pie" || type === "doughnut") {
//     const cd: any = chartData.value;
//     const labels = cd.labels || [];
//     const data = cd.datasets?.[0]?.data || [];
//     const colors = themePalette(labels.length || 6);
//     return {
//       labels,
//       datasets: [
//         {
//           data,
//           backgroundColor: colors,
//           borderColor: themeColor("base1"),
//           borderWidth: 1,
//         },
//       ],
//     };
//   }

//   if (type === "bubble") {
//     const cd: any = chartData.value;
//     const base = themeColor("primary");
//     return {
//       labels: cd.labels,
//       datasets: [
//         {
//           label: "Spending (bubble size)",
//           data: cd.datasets?.[0]?.data || [],
//           parsing: { xAxisKey: "x", yAxisKey: "y" },
//           borderColor: withAlpha(base, 1),
//           backgroundColor: withAlpha(base, 0.7),
//           radius: (ctx: ScriptableContext<"bubble">) => {
//             const r = Number((ctx.raw as any)?.r ?? 3);
//             return Math.max(3, Math.min(24, r));
//           },
//         },
//       ],
//     };
//   }

//   // line / bar
//   const cd: any = chartData.value;
//   return {
//     labels: cd.labels,
//     datasets: (cd.datasets || []).map((d: any, i: number) => {
//       const palette = themePalette(8);
//       const name = String(d.label || "").toLowerCase();
//       const base = name.includes("income")
//         ? themeColor("success")
//         : name.includes("spend")
//         ? themeColor("error")
//         : name.includes("balance")
//         ? themeColor("primary")
//         : palette[i % palette.length];

//       return {
//         ...d,
//         type,
//         borderWidth: type === "bar" ? 0 : 2,
//         tension: type === "line" ? 0.25 : 0,
//         pointRadius: type === "line" ? 2 : 0,
//         borderColor: withAlpha(base, 1),
//         backgroundColor: withAlpha(base, type === "line" ? 0.12 : 0.8),
//       };
//     }),
//   };
// }

// Import/Export
const shareCode = computed(() => {
  if (transactions.value.length === 0) return "tx:";
  try {
    const data = {
      t: transactions.value,
      v: version.value,
      ts: Date.now(),
    };
    const compressed = btoa(JSON.stringify(data));
    return `tx:${compressed}`;
  } catch (e) {
    console.error("Failed to generate share code:", e);
    return "tx:";
  }
});

const shareCodeLength = computed(() => shareCode.value.length);
const shareUrl = computed(() => {
  if (!shareCode.value || shareCode.value === "tx:") return "";
  return `${window.location.origin}${window.location.pathname
    }?tx=${encodeURIComponent(shareCode.value.slice(3))}`;
});
const canWebShare = computed(() => {
  const nav: any = navigator;
  return !!nav?.share || !!nav?.canShare;
});

// Date presets
const datePresets = [
  { label: "All Time", start: "", end: "" },
  {
    label: "Last 30d",
    start: toLocalISO(new Date(new Date().setDate(new Date().getDate() - 29))),
    end: todayLocalISO(),
  },
  {
    label: "This Month",
    start: toLocalISO(
      new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    ),
    end: todayLocalISO(),
  },
  {
    label: "This Year",
    start: `${new Date().getFullYear()}-01-01`,
    end: todayLocalISO(),
  },
];
function applyDatePreset(p: { label: string; start: string; end: string }) {
  selectedDatePreset.value = p.label;
  dateFilter.value.start = p.start;
  dateFilter.value.end = p.end;
}
function resetDateFilter() {
  selectedDatePreset.value = "All Time";
  dateFilter.value = { start: "", end: "" };
}
function formatDateRange() {
  const { start, end } = dateFilter.value;
  if (!start && !end) return "All Time";
  if (start && !end) return `${formatDate(start)} → …`;
  if (!start && end) return `… → ${formatDate(end)}`;
  return `${formatDate(start)} → ${formatDate(end)}`;
}

// ========== METHODS ==========
// Toast functions
function pushToast(message: string, kind: ToastKind = "info", ms = 3500) {
  const id = toastId;
  toasts.value.push({ id, message, kind });
  if (ms > 0) setTimeout(() => dismissToast(id), ms);
}

function dismissToast(id: number) {
  toasts.value = toasts.value.filter((t) => t.id !== id);
}

// Theme functions
function setTheme(theme: string) {
  currentTheme.value = theme;
  localStorage.setItem(LS_KEYS.theme, theme);
  document.documentElement.setAttribute("data-theme", theme);
}

// Tab navigation
function onTab(id: typeof activeTab.value) {
  activeTab.value = id;
}

// Date input handlers
function onAddDateInput(e: Event) {
  newTxDateError.value = "";

  // Preserve cursor position before formatting
  const input = e.target as HTMLInputElement;
  let cursorPos = input.selectionStart;
  const oldValue = input.value;
  const formattedValue = formatDDMMProgressive(input.value);

  // Calculate where the cursor should move after formatting
  // Count dashes added - each dash shifts cursor right by 1
  const newDashes = (formattedValue.match(/-/g) || []).length;
  const oldDashes = (oldValue.match(/-/g) || []).length;
  const dashChange = newDashes - oldDashes;

  // If we added dashes, move cursor accordingly
  // If user typed at position X and we inserted N dashes before that position,
  // cursor should be at X + N
  let newCursorPos = cursorPos + dashChange;

  // Clamp to valid range
  if (newCursorPos > formattedValue.length) {
    newCursorPos = formattedValue.length;
  }
  if (newCursorPos < 0) {
    newCursorPos = 0;
  }

  // Update the value - use direct DOM update to avoid reactive re-render
  input.value = formattedValue;
  newTxDateText.value = formattedValue;

  // Restore cursor position immediately after setting value
  requestAnimationFrame(() => {
    if (addDateTextRef.value) {
      addDateTextRef.value.setSelectionRange(newCursorPos, newCursorPos);
      addDateTextRef.value.focus(); // Ensure focus is maintained
    }
  });
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
  // Keep the user's input but mark as invalid
  newTxDateError.value = "Please use dd-mm-yyyy (e.g. 05-01-2025).";
  addDateTextRef.value?.setCustomValidity?.(newTxDateError.value);
  addDateTextRef.value?.reportValidity?.();
}

function onDateKeydownDigitsOnly(e: KeyboardEvent) {
  const ok = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", "-"];
  if (ok.includes(e.key)) return;
  if (!/^\d$/.test(e.key)) e.preventDefault();
}

// =========  Tag Picker =========

// Refs used by the Tag Picker template
const tagPickerInputRef = ref<HTMLInputElement | null>(null);
const tagPickerScrollRef = ref<HTMLElement | null>(null);

// Open picker preselecting current tags
function openTagPicker() {
  tagPicker.q = "";
  tagPicker.visible = 120;
  tagPicker.selected = new Set<string>(newTransaction.tags || []);
  tagPicker.open = true;
  nextTick(() => tagPickerInputRef.value?.focus());
}
function closeTagPicker() {
  tagPicker.open = false;
}

// Filtered list  virtualized slice
const filteredTagList = computed<string[]>(() => {
  const q = (tagPicker.q || "").toLowerCase().trim();
  const list = sortAlpha(dedupeCI(tags.value));
  if (!q) return list;
  return list.filter((t) => t.toLowerCase().includes(q));
});
const tagSlice = computed<string[]>(() =>
  filteredTagList.value.slice(0, tagPicker.visible)
);

// Infinite scroll-ish load
function onTagScroll() {
  const el = tagPickerScrollRef.value;
  if (!el) return;
  const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 32;
  if (nearBottom && tagPicker.visible < filteredTagList.value.length) {
    tagPicker.visible += 120;
  }
}
watch(
  () => tagPicker.q,
  () => (tagPicker.visible += 120)
);
watch(
  () => tagPicker.open,
  (o) => {
    if (o) tagPicker.visible += 120;
  }
);

// Selection toggles
function toggleTagPick(name: string, checked: boolean) {
  if (checked) tagPicker.selected.add(name);
  else tagPicker.selected.delete(name);
}

// Create from query (adds to global tags  selects it)
function createTagFromQuery() {
  const name = norm(tagPicker.q);
  if (!name) return;
  if (!containsCaseIns(tags.value, name)) {
    tags.value = sortAlpha(dedupeCI([...tags.value, name]));
  }
  // Use canonical form from tags list
  const canonical = tags.value.find((x) => eqi(x, name)) || name;
  tagPicker.selected.add(canonical);
  tagPicker.q = "";
  // keep focus for quick adding multiples
  nextTick(() => tagPickerInputRef.value?.focus());
}

// Apply picked tags to the Add form
function applyPickedTags() {
  const chosen = Array.from(tagPicker.selected);
  newTransaction.tags = sortAlpha(dedupeCI(chosen));
  closeTagPicker();
  pushToast(
    `Applied ${chosen.length} tag${chosen.length === 1 ? "" : "s"}`,
    "success"
  );
}

// Tiny UX: if they click "Manage custom" we’ll focus the add field in the modal
watch(showManager, (open) => {
  if (!open) return;
  if (managerMode.value === "add") {
    nextTick(() => {
      const el = document.querySelector<HTMLInputElement>(
        '[data-testid="new-category-input"]'
      );
      el?.focus();
    });
  }
});

// Recurring transaction calculations
function computeRecurringEndDate(
  startISO: string,
  freq: RecurringFrequency,
  recursions: number
): string {
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

function addMonthsClamped(iso: string, months: number): string {
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

function addDays(iso: string, days: number): string {
  const dt = new Date(iso);
  dt.setDate(dt.getDate() + days);
  return toLocalISO(dt);
}

// Category combobox functions
function handleInput() {
  open.value = true;
  activeIndex.value = showCreateOption.value ? -1 : 0;
}

function moveActive(dir: 1 | -1) {
  const opts = filteredAllCategories.value.length;
  if (showCreateOption.value) {
    const order = [-1, ...Array.from({ length: opts }, (_, i) => i)];
    const cur = order.indexOf(activeIndex.value);
    const next = (cur + dir + order.length) % order.length;
    activeIndex.value = order[next];
  } else {
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

function rememberCategory(cat: string) {
  const list = dedupeCI([cat, ...recentCategories.value]).slice(0, 6);
  recentCategories.value = list;
  safeLocalStorageSet(LS_KEYS.recent, list);
  
  // Also store as last selected category for pre-fill
  safeLocalStorageSet("last-selected-category", cat);
  lastSelectedCategory.value = cat;
}

// Tag functions
function commitTagInput() {
  const bits = (tagInput.value || "")
    .split(/[,\s]/)
    .map((s) => s.trim())
    .filter(Boolean);
  bits.forEach((b) => addTagToTransaction(b));
  tagInput.value = "";
  openTagSuggest.value = false;
}

function addTagToTransaction(name: string) {
  const t = norm(String(name));
  if (!t) return;

  if (!containsCaseIns(tags.value, t)) {
    tags.value = sortAlpha(dedupeCI([...tags.value, t]));
  }

  const canonical = tags.value.find((x) => eqi(x, t)) || t;
  if (!newTransaction.tags.some((x) => eqi(x, canonical))) {
    newTransaction.tags = [...newTransaction.tags, canonical];
  }
}

function removeTagFromTransaction(name: string) {
  newTransaction.tags = newTransaction.tags.filter((t) => !eqi(t, name));
}

// Transaction CRUD operations
function addTransaction() {
  if (newTransaction.amount <= 0 || !newTransaction.category) return;

  // Compute end date if recurring is on (so both add  edit paths get it)
  const endISO = newTransaction.recurring
    ? computeRecurringEndDate(
      newTransaction.date,
      newTransaction.frequency || "monthly",
      Math.max(1, Number(newTransaction.recursions || 1))
    )
    : "";

  // ===== Edit path =====
  if (currentlyEditingId.value) {
    const idx = transactions.value.findIndex(
      (t) => t.id === currentlyEditingId.value
    );
    if (idx > -1) {
      const baseTx: Transaction = {
        ...newTransaction,
        id: currentlyEditingId.value, // keep same id for the “first/anchor” item
        endDate: endISO,
        source: newTransaction.source || "Manual",
      };

      if (newTransaction.recurring) {
        // Expand into a series and REPLACE the single edited row
        const series = generateRecurringTransactions(baseTx);
        // Replace 1 item with N items
        transactions.value.splice(idx, 1, ...series);
        pushToast(
          `Updated into ${series.length} recurring transactions`,
          "success"
        );
      } else {
        // Plain edit (non-recurring)
        transactions.value[idx] = baseTx;
        pushToast("Transaction updated", "success");
      }
    }

    currentlyEditingId.value = null;
    resetForm();
    return;
  }

  // ===== Add path =====
  const baseTx: Transaction = {
    ...newTransaction,
    id: `${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    source: newTransaction.source || "Manual",
    endDate: endISO,
  };

  if (newTransaction.recurring) {
    const series = generateRecurringTransactions(baseTx);
    transactions.value.push(...series);
    pushToast(`Added ${series.length} recurring transactions`, "success");
  } else {
    transactions.value.push(baseTx);
    pushToast("Transaction added", "success");
  }

  resetForm();
}

function resetForm() {
  // Load current defaults from localStorage
  let lastRecurring = { recurring: false, frequency: 'monthly', recursions: 1 };
  try {
    const raw = safeLocalStorageGet(LS_KEYS.recurringDefaults);
    if (raw && typeof raw === 'object') {
      lastRecurring = {
        recurring: typeof raw.recurring === 'boolean' ? raw.recurring : false,
        frequency: raw.frequency || 'monthly',
        recursions: typeof raw.recursions === 'number' ? raw.recursions : 1
      };
    }
  } catch (e) {
    console.warn('Failed to load recurring defaults for reset:', e);
  }

  Object.assign(newTransaction, {
    id: "",
    date: todayLocalISO(),
    type: "spending",
    amount: 0,
    category: lastSelectedCategory.value || "",
    tags: [],
    description: "",
    recurring: lastRecurring.recurring,
    frequency: lastRecurring.frequency,
    recursions: lastRecurring.recursions,
    endDate: "",
  });
  currentlyEditingId.value = null;
}

function editTransaction(t: Transaction) {
  Object.assign(newTransaction, t);
  currentlyEditingId.value = t.id;
  activeTab.value = "add";
  scrollAddIntoView();
  focusAmount();
  
  // Remember category for pre-fill when editing
  if (t.category) rememberCategory(t.category);
}

function deleteTransaction(id: string) {
  if (confirm("Delete this transaction?")) {
    const i = transactions.value.findIndex((t) => t.id === id);
    if (i > -1) transactions.value.splice(i, 1);
    pushToast("Transaction deleted", "success");
  }
}

function duplicateTx(t: Transaction) {
  const copy: Transaction = {
    ...t,
    id: `${Date.now()}-${Math.floor(Math.random() * 10000)}`,
  };
  transactions.value.push(copy);
  pushToast("Transaction duplicated", "success");
}

function clearAllTransactions() {
  if (!transactions.value.length) {
    alert("Nothing to remove.");
    return;
  }
  if (
    confirm(
      `Remove ALL ${transactions.value.length} transactions? This cannot be undone.`
    )
  ) {
    transactions.value = [];
    localStorage.removeItem(LS_KEYS.tx); // was a hard-coded string
    pushToast("All transactions removed", "success");
  }
}

function generateRecurringTransactions(baseTx: Transaction): Transaction[] {
  const series: Transaction[] = [];
  const n = Math.max(1, Number(baseTx.recursions || 1));

  for (let i = 0; i < n; i++) {
    const occurrenceDate =
      i === 0
        ? baseTx.date
        : calculateNextOccurrenceDate(
          baseTx.date,
          baseTx.frequency || "monthly",
          i
        );

    series.push({
      ...baseTx,
      id: `${Date.now()}-${Math.floor(Math.random() * 10000)}-${i}`,
      date: occurrenceDate,
      // only the first (anchor) item carries recurring meta
      recurring: i === 0 ? baseTx.recurring : false,
      recursions: i === 0 ? baseTx.recursions : 1,
      endDate: i === 0 ? baseTx.endDate : "",
    });
  }

  return series;
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

// Transaction selection
function isSelected(id: string): boolean {
  return selectedIds.value.has(id);
}

function toggleSelectRow(id: string) {
  const s = new Set(selectedIds.value);
  if (s.has(id)) s.delete(id);
  else s.add(id);
  selectedIds.value = s;
}

function clearSelection() {
  selectedIds.value = new Set();
}

function toggleSelectAll() {
  const s = new Set(selectedIds.value);
  if (allSelected.value) {
    for (const t of paginatedTransactions.value) s.delete(t.id);
  } else {
    for (const t of paginatedTransactions.value) s.add(t.id);
  }
  selectedIds.value = s;
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

// Sorting
function updateSort(field: "date" | "type" | "amount" | "category") {
  if (sortField.value === field)
    sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
  else {
    sortField.value = field;
    sortOrder.value = "desc";
  }
  currentPage.value = 1;
}

function getSortIcon(field: "date" | "type" | "amount" | "category"): string {
  if (sortField.value !== field) return "↕️";
  return sortOrder.value === "asc" ? "↑" : "↓";
}

// Smart selection
function selectByTypeAndClose(
  type: TransactionType,
  scope: "page" | "all",
  ev?: Event
) {
  const s = new Set(selectedIds.value);
  const src =
    scope === "page" ? paginatedTransactions.value : filteredTransactions.value;
  for (const t of src) if (t.type === type) s.add(t.id);
  selectedIds.value = s;

  if (ev) {
    ev.preventDefault();
    const details = (ev.target as HTMLElement).closest("details");
    if (details) details.removeAttribute("open");
  }
}

function selectLarge() {
  const scopeList = largeSelect.value.pageOnly
    ? paginatedTransactions.value
    : filteredTransactions.value;
  const threshold = Number(largeSelect.value.threshold || 50);

  const s = new Set(selectedIds.value);
  let added = 0;

  for (const t of scopeList) {
    if (t.type === "spending" && t.amount >= threshold) {
      if (!s.has(t.id)) {
        s.add(t.id);
        added++;
      }
    }
  }

  if (!added) {
    alert("No large transactions found for current settings.");
    return;
  }

  selectedIds.value = s;
  prioritizeSelected.value = true;
  pushToast(
    `Selected ${added} transaction${added === 1 ? "" : "s"} ≥ ${currencyFmt(
      threshold
    )}`,
    "success"
  );
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
  selectedIds.value = s;
  openSmartSelect.value = false;
}

function selectSimilar() {
  if (selectedIds.value.size === 0) {
    pushToast("Select at least one transaction first", "info");
    return;
  }

  const firstId = Array.from(selectedIds.value)[0];
  const base = filteredTransactions.value.find((t) => t.id === firstId);
  if (!base) {
    pushToast("No transaction found", "error");
    return;
  }

  const targetDesc = normDesc(base.description);
  const s = new Set(selectedIds.value);
  let added = 0;

  for (const t of filteredTransactions.value) {
    if (normDesc(t.description) === targetDesc) {
      if (!s.has(t.id)) {
        s.add(t.id);
        added++;
      }
    }
  }

  if (!added) {
    pushToast("No similar transactions found", "info");
    return;
  }

  selectedIds.value = s;
  prioritizeSelected.value = true;
  pushToast(
    `Selected ${added} similar transaction${added === 1 ? "" : "s"}`,
    "success"
  );
}

function normDesc(s: string) {
  return (s || "")
    .toLowerCase()
    .replace(/\d+/g, "") // strip all numbers
    .replace(/\s+/g, " ") // collapse whitespace
    .trim();
}

// Bulk edit
const suggestedKeyword = computed(() => {
  // Simplified keyword suggestion
  if (selectedTransactions.value.length === 0) return "";
  const firstTx = selectedTransactions.value[0];
  return firstTx.description.split(" ").find((word) => word.length > 3) || "";
});

function openBulkEdit() {
  if (selectedCount.value === 0) {
    pushToast("Select at least one transaction first", "warning");
    return;
  }
  bulkEdit.open = true;
}

function applyBulkEdit() {
  if (selectedCount.value === 0) return;
  const ids = selectedIds.value;
  const shift = Number(bulkEdit.shiftDays || 0);

  transactions.value = transactions.value.map((t) => {
    if (!ids.has(t.id)) return t;

    let desc = t.description || "";

    // Apply description modifications
    if (bulkEdit.descMode === "replace") {
      desc = bulkEdit.descText;
    } else if (bulkEdit.descMode === "prepend" && bulkEdit.descText) {
      desc = bulkEdit.descText + desc;
    } else if (bulkEdit.descMode === "append" && bulkEdit.descText) {
      desc = desc + bulkEdit.descText;
    }

    // Apply find/replace
    if (bulkEdit.findText) {
      const flags = bulkEdit.replaceAll ? "gi" : "i";
      const regex = new RegExp(bulkEdit.findText, flags);
      desc = desc.replace(regex, bulkEdit.replaceWith || "");
    }

    // Apply cleanup
    if (bulkEdit.trimWhitespace) desc = desc.trim();
    if (bulkEdit.collapseSpaces) desc = desc.replace(/\s+/g, " ");
    if (bulkEdit.titleCase) {
      desc = desc.replace(/\b\w/g, (l) => l.toUpperCase());
    }

    // Apply date shift
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

  bulkEdit.open = false;
  pushToast("Bulk changes applied", "success");
}

// Chart functions
// function applyDatePreset(preset: any) {
//   selectedDatePreset.value = preset.label;
//   const today = new Date();
//   switch (preset.type) {
//     case "month":
//       dateFilter.value.start = toLocalISO(
//         new Date(today.getFullYear(), today.getMonth(), 1)
//       );
//       dateFilter.value.end = toLocalISO(
//         new Date(today.getFullYear(), today.getMonth() + 1, 0)
//       );
//       break;
//     case "lastMonth":
//       dateFilter.value.start = toLocalISO(
//         new Date(today.getFullYear(), today.getMonth() - 1, 1)
//       );
//       dateFilter.value.end = toLocalISO(
//         new Date(today.getFullYear(), today.getMonth(), 0)
//       );
//       break;
//     case "year":
//       dateFilter.value.start = toLocalISO(new Date(today.getFullYear(), 0, 1));
//       dateFilter.value.end = toLocalISO(new Date(today.getFullYear(), 11, 31));
//       break;
//     case "lastYear":
//       dateFilter.value.start = toLocalISO(
//         new Date(today.getFullYear() - 1, 0, 1)
//       );
//       dateFilter.value.end = toLocalISO(
//         new Date(today.getFullYear() - 1, 11, 31)
//       );
//       break;
//     case "all":
//       dateFilter.value.start = "";
//       dateFilter.value.end = "";
//       break;
//     default:
//       const start = new Date(today.getTime() - preset.days * 86400000);
//       dateFilter.value.start = toLocalISO(start);
//       dateFilter.value.end = toLocalISO(today);
//   }
// }

// function resetDateFilter() {
//   dateFilter.value = { start: "", end: "" };
//   selectedDatePreset.value = "All Time";
// }

// function formatDateRange() {
//   if (!dateFilter.value.start || !dateFilter.value.end) return "All time";
//   const s = new Date(dateFilter.value.start),
//     e = new Date(dateFilter.value.end);
//   const diff = Math.ceil(Math.abs(e - s) / 86400000);
//   return `${formatDate(dateFilter.value.start)} - ${formatDate(
//     dateFilter.value.end
//   )} (${diff} days)`;
// }

function toggleCategory(cat: string) {
  const i = selectedCategories.value.findIndex((c) => eqi(c, cat));
  if (i >= 0) selectedCategories.value.splice(i, 1);
  else selectedCategories.value.push(cat);
  selectedCategories.value = sortAlpha(dedupeCI(selectedCategories.value));
}
function selectAllCategories() {
  selectedCategories.value = chartCategories.value.slice();
}
function unselectAllCategories() {
  selectedCategories.value = [];
}

// Chart tag selection helpers
function toggleTagForChart(tag: string) {
  const i = selectedTagsChart.value.findIndex((t) => eqi(t, tag));
  if (i >= 0) selectedTagsChart.value.splice(i, 1);
  else selectedTagsChart.value.push(tag);
  selectedTagsChart.value = sortAlpha(dedupeCI(selectedTagsChart.value));
}

function selectAllTagsForChart() {
  selectedTagsChart.value = chartTags.value.slice();
}

function unselectAllTagsForChart() {
  selectedTagsChart.value = [];
}

// Chart category selection helpers (similar to toggleTagForChart)
function toggleCategoryForChart(cat: string) {
  const i = selectedCategoriesChart.value.findIndex((c) => eqi(c, cat));
  if (i >= 0) selectedCategoriesChart.value.splice(i, 1);
  else selectedCategoriesChart.value.push(cat);
  // Sort alphabetically without duplicate issues
  selectedCategoriesChart.value = sortAlpha(selectedCategoriesChart.value);
}

function selectAllCategoriesChart() {
  selectedCategoriesChart.value = chartCategories.value.slice();
}

function unselectAllCategoriesChart() {
  selectedCategoriesChart.value = [];
}

function ensureAllCatsSelected() {
  if (selectedCategoriesChart.value.length === 0 && chartCategories.value.length) {
    selectedCategoriesChart.value = [...chartCategories.value];
  }
}

// Initialize tag selection when switching to chart tab
onMounted(() => {
  ensureAllCatsSelected();

  // Auto-select all categories/tags on first visit if none selected
  if (selectedCategoriesChart.value.length === 0 && chartCategories.value.length > 0) {
    selectedCategoriesChart.value = [...chartCategories.value];
  }
  if (selectedTagsChart.value.length === 0 && chartTags.value.length > 0) {
    selectedTagsChart.value = [...chartTags.value];
  }
});

// Auto-select newly created categories/tags when they're added
watch([chartCategories, chartTags], ([newCats, newTags]) => {
  // Auto-select newly created categories that aren't already selected
  const currentCats = new Set(selectedCategoriesChart.value);
  const newCatsAdded: string[] = [];
  newCats.forEach(cat => {
    if (!currentCats.has(cat)) {
      selectedCategoriesChart.value.push(cat);
      newCatsAdded.push(cat);
    }
  });

  // Auto-select newly created tags that aren't already selected
  const currentTags = new Set(selectedTagsChart.value);
  const newTagsAdded: string[] = [];
  newTags.forEach(tag => {
    if (!currentTags.has(tag)) {
      selectedTagsChart.value.push(tag);
      newTagsAdded.push(tag);
    }
  });

  // Only re-sort if we actually added something
  if (newCatsAdded.length > 0) {
    selectedCategoriesChart.value = sortAlpha(selectedCategoriesChart.value);
  }
  if (newTagsAdded.length > 0) {
    selectedTagsChart.value = sortAlpha(selectedTagsChart.value);
  }
});

// watch(
//   () => chartConfig.value.groupBy,
//   async () => {
//     if (activeTab.value !== "chart") return;
//     await nextTick();
//     updateChart();
//   }
// );

// watch(
//   () => chartConfig.value.type,
//   async () => {
//     if (activeTab.value !== "chart") return;
//     await nextTick();
//     updateChart();
//   }
// );

// Import/Export functions
async function readFileAsText(file: File): Promise<string> {
  return await new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onerror = () => reject(r.error);
    r.onload = () => resolve(String(r.result || ""));
    r.readAsText(file);
  });
}

function handleFileUpload(e: Event) {
  const input = e.target as HTMLInputElement;
  const files = Array.from(input.files || []);
  if (!files.length) return;

  importStatus.value = `Reading ${files.length} file${files.length > 1 ? "s" : ""
    }…`;
  importError.value = false;

  // Queue all files (we parse sequentially for better UX)
  (async () => {
    for (const f of files) {
      try {
        const text = await f.text();
        const rows = parseCSV(text);
        if (!rows.length) continue;

        const headers = rows[0];
        const dataRows = rows
          .slice(1)
          .filter((r) => r.some((c) => c?.trim?.()));
        // const cols = inferColumns(headers);

        const cols = inferColumns(headers);

        // ── Scan for amount convention (only for single-amount banks) ──
        if (cols.amount != null && cols.debit == null && cols.credit == null
          && cols.mobileId == null && cols.desktopId == null) {
          cols.amountConvention = scanAmountConvention(dataRows, cols.amount);
          dbg("Amount convention:", cols.amountConvention);
        }

        // ── Headerless CSV detection ──
        // If the "header" row looks like data (starts with a digit, has 3+ cols),
        // treat it as data too
        const headerLooksLikeData = /^\d/.test((headers[0] || "").trim()) && headers.length >= 3;
        if (headerLooksLikeData) {
          dbg("Header row looks like data — including it");
          dataRows.unshift(headers);
        }
        // Build a source label placeholder; user can rename in modal
        const fallbackLabel = f.name.replace(/\.[^.]+$/, "");

        // Debug summary for this file
        dbgg(`IMPORT: ${f.name}`);
        dbg("rows total:", rows.length);
        dbg("header:", headers);
        dbg("data sample:", sample(dataRows, 3));
        dbg("column picks (preview):", {
          dateCol: cols.date,
          amountCol: cols.amount,
          debitCol: cols.debit,
          creditCol: cols.credit,
          dirCol: cols.drcr,
          currencyCol: cols.currency,
          descCols: cols.desc,
          dateHeader: headers[cols.date],
          amountHeader: cols.amount != null ? headers[cols.amount] : null,
          dirHeader: cols.drcr != null ? headers[cols.drcr] : null,
          currencyHeader: cols.currency != null ? headers[cols.currency] : null,
          descHeaders: cols.desc.map((i) => headers[i]),
        });

        const txs: Transaction[] = [];
        for (let i = 0; i < dataRows.length; i++) {
          const r = dataRows[i];
          dbg(`row #${i + 1}/${dataRows.length}`);
          const t = rowToTransaction(r, cols, fallbackLabel);
          if (t) txs.push(t);
        }
        dbg("kept transactions:", txs.length, "of", dataRows.length);
        dbgge();

        importQueue.value.push({ file: f, rows: txs, filename: f.name });
        pushToast(
          `Parsed ${f.name}: kept ${txs.length}/${dataRows.length} transactions (see console)`,
          txs.length ? "success" : "warning"
        );
      } catch (err) {
        console.error("Failed to parse file:", err);
        pushToast(`Failed to parse ${f.name}`, "error");
      }
    }
    importStatus.value = "";
    // kick off modal for first job
    if (!importingNow) prepareNextImport();
    // reset file input to allow re-selecting the same files later
    csvInputRef.value && (csvInputRef.value.value = "");
  })();
}

// Present next file in the label modal
function prepareNextImport() {
  const job = importQueue.value.shift();
  if (!job) {
    importingNow = false;
    return;
  }
  importingNow = true;

  // De-dupe against existing BEFORE showing counts
  const existingKeys = new Set(transactions.value.map((t) => stableKey(t)));
  const unique = job.rows.filter((t) => !existingKeys.has(stableKey(t)));

  labelImport.open = true;
  labelImport.filename = job.filename;
  labelImport.label = job.file.name.replace(/\.[^.]+$/, "");
  labelImport.note = "";
  labelImport.imported = unique;
  labelImport.tagsSelected = [];
  labelImport.tagsQuery = "";
}

// Keep your existing cancel/close but ensure they continue the queue
function cancelLabelImport() {
  labelImport.open = false;
  // skip current and go to next
  nextTick(() => prepareNextImport());
}

// Apply modal settings and merge
function confirmLabelImport() {
  const src = labelImport.label.trim() || "Imported";
  const extraTags = [...labelImport.tagsSelected];

  const withMeta = labelImport.imported.map((t) => {
    const mergedTags = sortAlpha(dedupeCI([...(t.tags || []), ...extraTags]));
    return { ...t, source: src, tags: mergedTags };
  });

  // Merge (defensive de-dupe again across the new list)
  const existingKeys = new Set(transactions.value.map((t) => stableKey(t)));
  const added: Transaction[] = [];
  for (const t of withMeta) {
    const k = stableKey(t);
    if (!existingKeys.has(k)) {
      existingKeys.add(k);
      added.push(t);
    }
  }
  if (added.length) {
    transactions.value = sortByDateDesc([...transactions.value, ...added]);
    safeLocalStorageSet(LS_KEYS.tx, transactions.value);
  }

  lastImportSummary.value = `Imported ${added.length}/${labelImport.imported.length} new transactions from "${labelImport.filename}".`;
  pushToast(lastImportSummary.value, "success");

  // Close current modal and continue the queue
  labelImport.open = false;
  nextTick(() => prepareNextImport());
}

// Small helper
function sortByDateDesc(arr: Transaction[]): Transaction[] {
  return [...arr].sort((a, b) =>
    a.date < b.date ? 1 : a.date > b.date ? -1 : 0
  );
}

function importFromUrlOrCode() {
  const input = importUrl.value.trim();
  if (!input) {
    pushToast("Please enter a URL or share code", "warning");
    return;
  }

  try {
    let code = input;
    if (input.startsWith("http")) {
      const url = new URL(input);
      code = url.searchParams.get("tx") || input;
    }
    if (code.startsWith("tx:")) {
      code = code.slice(3);
    }
    code = code.replace(/-/g, "+").replace(/_/g, "/");
    while (code.length % 4) code += "=";

    const decoded = atob(code);
    const data = JSON.parse(decoded);

    if (data && Array.isArray(data.t)) {
      const importedTransactions = data.t.map(normalizeTransaction);
      openLabelImportModal(importedTransactions, "Share Import");
      importUrl.value = "";
      pushToast(
        `Ready to import ${importedTransactions.length} transactions`,
        "success"
      );
    } else {
      throw new Error("Invalid share code format");
    }
  } catch (error) {
    console.error("Import error:", error);
    pushToast("Failed to import from URL/share code", "error");
  }
}

async function importFromClipboard() {
  try {
    const text = await navigator.clipboard.readText();
    if (!text.trim()) {
      pushToast("Clipboard is empty", "warning");
      return;
    }

    // Try to parse as share code
    if (text.startsWith("tx:")) {
      const code = text.slice(3);
      const decoded = atob(code);
      const data = JSON.parse(decoded);
      if (data && Array.isArray(data.t)) {
        const imported = data.t.map(normalizeTransaction);
        openLabelImportModal(imported, "Clipboard Import");
        pushToast(
          `Ready to import ${imported.length} transactions from clipboard`,
          "success"
        );
        return;
      }
    }

    pushToast("No valid share code found in clipboard", "warning");
  } catch (error) {
    console.error("Clipboard import error:", error);
    pushToast("Failed to read from clipboard", "error");
  }
}

function handleJsonImport(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const content = e.target?.result as string;
      const data = JSON.parse(content);

      let imported: Transaction[] = [];
      if (Array.isArray(data)) {
        imported = data.map(normalizeTransaction);
      } else if (Array.isArray(data.transactions)) {
        imported = data.transactions.map(normalizeTransaction);
      } else {
        throw new Error("Invalid JSON format");
      }

      if (imported.length > 0) {
        openLabelImportModal(imported, file.name);
        pushToast(
          `Ready to import ${imported.length} transactions from JSON`,
          "success"
        );
      } else {
        pushToast("No valid transactions found in JSON file", "warning");
      }
    } catch (error) {
      console.error("JSON import error:", error);
      pushToast("Failed to parse JSON file", "error");
    }
  };
  reader.readAsText(file);
  input.value = "";
}

function downloadJson() {
  if (transactions.value.length === 0) {
    pushToast("No transactions to export", "warning");
    return;
  }

  try {
    const data = {
      transactions: transactions.value,
      exportDate: new Date().toISOString(),
      version: version.value,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `financial-tracker-export-${new Date().toISOString().split("T")[0]
      }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    pushToast(
      `Exported ${transactions.value.length} transactions to JSON`,
      "success"
    );
  } catch (error) {
    console.error("JSON export error:", error);
    pushToast("Failed to export JSON", "error");
  }
}

// ========= Smart Web Share with file fallback & copy backup =========
function buildExportBlob(): Blob {
  const data = {
    transactions: transactions.value,
    exportDate: new Date().toISOString(),
    version: version.value,
  };
  return new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
}
function exportFilename(): string {
  const d = new Date().toISOString().split("T")[0];
  return `financial-tracker-export-${d}.json`;
}
async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    pushToast("Copied to clipboard", "success");
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    pushToast("Copied to clipboard", "success");
  }
}

async function webShare(shareUrl: string) {
  const nav: any = navigator;

  // Guard: nothing to share
  if (!shareCode.value || shareCode.value === "tx:") {
    pushToast("Nothing to share yet", "warning");
    return;
  }

  // Web Share requires secure context (https, localhost). If not, fall back.
  const secureOk =
    window.isSecureContext === true ||
    location.hostname === "localhost" ||
    location.hostname === "127.0.0.1";
  if (!secureOk) {
    // Fallback: copy share link (or share code if no link)
    if (shareUrl) {
      await copyToClipboard(shareUrl);
      pushToast("Link copied (sharing requires HTTPS)", "info");
    } else {
      await copyToClipboard(shareCode.value);
      pushToast("Share code copied (sharing requires HTTPS)", "info");
    }
    return;
  }

  // Decide payload: short link → share URL; long payload → share JSON file if possible
  const tooLong = shareCodeLength.value > SHARE_URL_SAFE_LIMIT; // you already expose this
  const blob = buildExportBlob();
  const file = new File([blob], exportFilename(), { type: "application/json" });

  try {
    // Prefer sharing a file when link is too long and Level 2 is supported
    if (
      tooLong &&
      typeof nav.canShare === "function" &&
      nav.canShare({ files: [file] })
    ) {
      await nav.share({
        title: "My Financial Data",
        text: "Transactions export (JSON)",
        files: [file],
      });
      pushToast("Shared JSON export via device", "success");
      return;
    }

    // Otherwise share the URL (if present and share() exists)
    if (shareUrl && typeof nav.share === "function") {
      await nav.share({
        title: "My Financial Data",
        text: "Open this link to load my transactions",
        url: shareUrl,
      });
      pushToast("Shared link via device", "success");
      return;
    }

    // Fallback: share plain text (compact code), then final fallback to copy
    if (typeof nav.share === "function") {
      await nav.share({
        title: "My Financial Data",
        text: shareCode.value,
      });
      pushToast("Shared code via device", "success");
      return;
    }

    // Final fallback: copy link or code
    if (shareUrl) {
      await copyToClipboard(shareUrl);
      pushToast("Link copied to clipboard", "info");
    } else {
      await copyToClipboard(shareCode.value);
      pushToast("Share code copied to clipboard", "info");
    }
  } catch (error: any) {
    if (error?.name === "AbortError") return; // user canceled
    console.error("Web share error:", error);

    // On error, offer download as a robust fallback for very large datasets
    if (tooLong) {
      // Trigger a download immediately to make it useful
      try {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = exportFilename();
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        pushToast("Downloaded JSON export as fallback", "success");
        return;
      } catch (e) {
        console.error("Download fallback failed:", e);
      }
    }

    // Last resort: copy to clipboard
    await copyToClipboard(shareUrl || shareCode.value);
    pushToast("Copied to clipboard as fallback", "warning");
  }
}

function copy(text: string) {
  if (!text || text === "tx:") {
    pushToast("Nothing to copy", "warning");
    return;
  }

  navigator.clipboard
    .writeText(text)
    .then(() => {
      pushToast("Copied to clipboard", "success");
    })
    .catch(() => {
      // Fallback
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      pushToast("Copied to clipboard", "success");
    });
}

function normalizeTransaction(raw: any): Transaction {
  return {
    id: String(raw?.id ?? `${Date.now()}-${Math.floor(Math.random() * 10000)}`),
    date: parseDateGuess(String(raw?.date ?? "")) || todayLocalISO(),
    type: raw?.type === "income" ? "income" : "spending",
    amount: Math.abs(Number(raw?.amount ?? 0)),
    category: String(raw?.category ?? "Uncategorized"),
    tags: Array.isArray(raw?.tags) ? raw.tags : [],
    description: String(raw?.description ?? ""),
    recurring: !!raw?.recurring,
    frequency: raw?.frequency || "monthly",
    recursions: Math.max(1, Number(raw?.recursions ?? 1)),
    endDate: String(raw?.endDate ?? ""),
    source: String(raw?.source ?? DEFAULT_SOURCE),
  };
}

// // Modal management
function removeTagFromSelection(tag: string) {
  selectedTags.value = selectedTags.value.filter((t) => !eqi(t, tag));
}

function openLabelImportModal(
  importedTransactions: Transaction[],
  filename: string
) {
  labelImport.imported = importedTransactions;
  labelImport.filename = filename;
  labelImport.label = `Import from ${filename} - ${new Date().toLocaleDateString()}`;
  labelImport.note = "";
  labelImport.open = true;
}

watch(transactions, (v) => safeLocalStorageSet(LS_KEYS.tx, v), { deep: true });

// Onboarding functions
function startImportFromOnboarding() {
  showTour.value = false;
  activeTab.value = "import";
  pushToast("Select a file or paste data to import", "info");
}

function startManualAdd() {
  showTour.value = false;
  activeTab.value = "add";
  pushToast("Start adding your transactions", "info");
}

function confirmDemo() {
  onboardingStep.value = 1;
}

type Template = {
  type: TransactionType;
  category: string;
  descriptions: string[];
  min: number;
  max: number;
  tags: string[];
  recurring?: boolean;
  frequency?: Frequency;
  weight?: number;
};

const DEMO_TEMPLATES: Template[] = [
  // Income
  {
    type: "income",
    category: "Income",
    descriptions: ["Monthly Salary", "Freelance Web Fix", "Freelance UI Tweak", "Bonus Payment"],
    min: 250,
    max: 4200,
    tags: ["income", "work"],
    weight: 10,
  },
  {
    type: "income",
    category: "Investment Income",
    descriptions: ["ETF Dividend", "Savings Interest", "Distribution Payment"],
    min: 3,
    max: 180,
    tags: ["income", "investment", "etf"],
    weight: 4,
  },
  {
    type: "income",
    category: "Refunds",
    descriptions: ["Amazon Return", "Store Refund", "Order Refund"],
    min: 10,
    max: 120,
    tags: ["income", "refund", "shopping"],
    weight: 2,
  },
  {
    type: "income",
    category: "Cashback",
    descriptions: ["Credit Card Cashback", "Rewards Cashback"],
    min: 5,
    max: 40,
    tags: ["income", "cashback", "card"],
    weight: 2,
  },

  // Housing / bills
  {
    type: "spending",
    category: "Rent & Mortgage",
    descriptions: ["Monthly Rent", "Mortgage Repayment"],
    min: 1600,
    max: 2400,
    tags: ["housing", "rent", "monthly"],
    recurring: true,
    frequency: "monthly",
    weight: 8,
  },
  {
    type: "spending",
    category: "Bills & Services",
    descriptions: ["Electricity Bill", "Water Bill", "Gas Bill"],
    min: 60,
    max: 220,
    tags: ["utilities", "bills"],
    recurring: true,
    frequency: "quarterly",
    weight: 5,
  },
  {
    type: "spending",
    category: "Internet & Phone",
    descriptions: ["NBN + Mobile Bundle", "Phone Plan", "Internet Bill"],
    min: 45,
    max: 120,
    tags: ["utilities", "internet", "mobile"],
    recurring: true,
    frequency: "monthly",
    weight: 5,
  },
  {
    type: "spending",
    category: "Insurance",
    descriptions: ["Car Insurance", "Health Insurance", "Contents Insurance"],
    min: 70,
    max: 240,
    tags: ["insurance"],
    recurring: true,
    frequency: "monthly",
    weight: 5,
  },

  // Day-to-day
  {
    type: "spending",
    category: "Grocery",
    descriptions: ["Woolworths Shop", "Coles Shop", "ALDI Shop", "IGA Shop"],
    min: 25,
    max: 180,
    tags: ["grocery", "supermarket", "household"],
    weight: 10,
  },
  {
    type: "spending",
    category: "Cafes & Coffees",
    descriptions: ["Local Cafe", "Flat White", "Espresso", "Coffee Run"],
    min: 4,
    max: 18,
    tags: ["coffee", "food"],
    weight: 6,
  },
  {
    type: "spending",
    category: "Restaurant & Takeaway",
    descriptions: ["Restaurant Dinner", "Thai Dinner", "Pizza Place", "Uber Eats"],
    min: 15,
    max: 95,
    tags: ["dining", "takeaway"],
    weight: 6,
  },
  {
    type: "spending",
    category: "Entertainment",
    descriptions: ["Cinema Tickets", "Streaming Rental", "Event Tickets"],
    min: 12,
    max: 80,
    tags: ["entertainment"],
    weight: 4,
  },

  // Transport
  {
    type: "spending",
    category: "Transport & Parking",
    descriptions: ["MyWay Top-Up", "Parking", "Train Fare", "Bus Top-Up"],
    min: 8,
    max: 40,
    tags: ["transport"],
    weight: 5,
  },
  {
    type: "spending",
    category: "Fuel",
    descriptions: ["BP Fuel", "Shell Fuel", "Caltex Fuel"],
    min: 45,
    max: 120,
    tags: ["fuel", "car", "transport"],
    weight: 5,
  },
  {
    type: "spending",
    category: "Vehicle Expenses",
    descriptions: ["Car Service", "Tyre Replacement", "Registration Renewal"],
    min: 120,
    max: 850,
    tags: ["car", "maintenance"],
    weight: 3,
  },

  // Other
  {
    type: "spending",
    category: "Subscriptions",
    descriptions: ["Netflix", "Spotify", "YouTube Premium", "Cloud Storage"],
    min: 9,
    max: 35,
    tags: ["subscription", "recurring"],
    recurring: true,
    frequency: "monthly",
    weight: 5,
  },
  {
    type: "spending",
    category: "Home Stuff",
    descriptions: ["New Fridge", "Desk Lamp", "Kitchen Appliance", "Storage Boxes"],
    min: 20,
    max: 1500,
    tags: ["home"],
    weight: 3,
  },
  {
    type: "spending",
    category: "Flights",
    descriptions: ["Return Flights", "Domestic Flight", "Holiday Flight"],
    min: 120,
    max: 900,
    tags: ["travel", "airfare"],
    weight: 2,
  },
  {
    type: "spending",
    category: "Accommodation",
    descriptions: ["Hotel Stay", "Airbnb", "Weekend Stay"],
    min: 100,
    max: 650,
    tags: ["travel", "hotel"],
    weight: 2,
  },
  {
    type: "spending",
    category: "BNPL",
    descriptions: ["Headphones (Afterpay)", "Phone Case (Zip)", "Shoes (Klarna)"],
    min: 40,
    max: 180,
    tags: ["bnpl", "installment"],
    weight: 3,
  },
  {
    type: "spending",
    category: "Education",
    descriptions: ["Tech Book", "Online Course", "Learning Subscription"],
    min: 15,
    max: 140,
    tags: ["education", "learning"],
    weight: 3,
  },
  {
    type: "spending",
    category: "Fees & Charges",
    descriptions: ["Monthly Account Fee", "Bank Fee", "Late Fee"],
    min: 2,
    max: 18,
    tags: ["bank", "fee"],
    recurring: true,
    frequency: "monthly",
    weight: 3,
  },
  {
    type: "spending",
    category: "Investment",
    descriptions: ["ETF Buy (DCA)", "Brokerage Purchase", "Index Fund Top-Up"],
    min: 100,
    max: 1200,
    tags: ["investment", "buy", "etf"],
    weight: 3,
  },
  {
    type: "spending",
    category: "Donations",
    descriptions: ["Holiday Gift", "Charity Donation", "Birthday Gift"],
    min: 10,
    max: 150,
    tags: ["gift", "donation"],
    weight: 2,
  },
];

function rand(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randInt(min: number, max: number): number {
  return Math.floor(rand(min, max + 1));
}

function pickOne<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function weightedPick<T extends { weight?: number }>(items: T[]): T {
  const total = items.reduce((sum, item) => sum + (item.weight ?? 1), 0);
  let r = Math.random() * total;

  for (const item of items) {
    r -= item.weight ?? 1;
    if (r <= 0) return item;
  }

  return items[items.length - 1];
}

// function formatDate(date: Date): string {
//   return date.toISOString().split("T")[0];
// }

function randomDateBetween(start: Date, end: Date): string {
  const time = rand(start.getTime(), end.getTime());
  return formatDate(new Date(time));
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

function uniqueTags(baseTags: string[], type: TransactionType, recurring?: boolean, frequency?: Frequency): string[] {
  const tags = [...baseTags, type];
  if (recurring) tags.push("recurring");
  if (frequency) tags.push(frequency);
  return [...new Set(tags)];
}

function generateRecurringSeries(
  template: Template,
  count: number,
  startDate: Date,
  endDate: Date,
  idStart: number
): Transaction[] {
  const out: Transaction[] = [];
  let current = new Date(startDate);
  let idCounter = idStart;

  while (current <= endDate && out.length < count) {
    const description = pickOne(template.descriptions);
    const amount = roundMoney(rand(template.min, template.max));

    out.push({
      id: `demo-${idCounter++}`,
      date: formatDate(current),
      type: template.type,
      amount,
      category: template.category,
      description,
      source: "Demo Data",
      recurring: true,
      frequency: template.frequency,
      tags: uniqueTags(template.tags, template.type, true, template.frequency),
    });

    switch (template.frequency) {
      case "weekly":
        current.setDate(current.getDate() + 7);
        break;
      case "fortnightly":
        current.setDate(current.getDate() + 14);
        break;
      case "monthly":
        current.setMonth(current.getMonth() + 1);
        break;
      case "quarterly":
        current.setMonth(current.getMonth() + 3);
        break;
      case "yearly":
        current.setFullYear(current.getFullYear() + 1);
        break;
      default:
        current.setMonth(current.getMonth() + 1);
    }
  }

  return out;
}


function isBnplCategory(category?: string): boolean {
  return eqi(category || "", "BNPL");
}

function stripInstallmentSuffix(text: string): string {
  return (text || "")
    .replace(/\s*\(\d+\s*\/\s*\d+\)\s*$/i, "")
    .trim();
}

function splitAmountIntoInstallments(total: number, count = 4): number[] {
  const totalCents = Math.round(Math.abs(total) * 100);
  const baseCents = Math.floor(totalCents / count);
  const remainder = totalCents - baseCents * count;

  return Array.from({ length: count }, (_, i) => {
    const cents = i === count - 1 ? baseCents + remainder : baseCents;
    return cents / 100;
  });
}

function generateBnplInstallmentSeries(baseTx: Transaction): Transaction[] {
  const installmentCount = 4;
  const startISO =
    /^\d{4}-\d{2}-\d{2}$/.test(baseTx.date) ? baseTx.date : todayLocalISO();

  const installments = splitAmountIntoInstallments(baseTx.amount, installmentCount);
  const baseDescription = stripInstallmentSuffix(baseTx.description || "BNPL Purchase");
  const baseTags = sortAlpha(
    dedupeCI([
      ...(baseTx.tags || []),
      "bnpl",
      "installment",
      "fortnightly",
    ])
  );

  return installments.map((amount, index) => ({
    ...baseTx,
    id: `${baseTx.id}-bnpl-${index + 1}`,
    date: addDays(startISO, index * 14),
    amount,
    category: "BNPL",
    description: `${baseDescription} (${index + 1}/${installmentCount})`,
    tags: sortAlpha(
      dedupeCI([...baseTags, `${index + 1}-of-${installmentCount}`])
    ),
    recurring: false,
    frequency: undefined,
    recursions: 1,
    endDate: "",
  }));
}

function generateRandomDemoData(options?: {
  total?: number;
  startDate?: string;
  endDate?: string;
  recurringRatio?: number;
}): Transaction[] {
  const total = options?.total ?? 100;
  const startDate = new Date(options?.startDate ?? "2023-10-01");
  const endDate = new Date(options?.endDate ?? "2024-12-31");
  const recurringRatio = options?.recurringRatio ?? 0.3;

  const recurringTemplates = DEMO_TEMPLATES.filter(t => t.recurring);
  const oneOffTemplates = DEMO_TEMPLATES.filter(t => !t.recurring);

  const transactions: Transaction[] = [];
  let idCounter = 1;

  // Add recurring series first
  const recurringTarget = Math.floor(total * recurringRatio);

  // Fill remaining with one-off transactions
  while (transactions.length < total) {
    const template = weightedPick(oneOffTemplates);
    const remaining = total - transactions.length;

    if (isBnplCategory(template.category)) {
      if (remaining < 4) continue;

      const description = pickOne(template.descriptions);

      // template min/max = instalment size
      const installmentAmount = roundMoney(rand(template.min, template.max));
      const purchaseTotal = roundMoney(installmentAmount * 4);

      const latestBnplStart = new Date(endDate);
      latestBnplStart.setDate(latestBnplStart.getDate() - 42);

      const bnplStartDate =
        latestBnplStart.getTime() > startDate.getTime()
          ? randomDateBetween(startDate, latestBnplStart)
          : randomDateBetween(startDate, endDate);

      const baseTx: Transaction = {
        id: `demo-${idCounter++}`,
        date: bnplStartDate,
        type: template.type,
        amount: purchaseTotal,
        category: "BNPL",
        description,
        source: "Demo Data",
        tags: uniqueTags(template.tags, template.type),
      };

      const bnplSeries = generateBnplInstallmentSeries(baseTx);
      transactions.push(...bnplSeries);
      continue;
    }

    const description = pickOne(template.descriptions);
    const amount = roundMoney(rand(template.min, template.max));

    transactions.push({
      id: `demo-${idCounter++}`,
      date: randomDateBetween(startDate, endDate),
      type: template.type,
      amount,
      category: template.category,
      description,
      source: "Demo Data",
      tags: uniqueTags(template.tags, template.type),
    });
  }

  // Fill remaining with one-off transactions
  while (transactions.length < total) {
    const template = weightedPick(oneOffTemplates);
    const description = pickOne(template.descriptions);
    const amount = roundMoney(rand(template.min, template.max));

    transactions.push({
      id: `demo-${idCounter++}`,
      date: randomDateBetween(startDate, endDate),
      type: template.type,
      amount,
      category: template.category,
      description,
      source: "Demo Data",
      tags: uniqueTags(template.tags, template.type),
    });
  }

  // Sort by date ascending
  transactions.sort((a, b) => a.date.localeCompare(b.date));

  // Re-number IDs after sorting so they stay neat
  return transactions.map((tx, index) => ({
    ...tx,
    id: `demo-${index + 1}`,
  }));
}

// Usage:
const DEMO_DATA: Transaction[] = generateRandomDemoData({
  total: 120,
  startDate: "2023-10-01",
  endDate: "2024-12-31",
  recurringRatio: 0.35,
});

console.log(DEMO_DATA);

function loadDemoDataAndFinish() {
  const DEMO_DATA: Transaction[] = generateRandomDemoData({ total: 120 });
  transactions.value = DEMO_DATA.map(t => ({ ...t }));
  safeLocalStorageSet(LS_KEYS.tx, transactions.value);
  showTour.value = false;
  onboardingStep.value = 0;
  localStorage.setItem("hasSeenOnboarding", "true");
  activeTab.value = "transactions";
  pushToast("Demo data loaded! Explore the features.", "success", 3000);
}


function handleTourBack() {
  if (onboardingStep.value > 0) {
    onboardingStep.value--;
  }
}

function skipTour() {
  showTour.value = false;
  onboardingStep.value = 0;
  pushToast("You can always access onboarding from the About page", "info");
}

function startImportFromEmptyState() {
  activeTab.value = "import";
  pushToast("Select a file or paste data to import", "info");
}

function startTourFromAbout() {
  showTour.value = true;
  onboardingStep.value = 0;
  activeTab.value = "about";
}
</script>

<style scoped>
/* Try break me heheh */
.opacity-80 {
  word-break: break-word;
}

/* WCAG-friendly skip link */
.skip-link {
  position: absolute;
  left: -9999px;
  top: auto;
  width: 1px;
  height: 1px;
  overflow: hidden;
}

.skip-link:focus {
  position: fixed;
  left: 1rem;
  top: 1rem;
  width: auto;
  height: auto;
  padding: 0.5rem 0.75rem;
  background: CanvasText;
  color: Canvas;
  border-radius: 0.375rem;
  z-index: 9999;
}

/* Modal background scroll lock */
.no-scroll {
  overflow: hidden;
}

.menu li>a:focus {
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

.badge.badge-outline,
.sm\:badge-ghost {
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

.dropdown>summary {
  list-style: none;
  cursor: pointer;
}

.dropdown>summary::-webkit-details-marker {
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
details.dropdown[open]>.dropdown-content {
  display: block;
}

/* ===== Transaction table usability ===== */
.table {
  border-collapse: separate;
  border-spacing: 0 2px;
  /* gentle breathing room */
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
  width: 6.5rem;
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
  background-color: color-mix(in oklab,
      oklch(var(--b1)) 90%,
      oklch(var(--bc)) 10%);
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

/* Prefer reduced motion (SC 2.3.3) */
@media (prefers-reduced-motion: reduce) {

  *,
  *::before,
  *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
  }
}

@media (prefers-contrast: more) {
  :root:not([data-theme="dark"]) {
    color-scheme: light;
  }

  :root {
    --fallback-bc: #0b0b0b;
  }
}

/* Force underline on links (no color-only state, SC 1.4.1) */
.prose a,
a.underline-always {
  text-decoration: underline;
  text-underline-offset: 0.15em;
}
</style>