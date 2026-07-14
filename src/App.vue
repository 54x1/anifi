<template>
  <div class="min-h-[100dvh] bg-base-100 transition-colors duration-300">
    <!-- Skip to main content link (WCAG 2.4.1 Bypass Blocks) -->
    <a href="#main" class="skip-link focus-ring">
      Skip to main content
    </a>
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
        <a href="#" class="flex items-center gap-3 min-w-0" @click.prevent="goHome">
          <!-- Favicon logo (coffee cup motif) -->
          <img src="./assets/favicon.svg" class="shrink-0" width="36" height="36" alt="mybudget logo" aria-label="mybudget logo" />
          <div class="flex flex-col min-w-0 logo-text">
            <h1 class="text-lg md:text-xl font-normal text-base-content leading-tight tracking-tight">
              <span class="logo-line-1">mybudget</span><span class="logo-line-2 font-semibold"> Forecaster</span>
            </h1>
            <span class="text-[10px] text-base-content/40 font-normal tracking-[0.2em] uppercase hidden lg:inline">
                Finances Personally Tailored
            </span>
          </div>
        </a>
      </div>
      <nav class="navbar-center hidden lg:flex" aria-label="Primary">
        <div class="tabs tabs-boxed gap-1" role="tablist" aria-label="Main sections">
          <button v-for="tab in tabs" :key="tab.id" type="button" role="tab" :id="`tab-${tab.id}`"
            class="tab focus-ring target-min px-4 md:px-5" :class="{ 'tab-active': activeTab === tab.id }" @click="onTab(tab.id)"
            :aria-selected="activeTab === tab.id" :aria-controls="`panel-${tab.id}`" :aria-current="activeTab === tab.id ? 'page' : null">
            <span aria-hidden="true" class="text-base">{{ tab.icon }}</span>
            <span class="ml-1.5 text-sm font-medium">{{ tab.label }}</span>
          </button>
        </div>
      </nav>

      <div class="navbar-end">
        <div class="flex items-start gap-1.5 flex-wrap min-w-0 mobile-nav-end">
          <!-- Balance badge -->
          <div class="balance-badge" aria-label="Account balance">
            <span class="badge-label">Balance</span>
            <span class="badge-value text-base-content" :aria-label="netBalanceFormatted.ariaLabel">
              <span aria-hidden="true">{{ netBalanceFormatted.sign }}</span>{{ netBalanceFormatted.value }}
            </span>
          </div>
          <!-- Date Format Picker -->
          <details class="dropdown dropdown-end transition-none mobile-dropdown-wrap">
            <summary class="btn btn-ghost btn-sm md:btn-md gap-1 transition-none" aria-haspopup="listbox" title="Date format">
              📅 <span class="sr-only">Choose date format ({{ selectedDateFormat }})</span>
            </summary>
            <ul class="dropdown-content z-[60] menu p-2 shadow bg-base-100 rounded-box w-64 mobile-dropdown-content" role="listbox"
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
          <details ref="themeDropdownRef" class="dropdown dropdown-end transition-none mobile-dropdown-wrap" @toggle="onThemeToggle">
            <summary class="btn btn-ghost btn-sm md:btn-md gap-1 transition-none" aria-haspopup="listbox" :aria-expanded="String(themeOpen)"
              title="Theme">
              🎨 <span class="sr-only">Choose theme ({{ currentTheme }})</span>
            </summary>

            <ul class="dropdown-content z-[60] menu p-2 shadow bg-base-100 rounded-box w-max max-h-96 overflow-y-auto mobile-dropdown-content"
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
    <nav class="btm-nav lg:hidden z-[55] shadow-[0_-2px_6px_0px_rgba(0,0,0,0.1)] border-t border-base-300 safe-area-bottom"
      aria-label="Primary (mobile)">
      <button v-for="tab in tabs" :key="tab.id" :class="{ active: activeTab === tab.id }" @click="onTab(tab.id)"
        type="button" class="target-min focus-ring min-h-[48px] min-w-[48px]" :aria-current="activeTab === tab.id ? 'page' : null">
        <span class="text-lg" aria-hidden="true">{{ tab.icon }}</span>
        <span class="btm-nav-label text-xs">{{ tab.label }}</span>
      </button>
    </nav>

    <!-- Main -->
    <main id="main" class="container mx-auto p-4 pb-24 lg:pb-6 safe-area-main" role="main">
      <!-- Get Started / Onboarding -->
      <section v-if="showTour" class="fixed inset-0 z-[60] bg-base-100/90 backdrop-blur p-4 lg:p-10" role="dialog"
        aria-modal="true" aria-labelledby="onboardingTitle" @keydown.escape.prevent="skipTour">
        <div class="max-w-3xl mx-auto" tabindex="-1">
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
          <section v-if="activeTab === 'transactions'" :id="'panel-transactions'" role="tabpanel"
            :aria-labelledby="'tab-transactions'" class="card bg-base-100 shadow-xl" aria-labelledby="txHeading">
            <div class="card-body">
              <!-- Header with view toggle -->
              <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-3 sm:gap-0">
                <h2 id="txHeading" class="text-xl md:text-2xl font-bold">
                  📋 Transactions ({{ filteredTransactions.length }})
                </h2>
                <!-- Progressive Disclosure: TOGGLE -->
                <div class="flex flex-wrap gap-2 items-center">
                  <span class="text-xs md:text-sm text-base-content/60">View:</span>
                  <!-- Slide pill Simple/Advanced -->
                  <div class="relative inline-grid grid-cols-2 w-full sm:w-auto items-center rounded-full bg-base-200 p-0.5 sm:p-1" role="tablist"
                    aria-label="View mode" @keydown.left.prevent="showAdvancedTransactionsView = false"
                    @keydown.right.prevent="showAdvancedTransactionsView = true" tabindex="0">
                    <!-- Sliding thumb -->
                    <span
                      class="absolute inset-y-0.5 sm:inset-y-1 left-0.5 sm:left-1 w-[calc(50%-0.125rem)] sm:w-[calc(50%-0.25rem)] rounded-full bg-primary transition-transform duration-300"
                      :style="{
                        transform: showAdvancedTransactionsView
                          ? 'translateX(100%)'
                          : 'translateX(0%)',
                      }" aria-hidden="true"></span>

                    <!-- Simple -->
                    <button type="button" role="tab" :aria-selected="String(!showAdvancedTransactionsView)"
                      class="relative z-10 px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm rounded-full transition-colors" :class="!showAdvancedTransactionsView
                        ? 'text-primary-content font-semibold'
                        : 'text-base-content/70'
                        " @click="showAdvancedTransactionsView = false">
                      Simple
                    </button>

                    <!-- Advanced -->
                    <button type="button" role="tab" :aria-selected="String(showAdvancedTransactionsView)"
                      class="relative z-10 px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm rounded-full transition-colors" :class="showAdvancedTransactionsView
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
              <!-- Mobile Card View -->
              <div class="lg:hidden space-y-3">
                <div v-for="(t, i) in paginatedTransactions" :key="t.id" :id="`tx-${t.id}`"
                  class="card bg-base-100 shadow-sm border border-base-300 tx-card-mobile"
                  :class="{ 'border-primary': isSelected(t.id), 'bg-base-200': isSelected(t.id) }">
                  <div class="card-body p-3 gap-2">
                    <!-- Header: Date, Type, Amount -->
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <input type="checkbox" class="checkbox checkbox-sm"
                          :checked="isSelected(t.id)" @change="toggleSelectRow(t.id)"
                          :aria-label="`Select transaction on ${formatDate(t.date)} for $${t.amount.toFixed(2)}`" />
                        <span class="text-sm font-medium">{{ formatDate(t.date) }}</span>
                      </div>
                      <span class="font-bold" :class="t.type === 'income' ? 'text-success' : 'text-error'">
                        {{ t.type === 'income' ? '+' : '-' }}${{ t.amount.toFixed(2) }}
                      </span>
                    </div>
                    <!-- Type Badge -->
                    <div class="flex items-center gap-2">
                      <span class="badge badge-sm" :class="t.type === 'income' ? 'badge-success' : 'badge-error'">
                        {{ t.type === 'income' ? '💰 Income' : '💸 Spending' }}
                      </span>
                      <span class="badge badge-sm badge-outline">{{ t.category }}</span>
                    </div>
                    <!-- Description -->
                    <p class="text-sm text-base-content/80 line-clamp-2">{{ t.description }}</p>
                    <!-- Tags -->
                    <div v-if="t.tags?.length" class="flex flex-wrap gap-1">
                      <span v-for="tag in t.tags" :key="t.id + '-tg-' + tag" class="badge badge-sm badge-ghost">
                        {{ tag }}
                      </span>
                    </div>
                    <!-- Actions -->
                    <div class="flex justify-end gap-1 mt-1">
                      <button type="button" class="btn btn-ghost btn-xs" @click="editTransaction(t)" aria-label="Edit">
                        ✏️
                      </button>
                      <button type="button" class="btn btn-ghost btn-xs" @click="duplicateTx(t)" aria-label="Duplicate">
                        📄
                      </button>
                      <button type="button" class="btn btn-ghost btn-xs text-error" @click="deleteTransaction(t.id)" aria-label="Delete">
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <!-- Desktop Table View -->
              <div class="hidden lg:block overflow-x-auto">
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
                        <th scope="col">
                          <button type="button" class="btn btn-ghost btn-xs" @click="updateSort('description')">
                            Description
                            <span aria-hidden="true">{{
                              getSortIcon('description')
                            }}</span>
                          </button>
                        </th>
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
        <section
          v-if="activeTab === 'add'"
          :id="'panel-add'"
          role="tabpanel"
          :aria-labelledby="'tab-add'"
          ref="addSectionRef"
          class="card bg-base-100 shadow-xl mb-6"
          tabindex="0"
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

                <DatePicker v-model="newTxDateISO" id="addDate" aria-label="transaction date" />
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
                    step="0.01" min="0.01" placeholder="0.00"
                    class="input input-bordered join-item flex-1" :class="{ 'input-error': amountError }"
                    required inputmode="decimal" @focus="scrollIntoView($event)" @input="clearAmountError"
                    aria-invalid="!!amountError" aria-describedby="addAmountError" />
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
                    class="label-text-alt text-primary hover:underline transition-all"
                    @click="clearCategory" aria-label="Clear selected category">
                    Clear
                  </button>
                </label>

                <details ref="categoryDropdownRef" class="dropdown w-full" @toggle="onCategoryToggle">
                  <summary
                    class="btn w-full justify-between normal-case min-h-[48px] hover:border-primary transition-all duration-200"
                    aria-haspopup="listbox" :aria-expanded="String(categoryOpen)"
                    :aria-label="currentCategory || 'Choose a category'">
                    <span class="capitalize flex items-center gap-2">
                      <span v-if="currentCategory" class="w-2 h-2 rounded-full bg-primary" aria-hidden="true"></span>
                      {{ currentCategory || "Choose a category…" }}
                    </span>
                    <svg class="w-5 h-5 transition-transform duration-200" :class="{ 'rotate-180': categoryOpen }"
                      fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
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
                  <div class="p-4 border-b border-base-300 bg-base-100 sticky z-10 space-y-3"
                    style="top: calc(var(--header-height, 3.5rem) + 0.25rem)">
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
        <section
          v-if="activeTab === 'import'"
          :id="'panel-import'"
          role="tabpanel"
          :aria-labelledby="'tab-import'"
          class="card bg-base-100 shadow-xl mb-6"
          tabindex="0"
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

                <!-- Phase 1: Export Format Buttons -->
                <div class="form-control">
                  <label class="label">
                    <span class="label-text">Export Formats</span>
                  </label>
                  <div class="flex flex-wrap gap-2">
                    <button type="button" class="btn btn-primary btn-sm" @click="exportModalOpen = true"
                      :disabled="transactions.length === 0 || exportInProgress">
                      📤 Export Data
                      <span v-if="exportInProgress" class="loading loading-spinner loading-xs"></span>
                    </button>
                    <button type="button" class="btn btn-accent btn-sm" @click="generateShareCodesWithBatching"
                      :disabled="transactions.length === 0">
                      🔗 Generate Share Code
                    </button>
                  </div>
                  <p class="text-xs text-base-content/60 mt-1">
                    Export your data in multiple formats or generate share codes.
                  </p>
                </div>

                <!-- Phase 4: Export Progress -->
                <div v-if="exportInProgress" class="form-control mt-3">
                  <progress class="progress progress-primary" :value="exportProgress" max="100"></progress>
                  <p class="text-xs text-base-content/60 mt-1">
                    Exporting... {{ exportProgress }}%
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
        <section
          v-if="activeTab === 'chart'"
          :id="'panel-chart'"
          role="tabpanel"
          :aria-labelledby="'tab-chart'"
          class="space-y-4 md:space-y-6"
          tabindex="0"
          aria-live="polite"
        >
          <!-- Import Success Banner -->
          <div v-if="lastImportSummary" class="alert alert-success shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div class="flex-1">
              <h3 class="font-semibold">Import Complete!</h3>
              <p class="text-sm">{{ lastImportSummary }}</p>
            </div>
            <button type="button" class="btn btn-sm btn-circle btn-ghost" @click="lastImportSummary = ''" aria-label="Dismiss import summary">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Chart Display - At top, most prominent -->
          <div class="card bg-base-100 shadow-xl chart-card">
            <div class="card-body p-4 md:p-6">
              <!-- Chart Title with context -->
              <div class="flex flex-col xs:flex-row xs:items-center xs:justify-between mb-3 xs:mb-2 gap-1">
                <div>
                  <h2 id="chartHeading" class="text-lg xs:text-base font-semibold text-base-content">
                    Financial Overview
                  </h2>
                  <p class="text-xs xs:text-[11px] text-base-content/50 mt-0.5">
                    {{ chartPeriodLabel }} · {{ chartConfig.groupBy }} · {{ filteredTransactions.length }} transactions
                  </p>
                </div>
              </div>

              <!-- Mobile: compact info bar showing current settings -->
              <div class="flex flex-wrap items-center gap-1.5 sm:gap-1 mb-3 sm:mb-2">
                <div class="badge badge-outline badge-sm gap-1" title="Group by">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 sm:h-2.5 sm:w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span class="text-xs sm:text-[11px]">{{ chartConfig.groupBy }}</span>
                </div>
                <div class="badge badge-outline badge-sm gap-1" title="Date range">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 sm:h-2.5 sm:w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span class="text-xs sm:text-[11px]">{{ selectedDatePreset || 'Custom' }}</span>
                </div>
                <div class="flex-1"></div>
                <button class="btn btn-sm btn-ghost gap-1 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0" @click="showAdvancedFilters = true" aria-label="Open advanced settings" title="Open chart settings">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 sm:h-3 sm:w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>

              <!-- Row 2: Chart Type Selectors - 2-row 4-col grid on mobile, single row on larger screens -->
              <div class="flex justify-center mb-3 sm:mb-2">
                <div class="grid grid-cols-4 sm:grid-cols-8 gap-1.5 sm:gap-1 w-full max-w-md" role="group" aria-label="Chart type">
                  <label class="btn btn-sm btn-square sm:btn-auto mx-auto gap-0.5 min-h-[44px] sm:min-h-0"
                    :class="[chartConfig.type === 'bar' ? 'btn-primary' : 'btn-ghost hover:bg-base-200']"
                    aria-label="Bar chart" :aria-pressed="chartConfig.type === 'bar'" title="Bar chart: compare income, spending, and net across periods">
                    <input type="radio" name="chartType" value="bar" v-model="chartConfig.type" class="hidden chart-type-radio" />
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span class="text-[11px] sm:text-[10px]">Bar</span>
                  </label>
                  <label class="btn btn-sm btn-square sm:btn-auto mx-auto gap-0.5 min-h-[44px] sm:min-h-0"
                    :class="[chartConfig.type === 'line' ? 'btn-primary' : 'btn-ghost hover:bg-base-200']"
                    aria-label="Line chart" :aria-pressed="chartConfig.type === 'line'" title="Line chart: track trends and movement over time">
                    <input type="radio" name="chartType" value="line" v-model="chartConfig.type" class="hidden chart-type-radio" />
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <span class="text-[11px] sm:text-[10px]">Line</span>
                  </label>
                  <label class="btn btn-sm btn-square sm:btn-auto mx-auto gap-0.5 min-h-[44px] sm:min-h-0"
                    :class="[chartConfig.type === 'pie' ? 'btn-primary' : 'btn-ghost hover:bg-base-200']"
                    aria-label="Pie chart" :aria-pressed="chartConfig.type === 'pie'" title="Pie chart: compare spending share by category or tag">
                    <input type="radio" name="chartType" value="pie" v-model="chartConfig.type" class="hidden chart-type-radio" />
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                    </svg>
                    <span class="text-[11px] sm:text-[10px]">Pie</span>
                  </label>
                  <label class="btn btn-sm btn-square sm:btn-auto mx-auto gap-0.5 min-h-[44px] sm:min-h-0"
                    :class="[chartConfig.type === 'doughnut' ? 'btn-primary' : 'btn-ghost hover:bg-base-200']"
                    aria-label="Doughnut chart" :aria-pressed="chartConfig.type === 'doughnut'" title="Doughnut chart: a ring view of the same spending breakdown">
                    <input type="radio" name="chartType" value="doughnut" v-model="chartConfig.type" class="hidden chart-type-radio" />
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                    </svg>
                    <span class="text-[11px] sm:text-[10px]">Donut</span>
                  </label>
                  <label class="btn btn-sm btn-square sm:btn-auto mx-auto gap-0.5 min-h-[44px] sm:min-h-0"
                    :class="[chartConfig.type === 'radar' ? 'btn-primary' : 'btn-ghost hover:bg-base-200']"
                    aria-label="Radar chart" :aria-pressed="chartConfig.type === 'radar'" title="Radar chart: compare category totals across months">
                    <input type="radio" name="chartType" value="radar" v-model="chartConfig.type" class="hidden chart-type-radio" />
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l5-5m0 0l5 5m-5-5v12" />
                    </svg>
                    <span class="text-[11px] sm:text-[10px]">Radar</span>
                  </label>
                  <label class="btn btn-sm btn-square sm:btn-auto mx-auto gap-0.5 min-h-[44px] sm:min-h-0"
                    :class="[chartConfig.type === 'scatter' ? 'btn-primary' : 'btn-ghost hover:bg-base-200']"
                    aria-label="Scatter chart" :aria-pressed="chartConfig.type === 'scatter'" title="Scatter chart: inspect transaction spread over time">
                    <input type="radio" name="chartType" value="scatter" v-model="chartConfig.type" class="hidden chart-type-radio" />
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 sm:h-4 sm:w-4" fill="currentColor" viewBox="0 0 24 24">
                      <circle cx="6" cy="6" r="2" />
                      <circle cx="18" cy="8" r="2" />
                      <circle cx="10" cy="16" r="2" />
                      <circle cx="16" cy="14" r="2" />
                    </svg>
                    <span class="text-[11px] sm:text-[10px]">Scatter</span>
                  </label>
                  <label class="btn btn-sm btn-square sm:btn-auto mx-auto gap-0.5 min-h-[44px] sm:min-h-0"
                    :class="[chartConfig.type === 'bubbleHierarchy' ? 'btn-primary' : 'btn-ghost hover:bg-base-200']"
                    aria-label="Bubble map chart" :aria-pressed="chartConfig.type === 'bubbleHierarchy'" title="Bubble map chart: explore the category and tag hierarchy">
                    <input type="radio" name="chartType" value="bubbleHierarchy" v-model="chartConfig.type" class="hidden chart-type-radio" />
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <circle cx="12" cy="12" r="3" />
                      <circle cx="6" cy="7" r="2" />
                      <circle cx="18" cy="8" r="2" />
                      <circle cx="8" cy="17" r="2" />
                      <circle cx="16" cy="16" r="2" />
                      <path stroke-linecap="round" stroke-width="1.5" d="M8.5 8.5L10.5 10.5M13.5 10.5L15.5 9.5M10 13.5L9 15.5M14 13.5L15 14.5" />
                    </svg>
                    <span class="text-[11px] sm:text-[10px]">Bubble</span>
                  </label>
                  <button
                    type="button"
                    class="btn btn-sm btn-square sm:btn-auto mx-auto gap-0.5 chart-view-toggle min-h-[44px] sm:min-h-0"
                    :class="[showBalanceTable ? 'btn-primary' : 'btn-ghost hover:bg-base-200']"
                    :aria-pressed="showBalanceTable"
                    aria-label="Balance sheet table"
                    title="Balance sheet table: show rows and columns"
                    @click="chartConfig.type = 'table'"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <rect x="4" y="4" width="16" height="16" rx="2" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 9h16M4 15h16M9 4v16M15 4v16" />
                    </svg>
                    <span class="text-[11px] sm:text-[10px]">Table</span>
                  </button>
                </div>
              </div>

              <!-- Row 3: Category Series Selector (all chart types) - Color-coded compact badges -->
              <div class="flex flex-wrap justify-center gap-1.5 xs:gap-1 mb-2 xs:mb-2">
                <button
                  type="button"
                  class="btn btn-xs btn-ghost gap-0.5 xs:btn-sm-xs"
                  :class="{ 'btn-primary': selectedCategoriesChart.length === 0 || selectedCategoriesChart.length === chartCategories.length }"
                  @click="selectedCategoriesChart.length === 0 || selectedCategoriesChart.length === chartCategories.length ? unselectAllCategoriesChart() : selectAllCategoriesChart()"
                  title="Select/Deselect all categories"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 xs:h-2.5 xs:w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span class="text-[10px] xs:text-[9px]">All ({{ selectedCategoriesChart.length || chartCategories.length }}/{{ chartCategories.length }})</span>
                </button>
                <button
                  v-for="cat in visibleChartCategories"
                  :key="cat"
                  type="button"
                  class="badge badge-sm xs:badge-xs cursor-pointer focus-ring target-min transition-all hover:scale-105 border-2"
                  :class="{ 'opacity-100 ring-1': selectedCategoriesChart.includes(cat), 'opacity-40 badge-outline': !selectedCategoriesChart.includes(cat) }"
                  :style="{ backgroundColor: selectedCategoriesChart.includes(cat) ? getCategoryColor(cat) : 'transparent', borderColor: getCategoryColor(cat), color: selectedCategoriesChart.includes(cat) ? '#fff' : 'inherit' }"
                  @click="toggleCategoryForChart(cat)"
                  :title="selectedCategoriesChart.includes(cat) ? `Deselect ${cat}` : `Select ${cat}`"
                >
                  {{ cat }}
                </button>
                <button
                  v-if="chartCategories.length > BADGE_INITIAL_SHOW"
                  type="button"
                  class="badge badge-sm badge-ghost cursor-pointer hover:badge-neutral transition-all"
                  @click="showAllCategoryBadges = !showAllCategoryBadges"
                  :title="showAllCategoryBadges ? 'Show fewer categories' : `Show ${chartCategories.length - BADGE_INITIAL_SHOW} more categories`"
                >
                  {{ showAllCategoryBadges ? '↑ Less' : `+${chartCategories.length - BADGE_INITIAL_SHOW} more` }}
                </button>
              </div>

              <!-- Chart Display -->
              <div class="relative bg-base-200 rounded-lg p-4 xs:p-3" role="region" aria-label="Chart area">
                <div v-if="showBalanceTable" class="flex flex-col gap-3">
                  <div class="flex flex-wrap items-center justify-between gap-3 border-b border-base-300 pb-3">
                    <div>
                      <h3 class="text-sm font-semibold tracking-wide uppercase">Balance Sheet Summary</h3>
                      <p class="text-xs text-base-content/60">Grouped by {{ balanceTablePeriod }} with monthly as the default.</p>
                    </div>

                    <div class="flex flex-wrap items-center gap-2">
                      <div class="join join-horizontal" role="tablist" aria-label="Balance sheet period">
                        <button type="button" role="tab" class="join-item btn btn-xs" :class="balanceTablePeriod === 'day' ? 'btn-active' : 'btn-ghost'" :aria-selected="String(balanceTablePeriod === 'day')" @click="balanceTablePeriod = 'day'">
                          Day
                        </button>
                        <button type="button" role="tab" class="join-item btn btn-xs" :class="balanceTablePeriod === 'week' ? 'btn-active' : 'btn-ghost'" :aria-selected="String(balanceTablePeriod === 'week')" @click="balanceTablePeriod = 'week'">
                          Week
                        </button>
                        <button type="button" role="tab" class="join-item btn btn-xs" :class="balanceTablePeriod === 'month' ? 'btn-active' : 'btn-ghost'" :aria-selected="String(balanceTablePeriod === 'month')" @click="balanceTablePeriod = 'month'">
                          Month
                        </button>
                        <button type="button" role="tab" class="join-item btn btn-xs" :class="balanceTablePeriod === 'year' ? 'btn-active' : 'btn-ghost'" :aria-selected="String(balanceTablePeriod === 'year')" @click="balanceTablePeriod = 'year'">
                          Year
                        </button>
                      </div>
                      <span class="badge badge-outline">{{ balanceSheetTotals.count }} transactions</span>
                    </div>
                  </div>

                  <!-- Mobile Card View -->
                  <div class="lg:hidden space-y-2">
                    <div v-for="row in balanceSheetRows" :key="row.key"
                      class="card bg-base-100 shadow-sm border border-base-300">
                      <div class="card-body p-3 gap-2">
                        <div class="flex items-center justify-between">
                          <span class="font-semibold text-sm">{{ row.label }}</span>
                          <span class="font-bold" :class="row.balance >= 0 ? 'text-success' : 'text-error'">
                            {{ row.balance >= 0 ? '+' : '-' }}${{ Math.abs(row.balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
                          </span>
                        </div>
                        <div class="flex justify-between text-xs">
                          <span class="text-success">Income: ${{ row.income.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>
                          <span class="text-error">Spending: ${{ row.spending.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>
                        </div>
                      </div>
                    </div>
                    <div v-if="balanceSheetRows.length === 0" class="text-center text-base-content/60 py-8">
                      No transactions match the current chart filters.
                    </div>
                    <!-- Total Row -->
                    <div class="card bg-base-200 shadow-sm border border-primary/20">
                      <div class="card-body p-3">
                        <div class="flex items-center justify-between">
                          <span class="font-bold">Total</span>
                          <span class="font-bold" :class="balanceSheetTotals.balance >= 0 ? 'text-success' : 'text-error'">
                            {{ balanceSheetTotals.balance >= 0 ? '+' : '-' }}${{ Math.abs(balanceSheetTotals.balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
                          </span>
                        </div>
                        <div class="flex justify-between text-xs">
                          <span class="text-success">Income: ${{ balanceSheetTotals.income.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>
                          <span class="text-error">Spending: ${{ balanceSheetTotals.spending.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- Desktop Table View -->
                  <div class="hidden lg:block overflow-x-auto rounded-box border border-base-300 bg-base-100 shadow-sm">
                    <table class="table table-zebra table-sm" aria-label="Balance sheet summary">
                      <thead>
                        <tr>
                          <th scope="col">Period</th>
                          <th scope="col" class="text-right">Income</th>
                          <th scope="col" class="text-right">Spending</th>
                          <th scope="col" class="text-right">Net</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="row in balanceSheetRows" :key="row.key">
                          <td class="font-medium">{{ row.label }}</td>
                          <td class="text-right text-success font-semibold">${{ row.income.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</td>
                          <td class="text-right text-error font-semibold">${{ row.spending.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</td>
                          <td class="text-right font-semibold" :class="row.balance >= 0 ? 'text-success' : 'text-error'">
                            {{ row.balance >= 0 ? '+' : '-' }}${{ Math.abs(row.balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
                          </td>
                        </tr>
                        <tr v-if="balanceSheetRows.length === 0">
                          <td colspan="4" class="text-center text-base-content/60 py-8">
                            No transactions match the current chart filters.
                          </td>
                        </tr>
                      </tbody>
                      <tfoot>
                        <tr>
                          <th scope="row">Total</th>
                          <th class="text-right text-success">${{ balanceSheetTotals.income.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</th>
                          <th class="text-right text-error">${{ balanceSheetTotals.spending.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</th>
                          <th class="text-right" :class="balanceSheetTotals.balance >= 0 ? 'text-success' : 'text-error'">
                            {{ balanceSheetTotals.balance >= 0 ? '+' : '-' }}${{ Math.abs(balanceSheetTotals.balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
                          </th>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
                <div v-else class="chart-canvas-area">
                  <!-- Loading Skeleton -->
                  <div v-if="chartLoading" class="absolute inset-0 z-10 flex items-center justify-center bg-base-200/80 rounded-lg backdrop-blur-sm" aria-live="polite">
                    <div class="flex flex-col items-center gap-2">
                      <span class="loading loading-spinner loading-md text-primary"></span>
                      <span class="text-xs text-base-content/60">Loading chart...</span>
                    </div>
                  </div>
                  <div v-if="chartConfig.type === 'bubbleHierarchy'"
                    ref="bubbleHierarchyContainer"
                    class="relative w-full max-h-[400px] xs:max-h-[240px] md:max-h-[450px] lg:max-h-[500px] xl:max-h-[600px]"
                    style="min-height: 200px; aspect-ratio: 16/9;"
                    role="img"
                    :aria-label="getChartAriaLabel()"
                    :aria-describedby="'chartHeading'"
                  >
                    <svg
                      ref="bubbleHierarchySvg"
                      class="w-full h-full"
                    ></svg>
                  </div>
                  <div v-else-if="chartData.labels.length === 0"
                    class="flex flex-col items-center justify-center py-10 text-center text-base-content/60 gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <template v-if="transactions.length === 0">
                      <p class="font-semibold text-sm">No transactions yet</p>
                      <p class="text-xs">Add your first transaction to see your financial overview.</p>
                      <button type="button" class="btn btn-sm btn-primary mt-1" @click="onTab('add')">Add Transaction</button>
                    </template>
                    <template v-else>
                      <p class="font-semibold text-sm">No data matches the current filters</p>
                      <p class="text-xs">Try selecting more categories, adjusting the date range, or resetting filters.</p>
                      <div class="flex gap-2 mt-1">
                        <button type="button" class="btn btn-sm btn-ghost" @click="selectAllCategoriesChart(); resetDateFilter()">Reset filters</button>
                        <button type="button" class="btn btn-sm btn-ghost" @click="showAdvancedFilters = true">Open settings</button>
                      </div>
                    </template>
                  </div>
                  <canvas
                    v-else
                    ref="chartCanvas"
                    role="img"
                    :aria-label="getChartAriaLabel()"
                    :aria-describedby="'chartHeading'"
                    class="w-full max-h-[400px] xs:max-h-[240px] md:max-h-[450px] lg:max-h-[500px] xl:max-h-[600px]"
                  ></canvas>
                  <!-- External tooltip: rendered as HTML above the canvas so custom plugin overlays can't cover it -->
                  <div v-if="chartConfig.type !== 'bubbleHierarchy'"
                       ref="chartTooltipEl" class="absolute z-[1000] pointer-events-none opacity-0 transition-opacity duration-150 ease"
                       style="padding: 12px; border-radius: 8px; max-width: 300px; font-size: 12px;"
                       :style="chartTooltipStyle">
                  </div>
                </div>
              </div>

              <!-- Date Range Info -->
              <div class="flex justify-between items-center mt-3 text-sm text-base-content/60 xs:text-xs">
                <span class="truncate">{{ chartFilteredForStats.length }} transactions • {{ formatDateRange() }}</span>
                <div class="flex items-center gap-1">
                  <button
                    v-if="!showBalanceTable && chartData.labels.length > 0"
                    type="button"
                    class="btn btn-ghost btn-xs gap-1"
                    @click="downloadChartAsPng"
                    title="Download chart as PNG"
                    aria-label="Download chart image as PNG"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    PNG
                  </button>
                  <button class="btn btn-ghost btn-xs xs:btn-sm-xs" @click="resetDateFilter">Reset Date</button>
                </div>
              </div>

            </div>
          </div>

          <!-- Summary Stats - Below chart for quick reference -->
          <div class="stats stats-vertical lg:stats-horizontal shadow-lg w-full xs:stats-md">
            <div class="stat">
              <div class="stat-figure text-success xs:stat-figure-sm">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 xs:h-4 xs:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11l5-5m0 0l5 5m-5-5v12" />
                </svg>
              </div>
              <div class="stat-title xs:text-xs">Total Income</div>
              <div class="stat-value text-success xs:text-base">${{ chartTotalIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</div>
              <div class="stat-desc xs:text-[10px]">{{ incomeTransactions.length }} transactions</div>
            </div>
            <div class="stat">
              <div class="stat-figure text-error xs:stat-figure-sm">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 xs:h-4 xs:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                </svg>
              </div>
              <div class="stat-title xs:text-xs">Total Spending</div>
              <div class="stat-value text-error xs:text-base">${{ chartTotalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</div>
              <div class="stat-desc xs:text-[10px]">{{ expenseTransactions.length }} transactions</div>
            </div>
            <div class="stat">
              <div class="stat-figure" :class="chartNetBalance >= 0 ? 'text-success' : 'text-error'">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 xs:h-4 xs:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div class="stat-title xs:text-xs">Net Balance</div>
              <div class="stat-value" :class="chartNetBalance >= 0 ? 'text-success' : 'text-error'">
                {{ chartNetBalance >= 0 ? '+' : '-' }}${{ Math.abs(chartNetBalance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
              </div>
              <div class="stat-desc" :class="chartNetBalance >= 0 ? 'text-success' : 'text-error'" :aria-live="'polite'">{{ chartNetBalance >= 0 ? 'Surplus' : 'Deficit' }}</div>
            </div>
            <div class="stat">
              <div class="stat-figure text-warning xs:stat-figure-sm">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 xs:h-4 xs:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div class="stat-title xs:text-xs">Savings Rate</div>
              <div v-if="chartSavingsRate !== null" class="stat-value xs:text-base"
                :class="chartSavingsRate >= 20 ? 'text-success' : chartSavingsRate >= 0 ? 'text-warning' : 'text-error'">
                {{ chartSavingsRate.toFixed(2) }}%
              </div>
              <div v-else class="stat-value text-base-content/30 xs:text-base">—</div>
              <div class="stat-desc xs:text-[10px]">of income saved</div>
            </div>
          </div>

          <!-- Additional Insights Row -->
          <div class="stats stats-vertical lg:stats-horizontal shadow-lg w-full xs:stats-md">
            <div class="stat">
              <div class="stat-figure text-info xs:stat-figure-sm">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 xs:h-4 xs:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m0 3V7m6 6v-3m0 3V7" />
                </svg>
              </div>
              <div class="stat-title xs:text-xs">Avg Transaction</div>
              <div class="stat-value text-info xs:text-base">${{ chartAvgTransaction.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</div>
              <div class="stat-desc xs:text-[10px]">{{ chartFilteredForStats.length }} total transactions</div>
            </div>
            <div class="stat">
              <div class="stat-figure text-secondary xs:stat-figure-sm">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 xs:h-4 xs:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V5a2 2 0 012-2z" />
                </svg>
              </div>
              <div class="stat-title xs:text-xs">Top Category</div>
              <div class="stat-value xs:text-base">{{ chartTopCategory }}</div>
              <div class="stat-desc xs:text-[10px]">by transaction count</div>
            </div>
            <div class="stat">
              <div class="stat-figure text-accent xs:stat-figure-sm">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 xs:h-4 xs:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div class="stat-title xs:text-xs">Date Range</div>
              <div class="stat-value xs:text-base">{{ chartDateRangeLabel }}</div>
              <div class="stat-desc xs:text-[10px]">{{ chartDateSpan }}</div>
            </div>
            <div class="stat">
              <div class="stat-figure text-warning xs:stat-figure-sm">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 xs:h-4 xs:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div class="stat-title xs:text-xs">Income vs Spending</div>
              <div class="stat-value xs:text-base">
                {{ chartIncomeSpendingRatio }}
              </div>
              <div class="stat-desc xs:text-[10px]">ratio</div>
            </div>
          </div>



          <!-- Advanced Settings Modal Popup -->
          <dialog
            v-if="showAdvancedFilters"
            id="advancedSettingsModal"
            class="modal modal-bottom sm:modal-middle"
            ref="advancedSettingsModal"
            :open="showAdvancedFilters"
            role="dialog"
            aria-modal="true"
            aria-labelledby="advancedSettingsTitle"
            @keydown.escape="showAdvancedFilters = false"
          >
            <form method="dialog" class="modal-box max-w-2xl advanced-modal-box">
              <!-- Modal Header (sticky on mobile) -->
              <div class="flex justify-between items-center mb-2 advanced-modal-header">
                <h3 id="advancedSettingsTitle" class="font-bold text-lg flex items-center gap-2">
                  <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  Advanced Settings
                </h3>
                <button
                  type="button"
                  class="btn btn-sm btn-circle btn-ghost focus-ring target-min"
                  @click="showAdvancedFilters = false"
                  aria-label="Close advanced settings"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <!-- Scrollable Content Area -->
              <div class="advanced-modal-content flex-1 overflow-y-auto">
                <p class="text-sm text-base-content/60 mb-3">Customize chart appearance, filters, and data series. Sections collapse to save space.</p>

                <!-- Collapsible: Date & Time Range -->
              <details class="collapse collapse-arrow bg-base-200/50 mb-2 rounded-lg" open>
                <summary class="collapse-title font-semibold flex items-center gap-2 text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Date & Time Range
                  <span class="badge badge-sm badge-info ml-auto">{{ selectedDatePreset || 'Custom' }}</span>
                </summary>
                <div class="collapse-content space-y-4">
                  <!-- Quick Presets (dynamic from transaction data) -->
                  <div>
                    <label class="label cursor-pointer">
                      <span class="label-text font-medium text-xs">Quick Presets</span>
                      <span v-if="transactionDateRange.earliest" class="label-text-alt text-[10px] opacity-60">
                        ({{ formatChartDate(transactionDateRange.earliest) }} → {{ formatChartDate(transactionDateRange.latest) }})
                      </span>
                    </label>
                    <div class="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        v-for="preset in dynamicDatePresets"
                        :key="preset.label"
                        class="btn btn-xs btn-outline focus-ring target-min"
                        :class="{ 'btn-primary': isSelectedPreset(preset) }"
                        @click="applyDatePreset(preset)"
                      >
                        {{ preset.label }}
                      </button>
                    </div>
                  </div>

                  <!-- Custom Range -->
                  <div>
                    <label class="label">
                      <span class="label-text font-medium text-xs">Custom Range</span>
                    </label>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <!-- From Date -->
                      <div>
                        <label class="label" for="chartStartDate">
                          <span class="label-text text-xs">From</span>
                        </label>
                        <DatePicker id="chartStartDate" v-model="dateFilter.start" aria-label="chart start date" :max="dateFilter.end" />
                      </div>

                      <!-- To Date -->
                      <div>
                        <label class="label" for="chartEndDate">
                          <span class="label-text text-xs">To</span>
                        </label>
                        <DatePicker id="chartEndDate" v-model="dateFilter.end" aria-label="chart end date" :min="dateFilter.start" />
                      </div>
                    </div>
                    <p class="text-[10px] text-base-content/50 mt-1.5">
                      💡 Leave empty for unlimited range.
                    </p>
                  </div>
                </div>
              </details>

              <!-- Collapsible: Filter Display Mode (Pie/Doughnut only) -->
              <details v-if="chartConfig.type === 'pie' || chartConfig.type === 'doughnut'" class="collapse collapse-arrow bg-base-200/50 mb-2 rounded-lg" open>
                <summary class="collapse-title font-semibold flex items-center gap-2 text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  </svg>
                  Filter Display Mode
                  <span class="badge badge-sm badge-accent ml-auto">{{ chartFilterDisplayMode === 'both' ? 'Both' : chartFilterDisplayMode === 'categories' ? 'Categories' : 'Tags' }}</span>
                </summary>
                <div class="collapse-content">
                  <div class="join border-base-300 rounded-lg overflow-hidden" role="radiogroup" aria-label="Filter display mode">
                    <button type="button" class="join-item btn btn-sm flex-1 focus-ring target-min" :class="{ 'btn-primary': chartFilterDisplayMode === 'both', 'btn-ghost': chartFilterDisplayMode !== 'both' }" role="radio" :aria-checked="chartFilterDisplayMode === 'both'" @click="chartFilterDisplayMode = 'both'">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 21a18 18 0 0018 0" /></svg>
                      Both
                    </button>
                    <button type="button" class="join-item btn btn-sm flex-1 focus-ring target-min" :class="{ 'btn-primary': chartFilterDisplayMode === 'categories', 'btn-ghost': chartFilterDisplayMode !== 'categories' }" role="radio" :aria-checked="chartFilterDisplayMode === 'categories'" @click="chartFilterDisplayMode = 'categories'">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                      Categories
                    </button>
                    <button type="button" class="join-item btn btn-sm flex-1 focus-ring target-min" :class="{ 'btn-primary': chartFilterDisplayMode === 'tags', 'btn-ghost': chartFilterDisplayMode !== 'tags' }" role="radio" :aria-checked="chartFilterDisplayMode === 'tags'" @click="chartFilterDisplayMode = 'tags'">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                      Tags
                    </button>
                  </div>
                  <p class="text-[10px] text-base-content/50 mt-2">Choose what the pie/doughnut chart groups by. Tags depend on selected categories.</p>
                </div>
              </details>

              <!-- Collapsible: Filter Logic -->
              <details class="collapse collapse-arrow bg-base-200/50 mb-2 rounded-lg">
                <summary class="collapse-title font-semibold flex items-center gap-2 text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filter Logic
                  <span class="badge badge-sm badge-ghost ml-auto">{{ chartSelectionMode === 'or' ? 'OR' : 'AND' }}</span>
                </summary>
                <div class="collapse-content">
                  <div class="join border-base-300 rounded-lg overflow-hidden" role="radiogroup" aria-label="Filter mode">
                    <button type="button" class="join-item btn btn-sm flex-1 focus-ring target-min" :class="{ 'btn-primary': chartSelectionMode === 'or', 'btn-ghost': chartSelectionMode !== 'or' }" role="radio" :aria-checked="chartSelectionMode === 'or'" @click="chartSelectionMode = 'or'">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                      Match Any (OR)
                    </button>
                    <button type="button" class="join-item btn btn-sm flex-1 focus-ring target-min" :class="{ 'btn-primary': chartSelectionMode === 'and', 'btn-ghost': chartSelectionMode !== 'and' }" role="radio" :aria-checked="chartSelectionMode === 'and'" @click="chartSelectionMode = 'and'">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      Match All (AND)
                    </button>
                  </div>
                  <p class="text-[10px] text-base-content/50 mt-2">OR: show items matching any selected filter. AND: show items matching all selected filters.</p>
                </div>
              </details>

              <!-- Collapsible: Categories -->
              <details v-if="chartFilterDisplayMode === 'both' || chartFilterDisplayMode === 'categories'" class="collapse collapse-arrow bg-base-200/50 mb-2 rounded-lg">
                <summary class="collapse-title font-semibold flex items-center gap-2 text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Categories
                  <span class="badge badge-sm badge-primary ml-auto">{{ selectedCategoriesChart.length }}/{{ chartCategories.length }}</span>
                </summary>
                <div class="collapse-content">
                  <div class="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-2 border border-base-300 rounded-lg bg-base-100" role="listbox" aria-multiselectable="true">
                    <button v-for="category in chartCategories" :key="category" type="button" class="badge badge-md badge-outline cursor-pointer focus-ring target-min transition-all hover:scale-105" :class="{ 'badge-primary': selectedCategoriesChart.includes(category) }" role="option" :aria-selected="selectedCategoriesChart.includes(category)" @click="toggleCategoryForChart(category)">{{ category }}</button>
                  </div>
                  <div class="mt-2 flex gap-2">
                    <button type="button" class="btn btn-xs btn-ghost focus-ring target-min" @click="selectAllCategoriesChart()">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>Select All</button>
                    <button type="button" class="btn btn-xs btn-ghost focus-ring target-min" @click="unselectAllCategoriesChart()">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>Clear</button>
                  </div>
                </div>
              </details>

              <!-- Collapsible: Tags -->
              <details v-if="chartFilterDisplayMode === 'both' || chartFilterDisplayMode === 'tags'" class="collapse collapse-arrow bg-base-200/50 mb-2 rounded-lg">
                <summary class="collapse-title font-semibold flex items-center gap-2 text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Tags
                  <span class="badge badge-sm badge-secondary ml-auto">{{ selectedTagsChart.length }}/{{ availableTagsForChart.length }}</span>
                </summary>
                <div class="collapse-content space-y-3">
                  <p class="text-xs text-base-content/60">
                    Select tags to include in chart filtering. Click tags to toggle selection.
                  </p>
                  <div 
                    class="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-3 border border-base-300 rounded-lg bg-base-100"
                    role="listbox"
                    aria-multiselectable="true"
                    aria-label="Available tags"
                  >
                    <button
                      v-for="tag in availableTagsForChart"
                      :key="tag"
                      type="button"
                      class="badge badge-md badge-outline cursor-pointer focus-ring target-min transition-all hover:scale-105"
                      :class="{
                        'badge-secondary text-secondary-content': selectedTagsChart.includes(tag),
                        'opacity-40': selectedTagsChart.length === availableTagsForChart.length
                      }"
                      role="option"
                      :aria-selected="selectedTagsChart.includes(tag)"
                      @click="toggleTagForChart(tag)"
                    >
                      {{ tag }}
                    </button>
                    <span v-if="availableTagsForChart.length === 0" class="text-xs text-base-content/50 italic">
                      No tags available. Add tags to transactions first.
                    </span>
                  </div>
                  <div class="flex gap-2">
                    <button type="button" class="btn btn-xs btn-outline focus-ring target-min flex-1" @click="selectAllAvailableTagsForChart">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                      Select All
                    </button>
                    <button type="button" class="btn btn-xs btn-ghost focus-ring target-min flex-1" @click="unselectAllTagsForChart">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                      Clear Selection
                    </button>
                  </div>
                </div>
              </details>
            </div>

            <!-- Sticky Action Bar -->
            <div class="sticky bottom-0 bg-base-100/95 backdrop-blur border-t border-base-300 p-3 -mx-3 flex justify-between gap-2 safe-area-pb advanced-modal-footer" style="z-index: 10;">
                <button type="button" class="btn btn-sm btn-outline btn-error focus-ring target-min gap-1" @click="resetChartSettings()">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  Reset All
                </button>
                <button type="button" class="btn btn-sm btn-primary focus-ring target-min gap-1" @click="showAdvancedFilters = false">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                  Done
                </button>
              </div>
            </form>
            <form method="dialog" class="modal-backdrop">
              <button @click="showAdvancedFilters = false">close</button>
            </form>
          </dialog>
        </section>



        <!-- About Section -->
        <section
          v-if="activeTab === 'about'"
          :id="'panel-about'"
          role="tabpanel"
          :aria-labelledby="'tab-about'"
          class="card bg-base-100 shadow-xl max-w-4xl mx-auto mt-8"
          tabindex="0"
        >
          <div class="card-body">
            <h2 id="aboutHeading" class="card-title text-2xl font-bold">
              ℹ️ About
            </h2>

            <div class="prose max-w-none space-y-4">
              <h1 class="text-3xl lg:text-4xl font-bold">
                My Budget Forecaster - {{ version }}
              </h1>

              <p class="lead">
                <strong>Finances Personally Tailored</strong><br />
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
                <li>- Support Removing Tags</li>
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
            <DatePicker id="ssFrom" v-model="smartSelect.from" aria-label="selection start date" :max="smartSelect.to" />
          </div>

          <div class="form-control">
            <label class="label" for="ssTo">
              <span class="label-text">To</span>
            </label>
            <DatePicker id="ssTo" v-model="smartSelect.to" aria-label="selection end date" :min="smartSelect.from" />
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

    <!-- Phase 1: Export Format Modal -->
    <dialog v-if="exportModalOpen" class="modal modal-open" aria-modal="true" role="dialog"
      aria-labelledby="exportModalHeading">
      <div class="modal-box w-full max-w-md">
        <h3 id="exportModalHeading" class="font-bold text-lg mb-4">
          📤 Export Your Data
        </h3>

        <!-- Format Selection -->
        <div class="space-y-4">
          <div class="form-control">
            <label class="label" for="exportFormat">
              <span class="label-text">Format</span>
            </label>
            <select id="exportFormat" v-model="exportFormat" class="select select-bordered">
              <option value="json">JSON (Recommended)</option>
              <option value="csv">CSV (Spreadsheet)</option>
              <option value="qif">QIF (Quicken)</option>
            </select>
          </div>

          <div class="form-control">
            <label class="label" for="exportPrefix">
              <span class="label-text">Filename Prefix</span>
            </label>
            <input id="exportPrefix" v-model="exportFilenamePrefix" type="text"
              class="input input-bordered" placeholder="financial-export" />
          </div>

          <!-- Format Info -->
          <div class="alert alert-info text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-5 w-5"
              fill="none" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              <template v-if="exportFormat === 'json'">
                Full data with metadata, best for backups.
              </template>
              <template v-else-if="exportFormat === 'csv'">
                Universal spreadsheet format, works with Excel/Google Sheets.
              </template>
              <template v-else>
                Quicken Interchange Format, compatible with many financial apps.
              </template>
            </span>
          </div>

          <!-- Progress Bar -->
          <div v-if="exportInProgress" class="space-y-2">
            <progress class="progress progress-primary w-full" :value="exportProgress" max="100"></progress>
            <p class="text-xs text-center opacity-70">
              Exporting... {{ exportProgress }}%
            </p>
          </div>
        </div>

        <div class="modal-action">
          <button type="button" class="btn btn-ghost" @click="exportModalOpen = false"
            :disabled="exportInProgress">
            Cancel
          </button>
          <button type="button" class="btn btn-primary" @click="handleExport(exportFormat)"
            :disabled="exportInProgress || transactions.length === 0">
            <span v-if="!exportInProgress">Export Now</span>
            <span v-else class="loading loading-spinner loading-sm"></span>
          </button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button @click="exportModalOpen = false">close</button>
      </form>
    </dialog>

    <!-- Phase 2: Share Code Modal -->
    <dialog v-if="shareCodeModalOpen" class="modal modal-open" aria-modal="true" role="dialog"
      aria-labelledby="shareCodeModalHeading">
      <div class="modal-box w-full max-w-2xl">
        <h3 id="shareCodeModalHeading" class="font-bold text-lg mb-4">
          🔗 Share Codes Generated
        </h3>

        <div class="space-y-4">
          <!-- Batch Info -->
          <div class="alert alert-info text-sm" v-if="shareBatchCount > 1">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-5 w-5"
              fill="none" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              Your data was split into {{ shareBatchCount }} batches ({{ MAX_SHARE_TX }} transactions each).
              Share all codes to transfer complete data.
            </span>
          </div>

          <!-- Share Codes List -->
          <div v-for="(code, index) in shareCodes" :key="index" class="space-y-2">
            <div class="flex justify-between items-center">
              <label class="label">
                <span class="label-text font-semibold">
                  {{ shareBatchCount > 1 ? `Batch ${index + 1} of ${shareBatchCount}` : 'Share Code' }}
                </span>
              </label>
              <span class="text-xs opacity-60">
                {{ code.length }} chars
              </span>
            </div>
            <div class="join">
              <input :value="code" readonly class="input input-bordered join-item flex-1 font-mono text-xs" />
              <button type="button" class="btn btn-sm join-item" @click="copy(code)">
                Copy
              </button>
            </div>
          </div>

          <!-- Phase 4: Expiration Info -->
          <div class="alert alert-warning text-sm" v-if="shareExpirationDays > 0">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-5 w-5"
              fill="none" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>
              These codes will expire in {{ shareExpirationDays }} days
              ({{ new Date(Date.now() + shareExpirationDays * 24 * 60 * 60 * 1000).toLocaleDateString() }}).
            </span>
          </div>
        </div>

        <div class="modal-action">
          <button type="button" class="btn" @click="shareCodeModalOpen = false">
            Close
          </button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button @click="shareCodeModalOpen = false">close</button>
      </form>
    </dialog>

    <!-- Phase 3: Encrypted Share Modal -->
    <dialog v-if="encryptedShareModalOpen" class="modal modal-open" aria-modal="true" role="dialog"
      aria-labelledby="encryptModalHeading">
      <div class="modal-box w-full max-w-md">
        <h3 id="encryptModalHeading" class="font-bold text-lg mb-4">
          🔒 Encrypt Share Data
        </h3>

        <div class="space-y-4">
          <div class="form-control">
            <label class="label cursor-pointer" for="encryptToggle">
              <span class="label-text">Encrypt with password</span>
              <input id="encryptToggle" v-model="encryptShareData" type="checkbox" class="toggle toggle-primary" />
            </label>
          </div>

          <template v-if="encryptShareData">
            <div class="form-control">
              <label class="label" for="sharePassword">
                <span class="label-text">Password</span>
              </label>
              <input id="sharePassword" v-model="sharePassword" type="password"
                class="input input-bordered" placeholder="Enter password" />
            </div>

            <div class="form-control">
              <label class="label" for="confirmPassword">
                <span class="label-text">Confirm Password</span>
              </label>
              <input id="confirmPassword" v-model="shareConfirmPassword" type="password"
                class="input input-bordered" placeholder="Confirm password" />
            </div>

            <div v-if="sharePassword && sharePassword !== shareConfirmPassword"
              class="alert alert-error text-sm">
              <span>Passwords do not match</span>
            </div>

            <div class="alert alert-info text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-5 w-5"
                fill="none" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>
                Your data will be encrypted with AES-256-GCM. Share the password separately.
              </span>
            </div>
          </template>

          <!-- Phase 4: Expiration Options -->
          <div class="form-control">
            <label class="label" for="expirationSelect">
              <span class="label-text">Expiration</span>
            </label>
            <select id="expirationSelect" v-model="shareExpirationDays" class="select select-bordered">
              <option v-for="opt in shareExpirationOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </div>
        </div>

        <div class="modal-action">
          <button type="button" class="btn btn-ghost" @click="encryptedShareModalOpen = false">
            Cancel
          </button>
          <button type="button" class="btn btn-primary" @click="generateShareCodesWithBatching"
            :disabled="encryptShareData && (sharePassword !== shareConfirmPassword || !sharePassword)">
            Generate Share Codes
          </button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button @click="encryptedShareModalOpen = false">close</button>
      </form>
    </dialog>
  </div>
</template>
<script setup lang="ts">
import DatePicker from './components/DatePicker.vue';
import { Chart, LineController, BarController, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend, PieController, DoughnutController, RadarController, ScatterController, RadialLinearScale, Filler } from 'chart.js';
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
import { buildTimeSeriesBuckets, type ChartGroupBy } from "./chartBuckets";

Chart.register(LineController, BarController, PieController, DoughnutController, RadarController, ScatterController, CategoryScale, LinearScale, RadialLinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend, Filler);


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
      // OPTIMIZED: Extract categories once after load instead of on every computed access
      extractCategoriesFromTransactions();
    } catch (e) {
      console.warn("Failed to load persisted transactions:", e);
    }
  }

  // Custom categories
  const rawCats = safeLocalStorageGet(LS_KEYS.cats);
  if (Array.isArray(rawCats)) {
    const cats = rawCats.filter(isString).map(decodeHtmlEntities);
    customCategories.value = sortAlpha(dedupeCI(cats));
  }

  // Tags
  const rawTags = safeLocalStorageGet(LS_KEYS.tags);
  if (Array.isArray(rawTags)) {
    const tg = rawTags.filter(isString).map(decodeHtmlEntities);
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

  // If user has data, land them on Transactions.
  // If they have no data, start them in Import instead of the empty chart shell.
  if (transactions.value.length > 0) {
    activeTab.value = "chart";
  } else if (!showTour.value) {
    activeTab.value = "about";
  }
}

function storageSync(e: StorageEvent) {
  if (!e.key) return;
  // Only respond to our keys
  if (e.key === LS_KEYS.tx) {
    const raw = safeLocalStorageGet(LS_KEYS.tx);
    if (Array.isArray(raw)) {
      transactions.value = raw.map(normalizeTransaction);
      extractCategoriesFromTransactions();
    }
  } else if (e.key === LS_KEYS.cats) {
    const raw = safeLocalStorageGet(LS_KEYS.cats);
    if (Array.isArray(raw)) {
      customCategories.value = sortAlpha(dedupeCI(raw.filter(isString).map(decodeHtmlEntities)));
    }
  } else if (e.key === LS_KEYS.tags) {
    const raw = safeLocalStorageGet(LS_KEYS.tags);
    if (Array.isArray(raw)) {
      tags.value = sortAlpha(dedupeCI(raw.filter(isString).map(decodeHtmlEntities)));
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
  if (transactions.value.length > 0) {
    activeTab.value = "chart";
  } else {
    activeTab.value = "about";
  }
  loadLastRecurringDefaults();
  activeTab.value = transactions.value.length > 0 ? "chart" : "about";
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
  /** Links all occurrences of one recurring series (the anchor's id). */
  seriesId?: string;
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
  // OPTIMIZED: Avoid string concatenation - check fields individually
  // Null-safe: CSV imports can produce null/undefined for string fields
  const desc = (t.description || "").toLowerCase();
  const cat = (t.category || "").toLowerCase();
  const src = (t.source || "").toLowerCase();
  
  if (f.text.length) {
    for (const q of f.text) {
      if (!desc.includes(q) && !cat.includes(q) && !src.includes(q)) return false;
    }
  }
  if (f.not.length) {
    for (const q of f.not) {
      if (desc.includes(q) || cat.includes(q) || src.includes(q)) return false;
    }
  }

  if (f.type && t.type !== f.type) return false;
  if (f.category && !eqi(t.category || "", f.category)) return false;
  if (
    f.source &&
    !src.includes(f.source.toLowerCase())
  )
    return false;

  // exact amount match
  if (f.amount != null && Math.abs((t.amount || 0) - f.amount) > 1e-9) return false;

  // range match
  if (f.min != null && (t.amount || 0) < f.min) return false;
  if (f.max != null && (t.amount || 0) > f.max) return false;

  const tags = t.tags || [];
  if (
    f.tagsInclude.length &&
    !f.tagsInclude.every((tag) => tags.some((tt) => eqi(tt, tag)))
  )
    return false;
  if (
    f.tagsExclude.length &&
    f.tagsExclude.some((tag) => tags.some((tt) => eqi(tt, tag)))
  )
    return false;

  const date = t.date || "";
  if (f.start && date < f.start) return false;
  if (f.end && date > f.end) return false;

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

// Decode HTML entities to fix double-encoding bug (&amp;amp; → &)
// Applies decoding recursively until no more entities remain
function decodeHtmlEntities(s: string): string {
  if (!s) return s;
  let prev = s;
  let decoded = s;
  // Decode multiple passes for deeply encoded data
  for (let i = 0; i < 10; i++) {
    decoded = decoded
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'")
      .replace(/&amp;/g, '&');
    if (decoded === prev) break; // No more entities to decode
    prev = decoded;
  }
  return decoded;
}
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
  // Sanitize: trim, collapse whitespace, strip leading/trailing punctuation (but keep & and hyphens)
  const trimmed = name.trim().replace(/\s+/g, ' ').replace(/^[^\w&-]+|[^\w&-]+$/g, '');
  if (!trimmed) return;

  // Capitalize first letter of each word (including after &)
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
  // Sanitize: trim, collapse whitespace, strip leading/trailing punctuation (but keep & and hyphens)
  let sanitized = name.trim().replace(/\s+/g, ' ').replace(/^[^\w&-]+|[^\w&-]+$/g, '');
  if (!sanitized) return;

  // Validate: max length and character restrictions
  if (sanitized.length > 50) {
    sanitized = sanitized.slice(0, 50);
    pushToast('Tag name shortened to 50 characters', 'warning');
  }

  // Normalize to title case for consistency
  const normalized = sanitized.replace(/\b\w/g, c => c.toUpperCase());

  if (!existsTag(normalized)) {
    tags.value = sortAlpha(dedupeCI([...tags.value, normalized]));
    safeLocalStorageSet(LS_KEYS.tags, tags.value);
  }

  // Find canonical form and toggle
  const canonical = tags.value.find((t) => eqi(t, normalized)) || normalized;
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

// Usage count helper: CACHED to avoid O(n) scan per virtual row
// Uses a Map that only recomputes when transactions actually change
let _categoryUsageMap = new Map<string, number>();
let _tagUsageMap = new Map<string, number>();

function rebuildUsageCounts() {
  _categoryUsageMap.clear();
  _tagUsageMap.clear();
  const tx = transactions.value;
  for (let i = 0; i < tx.length; i++) {
    const t = tx[i];
    const catKey = t.category.toLowerCase();
    _categoryUsageMap.set(catKey, (_categoryUsageMap.get(catKey) || 0) + 1);
    for (const tag of t.tags) {
      const tagKey = tag.toLowerCase();
      _tagUsageMap.set(tagKey, (_tagUsageMap.get(tagKey) || 0) + 1);
    }
  }
}

function getCategoryUsageCount(name: string): number {
  const key = name.toLowerCase();
  if (managerType.value === "category") {
    return _categoryUsageMap.get(key) || 0;
  } else {
    return _tagUsageMap.get(key) || 0;
  }
}

// Core data
// CRITICAL: shallowRef avoids deep proxy overhead on 100k+ transaction objects
// Each mutation must be done via array operations (push, splice, map assignment)
const transactions = shallowRef<Transaction[]>([]);
const DEFAULT_SOURCE = "Unlabeled";

// Watch transactions to rebuild usage counts only when needed
// (Must be after transactions declaration)
watch(transactions, () => {
  rebuildUsageCounts();
});

// UI state
const activeTab = ref<"import" | "add" | "chart" | "transactions" | "about">(
  "about"
);
const showTour = ref(false);
const onboardingStep = ref(0);
const showTips = ref(true);
activeTab.value = "about";
const dismissTips = () => {
  showTips.value = false;
  localStorage.setItem(LS_KEYS.tips, "true");
};
const currentTheme = ref("cupcake");
// Incremented after CSS custom properties propagate on theme switch,
// so chartData only re-evaluates when new colors are actually readable
const themeVersion = ref(0);
const version = ref("v1.0");
type BalanceTablePeriod = "day" | "week" | "month" | "year";
const balanceTablePeriod = ref<BalanceTablePeriod>("month");

// Transaction form
const newTransaction = reactive<Transaction>({
  id: '',
  // Must start as a real date: the date input's computed getter only DISPLAYS
  // today as a fallback; an empty model here gets stored as-is and turns every
  // recurring child date into "NaN-NaN-NaN".
  date: todayLocalISO(),
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
    // Editing an existing transaction loads its values into the form; those
    // programmatic changes must not overwrite the user's add-form defaults.
    if (currentlyEditingId.value) return;
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

// Amount validation
const amountError = ref("");

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

// Helper to check if a preset is currently selected
function isSelectedPreset(preset: { label: string; start: string; end: string }) {
  return dateFilter.value.start === preset.start && dateFilter.value.end === preset.end;
}

// Format ISO date for display (simple helper for chart calendar)
function formatChartDate(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
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

// OPTIMIZED: Lazy category extraction - only iterate transactions once on mount/load
// Then incrementally update on transaction changes
// Declared after categoryNames/customCategories to avoid TDZ
const categorySet = new Set<string>(categoryNames);
customCategories.value.forEach((c) => categorySet.add(c));

// Extract categories from loaded transactions (called after data load)
function extractCategoriesFromTransactions() {
  transactions.value.forEach((t) => categorySet.add(t.category));
}

const allCategories = computed(() => {
  return Array.from(categorySet)
    .filter((c) => !isHiddenCategory(c))
    .sort((a, b) => a.localeCompare(b));
});

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

// Transactions view | 'bubbleHierarchy'
const showAdvancedTransactionsView = ref(false);
const searchQuery = ref('');
const typeFilter = ref<TransactionType | ''>('');
const sourceFilter = ref('');
const sortField = ref<'date' | 'type' | 'amount' | 'category' | 'description'>('date');
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
  type: 'bar' as 'line' | 'bar' | 'pie' | 'doughnut' | 'radar' | 'scatter' | 'bubbleHierarchy' | 'table',
  groupBy: 'monthly' as ChartGroupBy,
});

const showBalanceTable = computed(() => chartConfig.value.type === 'table');

// Reset series toggles to show all when switching back to time-series charts
watch(chartConfig, (newCfg, oldCfg) => {
  const pieishTypes = ['pie', 'doughnut', 'radar', 'scatter', 'bubbleHierarchy', 'table'];
  const timeSeriesTypes = ['line', 'bar'];
  if (oldCfg && pieishTypes.includes(oldCfg.type) && timeSeriesTypes.includes(newCfg.type)) {
    seriesToggles.value = { income: true, spending: true, balance: true, allTimeCumulativeNetBalance: true };
  }
}, { deep: true });

const seriesToggles = ref({ income: true, spending: true, balance: true, allTimeCumulativeNetBalance: true });
const selectedCategories = ref<string[]>([]);
// Chart tab state
const chartSelectionMode = ref<'or' | 'and'>('or');
const selectedCategoriesChart = ref<string[]>([]);
const selectedTagsChart = ref<string[]>([]);
const chartFilterDisplayMode = ref<'both' | 'categories' | 'tags'>('both');
const chartCanvas = ref<HTMLCanvasElement | null>(null);
const chartTooltipEl = ref<HTMLDivElement | null>(null);
const showAdvancedFilters = ref(false);



// Dynamic date range from transaction data
const transactionDateRange = computed(() => {
  if (transactions.value.length === 0) return { earliest: '', latest: '' };
  let earliest = transactions.value[0].date;
  let latest = transactions.value[0].date;
  for (let i = 1; i < transactions.value.length; i++) {
    const d = transactions.value[i].date;
    if (d < earliest) earliest = d;
    if (d > latest) latest = d;
  }
  return { earliest, latest };
});

// Dynamic date presets based on actual transaction data
const dynamicDatePresets = computed(() => {
  const { earliest, latest } = transactionDateRange.value;
  const presets: { label: string; start: string; end: string }[] = [
    { label: 'All Time', start: '', end: '' },
  ];

  if (earliest) {
    // Last 3 months from latest transaction
    const threeMonthsAgo = addMonthsClamped(latest, -3);
    presets.push({ label: 'Last 3 months', start: threeMonthsAgo, end: latest });
    // Last 6 months
    const sixMonthsAgo = addMonthsClamped(latest, -6);
    presets.push({ label: 'Last 6 months', start: sixMonthsAgo, end: latest });
    // Last year
    const oneYearAgo = addMonthsClamped(latest, -12);
    presets.push({ label: 'Last year', start: oneYearAgo, end: latest });
    // This financial year (July-June for AU)
    const latestDate = new Date(latest);
    const currentFY = latestDate.getMonth() >= 6
      ? latestDate.getFullYear()
      : latestDate.getFullYear() - 1;
    presets.push({ label: 'This FY', start: `${currentFY}-07-01`, end: `${currentFY + 1}-06-30` });
    // Since first transaction
    presets.push({ label: 'Since first', start: earliest, end: latest });
  }

  return presets;
});

// Computed tooltip style to avoid calling cssVarToRGB/themeColor on every Vue render cycle
// These are expensive (getComputedStyle + canvas getImageData) and should be cached
const chartTooltipStyle = computed(() => ({
  backgroundColor: withAlpha(cssVarToRGB('--b2'), 0.97),
  color: cssVarToRGB('--bc'),
  borderColor: withAlpha(themeColor('primary'), 0.3),
  borderWidth: '1.5px',
}));

// Tags available based on selected categories (dependency logic)
const availableTagsForChart = computed(() => {
  if (selectedCategoriesChart.value.length === 0) {
    // No categories selected → show all tags
    return chartTags.value;
  }
  // Only show tags from transactions in selected categories
  const tagSet = new Set<string>();
  transactions.value.forEach(t => {
    if (selectedCategoriesChart.value.some(c => eqi(c, t.category))) {
      t.tags.forEach(tag => tagSet.add(tag));
    }
  });
  return Array.from(tagSet).sort((a, b) => a.localeCompare(b));
});

// Watch for category deselection and clear invalid tags
watch(selectedCategoriesChart, (newCats) => {
  const available = availableTagsForChart.value;
  selectedTagsChart.value = selectedTagsChart.value.filter(tag =>
    available.some(a => eqi(a, tag))
  );
}, { deep: true });
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

// ===== EXPORT/SHARE STATE (Phase 1-5) =====
const exportModalOpen = ref(false);
const exportFormat = ref<'json' | 'csv' | 'qif'>('json');
const exportFilenamePrefix = ref('financial-export');
const exportProgress = ref(0);
const exportInProgress = ref(false);

// Share code state
const shareCodeModalOpen = ref(false);
const shareBatchCount = ref(0);
const shareBatchIndex = ref(0);
const shareCodes = ref<string[]>([]);

// Encryption state (Phase 3)
const encryptedShareModalOpen = ref(false);
const sharePassword = ref("");
const shareConfirmPassword = ref("");
const encryptShareData = ref(false);

// Expiration state (Phase 4)
const shareExpirationDays = ref<number>(30);
const shareExpirationOptions = [
  { value: 30, label: '30 days' },
  { value: 60, label: '60 days' },
  { value: 90, label: '90 days' },
  { value: 0, label: 'No expiration' },
];

// Constants
const MAX_SHARE_TX = 800;
const MAX_SHARE_BATCHES = 10;

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
// OPTIMIZED: Use cached category set to avoid iterating all transactions on every keystroke
let _categorySet = new Set<string>();
let _categorySetVersion = 0;

function rebuildCategorySet() {
  _categorySetVersion++;
  _categorySet.clear();
  categoryNames.forEach((c) => _categorySet.add(c));
  customCategories.value.forEach((c) => _categorySet.add(c));
  // Only iterate transactions when they change, not on every search keystroke
  const tx = transactions.value;
  for (let i = 0; i < tx.length; i++) {
    _categorySet.add(tx[i].category);
  }
}

// Watch transactions to rebuild category set only when needed
watch(transactions, () => {
  rebuildCategorySet();
});

// Initial build
rebuildCategorySet();

const managerItems = computed<string[]>(() => {
  // Build the source list from cached set
  let src: string[];
  if (managerType.value === "category") {
    // NOTE: We intentionally do NOT filter out hidden categories here
    // so users can search and restore them from the manager.
    src = Array.from(_categorySet);
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

// Timestamp guard to prevent RAF from overwriting fresher onVirtScroll data
let lastScrollUpdate = 0;
let pendingViewportUpdate = false;
let rafId: number | null = null;

function onVirtScroll() {
  const el = virtViewportRef.value;
  if (!el) return;
  lastScrollUpdate = performance.now(); // mark fresh
  virtScrollTop.value = el.scrollTop;
  virtViewportH.value = el.clientHeight;
}

// Fix mobile viewport changes after scrolling (iOS address bar, Android Chrome)
function handleViewportChange() {
  // Debounce: skip if update already pending
  if (pendingViewportUpdate) return;
  pendingViewportUpdate = true;

  rafId = requestAnimationFrame(() => {
    pendingViewportUpdate = false;
    const el = virtViewportRef.value;
    if (!el) return;

    // Only update refs if values actually changed — prevents unnecessary Vue re-renders
    const newHeight = el.clientHeight;
    const newScrollTop = el.scrollTop;

    if (newHeight !== virtViewportH.value) {
      virtViewportH.value = newHeight;
    }

    const now = performance.now();
    // If onVirtScroll wrote within last 50ms, trust its scrollTop (race guard)
    if (now - lastScrollUpdate >= 50 && newScrollTop !== virtScrollTop.value) {
      virtScrollTop.value = newScrollTop;
    }

    // Force bottom nav reflow so Safari re-evaluates fixed positioning
    const btmNav = document.querySelector('.btm-nav') as HTMLElement | null;
    if (btmNav) { void btmNav.offsetHeight; }
  });
}

onMounted(() => {
  const el = virtViewportRef.value;
  if (el) {
    virtViewportH.value = el.clientHeight;
    virtScrollTop.value = el.scrollTop;
  }
  window.addEventListener("resize", onVirtScroll, { passive: true });
  // Only listen for visual viewport RESIZE (address bar show/hide), not scroll
  // visualViewport 'scroll' fires for page-level scrolls and causes race conditions
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', handleViewportChange, { passive: true });
  }
});

onUnmounted(() => {
  window.removeEventListener("resize", onVirtScroll);
  if (window.visualViewport) {
    window.visualViewport.removeEventListener('resize', handleViewportChange);
  }
  // Cancel pending RAF to prevent updates after unmount
  if (rafId != null) {
    cancelAnimationFrame(rafId);
  }
  // Destroy chart instance to prevent memory leaks
  if (chartInstance) {
    try { chartInstance.destroy(); } catch (e) { /* ignore */ }
    chartInstance = null;
  }
  // Clear pending render timeout
  if (renderTimeoutId) {
    clearTimeout(renderTimeoutId);
    renderTimeoutId = null;
  }
  pendingRenderChart = false;
  chartRenderPromise = null;
  // Clean up bubble hierarchy SVG (no async needed, direct DOM removal)
  if (bubbleHierarchySvg.value) {
    bubbleHierarchySvg.value.innerHTML = '';
  }
  bubbleHierarchyInstance = null;
});

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

// OPTIMIZED: Use pre-computed categorySet instead of re-extracting from all transactions
const categories = computed(() => {
  return Array.from(categorySet)
    .filter((c) => !isHiddenCategory(c))
    .sort((a, b) => a.localeCompare(b));
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

// === Performance Optimizations for 100k+ transactions ===
// Debounced search query to avoid full filter+sort on every keystroke
const debouncedSearchQuery = ref(searchQuery.value);
let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;

watch(searchQuery, (newVal) => {
  currentPage.value = 1;
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
  if (newVal === '') {
    // Immediate clear for empty search (good UX)
    debouncedSearchQuery.value = newVal;
    searchDebounceTimer = null;
  } else {
    searchDebounceTimer = setTimeout(() => {
      debouncedSearchQuery.value = newVal;
      searchDebounceTimer = null;
    }, 150);
  }
});

// Memoized query parser - only re-parse when debounced query changes
let lastParsedQueryRaw = null as string | null;
let lastParsedQuery: ParsedQuery | null = null;

function getCachedParsedQuery(raw: string): ParsedQuery {
  if (raw !== lastParsedQueryRaw) {
    lastParsedQueryRaw = raw;
    lastParsedQuery = parseSmartQuery(raw);
  }
  return lastParsedQuery!;
}

// Transaction filtering and selection
// Base = smart search only (NO chart date filter here)
const baseFilteredBySearch = computed(() => {
  const q = debouncedSearchQuery.value;
  if (!q) return transactions.value; // short-circuit: no filter when query is empty
  const f = getCachedParsedQuery(q);
  return transactions.value.filter((t) => txMatches(t, f));
});

watch(
  [debouncedSearchQuery, typeFilter, () => sortField.value, () => sortOrder.value],
  () => {
    currentPage.value = 1;
  }
);

// Table view uses ONLY smart search (+ optional typeFilter), NOT the chart's date range
// CRITICAL OPTIMIZATION: Partial sort for 100k+ transactions
// Instead of sorting ALL indices O(n log n), we use a two-phase approach:
// Phase 1: Build unsorted indices (O(n))
// Phase 2: Sort only the window needed for current page O(w log w) where w ~ 40
// This makes filter changes instant even with 100k+ transactions
const filteredTransactionIndices = computed(() => {
  if (activeTab.value !== 'transactions') return [];
  const list = baseFilteredBySearch.value;
  const type = typeFilter.value;
  const field = sortField.value;
  const order = sortOrder.value === "asc" ? 1 : -1;
  
  // Build indices of matching transactions (avoids array copy)
  const indices: number[] = [];
  for (let i = 0; i < list.length; i++) {
    const t = list[i];
    if (type && t.type !== type) continue;
    indices.push(i);
  }
  
  // PARTIAL SORT: For large datasets, only sort the page window
  // For small datasets (< 5000), full sort is faster due to lower overhead
  const threshold = 5000;
  if (indices.length > threshold) {
    const offset = (currentPage.value - 1) * itemsPerPage;
    const end = Math.min(offset + itemsPerPage + 20, indices.length);
    
    // Build comparator closure (avoids recreating on each comparison)
    const cmp = buildTxComparator(list, field, order);
    
    // Quickselect: partition so [lo, hi) contains the correct elements
    if (end < indices.length) {
      quickSelectRange(indices, cmp, 0, indices.length - 1, offset, end);
    }
    
    // In-place heapsort only the window [offset, end)
    heapSortRange(indices, cmp, offset, end);
  } else {
    // FAST SORT: Direct string comparison for small datasets
    const cmp = buildTxComparator(list, field, order);
    indices.sort(cmp);
  }
  
  return indices;
});

// Build comparator for transaction indices (avoids closure recreation)
function buildTxComparator(
  list: Transaction[],
  field: string,
  order: number
): (ai: number, bi: number) => number {
  return (ai: number, bi: number) => {
    const a = list[ai];
    const b = list[bi];
    if (field === "amount") {
      return ((a.amount || 0) - (b.amount || 0)) * order;
    }
    const av = String(a[field] ?? "");
    const bv = String(b[field] ?? "");
    return (av < bv ? -1 : av > bv ? 1 : 0) * order;
  };
}

// Quickselect to partition array so elements in [lo, hi) are the correct ones
// Elements outside [lo, hi) are not guaranteed to be sorted
function quickSelectRange(
  arr: number[],
  cmp: (a: number, b: number) => number,
  left: number,
  right: number,
  lo: number,
  hi: number
) {
  if (left >= right) return;
  
  // Median-of-3 pivot selection for better worst-case
  const mid = left + ((right - left) >> 1);
  if (cmp(arr[left], arr[mid]) > 0) [arr[left], arr[mid]] = [arr[mid], arr[left]];
  if (cmp(arr[left], arr[right]) > 0) [arr[left], arr[right]] = [arr[right], arr[left]];
  if (cmp(arr[mid], arr[right]) > 0) [arr[mid], arr[right]] = [arr[right], arr[mid]];
  [arr[mid], arr[right]] = [arr[right], arr[mid]];
  
  const pivot = arr[right];
  let storeIndex = left;
  for (let i = left; i < right; i++) {
    if (cmp(arr[i], pivot) < 0) {
      [arr[storeIndex], arr[i]] = [arr[i], arr[storeIndex]];
      storeIndex++;
    }
  }
  [arr[storeIndex], arr[right]] = [arr[right], arr[storeIndex]];
  
  if (storeIndex > lo) {
    quickSelectRange(arr, cmp, left, storeIndex - 1, lo, hi);
  }
  if (storeIndex < hi - 1) {
    quickSelectRange(arr, cmp, storeIndex + 1, right, lo, hi);
  }
}

// In-place heapsort for range [lo, hi)
function heapSortRange(
  arr: number[],
  cmp: (a: number, b: number) => number,
  lo: number,
  hi: number
) {
  const n = hi - lo;
  // Build max heap
  for (let i = (n >> 1) - 1; i >= 0; i--) {
    heapify(arr, lo, n, i, cmp);
  }
  // Extract elements one by one
  for (let i = n - 1; i > 0; i--) {
    [arr[lo], arr[lo + i]] = [arr[lo + i], arr[lo]];
    heapify(arr, lo, i, 0, cmp);
  }
}

function heapify(
  arr: number[],
  offset: number,
  heapSize: number,
  root: number,
  cmp: (a: number, b: number) => number
) {
  let largest = root;
  const left = (root << 1) + 1;
  const right = (root << 1) + 2;
  
  if (left < heapSize && cmp(arr[offset + left], arr[offset + largest]) > 0) {
    largest = left;
  }
  if (right < heapSize && cmp(arr[offset + right], arr[offset + largest]) > 0) {
    largest = right;
  }
  
  if (largest !== root) {
    [arr[offset + root], arr[offset + largest]] = [arr[offset + largest], arr[offset + root]];
    heapify(arr, offset, heapSize, largest, cmp);
  }
}

// OPTIMIZED: Get sorted count without materializing full array
const filteredTransactionsCount = computed(() => filteredTransactionIndices.value.length);

// Paginated view - only sorts/materializes the current page
const paginatedTransactions = computed(() => {
  const indices = filteredTransactionIndices.value;
  const offset = (currentPage.value - 1) * itemsPerPage;
  const end = offset + itemsPerPage;
  
  // Slice the indices we need, then map to actual transactions
  const pageIndices = indices.slice(offset, end);
  const list: Transaction[] = new Array(pageIndices.length);
  for (let i = 0; i < pageIndices.length; i++) {
    list[i] = baseFilteredBySearch.value[pageIndices[i]];
  }

  const sel = selectedIds.value;
  if (prioritizeSelected.value && list.length > 1) {
    list.sort((a, b) => {
      const pa = sel.has(a.id) ? 1 : 0;
      const pb = sel.has(b.id) ? 1 : 0;
      return pb - pa;
    });
  }

  return list;
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredTransactionsCount.value / itemsPerPage))
);

// Legacy compatibility alias (unfiltered count for template bindings)
const filteredTransactions = computed(() => baseFilteredBySearch.value);

type BalanceTableRow = {
  key: string;
  label: string;
  income: number;
  spending: number;
  balance: number;
  count: number;
  order: number;
};

function formatBalanceTableDate(date: Date): string {
  return new Intl.DateTimeFormat("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getBalanceBucket(dateValue: string | Date, period: BalanceTablePeriod): BalanceTableRow {
  const iso = typeof dateValue === "string" ? parseDateGuess(dateValue) : toLocalISO(dateValue);
  const parsed = iso ? new Date(`${iso}T00:00:00`) : new Date(dateValue);
  const date = Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  const local = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const year = local.getFullYear();
  const month = String(local.getMonth() + 1).padStart(2, "0");
  const day = String(local.getDate()).padStart(2, "0");
  const monthLabel = new Intl.DateTimeFormat("en-AU", {
    month: "short",
    year: "numeric",
  }).format(local);

  if (period === "day") {
    return {
      key: `${year}-${month}-${day}`,
      label: formatBalanceTableDate(local),
      income: 0,
      spending: 0,
      balance: 0,
      count: 0,
      order: local.getTime(),
    };
  }

  if (period === "week") {
    const mondayOffset = (local.getDay() + 6) % 7;
    const start = new Date(local);
    start.setDate(local.getDate() - mondayOffset);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    return {
      key: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-${String(start.getDate()).padStart(2, "0")}`,
      label: `Week of ${formatBalanceTableDate(start)}`,
      income: 0,
      spending: 0,
      balance: 0,
      count: 0,
      order: start.getTime(),
    };
  }

  if (period === "year") {
    const start = new Date(year, 0, 1);
    return {
      key: `${year}`,
      label: `${year}`,
      income: 0,
      spending: 0,
      balance: 0,
      count: 0,
      order: start.getTime(),
    };
  }

  const start = new Date(year, local.getMonth(), 1);
  return {
    key: `${year}-${month}`,
    label: monthLabel,
    income: 0,
    spending: 0,
    balance: 0,
    count: 0,
    order: start.getTime(),
  };
}

const balanceSheetRows = computed(() => {
  const buckets = new Map<string, BalanceTableRow>();
  const source = activeTab.value === 'chart' ? chartFilteredTransactions.value : filteredTransactions.value;

  for (const tx of source) {
    const bucketSeed = getBalanceBucket(tx.date, balanceTablePeriod.value);
    const existing = buckets.get(bucketSeed.key) ?? { ...bucketSeed };

    existing.count += 1;
    if (tx.type === "income") {
      existing.income += tx.amount;
    } else {
      existing.spending += tx.amount;
    }
    existing.balance = existing.income - existing.spending;

    buckets.set(existing.key, existing);
  }

  return [...buckets.values()].sort((a, b) => a.order - b.order);
});

const balanceSheetTotals = computed(() => {
  const income = balanceSheetRows.value.reduce((sum, row) => sum + row.income, 0);
  const spending = balanceSheetRows.value.reduce((sum, row) => sum + row.spending, 0);
  return {
    income,
    spending,
    balance: income - spending,
    count: activeTab.value === 'chart' ? chartFilteredTransactions.value.length : filteredTransactions.value.length,
  };
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

// Chart view applies the chart date range on top of the same base, then applies category/tag filters
// LAZY: Only evaluate when on chart tab to avoid filtering 200k+ transactions unnecessarily
const chartFilteredTransactions = computed(() => {
  if (activeTab.value !== 'chart') return [];
  const { start, end } = dateFilter.value;
  let base = baseFilteredBySearch.value.filter(
    (t) => (!start || t.date >= start) && (!end || t.date <= end)
  );

  // Apply category/tag filtering (same logic as chartData)
  if (chartSelectionMode.value === 'or') {
    if (selectedCategoriesChart.value.length > 0 && selectedTagsChart.value.length > 0) {
      base = base.filter(t =>
        containsCaseIns(selectedCategoriesChart.value, t.category) ||
        t.tags.some(tag => selectedTagsChart.value.some(selectedTag => eqi(tag, selectedTag)))
      );
    } else if (selectedCategoriesChart.value.length > 0) {
      base = base.filter(t => containsCaseIns(selectedCategoriesChart.value, t.category));
    } else if (selectedTagsChart.value.length > 0) {
      base = base.filter(t =>
        t.tags.some(tag => selectedTagsChart.value.some(selectedTag => eqi(tag, selectedTag)))
      );
    }
  } else if (chartSelectionMode.value === 'and') {
    if (selectedCategoriesChart.value.length > 0 && selectedTagsChart.value.length > 0) {
      base = base.filter(t =>
        containsCaseIns(selectedCategoriesChart.value, t.category) &&
        selectedTagsChart.value.every(selectedTag => t.tags.some(tag => eqi(tag, selectedTag)))
      );
    } else if (selectedCategoriesChart.value.length > 0) {
      base = base.filter(t => containsCaseIns(selectedCategoriesChart.value, t.category));
    } else if (selectedTagsChart.value.length > 0) {
      base = base.filter(t =>
        selectedTagsChart.value.some(selectedTag => t.tags.some(tag => eqi(tag, selectedTag)))
      );
    }
  }

  return base;
});

// REMOVED: Duplicate declarations of totalPages/pageOffset/paginatedTransactions
// Now using optimized versions defined earlier that sort only current page

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

// Statistics: netBalance always computed from ALL transactions (so navbar badge is accurate on every tab)
// Chart-specific stats use chartFilteredTransactions when on chart tab
// OPTIMIZED: Single-pass computation - one O(n) scan instead of two separate filter+reduce passes
function getTotals(): { income: number; expenses: number } {
  const tx = transactions.value;
  let income = 0;
  let expenses = 0;
  for (let i = 0; i < tx.length; i++) {
    const t = tx[i];
    if (t.type === "income") income += t.amount;
    else if (t.type === "spending") expenses += t.amount;
  }
  return { income, expenses };
}
const totalIncome = computed(() => getTotals().income);
const totalExpenses = computed(() => getTotals().expenses);
const netBalance = computed(() => totalIncome.value - totalExpenses.value);

// Pre-format balance string to avoid .toLocaleString() in template on every render
// This moves the expensive formatting into the computed cache layer
const netBalanceFormatted = computed(() => {
  const nb = netBalance.value;
  const abs = Math.abs(nb);
  return {
    sign: nb < 0 ? '-$' : '$',
    value: abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    ariaLabel: nb >= 0
      ? `Balance: $${abs.toFixed(2)}`
      : `Balance: negative $${abs.toFixed(2)}`,
  };
});

// Chart-specific stats (only evaluated when chart tab is mounted via v-if)
const chartFilteredForStats = computed(() => {
  if (typeof chartFilteredTransactions !== 'undefined') {
    return chartFilteredTransactions.value;
  }
  return filteredTransactions.value;
});
const incomeTransactions = computed(() =>
  chartFilteredForStats.value.filter((t) => t.type === "income")
);
const expenseTransactions = computed(() =>
  chartFilteredForStats.value.filter((t) => t.type === "spending")
);
const chartTotalIncome = computed(() =>
  incomeTransactions.value.reduce((s, t) => s + t.amount, 0)
);
const chartTotalExpenses = computed(() =>
  expenseTransactions.value.reduce((s, t) => s + t.amount, 0)
);
const chartNetBalance = computed(() => chartTotalIncome.value - chartTotalExpenses.value);
const chartSavingsRate = computed(() => {
  if (chartTotalIncome.value <= 0) return null;
  return (chartNetBalance.value / chartTotalIncome.value) * 100;
});

// Additional chart stats
const chartAvgTransaction = computed(() => {
  const count = chartFilteredForStats.value.length;
  if (count === 0) return 0;
  const total = chartFilteredForStats.value.reduce((s, t) => s + t.amount, 0);
  return total / count;
});

const chartTopCategory = computed(() => {
  const counts: Record<string, number> = {};
  for (const t of chartFilteredForStats.value) {
    counts[t.category] = (counts[t.category] || 0) + 1;
  }
  let top = '—';
  let max = 0;
  for (const [cat, cnt] of Object.entries(counts)) {
    if (cnt > max) {
      max = cnt;
      top = cat;
    }
  }
  return top;
});

const chartDateRangeLabel = computed(() => {
  const txs = chartFilteredForStats.value;
  if (txs.length === 0) return '—';
  const dates = txs.map(t => t.date).filter(Boolean).sort();
  if (dates.length === 0) return '—';
  const fmt = (d: string) => {
    const dt = new Date(d);
    return dt.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
  };
  if (dates[0] === dates[dates.length - 1]) return fmt(dates[0]);
  return `${fmt(dates[0])} – ${fmt(dates[dates.length - 1])}`;
});

const chartDateSpan = computed(() => {
  const txs = chartFilteredForStats.value;
  if (txs.length < 2) return '';
  const dates = txs.map(t => t.date).filter(Boolean).sort();
  const start = new Date(dates[0]).getTime();
  const end = new Date(dates[dates.length - 1]).getTime();
  const days = Math.round((end - start) / (1000 * 60 * 60 * 24));
  if (days < 30) return `${days} days`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months > 1 ? 's' : ''}`;
  const years = (days / 365.25).toFixed(1);
  return `${years} years`;
});

const chartIncomeSpendingRatio = computed(() => {
  if (chartTotalExpenses.value === 0) return chartTotalIncome.value > 0 ? '∞ : 1' : '—';
  const ratio = chartTotalIncome.value / chartTotalExpenses.value;
  return `${ratio.toFixed(1)} : 1`;
});

// WCAG 1.3.1: Accessible chart description for screen readers
function getChartAriaLabel() {
  const type = chartConfig.value.type;
  const count = filteredTransactions.value.length;
  const balance = netBalance.value >= 0 ? 'surplus' : 'deficit';
  const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `Financial ${type} chart showing ${count} transactions with ${balance} of $${fmt(Math.abs(netBalance.value))}. Income: $${fmt(totalIncome.value)}, Spending: $${fmt(totalExpenses.value)}.`;
}

const chartPeriodLabel = computed(() => {
  const { start, end } = dateFilter.value;
  if (!start && !end) return 'All Time';
  const fmt = (d: string) => {
    const dt = new Date(d);
    return dt.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
  };
  if (start && end) return `${fmt(start)} – ${fmt(end)}`;
  if (start) return `From ${fmt(start)}`;
  return `Until ${fmt(end)}`;
});

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

// Read CSS custom properties directly from :root (document.documentElement)
// DaisyUI 4.x stores theme tokens as OKLCH values (e.g., "75.46% 0.183 346.81")
// Uses Canvas 2D pixel rendering to convert OKLCH to RGB
// PERFORMANCE: Cache resolved RGB values per theme version to avoid redundant
// getComputedStyle() + canvas getImageData() on every render/hover/animation frame.
let _canvas: HTMLCanvasElement | null = null;
let _ctx: CanvasRenderingContext2D | null = null;

function getCanvas(): CanvasRenderingContext2D {
  if (!_canvas) {
    _canvas = document.createElement("canvas");
    _canvas.width = 1;
    _canvas.height = 1;
    _ctx = _canvas.getContext("2d", { willReadFrequently: true });
  }
  return _ctx!;
}

// Cache: varName -> resolved RGB string, invalidated on theme change
let _cssVarCache: Map<string, string> | null = null;

function cssVarToRGB(varName: string): string {
  // Fast path: return cached value if cache is still valid
  if (_cssVarCache?.has(varName)) return _cssVarCache.get(varName)!;
  
  const rootStyles = getComputedStyle(document.documentElement);
  const value = rootStyles.getPropertyValue(varName).trim();
  if (!value) {
    _cssVarCache?.set(varName, "rgb(0,0,0)");
    return "rgb(0,0,0)";
  }
  
  // If the value is already an RGB/RGBA string, return it directly
  if (value.startsWith('rgb')) {
    _cssVarCache?.set(varName, value);
    return value;
  }
  
  // Use Canvas pixel rendering to convert OKLCH to RGB
  // Modern browsers keep OKLCH internally, so fillStyle returns OKLCH as-is
  // Drawing a pixel and reading the image data gives us actual RGB values
  const ctx = getCanvas();
  ctx.fillStyle = `oklch(${value})`;
  ctx.fillRect(0, 0, 1, 1);
  const data = ctx.getImageData(0, 0, 1, 1).data;
  const rgb = `rgb(${data[0]}, ${data[1]}, ${data[2]})`;
  _cssVarCache?.set(varName, rgb);
  return rgb;
}

function withAlpha(rgbOrRgba: string, alpha = 1): string {
  const m = rgbOrRgba.match(
    /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/i
  );
  if (!m) return rgbOrRgba;
  const r = +m[1], g = +m[2], b = +m[3];
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Cache: "token:alpha" -> resolved color string, invalidated on theme change
let _themeColorCache: Map<string, string> | null = null;

function themeColor(token: Token, alpha = 1): string {
  const cacheKey = `${token}:${alpha}`;
  if (_themeColorCache?.has(cacheKey)) return _themeColorCache.get(cacheKey)!;
  const result = withAlpha(cssVarToRGB(TOKEN_VAR[token]), alpha);
  _themeColorCache?.set(cacheKey, result);
  return result;
}

// Invalidate caches when theme changes (called by the theme watcher)
function invalidateColorCaches() {
  _cssVarCache = new Map();
  _themeColorCache = new Map();
}

function themePalette(n: number): string[] {
  // Expanded seed palette: 8 vibrant, high-contrast tokens (no neutral)
  // Ordered for maximum hue diversity across the spectrum
  const seeds: Token[] = [
    "primary",    // Blue
    "success",    // Green
    "warning",    // Yellow
    "error",      // Red
    "info",       // Cyan
    "secondary",  // Purple
    "accent",     // Pink
    "neutral",    // Slate (last position, only for >8 categories)
  ];
  const out: string[] = [];
  for (let i = 0; i < n; i++) {
    const seedIdx = i % seeds.length;
    const cycle = Math.floor(i / seeds.length);

    if (cycle === 0) {
      // First cycle: base theme colors with slight opacity for WCAG contrast
      out.push(themeColor(seeds[seedIdx], 0.88));
    } else {
      // Subsequent cycles: 45° hue rotation for better separation
      const baseRGB = cssVarToRGB(TOKEN_VAR[seeds[seedIdx]]);
      const rotated = shiftHue(baseRGB, cycle * 45);
      // Gentler alpha decay: 0.88 → 0.78 (vs 0.65 before)
      out.push(withAlpha(rotated, Math.max(0.78, 0.88 - cycle * 0.05)));
    }
  }
  return out;
}

function normalizeChartLabel(label: string): string {
  return label.trim().toLowerCase();
}

function hashChartLabel(label: string): number {
  let hash = 0;
  for (let i = 0; i < label.length; i++) {
    hash = (hash * 31 + label.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  const hue = ((h % 360) + 360) % 360 / 360;

  if (s === 0) {
    const gray = Math.round(l * 255);
    return { r: gray, g: gray, b: gray };
  }

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  const hue2rgb = (p0: number, q0: number, t0: number) => {
    let t = t0;
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p0 + (q0 - p0) * 6 * t;
    if (t < 1 / 2) return q0;
    if (t < 2 / 3) return p0 + (q0 - p0) * (2 / 3 - t) * 6;
    return p0;
  };

  return {
    r: Math.round(hue2rgb(p, q, hue + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, hue) * 255),
    b: Math.round(hue2rgb(p, q, hue - 1 / 3) * 255),
  };
}

// Global category-to-palette-index map (persisted across renders)
const categoryPaletteMap = new Map<string, number>();
let categoryPaletteCounter = 0;

function getCategoryPaletteIndex(label: string): number {
  const normalized = normalizeChartLabel(label);
  if (!normalized) return 0;
  if (!categoryPaletteMap.has(normalized)) {
    categoryPaletteMap.set(normalized, categoryPaletteCounter++);
  }
  return categoryPaletteMap.get(normalized)!;
}

function stableLabelColor(label: string, alpha = 1): string {
  const normalized = normalizeChartLabel(label);
  if (!normalized) return themeColor("primary", alpha);

  // Use theme-aware palette: each category gets a persistent index into themePalette
  const idx = getCategoryPaletteIndex(label);
  // themePalette generates colors from DaisyUI theme tokens
  // We need enough colors for all categories, so request idx+1 colors and take the last one
  const palette = themePalette(idx + 1);
  return withAlpha(palette[idx], alpha);
}

// ── Unified Category / Tag Color Map ──
// Deterministic label→color mapping so the same category or tag stays the same
// color across pie, radar, scatter, bubble, and bubble hierarchy diagrams.
function getCategoryColor(category: string): string {
  return stableLabelColor(category);
}

function formatChartTooltipTitle(label: string): string {
  if (!label) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(label)) {
    const d = new Date(`${label}T00:00:00`);
    return d.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
  if (/^\d{4}-\d{2}$/.test(label)) {
    const [year, month] = label.split("-");
    const d = new Date(Number(year), Number(month) - 1, 1);
    return d.toLocaleDateString(undefined, { month: "short", year: "numeric" });
  }
  if (/^\d{4}-Q\d$/.test(label)) {
    const [year, quarter] = label.split("-Q");
    return `Q${quarter} ${year}`;
  }
  return label;
}

function resolveTooltipColor(ctx: any): string {
  const background = ctx.dataset?.backgroundColor;
  if (Array.isArray(background)) {
    return background[ctx.dataIndex] ?? background[0] ?? themeColor("primary");
  }

  const border = ctx.dataset?.borderColor;
  if (Array.isArray(border)) {
    return border[ctx.dataIndex] ?? border[0] ?? themeColor("primary");
  }
  return border ?? background ?? themeColor("primary");
}

// Shift hue of an RGB color by degrees (0-360)
function shiftHue(rgb: string, degrees: number): string {
  const m = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (!m) return rgb;
  let r = +m[1] / 255, g = +m[2] / 255, b = +m[3] / 255;

  // RGB to HSL
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  // Shift hue
  h = (h + degrees / 360) % 1;
  if (h < 0) h += 1;

  // HSL to RGB
  const hue2rgb = (p: number, q: number, t: number) => {
    let u = t < 0 ? t + 1 : t;
    let v = u > 1 ? u - 1 : u;
    if (u < 1 / 6) return p + (q - p) * 6 * u;
    if (u < 1 / 2) return q;
    if (u < 2 / 3) return p + (q - p) * (2 / 3 - u) * 6;
    return p;
  };

  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`;
}

// Charts
// LAZY: Only extract categories/tags when on chart tab (saves O(n) iteration on 200k+ transactions)
const chartCategories = computed(() => {
  if (activeTab.value !== 'chart') return [];
  const s = new Set<string>();
  transactions.value.forEach((t) => s.add(t.category));
  // Stable order keeps palette assignment consistent across pie/donut/radar/scatter/bubble views.
  return [...s]
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  return Array.from(s).sort();
});

const showAllCategoryBadges = ref(false);
const BADGE_INITIAL_SHOW = 6;
const visibleChartCategories = computed(() =>
  showAllCategoryBadges.value ? chartCategories.value : chartCategories.value.slice(0, BADGE_INITIAL_SHOW)
);

const chartTags = computed(() => {
  if (activeTab.value !== 'chart') return [];
  const s = new Set<string>();
  transactions.value.forEach((t) => t.tags.forEach(tag => s.add(tag)));
  // Stable order keeps tag-driven diagram colors consistent too.
  return [...s]
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  return Array.from(s).sort();
});


// LAZY: Only compute chart data when on chart tab
const chartData = computed(() => {
  // React to themeVersion (incremented after CSS propagates) so colors re-bake
  const _v = themeVersion.value;
  if (activeTab.value !== 'chart' || showBalanceTable.value) return { labels: [], datasets: [] };
  // Bubble hierarchy uses D3.js, not Chart.js - return empty to prevent Chart.js rendering
  if (chartConfig.value.type === 'bubbleHierarchy') {
    return { labels: [], datasets: [] };
  }

  const sourceList = typeof chartFilteredTransactions !== 'undefined'
    ? chartFilteredTransactions.value
    : filteredTransactions.value;

  let base = sourceList;

  if (chartSelectionMode.value === 'or') {
    // OR mode: must have selected category OR selected tag
    if (selectedCategoriesChart.value.length > 0 && selectedTagsChart.value.length > 0) {
      // Both categories and tags selected: include if matches either
      base = base.filter(t =>
        containsCaseIns(selectedCategoriesChart.value, t.category) ||
        t.tags.some(tag => selectedTagsChart.value.some(selectedTag => eqi(tag, selectedTag)))
      );
    } else if (selectedCategoriesChart.value.length > 0) {
      // Only categories selected: filter by categories
      base = base.filter(t => containsCaseIns(selectedCategoriesChart.value, t.category));
    } else if (selectedTagsChart.value.length > 0) {
      // Only tags selected: filter by tags
      base = base.filter(t =>
        t.tags.some(tag => selectedTagsChart.value.some(selectedTag => eqi(tag, selectedTag)))
      );
    }
  } else if (chartSelectionMode.value === 'and') {
    // AND mode: must have ALL selected categories AND ALL selected tags
    if (selectedCategoriesChart.value.length > 0 && selectedTagsChart.value.length > 0) {
      base = base.filter(t =>
        containsCaseIns(selectedCategoriesChart.value, t.category) &&
        selectedTagsChart.value.every(selectedTag => t.tags.some(tag => eqi(tag, selectedTag)))
      );
    } else if (selectedCategoriesChart.value.length > 0) {
      // Only categories selected
      base = base.filter(t => containsCaseIns(selectedCategoriesChart.value, t.category));
    } else if (selectedTagsChart.value.length > 0) {
      // Only tags selected
      base = base.filter(t =>
        selectedTagsChart.value.some(selectedTag => t.tags.some(tag => eqi(tag, selectedTag)))
      );
    }
  }

  // ── Pie / Doughnut ──
  if (chartConfig.value.type === 'pie' || chartConfig.value.type === 'doughnut') {
    const displayMode = chartFilterDisplayMode.value;
    const byGroup: Record<string, number> = {};

    if (displayMode === 'tags') {
      // Group by tags only
      base.forEach(t => {
        if (t.type === 'spending') {
          t.tags.forEach(tag => {
            byGroup[tag] = (byGroup[tag] || 0) + t.amount;
          });
        }
      });
    } else if (displayMode === 'both') {
      // Group by category with tag subtotals
      base.forEach(t => {
        if (t.type === 'spending') {
          const catKey = t.category;
          byGroup[catKey] = (byGroup[catKey] || 0) + t.amount;
        }
      });
    } else {
      // Default: categories only
      base.forEach(t => {
        if (t.type === 'spending') {
          byGroup[t.category] = (byGroup[t.category] || 0) + t.amount;
        }
      });
    }

    const labels = Object.keys(byGroup).sort((a, b) => byGroup[b] - byGroup[a]);
    const data = labels.map(k => byGroup[k]);

    // Unified category color mapping: same category = same color across ALL chart types
    const spendingColors = labels.map(cat => getCategoryColor(cat));

    const datasetLabel = displayMode === 'tags' ? 'Spending by Tag' : 'Spending by Category';

    return {
      labels,
      datasets: [{
        label: datasetLabel,
        data,
        backgroundColor: spendingColors,
        borderColor: themeColor("base1"),
        borderWidth: 2,
        hoverOffset: 10,
      }],
    };
  }

  // ── Radar ──
  if (chartConfig.value.type === 'radar') {
    const byMonth: Record<string, Record<string, number>> = {};
    
    base.forEach(t => {
      const d = typeof t.date === 'string' ? new Date(t.date) : t.date;
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!byMonth[monthKey]) byMonth[monthKey] = {};
      const cat = t.category || 'Uncategorized';
      byMonth[monthKey][cat] = (byMonth[monthKey][cat] || 0) + t.amount;
    });

    const allCategories = Array.from(
      new Set(Object.values(byMonth).flatMap(m => Object.keys(m)))
    ).sort();
    
    const months = Object.keys(byMonth).sort();
    const datasets = allCategories
      .filter((_) => months.length > 0) // Only include if we have months
      .slice(0, 8) // Limit to 8 categories for readability
      .map((cat) => {
        // Unified category color: same category = same color across ALL chart types
        const color = getCategoryColor(cat);
        return {
          label: cat,
          data: months.map(m => byMonth[m][cat] || 0),
          borderColor: color,
          backgroundColor: withAlpha(color, 0.2),
          borderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: color,
          tension: 0.3,
        };
      });

    return {
      labels: months,
      datasets,
    };
  }

  // ── Scatter ──
  if (chartConfig.value.type === 'scatter') {
    const spendingPoints = base
      .filter(t => t.type === 'spending')
      .sort((a, b) => String(a.date).localeCompare(String(b.date)))
      .map((t) => {
        const d = typeof t.date === 'string' ? new Date(t.date) : new Date(t.date);
        return {
          x: d.getTime(),
          y: t.amount,
          // Store category for color coding
          category: t.category,
        };
      });

    const incomePoints = base
      .filter(t => t.type === 'income')
      .sort((a, b) => String(a.date).localeCompare(String(b.date)))
      .map((t) => {
        const d = typeof t.date === 'string' ? new Date(t.date) : new Date(t.date);
        return {
          x: d.getTime(),
          y: t.amount,
          category: t.category,
        };
      });

    // Group spending by category for better visualization
    const spendingByCategory: Record<string, any[]> = {};
    spendingPoints.forEach(p => {
      const cat = p.category || 'Uncategorized';
      if (!spendingByCategory[cat]) spendingByCategory[cat] = [];
      spendingByCategory[cat].push({ x: p.x, y: p.y });
    });

    const datasets = [];

    // Unified category color mapping: same category = same color across ALL chart types
    Object.entries(spendingByCategory).forEach(([cat, points]) => {
      const color = getCategoryColor(cat);
      datasets.push({
        label: cat,
        data: points,
        backgroundColor: withAlpha(color, 0.6),
        borderColor: color,
        pointRadius: Math.min(5, Math.max(3, 100 / points.length)), // Dynamic sizing based on data density
        pointHoverRadius: 8,
        pointStyle: 'circle' as const,
        pointBorderWidth: 2,
      });
    });

    if (incomePoints.length > 0) {
      datasets.push({
        label: 'Income',
        data: incomePoints.map(p => ({ x: p.x, y: p.y })),
        backgroundColor: withAlpha(themeColor("success"), 0.7),
        borderColor: themeColor("success"),
        pointRadius: 6,
        pointHoverRadius: 9,
        pointStyle: 'triangle' as const,
        pointBorderWidth: 2,
      });
    }

    // Generate labels as dates (every 10th unique date to avoid clutter)
    const allDates = [...spendingPoints, ...incomePoints].map(p => p.x);
    const uniqueDates = Array.from(new Set(allDates)).sort((a, b) => a - b);
    const labelDates = uniqueDates.filter((_, i) => i % Math.max(1, Math.floor(uniqueDates.length / 10)) === 0);

    return {
      labels: labelDates.map(d => {
        const dateObj = new Date(d);
        return typeof dateObj === 'string' ? dateObj : toLocalISO(dateObj);
      }),
      datasets,
    };
  }

  // ── Line / Bar (time series) ──
  const buckets = buildTimeSeriesBuckets(base, chartConfig.value.groupBy, dateFilter.value);
  const { labels, income, spending, balance, cumulative } = buckets;

  // Calculate Y-axis range from only VISIBLE datasets for dynamic scaling
  // This ensures the scale adjusts when datasets are toggled on/off via the legend
  const visibleData: number[] = [];
  if (seriesToggles.value.income) visibleData.push(...income);
  if (seriesToggles.value.spending) visibleData.push(...spending);
  if (seriesToggles.value.balance) visibleData.push(...balance);
  if (seriesToggles.value.allTimeCumulativeNetBalance) visibleData.push(...cumulative);

  const allValues = visibleData.filter(v => typeof v === 'number' && isFinite(v));
  const dataMin = Math.min(...allValues);
  const dataMax = Math.max(...allValues);
  const dataRange = dataMax - dataMin || 1;
  const padding = dataRange * 0.15; // 15% padding above/below
  let yMin = dataMin - padding;
  let yMax = dataMax + padding;
  // Ensure zero is included if data crosses zero or is close to it
  if (dataMin < 0 && dataMax > 0) {
    yMin = Math.min(yMin, 0);
    yMax = Math.max(yMax, 0);
  } else if (dataMin >= 0) {
    yMin = Math.min(yMin, 0); // Always show baseline
  }

  const t = chartConfig.value.type;
  const datasets: any[] = [];

  // Dynamic theme-aware colors: tie into DaisyUI theme selection
  const incomeColor = themeColor('success');          // green from theme
  const spendingColor = themeColor('error');          // red from theme
  const balanceColor = themeColor('primary');         // blue from theme
  const cumulativeColor = themeColor('secondary');    // purple from theme

  datasets.push({
    label: "Income",
    data: income,
    type: t,
    hidden: !seriesToggles.value.income,
    tension: 0.25,
    borderWidth: t === 'bar' ? 2 : 3,
    backgroundColor: t === 'bar' ? withAlpha(incomeColor, 0.85) : withAlpha(incomeColor, 0.12),
    borderColor: incomeColor,
    pointRadius: t === 'line' ? 3 : 0,
    pointHoverRadius: t === 'line' ? 6 : 0,
    pointBackgroundColor: t === 'line' ? themeColor('base1') : undefined,
    pointBorderColor: incomeColor,
    pointBorderWidth: t === 'line' ? 2 : 0,
    pointStyle: t === 'line' ? 'circle' : undefined,
    borderRadius: t === 'bar' ? 4 : undefined,
    categoryPercentage: t === 'bar' ? 1.0 : undefined,
    barPercentage: t === 'bar' ? 0.9 : undefined,
  });

  datasets.push({
    label: "Spending",
    data: spending,
    type: t,
    hidden: !seriesToggles.value.spending,
    tension: 0.25,
    borderWidth: t === 'bar' ? 2 : 3,
    backgroundColor: t === 'bar' ? withAlpha(spendingColor, 0.85) : withAlpha(spendingColor, 0.12),
    borderColor: spendingColor,
    pointRadius: t === 'line' ? 3 : 0,
    pointHoverRadius: t === 'line' ? 6 : 0,
    pointBackgroundColor: t === 'line' ? themeColor('base1') : undefined,
    pointBorderColor: spendingColor,
    pointBorderWidth: t === 'line' ? 2 : 0,
    pointStyle: t === 'line' ? 'rect' : undefined,
    borderRadius: t === 'bar' ? 4 : undefined,
    categoryPercentage: t === 'bar' ? 1.0 : undefined,
    barPercentage: t === 'bar' ? 0.9 : undefined,
  });

  datasets.push({
    label: "Period Net",
    data: balance,
    type: t,
    hidden: !seriesToggles.value.balance,
    borderWidth: t === 'bar' ? 2 : 3,
    pointRadius: t === 'line' ? 3 : 0,
    pointHoverRadius: t === 'line' ? 6 : 0,
    tension: 0.25,
    fill: false,
    backgroundColor: t === 'bar' ? withAlpha(balanceColor, 0.85) : withAlpha(balanceColor, 0.12),
    borderColor: balanceColor,
    pointBackgroundColor: t === 'line' ? themeColor('base1') : undefined,
    pointBorderColor: balanceColor,
    pointBorderWidth: t === 'line' ? 2 : 0,
    pointStyle: t === 'line' ? 'triangle' : undefined,
    borderRadius: t === 'bar' ? 4 : undefined,
    categoryPercentage: t === 'bar' ? 1.0 : undefined,
    barPercentage: t === 'bar' ? 0.9 : undefined,
  });

  datasets.push({
    label: "Cumulative Net",
    data: cumulative,
    type: "line",
    hidden: !seriesToggles.value.allTimeCumulativeNetBalance,
    borderWidth: 0, // Hide Chart.js line - will be redrawn by plugin at boundary positions
    pointRadius: 0, // Hide Chart.js points - will be redrawn by plugin
    pointHoverRadius: 0,
    tension: 0.2,
    fill: false,
    borderColor: cumulativeColor,
    backgroundColor: withAlpha(cumulativeColor, 0.1),
  });

  return { labels, datasets, yMin, yMax };

});



// Chart instance management
let chartInstance: Chart | null = null;
let chartRenderPromise: Promise<void> | null = null;
let pendingRenderChart = false;
let renderTimeoutId: ReturnType<typeof setTimeout> | null = null;
const RENDER_DEBOUNCE_MS = 150; // Debounce time between chart re-renders
const chartLoading = ref(false); // Loading state for skeleton overlay

/**
 * Debounced render wrapper to prevent rapid successive renders
 */
async function debouncedRenderChart() {
  // Clear any pending timeout
  if (renderTimeoutId) {
    clearTimeout(renderTimeoutId);
    renderTimeoutId = null;
  }
  
  // If a render is already in progress, mark as pending
  if (chartRenderPromise) {
    pendingRenderChart = true;
    return;
  }
  
  // Schedule render after debounce delay
  renderTimeoutId = setTimeout(async () => {
    renderTimeoutId = null;
    await renderChart();
  }, RENDER_DEBOUNCE_MS);
}

/**
 * Renders the chart with proper race condition handling.
 * Uses debouncing and promise tracking to prevent "Canvas already in use" errors.
 */
async function renderChart() {
  // If a render is already in progress, mark as pending and return
  // The pending render will be handled after the current one completes
  if (chartRenderPromise) {
    pendingRenderChart = true;
    return;
  }

  // Balance table mode replaces the chart surface entirely.
  if (showBalanceTable.value) {
    if (chartInstance) { chartInstance.destroy(); chartInstance = null; }
    chartLoading.value = false;
    return;
  }

  // Skip Chart.js rendering for bubble hierarchy (uses D3.js instead)
  if (chartConfig.value.type === 'bubbleHierarchy') {
    if (chartInstance) { chartInstance.destroy(); chartInstance = null; }
    return;
  }

  chartRenderPromise = (async () => {
    try {
      if (!chartCanvas.value || chartData.value.labels.length === 0) {
        // Destroy if no data
        if (chartInstance) { chartInstance.destroy(); chartInstance = null; }
        return;
      }

      // Destroy previous instance with proper cleanup
      // Ensure complete cleanup before reusing canvas
      if (chartInstance) {
        chartLoading.value = true;
        try {
          chartInstance.destroy();
          chartInstance = null;
        } catch (e) {
          console.warn('Chart destroy error:', e);
          chartInstance = null;
        }
        await nextTick();
        await new Promise(r => setTimeout(r, 50)); // Reduced delay for faster chart switching
      }

      // Dynamic import (works without build tooling)
      const { Chart, registerables } = await import('chart.js');
      Chart.register(...registerables);

      const data = JSON.parse(JSON.stringify(chartData.value));
      const type = chartConfig.value.type;
      const isPieish = type === 'pie' || type === 'doughnut';
      const isRadar = type === 'radar';
      const isScatter = type === 'scatter';

      data.datasets = data.datasets.map((ds: any) => ({
        ...ds,
        type: ds.type ?? chartConfig.value.type,
      }));

      // Custom crosshair plugin for x-axis highlighting (end-of-month positioning)
      const crosshairPlugin: any = {
        id: 'crosshair',
        afterDraw: (chart: any) => {
          if (isPieish || isRadar || isScatter) return;
          const ctx = chart.ctx;
          const activePoints = chart.tooltip?._active;
          if (!activePoints || activePoints.length === 0) return;

          const xScale = chart.scales?.x;
          const yScale = chart.scales?.y;
          if (!xScale || !yScale) return;

          // Theme-aware crosshair: use secondary token for visual distinction from segment lines
          const crosshairColor = themeColor('secondary');

          const activeIndex = activePoints[0].index;
          const datasetMeta = chart.getDatasetMeta(0);
          if (!datasetMeta || !datasetMeta.data || !datasetMeta.data[activeIndex]) return;

          // Calculate end-of-month position (midpoint between current and next data point)
          const currentPoint = datasetMeta.data[activeIndex];
          let endOfMonthX = currentPoint.x;

          if (activeIndex + 1 < datasetMeta.data.length) {
            const nextPoint = datasetMeta.data[activeIndex + 1];
            endOfMonthX = (currentPoint.x + nextPoint.x) / 2;
          } else {
            // Last data point - use right edge of chart area
            endOfMonthX = xScale.right - 5;
          }

          const topY = yScale.top;
          const bottomY = yScale.bottom;

          // Draw vertical crosshair line at end of month
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(endOfMonthX, topY);
          ctx.lineTo(endOfMonthX, bottomY);
          ctx.lineWidth = 2;
          ctx.strokeStyle = withAlpha(crosshairColor, 0.6);
          ctx.setLineDash([6, 4]);
          ctx.stroke();
          ctx.restore();

          // Highlight x-axis label background
          const label = xScale.ticks?.[activeIndex]?.label;
          if (label) {
            ctx.save();
            ctx.font = 'bold 10px sans-serif';
            const textWidth = ctx.measureText(label).width + 8;
            const labelY = xScale.bottom + 5;
            ctx.fillStyle = withAlpha(crosshairColor, 0.2);
            ctx.beginPath();
            ctx.roundRect(currentPoint.x - textWidth / 2, labelY - 2, textWidth, 14, 3);
            ctx.fill();
            ctx.restore();
          }
        },
      };

      // Custom plugin to draw vertical lines at month boundaries
      const monthEndLinesPlugin: any = {
        id: 'monthEndLines',
        afterDraw: (chart: any) => {
          if (isPieish || isRadar || isScatter) return;

          const xScale = chart.scales?.x;
          const yScale = chart.scales?.y;
          if (!xScale || !yScale) return;

          const ctx = chart.ctx;
          const datasetMeta = chart.getDatasetMeta(0);
          if (!datasetMeta || !datasetMeta.data) return;

          const groupBy = chartConfig.value.groupBy;
          ctx.save();
          // Theme-aware segment lines: use primary token for better theme integration
          ctx.strokeStyle = withAlpha(themeColor('primary'), 0.35);
          ctx.lineWidth = 1.5;

          // Anchor the boundary guides to the actual chart edges so the first marker
          // starts on the y-axis line and the last marker ends at the plot edge.
          // Draw left edge as SOLID line (not dashed) with higher visibility
          const leftEdgeX = xScale.left;
          ctx.setLineDash([]);
          ctx.strokeStyle = withAlpha(themeColor('primary'), 0.6);
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(leftEdgeX, yScale.top);
          ctx.lineTo(leftEdgeX, yScale.bottom);
          ctx.stroke();

          // Draw vertical lines between months (dashed) - slightly more subtle than left edge
          ctx.strokeStyle = withAlpha(themeColor('primary'), 0.35);
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
          for (let i = 0; i < datasetMeta.data.length - 1; i++) {
            const currentPoint = datasetMeta.data[i];
            const nextPoint = datasetMeta.data[i + 1];
            const currentLabel = data.labels?.[i] ?? '';
            const nextLabel = data.labels?.[i + 1] ?? '';

            // Detect month boundary based on groupBy setting
            let isMonthBoundary = false;
            if (groupBy === 'daily' || groupBy === 'weekly' || groupBy === 'fortnightly') {
              // Check if the month changed between these two points
              const currentMonth = currentLabel.split('-')[1];
              const nextMonth = nextLabel.split('-')[1];
              isMonthBoundary = currentMonth !== nextMonth;
            } else if (groupBy === 'monthly') {
              // Every point is a month, so draw lines between all points
              isMonthBoundary = true;
            } else if (groupBy === 'quarterly') {
              // Draw lines between quarters
              isMonthBoundary = true;
            } else if (groupBy === 'yearly') {
              // Draw lines between years
              isMonthBoundary = true;
            }

            if (isMonthBoundary) {
              const lineX = (currentPoint.x + nextPoint.x) / 2;
              ctx.beginPath();
              ctx.moveTo(lineX, yScale.top);
              ctx.lineTo(lineX, yScale.bottom);
              ctx.stroke();
            }
          }

          // Draw right edge segment line (after the last data point)
          const rightEdgeX = xScale.right;
          ctx.beginPath();
          ctx.moveTo(rightEdgeX, yScale.top);
          ctx.lineTo(rightEdgeX, yScale.bottom);
          ctx.stroke();

          ctx.restore();
        },
      };

      // Custom plugin to draw all-time net balance line and dots at the month boundary lines
      const endOfMonthBalancePlugin: any = {
        id: 'endOfMonthBalance',
        afterDraw: (chart: any) => {
          if (isPieish || isRadar || isScatter) return;

          const xScale = chart.scales?.x;
          const yScale = chart.scales?.y;
          if (!xScale || !yScale) return;

          // Use chart.data directly to ensure we have current data
          if (!chart.data || !Array.isArray(chart.data.datasets)) return;

          // Find the cumulative net dataset index
          const cumulativeIdx = chart.data.datasets.findIndex((ds: any) => ds.label === 'Cumulative Net');
          if (cumulativeIdx === -1) return;

          // Skip drawing if the cumulative net dataset is hidden (via legend toggle)
          const cumulativeDataset = chart.data.datasets[cumulativeIdx];
          if (cumulativeDataset.hidden) return;

          // CRITICAL: Use the FIRST dataset meta (bars) for X coordinates to ensure
          // cumulative dots align perfectly with segment boundary lines drawn by monthEndLinesPlugin
          const barMeta = chart.getDatasetMeta(0);
          if (!barMeta || !barMeta.data) return;

          const ctx = chart.ctx;
          ctx.save();

          // Theme-aware cumulative color (secondary/purple from DaisyUI theme)
          const cumulativeColor = themeColor('secondary');
          const dotRadius = 5; // Slightly larger for better visibility

          // Calculate boundary positions for all points using bar X positions.
          // Each dot sits directly on the segment boundary line at the end of each month,
          // positioned at the right side of the bars.
          const linePoints: { x: number, y: number }[] = [];
          for (let i = 0; i < barMeta.data.length; i++) {
            const barPoint = barMeta.data[i];
            let dotX: number;

            if (i + 1 < barMeta.data.length) {
              const nextBarPoint = barMeta.data[i + 1];
              // Position exactly on the month boundary line (right side of bars)
              dotX = (barPoint.x + nextBarPoint.x) / 2;
            } else {
              // Last point: position at the right edge of the chart area
              dotX = xScale.right - 5;
            }

            const cumulativeValue = Number(cumulativeDataset?.data?.[i]);
            const lineY = !isNaN(cumulativeValue) ? yScale.getPixelForValue(cumulativeValue) : barPoint.y;
            const clampedY = Math.max(yScale.top + 5, Math.min(yScale.bottom - 5, lineY));

            linePoints.push({ x: dotX, y: clampedY });
          }

          // Draw the cumulative net line connecting all boundary points (dashed)
          if (linePoints.length > 1) {
            ctx.beginPath();
            ctx.setLineDash([8, 4]);
            ctx.strokeStyle = withAlpha(cumulativeColor, 0.7);
            ctx.lineWidth = 3;
            ctx.moveTo(linePoints[0].x, linePoints[0].y);
            for (let i = 1; i < linePoints.length; i++) {
              ctx.lineTo(linePoints[i].x, linePoints[i].y);
            }
            ctx.stroke();
            ctx.setLineDash([]);
          }

          // Draw dots at each boundary point (positioned at actual cumulative value)
          for (const { x: dotX, y: dotY } of linePoints) {
            // Outer glow effect - more visible
            ctx.beginPath();
            ctx.arc(dotX, dotY, dotRadius + 5, 0, Math.PI * 2);
            ctx.fillStyle = withAlpha(cumulativeColor, 0.1);
            ctx.fill();

            // Inner glow
            ctx.beginPath();
            ctx.arc(dotX, dotY, dotRadius + 3, 0, Math.PI * 2);
            ctx.fillStyle = withAlpha(cumulativeColor, 0.18);
            ctx.fill();

            // Main dot - more vibrant
            ctx.beginPath();
            ctx.arc(dotX, dotY, dotRadius, 0, Math.PI * 2);
            ctx.fillStyle = withAlpha(cumulativeColor, 0.95);
            ctx.strokeStyle = themeColor('base1'); // white border adapts to theme
            ctx.lineWidth = 2.5;
            ctx.fill();
            ctx.stroke();
          }

          ctx.restore();
        },
      };

      // WCAG 2.3.3: Respect prefers-reduced-motion for chart animations
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      chartInstance = new Chart(chartCanvas.value.getContext('2d')!, {
        type: chartConfig.value.type as any,
        data,
        plugins: [crosshairPlugin, monthEndLinesPlugin, endOfMonthBalancePlugin],
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: {
            duration: prefersReducedMotion ? 0 : 300,
            easing: 'easeOutQuart',
            delay: (context) => {
              // Stagger animation - capped to avoid long waits on large datasets (scatter 100k+)
              const stagger = context.dataIndex * 20 + (context.datasetIndex || 0) * 40;
              return Math.min(stagger, prefersReducedMotion ? 0 : 600);
            },
          },
          transitions: {
            active: {
              animation: {
                duration: prefersReducedMotion ? 0 : 200,
              },
            },
          },
          interaction: isPieish || isRadar
            ? { mode: 'nearest', axis: 'xy' }
            : { mode: 'index', axis: 'x' },
          plugins: {
            legend: {
              display: !isPieish || data.datasets.length > 1,
              position: 'top',
              labels: {
                usePointStyle: true,
                padding: 12,
                font: { size: 11 },
              },
              onClick: (e, legendItem, legend) => {
                if (isPieish || isRadar || isScatter) return;
                const label = (legendItem as any).text;
                const map: Record<string, keyof typeof seriesToggles.value> = {
                  'Income': 'income',
                  'Spending': 'spending',
                  'Period Net': 'balance',
                  'Cumulative Net': 'allTimeCumulativeNetBalance',
                };
                const key = map[label];
                if (key) {
                  seriesToggles.value[key] = !seriesToggles.value[key];
                }
                return false; // Prevent default Chart.js behavior
              },
            },
            title: {
              display: false,
            },
            tooltip: {
              mode: isPieish || isRadar ? 'nearest' : 'index',
              intersect: false,
              // Render tooltip as external HTML element so it floats above canvas-drawn plugins
              external: (context: any) => {
                const el = chartTooltipEl.value;
                if (!el) return;
                const tooltipModel = context.tooltip;
                // Show/hide based on tooltip visibility
                if (tooltipModel.opacity === 0) {
                  el.style.opacity = '0';
                  return;
                }
                el.style.opacity = '1';
                // Position tooltip relative to chart container with boundary clamping
                const chartRect = (context.chart.canvas as HTMLCanvasElement).getBoundingClientRect();
                const containerRect = el.parentElement?.getBoundingClientRect();
                if (containerRect) {
                  let left = tooltipModel.caretX - containerRect.left + chartRect.left;
                  let top = tooltipModel.caretY - containerRect.top + chartRect.top;
                  // Clamp tooltip to stay within viewport
                  const tooltipW = 280; // approximate max width
                  const tooltipH = 150; // approximate max height
                  left = Math.max(4, Math.min(left, containerRect.width - tooltipW));
                  top = Math.max(4, Math.min(top, containerRect.height - tooltipH));
                  el.style.left = left + 'px';
                  el.style.top = top + 'px';
                }
                // Build HTML content from tooltip data
                const title = tooltipModel.title || [];
                const body = tooltipModel.body || [];
                const footer = tooltipModel.footer || [];
                const labelColors = tooltipModel.labelColors || [];
                // Escape at the sink: tooltip text derives from transaction data
                // (categories/descriptions), which can contain user/imported markup
                const esc = (s: unknown): string => String(s)
                  .replace(/&/g, '&amp;')
                  .replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;')
                  .replace(/"/g, '&quot;')
                  .replace(/'/g, '&#39;');
                // Only allow plausible CSS color values from Chart.js labelColors
                const safeColor = (c: unknown): string =>
                  typeof c === 'string' && /^(#[0-9a-fA-F]{3,8}|(rgb|rgba|hsl|hsla|oklch)\([^;<>"']*\)|[a-zA-Z]+)$/.test(c) ? c : '';
                let html = '';
                if (title.length > 0) {
                  html += `<div style="font-weight:700;font-size:13px;margin-bottom:6px;">${esc(title.join(' '))}</div>`;
                }
                // body is an array of objects { before, lines, after }
                body.forEach((section: any, idx: number) => {
                  const lines = section.lines || [];
                  lines.forEach((lineText: string, lineIdx: number) => {
                    const colorInfo = labelColors[(idx * lines.length) + lineIdx] || {};
                    const color = safeColor(colorInfo.border_color || colorInfo.backgroundColor || '');
                    html += `<div style="display:flex;align-items:center;gap:6px;margin:5px 0;">`;
                    if (color) {
                      html += `<span style="display:inline-block;width:10px;height:10px;border-radius:3px;background:${color};flex-shrink:0;"></span>`;
                    }
                    html += `<span>${esc(lineText)}</span></div>`;
                  });
                });
                if (footer.length > 0) {
                  html += `<div style="font-weight:600;font-size:12px;margin-top:6px;opacity:0.65;">${esc(footer.join('\n'))}</div>`;
                }
                el.innerHTML = html;
              },
              // Canvas tooltip is hidden; external HTML tooltip handles all visual rendering
              // This prevents duplicate tooltips (canvas + HTML) from appearing simultaneously
              backgroundColor: 'transparent',
              titleColor: 'transparent',
              bodyColor: 'transparent',
              footerColor: 'transparent',
              displayColors: false,
              borderColor: 'transparent',
              borderWidth: 0,
              maxWidth: 300,
              bodySpacing: 10,
              titleSpacing: 6,
              // Note: Chart.js v4 handles boundary detection internally
              // Custom position callback causes recursion with circular context references
              callbacks: {
                title: (items: any[]) => {
                  if (!items.length) return '';
                  const first = items[0];
                  if (isPieish) {
                    // Show the slice category name as title, not generic dataset label
                    return first.label || first.dataset?.label || 'Spending breakdown';
                  }
                  if (isScatter) {
                    const rawX = first.parsed?.x ?? first.raw?.x;
                    if (typeof rawX === 'number' && isFinite(rawX)) {
                      return new Date(rawX).toLocaleDateString(undefined, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      });
                    }
                  }
                  return formatChartTooltipTitle(first.label || '');
                },
                label: (ctx: any) => {
                  if (isPieish) {
                    const value = ctx.parsed ?? 0;
                    const total = ctx.dataset.data.reduce((a: number, b: number) => a + Math.abs(Number(b) || 0), 0);
                    const pct = total > 0 ? ((Math.abs(value) / total) * 100).toFixed(2) : '0.00';
                    const categoryLabel = ctx.label || ctx.dataset?.label || 'Slice';
                    return `${categoryLabel}: ${currencyFmt(Number(value))} (${pct}% of total)`;
                  } else if (isRadar) {
                    const value = ctx.parsed?.r ?? 0;
                    return `${ctx.dataset.label}: ${currencyFmt(Number(value))}`;
                  } else if (isScatter) {
                    const y = ctx.parsed?.y ?? 0;
                    const xValue = ctx.parsed?.x ?? ctx.raw?.x;
                    const dateStr = typeof xValue === 'number'
                      ? new Date(xValue).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                      : '';
                    return `${ctx.dataset.label}: ${currencyFmt(Number(y))}${dateStr ? ` on ${dateStr}` : ''}`;
                  } else {
                    const value = ctx.parsed?.y ?? ctx.parsed;
                    const absValue = Math.abs(Number(value));
                    const sign = Number(value) >= 0 ? '+' : '-';
                    // Use consistent currency formatting with 2 decimal places
                    return `${ctx.dataset.label}: ${sign}${currencyFmt(absValue)}`;
                  }
                },
                footer: (items: any[]) => {
                  if (isPieish) {
                    const total = items[0]?.dataset?.data?.reduce((a: number, b: number) => a + Math.abs(Number(b) || 0), 0) ?? 0;
                    return `Visible total: ${currencyFmt(total)}`;
                  }
                  if (items.length < 2) return '';
                  const lines: string[] = [];
                  // Show net for periods with income + spending
                  const income = items.find((i: any) => i.dataset.label === 'Income');
                  const spending = items.find((i: any) => i.dataset.label === 'Spending');
                  if (income && spending) {
                    const net = income.parsed.y - spending.parsed.y;
                    const sign = net >= 0 ? '+' : '-';
                    lines.push(`Period Net: ${sign}${currencyFmt(Math.abs(net))}`);
                  }
                  // Show Cumulative Net if available
                  const cumulativeNet = items.find((i: any) => i.dataset.label === 'Cumulative Net');
                  if (cumulativeNet) {
                    const balance = cumulativeNet.parsed.y;
                    const sign = balance >= 0 ? '+' : '-';
                    lines.push(`Cumulative Net: ${sign}${currencyFmt(Math.abs(balance))}`);
                  }
                  return lines.join('\n');
                },
                labelColor: (ctx: any) => {
                  const color = resolveTooltipColor(ctx);
                  return {
                    borderColor: color,
                    backgroundColor: color,
                    borderWidth: 0,
                    borderRadius: 4,
                  };
                },
                labelPointStyle: (_ctx: any) => ({
                  pointStyle: isScatter ? 'circle' : 'rectRounded',
                  rotation: 0,
                }),
              },
            },
          },
          scales:
            chartConfig.value.type === "pie" ||
              chartConfig.value.type === "doughnut"
              ? {}
            : chartConfig.value.type === "radar"
              ? {
                  r: {
                    beginAtZero: true,
                    grid: { color: withAlpha(themeColor('primary'), 0.12) },
                    ticks: {
                      callback: (v: any) => "$" + Number(v).toFixed(0),
                      font: { size: 10 },
                      color: withAlpha(cssVarToRGB("--bc"), 0.7),
                    },
                  },
                }
            : chartConfig.value.type === "scatter"
              ? {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: (v: any) => "$" + Number(v).toFixed(0),
                      font: { size: 10 },
                      color: withAlpha(cssVarToRGB("--bc"), 0.7),
                    },
                    grid: { color: withAlpha(themeColor('primary'), 0.1) },
                    title: {
                      display: true,
                      text: 'Amount ($)',
                      font: { size: 11, weight: '600' },
                      color: withAlpha(themeColor('primary'), 0.8),
                    },
                  },
                  x: {
                    type: 'linear',
                    position: 'bottom',
                    ticks: {
                      font: { size: 10 },
                      color: withAlpha(cssVarToRGB("--bc"), 0.7),
                      callback: (v: any) => {
                        // Format timestamp as date
                        const d = new Date(v);
                        return d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
                      },
                    },
                    grid: { color: withAlpha(themeColor('primary'), 0.1) },
                    title: {
                      display: true,
                      text: 'Date',
                      font: { size: 11, weight: '600' },
                      color: withAlpha(themeColor('primary'), 0.8),
                    },
                  },
                }
              : {
                  y: {
                    suggestedMin: typeof data.yMin === 'number' ? data.yMin : undefined,
                    suggestedMax: typeof data.yMax === 'number' ? data.yMax : undefined,
                    ticks: {
                      callback: (v: any) => {
                        const abs = Math.abs(v);
                        const sign = v < 0 ? '-' : '';
                        if (abs >= 1000000) return `${sign}$${(abs / 1000000).toFixed(1)}M`;
                        if (abs >= 1000) return `${sign}$${(abs / 1000).toFixed(0)}k`;
                        return `${sign}$${Number(v).toFixed(0)}`;
                      },
                      font: { size: 10 },
                      maxTicksLimit: 8,
                      color: withAlpha(cssVarToRGB("--bc"), 0.7),
                    },
                    grid: {
                      color: withAlpha(themeColor('primary'), 0.1),
                      drawBorder: false,
                    },
                    border: {
                      display: false,
                    },
                  },
                  x: {
                    ticks: {
                      font: { size: 10 },
                      maxRotation: 30,
                      minRotation: 0,
                      maxTicksLimit: 8,
                      autoSkip: true,
                      skipBlank: true,
                      align: 'center',
                      color: withAlpha(cssVarToRGB("--bc"), 0.7),
                    },
                    grid: {
                      display: false,
                    },
                    border: {
                      display: false,
                    },
                  },
                },
        },
      });
      chartLoading.value = false;
    } catch (e) {
      console.error('Chart render error:', e);
      chartLoading.value = false;
    } finally {
      chartRenderPromise = null;
      // If a render was requested while this one was running, trigger it now
      if (pendingRenderChart) {
        pendingRenderChart = false;
        await debouncedRenderChart();
      }
    }
  })();
}

// Single watcher for all chart-related changes
watch(
  [chartData, chartConfig, seriesToggles, selectedCategoriesChart, selectedTagsChart, chartSelectionMode, dateFilter, showBalanceTable],
  () => {
    if (activeTab.value === 'chart') {
      nextTick(() => {
        if (showBalanceTable.value) {
          if (chartInstance) {
            chartInstance.destroy();
            chartInstance = null;
          }
          chartLoading.value = false;
        } else if (chartConfig.value.type === 'bubbleHierarchy') {
          renderBubbleHierarchy();
        } else {
          debouncedRenderChart();
        }
      });
    }
  },
  { deep: true }
);

// Re-render when switching to chart tab (ensures categories are selected)
watch(activeTab, (tab) => {
  if (tab === 'chart') {
    ensureAllCatsSelected();
    // Chart render is already handled by the master watcher watching [chartData, chartConfig, ...]
    // No need to trigger render here - the master watcher will pick up any state changes
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
// Wait for CSS custom properties to propagate after data-theme attribute changes
watch(currentTheme, () => {
  // Invalidate caches immediately so stale RGB values aren't used during transition
  invalidateColorCaches();
  if (activeTab.value === 'chart') {
    nextTick(() => {
      // Small delay ensures getComputedStyle() picks up new CSS custom property values
      // from the newly applied DaisyUI theme before cssVarToRGB() reads them
      setTimeout(() => {
        // Increment version so chartData re-evaluates with fresh colors
        themeVersion.value++;
        if (chartConfig.value.type === 'bubbleHierarchy') {
          renderBubbleHierarchy();
        } else {
          debouncedRenderChart();
        }
      }, 100);
    });
  }
});

// Do NOT auto-select tags — leave them empty so category filtering works correctly



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
// --- DaisyUI → Chart.js color helpers (moved above chart section) ---
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

// const chartInstance = shallowRef<Chart | null>(null);

// ========= Hierarchical Bubble Map (D3.js) =========
const bubbleHierarchyData = computed(() => {
  if (chartConfig.value.type !== "bubbleHierarchy") return null;

  // Use the same category filter as other charts (selectedCategoriesChart)
  const base =
    selectedCategoriesChart.value.length > 0
      ? filteredTransactions.value.filter((t) =>
        containsCaseIns(selectedCategoriesChart.value, t.category)
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
    const d3 = await import("d3");

    if (bubbleHierarchyInstance) {
      d3.select(bubbleHierarchySvg.value).selectAll("*").remove();
    }

    const container = bubbleHierarchyContainer.value;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Use full container size for better centering
    const svg = d3
      .select(bubbleHierarchySvg.value)
      .attr("viewBox", [0, 0, width, height])
      .attr("width", width)
      .attr("height", height)
      .style("display", "block")
      .style("margin", "0 auto");

    // Clear previous content
    svg.selectAll("*").remove();

    const root = d3
      .hierarchy(bubbleHierarchyData.value)
      .sum((d: any) => d.value || 0)
      .sort((a: any, b: any) => (b.value || 0) - (a.value || 0));

    // Pack layout with proper padding
    const pack = d3
      .pack()
      .size([width, height])
      .padding((d: any) => (d.depth === 0 ? 20 : 6));
    pack(root);

    const categoryNames: string[] = Array.from(
      new Set(
        root
          .descendants()
          .filter((d: any) => d.depth === 1)
          .map((d: any) => d.data.name)
      )
    );

    // Unified label color mapping keeps category/tag colors stable across charts.
    const colorMap: Record<string, string> = {};
    categoryNames.forEach((name: string) => {
      colorMap[name] = getCategoryColor(name);
    });

    let focus = root;
    let view: any;

    // Create centered group without offset transform
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
        if (d.depth === 1) return colorMap[d.data.name] || themeColor("primary");
        if (d.data.type === "untagged") return themeColor("neutral", 0.75);
        const parentColor = colorMap[d.parent.data.name] || themeColor("primary");
        return withAlpha(parentColor, 0.75);
      })
      .attr("stroke", (d: any) =>
        d.depth === 0 ? "none" : themeColor("base1")
      )
      .attr("stroke-width", 2)
      .attr("opacity", 0.9)
      .on("click", (event, d: any) => {
        if (focus !== d && d.children) {
          zoomToNode(event, d);
          event.stopPropagation();
        }
      })
      .on("mouseenter", function (event, d: any) {
        if (d.depth === 0) return;
        d3.select(this)
          .transition()
          .duration(200)
          .attr("opacity", 1)
          .attr("stroke-width", d.children ? 4 : 3)
          .attr(
            "stroke",
            d.children ? themeColor("primary") : themeColor("base1")
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
    // Theme-aware text shadow for better readability on colored bubbles
    const textShadowColor = themeColor("neutral", 0.6);

    const label = node
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.3em")
      .style("font-size", (d: any) => `${Math.min(d.r / 3, 24)}px`)
      .style("font-weight", (d: any) => (d.depth === 1 ? "600" : "400"))
      .style("fill", textColor)
      .style("pointer-events", "none")
      .style("user-select", "none")
      .style("text-shadow", `0 1px 2px ${textShadowColor}`);

    // Sanitize helper for bubble labels: strip HTML/control chars, trim, truncate
    function sanitizeLabel(s: string, maxLen: number): string {
      const cleaned = s.replace(/[&<>'"]/g, (m) => {
        const map: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' };
        return map[m] || m;
      }).replace(/[\x00-\x1F\x7F]/g, '').trim();
      return cleaned.length > maxLen ? cleaned.slice(0, maxLen) + '…' : cleaned;
    }

    label
      .append("tspan")
      .attr("x", 0)
      .text((d: any) => {
        if (d.depth === 0 || d.r < 20) return "";
        return sanitizeLabel(d.data.name, d.r < 40 ? 10 : 24);
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

    // Theme-aware tooltip colors: use DaisyUI tokens for consistency
    const tooltipBg = withAlpha(cssVarToRGB("--b2"), 0.97); // base2 background
    const tooltipText = cssVarToRGB("--bc"); // base-content
    const tooltipBorder = withAlpha(themeColor('primary'), 0.35); // primary border
    // Remove existing tooltip to prevent DOM bloat
    d3.select(bubbleHierarchyContainer.value).selectAll('.bubble-tooltip').remove();
    const tooltip = d3
      .select(bubbleHierarchyContainer.value)
      .append("div")
      // DaisyUI card-like tooltip with proper spacing, rounded corners, and shadow
      .attr("class", "bubble-tooltip absolute shadow-xl rounded-xl p-3 text-sm pointer-events-none opacity-0 z-20 max-w-xs border backdrop-blur-sm")
      // WCAG 2.2 AA compliant: theme-aware dark background with light text for high contrast
      .style("background-color", tooltipBg)
      .style("color", tooltipText)
      .style("border-color", tooltipBorder)
      .style("transition", "opacity 0.15s ease");

    // Boundary-aware tooltip positioning helper (uses getBoundingClientRect for robust coordinate conversion)
    function positionBubbleTooltip(mouseX: number, mouseY: number): { left: number; top: number } | null {
      const tooltipNode = tooltip.node();
      if (!tooltipNode || !container) return null;
      
      const tooltipWidth = tooltipNode.offsetWidth || 200;
      const tooltipHeight = tooltipNode.offsetHeight || 120;
      
      const containerRect = container.getBoundingClientRect();
      let left = mouseX - containerRect.left + 15;
      let top = mouseY - containerRect.top - 15;
      
      // Adjust if tooltip would go off-right edge
      if (left + tooltipWidth > containerRect.width - 10) {
        left = mouseX - containerRect.left - tooltipWidth - 15;
      }
      
      // Adjust if tooltip would go off-bottom edge
      if (top + tooltipHeight > containerRect.height - 10) {
        top = mouseY - containerRect.top - tooltipHeight - 15;
      }
      
      // Clamp to container bounds to prevent overflow
      left = Math.max(10, Math.min(left, containerRect.width - tooltipWidth - 10));
      top = Math.max(10, Math.min(top, containerRect.height - tooltipHeight - 10));
      
      return { left, top };
    }

    node
      .on("mouseenter", function (event: any, d: any) {
        if (d.depth === 0) return;

        const nodeColor =
          d.depth === 1
            ? (colorMap[d.data.name] || themeColor("primary"))
            : d.data.type === "untagged"
              ? themeColor("neutral", 0.75)
              : withAlpha(colorMap[d.parent?.data?.name] || themeColor("primary"), 0.75);
        const nodeKind =
          d.depth === 1
            ? "Category"
            : d.data.type === "untagged"
              ? "Uncategorized"
              : "Tag";
        const share = root.value ? ((d.value || 0) / root.value) * 100 : 0;
        const parentName = d.depth > 1 ? d.parent?.data?.name : "";

        // Theme-aware tooltip colors using DaisyUI tokens
        const accentColor = themeColor('primary');       // Primary for names
        const labelColor = withAlpha(cssVarToRGB("--bc"), 0.65); // Muted for labels
        const textColor = cssVarToRGB("--bc");          // Full for values
        const borderColor = withAlpha(cssVarToRGB("--bc"), 0.2); // Subtle separator

        // Escape at the sink: category/tag names derive from user/imported transaction data
        // Also strip control characters and normalize whitespace for safety
        const esc = (s: unknown): string => String(s)
          .replace(/[&<>'"]/g, (m) => {
            const map: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' };
            return map[m] || m;
          })
          .replace(/[\x00-\x1F\x7F]/g, '') // Strip control characters
          .replace(/\s+/g, ' ')            // Normalize whitespace
          .trim();

        // Build tooltip with DaisyUI-inspired structure
        // Header: colored indicator + name + kind badge
        let html = `<div class="flex items-start gap-2 mb-2">`;
        html += `<span class="mt-1 h-3 w-3 rounded-full border border-white/20 flex-shrink-0" style="background-color: ${nodeColor}"></span>`;
        html += `<div class="min-w-0"><div class="font-bold text-base leading-tight truncate" style="color: ${accentColor}" title="${esc(d.data.name)}">${esc(d.data.name)}</div>`;
        html += `<div class="text-[10px] uppercase tracking-widest font-medium" style="color: ${labelColor}">${nodeKind}</div></div></div>`;
        
        // Details section with DaisyUI divider
        if (parentName) {
          html += `<div class="text-xs mb-1"><span class="font-semibold" style="color: ${labelColor}">Category:</span> <span class="text-base-content" style="color: ${textColor}">${esc(parentName)}</span></div>`;
        }
        html += `<div class="text-sm font-medium"><span style="color: ${labelColor}">Amount:</span> <span class="font-mono" style="color: ${textColor}">${currencyFmt(d.value || 0)}</span></div>`;
        if (root.value) {
          html += `<div class="text-sm"><span style="color: ${labelColor}">Share:</span> <span class="badge badge-sm badge-ghost" style="color: ${textColor}">${share.toFixed(2)}%</span></div>`;
        }
        if (d.data.count) {
          html += `<div class="text-sm"><span style="color: ${labelColor}">Transactions:</span> <span class="font-mono" style="color: ${textColor}">${d.data.count}</span></div>`;
        }
        
        // Footer hint for categories
        if (d.data.type === "category") {
          const tagCount = d.children ? d.children.length : 0;
          html += `<div class="text-xs mt-2 pt-2 border-t" style="color: ${labelColor}; border-color: ${borderColor}">💡 Click to see ${tagCount} group${tagCount !== 1 ? "s" : ""}</div>`;
        }

        tooltip
          .html(html)
          .style("opacity", 1)
          .style("border-color", withAlpha(nodeColor, 0.35));
        
        // Position tooltip with boundary awareness
        const pos = positionBubbleTooltip(event.pageX, event.pageY);
        if (pos) {
          tooltip
            .style("left", `${pos.left}px`)
            .style("top", `${pos.top}px`);
        }
      })
      .on("mousemove", function (event: any) {
        // Update position on mouse move for better tracking
        const pos = positionBubbleTooltip(event.pageX, event.pageY);
        if (pos) {
          tooltip
            .style("left", `${pos.left}px`)
            .style("top", `${pos.top}px`);
        }
      })
      .on("mouseleave", function () {
        tooltip.style("opacity", 0);
      });

    function zoomTo(v: any) {
      const k = Math.min(width, height) / v[2];
      view = v;

      // Center the zoom by accounting for aspect ratio
      const cx = width / 2;
      const cy = height / 2;

      // Only scale labels — parent <g> already handles translate, so don't double-translate
      label.attr("transform", (d: any) => {
        const scale = Math.min((k * d.r) / Math.min(width, height), 1);
        return `scale(${scale})`;
      });

      node.attr(
        "transform",
        (d: any) => {
          const x = cx + (d.x - v[0]) * k;
          const y = cy + (d.y - v[1]) * k;
          return `translate(${x},${y})`;
        }
      );
      node.select("circle").attr("r", (d: any) => d.r * k);
    }

    function zoomToNode(event: any, d: any) {
      focus = d;
      // WCAG 2.3.3: Respect prefers-reduced-motion for D3 transitions
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      g.transition()
        .duration(prefersReducedMotion ? 0 : 750)
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

// Legacy chart system removed - use main renderChart() with chartRenderPromise protection instead

watch(
  () => chartConfig.value.type,
  (t, prevT) => {
    if (t === "pie" || t === "doughnut") {
      // Only spending for share charts
      seriesToggles.value = { income: false, spending: true, balance: false, allTimeCumulativeNetBalance: false };
      // Ensure all categories are selected so the pie/doughnut has data
      if (selectedCategories.value.length === 0) {
        selectedCategories.value = [...chartCategories.value];
      }
    } else {
      // Always reset to all-true when switching FROM pie/doughnut TO time-series
      const pieishTypes = ['pie', 'doughnut', 'radar', 'scatter', 'bubbleHierarchy', 'table'];
      if (prevT && pieishTypes.includes(prevT)) {
        seriesToggles.value = { income: true, spending: true, balance: true, allTimeCumulativeNetBalance: true };
      } else if (
        !seriesToggles.value.income &&
        !seriesToggles.value.spending &&
        !seriesToggles.value.balance
      ) {
        // Sensible defaults for time series / bubble - only if all are off
        seriesToggles.value = { income: true, spending: true, balance: true, allTimeCumulativeNetBalance: true };
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
          color: ticks,
        },
        onClick: (e, legendItem, legend) => {
          // Only wire toggles for time-series chart types
          if (!['bar', 'line', 'radar', 'scatter'].includes(type)) return;

          const label = (legendItem as any).text;
          const chart = legend.chart;

          // Map legend label → seriesToggles key
          const map: Record<string, keyof typeof seriesToggles.value> = {
            'Income': 'income',
            'Spending': 'spending',
            'Period Net': 'balance',
            'Cumulative Net': 'allTimeCumulativeNetBalance',
          };

          const key = map[label];
          if (key) {
            // Toggle the series visibility
            seriesToggles.value[key] = !seriesToggles.value[key];

            // Sync the legend internal hidden state so the visual state matches
            const datasetIndex = (legendItem as any).datasetIndex;
            if (datasetIndex != null) {
              const meta = chart.getDatasetMeta(datasetIndex);
              if (meta) {
                meta.hidden = !seriesToggles.value[key];
              }
            }

            // Update the chart to reflect the change immediately
            chart.update();
          }
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
    // Unified category color mapping: same category = same color across ALL chart types
    const colors = labels.map((cat: string) => getCategoryColor(cat));
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

// ===== Phase 2: Share Code Batching (800 tx limit) =====
function generateShareCodesWithBatching() {
  const txs = transactions.value;
  if (txs.length === 0) {
    pushToast("No transactions to share", "warning");
    return;
  }

  const batches: Transaction[][] = [];
  for (let i = 0; i < txs.length; i += MAX_SHARE_TX) {
    batches.push(txs.slice(i, i + MAX_SHARE_TX));
  }

  if (batches.length > MAX_SHARE_BATCHES) {
    pushToast(`Too many transactions! Max ${MAX_SHARE_BATCHES} batches allowed (${MAX_SHARE_BATCHES * MAX_SHARE_TX} tx)`, "error");
    return;
  }

  shareBatchCount.value = batches.length;
  shareBatchIndex.value = 0;
  shareCodes.value = [];

  // Generate share code for each batch
  for (let i = 0; i < batches.length; i++) {
    const data = {
      t: batches[i],
      v: version.value,
      ts: Date.now(),
      batch: `${i + 1}/${batches.length}`,
    };
    const compressed = btoa(JSON.stringify(data));
    shareCodes.value.push(`tx:${compressed}`);
  }

  shareCodeModalOpen.value = true;
  pushToast(
    batches.length === 1
      ? "Share code generated!"
      : `Generated ${batches.length} share codes for ${txs.length} transactions`,
    "success"
  );
}

// ===== Phase 3: AES-GCM Encryption =====
async function encryptSharePayload(password: string, data: any): Promise<string> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 600000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"]
  );

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoder.encode(JSON.stringify(data))
  );

  // Combine salt + iv + ciphertext
  const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(encrypted), salt.length + iv.length);

  return btoa(String.fromCharCode(...combined));
}

async function decryptShareData(password: string, encryptedBase64: string): Promise<any> {
  try {
    const combined = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));
    const salt = combined.slice(0, 16);
    const iv = combined.slice(16, 28);
    const ciphertext = combined.slice(28);

    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      encoder.encode(password),
      "PBKDF2",
      false,
      ["deriveKey"]
    );

    const key = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt,
        iterations: 600000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["decrypt"]
    );

    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      ciphertext
    );

    const decoder = new TextDecoder();
    return JSON.parse(decoder.decode(decrypted));
  } catch (error) {
    console.error("Decryption failed:", error);
    throw new Error("Invalid password or corrupted data");
  }
}

// ===== Phase 4: Expiration Logic =====
function addExpirationToShareData(data: any, days: number): any {
  const expirable = { ...data };
  if (days > 0) {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + days);
    expirable.exp = expirationDate.toISOString();
  }
  return expirable;
}

function checkShareCodeExpiration(data: any): boolean {
  if (!data.exp) return true; // No expiration set
  const expirationDate = new Date(data.exp);
  return expirationDate > new Date();
}

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

// Reset all chart settings to defaults
function resetChartSettings() {
  // Reset date filter
  resetDateFilter();
  
  // Reset selection mode
  chartSelectionMode.value = 'or';
  
  // Reset series toggles
  seriesToggles.value = {
    income: true,
    spending: true,
    balance: true,
    allTimeCumulativeNetBalance: true,
  };
  
  // Reset category/tag selections
  ensureAllCatsSelected();
  selectedTagsChart.value = [];
  
  // Reset filter display mode (pie/doughnut only)
  chartFilterDisplayMode.value = 'both';
  
  // Reset group by
  chartConfig.value.groupBy = 'monthly';
  
  pushToast('Chart settings reset to defaults', 'success', 2000);
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
  // Scroll to top on tab switch (mobile UX)
  window.scrollTo({ top: 0, behavior: 'smooth' });
  // Reset pagination when switching tabs
  currentPage.value = 1;
  // WCAG 2.2: Move focus to the activated panel after tab switch
  setTimeout(() => {
    const panel = document.getElementById(`panel-${id}`);
    if (panel) {
      panel.setAttribute('tabindex', '-1');
      panel.focus();
    }
  }, 100);
}

// Date input handlers
function onAddDateInput(e: Event) {
  // Clear error as user types
  newTxDateError.value = "";

  const input = e.target as HTMLInputElement;
  const oldValue = input.value;
  
  // Get cursor position BEFORE updating value
  let cursorPos = input.selectionStart ?? oldValue.length;
  
  // Format the date
  const formattedValue = formatDDMMProgressive(oldValue);
  
  // Count how many dashes were added before the cursor
  const oldDashesBeforeCursor = (oldValue.slice(0, cursorPos).match(/-/g) || []).length;
  const newDashesBeforeCursor = (formattedValue.slice(0, cursorPos).match(/-/g) || []).length;
  
  // Adjust cursor position based on dashes added/removed before cursor
  const adjustedCursorPos = cursorPos + (newDashesBeforeCursor - oldDashesBeforeCursor);
  
  // Update value
  input.value = formattedValue;
  newTxDateText.value = formattedValue;
  
  // Restore cursor position - use nextTick for reliability
  nextTick(() => {
    if (input === document.activeElement) {
      input.setSelectionRange(adjustedCursorPos, adjustedCursorPos);
    }
  });
  
  addDateTextRef.value?.setCustomValidity?.("");
}

function onAddDateBlur() {
  const ddmmyyyy = finalizeDDMM(newTxDateText.value);
  
  if (!ddmmyyyy) {
    // Empty is okay - not required until submit
    newTxDateError.value = "";
    addDateTextRef.value?.setCustomValidity?.("");
    return;
  }
  
  const iso = ddmmyyyyToISO(ddmmyyyy);
  if (iso) {
    newTxDateText.value = ddmmyyyy;
    newTxDateISO.value = iso;
    newTxDateError.value = "";
    addDateTextRef.value?.setCustomValidity?.("");
  } else {
    newTxDateError.value = "Invalid date. Use dd-mm-yyyy (e.g. 05-01-2025).";
    addDateTextRef.value?.setCustomValidity?.(newTxDateError.value);
    addDateTextRef.value?.reportValidity?.();
  }
}

function onDateKeydownDigitsOnly(e: KeyboardEvent) {
  const ok = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", "-"];
  if (ok.includes(e.key)) return;
  if (!/^\d$/.test(e.key)) e.preventDefault();
}

// Helper to scroll input into view when focused (handles mobile keyboard)
function scrollIntoView(e: FocusEvent) {
  const target = e.target as HTMLElement;
  if (target) {
    nextTick(() => {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }
}

// Clear amount error when user types
function clearAmountError() {
  if (amountError.value) {
    amountError.value = "";
  }
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
  // Parse as local time — new Date("YYYY-MM-DD") is UTC midnight and shifts a
  // day backwards in negative-offset timezones once converted back to local.
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d + days);
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
  // Clear previous errors
  amountError.value = "";
  
  // Validate amount
  if (newTransaction.amount <= 0) {
    amountError.value = "Please enter a valid amount greater than 0.";
    amountInputRef.value?.focus();
    return;
  }
  
  // Validate category
  if (!newTransaction.category) {
    const categorySummary = categoryDropdownRef.value?.querySelector('summary');
    (categorySummary as HTMLElement)?.focus();
    return;
  }

  // The form displays today when the date is empty; make the model match so
  // an untouched date field never stores "" (which breaks recurring math).
  if (!newTransaction.date) newTransaction.date = todayLocalISO();

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

      // transactions is a shallowRef: in-place splice/index writes are invisible
      // to watchers and the UI, so every update must assign a new array.
      const prior = transactions.value[idx];
      if (newTransaction.recurring) {
        // Expand into a series, replace the edited row, and drop the old
        // series' other occurrences so re-editing never duplicates them.
        const series = generateRecurringTransactions(baseTx);
        // Only rewriting the series ANCHOR replaces the whole series; editing a
        // child into a new series must not silently delete its old siblings.
        const oldSeriesId = prior.recurring ? (prior.seriesId ?? prior.id) : undefined;
        transactions.value = transactions.value.flatMap((t) => {
          if (t.id === prior.id) return series;
          if (oldSeriesId && t.seriesId === oldSeriesId) return [];
          return [t];
        });
        pushToast(
          `Updated into ${series.length} recurring transactions`,
          "success"
        );
      } else {
        // Plain edit (non-recurring)
        const next = transactions.value.slice();
        next[idx] = baseTx;
        transactions.value = next;
        pushToast("Transaction updated", "success");
      }

      // Remember the edited transaction id before resetting
      const editedId = currentlyEditingId.value;

      currentlyEditingId.value = null;
      resetForm();

      // Navigate back to transactions tab and scroll to the edited transaction
      if (editedId) {
        // Find the transaction's position in the filtered+sorted list to calculate the correct page
        const list = baseFilteredBySearch.value;
        const type = typeFilter.value;
        const visible: Transaction[] = [];
        for (const t of list) {
          if (type && t.type !== type) continue;
          visible.push(t);
        }
        // Sort using a direct comparator (buildTxComparator expects indices, not objects)
        const field = sortField.value;
        const order = sortOrder.value === "asc" ? 1 : -1;
        visible.sort((a, b) => {
          if (field === "amount") {
            return ((a.amount || 0) - (b.amount || 0)) * order;
          }
          const av = String((a as any)[field] ?? "");
          const bv = String((b as any)[field] ?? "");
          return (av < bv ? -1 : av > bv ? 1 : 0) * order;
        });
        const targetIndex = visible.findIndex((t) => t.id === editedId);
        if (targetIndex !== -1) {
          currentPage.value = Math.floor(targetIndex / itemsPerPage) + 1;
        }

        activeTab.value = "transactions";
        nextTick(() => {
          nextTick(() => {
            const el = document.getElementById(`tx-${editedId}`);
            if (el) {
              // Scroll inside the virtual viewport, not the window
              const viewport = virtViewportRef.value;
              if (viewport) {
                el.scrollIntoView({ behavior: "smooth", block: "center" });
              }
              // Briefly highlight the updated transaction
              el.classList.add("border-primary", "bg-base-200");
              setTimeout(() => el.classList.remove("border-primary", "bg-base-200"), 2000);
            }
          });
        });
      }
      return;
    }
  }

  // ===== Add path =====
  const baseTx: Transaction = {
    ...newTransaction,
    id: `${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    source: newTransaction.source || "Manual",
    endDate: endISO,
    seriesId: undefined, // never inherit a series link from a previous edit
  };

  if (newTransaction.recurring) {
    const series = generateRecurringTransactions(baseTx);
    transactions.value = [...transactions.value, ...series];
    // OPTIMIZED: Incrementally update category set
    categorySet.add(baseTx.category);
    pushToast(`Added ${series.length} recurring transactions`, "success");
  } else {
    transactions.value = [...transactions.value, baseTx];
    // OPTIMIZED: Incrementally update category set
    categorySet.add(baseTx.category);
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
    seriesId: undefined, // clear any series link left over from an edit
  });
  currentlyEditingId.value = null;
  
  // Clear validation errors
  amountError.value = "";
  newTxDateError.value = "";
}

function editTransaction(t: Transaction) {
  // Set the editing id first so the recurring-defaults watcher (flushed after
  // this tick) sees an active edit and skips persisting these loaded values.
  currentlyEditingId.value = t.id;
  // Copy tags — sharing the array would let form edits mutate the original
  // transaction even when the edit is cancelled.
  Object.assign(newTransaction, t, { tags: [...(t.tags ?? [])] });
  activeTab.value = "add";
  scrollAddIntoView();
  focusAmount();
  
  // Remember category for pre-fill when editing
  if (t.category) rememberCategory(t.category);
}

function deleteTransaction(id: string) {
  if (confirm("Delete this transaction?")) {
    // shallowRef: assign a new array, in-place splice is invisible
    transactions.value = transactions.value.filter((t) => t.id !== id);
    pushToast("Transaction deleted", "success");
  }
}

function duplicateTx(t: Transaction) {
  const copy: Transaction = {
    ...t,
    id: `${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    seriesId: undefined, // a duplicate is independent of the original series
  };
  transactions.value = [...transactions.value, copy];
  // OPTIMIZED: Update category set incrementally
  categorySet.add(copy.category);
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
    // OPTIMIZED: Reset category set on clear
    categorySet.clear();
    categoryNames.forEach((c) => categorySet.add(c));
    customCategories.value.forEach((c) => categorySet.add(c));
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
      // the anchor keeps its id (edits must preserve it); children get new ids
      id: i === 0 ? baseTx.id : `${Date.now()}-${Math.floor(Math.random() * 10000)}-${i}`,
      seriesId: baseTx.id,
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
  // Use the same clamped, timezone-safe helpers as computeRecurringEndDate so
  // occurrences match the advertised end date (Jan 31 monthly → Feb 28, not Mar 3).
  switch (frequency) {
    case "daily":
      return addDays(startDate, occurrenceIndex);
    case "weekly":
      return addDays(startDate, occurrenceIndex * 7);
    case "fortnightly":
      return addDays(startDate, occurrenceIndex * 14);
    case "monthly":
      return addMonthsClamped(startDate, occurrenceIndex);
    case "quarterly":
      return addMonthsClamped(startDate, occurrenceIndex * 3);
    case "yearly":
      return addMonthsClamped(startDate, occurrenceIndex * 12);
  }
  return startDate;
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
function updateSort(field: "date" | "type" | "amount" | "category" | "description") {
  if (sortField.value === field)
    sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
  else {
    sortField.value = field;
    sortOrder.value = "desc";
  }
  currentPage.value = 1;
}

function getSortIcon(field: "date" | "type" | "amount" | "category" | "description"): string {
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

function selectAllAvailableTagsForChart() {
  selectedTagsChart.value = availableTagsForChart.value.slice();
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

function downloadChartAsPng() {
  if (!chartCanvas.value) return;
  const canvas = chartCanvas.value as HTMLCanvasElement;
  const link = document.createElement('a');
  link.download = `financial-chart-${new Date().toISOString().slice(0, 10)}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

function ensureAllCatsSelected() {
  if (selectedCategoriesChart.value.length === 0 && chartCategories.value.length) {
    selectedCategoriesChart.value = [...chartCategories.value];
  }
}

// Initialize tag selection when switching to chart tab
onMounted(() => {
  ensureAllCatsSelected();

  // Auto-select all categories on first visit if none selected
  if (selectedCategoriesChart.value.length === 0 && chartCategories.value.length > 0) {
    selectedCategoriesChart.value = [...chartCategories.value];
  }
  // Do NOT auto-select tags — leave them empty so category filtering works correctly
  // Tags will only be selected when user explicitly enables tag filtering

  // Render chart on initial load (activeTab defaults to "chart")
  nextTick(() => {
    renderChart();
  });
});

// Auto-select newly created categories when they're added
watch(chartCategories, (newCats) => {
  // Auto-select newly created categories that aren't already selected
  const currentCats = new Set(selectedCategoriesChart.value);
  const newCatsAdded: string[] = [];
  newCats.forEach(cat => {
    if (!currentCats.has(cat)) {
      selectedCategoriesChart.value.push(cat);
      newCatsAdded.push(cat);
    }
  });

  // Only re-sort if we actually added something
  if (newCatsAdded.length > 0) {
    selectedCategoriesChart.value = sortAlpha(selectedCategoriesChart.value);
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

        // ── Headerless CSV detection (BEFORE column inference) ──
        // If the first row looks like data (starts with a digit, has 3+ cols),
        // generate synthetic headers so column inference works
        const firstRow = rows[0];
        const headerLooksLikeData = /^\d/.test((firstRow?.[0] || "").trim()) && firstRow.length >= 3;

        let headers: string[];
        let dataRows: string[][];

        if (headerLooksLikeData) {
          dbg("Headerless CSV detected — generating synthetic headers");
          // Generate synthetic headers based on common bank CSV patterns
          // (date, amount, description, balance is the most common headerless format)
          headers = firstRow.map((_, i) => {
            if (i === 0) return "date";
            if (i === 1) return "amount";
            if (i === 2) return "description";
            if (i === 3) return "balance";
            return `col_${i}`;
          });
          dataRows = rows
            .filter((r) => r.some((c) => c?.trim?.()));
        } else {
          headers = firstRow;
          dataRows = rows
            .slice(1)
            .filter((r) => r.some((c) => c?.trim?.()));
        }

        const cols = inferColumns(headers);

        // ── Scan for amount convention (only for single-amount banks) ──
        if (cols.amount != null && cols.debit == null && cols.credit == null
          && cols.mobileId == null && cols.desktopId == null) {
          cols.amountConvention = scanAmountConvention(dataRows, cols.amount);
          dbg("Amount convention:", cols.amountConvention);
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
    // All imports complete - switch to chart tab to show imported data
    if (transactions.value.length > 0) {
      // Reset date filter to show all imported data
      dateFilter.value = { start: undefined, end: undefined };
      selectedDatePreset.value = 'All Time';
      // Switch to chart tab with a small delay for toast visibility
      setTimeout(() => onTab('chart'), 600);
    }
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
    // OPTIMIZED: Extract categories after bulk import
    for (const t of added) {
      categorySet.add(t.category);
    }
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

// ===== Phase 1: CSV Export =====
function downloadCsv() {
  if (transactions.value.length === 0) {
    pushToast("No transactions to export", "warning");
    return;
  }

  try {
    const headers = ["Date", "Type", "Amount", "Category", "Tags", "Description", "Source"];
    // Neutralize spreadsheet formula injection (=, +, -, @, tab, CR prefixes)
    // and double embedded quotes so fields can't break row structure
    const csvField = (value: string): string => {
      let v = value ?? "";
      if (/^[=+\-@\t\r]/.test(v)) v = `'${v}`;
      return `"${v.replace(/"/g, '""')}"`;
    };
    const rows = transactions.value.map(t => [
      t.date,
      t.type,
      t.amount.toFixed(2),
      csvField(t.category),
      csvField((t.tags || []).join(", ")),
      csvField(t.description || ""),
      csvField(t.source || ""),
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${exportFilenamePrefix.value}-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    pushToast(`Exported ${transactions.value.length} transactions to CSV`, "success");
  } catch (error) {
    console.error("CSV export error:", error);
    pushToast("Failed to export CSV", "error");
  }
}

// ===== Phase 1: QIF Export =====
function downloadQif() {
  if (transactions.value.length === 0) {
    pushToast("No transactions to export", "warning");
    return;
  }

  try {
    const qifHeader = "!Type:Cash^1";
    const rows = transactions.value.map(t => {
      const date = t.date.split("-").reverse().join("/");
      const amount = t.type === "income" ? t.amount.toFixed(2) : (-t.amount).toFixed(2);
      const category = t.category;
      const tags = (t.tags || []).join(", ");
      const desc = `${(t.description || "").replace(/\^/g, "")}${tags ? ` ^${tags}` : ""}`;
      return `D${date}\nT${amount}\nL${category}\nM${desc}\n^\n`;
    });

    const qifContent = `${qifHeader}\n${rows.join("")}`;
    const blob = new Blob([qifContent], { type: "application/x-qif" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${exportFilenamePrefix.value}-${new Date().toISOString().split("T")[0]}.qif`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    pushToast(`Exported ${transactions.value.length} transactions to QIF`, "success");
  } catch (error) {
    console.error("QIF export error:", error);
    pushToast("Failed to export QIF", "error");
  }
}

// ===== Phase 1: Unified Export Handler =====
function handleExport(format: 'json' | 'csv' | 'qif') {
  exportFormat.value = format;
  exportInProgress.value = true;
  exportProgress.value = 0;

  // Simulate progress for UX
  const progressInterval = setInterval(() => {
    exportProgress.value = Math.min(exportProgress.value + 10, 90);
  }, 50);

  setTimeout(() => {
    clearInterval(progressInterval);
    exportProgress.value = 100;

    switch (format) {
      case 'json':
        downloadJson();
        break;
      case 'csv':
        downloadCsv();
        break;
      case 'qif':
        downloadQif();
        break;
    }

    setTimeout(() => {
      exportInProgress.value = false;
      exportProgress.value = 0;
      exportModalOpen.value = false;
    }, 500);
  }, 300);
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

// Validate transaction schema to prevent code injection
function validateTransactionSchema(tx: any): boolean {
  if (typeof tx !== 'object' || tx === null) return false;

  const MAX_LENGTH = 1000;
  const ALLOWED_TYPES = ['income', 'spending'];
  const ALLOWED_FREQUENCIES = ['daily', 'weekly', 'fortnightly', 'monthly', 'quarterly', 'yearly'];

  if (tx.type && !ALLOWED_TYPES.includes(tx.type)) return false;
  if (tx.frequency && !ALLOWED_FREQUENCIES.includes(tx.frequency)) return false;
  if (tx.description && String(tx.description).length > MAX_LENGTH) return false;
  if (tx.category && String(tx.category).length > 200) return false;
  if (tx.source && String(tx.source).length > 100) return false;
  if (tx.amount !== undefined && (typeof tx.amount !== 'number' || !isFinite(tx.amount))) return false;
  if (tx.recursions && (typeof tx.recursions !== 'number' || tx.recursions < 1 || tx.recursions > 3650)) return false;
  if (tx.seriesId && (typeof tx.seriesId !== 'string' || tx.seriesId.length > 100)) return false;
  if (tx.tags && Array.isArray(tx.tags)) {
    if (tx.tags.length > 20) return false;
    for (const tag of tx.tags) {
      if (typeof tag !== 'string' || tag.length > 50) return false;
    }
  }

  // Decode any HTML entities that may have been double-encoded in previous saves
  const sanitize = (str: string): string => decodeHtmlEntities(str);
  if (tx.description) tx.description = sanitize(String(tx.description));
  if (tx.category) tx.category = sanitize(String(tx.category));
  if (tx.source) tx.source = sanitize(String(tx.source));
  if (Array.isArray(tx.tags)) tx.tags = tx.tags.map((tag: string) => sanitize(String(tag)));

  return true;
}

function normalizeTransaction(raw: any): Transaction {
  if (!validateTransactionSchema(raw)) {
    console.warn("Invalid transaction data rejected:", raw);
    return {
      id: `${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      date: todayLocalISO(),
      type: "spending",
      amount: 0,
      category: "Uncategorized",
      tags: [],
      description: "Invalid data",
      recurring: false,
      frequency: "monthly",
      recursions: 1,
      endDate: "",
      source: String(DEFAULT_SOURCE),
    };
  }
  return {
    id: String(raw?.id ?? `${Date.now()}-${Math.floor(Math.random() * 10000)}`),
    date: parseDateGuess(String(raw?.date ?? "")) || todayLocalISO(),
    type: raw?.type === "income" ? "income" : "spending",
    amount: Math.abs(Number(raw?.amount ?? 0)),
    category: decodeHtmlEntities(String(raw?.category ?? "Uncategorized")),
    tags: Array.isArray(raw?.tags) ? raw.tags.map(decodeHtmlEntities) : [],
    description: decodeHtmlEntities(String(raw?.description ?? "")),
    recurring: !!raw?.recurring,
    frequency: raw?.frequency || "monthly",
    recursions: Math.max(1, Number(raw?.recursions ?? 1)),
    endDate: String(raw?.endDate ?? ""),
    source: decodeHtmlEntities(String(raw?.source ?? DEFAULT_SOURCE)),
    seriesId: raw?.seriesId ? String(raw.seriesId) : undefined,
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
  frequency?: RecurringFrequency;
};

type DemoTemplate = Template & {
  count: number;
};

const DEMO_START_DATE = "2025-07-01";
const DEMO_END_DATE = "2026-06-30";

const DEMO_TEMPLATES: DemoTemplate[] = [
  {
    type: "income",
    category: "Salary",
    descriptions: [
      "salary take-home pay",
      "Fortnightly pay",
      "Payroll deposit",
      "Salary credit",
    ],
    min: 2400,
    max: 2800,
    tags: ["income", "salary", "work"],
    recurring: true,
    frequency: "fortnightly",
    count: 26,
  },
  {
    type: "spending",
    category: "Rent & Board",
    descriptions: ["Rent payment", "Board contribution", "Room rent"],
    min: 1100,
    max: 1550,
    tags: ["housing", "rent", "living"],
    recurring: true,
    frequency: "monthly",
    count: 12,
  },
  {
    type: "spending",
    category: "Internet & Mobile",
    descriptions: ["NBN plan", "Mobile bill", "Internet + phone bundle"],
    min: 85,
    max: 145,
    tags: ["utilities", "internet", "mobile"],
    recurring: true,
    frequency: "monthly",
    count: 12,
  },
  {
    type: "spending",
    category: "Subscriptions & Cloud",
    descriptions: ["Spotify", "iCloud+", "Notion", "YouTube Premium", "Prime Video", "Chat GPT Plus"],
    min: 12,
    max: 55,
    tags: ["subscriptions", "cloud", "software"],
    recurring: true,
    frequency: "monthly",
    count: 12,
  },
  {
    type: "spending",
    category: "Automatic Savings",
    descriptions: [
      "Auto-transfer to savings",
      "Emergency fund transfer",
      "Offset transfer",
      "ETF savings transfer",
    ],
    min: 180,
    max: 420,
    tags: ["savings", "transfer", "budget"],
    recurring: true,
    frequency: "monthly",
    count: 12,
  },
  {
    type: "spending",
    category: "Groceries",
    descriptions: ["Woolworths shop", "Coles shop", "ALDI run", "IGA top-up"],
    min: 55,
    max: 185,
    tags: ["groceries", "supermarket", "food"],
    count: 20,
  },
  {
    type: "spending",
    category: "Coffee & Lunch",
    descriptions: ["Flat white", "Oat latte", "Sushi lunch", "Toastie", "Snack run", "Lunch bowl"],
    min: 5,
    max: 35,
    tags: ["coffee", "cafe", "lunch"],
    count: 14,
  },
  {
    type: "spending",
    category: "Transport & Parking",
    descriptions: ["Opal top-up", "Train fare", "Light rail trip", "Uber home", "Parking meter"],
    min: 6,
    max: 48,
    tags: ["transport", "commute", "parking"],
    count: 12,
  },
  {
    type: "spending",
    category: "Dining & Takeaway",
    descriptions: ["Ramen night", "Sushi train", "Thai takeaway", "Burger night", "Uber Eats dinner"],
    min: 18,
    max: 95,
    tags: ["dining", "takeaway", "restaurant"],
    count: 10,
  },
  {
    type: "spending",
    category: "Tech & Gadgets",
    descriptions: [
      "USB-C dock",
      "Mechanical keyboard",
      "SSD upgrade",
      "Noise cancelling headphones",
      "Mouse pad",
      "Monitor arm",
    ],
    min: 24,
    max: 650,
    tags: ["tech", "gadgets", "work"],
    count: 6,
  },
  {
    type: "spending",
    category: "Fitness & Health",
    descriptions: ["Gym membership", "Physio visit", "Chemist Warehouse", "Dental check-up"],
    min: 18,
    max: 140,
    tags: ["health", "fitness", "pharmacy"],
    count: 4,
  },
  {
    type: "spending",
    category: "Home & Household",
    descriptions: ["Bunnings run", "IKEA home goods", "Kmart essentials", "Cleaning supplies"],
    min: 18,
    max: 120,
    tags: ["home", "household", "essentials"],
    count: 4,
  },
  {
    type: "spending",
    category: "Entertainment",
    descriptions: ["Cinema night", "Pub trivia", "Live gig", "Game Pass", "Bowling night"],
    min: 15,
    max: 110,
    tags: ["entertainment", "social", "leisure"],
    count: 4,
  },
  {
    type: "spending",
    category: "Travel & Weekend",
    descriptions: ["Weekend Airbnb", "Day trip train fare", "Regional getaway", "Hotel stay"],
    min: 90,
    max: 420,
    tags: ["travel", "weekend", "holiday"],
    count: 2,
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

function generateRandomDemoData(): Transaction[] {
  const startDate = new Date(DEMO_START_DATE);
  const endDate = new Date(DEMO_END_DATE);
  const transactions: Transaction[] = [];
  let idCounter = 1;

  for (const template of DEMO_TEMPLATES) {
    if (template.recurring && template.frequency) {
      const { count, ...seriesTemplate } = template;
      const series = generateRecurringSeries(seriesTemplate, count, startDate, endDate, idCounter);
      transactions.push(...series);
      idCounter += series.length;
      continue;
    }

    for (let i = 0; i < template.count; i++) {
      transactions.push({
        id: `demo-${idCounter++}`,
        date: randomDateBetween(startDate, endDate),
        type: template.type,
        amount: roundMoney(rand(template.min, template.max)),
        category: template.category,
        description: pickOne(template.descriptions),
        source: "Demo Data",
        tags: uniqueTags(template.tags, template.type),
      });
    }
  }

  transactions.sort((a, b) => a.date.localeCompare(b.date));

  return transactions.map((tx, index) => ({
    ...tx,
    id: `demo-${index + 1}`,
  }));
}

function loadDemoDataAndFinish() {
  const demoData = generateRandomDemoData();
  transactions.value = demoData.map(t => ({ ...t }));
  safeLocalStorageSet(LS_KEYS.tx, transactions.value);
  showTour.value = false;
  onboardingStep.value = 0;
  localStorage.setItem("hasSeenOnboarding", "true");
  activeTab.value = "chart";
  pushToast(`${demoData.length} Australian demo transactions loaded! Chart view opened.`, "success", 3000);
}


function handleTourBack() {
  if (onboardingStep.value > 0) {
    onboardingStep.value--;
  }
}

function skipTour() {
  showTour.value = false;
  onboardingStep.value = 0;
  if (transactions.value.length === 0) {
    activeTab.value = "about";
  }
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

function goHome() {
  onTab(transactions.value.length > 0 ? "chart" : "about");
}
</script>

<style scoped>
/* Try break me heheh */
.opacity-80 {
  word-break: break-word;
}

/* ===== Advanced Settings Modal ===== */
/* NOTE: the modal must NOT force overflow: visible — that overrides DaisyUI's
   .modal-box scrolling (overflow-y: auto + max-height) and makes tall content
   unreachable. The old hack existed so the date-picker calendar could escape
   the box, but the calendar is teleported to <body> now and never clips. */
.advanced-modal-content {
  min-height: 0; /* Allow flex shrinking */
}

#advancedSettingsModal { z-index: 10000; }
.advanced-modal-box { position: relative; z-index: 10001; }

/* Mobile: advanced modal full screen with proper scroll */
@media screen and (max-width: 640px) {
  /* Advanced modal: full screen on small devices with proper scroll */
  .advanced-modal-box {
    width: 100vw !important;
    max-width: 100vw !important;
    max-height: 100dvh !important;
    height: 100dvh !important;
    margin: 0 !important;
    border-radius: 0 !important;
    display: flex !important;
    flex-direction: column;
    overflow: hidden;
  }

  /* Sticky header on mobile */
  .advanced-modal-header {
    flex-shrink: 0;
    position: sticky;
    top: 0;
    background: oklch(var(--b1));
    z-index: 5;
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
  }

  /* Scrollable content area */
  .advanced-modal-content {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    overscroll-behavior: contain;
    -webkit-overflow-scrolling: touch;
    padding-bottom: 0.5rem;
  }

  /* Sticky footer on mobile */
  .advanced-modal-footer {
    flex-shrink: 0;
    position: sticky;
    bottom: 0;
    background: oklch(var(--b1));
    z-index: 5;
    margin-left: 0;
    margin-right: 0;
    width: 100%;
  }

  /* Ensure date inputs are easily tappable */
  .advanced-modal-box .input {
    min-height: 2.75rem;
  }

  /* Larger touch targets for buttons in modal */
  .advanced-modal-box .btn-xs {
    min-height: 2.5rem;
  }

  /* Make collapsible sections more compact on mobile */
  .advanced-modal-content .collapse {
    margin-top: 0.25rem;
    margin-bottom: 0.25rem;
  }
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
  /* Smooth desktop dropdown animation */
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* Show only when <details> is actually open (so it toggles correctly). */
details.dropdown[open]>.dropdown-content {
  display: block;
}

/* Desktop dropdown open animation */
@media screen and (min-width: 768px) {
  header details.dropdown[open]>.dropdown-content {
    animation: desktop-dropdown-fade-in 0.2s ease-out forwards;
  }

  @keyframes desktop-dropdown-fade-in {
    from {
      opacity: 0;
      transform: translateY(-0.5rem) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  /* Better desktop dropdown positioning - align with button edge */
  header .dropdown .dropdown-content {
    right: -0.25rem;
    margin-top: 0.625rem;
  }

  /* Widen dropdowns on large screens for better readability */
  @media screen and (min-width: 1280px) {
    header .dropdown .dropdown-content {
      min-width: 16rem;
    }
  }
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
  /* Reduce table padding on mobile */
  table.table td,
  table.table th {
    padding: 0.5rem 0.2rem;
    font-size: 0.8rem;
  }

  /* Table headers more compact on mobile */
  table.table thead th .btn {
    font-size: 0.75rem;
    padding: 0.2rem 0.15rem;
    min-height: 1.5rem;
    line-height: 1.2;
  }

  /* Hide Tags column on very small screens to save space */
  @media (max-width: 520px) {
    table thead th:nth-child(5),
    table tbody td:nth-child(5) {
      display: none;
    }
  }

  /* Make checkboxes easier to tap */
  table.table .checkbox {
    margin: 0;
    width: 1.25rem;
    height: 1.25rem;
  }

  /* Better action buttons on mobile - larger touch targets */
  table.table .btn {
    min-width: 2rem;
    min-height: 2rem;
    padding: 0.3rem;
  }

  /* Row entrance animation */
  table.table tbody tr {
    animation: table-row-fade-in 0.35s ease forwards;
    opacity: 0;
  }

  table.table tbody tr:nth-child(1) { animation-delay: 0.02s; }
  table.table tbody tr:nth-child(2) { animation-delay: 0.04s; }
  table.table tbody tr:nth-child(3) { animation-delay: 0.06s; }
  table.table tbody tr:nth-child(4) { animation-delay: 0.08s; }
  table.table tbody tr:nth-child(5) { animation-delay: 0.10s; }
  table.table tbody tr:nth-child(6) { animation-delay: 0.12s; }
  table.table tbody tr:nth-child(7) { animation-delay: 0.14s; }
  table.table tbody tr:nth-child(8) { animation-delay: 0.16s; }
  table.table tbody tr:nth-child(9) { animation-delay: 0.18s; }
  table.table tbody tr:nth-child(10) { animation-delay: 0.20s; }
  table.table tbody tr:nth-child(n+11) { animation-delay: 0.22s; }

  /* Row press feedback */
  table.table tbody tr {
    transition: background-color 0.15s ease;
  }

  table.table tbody tr:active {
    background-color: oklch(var(--bc) / 0.05);
  }
}

/* Improve zebra contrast slightly on dark themes */
.table-zebra tbody tr:nth-child(even) td,
.table-zebra tbody tr:nth-child(even) th {
  background-color: color-mix(in oklab,
      oklch(var(--b1)) 90%,
      oklch(var(--bc)) 10%);
}

/* ===== HEADER / NAVBAR ===== */

/* Sticky header with consistent height and reliable positioning */
header.navbar.sticky {
  /* Fixed height - balance widget overflows, doesn't push nav taller */
  min-height: 3.5rem;
  height: 3.5rem;
  /* Set CSS variable for nested sticky elements to use */
  --header-height: 3.5rem;
  /* Prevent header from becoming too tall on mobile */
  max-height: none;
  /* Allow balance widget to overflow past nav boundary */
  overflow: visible;
}

/* Mobile: allow header to expand so logo subtitle is visible */
@media screen and (max-width: 1023px) {
  header.navbar.sticky {
    height: 3.5rem;
    min-height: 3.5rem;
  }
}

/* Balance badge: anchored to top of nav, always extends below with rounded bottom corners */
header .navbar-end .balance-badge {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 0.05rem;
  padding: 0.3rem 0.75rem 0.55rem;
  /* Sharp top corners, rounded bottom only */
  border-radius: 0 0 0.75rem 0.75rem;
  /* Theme-aware background */
  background-color: oklch(var(--b2));
  /* Shadow starts from nav boundary, casts downward for hanging depth */
  box-shadow:
    0 4px 6px -1px oklch(var(--bc) / 0.15),
    0 10px 15px -3px oklch(var(--bc) / 0.1);
  /* Badge always taller than nav, extending past bottom dynamically */
  min-height: calc(var(--header-height, 3.5rem) + 1.2rem);
  justify-content: flex-end;
  /* Negative bottom margin lets badge overflow the navbar */
  margin-top: 0;
  margin-bottom: -0.7rem;
  transform-origin: top right;
  position: relative;
  z-index: 10;
}

header .navbar-end .balance-badge .badge-label {
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: oklch(var(--bc) / 0.6);
  font-weight: 500;
}

header .navbar-end .balance-badge .badge-value {
  font-size: 1.1rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

/* Desktop tab alignment — vertically center tabs-boxed with logo */
@media screen and (min-width: 1024px) {
  header.navbar.sticky {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    padding: 0 1rem;
  }

  /* Allow balance widget to overflow the navbar, but center icon buttons */
  header .navbar-end {
    align-items: flex-start;
    padding-top: 0.15rem;
    padding-bottom: 0.15rem;
  }

  /* Vertically center dropdown icon buttons on desktop */
  header .navbar-end .mobile-nav-end {
    align-items: center;
  }

  /* Restore smooth hover on dropdown buttons for desktop */
  header .mobile-dropdown-wrap summary {
    transition: background-color 0.2s ease, color 0.2s ease, transform 0.15s ease !important;
  }

  header .mobile-dropdown-wrap summary:hover {
    transform: scale(1.1);
  }

  header .mobile-dropdown-wrap summary:active {
    transform: scale(0.95);
  }

  /* Tab row doesn't wrap on medium desktop, better spacing */
  .navbar-center .tabs-boxed {
    white-space: nowrap;
    gap: 0.5rem;
    padding: 0.25rem 0;
  }

  .navbar-center .tabs-boxed .tab {
    padding: 0.6rem 1rem;
  }

  /* Overflow guard for narrow desktop */
  @media screen and (max-width: 1280px) {
    .navbar-center .tabs-boxed .tab {
      padding-left: 0.75rem;
      padding-right: 0.75rem;
      font-size: 0.875rem;
    }
  }
}

/* Mobile header adjustments */
@media screen and (max-width: 767px) {
  /* Mobile nav: compact fixed height so badge extends below */
  header.navbar.sticky {
    height: 3.5rem;
    min-height: 3.5rem;
    max-height: 3.5rem;
    overflow: visible;
    padding: 0 0.75rem;
  }

  /* Allow badge to overflow navbar on mobile */
  header .navbar-end {
    align-items: flex-start;
    padding-top: 0.15rem;
    padding-bottom: 0.15rem;
  }

  /* Navbar end container: tighter spacing, proper alignment */
  header .navbar-end .mobile-nav-end {
    gap: 0.35rem;
    align-items: center;
  }

  /* Shrink title on mobile to prevent wrapping */
  header .navbar-start h1 {
    font-size: 1rem;
  }

  /* Stack logo lines vertically on mobile */
  header .navbar-start .logo-line-1,
  header .navbar-start .logo-line-2 {
    display: block;
    line-height: 1.2;
  }

  header .navbar-start .logo-line-1 {
    font-weight: 400;
  }

  header .navbar-start .logo-line-2 {
    font-size: 0.85em;
  }

  /* Balance badge more compact on mobile, still extends past nav */
  header .navbar-end .balance-badge {
    padding: 0.25rem 0.5rem 0.4rem;
    min-height: calc(var(--header-height, 3.5rem) + 0.7rem);
    flex-shrink: 1;
    max-width: 45%;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Mobile balance value still readable with proper padding */
  header .navbar-end .balance-badge .badge-value {
    font-size: 0.85rem;
    padding: 0.1rem 0.25rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  header .navbar-end .balance-badge .badge-label {
    font-size: 7px;
  }

  /* Dropdown wrapper: ensure proper positioning context */
  header .mobile-dropdown-wrap {
    position: relative;
    flex-shrink: 0;
  }

  /* Dropdown buttons: better touch targets */
  header .mobile-dropdown-wrap summary {
    width: 2.75rem;
    height: 2.75rem;
    flex-shrink: 0;
  }

  /* Force dropdowns to open below on mobile, centered on the page when content overflows */
  header details.dropdown[open] > .mobile-dropdown-content {
    position: fixed !important;
    top: calc(var(--header-height, 3.5rem) + 0.75rem) !important;
    bottom: auto !important;
    left: 50% !important;
    right: auto !important;
    transform: translateX(-50%) !important;
    max-width: calc(100vw - 2rem) !important;
    opacity: 1 !important;
    visibility: visible !important;
    display: block !important;
    pointer-events: auto !important;
    z-index: 70 !important;
    animation: dropdown-fade-in 0.2s ease-out forwards;
  }

  /* Smooth dropdown open animation */
  @keyframes dropdown-fade-in {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(-0.5rem) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0) scale(1);
    }
  }

  /* Table row entrance animation */
  @keyframes table-row-fade-in {
    from {
      opacity: 0;
      transform: translateY(0.5rem);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Tab switch animation */
  @keyframes tab-content-fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  /* Form field focus animation */
  @keyframes input-focus-glow {
    from {
      box-shadow: 0 0 0 2px oklch(var(--p) / 0.2);
    }
    to {
      box-shadow: 0 0 0 4px oklch(var(--p) / 0.15);
    }
  }

  /* Hide logo text only at very narrow screens where balance overlaps stacked lines */
  @media (max-width: 380px) {
    header .navbar-start .logo-text {
      display: none;
    }
  }

  header .navbar-start {
    flex: 0 0 auto;
    min-width: 0;
  }

  header .navbar-end {
    flex: 1 1 auto;
    justify-content: flex-end;
    min-width: 0;
  }
}

/* Very small screens: compact badge further */
@media (max-width: 420px) {
  header .navbar-end .balance-badge {
    padding: 0.15rem 0.4rem 0.3rem;
    min-height: calc(var(--header-height, 3.5rem) + 0.5rem);
    max-width: 60%;
    overflow: hidden;
  }
  header .navbar-end .balance-badge .badge-value {
    font-size: 0.8rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  header .navbar-end .balance-badge .badge-label {
    font-size: 0.65rem;
  }
}

/* XS screens (320px-375px): fix top nav alignment */
@media (max-width: 375px) {
  header.navbar.sticky {
    height: 3.25rem;
    min-height: 3.25rem;
    padding: 0 0.5rem;
  }

  header .navbar-end .mobile-nav-end {
    gap: 0.2rem;
    align-items: center;
    flex-wrap: nowrap;
  }

  header .navbar-end .balance-badge {
    padding: 0.2rem 0.35rem 0.35rem;
    min-height: calc(var(--header-height, 3.25rem) + 0.45rem);
    max-width: 40%;
  }

  header .navbar-end .balance-badge .badge-value {
    font-size: 0.75rem;
  }

  header .navbar-end .balance-badge .badge-label {
    font-size: 6px;
  }

  header .mobile-dropdown-wrap summary {
    width: 2.25rem;
    height: 2.25rem;
    font-size: 0.9rem;
    padding: 0;
  }

  header .navbar-start img {
    width: 28px;
    height: 28px;
  }

  header .navbar-start h1 {
    font-size: 0.9rem;
  }
}

/* Mobile adjustments for main content */
@media screen and (max-width: 767px) {
  /* Reduce padding on main content for small screens */
  main.container {
    padding-left: 0.75rem;
    padding-right: 0.75rem;
  }

  /* Tab panel switch animation on mobile */
  main.container section[role="tabpanel"],
  main.container section.card {
    animation: tab-content-fade-in 0.25s ease;
  }

  /* Transaction form grid stacks on mobile */
  form.grid {
    grid-template-columns: 1fr !important;
  }

  /* Form input focus glow on mobile */
  form input:focus,
  form select:focus,
  form textarea:focus {
    animation: input-focus-glow 0.2s ease forwards;
    border-color: oklch(var(--p) / 0.6) !important;
  }

  /* Mobile bottom nav spacing */
  .btm-nav {
    padding-bottom: env(safe-area-inset-bottom, 0);
  }

  /* Main content starts below the overflow balance widget */
  main.container {
    padding-top: 0.5rem;
  }

  /* Better card spacing on mobile */
  main.container .card {
    margin-bottom: 1rem;
  }

  /* Compact form sections on mobile */
  main.container .tab-content {
    padding: 0.5rem 0;
  }

  /* Smooth scroll behavior for mobile */
  main {
    scroll-behavior: smooth;
  }

  /* Card entrance animation for mobile */
  .card.shadow-xl {
    animation: card-fade-in 0.3s ease;
  }

  @keyframes card-fade-in {
    from {
      opacity: 0;
      transform: translateY(0.75rem);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
}

/* Only apply will-change during active scroll to avoid stacking context bugs */
@media screen and (max-width: 768px) {
  header.navbar.sticky {
    --header-height: 3.5rem;
  }
}

/* Mobile header dropdown: allow smooth transitions (remove global transition: none for mobile) */
@media screen and (max-width: 767px) {
  header .mobile-dropdown-wrap summary {
    transition: background-color 0.2s ease, transform 0.15s ease !important;
  }

  header .mobile-dropdown-wrap summary:hover {
    transform: scale(1.05);
  }

  header .mobile-dropdown-wrap summary:active {
    transform: scale(0.95);
  }
}

/* Safe area padding for notched devices (iPhone X+, Android edge-to-edge) */
/* Consistent additive formula: base padding + safe area inset (no double-counting) */
.safe-area-bottom {
  padding-bottom: calc(0.25rem + env(safe-area-inset-bottom, 0));
}

.safe-area-main {
  padding-bottom: calc(6rem + env(safe-area-inset-bottom, 0));
}

/* Touch target minimums (WCAG 2.2: 24x24px, Apple HIG: 44x44px) */
.target-min {
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px 0 0;
}

/* Focus ring for keyboard accessibility */
.focus-ring:focus-visible {
  outline: 3px solid oklch(var(--p) / 0.5);
  outline-offset: 2px;
  border-radius: 0.375rem;
}

/* Bottom nav specific improvements - anchored and stable after any scroll */
.btm-nav {
  /* Explicit anchoring - prevents drift after viewport changes */
  position: fixed !important;
  bottom: 0 !important;
  left: 0 !important;
  right: 0 !important;
  height: min-content;
  padding: 5px 10px 20px 10px;
  margin-bottom: -5px;

  /* Prevent iOS bounce effect */
  overscroll-behavior: contain;
  /* Ensure proper rendering on Android */
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  /* Consistent box model for padding calculations */
  box-sizing: border-box;
}

/* Active tab indicator enhancement */
.btm-nav button.active {
  font-weight: 600;
}

/* iOS Safari: Prevent text size adjustment on orientation change */
@media screen and (max-width: 768px) {
  html {
    text-size-adjust: 100%;
    -webkit-text-size-adjust: 100%;
  }

  /* Fix for iOS Safari address bar */
  .min-h-\[100dvh\] {
    min-height: 100dvh;
    min-height: 100vh; /* Fallback */
  }
}

/* Android Chrome: Smooth scrolling */
@media (prefers-reduced-motion: no-preference) {
  html {
    scroll-behavior: smooth;
  }
}

/* Mobile modal improvements */
@media screen and (max-width: 768px) {
  .modal-box {
    width: 95vw;
    max-height: 90dvh;
    max-height: 90vh; /* Fallback */
  }

  /* Fix dropdown height on mobile */
  .dropdown .dropdown-content {
    max-height: 70dvh;
    max-height: 70vh; /* Fallback */
    /* Prevent dropdowns from overflowing viewport */
    right: auto;
    left: 0;
    width: 90vw;
    max-width: calc(100vw - 2rem);
  }

  /* Form inputs full width on mobile */
  .form-control {
    width: 100%;
  }
}

/* iPhone specific: Prevent zoom on input focus */
@media screen and (max-width: 768px) {
  input, textarea, select {
    font-size: 16px !important; /* Prevents iOS zoom on focus */
  }

  /* Prevent horizontal scroll on mobile */
  html, body {
    overflow-x: hidden;
  }

  /* Fix container width on mobile */
  .container {
    max-width: 100%;
    padding-left: 1rem;
    padding-right: 1rem;
  }

  /* Ensure cards don't overflow */
  .card {
    max-width: 100%;
  }

  /* Main content padding adjustment for mobile */
  main.container {
    padding-bottom: 6rem !important;
  }
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
  box-shadow: none !important;
}

/* ===== Stats tiles ===== */
.stats {
  border-radius: 0.75rem;
}

/* ===== Chart area ===== */
canvas {
  image-rendering: -webkit-optimize-contrast;
}

/* Chart card improvements */
.chart-card {
  border: 2px solid oklch(var(--p) / 0.1);
  transition: border-color 0.2s ease;
}

.chart-card:hover {
  border-color: oklch(var(--p) / 0.2);
}

/* Chart type button active state */
.btn-active {
  background-color: oklch(var(--p));
  color: oklch(var(--pc));
  border-color: oklch(var(--p));
}

/* Mobile chart optimizations */
@media screen and (max-width: 767px) {
  .chart-card {
    border-width: 1px;
  }

  .chart-card .card-body {
    padding: 0.75rem;
    min-width: 0;
  }

  .chart-canvas-area { width: 100%; min-width: 0; overflow: hidden; }
  .chart-card [role="group"][aria-label="Chart type"] { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .chart-card [role="group"][aria-label="Chart type"] .btn { width: 100%; min-width: 0; padding-inline: .25rem; }

  /* Chart canvas: better mobile height */
  .chart-card canvas,
  .chart-card svg {
    max-height: 350px !important;
  }

  /* Maintain aspect ratio on mobile */
  .chart-card canvas,
  .chart-card svg {
    aspect-ratio: 16/9;
  }

  /* Stats: more compact on mobile */
  .stats {
    font-size: 0.875rem;
  }

  .stats .stat-title {
    font-size: 0.75rem;
  }

  .stats .stat-value {
    font-size: 1.25rem;
  }

  .stats .stat-desc {
    font-size: 0.7rem;
  }

  /* Quick controls row: better spacing */
  .chart-card .flex-wrap.gap-2 {
    gap: 0.35rem;
  }

  /* Advanced filters card: smoother reveal */
  .animate-fade-in {
    animation: chart-fade-in 0.25s ease-out;
  }

  @keyframes chart-fade-in {
    from {
      opacity: 0;
      transform: translateY(-0.5rem);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
}

/* XS screen optimizations (iPhone 5, 320px) */
@media screen and (max-width: 375px) {
  /* Tighter chart card padding */
  .chart-card .card-body {
    padding: 0.5rem;
  }

  /* Chart canvas: reduce height for small screens */
  .chart-canvas-area {
    min-height: 180px !important;
    padding: 0.5rem;
  }

  .chart-canvas-area canvas,
  .chart-card svg {
    max-height: 240px !important;
  }

  /* Smaller stat figures */
  .stats .stat-figure svg {
    width: 1rem;
    height: 1rem;
  }

  /* Compact stats layout */
  .stats .stat {
    padding: 0.5rem;
  }

  /* Chart type buttons: tighter join */
  .join .btn {
    padding: 0.25rem 0.5rem;
  }

  /* Dropdown labels: smaller text */
  .dropdown .btn span {
    font-size: 0.75rem;
  }

  /* Advanced filters: tighter spacing */
  .collapse {
    margin-top: 0.5rem;
  }

  /* Summary stats below chart: more compact */
  .stats.stats-vertical {
    gap: 0.25rem;
  }
}

/* Desktop chart: larger canvas */
@media screen and (min-width: 1024px) {
  .chart-card canvas,
  .chart-card svg {
    max-height: 500px;
  }
}

@media screen and (min-width: 1280px) {
  .chart-card canvas,
  .chart-card svg {
    max-height: 600px;
  }
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

/* Balance table mode: hide only the chart canvas area, keep all chart type icons visible. */
section:has(.chart-view-toggle[aria-pressed="true"]) .chart-canvas-area {
  display: none !important;
}

/* Keep chart type selector icons visible in table mode - only hide the canvas. */
section:has(.chart-view-toggle[aria-pressed="true"]) [aria-label="Chart type"] > label {
  /* No longer hidden - icons stay visible */
}

/* Improve table mode visual feedback: highlight the table button more prominently */
.chart-view-toggle[aria-pressed="true"] {
  box-shadow: 0 0 0 2px oklch(var(--p) / 0.3);
  transition: box-shadow 0.2s ease, background-color 0.2s ease;
}

/* ===== WCAG 2.2 Accessibility Enhancements ===== */

/* 1. Focus Visible - Enhanced focus indicators (WCAG 2.4.7) */
/* Apply to all interactive elements */
button:focus-visible,
input:focus-visible,
select:focus-visible,
textarea:focus-visible,
[tabindex]:focus-visible,
a:focus-visible,
.tab:focus-visible,
.badge:focus-visible {
  outline: 3px solid oklch(var(--p) / 0.7);
  outline-offset: 2px;
  border-radius: 0.25rem;
}

/* 2. Touch Target Sizes (WCAG 2.5.8 Target Size Minimum) */
/* Minimum 24x24px, with 44x44px recommended for primary actions */
@media (hover: none) and (pointer: coarse) {
  /* Primary interactive elements */
  .btn,
  .tab,
  .badge-lg.badge-outline {
    min-height: 44px;
    padding: 0.5rem 1rem;
  }
  
  /* Form controls */
  input[type="checkbox"],
  input[type="radio"] {
    width: 24px;
    height: 24px;
  }
  
  .form-control input,
  .form-control select,
  .form-control textarea {
    min-height: 44px;
  }
  
  /* Category/Tag badges in modal */
  .badge.badge-lg {
    min-height: 36px;
    min-width: 36px;
    padding: 0.25rem 0.75rem;
  }
  
  /* Radio group buttons */
  .join .btn {
    min-height: 44px;
  }
}

/* 3. Modal Dialog Accessibility (WCAG 2.1.1 Keyboard) */
.modal-box form {
  max-height: 85vh;
  overflow-y: auto;
  scrollbar-width: thin;
}

/* 4. High Contrast Mode Support (WCAG 1.4.11 Non-text Contrast) */
@media (prefers-contrast: more) {
  .badge-outline {
    border-width: 2px !important;
  }
  
  .btn-ghost {
    border: 2px solid oklch(var(--bc) / 0.6);
  }
  
  .input-bordered,
  .select-bordered {
    border-width: 2px !important;
  }
  
  /* Increase contrast for interactive elements */
  .tab {
    border: 2px solid transparent;
  }
  
  .tab-active {
    border-color: oklch(var(--p) / 1);
  }
}

/* 5. Status Messages (WCAG 4.1.3 Status Messages) */
/* Live regions for dynamic content updates */
.chart-info-badge {
  position: relative;
}

/* Screen reader only text */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* 6. Color Contrast Enhancement */
/* Ensure text meets AA contrast ratio (4.5:1 for normal, 3:1 for large) */
.stat-title {
  color: oklch(var(--bc) / 0.8);
}

.stat-desc {
  color: oklch(var(--bc) / 0.7);
}

/* Chart legend accessibility */
.chart-legend-item {
  min-height: 24px;
  padding: 0.25rem 0.5rem;
}

/* 7. Error Prevention (WCAG 3.3.1 Error Identification) */
.alert-error {
  border-left: 4px solid oklch(var(--er) / 1);
}

/* 8. Label Visibility */
/* Ensure form labels are always visible and associated */
.label-text {
  font-size: 0.875rem;
  font-weight: 500;
  color: oklch(var(--bc) / 1);
}

/* 9. Spacing for motor impairments */
/* Minimum 8px gap between interactive elements */
.flex-wrap.gap-2 > * {
  margin: 0.25rem;
}

/* 10. Heading hierarchy */
/* Ensure proper heading structure */
h1, h2, h3, h4, h5, h6 {
  font-weight: 600;
  color: oklch(var(--bc) / 1);
}

/* ===== Mobile Transaction Card ===== */
.tx-card-mobile {
  transition: border-color 0.2s ease, background-color 0.2s ease;
}

.tx-card-mobile:active {
  transform: scale(0.98);
}

/* Line clamp utility for description truncation */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Mobile chart type buttons: smaller join buttons */
@media screen and (max-width: 767px) {
  .join.join-vertical .btn {
    padding: 0.35rem 0.5rem;
    font-size: 0.7rem;
  }
  
  /* Smaller touch targets for chart type grid on mobile */
  .chart-type-join .btn {
    min-height: 2rem;
    padding: 0.25rem 0.4rem;
  }
}
</style>
