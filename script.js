/**
 * ==============================================================================
 * Findora – Lost & Found Hub (Vanilla JavaScript)
 * Author: Findora Project Team (FSD College Project)
 * Description: Client-side logic for item management, search, filters,
 *              modal operations, image upload preview, and localStorage persistence.
 * ==============================================================================
 */

// ------------------------------------------------------------------------------
// 1. Initial Mock Data & LocalStorage Keys
// ------------------------------------------------------------------------------
const STORAGE_KEY = 'findora_items_data';
const THEME_KEY = 'findora_theme_preference';

// Default sample data seeded when user opens Findora for the first time
const SAMPLE_ITEMS = [
  {
    id: 'findora-1',
    name: 'Matte Black Leather Backpack',
    status: 'lost', // 'lost' | 'found' | 'resolved'
    category: 'Wallets & Bags',
    description: 'Black Herschel backpack containing computer science textbooks, blue spiral notebook, and wireless mouse.',
    location: 'University Central Library, 2nd Floor Study Area',
    date: '2026-11-08',
    contactName: 'Alex Rivera',
    contactInfo: 'alex.rivera@campus.edu / +1 (555) 234-5678',
    image: '', // will render category placeholder or custom photo
    createdAt: Date.now() - 172800000 // 2 days ago
  },
  {
    id: 'findora-2',
    name: 'Silver Keyring with Car Key & Blue Tag',
    status: 'found',
    category: 'Keys & Jewelry',
    description: 'Set of 3 keys with a Honda car key fob and a metallic blue ocean keychain. Found on a bench.',
    location: 'Campus West Cafeteria outdoor picnic tables',
    date: '2026-11-09',
    contactName: 'Maya Patel',
    contactInfo: 'mpatel@campus.edu',
    image: '',
    createdAt: Date.now() - 86400000 // 1 day ago
  },
  {
    id: 'findora-3',
    name: 'Apple AirPods Pro in White Case',
    status: 'lost',
    category: 'Electronics',
    description: 'AirPods Pro 2nd Gen inside a white MagSafe case with a tiny scratch near the charging port.',
    location: 'Science Building Auditorium B',
    date: '2026-11-09',
    contactName: 'Jordan Smith',
    contactInfo: 'jsmith99@gmail.com',
    image: '',
    createdAt: Date.now() - 43200000
  },
  {
    id: 'findora-4',
    name: 'Brown Leather Bifold Wallet',
    status: 'found',
    category: 'Wallets & Bags',
    description: 'Men\'s brown leather wallet containing university ID card and metro transit card. Safely held.',
    location: 'Student Union Ground Floor, near ATM',
    date: '2026-11-10',
    contactName: 'Campus Security Desk',
    contactInfo: 'security@campus.edu / Ext: 4400',
    image: '',
    createdAt: Date.now() - 15000000
  },
  {
    id: 'findora-5',
    name: 'Ray-Ban Wayfarer Sunglasses',
    status: 'lost',
    category: 'Clothing & Accessories',
    description: 'Classic black frame sunglasses in a black leather case. Left behind after evening soccer practice.',
    location: 'Athletic Ground Bleachers',
    date: '2026-11-07',
    contactName: 'Chloe Bennett',
    contactInfo: '+1 (555) 876-5432',
    image: '',
    createdAt: Date.now() - 250000000
  },
  {
    id: 'findora-6',
    name: 'Student ID Card & Dorm Access Keycard',
    status: 'found',
    category: 'Documents & IDs',
    description: 'Student identification card with magnetic strip and dorm room lanyard found near bike racks.',
    location: 'North Quad Bicycle Parking',
    date: '2026-11-10',
    contactName: 'David Lee',
    contactInfo: 'david.lee@campus.edu',
    image: '',
    createdAt: Date.now() - 5000000
  }
];

// ------------------------------------------------------------------------------
// 2. Global State Variables
// ------------------------------------------------------------------------------
let items = [];
let currentFilter = {
  keyword: '',
  category: 'all',
  status: 'all', // 'all', 'lost', 'found'
  sortBy: 'newest'
};

let uploadedImageBase64 = ''; // Holds temporary image upload base64 string
let currentItemToDelete = null;

// ------------------------------------------------------------------------------
// 3. DOM Elements Selection
// ------------------------------------------------------------------------------
// Navigation & Theme
const themeToggleBtn = document.getElementById('themeToggleBtn');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navMenu = document.getElementById('navMenu');

// Filter & Search
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const sortFilter = document.getElementById('sortFilter');
const statusTabButtons = document.querySelectorAll('.status-tab-btn');
const clearFilterBtn = document.getElementById('clearFilterBtn');
const itemsCountDisplay = document.getElementById('itemsCountDisplay');
const itemsGrid = document.getElementById('itemsGrid');

// Report Modal & Form
const reportModal = document.getElementById('reportModal');
const openReportLostBtn = document.getElementById('openReportLostBtn');
const openReportFoundBtn = document.getElementById('openReportFoundBtn');
const heroReportLostBtn = document.getElementById('heroReportLostBtn');
const heroReportFoundBtn = document.getElementById('heroReportFoundBtn');
const closeReportModalBtn = document.getElementById('closeReportModalBtn');
const cancelReportBtn = document.getElementById('cancelReportBtn');
const reportForm = document.getElementById('reportForm');
const modalReportTypeLost = document.getElementById('modalReportTypeLost');
const modalReportTypeFound = document.getElementById('modalReportTypeFound');
const formItemTypeInput = document.getElementById('formItemType');
const modalTitleText = document.getElementById('modalTitleText');
const locationLabel = document.getElementById('locationLabel');
const dateLabel = document.getElementById('dateLabel');

// Image Upload
const imageFileInput = document.getElementById('imageFileInput');
const uploadDropzone = document.getElementById('uploadDropzone');
const imagePreviewContainer = document.getElementById('imagePreviewContainer');
const imagePreview = document.getElementById('imagePreview');
const removeImgBtn = document.getElementById('removeImgBtn');

// View Details Modal
const detailsModal = document.getElementById('detailsModal');
const closeDetailsModalBtn = document.getElementById('closeDetailsModalBtn');
const detailsModalContent = document.getElementById('detailsModalContent');

// Confirm Delete Modal
const deleteModal = document.getElementById('deleteModal');
const closeDeleteModalBtn = document.getElementById('closeDeleteModalBtn');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

// Stats Counters
const totalCountStat = document.getElementById('totalCountStat');
const resolvedCountStat = document.getElementById('resolvedCountStat');
const activeCountStat = document.getElementById('activeCountStat');

// Toast Container
const toastContainer = document.getElementById('toastContainer');

// ------------------------------------------------------------------------------
// 4. Application Initialization
// ------------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  loadItemsFromStorage();
  renderItems();
  updateStats();
  setupEventListeners();

  // Set default date input in report form to today
  const today = new Date().toISOString().split('T')[0];
  const itemDateInput = document.getElementById('itemDate');
  if (itemDateInput) {
    itemDateInput.value = today;
    itemDateInput.max = today;
  }
});

// ------------------------------------------------------------------------------
// 5. Theme Management (Light / Dark Mode)
// ------------------------------------------------------------------------------
function initTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY);
  // Default to system preference if no saved theme
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = savedTheme || (prefersDark ? 'dark' : 'light');

  applyTheme(theme);
}

function applyTheme(theme) {
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    themeToggleBtn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="5"></circle>
        <line x1="12" y1="1" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
      </svg>
    `;
    themeToggleBtn.setAttribute('title', 'Switch to Light Mode');
  } else {
    document.documentElement.removeAttribute('data-theme');
    themeToggleBtn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
      </svg>
    `;
    themeToggleBtn.setAttribute('title', 'Switch to Dark Mode');
  }
  localStorage.setItem(THEME_KEY, theme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  applyTheme(newTheme);
  showToast(`Switched to ${newTheme === 'dark' ? 'Dark' : 'Light'} Mode`, 'info');
}

// ------------------------------------------------------------------------------
// 6. Data Storage & Management
// ------------------------------------------------------------------------------
function loadItemsFromStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      items = JSON.parse(stored);
    } else {
      // First-time visit: seed sample items
      items = [...SAMPLE_ITEMS];
      saveItemsToStorage();
    }
  } catch (e) {
    console.error('Error loading items from localStorage', e);
    items = [...SAMPLE_ITEMS];
  }
}

function saveItemsToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    updateStats();
  } catch (e) {
    console.error('Error saving items to localStorage', e);
    showToast('Storage quota exceeded. Consider using smaller images.', 'error');
  }
}

function updateStats() {
  const total = items.length;
  const resolved = items.filter(i => i.status === 'resolved').length;
  const active = total - resolved;

  if (totalCountStat) totalCountStat.textContent = total;
  if (resolvedCountStat) resolvedCountStat.textContent = resolved;
  if (activeCountStat) activeCountStat.textContent = active;
}

// ------------------------------------------------------------------------------
// 7. Filtering & Sorting Logic
// ------------------------------------------------------------------------------
function getFilteredItems() {
  return items.filter(item => {
    // Keyword match (Item name, description, location)
    if (currentFilter.keyword.trim() !== '') {
      const q = currentFilter.keyword.toLowerCase().trim();
      const matchName = item.name.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchLoc = item.location.toLowerCase().includes(q);
      const matchCat = item.category.toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchLoc && !matchCat) {
        return false;
      }
    }

    // Category match
    if (currentFilter.category !== 'all' && item.category !== currentFilter.category) {
      return false;
    }

    // Status match ('all', 'lost', 'found')
    if (currentFilter.status !== 'all') {
      if (currentFilter.status === 'lost' && item.status !== 'lost') return false;
      if (currentFilter.status === 'found' && item.status !== 'found') return false;
    }

    return true;
  }).sort((a, b) => {
    if (currentFilter.sortBy === 'newest') {
      return (b.createdAt || 0) - (a.createdAt || 0);
    } else if (currentFilter.sortBy === 'oldest') {
      return (a.createdAt || 0) - (b.createdAt || 0);
    } else if (currentFilter.sortBy === 'date') {
      return new Date(b.date) - new Date(a.date);
    }
    return 0;
  });
}

// ------------------------------------------------------------------------------
// 8. Render Item Cards
// ------------------------------------------------------------------------------
function renderItems() {
  const filtered = getFilteredItems();
  itemsCountDisplay.textContent = `Showing ${filtered.length} item${filtered.length === 1 ? '' : 's'}`;

  if (filtered.length === 0) {
    itemsGrid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            <line x1="8" y1="11" x2="14" y2="11"></line>
          </svg>
        </div>
        <h3 class="empty-title">No Matching Items Found</h3>
        <p class="empty-desc">We couldn't find any items matching your active search filters. Try clearing your filters or report a new lost or found item.</p>
        <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; justify-content: center;">
          <button class="btn btn-secondary btn-sm" onclick="resetFilters()">Reset Filters</button>
          <button class="btn btn-primary btn-sm" onclick="openReportModal('lost')">Report Missing Item</button>
        </div>
      </div>
    `;
    return;
  }

  itemsGrid.innerHTML = filtered.map(item => createItemCardHTML(item)).join('');
}

function createItemCardHTML(item) {
  // Format human-friendly date
  let formattedDate = item.date;
  try {
    const parts = item.date.split('-');
    if (parts.length === 3) {
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      formattedDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  } catch (e) {
    formattedDate = item.date;
  }

  // Status badge styling
  let statusBadgeClass = 'status-badge-lost';
  let statusLabel = 'Lost Item';
  if (item.status === 'found') {
    statusBadgeClass = 'status-badge-found';
    statusLabel = 'Found Item';
  } else if (item.status === 'resolved') {
    statusBadgeClass = 'status-badge-resolved';
    statusLabel = 'Reunited / Resolved';
  }

  // Thumbnail or SVG Placeholder
  const thumbnailHTML = item.image
    ? `<img src="${item.image}" alt="${escapeHTML(item.name)}" class="item-thumbnail" loading="lazy" referrerpolicy="no-referrer">`
    : `<div class="thumbnail-placeholder">
        ${getCategoryIconSVG(item.category)}
        <span style="font-size: 0.8rem; font-weight: 600;">${escapeHTML(item.category)}</span>
       </div>`;

  return `
    <article class="item-card" data-id="${item.id}">
      <div class="item-thumbnail-wrapper">
        ${thumbnailHTML}
        <span class="item-status-badge ${statusBadgeClass}">
          ${statusLabel}
        </span>
      </div>

      <div class="item-card-body">
        <div class="item-card-meta">
          <span class="category-tag">${escapeHTML(item.category)}</span>
          <span>·</span>
          <span>${item.status === 'lost' ? 'Lost on' : 'Found on'} ${formattedDate}</span>
        </div>

        <h3 class="item-card-title">${escapeHTML(item.name)}</h3>
        <p class="item-card-description">${escapeHTML(item.description)}</p>

        <div class="item-card-details-row">
          <div class="detail-line">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHTML(item.location)}</span>
          </div>
          <div class="detail-line">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span>Posted by ${escapeHTML(item.contactName || 'Community Member')}</span>
          </div>
        </div>

        <div class="item-card-footer">
          <button class="btn btn-outline btn-sm" onclick="viewItemDetails('${item.id}')">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            View Details
          </button>
          
          <button class="btn btn-danger-outline btn-sm" title="Delete listing" onclick="askDeleteItem('${item.id}')">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            Delete
          </button>
        </div>
      </div>
    </article>
  `;
}

// ------------------------------------------------------------------------------
// 9. Category Icon Helpers (Zero external dependency SVG icons)
// ------------------------------------------------------------------------------
function getCategoryIconSVG(category) {
  switch (category) {
    case 'Electronics':
      return `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>`;
    case 'Wallets & Bags':
      return `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>`;
    case 'Documents & IDs':
      return `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"></rect><line x1="7" y1="8" x2="17" y2="8"></line><line x1="7" y1="12" x2="13" y2="12"></line><line x1="7" y1="16" x2="10" y2="16"></line></svg>`;
    case 'Keys & Jewelry':
      return `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="7.5" cy="15.5" r="5.5"></circle><path d="m21 2-9.6 9.6"></path><path d="m15.5 7.5 3 3L22 7l-3-3"></path></svg>`;
    case 'Clothing & Accessories':
      return `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"></path></svg>`;
    case 'Pets':
      return `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 6.006-4 7 .08.703 1.725 1.722 3.5 1 1.695-.69 4-4.29 4-5.828z"></path><path d="M14 5.172C14 3.782 15.577 2.679 17.5 3c2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.5 1-1.695-.69-4-4.29-4-5.828z"></path><path d="M12 14c2.5 0 4.5 1.5 4.5 3.5S14.5 21 12 21s-4.5-1.5-4.5-3.5 2-3.5 4.5-3.5z"></path></svg>`;
    default:
      return `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
  }
}

// ------------------------------------------------------------------------------
// 10. Modal Operations (Report, View Details, Confirm Delete)
// ------------------------------------------------------------------------------
function openReportModal(defaultType = 'lost') {
  setReportFormType(defaultType);
  reportModal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeReportModal() {
  reportModal.classList.remove('active');
  document.body.style.overflow = '';
  reportForm.reset();
  clearImagePreview();
}

function setReportFormType(type) {
  formItemTypeInput.value = type;
  if (type === 'lost') {
    modalReportTypeLost.classList.add('active-lost');
    modalReportTypeFound.classList.remove('active-found');
    modalTitleText.textContent = 'Report Lost Item';
    locationLabel.innerHTML = 'Location where you lost it <span class="required">*</span>';
    dateLabel.innerHTML = 'Date Lost <span class="required">*</span>';
    document.getElementById('reportSubmitBtn').className = 'btn btn-lost';
    document.getElementById('reportSubmitBtn').innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
      Publish Lost Item Report
    `;
  } else {
    modalReportTypeFound.classList.add('active-found');
    modalReportTypeLost.classList.remove('active-lost');
    modalTitleText.textContent = 'Report Found Item';
    locationLabel.innerHTML = 'Location where you found it <span class="required">*</span>';
    dateLabel.innerHTML = 'Date Found <span class="required">*</span>';
    document.getElementById('reportSubmitBtn').className = 'btn btn-found';
    document.getElementById('reportSubmitBtn').innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
      Publish Found Item Report
    `;
  }
}

// View Details Modal
function viewItemDetails(itemId) {
  const item = items.find(i => i.id === itemId);
  if (!item) return;

  let formattedDate = item.date;
  try {
    const parts = item.date.split('-');
    if (parts.length === 3) {
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      formattedDate = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    }
  } catch (e) {
    formattedDate = item.date;
  }

  const isResolved = item.status === 'resolved';
  let badgeColor = item.status === 'lost' ? 'var(--lost-color)' : (isResolved ? 'var(--resolved-color)' : 'var(--found-color)');
  let badgeBg = item.status === 'lost' ? 'var(--lost-bg)' : (isResolved ? 'var(--resolved-bg)' : 'var(--found-bg)');
  let badgeText = item.status === 'lost' ? 'Lost Item' : (isResolved ? 'Reunited / Resolved' : 'Found Item');

  const imageHTML = item.image
    ? `<div class="detail-modal-image-wrapper"><img src="${item.image}" alt="${escapeHTML(item.name)}" class="detail-modal-image"></div>`
    : `<div class="detail-modal-image-wrapper" style="display:flex; flex-direction:column; align-items:center; justify-content:center; gap:0.75rem; background:var(--brand-gradient-soft); color:var(--primary-purple);">
        ${getCategoryIconSVG(item.category)}
        <span style="font-weight:700; font-size:1.1rem;">${escapeHTML(item.category)}</span>
       </div>`;

  detailsModalContent.innerHTML = `
    ${imageHTML}
    
    <div style="display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 0.75rem; flex-wrap: wrap;">
      <span style="display:inline-flex; align-items:center; gap:0.35rem; padding: 0.35rem 0.85rem; border-radius: var(--radius-full); font-size: 0.85rem; font-weight: 700; color: ${badgeColor}; background: ${badgeBg}; border: 1px solid ${badgeColor};">
        ${badgeText}
      </span>
      <span style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600;">
        Category: <strong style="color: var(--primary-purple);">${escapeHTML(item.category)}</strong>
      </span>
    </div>

    <h2 style="font-size: 1.5rem; font-weight: 800; color: var(--text-main); margin-bottom: 0.75rem;">${escapeHTML(item.name)}</h2>
    
    <p style="font-size: 1rem; color: var(--text-muted); line-height: 1.6; margin-bottom: 1.25rem;">${escapeHTML(item.description)}</p>

    <div class="detail-grid">
      <div class="detail-field">
        <span class="detail-field-label">${item.status === 'lost' ? 'Date Lost' : 'Date Found'}</span>
        <span class="detail-field-value">${formattedDate}</span>
      </div>
      <div class="detail-field">
        <span class="detail-field-label">Location</span>
        <span class="detail-field-value">${escapeHTML(item.location)}</span>
      </div>
      <div class="detail-field">
        <span class="detail-field-label">Reported By</span>
        <span class="detail-field-value">${escapeHTML(item.contactName || 'Anonymous Community Member')}</span>
      </div>
      <div class="detail-field">
        <span class="detail-field-label">Listing Status</span>
        <span class="detail-field-value">${isResolved ? 'Completed / Reunited' : 'Active Listing'}</span>
      </div>
    </div>

    <div class="contact-card">
      <h4>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
        </svg>
        Direct Contact Information
      </h4>
      <div class="contact-info-row">
        <span class="contact-text">${escapeHTML(item.contactInfo)}</span>
        <button class="btn btn-secondary btn-sm" onclick="copyContactToClipboard('${escapeHTML(item.contactInfo)}')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          Copy Info
        </button>
      </div>
    </div>

    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:1.5rem; gap:1rem; flex-wrap:wrap;">
      <button class="btn btn-outline btn-sm" onclick="toggleItemResolved('${item.id}')">
        ${isResolved ? 'Mark as Active' : '✓ Mark as Reunited / Claimed'}
      </button>
      <button class="btn btn-secondary btn-sm" onclick="closeDetailsModal()">Close</button>
    </div>
  `;

  detailsModal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeDetailsModal() {
  detailsModal.classList.remove('active');
  document.body.style.overflow = '';
}

// Mark item resolved / active toggle
function toggleItemResolved(itemId) {
  const itemIndex = items.findIndex(i => i.id === itemId);
  if (itemIndex === -1) return;

  const currentStatus = items[itemIndex].status;
  if (currentStatus === 'resolved') {
    items[itemIndex].status = 'lost'; // restore default
    showToast('Listing status changed back to Active.', 'info');
  } else {
    items[itemIndex].status = 'resolved';
    showToast('Success! Item marked as Reunited / Resolved 🎉', 'success');
  }

  saveItemsToStorage();
  renderItems();
  viewItemDetails(itemId); // re-render detail modal view
}

// Confirm Delete Modal
function askDeleteItem(itemId) {
  currentItemToDelete = itemId;
  deleteModal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeDeleteModal() {
  deleteModal.classList.remove('active');
  document.body.style.overflow = '';
  currentItemToDelete = null;
}

function executeDeleteItem() {
  if (!currentItemToDelete) return;

  items = items.filter(i => i.id !== currentItemToDelete);
  saveItemsToStorage();
  renderItems();
  closeDeleteModal();
  showToast('Item deleted successfully from demo database.', 'success');
}

// ------------------------------------------------------------------------------
// 11. Form Submission & Input Handling
// ------------------------------------------------------------------------------
function handleReportSubmit(e) {
  e.preventDefault();

  const name = document.getElementById('itemName').value.trim();
  const type = formItemTypeInput.value; // 'lost' or 'found'
  const category = document.getElementById('itemCategory').value;
  const description = document.getElementById('itemDescription').value.trim();
  const location = document.getElementById('itemLocation').value.trim();
  const date = document.getElementById('itemDate').value;
  const contactName = document.getElementById('contactName').value.trim();
  const contactInfo = document.getElementById('contactInfo').value.trim();

  // Basic Validation
  if (!name || !category || !description || !location || !date || !contactInfo) {
    showToast('Please fill in all mandatory fields.', 'error');
    return;
  }

  // Create new item object
  const newItem = {
    id: 'findora-' + Date.now(),
    name,
    status: type,
    category,
    description,
    location,
    date,
    contactName: contactName || 'Anonymous',
    contactInfo,
    image: uploadedImageBase64 || '',
    createdAt: Date.now()
  };

  // Prepend to items list so newest appears first
  items.unshift(newItem);
  saveItemsToStorage();

  // Automatically switch status filter to view the posted category
  currentFilter.status = type;
  updateStatusTabButtons();

  renderItems();
  closeReportModal();

  showToast(`Your ${type === 'lost' ? 'Lost' : 'Found'} item has been successfully reported!`, 'success');

  // Scroll smoothly down to items section
  const browseSection = document.getElementById('browse');
  if (browseSection) {
    browseSection.scrollIntoView({ behavior: 'smooth' });
  }
}

// Image File Upload Preview (using FileReader to Base64)
function handleImageSelect(e) {
  const file = e.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    showToast('Please select a valid image file (PNG, JPG, WEBP).', 'error');
    return;
  }

  // Limit file size to 2MB for localStorage health
  if (file.size > 2 * 1024 * 1024) {
    showToast('Image size exceeds 2MB limit. Please choose a smaller photo.', 'error');
    return;
  }

  const reader = new FileReader();
  reader.onload = (event) => {
    uploadedImageBase64 = event.target.result;
    imagePreview.src = uploadedImageBase64;
    imagePreviewContainer.style.display = 'block';
    uploadDropzone.style.display = 'none';
  };
  reader.readAsDataURL(file);
}

function clearImagePreview() {
  uploadedImageBase64 = '';
  imageFileInput.value = '';
  imagePreview.src = '';
  imagePreviewContainer.style.display = 'none';
  uploadDropzone.style.display = 'block';
}

// ------------------------------------------------------------------------------
// 12. Reset & Utilities
// ------------------------------------------------------------------------------
function resetFilters() {
  currentFilter = {
    keyword: '',
    category: 'all',
    status: 'all',
    sortBy: 'newest'
  };

  searchInput.value = '';
  categoryFilter.value = 'all';
  sortFilter.value = 'newest';
  updateStatusTabButtons();
  renderItems();
  showToast('Filters reset to default.', 'info');
}

function updateStatusTabButtons() {
  statusTabButtons.forEach(btn => {
    if (btn.getAttribute('data-status') === currentFilter.status) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

function copyContactToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showToast('Contact information copied to clipboard! 📋', 'success');
    }).catch(() => {
      fallbackCopyText(text);
    });
  } else {
    fallbackCopyText(text);
  }
}

function fallbackCopyText(text) {
  const tempInput = document.createElement('input');
  tempInput.value = text;
  document.body.appendChild(tempInput);
  tempInput.select();
  document.execCommand('copy');
  document.body.removeChild(tempInput);
  showToast('Contact info copied! 📋', 'success');
}

function escapeHTML(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ------------------------------------------------------------------------------
// 13. Toast Notification Helper
// ------------------------------------------------------------------------------
function showToast(message, type = 'info') {
  if (!toastContainer) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type === 'error' ? 'error' : 'success'}`;

  let iconSVG = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  `;

  if (type === 'error') {
    iconSVG = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="15" y1="9" x2="9" y2="15"></line>
        <line x1="9" y1="9" x2="15" y2="15"></line>
      </svg>
    `;
  }

  toast.innerHTML = `
    <span class="toast-icon">${iconSVG}</span>
    <span class="toast-message">${escapeHTML(message)}</span>
  `;

  toastContainer.appendChild(toast);

  // Auto remove after 3.5 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(15px)';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 250);
  }, 3500);
}

// ------------------------------------------------------------------------------
// 14. Event Listeners Setup
// ------------------------------------------------------------------------------
function setupEventListeners() {
  // Theme toggle
  themeToggleBtn.addEventListener('click', toggleTheme);

  // Mobile menu
  mobileMenuBtn.addEventListener('click', () => {
    navMenu.classList.toggle('open');
  });

  // Close mobile menu on clicking any link
  navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
    });
  });

  // Search input with debounce
  let searchTimeout;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      currentFilter.keyword = e.target.value;
      renderItems();
    }, 200);
  });

  // Category select
  categoryFilter.addEventListener('change', (e) => {
    currentFilter.category = e.target.value;
    renderItems();
  });

  // Sort select
  sortFilter.addEventListener('change', (e) => {
    currentFilter.sortBy = e.target.value;
    renderItems();
  });

  // Status Filter Tabs
  statusTabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const status = btn.getAttribute('data-status');
      currentFilter.status = status;
      updateStatusTabButtons();
      renderItems();
    });
  });

  // Clear filters
  if (clearFilterBtn) {
    clearFilterBtn.addEventListener('click', resetFilters);
  }

  // Open Report Modals
  if (openReportLostBtn) openReportLostBtn.addEventListener('click', () => openReportModal('lost'));
  if (openReportFoundBtn) openReportFoundBtn.addEventListener('click', () => openReportModal('found'));
  if (heroReportLostBtn) heroReportLostBtn.addEventListener('click', () => openReportModal('lost'));
  if (heroReportFoundBtn) heroReportFoundBtn.addEventListener('click', () => openReportModal('found'));

  // Close Report Modal
  if (closeReportModalBtn) closeReportModalBtn.addEventListener('click', closeReportModal);
  if (cancelReportBtn) cancelReportBtn.addEventListener('click', closeReportModal);

  // Toggle between Lost and Found inside modal
  if (modalReportTypeLost) {
    modalReportTypeLost.addEventListener('click', () => setReportFormType('lost'));
  }
  if (modalReportTypeFound) {
    modalReportTypeFound.addEventListener('click', () => setReportFormType('found'));
  }

  // Form submission
  if (reportForm) {
    reportForm.addEventListener('submit', handleReportSubmit);
  }

  // Image Upload Listeners
  if (uploadDropzone) {
    uploadDropzone.addEventListener('click', () => imageFileInput.click());
    
    // Drag & Drop
    uploadDropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadDropzone.style.borderColor = 'var(--primary-purple)';
    });

    uploadDropzone.addEventListener('dragleave', () => {
      uploadDropzone.style.borderColor = 'var(--border-color)';
    });

    uploadDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadDropzone.style.borderColor = 'var(--border-color)';
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleImageSelect({ target: { files: e.dataTransfer.files } });
      }
    });
  }

  if (imageFileInput) {
    imageFileInput.addEventListener('change', handleImageSelect);
  }

  if (removeImgBtn) {
    removeImgBtn.addEventListener('click', clearImagePreview);
  }

  // Details Modal close
  if (closeDetailsModalBtn) closeDetailsModalBtn.addEventListener('click', closeDetailsModal);

  // Delete Modal close & confirm
  if (closeDeleteModalBtn) closeDeleteModalBtn.addEventListener('click', closeDeleteModal);
  if (cancelDeleteBtn) cancelDeleteBtn.addEventListener('click', closeDeleteModal);
  if (confirmDeleteBtn) confirmDeleteBtn.addEventListener('click', executeDeleteItem);

  // Click outside to close modals
  window.addEventListener('click', (e) => {
    if (e.target === reportModal) closeReportModal();
    if (e.target === detailsModal) closeDetailsModal();
    if (e.target === deleteModal) closeDeleteModal();
  });

  // ESC key to close open modals
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeReportModal();
      closeDetailsModal();
      closeDeleteModal();
    }
  });
}

// Expose functions globally for inline HTML event handlers (e.g. onclick)
window.viewItemDetails = viewItemDetails;
window.askDeleteItem = askDeleteItem;
window.copyContactToClipboard = copyContactToClipboard;
window.toggleItemResolved = toggleItemResolved;
window.openReportModal = openReportModal;
window.resetFilters = resetFilters;
