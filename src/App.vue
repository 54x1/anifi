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
          <span>Financial Tracker</span>
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
    <nav class="btm-nav lg:hidden" aria-label="Primary (mobile)">
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
    <main id="main" class="container mx-auto p-4 pb-24 lg:pb-6" role="main">
      <!-- Friendly onboarding (first-time guidance) -->
      <section
        v-if="showTips && transactions.length === 0"
        class="alert alert-info mb-4"
        role="status"
        aria-live="polite"
      >
        <div>
          <h2 class="font-semibold mb-1">Welcome! Quick start:</h2>
          <ol class="list-decimal ml-5 space-y-1">
            <li>Upload a bank CSV or paste a share link/code to import.</li>
            <li>Or add a transaction manually to try things out.</li>
            <li>
              Use “Bulk Edit” to quickly clean up categories/descriptions.
            </li>
          </ol>
        </div>
        <div class="flex gap-2">
          <button class="btn btn-sm" @click="activeTab = 'import'">
            Import now
          </button>
          <button class="btn btn-ghost btn-sm" @click="dismissTips">
            Dismiss
          </button>
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
                  class="file-input file-input-bordered w-full"
                  @change="handleFileUpload"
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
                  Tip: Paste a link with <code>?tx=...</code> or just the share
                  code (starts with <code>tx:</code>).
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
                    Length: <strong>{{ shareCodeLength }}</strong> characters.
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

              <!-- QR -->
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
                  Use JSON to transfer large datasets offline without relying on
                  long links.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Add Transaction -->
      <section
        v-show="activeTab === 'add'"
        class="card bg-base-100 shadow-xl mb-6"
        aria-labelledby="addHeading"
      >
        <div class="card-body">
          <h2 id="addHeading" class="card-title">➕ Add Transaction</h2>

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
<div class="form-control">
  <label class="label" for="addCategory">
    <span class="label-text">Category</span>
    <div class="ml-auto flex items-center gap-2">
      <button
        type="button"
        class="btn btn-ghost btn-xs"
        @click="openCategoryManager('manage')"
        aria-haspopup="dialog"
        title="Manage categories"
      >
        <!-- settings-cog icon -->
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"/><path d="M19.4 15a1.6 1.6 0 0 0 .32 1.76l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.6 1.6 0 0 0-1.76-.32 1.6 1.6 0 0 0-1 1.47V21a2 2 0 0 1-4 0v-.1a1.6 1.6 0 0 0-1-1.47 1.6 1.6 0 0 0-1.76.32l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.6 1.6 0 0 0 .32-1.76 1.6 1.6 0 0 0-1.47-1H3a2 2 0 0 1 0-4h.1a1.6 1.6 0 0 0 1.47-1 1.6 1.6 0 0 0-.32-1.76l-.06-.06A2 2 0 1 1 7.02 3.5l.06.06a1.6 1.6 0 0 0 1.76.32A1.6 1.6 0 0 0 10.35 2h.1a2 2 0 0 1 4 0v.1a1.6 1.6 0 0 0 1 1.47 1.6 1.6 0 0 0 1.76-.32l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.6 1.6 0 0 0-.32 1.76c.21.5.68.86 1.22.95H21a2 2 0 0 1 0 4h-.1c-.54.09-1 .45-1.22.95Z"/>
        </svg>
        <span class="hidden sm:inline">Manage</span>
      </button>
      <button
        type="button"
        class="btn btn-primary btn-xs"
        @click="openCategoryManager('add')"
        title="Add custom category"
      >
        <!-- plus icon -->
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M12 5v14M5 12h14"/>
        </svg>
        <span class="hidden sm:inline">Add custom</span>
      </button>
    </div>
  </label>

  <select
    id="addCategory"
    v-model="newTransaction.category"
    class="select select-bordered"
    required
  >
    <option value="">Select a category</option>
    <optgroup label="Default">
      <option
        v-for="category in categoryNames"
        :key="category"
        :value="category"
      >
        {{ category }}
      </option>
    </optgroup>
    <optgroup v-if="customCategories.length > 0" label="Custom">
      <option
        v-for="category in customCategories"
        :key="category"
        :value="category"
      >
        {{ category }}
      </option>
    </optgroup>
  </select>
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
                  Starts <strong>{{ formatDate(newTransaction.date) }}</strong
                  >.
                  <span v-if="derivedEndDateISO">
                    Ends
                    <strong>{{ formatDate(derivedEndDateISO) }}</strong> after
                    <strong>{{
                      Math.max(1, Number(newTransaction.recursions || 1))
                    }}</strong>
                    occurrence{{
                      Math.max(1, Number(newTransaction.recursions || 1)) === 1
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

      <!-- Charts -->
      <section
        v-show="activeTab === 'chart'"
        class="space-y-6"
        aria-labelledby="chartHeading"
      >
        <div class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <h3 id="chartHeading" class="card-title">📅 Date Filter</h3>

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
      

      <!-- Transactions -->
      <section
        v-show="activeTab === 'transactions'"
        class="card bg-base-100 shadow-xl"
        aria-labelledby="txHeading"
      >
        <div class="card-body">
          <div
            class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4"
          >
            <h2 id="txHeading" class="card-title">
              📋 Transactions ({{ filteredTransactions.length }})
            </h2>
            <p class="sr-only" aria-live="polite">
              {{ filteredTransactions.length }} transactions shown.
            </p>

            <!-- Search + Type -->
            <div class="flex flex-col sm:flex-row gap-2">
              <div class="join">
                <label class="sr-only" for="txSearch">Search</label>
                <input
                  id="txSearch"
                  v-model="searchQuery"
                  type="text"
                  placeholder="Search description or category..."
                  class="input input-bordered input-sm join-item w-full sm:w-64"
                />
                <label class="sr-only" for="smartFilter">Smart filter</label>
                <input
                  id="smartFilter"
                  v-model="smartFilter.text"
                  type="text"
                  placeholder="Smart filter (e.g., 'uber last 30d >20')"
                  class="input input-bordered input-sm join-item w-64"
                />
                <button class="btn btn-sm join-item" @click="runSmartFilter">
                  Smart
                </button>
              </div>
              <label class="sr-only" for="typeFilter">Type filter</label>
              <select
                id="typeFilter"
                v-model="typeFilter"
                class="select select-bordered select-sm"
              >
                <option value="">All Types</option>
                <option value="income">Income Only</option>
                <option value="spending">Spending Only</option>
              </select>
              <label class="sr-only" for="sourceFilter">Source filter</label>
              <select
                id="sourceFilter"
                v-model="sourceFilter"
                class="select select-bordered select-sm"
              >
                <option value="">All Sources</option>
                <option v-for="s in uniqueSources" :key="s" :value="s">
                  {{ s }}
                </option>
              </select>
            </div>
          </div>
          <p class="sr-only" aria-live="polite">{{ selectedCount }} selected.</p>
          <!-- Smart bulk toolbar -->
          <div class="flex flex-wrap items-center gap-2 mb-3">
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
                    @click="(e) => selectByTypeAndClose('income', 'page', e)"
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
                    @click="(e) => selectByTypeAndClose('spending', 'page', e)"
                  >
                    Current page
                  </button>
                </li>
                <li>
                  <button
                    role="menuitem"
                    @click="(e) => selectByTypeAndClose('spending', 'all', e)"
                  >
                    All Transactions
                  </button>
                </li>
              </ul>
            </details>

            <details class="dropdown">
              <summary class="btn btn-outline btn-xs" aria-haspopup="listbox">
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
                  <button class="btn btn-primary btn-sm" @click="selectLarge()">
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

            <label
              class="label cursor-pointer gap-2 ml-2 text-sm"
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

            <div class="mx-auto"></div>

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
            <button
              class="btn btn-outline btn-xs"
              @click="clearAllTransactions"
            >
              🧨 Remove All
            </button>
          </div>

          <!-- Selection hint -->
          <!-- <div
            v-if="selectedTransactions.length > 0"
            class="alert alert-info mb-3"
            role="status"
            aria-live="polite"
          >
            <div>
              <strong>{{ selectedTransactions.length }}</strong> selected.
              <button class="link link-primary" @click="openBulkEdit()">
                Bulk edit
              </button>
              or
              <button class="link link-primary" @click="selectSimilar()">
                select similar
              </button>
              across your data.
            </div>
          </div> -->

          <!-- Table -->
          <div class="overflow-x-auto">
            <table
  class="table table-zebra w-full"
  role="grid"
  aria-multiselectable="true"
>
  <caption class="sr-only">
    Transactions table. {{ filteredTransactions.length }} results shown{{ typeFilter ? " for type " + typeFilter : "" }}.
  </caption>

  <!-- Proper column sizing -->
  <colgroup>
    <col style="width:2.75rem" />
    <col style="width:9rem" />
    <col style="width:8rem" />
    <col style="width:9rem" />
    <col />
    <col />
    <col style="width:7.25rem" />
  </colgroup>

  <thead>
    <tr>
      <!-- Master checkbox -->
      <th scope="col">
        <label>
          <input
            type="checkbox"
            class="checkbox checkbox-sm"
            :checked="allSelected"
            :indeterminate="someSelectedOnPage && !allSelected"
            @change="toggleSelectAll"
            aria-label="Select all on current page"
          />
        </label>
      </th>

      <!-- Sortable headers -->
      <th scope="col">
        <button class="btn btn-ghost btn-xs" @click="updateSort('date')">
          Date <span aria-hidden="true">{{ getSortIcon('date') }}</span>
        </button>
      </th>
      <th scope="col">
        <button class="btn btn-ghost btn-xs" @click="updateSort('type')">
          Type <span aria-hidden="true">{{ getSortIcon('type') }}</span>
        </button>
      </th>
      <th scope="col">
        <button class="btn btn-ghost btn-xs" @click="updateSort('amount')">
          Amount <span aria-hidden="true">{{ getSortIcon('amount') }}</span>
        </button>
      </th>
      <th scope="col">
        <button class="btn btn-ghost btn-xs" @click="updateSort('category')">
          Category <span aria-hidden="true">{{ getSortIcon('category') }}</span>
        </button>
      </th>
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
      <!-- Row checkbox (fix: toggle just this row) -->
      <td>
        <label>
          <input
            type="checkbox"
            class="checkbox checkbox-sm"
            :checked="isSelected(t.id)"
            @change="toggleSelectRow(t.id)"
            :aria-label="`Select transaction on ${formatDate(t.date)} for $${t.amount.toFixed(2)}`"
          />
          <span class="sr-only" v-if="isSelected(t.id)">Selected</span>
        </label>
      </td>

      <!-- Date -->
      <td>{{ formatDate(t.date) }}</td>

      <!-- Type -->
      <td>
        <span
          class="badge type-badge"
          :class="t.type === 'income' ? 'badge-success' : 'badge-error'"
        >
          {{ t.type === "income" ? "💰 Income" : "💸 Spending" }}
        </span>
      </td>

      <!-- Amount -->
      <td>${{ t.amount.toFixed(2) }}</td>

      <!-- Category -->
      <td><span class="badge badge-outline">{{ t.category }}</span></td>

      <!-- Description -->
      <td>{{ t.description }}</td>

      <!-- Actions -->
      <td class="whitespace-nowrap text-right">
        <button class="btn btn-ghost btn-xs" @click="editTransaction(t)" aria-label="Edit">✏️</button>
        <button class="btn btn-ghost btn-xs" @click="duplicateTx(t)" aria-label="Duplicate">📄</button>
        <button class="btn btn-ghost btn-xs text-error" @click="deleteTransaction(t.id)" aria-label="Delete">🗑️</button>
      </td>
    </tr>
  </tbody>
</table>


            <!-- Empty state -->
            <div
              v-if="filteredTransactions.length === 0"
              class="text-center py-12"
            >
              <div class="text-6xl mb-4" aria-hidden="true">📝</div>
              <h3 class="text-lg font-semibold text-base-content/60 mb-2">
                No transactions found
              </h3>
              <p class="text-base-content/40">
                Try adjusting your search or filter criteria
              </p>
              <div class="mt-4 flex justify-center gap-2">
                <button
                  class="btn btn-primary btn-sm"
                  @click="activeTab = 'import'"
                >
                  Import CSV / Link
                </button>
                <button class="btn btn-ghost btn-sm" @click="activeTab = 'add'">
                  Add manually
                </button>
              </div>
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

      <!-- About -->
      <section
        v-show="activeTab === 'about'"
        class="card bg-base-100 shadow-xl max-w-2xl mx-auto mt-8"
        aria-labelledby="aboutHeading"
      >
        <div class="card-body">
          <h2 id="aboutHeading" class="card-title">ℹ️ About This App</h2>
          <div
            v-if="loadingAbout"
            class="text-center my-6"
            role="status"
            aria-live="polite"
          >
            <span
              class="loading loading-spinner loading-lg"
              aria-label="Loading"
            ></span>
          </div>
          <div v-else v-html="aboutHtml" class="prose max-w-none"></div>
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
              <svg class="w-4 h-4 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M20.59 13.41a2 2 0 0 0 0-2.82l-7.18-7.18a2 2 0 0 0-2.83 0L3 10.99V21h10.01l7.58-7.59Z"/><path d="M7 7h.01"/>
              </svg>
              <span>{{ c }}</span>
            </span>
          </li>
        </ul>
      </div>

      <!-- Custom (full CRUD) -->
      <div>
        <h4 class="font-semibold mb-2 text-sm">Custom</h4>
        <ul class="bg-base-200 rounded-box p-2 max-h-56 overflow-auto divide-y divide-base-300">
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
              <button class="btn btn-ghost btn-xs" @click="cancelRenameCategory" aria-label="Cancel">
                <!-- x icon -->
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            </template>
            <template v-else>
              <span class="flex-1 truncate">{{ c }}</span>
              <button class="btn btn-ghost btn-xs" @click="startRenameCategory(c)" aria-label="Rename">
                <!-- pencil -->
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M14 4l6 6M16 2l6 6-12 12H4v-6L16 2z"/>
                </svg>
              </button>
              <button class="btn btn-ghost btn-xs text-error" @click="deleteCustomCategory(c)" aria-label="Delete">
                <!-- trash -->
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                  <path d="M10 11v6M14 11v6"/>
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
          <button class="btn btn-primary btn-sm join-item" @click="addCustomCategory" aria-label="Add">
            <!-- plus -->
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>
          </button>
        </div>
      </div>
    </div>

    <p class="text-xs text-base-content/60 mt-3">
      Renaming updates all existing transactions. Deleting reassigns them to <strong>Uncategorized</strong>.
    </p>

    <div class="modal-action">
      <button class="btn" @click="catMgr.open = false">Close</button>
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
        <label class="label" for="beCategory"><span class="label-text">Set Category</span></label>
        <select id="beCategory" v-model="bulkEdit.category" class="select select-bordered select-sm">
          <option value="">(no change)</option>
          <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
        </select>
      </div>

      <!-- Type change -->
      <div class="form-control">
        <span class="label-text mb-1">Set Type</span>
        <div class="flex gap-3 items-center">
          <label class="inline-flex gap-2 items-center">
            <input type="radio" name="beType" value="" v-model="bulkEdit.type" class="radio radio-xs" />
            <span>(no change)</span>
          </label>
          <label class="inline-flex gap-2 items-center">
            <input type="radio" name="beType" value="income" v-model="bulkEdit.type" class="radio radio-xs" />
            <span>Income</span>
          </label>
          <label class="inline-flex gap-2 items-center">
            <input type="radio" name="beType" value="spending" v-model="bulkEdit.type" class="radio radio-xs" />
            <span>Spending</span>
          </label>
        </div>
      </div>

      <!-- Description edit -->
      <div class="form-control">
        <label class="label" for="beDesc"><span class="label-text">Description</span></label>
        <div class="join">
          <select v-model="bulkEdit.descMode" class="select select-bordered select-sm join-item" aria-label="Description mode">
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
        <label class="label" for="beFind"><span class="label-text">Find & Replace (case-insensitive)</span></label>
        <div class="join">
          <input id="beFind" v-model="bulkEdit.findText" type="text" class="input input-bordered input-sm join-item w-40" placeholder="Find…" />
          <input v-model="bulkEdit.replaceWith" type="text" class="input input-bordered input-sm join-item flex-1" placeholder="Replace with…" />
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
          <label class="inline-flex items-center gap-2">
            <input type="checkbox" class="checkbox checkbox-xs" v-model="bulkEdit.trimWhitespace" />
            <span>Trim</span>
          </label>
          <label class="inline-flex items-center gap-2">
            <input type="checkbox" class="checkbox checkbox-xs" v-model="bulkEdit.collapseSpaces" />
            <span>Collapse spaces</span>
          </label>
          <label class="inline-flex items-center gap-2">
            <input type="checkbox" class="checkbox checkbox-xs" v-model="bulkEdit.titleCase" />
            <span>Title Case</span>
          </label>
        </div>
      </div>

      <!-- Smart: Save keyword → category rule -->
      <div class="form-control">
        <span class="label-text mb-1">Save keyword → category rule</span>
        <div class="flex items-center gap-2">
          <label class="inline-flex items-center gap-2">
            <input type="checkbox" class="checkbox checkbox-xs" v-model="bulkEdit.saveRule" />
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
          Also set <strong>Category</strong> above. Future imports matching the keyword are auto-categorized.
        </p>
      </div>

      <!-- Optional: date shift -->
      <div class="form-control">
        <label class="label" for="beShift"><span class="label-text">Shift Date (days)</span></label>
        <input id="beShift" v-model.number="bulkEdit.shiftDays" type="number" class="input input-bordered input-sm w-32" placeholder="0" />
        <p class="text-xs text-base-content/60 mt-1">Positive numbers move dates forward.</p>
      </div>
    </div>

    <div class="modal-action">
      <button class="btn btn-ghost" @click="bulkEdit.open = false">Cancel</button>
      <button class="btn btn-primary" :disabled="selectedCount === 0" @click="applyBulkEdit">
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
  transactions.value.forEach((t) => {
    if (t.source) s.add(t.source);
  });
  return Array.from(s).sort();
});

/** ========= Tabs / Theme ========= */
const activeTab = ref<"import" | "add" | "chart" | "transactions" | "about">(
  "transactions"
);
const tabs = [
  { id: "import", label: "Import", icon: "📥" },
  { id: "add", label: "Add", icon: "➕" },
  { id: "chart", label: "Chart", icon: "📊" },
  { id: "transactions", label: "Transactions", icon: "📋" },
  { id: "about", label: "About", icon: "ℹ️" },
];
function onTab(id: typeof activeTab.value) {
  activeTab.value = id;
  if (id === "chart") ensureAllCatsSelected();
}

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

/** ========= Toasts (live feedback) ========= */
type ToastKind = "success" | "info" | "warning" | "error";
const toasts = ref<{ id: number; message: string; kind: ToastKind }[]>([]);
let toastId = 1;

/** Default 3.5s; user can close any time via ✕ */
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
const customCategories = ref<string[]>([]);

/** Simple user rules (keyword -> category) for smart CRUD; persisted */
type Rule = { keyword: string; category: string };
const userRules = ref<Rule[]>(
  JSON.parse(localStorage.getItem("financial-tracker-rules") || "[]")
);

/** Chart-category list reflects what’s present in data only */
const chartCategories = computed(() => {
  const s = new Set<string>();
  transactions.value.forEach((t) => s.add(t.category));
  return Array.from(s).sort();
});
/** All categories for inputs/filters */
const categories = computed(() => {
  const s = new Set<string>();
  transactions.value.forEach((t) => s.add(t.category));
  categoryNames.forEach((c) => s.add(c));
  customCategories.value.forEach((c) => s.add(c));
  return Array.from(s).sort();
});

// ======= Category Manager state & helpers =======
const catMgr = reactive<{
  open: boolean;
  newName: string;
  renaming: string;     // the category name currently being renamed
  renameText: string;   // the new name being typed
  startMode: '' | 'add' | 'manage';
}>({
  open: false,
  newName: '',
  renaming: '',
  renameText: '',
  startMode: '',
});

function openCategoryManager(mode: 'add' | 'manage' = 'manage') {
  catMgr.open = true;
  catMgr.startMode = mode;
  if (mode === 'add') {
    nextTick(() => {
      // convenience: focus the "new" input if present
      const el = document.querySelector<HTMLInputElement>('input[placeholder="New custom category"]');
      el?.focus();
    });
  }
}

function normalizeCatName(n: string) {
  return (n || '').replace(/\u00a0/g, ' ').trim().replace(/\s+/g, ' ');
}

const allCategoryLower = computed(() =>
  new Set<string>(
    [...categoryNames, ...customCategories.value].map((c) => c.toLowerCase())
  )
);

function addCustomCategory() {
  const name = normalizeCatName(catMgr.newName);
  if (!name) return;
  const low = name.toLowerCase();

  // prevent duplicates against default & custom
  if (allCategoryLower.value.has(low)) {
    pushToast('Category already exists', 'warning');
    return;
  }
  customCategories.value = [...customCategories.value, name].sort((a, b) =>
    a.localeCompare(b)
  );

  // if we're on the add form, auto-apply the newly created category
  if (activeTab.value === 'add') newTransaction.category = name;

  catMgr.newName = '';
  pushToast('Custom category added', 'success');
}

function startRenameCategory(oldName: string) {
  catMgr.renaming = oldName;
  catMgr.renameText = oldName;
}

function cancelRenameCategory() {
  catMgr.renaming = '';
  catMgr.renameText = '';
}

function saveRenameCategory() {
  const oldName = catMgr.renaming;
  if (!oldName) return;

  const next = normalizeCatName(catMgr.renameText);
  if (!next || next.toLowerCase() === oldName.toLowerCase()) {
    cancelRenameCategory();
    return;
  }
  if (allCategoryLower.value.has(next.toLowerCase())) {
    pushToast('That name already exists', 'error');
    return;
  }

  // Update custom list
  customCategories.value = customCategories.value
    .map((c) => (c === oldName ? next : c))
    .sort((a, b) => a.localeCompare(b));

  // Update existing transactions + current form
  transactions.value = transactions.value.map((t) =>
    t.category === oldName ? { ...t, category: next } : t
  );
  if (newTransaction.category === oldName) newTransaction.category = next;

  cancelRenameCategory();
  pushToast('Category renamed', 'success');
}

function deleteCustomCategory(name: string) {
  const used = transactions.value.filter((t) => t.category === name).length;
  const ok = confirm(
    used
      ? `Delete "${name}" and reassign ${used} existing transactions to "Uncategorized"?`
      : `Delete "${name}"?`
  );
  if (!ok) return;

  customCategories.value = customCategories.value.filter((c) => c !== name);

  if (used) {
    transactions.value = transactions.value.map((t) =>
      t.category === name ? { ...t, category: 'Uncategorized' } : t
    );
  }
  if (newTransaction.category === name) newTransaction.category = '';

  pushToast('Category deleted', 'success');
}

// ======= Persist custom categories (load + save) =======
onMounted(() => {
  try {
    const savedCustom = localStorage.getItem('financial-tracker-custom-categories');
    if (savedCustom) {
      const parsed = JSON.parse(savedCustom);
      if (Array.isArray(parsed)) {
        customCategories.value = parsed
          .map((x) => String(x || ''))
          .filter(Boolean)
          .sort((a, b) => a.localeCompare(b));
      }
    }
  } catch {}
});

watch(
  customCategories,
  () =>
    localStorage.setItem(
      'financial-tracker-custom-categories',
      JSON.stringify(customCategories.value)
    ),
  { deep: true }
);


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
  // release on the next tick so watchers see the final state
  queueMicrotask(() => (isImporting.value = false));
}

// helper: strip ?tx= (or #tx=) from address bar without reloading
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
let lz: any = null; // optional runtime dep
async function ensureLZ() {
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
  await ensureLZ();
  try {
    if (lz?.compressToEncodedURIComponent) {
      return "tx:" + lz.compressToEncodedURIComponent(json);
    }
  } catch {}
  return "tx:" + base64urlEncode(json);
}
async function decodeTxString(payload: string) {
  const s = payload.startsWith("tx:") ? payload.slice(3) : payload;
  await ensureLZ();
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
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
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
    }
  };
  reader.readAsText(file);
}

/** Import from input (URL or share code) */
async function importFromUrlOrCode() {
  const raw = importUrl.value.trim();
  if (!raw) return;
  try {
    // Share code (tx:xxxxx or bare)
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

    // URL with ?tx= or #tx=
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

    // Fallback: fetch CSV
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
  if (opts?.toast === false) return; // allow silent progress updates
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

  // Header cells (assume first line is a header; we’ll still cope if not)
  const headerCellsRaw = smartSplit(lines[0]).map((h) =>
    h
      .replace(/^\uFEFF/, "")
      .replace(/^"|"$/g, "")
      .trim()
  );
  const headersLower = headerCellsRaw.map((h) =>
    h.toLowerCase().replace(/\s+/g, " ").replace(/[()]/g, "")
  );

  // Column discovery
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

  // If there is explicit debit+credit, ignore single amount.
  if (iDebit >= 0 && iCredit >= 0) iAmt = -1;

  // If header looks like data (no headers), try treating first row as data.
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
    // Fall back: minimal 3-col shape Date, Amount, Description
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

  // Money & date helpers
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

  // If only a single Amount column, infer convention:
  // "normal": positive = income, negative = spending
  // "expensesPositive": positive = spending, negative = income
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
    // If almost everything is positive, it's likely "expensesPositive"
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

    // Date
    const iso = parseDateGuess(cols[iDate] ?? "");
    if (!iso) {
      skipped++;
      continue;
    }

    // Description
    const description = String(cols[iDesc] ?? "").trim();

    // Amount / Type
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

    // Category via rules / fallback
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
      description,
      recurring: false,
      frequency: "monthly",
      recursions: 1,
      endDate: "",
      // source will be added when user confirms
    });
  }

  if (!imported.length) {
    setImportStatus("No valid rows found in CSV.", true);
    return;
  }

  // Ask user to label before committing
  labelImport.open = true;
  labelImport.filename = filename;
  labelImport.imported = imported;
  labelImport.skipped = skipped;

  lastImportSummary.value =
    `Parsed ${imported.length} transaction${
      imported.length === 1 ? "" : "s"
    }. ` + `Please label this import to complete.`;
}

/** Heuristics to detect bank + amount sign convention */
type BankDetection = {
  name: string;
  variant?: string;
  amountSign?: "normal" | "expensesPositive";
  indices?: {
    date?: number;
    description?: number;
    amount?: number;
    debit?: number;
    credit?: number;
  };
  noHeader?: boolean;
};

// function looksLikeDate(s: string) {
//   const t = s.trim();
//   // dd/mm/yyyy (optionally with time)
//   if (
//     /^\d{1,2}[/-]\d{1,2}[/-]\d{2,4}(\s+\d{1,2}:\d{2}(:\d{2})?(\s*[AP]M)?)?$/i.test(
//       t
//     )
//   )
//     return true;
//   // yyyy-mm-dd (optionally with time or 'T')
//   if (/^\d{4}-\d{2}-\d{2}([ T]\d{2}:\d{2}(:\d{2})?)?/.test(t)) return true;
//   // dd Mon yyyy (optionally with time)
//   if (/^\d{1,2}\s+[A-Za-z]{3,9}\s+\d{2,4}(\s+\d{1,2}:\d{2}(:\d{2})?)?$/.test(t))
//     return true;
//   return false;
// }

// function looksLikeNumber(s: string) {
//   // Accept: 1234, 1,234.56, -123.45, $-14.29, -$14.29, (1,234.56), 1234,56
//   const t = s.trim();
//   if (!t) return false;
//   // strip parentheses and currency for detection only
//   const u = t.replace(/^\(|\)$/g, "").replace(/^\$|^\-?\$|[,$\s]/g, "");
//   return /^-?\d+([.,]\d+)?$/.test(u);
// }
// function firstNonEmptyRow(rows: string[]) {
//   for (const r of rows) {
//     if (r && r.replace(/,/g, "").trim().length) return r;
//   }
//   return "";
// }
// function splitCsvLine(line: string) {
//   const out: string[] = [];
//   let cur = "";
//   let q = false;
//   for (let i = 0; i < line.length; i++) {
//     const ch = line[i];
//     if (ch === '"') {
//       if (q && line[i + 1] === '"') {
//         cur += '"';
//         i++;
//       } else q = !q;
//     } else if (ch === "," && !q) {
//       out.push(cur);
//       cur = "";
//     } else cur += ch;
//   }
//   out.push(cur);
//   return out;
// }
function findIndex(headersLower: string[], needles: string[]) {
  for (const key of needles) {
    const idx = headersLower.findIndex((h) => h === key || h.includes(key));
    if (idx >= 0) return idx;
  }
  return -1;
}

// function detectWestpacVariantByAccountCell(v: string) {
//   const raw = v.trim();
//   if (!raw) return "Unknown";
//   if (/[Ee]\+/.test(raw)) return "Savings";
//   const digits = raw.replace(/\D/g, "");
//   if (digits.length <= 6) return "Credit Card";
//   if (digits.length >= 9) return "Savings";
//   return "Unknown";
// }

function norm(s = "") {
  return s
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase();
}
function normHeaders(cells: string[]) {
  return cells.map((h) => norm(h).replace(/\s+/g, " ").replace(/[()]/g, ""));
}
// function filenameHints(name?: string) {
//   const f = norm(name || "");
//   return {
//     hasANZ: /(^|[\s_-])(anz)([\s_-]|$)/.test(f),
//     hasCBA: /(combank|commonwealth)/.test(f),
//     hasING: /\bing\b/.test(f),
//     hasMAC: /(macquarie|^mac[\s_-])/.test(f),
//     hasNAB: /\bnab\b/.test(f),
//     hasSTG: /(st[.\s-]*george|\bstg\b)/.test(f),
//     hasUBank: /\bubank\b/.test(f),
//     hasUP: /(^|[\s_-])up([\s_-]|$)/.test(f),
//     hasWestpac: /\bwestpac\b/.test(f),
//     hasWestpacCC: /westpac.*(cc|credit)/.test(f),
//     hasWestpacSav: /westpac.*(save|sav)/.test(f),
//   };
// }
// /** Safer: treat first row as data if col1 is a date & col2 is a number */
// function rowLooksLikeData(line: string) {
//   const cols = smartSplit(line);
//   return looksLikeDate(cols[0] || "") && looksLikeNumber(cols[1] || "");
// }

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

  const count = merged.length;
  lastImportSummary.value =
    `Imported ${count} transaction${count === 1 ? "" : "s"} ` +
    `from “${label}”`;
  //+(labelImport.skipped ? ` (skipped ${labelImport.skipped})` : "") + ".";
  setImportStatus(lastImportSummary.value);

  // cleanup
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

// const bankChoice = reactive<{
//   open: boolean;
//   filename?: string;
//   imported: Transaction[];
//   skipped: number;
//   options: string[];
//   chosen: string;
// }>({
//   open: false,
//   filename: undefined,
//   imported: [],
//   skipped: 0,
//   options: [
//     "ANZ",
//     "Commonwealth Bank",
//     "NAB",
//     "Westpac",
//     "St George",
//     "ING",
//     "Macquarie Bank",
//     "UBank",
//     "Up Bank",
//     "Other / Unknown",
//   ],
//   chosen: "",
// });

// function confirmBankChoice() {
//   const picked = bankChoice.chosen || "Other / Unknown";
//   const count = bankChoice.imported.length;

//   // Merge
//   transactions.value = [...transactions.value, ...bankChoice.imported];

//   // Announce
//   lastImportSummary.value =
//     `Imported ${count} transaction${count === 1 ? "" : "s"} from ${picked}` +
//     (bankChoice.skipped ? ` (skipped ${bankChoice.skipped})` : "") +
//     ".";
//   setImportStatus(lastImportSummary.value);

//   // Cleanup
//   bankChoice.open = false;
//   bankChoice.imported = [];
//   bankChoice.skipped = 0;
//   bankChoice.filename = undefined;
//   bankChoice.chosen = "";
// }

// function cancelBankChoice() {
//   bankChoice.open = false;
//   bankChoice.imported = [];
//   bankChoice.skipped = 0;
//   bankChoice.filename = undefined;
//   bankChoice.chosen = "";
//   setImportStatus("Import cancelled.", true);
// }

// function detectBank(
//   headersLowerIn: string[],
//   sampleRows: string[],
//   filename?: string
// ): BankDetection | null {
//   const H = normHeaders(headersLowerIn);
//   const has = (needle: string) => H.some((h) => h.includes(needle));
//   const hints = filenameHints(filename);

//   // ----- Stage A: headerless quick-detect (ANZ 3-col, CommBank 4-col) -----
//   const firstRow = firstNonEmptyRow(sampleRows);
//   const firstRowLooksData = firstRow ? rowLooksLikeData(firstRow) : false;
//   if (firstRowLooksData) {
//     const cols = smartSplit(firstRow);
//     if (cols.length === 3) {
//       // ANZ: Date, Amount, Description
//       return {
//         name: hints.hasANZ ? "ANZ" : "ANZ",
//         variant: "3-column (Date, Amount, Description)",
//         amountSign: "normal",
//         indices: { date: 0, amount: 1, description: 2 },
//         noHeader: true,
//       };
//     }
//     if (cols.length >= 4) {
//       // CommBank: Date, Amount, Description, Balance
//       return {
//         name: hints.hasCBA ? "Commonwealth Bank" : "Commonwealth Bank",
//         variant: "Simple 4-column (Date, Amount, Description, Balance)",
//         amountSign: "normal",
//         indices: { date: 0, amount: 1, description: 2 },
//         noHeader: true,
//       };
//     }
//   }

//   // ----- Stage B: explicit headered formats -----

//   // UBank: Date and time + Description + Debit/Credit
//   if (has("date and time") && has("description") && (has("debit") && has("credit"))) {
//     return {
//       name: "UBank",
//       variant: "Debit/Credit Export",
//       amountSign: "normal",
//       indices: {
//         date: findIndex(H, ["date and time"]),
//         description: findIndex(H, ["description"]),
//         debit: findIndex(H, ["debit"]),
//         credit: findIndex(H, ["credit"]),
//       },
//     };
//   }

//   // Up Bank: has BSB / Account Number & Settled Date (or Time), amount under Total (AUD)
//   if ((has("bsb / account number") || has("account name")) && (has("settled date") || has("time"))) {
//     return {
//       name: "Up Bank",
//       variant: "Full CSV",
//       amountSign: "normal",
//       indices: {
//         date: findIndex(H, ["settled date", "time"]),
//         description: findIndex(H, ["description", "payee"]),
//         amount: findIndex(H, ["total aud", "amount aud", "total (aud)", "total"]),
//       },
//     };
//   }

//   // ING: Date, Description, Credit, Debit, Balance
//   if (has("description") && has("credit") && has("debit")) {
//     // guard against CBA/NAB false positives using file hint
//     if (hints.hasING || has("transaction type")) {
//       return {
//         name: "ING",
//         variant: "Credit/Debit Export",
//         amountSign: "normal",
//         indices: {
//           date: findIndex(H, ["date"]),
//           description: findIndex(H, ["description"]),
//           debit: findIndex(H, ["debit"]),
//           credit: findIndex(H, ["credit"]),
//         },
//       };
//     }
//   }

//   // Macquarie: Transaction Date/Posted Date + Details + Debit/Credit OR Amount
//   if ((has("transaction date") || has("posted date") || has("date")) && (has("details") || has("description"))) {
//     if (has("debit") || has("withdrawal") || has("credit") || has("deposit")) {
//       return {
//         name: "Macquarie Bank",
//         variant: "Debit/Credit Export",
//         amountSign: "normal",
//         indices: {
//           date: findIndex(H, ["transaction date", "posted date", "date"]),
//           description: findIndex(H, ["details", "description"]),
//           debit: findIndex(H, ["debit", "withdrawal"]),
//           credit: findIndex(H, ["credit", "deposit"]),
//         },
//       };
//     }
//     if (has("amount")) {
//       return {
//         name: "Macquarie Bank",
//         variant: "Amount Export",
//         amountSign: "normal",
//         indices: {
//           date: findIndex(H, ["transaction date", "posted date", "date"]),
//           description: findIndex(H, ["details", "description"]),
//           amount: findIndex(H, ["amount"]),
//         },
//       };
//     }
//   }

//   // NAB: Date + Amount + (Transaction Details or Merchant Name)
//   if (has("amount") && (has("transaction details") || has("merchant name"))) {
//     return {
//       name: "NAB",
//       variant: "Standard CSV",
//       amountSign: "normal",
//       indices: {
//         date: findIndex(H, ["date"]),
//         description: findIndex(H, ["transaction details", "merchant name"]),
//         amount: findIndex(H, ["amount"]),
//       },
//     };
//   }

//   // Commonwealth Bank (headered): Date/Transaction Date + Description + Amount or Debit+Credit
//   if ((has("transaction date") || has("date")) && has("description")) {
//     const iDate = findIndex(H, ["transaction date", "date"]);
//     const iDesc = findIndex(H, ["transaction description", "description"]);
//     const iDebit = findIndex(H, ["debit"]);
//     const iCredit = findIndex(H, ["credit"]);
//     const iAmt = findIndex(H, ["amount"]);
//     if (iDate >= 0 && iDesc >= 0 && (iAmt >= 0 || (iDebit >= 0 && iCredit >= 0))) {
//       return {
//         name: "Commonwealth Bank",
//         variant: iDebit >= 0 && iCredit >= 0 ? "Debit/Credit Export" : "Amount Export",
//         amountSign: "normal",
//         indices: {
//           date: iDate,
//           description: iDesc,
//           amount: iDebit >= 0 && iCredit >= 0 ? undefined : iAmt,
//           debit: iDebit >= 0 ? iDebit : undefined,
//           credit: iCredit >= 0 ? iCredit : undefined,
//         },
//       };
//     }
//   }

//   // Westpac savings / family DC: Narrative/Description + Debit Amount + Credit Amount
//   if ((has("narrative") || has("description")) && (has("debit amount") || has("debit")) && (has("credit amount") || has("credit"))) {
//     const family = hints.hasSTG ? "St George" : "Westpac";
//     return {
//       name: family,
//       variant: "Debit/Credit Export",
//       amountSign: "normal",
//       indices: {
//         date: findIndex(H, ["date"]),
//         description: findIndex(H, ["narrative", "description"]),
//         debit: findIndex(H, ["debit amount", "debit"]),
//         credit: findIndex(H, ["credit amount", "credit"]),
//       },
//     };
//   }

//   // Westpac single-amount exports where expenses are positive
//   if ((has("narrative") || has("description")) && has("amount")) {
//     return {
//       name: hints.hasSTG ? "St George" : "Westpac",
//       variant: "Amount Export",
//       amountSign: "expensesPositive",
//       indices: {
//         date: findIndex(H, ["date"]),
//         description: findIndex(H, ["narrative", "description"]),
//         amount: findIndex(H, ["amount"]),
//       },
//     };
//   }

//   // Filename-only hints (extreme fallback)
//   if (hints.hasANZ) return { name: "ANZ", variant: "Unknown", amountSign: "normal" };
//   if (hints.hasCBA) return { name: "Commonwealth Bank", variant: "Unknown", amountSign: "normal" };
//   if (hints.hasING) return { name: "ING", variant: "Unknown", amountSign: "normal" };
//   if (hints.hasMAC) return { name: "Macquarie Bank", variant: "Unknown", amountSign: "normal" };
//   if (hints.hasNAB) return { name: "NAB", variant: "Unknown", amountSign: "normal" };
//   if (hints.hasUBank) return { name: "UBank", variant: "Unknown", amountSign: "normal" };
//   if (hints.hasUP) return { name: "Up Bank", variant: "Unknown", amountSign: "normal" };
//   if (hints.hasWestpac || hints.hasSTG)
//     return { name: hints.hasSTG ? "St George" : "Westpac", variant: "Unknown", amountSign: "normal" };

//   return null;
// }

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

  // Keep just the date part if time is present
  // yyyy-mm-ddThh:mm  OR  yyyy-mm-dd hh:mm  -> take first 10
  const isoDateAtStart = s.match(/^(\d{4}-\d{2}-\d{2})/);
  if (isoDateAtStart) return isoDateAtStart[1];

  // dd/mm/yyyy [time...]
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

  // dd-mm-yyyy
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

  // dd Mon yyyy (spaces, e.g. "2 Nov 2024")
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

  // Fallback (last resort; locale-dependent)
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
  pushToast(`Rule added: “${keyword}” → ${category}`, "success");
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

/** Debounce recompute to avoid freezes during big imports */
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
      title: "Financial Tracker",
      text: "My transactions (auto-import link)",
      url,
    });
  } catch {
    /* ignore */
  }
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
    // else assume share code
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

/** ========= Add/Edit Form ========= */
const newTransaction = reactive<Transaction>({
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
/** ========= Recurring Transactions  ========= */
function generateRecurringTransactions(baseTx: Transaction): Transaction[] {
  const transactions: Transaction[] = [];
  const numOccurrences = Math.max(1, Number(baseTx.recursions || 1));
  
  for (let i = 0; i < numOccurrences; i++) {
    let occurrenceDate: string;
    
    if (i === 0) {
      // First occurrence uses the original date
      occurrenceDate = baseTx.date;
    } else {
      // Calculate subsequent dates based on frequency
      occurrenceDate = calculateNextOccurrenceDate(
        baseTx.date, 
        baseTx.frequency || 'monthly', 
        i
      );
    }
    
    transactions.push({
      ...baseTx,
      id: `${Date.now()}-${Math.floor(Math.random() * 10000)}-${i}`,
      date: occurrenceDate,
      // Only the first transaction should be marked as recurring
      recurring: i === 0 ? baseTx.recurring : false,
      recursions: i === 0 ? baseTx.recursions : 1,
      endDate: i === 0 ? baseTx.endDate : '',
    });
  }
  
  return transactions;
}

function calculateNextOccurrenceDate(startDate: string, frequency: RecurringFrequency, occurrenceIndex: number): string {
  const date = new Date(startDate);
  
  switch (frequency) {
    case 'daily':
      date.setDate(date.getDate() + occurrenceIndex);
      break;
    case 'weekly':
      date.setDate(date.getDate() + (occurrenceIndex * 7));
      break;
    case 'fortnightly':
      date.setDate(date.getDate() + (occurrenceIndex * 14));
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + occurrenceIndex);
      break;
    case 'quarterly':
      date.setMonth(date.getMonth() + (occurrenceIndex * 3));
      break;
    case 'yearly':
      date.setFullYear(date.getFullYear() + occurrenceIndex);
      break;
  }
  
  return toLocalISO(date);
}

function addTransaction() {
  if (newTransaction.amount <= 0 || !newTransaction.category) return;

  if (currentlyEditingId.value) {
    // Editing existing transaction (not handling recurring for edits)
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

  // Handle new transaction
  const baseTx = {
    ...newTransaction,
    id: `${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    source: newTransaction.source || "Manual",
  };

  if (newTransaction.recurring) {
    // Generate all recurring transactions
    const recurringTransactions = generateRecurringTransactions(baseTx);
    transactions.value.push(...recurringTransactions);
    pushToast(`Added ${recurringTransactions.length} recurring transactions`, "success");
  } else {
    // Single transaction
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
    localStorage.removeItem("financial-tracker-transactions");
    pushToast("All transactions removed", "success");
  }
}

/** ========= Filtering / Sorting / Selection ========= */
const searchQuery = ref("");
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

const filteredTransactions = computed(() => {
  let list = transactions.value.slice();
  // Date
  if (dateFilter.value.start && dateFilter.value.end) {
    const s = new Date(dateFilter.value.start).getTime();
    const e = new Date(dateFilter.value.end).getTime();
    list = list.filter((t) => {
      const d = new Date(t.date).getTime();
      return d >= s && d <= e;
    });
  }
  // Search & smart filter text
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(
      (t) =>
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
    );
  }
  // Type
  if (typeFilter.value) list = list.filter((t) => t.type === typeFilter.value);
  // Source (NEW)
  if (sourceFilter.value)
    list = list.filter(
      (t) => (t.source || DEFAULT_SOURCE) === sourceFilter.value
    );
  return list;
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
      if (pa !== pb) return pb - pa; // selected first
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
  // Reassign to keep Vue reactivity for Set mutations.
  selectedIds.value = new Set(newSet);
}
const someSelectedOnPage = computed(() =>
  paginatedTransactions.value.some((t) => selectedIds.value.has(t.id))
);

const allSelected = computed(() =>
  paginatedTransactions.value.length > 0 &&
  paginatedTransactions.value.every((t) => selectedIds.value.has(t.id))
);

function toggleSelectRow(id: string) {
  const s = new Set(selectedIds.value);
  if (s.has(id)) s.delete(id);
  else s.add(id);
  setSelected(s);

  // Gentle hint if this is the first pick
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
  transactions.value = transactions.value.filter((t) => !selectedIds.value.has(t.id));
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

  // basic description ops
  descMode: "none" as DescMode,
  descText: "",

  // smart edits
  findText: "",
  replaceWith: "",
  replaceAll: true,

  // cleanup
  trimWhitespace: true,
  collapseSpaces: true,
  titleCase: false,

  // date shift
  shiftDays: null as number | null,

  // rule creation
  saveRule: false,
  ruleKeyword: "",
});

// Selected transactions as an array (useful for suggestions)
const selectedTransactions = computed(() =>
  transactions.value.filter((t) => selectedIds.value.has(t.id))
);

// Suggest a useful keyword from selected descriptions
const suggestedKeyword = computed(() => {
  const counts = new Map<string, number>();
  const stop = new Set([
    "the","and","for","with","from","to","of","on","at","in",
    "payment","transfer","online","purchase","debit","visa","card","pos","eftpos"
  ]);
  for (const t of selectedTransactions.value) {
    const words = (t.description || "")
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .split(/\s+/)
      .filter((w) => w.length >= 3 && !stop.has(w) && !/^\d+$/.test(w));
    // de-duplicate per row to avoid over-weighting repeated words
    new Set(words).forEach((w) => counts.set(w, (counts.get(w) || 0) + 1));
  }
  let best = "", bestCount = 0;
  counts.forEach((c, w) => { if (c > bestCount) { bestCount = c; best = w; } });
  return best;
});

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function toTitleCase(s: string) {
  // Words start with letter; keep inner apostrophes/hyphens
  return s.replace(/\b([\p{L}][\p{L}'-]*)/gu, (m) => m[0].toUpperCase() + m.slice(1).toLowerCase());
}
function cleanDesc(raw: string) {
  let s = raw ?? "";
  if (bulkEdit.trimWhitespace) s = s.trim();
  if (bulkEdit.collapseSpaces) s = s.replace(/\s+/g, " ");
  if (bulkEdit.titleCase) s = toTitleCase(s);
  return s;
}


/** Smart bulk: select by type & scope */
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
    ? new RegExp(escapeRegExp(bulkEdit.findText.trim()), bulkEdit.replaceAll ? "gi" : "i")
    : null;

  transactions.value = transactions.value.map((t) => {
    if (!ids.has(t.id)) return t;

    // 1) Description edits
    let desc = t.description || "";

    // replace / prepend / append
    if (bulkEdit.descMode === "replace") {
      desc = bulkEdit.descText;
    } else if (bulkEdit.descMode === "prepend" && bulkEdit.descText) {
      desc = bulkEdit.descText + desc;
    } else if (bulkEdit.descMode === "append" && bulkEdit.descText) {
      desc = desc + bulkEdit.descText;
    }

    // smart find/replace
    if (findRe) {
      desc = desc.replace(findRe, bulkEdit.replaceWith ?? "");
    }

    // cleanup
    desc = cleanDesc(desc);

    // 2) Date shift
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

  // 3) Optional rule creation (keyword → category)
  if (bulkEdit.saveRule && bulkEdit.category) {
    const kw = (bulkEdit.ruleKeyword || suggestedKeyword.value || "").trim();
    if (kw) addRuleFromSelection(kw, bulkEdit.category);
  }

  bulkEdit.open = false;
  pushToast("Bulk changes applied", "success");
}



function selectByType(type: TransactionType, scope: "page" | "all") {
  const s = new Set(selectedIds.value);
  const src = scope === "page" ? paginatedTransactions.value : filteredTransactions.value;
  for (const t of src) if (t.type === type) s.add(t.id);
  setSelected(s);
}

function selectLarge() {
  const scopeList = largeSelect.value.pageOnly ? paginatedTransactions.value : filteredTransactions.value;
  let threshold = Number(largeSelect.value.threshold || 50);

  if (largeSelect.value.smart) {
    const spend = scopeList.filter((t) => t.type === "spending").map((t) => t.amount).sort((a, b) => a - b);
    if (spend.length) {
      const q1 = percentile(spend, 0.25), q3 = percentile(spend, 0.75);
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
    if (smartSelect.value.category && t.category !== smartSelect.value.category) return;
    if (smartSelect.value.type && t.type !== smartSelect.value.type) return;
    if (smartSelect.value.min != null && t.amount < smartSelect.value.min) return;
    if (smartSelect.value.max != null && t.amount > smartSelect.value.max) return;
    if (smartSelect.value.from && t.date < smartSelect.value.from) return;
    if (smartSelect.value.to && t.date > smartSelect.value.to) return;
    if (smartSelect.value.contains &&
        !t.description.toLowerCase().includes(smartSelect.value.contains.toLowerCase())) return;
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
  const type = /income/i.test(txt) ? "income" as const : /spending/i.test(txt) ? "spending" as const : "";
  const contains = txt.replace(/last\s+\d+\s*d|>\d+(\.\d+)?|<\d+(\.\d+)?|income|spending/gi, "").trim();

  const s = new Set<string>();
  filteredTransactions.value.forEach((t) => {
    if (type && t.type !== type) return;
    if (gt && t.amount <= Number(gt[1])) return;
    if (lt && t.amount >= Number(lt[1])) return;
    if (contains && !t.description.toLowerCase().includes(contains.toLowerCase())) return;
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


function bulkUpdateSelected({ category, type, addRuleKeyword }:
  { category?: string; type?: TransactionType; addRuleKeyword?: string }) {
  if (selectedIds.value.size === 0) return;
  transactions.value = transactions.value.map((t) => {
    if (!selectedIds.value.has(t.id)) return t;
    return {
      ...t,
      category: category ?? t.category,
      type: (type as TransactionType) ?? t.type,
    };
  });
  if (category && addRuleKeyword) addRuleFromSelection(addRuleKeyword, category);
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


/** Inline “smart filter” like 'uber last 30d >20' */


/** Smart bulk UX: Offer auto-select similar + bulk category change */
function normDesc(s: string) {
  return (s || "")
    .toLowerCase()
    .replace(/\d+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
function maybeOfferSelectSimilar(seed: Transaction) {
  // Low-key hint so first-time users aren’t overwhelmed
  const countSimilar = filteredTransactions.value.filter(
    (t) => normDesc(t.description) === normDesc(seed.description)
  ).length;
  if (countSimilar > 1) {
    pushToast(
      `Tip: many transactions look like “${seed.description}”. Use Smart Select or click “Select Spending/Income” dropdowns.`,
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

/** ========= About ========= */
const aboutHtml = ref("");
const loadingAbout = ref(false);
async function fetchAboutMarkdown() {
  loadingAbout.value = true;
  try {
    aboutHtml.value = `
      <h2>myAniFI - My Financial Tracker - v2.0</h2>
      <br>
      <h3>🔒 Privacy First: All data stored locally on your device!</h3>
      <br>
      <h3>🏦 Bank Support: Westpac✅ | NAB✅ | ANZ✅ | CommBank✅ | St.George✅ | ING✅ | Macquarie✅ | Up Bank✅ | UBank✅</h3>
      <br>
      <h3>✨ Key Features:</h3>
      <ul>
        <li>🏷️ Custom Categories - Add your own transaction categories</li>
        <li>🎯 Smart Bulk Operations - Select and edit multiple transactions</li>
        <li>📊 Advanced Analytics - Enhanced charts and filtering</li>
        <li>🔄 Auto-Categorization - Smart category suggestions</li>
        <li>📥 Supports CSV Import from major Australian banks</li>
        <li>📊 Interactive charts and analytics</li>
        <li>🔄 Recurring transaction support</li>
        <li>📱 Mobile-responsive design</li>
        <li>🎨 Multiple theme options</li>
        <li>💾 Automatic data persistence</li>
      </ul>
      <br>
      <ul>
      </ul>
      <h3>🚀 Future Features:</h3>
      <ul>
        <li>Further improvements on UI/UX</li>
        <li>Add an interactive bubble map chart type</li>
      </ul>
      <br>
      <h3>🛠️ Technical Stack:</h3>
      <ul>
        <li>Vue 3 with TypeScript</li>
        <li>DaisyUI for styling</li>
        <li>Chart.js for analytics</li>
        <li>Local storage for data persistence</li>
      </ul>
    `;
  } catch (error) {
    aboutHtml.value = "<p>Error loading about information.</p>";
  } finally {
    loadingAbout.value = false;
  }
}

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
  // clamp day-of-month to last day in target month
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
  if (!startISO || n <= 1) return startISO; // single occurrence ends same day
  const steps = n - 1; // end date of last occurrence
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

/** Keep the model's endDate in sync (useful if you persist it) */
watch(derivedEndDateISO, (v) => {
  if (newTransaction.recurring) newTransaction.endDate = v || "";
});

function normalizeTransactions(arr: any[]): Transaction[] {
  return (Array.isArray(arr) ? arr : [])
    .map((t: any) => {
      if (!t || typeof t !== "object") return null;
      const type: TransactionType = t.type === "income" ? "income" : "spending";
      const dateIso =
        typeof t.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(t.date)
          ? t.date
          : parseDateGuess(String(t.date || "")) || todayLocalISO();
      const amt = Number(t.amount);
      if (!isFinite(amt)) return null;
      return {
        id: String(t.id ?? `${Date.now()}-${Math.floor(Math.random() * 1e6)}`),
        date: dateIso,
        type,
        amount: Math.abs(amt),
        category: String(t.category ?? "Uncategorized"),
        description: String(t.description ?? ""),
        recurring: !!t.recurring,
        frequency: (t.frequency as RecurringFrequency) ?? "monthly",
        recursions: Number(t.recursions ?? 1),
        endDate: String(t.endDate ?? ""),
        source: String(t.source ?? DEFAULT_SOURCE),
      } as Transaction;
    })
    .filter(Boolean) as Transaction[];
}
function ddmmyyyyToISO(s: string) {
  const clean = finalizeDDMM(s);
  if (!clean) return "";
  const [dd, mm, yyyy] = clean.split("-");
  return `${yyyy}-${mm}-${dd}`;
}
function isoToDDMMYYYY(iso: string) {
  const m = iso?.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return "";
  const [, y, mo, d] = m;
  return `${d}-${mo}-${y}`;
}
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
watch([searchQuery, typeFilter, sourceFilter], () => (currentPage.value = 1));
watch(totalPages, (n) => {
  if (currentPage.value > n) currentPage.value = n;
  if (currentPage.value < 1) currentPage.value = 1;
});
watch(
  transactions,
  () => {
    // always persist quickly
    try {
      localStorage.setItem(
        "financial-tracker-transactions",
        JSON.stringify(transactions.value)
      );
    } catch {}
    // but don’t recompute share artifacts while importing
    if (isImporting.value) return;
    scheduleRecomputeShareArtifacts();
  },
  { deep: true }
);

watch([searchQuery, typeFilter], () => (currentPage.value = 1));
watch(activeTab, (tab) => {
  if (tab === "about" && !aboutHtml.value) fetchAboutMarkdown();
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

onMounted(async () => {
  // Theme
  const savedTheme = localStorage.getItem("financial-tracker-theme");
  if (savedTheme && availableThemes.includes(savedTheme)) setTheme(savedTheme);
  else
    setTheme(
      window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
    );

  // Transactions
  const savedTx = localStorage.getItem("financial-tracker-transactions");
  if (savedTx) {
    try {
      const raw = JSON.parse(savedTx);
      transactions.value = normalizeTransactions(raw);
    } catch {
      transactions.value = [];
    }
  } else {
    pushToast(
      "Tip: Import a CSV or use a Share Code to get started.",
      "info",
      6000
    );
  }

  resetDateFilter();

  // Chart config & toggles
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

  // // Auto-import if URL contains tx
  // const url = new URL(window.location.href);
  // const tx =
  //   url.searchParams.get("tx") ||
  //   (url.hash.startsWith("#tx=") ? url.hash.slice(4) : "");
  // if (tx) {
  //   beginImport();
  //   try {
  //     const json = await decodeTxString(tx.startsWith("tx:") ? tx : "tx:" + tx);
  //     loadTransactionsFromJSON(json);
  //     setImportStatus("Imported automatically from URL.");
  //   } catch {
  //     setImportStatus("Failed to auto-import from URL.", true);
  //   } finally {
  //     stripTxFromAddressBar();
  //     endImport();
  //   }
  // }
});

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
</script>

<style scoped>
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

.card:hover{
  transform: none!important
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
