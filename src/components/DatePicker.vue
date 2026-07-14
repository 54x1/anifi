<template>
  <div ref="root" class="date-picker relative" :class="{ 'date-picker-open': open }">
    <div class="join w-full">
      <input
        ref="inputEl"
        :id="id"
        v-model="text"
        type="text"
        inputmode="numeric"
        placeholder="dd-mm-yyyy"
        class="input input-bordered join-item w-full min-w-0"
        :class="{ 'input-primary ring-2 ring-primary/30': open }"
        :aria-label="ariaLabel"
        :aria-invalid="Boolean(error)"
        :aria-describedby="error ? `${id}-error` : undefined"
        autocomplete="off"
        enterkeyhint="done"
        @beforeinput="onBeforeInput"
        @blur="onBlur"
        @keydown="digitsOnly"
      />
      <button type="button" class="btn btn-outline join-item shrink-0" :class="{ 'btn-primary': open }" :aria-expanded="open" :aria-controls="`${id}-calendar`" :aria-label="`Open ${ariaLabel} calendar`" @click="toggle">
        <span aria-hidden="true">📅</span>
      </button>
    </div>
    <p v-if="error" :id="`${id}-error`" class="text-error text-xs mt-1">{{ error }}</p>

    <Teleport to="body">
    <div v-if="open" :id="`${id}-calendar`" ref="popover" class="date-picker-popover card bg-base-100 shadow-2xl border border-base-300" role="dialog" :aria-label="`Choose ${ariaLabel}`" :style="popoverStyle" @pointerdown="isInteracting = true" @pointerup="() => { isInteracting = false; lastInteractionTime = Date.now(); }" @pointerleave="isInteracting = false" style="touch-action: manipulation;">
      <div class="card-body p-3">
        <div class="flex items-center justify-between mb-2">
          <button type="button" class="btn btn-ghost btn-sm btn-square" aria-label="Previous month" @click="moveMonth(-1)">‹</button>
          <strong class="text-sm">{{ monthLabel }}</strong>
          <button type="button" class="btn btn-ghost btn-sm btn-square" aria-label="Next month" @click="moveMonth(1)">›</button>
        </div>
        <div class="grid grid-cols-7 text-center text-xs opacity-70 mb-1" aria-hidden="true">
          <span v-for="day in ['Su','Mo','Tu','We','Th','Fr','Sa']" :key="day">{{ day }}</span>
        </div>
        <div class="grid grid-cols-7 gap-1">
          <button v-for="cell in cells" :key="cell.iso" type="button" class="btn btn-sm btn-square text-xs"
            :class="[
              cell.inMonth ? 'btn-ghost' : 'btn-ghost opacity-40',
              cell.iso === modelValue ? 'btn-primary' : '',
              cell.iso === today ? 'date-picker-today' : '',
              cell.iso === today && cell.iso === modelValue ? 'date-picker-today-selected' : ''
            ]"
            :disabled="isDisabled(cell.iso)" :aria-pressed="cell.iso === modelValue"
            :aria-current="cell.iso === today ? 'date' : undefined" :aria-label="cell.iso === today ? `${display(cell.iso)} (today)` : display(cell.iso)" @click="pick(cell.iso)">
            {{ Number(cell.iso.slice(-2)) }}
          </button>
        </div>
        <div class="flex flex-wrap justify-end gap-2 mt-3">
          <button type="button" class="btn btn-ghost btn-sm" @click="pick('')">Clear</button>
          <button type="button" class="btn btn-primary btn-sm" :disabled="isDisabled(today)" @click="pick(today)">Today</button>
          <button type="button" class="btn btn-outline btn-sm" @click="open = false">Close</button>
        </div>
      </div>
    </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';

const props = withDefaults(defineProps<{ modelValue: string; id: string; ariaLabel?: string; min?: string; max?: string }>(), { ariaLabel: 'date', min: '', max: '' });
const emit = defineEmits<{ 'update:modelValue': [value: string] }>();
const root = ref<HTMLElement | null>(null);
const popover = ref<HTMLElement | null>(null);
const inputEl = ref<HTMLInputElement | null>(null);
const open = ref(false);
const isInteracting = ref(false);
const popoverStyle = ref<Record<string, string>>({});
const error = ref('');
const text = ref(toDisplay(props.modelValue));
const view = ref(monthStart(props.modelValue || localISO()));
const today = localISO();

watch(() => props.modelValue, value => { text.value = toDisplay(value); if (value) view.value = monthStart(value); });
const monthLabel = computed(() => new Date(`${view.value}T12:00:00`).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }));
const cells = computed(() => {
  const first = new Date(`${view.value}T12:00:00`); const start = new Date(first); start.setDate(1 - first.getDay());
  return Array.from({ length: 42 }, (_, i) => { const d = new Date(start); d.setDate(start.getDate() + i); const iso = localISO(d); return { iso, inMonth: iso.slice(0, 7) === view.value.slice(0, 7) }; });
});
function localISO(date = new Date()) { const y=date.getFullYear(); const m=String(date.getMonth()+1).padStart(2,'0'); const d=String(date.getDate()).padStart(2,'0'); return `${y}-${m}-${d}`; }
function monthStart(iso: string) { return `${iso.slice(0,7)}-01`; }
function toDisplay(iso: string) { if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return ''; const [y,m,d]=iso.split('-'); return `${d}-${m}-${y}`; }
function display(iso: string) { return new Date(`${iso}T12:00:00`).toLocaleDateString(); }
function parse(value: string) { const match=value.match(/^(\d{2})-(\d{2})-(\d{4})$/); if (!match) return ''; const iso=`${match[3]}-${match[2]}-${match[1]}`; return localISO(new Date(`${iso}T12:00:00`)) === iso ? iso : ''; }
function onBeforeInput(e: InputEvent) { if (e.data && !/^\d$/.test(e.data)) e.preventDefault(); error.value=''; }
function onBlur(e: FocusEvent) {
  // Defer so we can check whether focus moved inside this component (e.g., to the calendar button).
  // When focus stays inside, skip formatting to avoid cursor-jumping on mobile.
  const el = e.relatedTarget as Node | null;
  if (root.value?.contains(el)) return;
  queueMicrotask(() => {
    if (document.activeElement === inputEl.value) return; // still focused
    if (!text.value) { emit('update:modelValue',''); error.value=''; return; }
    text.value=text.value.replace(/\D/g,'').slice(0,8).replace(/^(\d{2})(\d)/,'$1-$2').replace(/^(\d{2}-\d{2})(\d)/,'$1-$2');
    const iso=parse(text.value);
    if (!iso || isDisabled(iso)) error.value='Enter a valid date in the allowed range.';
    else { emit('update:modelValue', iso); error.value=''; }
  });
}
function digitsOnly(e: KeyboardEvent) { if (e.ctrlKey || e.metaKey || ['Backspace','Delete','Tab','ArrowLeft','ArrowRight','Home','End'].includes(e.key)) return; if (!/^\d$/.test(e.key)) e.preventDefault(); }
function isDisabled(iso: string) { return Boolean((props.min && iso < props.min) || (props.max && iso > props.max)); }
function pick(iso: string, close=true) { if (iso && isDisabled(iso)) return; emit('update:modelValue',iso); text.value=toDisplay(iso); error.value=''; if (close) open.value=false; }
let positionTimer: ReturnType<typeof requestAnimationFrame> | null = null;
let interactionTimeoutId: ReturnType<typeof setTimeout> | null = null;
let lastInteractionTime = 0;
function positionPopover() {
  if (!open.value || !root.value) return;
  // Skip repositioning during user interaction or shortly after (to catch delayed scroll events on mobile)
  if (isInteracting.value || Date.now() - lastInteractionTime < 250) return;
  // On mobile, CSS handles centering — skip all JS positioning entirely.
  if (window.matchMedia('(max-width: 480px)').matches) return;
  // Debounce with rAF to avoid jitter during scroll/resize
  if (positionTimer) cancelAnimationFrame(positionTimer);
  positionTimer = requestAnimationFrame(() => {
    if (!open.value || !root.value) { positionTimer = null; return; }
    const anchor = root.value.getBoundingClientRect();
    const width = Math.min(320, window.innerWidth - 16);
    const height = popover.value?.offsetHeight || 390;
    const spaceBelow = window.innerHeight - anchor.bottom;
    const top = spaceBelow >= height + 8
      ? anchor.bottom + 8
      : Math.max(8, anchor.top - height - 8);
    const left = Math.max(8, Math.min(anchor.left, window.innerWidth - width - 8));
    popoverStyle.value = { top: `${top}px`, left: `${left}px`, width: `${width}px` };
    positionTimer = null;
  });
}
async function toggle() {
  open.value=!open.value;
  if (open.value) {
    view.value=monthStart(props.modelValue || localISO());
    await nextTick();
    // Clear any stale desktop styles when opening on mobile (CSS handles centering).
    if (window.matchMedia('(max-width: 480px)').matches) {
      popoverStyle.value = {};
    } else {
      positionPopover();
    }
  }
}
function moveMonth(delta: number) { const d=new Date(`${view.value}T12:00:00`); d.setMonth(d.getMonth()+delta); view.value=monthStart(localISO(d)); }
function outside(e: PointerEvent) {
  const target = e.target as Node;
  if (open.value && !root.value?.contains(target) && !popover.value?.contains(target)) open.value=false;
}
// Throttle resize handler to avoid excessive calls during keyboard show/hide
let resizeThrottle: ReturnType<typeof setTimeout> | null = null;
function onResize() {
  if (resizeThrottle) clearTimeout(resizeThrottle);
  resizeThrottle = setTimeout(() => { resizeThrottle = null; positionPopover(); }, 100);
}
onMounted(() => {
  document.addEventListener('pointerdown', outside);
  // Only add resize/scroll listeners on desktop — on mobile CSS handles all positioning.
  if (!window.matchMedia('(max-width: 480px)').matches) {
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', positionPopover, true);
  }
});
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', outside);
  window.removeEventListener('resize', onResize);
  window.removeEventListener('scroll', positionPopover, true);
  if (positionTimer) cancelAnimationFrame(positionTimer);
  if (resizeThrottle) clearTimeout(resizeThrottle);
  if (interactionTimeoutId) clearTimeout(interactionTimeoutId);
});
</script>

<style scoped>
/* Lift the entire picker into its own top-most stacking context. A high z-index
   on the popover alone cannot escape sibling cards and positioned form fields. */
.date-picker-open { z-index: 2147483646; }
.date-picker-today {
  font-weight: 700;
  color: oklch(var(--p));
  box-shadow: inset 0 0 0 2px oklch(var(--p));
  background: oklch(var(--p) / .1);
}
.date-picker-today-selected {
  color: oklch(var(--pc));
  box-shadow:
    inset 0 0 0 2px oklch(var(--pc) / .9),
    0 0 0 2px oklch(var(--p) / .35);
  background: oklch(var(--p));
}
.date-picker-popover {
  position: fixed;
  z-index: 2147483647;
  width: 20rem;
  max-width: min(calc(100vw - 2rem), 20rem);
  isolation: isolate;
}
@media (max-width: 480px) {
  .date-picker-popover {
    position: fixed;
    z-index: 2147483647;
    top: 50%;
    left: 50%;
    width: calc(100vw - 1rem);
    transform: translate(-50%, -50%);
    max-height: calc(100dvh - 1rem);
    overflow: auto;
    /* Smooth repositioning when keyboard dismisses and viewport changes */
    transition: top 150ms ease-out;
  }
}
</style>
