const SUBJECTS = [
  { key: 'management', title: '课程管理', header: '温州市初中课程教学管理指引（2025年版）' },
  { key: 'chinese', title: '语文', header: '温州市初中语文教学常规（2025年版）' },
  { key: 'math', title: '数学', header: '温州市初中数学教学常规（2025年版）' },
  { key: 'english', title: '英语', header: '温州市初中英语教学常规（2025年版）' },
  { key: 'science', title: '科学', header: '温州市初中科学教学常规（2025年版）' },
  { key: 'social_law', title: '道德与法治', header: '温州市初中道德与法治教学常规（2025年版）' },
  { key: 'history', title: '历史', header: '温州市初中历史教学常规（2025年版）' },
  { key: 'geography', title: '地理', header: '温州市初中地理教学常规（2025年版）' },
  { key: 'pe_health', title: '体育与健康', header: '温州市义务教育体育与健康教学常规（2025年版）' },
  { key: 'music', title: '音乐', header: '温州市义务教育音乐教学常规（2025年版）' },
  { key: 'art', title: '美术', header: '温州市义务教育美术教学常规（2025年版）' },
  { key: 'it', title: '信息科技', header: '温州市义务教育信息科技教学常规（2025年版）' },
  { key: 'labor_practice', title: '劳动与综合实践', header: '温州市义务教育劳动、综合实践活动教学常规（2025年版）' },
  { key: 'local_course', title: '地方课程', header: '温州市义务教育地方课程教学常规（2025年版）' },
];

const SUBJECT_STRUCTURE = {
  'management': ['条文内容', '附件表'],
  'chinese': ['备课常规', '上课常规', '作业常规', '评价常规', '学科校本教研', '学科学习力培养', '附件'],
  'math': ['备课常规', '上课常规', '作业常规', '评价常规', '教研常规', '学习力培养', '附件'],
  'english': ['备课常规', '上课常规', '作业常规', '评价常规', '校本教研', '学习力培养', '附件'],
  'science': ['备课常规', '上课常规', '作业常规', '评价常规', '教科研常规', '科学学习力培养', '附件'],
  'social_law': ['备课常规', '上课常规', '作业常规', '评价常规', '教研常规', '学习力培养', '附件'],
  'history': ['备课常规', '上课常规', '作业常规', '评价常规', '教研常规', '学习力培养', '附件'],
  'geography': ['备课常规', '上课常规', '作业常规', '评价常规', '教研常规', '学习力培养', '附件'],
  'music': ['备课常规', '上课常规', '活动常规', '评价常规', '教研常规', '附件'],
  'pe_health': ['备课常规', '上课常规', '课外活动常规', '评价常规', '教研常规', '附件'],
  'art': ['备课常规', '上课常规', '活动常规', '作业常规', '评价常规', '教研常规', '附件'],
  'it': ['备课常规', '上课常规', '作业常规', '课外活动', '评价常规', '教研常规', '附件'],
  'labor_practice': ['备课常规', '上课常规', '活动常规', '评价常规', '教研常规', '附件'],
  'local_course': ['备课常规', '上课常规', '评价常规', '教研常规', '附件']
};

const KEYWORDS_BOLD = ['核心素养', '立德树人', '教学评一致性', '减负提质'];

const els = {};

function initEls() {
  els.subjectNav = document.getElementById('subjectNav');
  els.subnavTabs = document.getElementById('subnavTabs');
  els.subnavMoreBtn = document.getElementById('subnavMoreBtn');
  els.subnavMenu = document.getElementById('subnavMenu');
  els.subjectPanels = document.getElementById('subjectPanels');
  els.currentTitle = document.getElementById('currentTitle');
  els.heroTitle = document.getElementById('heroTitle');
  els.scrollContainer = document.getElementById('scrollContainer');
  els.themeToggle = document.getElementById('themeToggle');
  els.themeLink = document.getElementById('dark-theme');
  els.toast = document.getElementById('toast');
  els.quizModal = document.getElementById('quizModal');
  els.quizClose = document.getElementById('quizClose');
  els.quizSetup = document.getElementById('quizSetup');
  els.quizMain = document.getElementById('quizMain');
}

let app = {
  mdAll: '',
  mdBySubject: new Map(),
  navBySubject: new Map(),     // Stores tab structure { tabs: [], allIds: Set }
  sectionsBySubject: new Map(), // Stores rendered HTML chunks { [id]: html }
  activeSubject: 'management',
  activeSection: null,
};

function showToast(message) {
  if (!els.toast) return;
  els.toast.textContent = message;
  els.toast.hidden = false;
  window.clearTimeout(showToast._t);
  showToast._t = window.setTimeout(() => {
    els.toast.hidden = true;
  }, 2400);
}

function escapeHtml(s) {
  return (s || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function normalizeRoutePart(s) {
  return (s || '').replace(/^#+/, '').trim();
}

function parseRoute() {
  const raw = normalizeRoutePart(location.hash);
  if (!raw || raw === '/') return { subject: null, section: null };
  const parts = raw.split('/').filter(Boolean);
  return { subject: parts[0] || null, section: parts[1] || null };
}

function setRoute(subject, section) {
  const seg = section ? `#/${subject}/${section}` : `#/${subject}`;
  if (location.hash !== seg) location.hash = seg;
}

function validateRoute(route) {
  if (route.subject === 'welcome') return { subject: 'welcome', section: null, reason: null };
  const subject = route.subject && SUBJECTS.some((s) => s.key === route.subject) ? route.subject : null;
  if (!subject) return { subject: 'management', section: null, reason: 'invalid-subject' };
  let nav = app.navBySubject.get(subject);
  if (!nav && app.mdBySubject?.has?.(subject)) {
    renderSubjectContent(subject);
    nav = app.navBySubject.get(subject);
  }
  if (!nav) return { subject, section: null, reason: 'nav-not-ready' };
  
  // 'full' is always valid
  if (route.section === 'full') return { subject, section: 'full', reason: null };
  
  if (!route.section) return { subject, section: nav.tabs?.[0]?.id || null, reason: null };
  
  const ok = nav.allIds.has(route.section);
  if (!ok) return { subject, section: nav.tabs?.[0]?.id || null, reason: 'invalid-section' };
  return { subject, section: route.section, reason: null };
}

function initTheme() {
  const saved = localStorage.getItem('wztr_theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (saved === 'dark' || (!saved && prefersDark)) setTheme(true);
  else setTheme(false);
  els.themeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    setTheme(!isDark);
  });
}

function setTheme(isDark) {
  if (isDark) {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('wztr_theme', 'dark');
    els.themeToggle.textContent = '日间';
    if (els.themeLink) els.themeLink.media = 'all';
  } else {
    document.documentElement.setAttribute('data-theme', 'light'); // Explicitly set light
    localStorage.setItem('wztr_theme', 'light');
    els.themeToggle.textContent = '夜间';
    if (els.themeLink) els.themeLink.media = 'not all';
  }
}

async function loadSourceMd() {
  // If MD is already embedded (for single file mode), use it
  if (window.__MD_CONTENT__) return window.__MD_CONTENT__;
  
  const url = new URL('./温州市初中教学常规（2025年版）.md', location.href);
  // Changed cache strategy to ensure latest content is loaded
  const res = await fetch(url.toString(), { cache: 'no-cache' });
  if (!res.ok) throw new Error('无法加载原文 MD');
  const txt = await res.text();
  return txt.replace(/\r\n/g, '\n');
}

function indexOfHeading(md, headingText) {
  const norm = s => s.replace(/[（(]/g, '(').replace(/[）)]/g, ')').trim();
  const needle = `# ${norm(headingText)}`;
  const lines = md.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('#')) {
      if (norm(line) === needle) {
        return md.indexOf(lines[i]);
      }
    }
  }
  const alt = `# ${headingText.replace(/（/g, '(').replace(/）/g, ')')}`;
  const idx = md.indexOf(alt);
  if (idx >= 0) return idx;
  const alt2 = `# ${headingText.replace(/\(/g, '（').replace(/\)/g, '）')}`;
  return md.indexOf(alt2);
}

function buildSubjectMdMap(mdAll) {
  const mdBy = new Map();
  const positions = [];
  SUBJECTS.forEach((s) => {
    if (!s.header) return;
    const idx = indexOfHeading(mdAll, s.header);
    if (idx >= 0) positions.push({ key: s.key, idx });
  });
  positions.sort((a, b) => a.idx - b.idx);
  for (let i = 0; i < positions.length; i++) {
    const start = positions[i].idx;
    const end = i + 1 < positions.length ? positions[i + 1].idx : mdAll.length;
    mdBy.set(positions[i].key, mdAll.slice(start, end).trim());
  }
  return mdBy;
}

function cleanHeadingText(text) {
  let t = (text || '').replace(/^——\s*/, '').replace(/\s*——$/, '').trim();
  // Don't strip numbers yet, we need them for hierarchy detection
  return t;
}

function getHeadingLevel(text, rawLevel) {
  const t = cleanHeadingText(text);
  // Logic: If it looks like a numbered list item (一、, 1., (1)), it's content (Level 3 or 4).
  // If it's a non-numbered header, it's a Tab (Level 2).
  
  if (/^第?[0-9一二三四五六七八九十]+[、.．]/.test(t)) return 3;
  if (/^[（(][0-9一二三四五六七八九十]+[）)]/.test(t)) return 4;
  if (/^\d+\./.test(t)) return 4;
  
  // Attachments are tabs
  if (t.includes('附件') || t.includes('附录')) return 2;
  
  // Default: If it was # in markdown (level 1 inside subject), treat as Tab
  if (rawLevel === 1) return 2;
  
  return 3;
}

function mdToBlocks(md) {
  const lines = (md || '').split('\n');
  const blocks = [];
  let i = 0;
  const pushPara = (buf) => {
    const raw = buf.join('\n');
    if (!raw.trim()) return;
    // Clean paragraph starts
    const cleaned = raw.replace(/^(\d+\.|[一二三四五六七八九十]+、)\s+/, '$1 ');
    blocks.push({ type: 'p', text: cleaned });
  };
  while (i < lines.length) {
    const line = lines[i];
    const headerMatch = line.match(/^(#+)\s+(.*)/);
    if (headerMatch) {
      blocks.push({ type: 'h', level: headerMatch[1].length, text: headerMatch[2] });
      i += 1;
      continue;
    }
    if (/^\|/.test(line) && lines[i + 1] && /^\|\s*---/.test(lines[i + 1])) {
      const tableLines = [line, lines[i + 1]];
      i += 2;
      while (i < lines.length && /^\|/.test(lines[i])) {
        tableLines.push(lines[i]);
        i += 1;
      }
      blocks.push({ type: 'table', lines: tableLines });
      continue;
    }
    if (!line.trim()) {
      i += 1;
      continue;
    }
    const buf = [];
    const LIST_START_RE = /^\s*(?:[0-9]+\.|[一二三四五六七八九十]+[、\.]|\([0-9]+\)|（[0-9]+）|①)\s*/;
    
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].startsWith('#') &&
      !(/^\|/.test(lines[i]) && lines[i + 1] && /^\|\s*---/.test(lines[i + 1]))
    ) {
      const line = lines[i];
      // Check if this line is a list item start
      if (LIST_START_RE.test(line) && buf.length > 0) {
         // If we already have content, stop here to flush previous paragraph
         break;
      }
      
      buf.push(line);
      i += 1;
    }
    pushPara(buf);
  }
  return blocks;
}

function parseTable(tableLines) {
  const rows = tableLines
    .filter((l) => l.trim().startsWith('|'))
    .map((l) => l.trim())
    .map((l) => l.replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim()));
  if (rows.length < 2) return null;
  return { header: rows[0], body: rows.slice(2) };
}

function makeId(subjectKey, text, salt) {
  const base = `${subjectKey}-${text}-${salt}`;
  let h = 2166136261;
  for (let i = 0; i < base.length; i++) {
    h ^= base.charCodeAt(i);
    h = (h * 16777619) >>> 0;
  }
  return `${subjectKey}-${h.toString(16)}`;
}

// Logic to group attachments and build nav based on strict structure
function buildNavFromBlocks(subjectKey, blocks) {
  const tabs = [];
  const allIds = new Set();
  const structure = SUBJECT_STRUCTURE[subjectKey];
  
  if (!structure) {
    // Fallback if not defined
    return { tabs: [], allIds: new Set() };
  }

  structure.forEach((title, idx) => {
    // Generate ID for each expected tab
    const id = makeId(subjectKey, title, idx);
    tabs.push({ id, title });
    allIds.add(id);
  });
  
  return { tabs, allIds };
}

function renderSubjects() {
  els.subjectNav.innerHTML = '';
  const list = document.createElement('div');
  list.className = 'directory-list';
  SUBJECTS.forEach((s) => {
    const btn = document.createElement('button');
    btn.className = 'directory-btn';
    btn.type = 'button';
    btn.dataset.subject = s.key;
    btn.setAttribute('aria-label', `切换到${s.title}`);
    btn.setAttribute('aria-current', s.key === app.activeSubject ? 'page' : 'false');
    btn.innerHTML = `<span class="t">${escapeHtml(s.title)}</span>`;
    btn.addEventListener('click', () => {
      // If we are on welcome page, clicking the logo/brand (which we don't have here, but if we did)
      // or clicking a subject button should behave normally.
      
      // But wait, the brand click event is not here.
      // This is the subject list buttons.
      if (!app.navBySubject.has(s.key) && app.mdBySubject?.has?.(s.key)) renderSubjectContent(s.key);
      const nav = app.navBySubject.get(s.key);
      setRoute(s.key, nav?.tabs?.[0]?.id || null);
    });
    list.appendChild(btn);
  });
  els.subjectNav.appendChild(list);
  
  // Update Brand Click to go to Welcome
  const brandEl = document.querySelector('.brand');
  if (brandEl && !brandEl._wired) {
      brandEl._wired = true;
      brandEl.style.cursor = 'pointer';
      brandEl.addEventListener('click', () => {
          setRoute('welcome');
      });
  }
}

function setSubnavMenuPortal(enabled) {
  const moreContainer = els.subnavMoreBtn && els.subnavMoreBtn.parentElement;
  if (!els.subnavMenu || !moreContainer) return;
  const isPortal = els.subnavMenu.classList.contains('portal');
  if (enabled && !isPortal) {
    document.body.appendChild(els.subnavMenu);
    els.subnavMenu.classList.add('portal');
  } else if (!enabled && isPortal) {
    moreContainer.appendChild(els.subnavMenu);
    els.subnavMenu.classList.remove('portal');
  }
}

function renderSubnavTabs(subjectKey) {
  setSubnavMenuPortal(false);
  els.subnavTabs.innerHTML = '';
  els.subnavMenu.innerHTML = '';
  els.subnavMenu.hidden = true;
  els.subnavMoreBtn.setAttribute('aria-expanded', 'false');
  
  // Hide More container initially
  const moreContainer = els.subnavMoreBtn.parentElement;
  moreContainer.style.display = 'none';

  const nav = app.navBySubject.get(subjectKey);
  const tabs = nav?.tabs || [];
  
  // "Full View" tab
  const allTabs = [...tabs, { id: 'full', title: '全文预览' }];

  allTabs.forEach((t) => {
    // Create Tab (Visible)
    const btn = document.createElement('button');
    btn.className = 'subnavTab';
    btn.type = 'button';
    btn.textContent = t.title;
    btn.dataset.section = t.id;
    btn.setAttribute('aria-current', t.id === app.activeSection ? 'true' : 'false');
    btn.addEventListener('click', () => setRoute(subjectKey, t.id));
    els.subnavTabs.appendChild(btn);

    // Create Menu Item (Hidden by default, used for overflow)
    const mi = document.createElement('button');
    mi.className = 'subnavMenuItem';
    mi.type = 'button';
    mi.role = 'menuitem';
    mi.textContent = t.title;
    mi.dataset.section = t.id; // Add ID for lookup
    mi.style.display = 'none'; // Initially hidden
    mi.setAttribute('aria-current', t.id === app.activeSection ? 'true' : 'false');
    mi.addEventListener('click', () => {
      els.subnavMenu.hidden = true;
      setSubnavMenuPortal(false);
      els.subnavMoreBtn.setAttribute('aria-expanded', 'false');
      setRoute(subjectKey, t.id);
    });
    els.subnavMenu.appendChild(mi);
  });

  // Priority+ Pattern Logic
  // Wait for layout
  requestAnimationFrame(() => {
    const container = els.subnavTabs;
    
    // Check if overflowing
    if (container.scrollWidth > container.clientWidth) {
      moreContainer.style.display = 'block';
      
      // Move items to menu until it fits
      // We iterate backwards from the last tab
      const tabNodes = Array.from(container.children);
      for (let i = tabNodes.length - 1; i >= 0; i--) {
        // Check if we still overflow
        // Note: we check strict greater than, because if equal it fits.
        // We also check if we have any children left.
        if (container.scrollWidth <= container.clientWidth) break;
        
        const tab = tabNodes[i];
        const sectionId = tab.dataset.section;
        
        // Remove from visible tabs
        container.removeChild(tab);
        
        // Show in menu
        const menuItem = els.subnavMenu.querySelector(`.subnavMenuItem[data-section="${sectionId}"]`);
        if (menuItem) menuItem.style.display = 'block';
      }
    } else {
      moreContainer.style.display = 'none';
    }
  });

  // Overflow handling events (Click "More")
  if (!renderSubnavTabs._wired) {
    renderSubnavTabs._wired = true;
    els.subnavMoreBtn.addEventListener('click', () => {
      const willOpen = els.subnavMenu.hidden === true;
      if (willOpen) setSubnavMenuPortal(true);
      els.subnavMenu.hidden = !willOpen;
      els.subnavMoreBtn.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
      if (!willOpen) setSubnavMenuPortal(false);
    });
    document.addEventListener(
      'click',
      (e) => {
        if (!els.subnavMenu || els.subnavMenu.hidden) return;
        const t = e.target;
        if (t === els.subnavMoreBtn || els.subnavMoreBtn.contains(t) || els.subnavMenu.contains(t)) return;
        els.subnavMenu.hidden = true;
        setSubnavMenuPortal(false);
        els.subnavMoreBtn.setAttribute('aria-expanded', 'false');
      },
      { capture: true }
    );
  }
}

function emphasizeText(htmlText) {
  let out = htmlText;
  KEYWORDS_BOLD.forEach((k) => {
    const re = new RegExp(k, 'g');
    out = out.replace(re, `<strong>${k}</strong>`);
  });
  return out;
}

// Pre-render content into chunks
function renderSubjectContent(subjectKey) {
  if (subjectKey === 'welcome') {
    els.subjectPanels.innerHTML = `
      <div class="welcome-container" style="padding: 60px 20px; text-align: center; max-width: 800px; margin: 0 auto;">
        <div style="font-size: 64px; margin-bottom: 20px;">👋</div>
        <h1 style="font-size: 32px; font-weight: 800; color: var(--ink); margin-bottom: 16px; letter-spacing: -0.5px;">欢迎使用温州市初中教学常规查询系统</h1>
        <p style="font-size: 18px; color: var(--muted); line-height: 1.6; margin-bottom: 40px;">
          本系统汇集了2025年最新版温州市初中各学科教学常规与管理指引。<br>
          请点击左侧目录选择学科，或使用顶部导航快速跳转至相应章节。
        </p>
        <div style="margin-top: 60px; padding-top: 20px; border-top: 1px solid var(--border); font-size: 14px; color: var(--muted);">
          2025 © 温州市教育局教研室
        </div>
      </div>
    `;
    els.currentTitle.textContent = '欢迎';
    els.heroTitle.textContent = 'Welcome';
    els.subnavTabs.innerHTML = ''; 
    els.subnavMoreBtn.parentElement.style.display = 'none';
    return;
  }

  const md = app.mdBySubject.get(subjectKey) || '';
  const blocks = mdToBlocks(md);
  const nav = buildNavFromBlocks(subjectKey, blocks);
  const structure = SUBJECT_STRUCTURE[subjectKey] || [];
  
  app.navBySubject.set(subjectKey, { ...nav, allIds: new Set(nav.allIds) });

  const sectionsMap = new Map();
  // Initialize buffers for all tabs
  nav.tabs.forEach(t => sectionsMap.set(t.id, ''));

  // Default to first tab (or '条文内容' if management)
  let currentTabIndex = 0;
  let currentId = nav.tabs[0]?.id;
  let currentHtml = [];
  let tableIndex = 0;

  // Helper to save current buffer to CURRENT tab
  const saveBuffer = () => {
    if (currentHtml.length > 0 && currentId) {
      const existing = sectionsMap.get(currentId) || '';
      sectionsMap.set(currentId, existing + currentHtml.join(''));
    }
    currentHtml = [];
  };

  blocks.forEach((b, idx) => {
    if (b.type === 'h') {
      const title = cleanHeadingText(b.text);
      const level = getHeadingLevel(b.text, b.level);
      
      // Check if this header matches any tab in the structure
      // We check if it matches the *next* expected tab or any future tab
      // But usually it's sequential.
      // Special case for Management "条文内容": it consumes everything until "附件表"
      
      let matchedIndex = -1;
      
      // Try to find matching tab
      for (let i = 0; i < structure.length; i++) {
        const tabName = structure[i];
        // Exact or fuzzy match
        if (title.includes(tabName) || (tabName === '附件' && (title.includes('附件') || title.includes('附录')))) {
           // For management table special case
           if (subjectKey === 'management' && tabName === '附件表' && title.includes('反馈表')) {
             matchedIndex = i;
             break;
           }
           // General case
           if (title === tabName || (title.includes(tabName) && level <= 3)) {
             matchedIndex = i;
             break;
           }
        }
      }

      // If we found a tab match, switch to it
      if (matchedIndex !== -1) {
        saveBuffer();
        currentTabIndex = matchedIndex;
        currentId = nav.tabs[currentTabIndex].id;
        // Render the header as H2
        currentHtml.push(`<h2 class="doc-heading" id="${currentId}" data-level="2">${escapeHtml(title)}</h2>`);
        return;
      }
      
      // If it's the start of Management, assign to "条文内容" (index 0) if not already
      if (subjectKey === 'management' && currentTabIndex === 0 && !currentId) {
         currentId = nav.tabs[0].id;
      }

      // Normal content header
      if (level === 2) {
         currentHtml.push(`<h2 class="doc-heading" data-level="2">${escapeHtml(title)}</h2>`);
      } else if (level === 3) {
        currentHtml.push(`<h3 class="doc-heading" data-level="3">${escapeHtml(title)}</h3>`);
      } else {
        currentHtml.push(`<h4 class="doc-heading" data-level="4">${escapeHtml(title)}</h4>`);
      }
      return;
    }

    if (b.type === 'p') {
      const important = /应|必须|严禁|不得/.test(b.text);
      
      // Special check: If paragraph starts with "附件：" or "附件:"
      // and we have an "附件" tab in structure.
      if (/^附件[:：]/.test(b.text)) {
         // Find index of "附件" tab
         const attachIdx = structure.findIndex(s => s === '附件');
         if (attachIdx !== -1 && attachIdx !== currentTabIndex) {
             saveBuffer();
             currentTabIndex = attachIdx;
             currentId = nav.tabs[currentTabIndex].id;
         }
      }

      const text = escapeHtml(b.text);
      currentHtml.push(`<p class="${important ? 'highlight-border' : ''}">${text}</p>`);
      return;
    }

    if (b.type === 'table') {
      const t = parseTable(b.lines);
      if (t) {
        currentHtml.push(buildTableHtml(t, subjectKey, tableIndex));
        tableIndex += 1;
      }
    }
  });

  saveBuffer(); // Save last chunk
  app.sectionsBySubject.set(subjectKey, sectionsMap);
}

function buildTableHtml(table, subjectKey, tableIndex) {
  const colCount = Math.max(table.header.length, ...table.body.map((r) => r.length));
  const header = table.header.slice();
  while (header.length < colCount) header.push('');
  
  // Remove fixed width colgroup to allow auto-layout
  let colGroup = '<colgroup>';
  for (let i = 0; i < colCount; i++) colGroup += '<col>';
  colGroup += '</colgroup>';

  let thead = '<thead><tr>';
  for (let i = 0; i < colCount; i++) {
    const cell = escapeHtml(header[i] || '');
    thead += `<th scope="col">${cell}</th>`;
  }
  thead += '</tr></thead>';

  let tbody = '<tbody>';
  for (const row of table.body) {
    const r = row.slice();
    while (r.length < colCount) r.push('');
    tbody += '<tr>';
    for (const raw of r) {
      const v = raw || '';
      tbody += `<td>${escapeHtml(v)}</td>`;
    }
    tbody += '</tr>';
  }
  tbody += '</tbody>';

  const idx = Number.isFinite(tableIndex) ? String(tableIndex) : '';
  return `<div class="tableBlock" data-table-index="${idx}"><div class="tableToolbar"><span class="badge">表格</span><div class="tableTools"><span class="tableHint">可横向滚动</span><button type="button" class="btn tableAction" data-table-action="copy">复制</button><button type="button" class="btn tableAction" data-table-action="csv">导出CSV</button></div></div><div class="tableWrap" tabindex="0"><table class="regTable">${colGroup}${thead}${tbody}</table></div></div>`;
}

function normalizeCellText(s) {
  return (s || '')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tableToMatrix(tableEl) {
  const rows = Array.from(tableEl?.rows || []);
  return rows.map((row) => Array.from(row.cells || []).map((cell) => normalizeCellText(cell.textContent)));
}

function matrixToTsv(matrix) {
  return matrix.map((row) => row.join('\t')).join('\n');
}

function csvEscapeCell(s) {
  const v = String(s ?? '');
  if (/[",\n\r]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

function matrixToCsv(matrix) {
  return matrix.map((row) => row.map(csvEscapeCell).join(',')).join('\r\n');
}

function safeFilenamePart(s) {
  return String(s || '')
    .replace(/[\\/:*?"<>|]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80);
}

function downloadTextFile(filename, text, mimeType) {
  const blob = new Blob([text], { type: mimeType || 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 800);
}

async function copyTextToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.setAttribute('readonly', '');
  ta.style.position = 'fixed';
  ta.style.left = '-9999px';
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  ta.remove();
}

function wireTableActions() {
  if (wireTableActions._wired) return;
  wireTableActions._wired = true;

  els.subjectPanels.addEventListener('click', async (e) => {
    const btn = e.target?.closest?.('[data-table-action]');
    if (!btn) return;

    const action = btn.getAttribute('data-table-action');
    const block = btn.closest('.tableBlock');
    const table = block?.querySelector?.('table.regTable');
    if (!table) return;

    const matrix = tableToMatrix(table);
    const subject = safeFilenamePart(app.activeSubject);
    const section = safeFilenamePart(app.activeSection || 'section');
    const idx = safeFilenamePart(block?.dataset?.tableIndex || '');

    try {
      if (action === 'copy') {
        await copyTextToClipboard(matrixToTsv(matrix));
        showToast('已复制表格');
        return;
      }
      if (action === 'csv') {
        const csv = '\ufeff' + matrixToCsv(matrix);
        const filename = `表格-${subject}-${section}${idx ? '-' + idx : ''}.csv`;
        downloadTextFile(filename, csv, 'text/csv;charset=utf-8');
        showToast('已导出 CSV');
      }
    } catch {
      showToast('操作失败');
    }
  });
}

// Display the content based on active section
function updateContentArea() {
  const subjectKey = app.activeSubject;
  const sectionsMap = app.sectionsBySubject.get(subjectKey);
  if (!sectionsMap) return;

  const sectionId = app.activeSection;
  const nav = app.navBySubject.get(subjectKey);
  
  if (subjectKey === 'welcome') {
     return;
  }

  let fullHtml = '';
  
  if (sectionId === 'full') {
    // Render ALL sections joined together
    nav.tabs.forEach(t => {
      const html = sectionsMap.get(t.id) || '';
      fullHtml += `<section class="cardSection" id="${t.id}-container"><div class="card doc">${html}</div></section>`;
    });
  } else {
    // Render ONLY the active section
    const html = sectionsMap.get(sectionId) || '';
    if (html) {
      fullHtml = `<section class="cardSection" id="${sectionId}-container"><div class="card doc">${html}</div></section>`;
    } else {
      fullHtml = `<div style="padding: 40px; color: var(--muted); text-align: center;">暂无内容</div>`;
    }
  }
  
  els.subjectPanels.innerHTML = `<div class="contentStage">${fullHtml}</div>`;
  
  // Scroll Logic
  setTimeout(() => {
    // If in Full Preview, we might want to scroll to a specific section if provided via hash?
    // But usually clicking "Full Preview" just shows everything.
    // If we are in single section mode, we always scroll to top.
    
    if (sectionId === 'full') {
       els.scrollContainer.scrollTop = 0;
    } else {
       els.scrollContainer.scrollTop = 0;
    }
  }, 10);

  // Highlight subnav
  Array.from(els.subnavTabs.querySelectorAll('.subnavTab')).forEach((b) => {
    b.setAttribute('aria-current', b.dataset.section === sectionId ? 'true' : 'false');
  });
  
  // Highlight menu items too
  Array.from(els.subnavMenu.querySelectorAll('.subnavMenuItem')).forEach((b) => {
    b.setAttribute('aria-current', b.dataset.section === sectionId ? 'true' : 'false');
  });
}

function applyActiveSubject(subjectKey, desiredSection) {
  app.activeSubject = subjectKey;
  const subject = SUBJECTS.find((s) => s.key === subjectKey);
  if (subjectKey !== 'welcome') {
      els.currentTitle.textContent = subject?.title || subjectKey;
      els.heroTitle.textContent = subject?.title || subjectKey;
  }
  renderSubjects();

  // Process MD if not done
  if (!app.sectionsBySubject.has(subjectKey)) {
    renderSubjectContent(subjectKey);
  }

  const nav = app.navBySubject.get(subjectKey);
  // Default to first tab
  const fallback = nav?.tabs?.[0]?.id || 'full';
  
  // If no desired section is provided, use fallback (first tab).
  // If desired section IS provided, validate it.
  let validSection = fallback;
  if (desiredSection === 'full') {
    validSection = 'full';
  } else if (desiredSection && nav?.allIds?.has(desiredSection)) {
    validSection = desiredSection;
  }
  
  app.activeSection = validSection;
  
  renderSubnavTabs(subjectKey);
  updateContentArea();
}

let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (app.activeSubject) renderSubnavTabs(app.activeSubject);
  }, 100);
});

function onRouteChange() {
  const raw = parseRoute();
  const v = validateRoute(raw);
  
  if (v.reason === 'invalid-subject') showToast('无效科目链接');
  if (v.reason === 'invalid-section') showToast('无效章节链接');
  
  if (v.subject !== raw.subject || v.section !== raw.section) {
    setRoute(v.subject, v.section);
    return;
  }

  const subjectChanged = v.subject !== app.activeSubject;
  if (subjectChanged) {
    applyActiveSubject(v.subject, v.section);
  } else {
    // Same subject, different section
    app.activeSection = v.section;
    renderSubnavTabs(v.subject); // Update active state visually (though logic is in updateContentArea too, but tab list might need refresh if changed? No, just highlight)
    updateContentArea();
  }
}

function wireSearch() {
  // Removed
}

async function main() {
  initEls();
  initTheme();
  // wireSearch(); // Removed
  wireTableActions();
  renderSubjects();

  try {
    app.mdAll = await loadSourceMd();
    const mdBy = buildSubjectMdMap(app.mdAll);
    app.mdBySubject = mdBy;
    
    // Initial Route
    window.addEventListener('hashchange', onRouteChange);
    if (!location.hash) setRoute('welcome', null);
    else onRouteChange();
  } catch (e) {
    showToast('加载失败');
    els.subjectPanels.innerHTML = `<div style="padding:20px;color:red">${escapeHtml(String(e))}</div>`;
  }
}

document.addEventListener('DOMContentLoaded', main);
