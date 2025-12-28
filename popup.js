document.addEventListener('DOMContentLoaded', () => {
    let currentChart = null;

    // دالة تشفير كلمة المرور باستخدام SHA-256
    async function hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // 1. قاموس اللغات الشامل
    const i18n = {
        en: {
            setupTitle: "Setup FamilyShield", setupDesc: "Secure your data with a password",
            loginTitle: "FamilyShield Locked", recoveryTitle: "Access Recovery",
            placeholderPass: "Password", placeholderConfirm: "Confirm Password",
            placeholderRecovery: "Recovery Key", placeholderNewPass: "New Password",
            btnSave: "Save Settings", btnLogin: "Unlock", btnForgot: "Forgot Password?",
            btnVerify: "Verify", btnBack: "Back", tabList: "List", tabChart: "Analytics",
            btnExport: "Export CSV", btnClear: "Clear History", btnStop: "Stop Tracking",
            btnStart: "Start Tracking", btnSettings: "Settings", btnUpdate: "Update",
            btnCancel: "Cancel", msgConfirmClear: "Are you sure? All data will be deleted.",
            msgRecError: "Invalid Recovery Key!", msgSuccess: "Updated Successfully!",
            csvHeaders: "Domain,Full URL,Visit Time,Duration",
            locale: "en-US", alertNoData: "No data!", unknown: "Unknown",
            secPassword: "🔐 Password Security", smartLists: "🎯 Smart Lists Control",
            enableLists: "Enable Smart Lists", enableListsDesc: "Control website access",
            blacklistMode: "🚫 Blacklist", whitelistMode: "✅ Whitelist",
            noSites: "No sites added", addSitePlaceholder: "example.com",
            settingsTitle: "Settings", selectMode: "Select Mode:",
            addNewSite: "Add Website:", sitesList: "Websites List:",
            btnClearAll: "Clear All", msgClearAllConfirm: "Delete all sites from this list?",
            btnAddSite: "➕ Add Website",
            incognitoTracking: "🕵️ Incognito Mode Tracking",
            enableIncognito: "Enable Incognito Tracking",
            incognitoDesc: "Track browsing in private mode",
            incognitoNote: "Note: You must enable 'Allow in Incognito' from Chrome Extensions settings for this feature to work.",
            incognitoActive: "Incognito Tracking Active",
            palestineSupport: "Free Palestine",
            supportDev: "☕ Buy Me a Coffee",
            supportDesc: "Support development - $1"
        },
        ar: {
            setupTitle: "إعداد FamilyShield", setupDesc: "قم بحماية بياناتك بكلمة مرور",
            loginTitle: "FamilyShield مقفل", recoveryTitle: "استعادة الوصول",
            placeholderPass: "كلمة المرور", placeholderConfirm: "تأكيد كلمة المرور",
            placeholderRecovery: "رمز الاستعادة", placeholderNewPass: "كلمة المرور الجديدة",
            btnSave: "حفظ الإعدادات", btnLogin: "دخول", btnForgot: "نسيت كلمة المرور؟",
            btnVerify: "تحقق", btnBack: "رجوع", tabList: "القائمة", tabChart: "الإحصائيات",
            btnExport: "تصدير CSV", btnClear: "مسح السجل", btnStop: "إيقاف التتبع",
            btnStart: "تشغيل التتبع", btnSettings: "الإعدادات", btnUpdate: "تحديث",
            btnCancel: "إلغاء", msgConfirmClear: "هل أنت متأكد؟ سيتم حذف جميع السجلات.",
            msgRecError: "رمز الاستعادة غير صحيح!", msgSuccess: "تم التحديث بنجاح!",
            csvHeaders: "النطاق,الرابط الكامل,وقت الزيارة,مدة البقاء",
            locale: "ar-EG", alertNoData: "لا توجد بيانات!", unknown: "غير معروف",
            secPassword: "🔐 حماية كلمة المرور", smartLists: "🎯 التحكم بالقوائم الذكية",
            enableLists: "تفعيل القوائم الذكية", enableListsDesc: "التحكم في الوصول للمواقع",
            blacklistMode: "🚫 القائمة السوداء", whitelistMode: "✅ القائمة البيضاء",
            noSites: "لا توجد مواقع", addSitePlaceholder: "example.com",
            settingsTitle: "الإعدادات", selectMode: "اختر الوضع:",
            addNewSite: "إضافة موقع:", sitesList: "قائمة المواقع:",
            btnClearAll: "مسح الكل", msgClearAllConfirm: "حذف جميع المواقع من هذه القائمة؟",
            btnAddSite: "➕ إضافة موقع",
            incognitoTracking: "🕵️ تتبع الوضع الخفي",
            enableIncognito: "تفعيل تتبع Incognito",
            incognitoDesc: "تتبع التصفح في الوضع الخاص",
            incognitoNote: "ملاحظة: يجب تفعيل 'السماح في وضع Incognito' من إعدادات الإضافات في كروم حتى تعمل هذه الميزة.",
            incognitoActive: "تتبع الوضع الخفي نشط",
            palestineSupport: "فلسطين قضيتنا",
            supportDev: "☕ ادعمني بقهوة",
            supportDesc: "دعم التطوير - $1"
        },
        zh: {
            setupTitle: "设置 FamilyShield", setupDesc: "使用密码保护您的数据",
            loginTitle: "BrowseGuard 已锁定", recoveryTitle: "恢复访问",
            placeholderPass: "密码", placeholderConfirm: "确认密码",
            placeholderRecovery: "恢复代码", placeholderNewPass: "新密码",
            btnSave: "保存设置", btnLogin: "解锁", btnForgot: "忘记密码？",
            btnVerify: "验证", btnBack: "返回", tabList: "列表", tabChart: "分析",
            btnExport: "导出 CSV", btnClear: "清除历史", btnStop: "停止追踪",
            btnStart: "开始追踪", btnSettings: "设置", btnUpdate: "更新",
            btnCancel: "取消", msgConfirmClear: "您确定吗？所有数据将被删除。",
            msgRecError: "恢复代码错误！", msgSuccess: "更新成功！",
            csvHeaders: "域名,完整网址,访问时间,持续时间",
            locale: "zh-CN", alertNoData: "没有数据！", unknown: "未知",
            secPassword: "🔐 密码安全", smartLists: "🎯 智能列表控制",
            enableLists: "启用智能列表", enableListsDesc: "控制网站访问",
            blacklistMode: "🚫 黑名单", whitelistMode: "✅ 白名单",
            noSites: "没有添加网站", addSitePlaceholder: "example.com",
            settingsTitle: "设置", selectMode: "选择模式：",
            addNewSite: "添加网站：", sitesList: "网站列表：",
            btnClearAll: "清除全部", msgClearAllConfirm: "删除此列表中的所有网站？",
            btnAddSite: "➕ 添加网站",
            incognitoTracking: "🕵️ 隐身模式追踪",
            enableIncognito: "启用隐身追踪",
            incognitoDesc: "在私密模式下追踪浏览",
            incognitoNote: "注意：您必须从 Chrome 扩展设置中启用'允许在隐身模式下使用'才能使用此功能。",
            incognitoActive: "隐身追踪已激活",
            palestineSupport: "自由巴勒斯坦",
            supportDev: "☕ 请我喝咖啡",
            supportDesc: "支持开发 - $1"
        }
    };

    // 2. دوال المساعدة (الوقت والتاريخ)
    function formatDuration(sec) {
        if (!sec || sec < 1) return "0s";
        const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
        let res = [];
        if (h > 0) res.push(h + "h");
        if (m > 0) res.push(m + "m");
        if (s > 0 || res.length === 0) res.push(s + "s");
        return res.join(" ");
    }

    function getFormattedDateTime(timestamp, lang) {
        const dict = i18n[lang] || i18n.en;
        if (!timestamp || isNaN(timestamp)) return dict.unknown;
        try {
            return new Date(timestamp).toLocaleString(dict.locale, {
                year: 'numeric', month: '2-digit', day: '2-digit',
                hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
            });
        } catch (e) { return dict.unknown; }
    }

    // 3. محرك الترجمة والتحكم في الشاشات
    function applyLanguage(lang) {
        const dict = i18n[lang] || i18n.en;
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (dict[key]) el.textContent = dict[key];
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (dict[key]) el.setAttribute('placeholder', dict[key]);
        });
        document.body.dir = (lang === 'ar' ? 'rtl' : 'ltr');
        chrome.storage.local.set({ userLang: lang });
        loadData();
    }

    function showScreen(id) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        const target = document.getElementById(id);
        if (target) target.classList.add('active');
    }

    // 4. تحميل البيانات للواجهة
    function loadData() {
        chrome.storage.local.get(['historyData', 'isTracking', 'userLang', 'incognitoEnabled'], (res) => {
            const data = res.historyData || [];
            const isTracking = res.isTracking !== false;
            const lang = res.userLang || 'en';
            const incognitoEnabled = res.incognitoEnabled || false;
            const dict = i18n[lang] || i18n.en;

            // عرض مؤشر Incognito
            const badge = document.getElementById('incognitoBadge');
            if (badge) {
                badge.style.display = incognitoEnabled ? 'block' : 'none';
            }

            const tBtn = document.getElementById('toggleTracking');
            if (tBtn) {
                tBtn.textContent = isTracking ? dict.btnStop : dict.btnStart;
                tBtn.style.color = isTracking ? "var(--danger)" : "var(--success)";
            }

            const listDiv = document.getElementById('historyList');
            if (!listDiv) return;
            listDiv.innerHTML = '';
            
            data.slice(0, 40).forEach(item => {
                const row = document.createElement('div');
                row.className = 'history-item';
                const visitTime = new Date(item.startTime || item.time).toLocaleTimeString(dict.locale, {hour:'2-digit', minute:'2-digit'});
                
                row.innerHTML = `
                    <img src="${item.icon}" onerror="this.src='icon128.png'">
                    <div style="flex:1; overflow:hidden;">
                        <div class="domain-name" style="font-weight:bold;">${item.domain}</div>
                        <div style="font-size:0.6rem; color:var(--text-muted);">${visitTime}</div>
                    </div>
                    <div style="background:#334155; padding:2px 6px; border-radius:4px; font-size:0.7rem; color:var(--primary);">
                        ${formatDuration(item.durationSeconds)}
                    </div>
                `;
                listDiv.appendChild(row);
            });
            renderChart(data);
        });
    }

    function renderChart(data) {
        const ctxEl = document.getElementById('domainChart');
        if (!ctxEl) return;
        if (data.length === 0) { if (currentChart) currentChart.destroy(); return; }
        
        const counts = {};
        data.forEach(item => counts[item.domain] = (counts[item.domain] || 0) + (item.durationSeconds || 0));
        const sorted = Object.entries(counts).sort((a,b) => b[1]-a[1]).slice(0, 5);
        
        const ctx = ctxEl.getContext('2d');
        if (currentChart) currentChart.destroy();
        currentChart = new Chart(ctx, {
            type: 'doughnut',
            data: { labels: sorted.map(i => i[0]), datasets: [{ data: sorted.map(i => i[1]), backgroundColor: ['#818cf8', '#10b981', '#f43f5e', '#f59e0b', '#3b82f6'], borderWidth: 0 }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', font: {size: 10} } } } }
        });
    }

    // 5. التصدير (CSV) المصحح
    function exportToCSV() {
        chrome.storage.local.get(['historyData', 'userLang'], (res) => {
            const data = res.historyData || [];
            const lang = res.userLang || 'en';
            const dict = i18n[lang] || i18n.en;

            if (data.length === 0) return alert(dict.alertNoData);

            let csv = "\uFEFF" + dict.csvHeaders + "\n";
            data.forEach(item => {
                const visitTime = getFormattedDateTime(item.startTime || item.time, lang);
                const duration = formatDuration(item.durationSeconds);
                csv += `"${item.domain}","${item.fullUrl}","${visitTime}","${duration}"\n`;
            });

            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `BrowseGuard_Report_${lang}.csv`;
            link.click();
        });
    }

    // 6. المستمعات (Events)
    document.getElementById('langSelector').addEventListener('change', (e) => applyLanguage(e.target.value));
    document.getElementById('exportCSV').addEventListener('click', exportToCSV);
    
    // زر دعم المطور عبر PayPal (في الـ Header)
    document.getElementById('supportBtnHeader').addEventListener('click', () => {
        chrome.tabs.create({ url: 'https://www.paypal.me/alyeladawy1' });
    });
    
    // زر دعم المطور عبر PayPal (في الـ Settings)
    document.getElementById('supportBtn').addEventListener('click', () => {
        chrome.tabs.create({ url: 'https://www.paypal.me/alyeladawy1' });
    });

    document.getElementById('saveSetup').addEventListener('click', async () => {
        const p = document.getElementById('setupPass').value, c = document.getElementById('setupConfirm').value, r = document.getElementById('setupRecovery').value;
        if (p !== c) return alert("Passwords mismatch");
        const hashedPass = await hashPassword(p);
        chrome.storage.local.set({ vaultPass: hashedPass, recoveryKey: r }, () => { 
            showScreen('mainScreen'); 
            loadData();
            // تأثير confetti احتفالي عند الإعداد الناجح
            if (typeof confetti !== 'undefined') {
                confetti({
                    particleCount: 120,
                    spread: 80,
                    origin: { y: 0.6 },
                    colors: ['#a78bfa', '#60a5fa', '#34d399', '#fbbf24']
                });
            }
        });
    });

    document.getElementById('unlockBtn').addEventListener('click', async () => {
        const p = document.getElementById('loginPass').value;
        const hashedPass = await hashPassword(p);
        chrome.storage.local.get(['vaultPass'], (res) => {
            if (hashedPass === res.vaultPass) { 
                showScreen('mainScreen'); 
                loadData();
                // تأثير confetti احتفالي عند نجاح تسجيل الدخول
                if (typeof confetti !== 'undefined') {
                    confetti({
                        particleCount: 100,
                        spread: 70,
                        origin: { y: 0.6 },
                        colors: ['#a78bfa', '#60a5fa', '#34d399', '#fbbf24', '#f87171']
                    });
                    setTimeout(() => {
                        confetti({
                            particleCount: 50,
                            angle: 60,
                            spread: 55,
                            origin: { x: 0 },
                            colors: ['#8b5cf6', '#3b82f6', '#10b981']
                        });
                    }, 200);
                    setTimeout(() => {
                        confetti({
                            particleCount: 50,
                            angle: 120,
                            spread: 55,
                            origin: { x: 1 },
                            colors: ['#8b5cf6', '#3b82f6', '#10b981']
                        });
                    }, 400);
                }
            } else alert("Wrong Password");
        });
    });

    document.getElementById('clearDataMain').addEventListener('click', () => {
        const lang = document.getElementById('langSelector').value;
        if(confirm(i18n[lang].msgConfirmClear)) chrome.storage.local.set({ historyData: [] }, loadData);
    });

    document.getElementById('toggleTracking').addEventListener('click', () => {
        chrome.storage.local.get(['isTracking'], (res) => chrome.storage.local.set({ isTracking: !res.isTracking }, loadData));
    });

    document.getElementById('tabList').addEventListener('click', () => {
        document.getElementById('listSection').style.display = 'block';
        document.getElementById('chartSection').style.display = 'none';
        document.getElementById('tabList').classList.add('active-tab');
        document.getElementById('tabChart').classList.remove('active-tab');
    });

    document.getElementById('tabChart').addEventListener('click', () => {
        document.getElementById('listSection').style.display = 'none';
        document.getElementById('chartSection').style.display = 'flex';
        document.getElementById('tabChart').classList.add('active-tab');
        document.getElementById('tabList').classList.remove('active-tab');
        loadData();
    });

    document.getElementById('forgotBtn').addEventListener('click', () => showScreen('recoveryScreen'));
    document.getElementById('backBtn').addEventListener('click', () => showScreen('loginScreen'));
    document.getElementById('openSettings').addEventListener('click', () => {
        showScreen('settingsScreen');
        loadSmartLists();
    });
    document.getElementById('closeSettings').addEventListener('click', () => showScreen('mainScreen'));

    // التحكم في Accordion
    document.getElementById('passwordAccordion').addEventListener('click', () => {
        const content = document.getElementById('passwordContent');
        const arrow = document.querySelector('#passwordAccordion .accordion-arrow');
        
        content.classList.toggle('open');
        arrow.classList.toggle('open');
    });

    document.getElementById('smartListsAccordion').addEventListener('click', () => {
        const content = document.getElementById('smartListsContent');
        const arrow = document.querySelector('#smartListsAccordion .accordion-arrow');
        
        content.classList.toggle('open');
        arrow.classList.toggle('open');
    });

    document.getElementById('incognitoAccordion').addEventListener('click', () => {
        const content = document.getElementById('incognitoContent');
        const arrow = document.querySelector('#incognitoAccordion .accordion-arrow');
        
        content.classList.toggle('open');
        arrow.classList.toggle('open');
    });

    // إدارة القوائم الذكية
    let currentListMode = 'blacklist'; // blacklist or whitelist

    function loadSmartLists() {
        chrome.storage.local.get(['smartListsEnabled', 'listMode', 'blacklist', 'whitelist', 'incognitoEnabled'], (res) => {
            const enabled = res.smartListsEnabled || false;
            currentListMode = res.listMode || 'blacklist';
            const incognitoEnabled = res.incognitoEnabled || false;
            
            document.getElementById('toggleSmartLists').checked = enabled;
            document.getElementById('toggleIncognito').checked = incognitoEnabled;
            
            if (currentListMode === 'blacklist') {
                document.getElementById('modeBlacklist').classList.add('active-tab');
                document.getElementById('modeWhitelist').classList.remove('active-tab');
            } else {
                document.getElementById('modeWhitelist').classList.add('active-tab');
                document.getElementById('modeBlacklist').classList.remove('active-tab');
            }
            
            renderSitesList();
        });
    }

    function renderSitesList() {
        chrome.storage.local.get(['blacklist', 'whitelist', 'userLang'], (res) => {
            const list = currentListMode === 'blacklist' ? (res.blacklist || []) : (res.whitelist || []);
            const lang = res.userLang || 'en';
            const dict = i18n[lang] || i18n.en;
            const listDiv = document.getElementById('sitesList');
            
            if (list.length === 0) {
                listDiv.innerHTML = `<div style="text-align: center; color: var(--text-muted); font-size: 0.75rem; padding: 10px;">${dict.noSites}</div>`;
                return;
            }
            
            listDiv.innerHTML = '';
            list.forEach(site => {
                const item = document.createElement('div');
                item.className = 'site-item';
                item.innerHTML = `
                    <span>${site}</span>
                    <button onclick="removeSite('${site}')">🗑️</button>
                `;
                listDiv.appendChild(item);
            });
        });
    }

    window.removeSite = function(site) {
        const storageKey = currentListMode === 'blacklist' ? 'blacklist' : 'whitelist';
        chrome.storage.local.get([storageKey], (res) => {
            let list = res[storageKey] || [];
            list = list.filter(s => s !== site);
            chrome.storage.local.set({ [storageKey]: list }, renderSitesList);
        });
    };

    document.getElementById('toggleSmartLists').addEventListener('change', (e) => {
        chrome.storage.local.set({ smartListsEnabled: e.target.checked });
    });

    document.getElementById('modeBlacklist').addEventListener('click', () => {
        currentListMode = 'blacklist';
        chrome.storage.local.set({ listMode: 'blacklist' });
        document.getElementById('modeBlacklist').classList.add('active-tab');
        document.getElementById('modeWhitelist').classList.remove('active-tab');
        renderSitesList();
    });

    document.getElementById('modeWhitelist').addEventListener('click', () => {
        currentListMode = 'whitelist';
        chrome.storage.local.set({ listMode: 'whitelist' });
        document.getElementById('modeWhitelist').classList.add('active-tab');
        document.getElementById('modeBlacklist').classList.remove('active-tab');
        renderSitesList();
    });

    document.getElementById('addSiteBtn').addEventListener('click', () => {
        const input = document.getElementById('addSiteInput');
        const site = input.value.trim().toLowerCase();
        
        if (!site) return;
        
        // تنظيف الرابط وإزالة البروتوكول والمسارات
        const cleanSite = site.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
        
        const storageKey = currentListMode === 'blacklist' ? 'blacklist' : 'whitelist';
        chrome.storage.local.get([storageKey], (res) => {
            let list = res[storageKey] || [];
            if (!list.includes(cleanSite)) {
                list.push(cleanSite);
                chrome.storage.local.set({ [storageKey]: list }, () => {
                    input.value = '';
                    renderSitesList();
                });
            } else {
                input.value = '';
            }
        });
    });

    document.getElementById('clearAllSites').addEventListener('click', () => {
        chrome.storage.local.get(['userLang'], (res) => {
            const lang = res.userLang || 'en';
            const dict = i18n[lang] || i18n.en;
            
            if (confirm(dict.msgClearAllConfirm)) {
                const storageKey = currentListMode === 'blacklist' ? 'blacklist' : 'whitelist';
                chrome.storage.local.set({ [storageKey]: [] }, renderSitesList);
            }
        });
    });

    document.getElementById('toggleIncognito').addEventListener('change', (e) => {
        chrome.storage.local.set({ incognitoEnabled: e.target.checked }, loadData);
    });

    document.getElementById('openSettings').addEventListener('click', () => {
        showScreen('settingsScreen');
        loadSmartLists();
    });

    document.getElementById('verifyRecovery').addEventListener('click', () => {
        const r = document.getElementById('recoveryInput').value;
        chrome.storage.local.get(['recoveryKey'], (res) => {
            if (r === res.recoveryKey) showScreen('setupScreen'); else alert("Error Key");
        });
    });

    document.getElementById('updatePassBtn').addEventListener('click', async () => {
        const r = document.getElementById('settingRecovery').value, p = document.getElementById('settingNewPass').value;
        const hashedPass = await hashPassword(p);
        chrome.storage.local.get(['recoveryKey'], (res) => {
            if (r === res.recoveryKey) chrome.storage.local.set({ vaultPass: hashedPass }, () => showScreen('mainScreen'));
        });
    });

    // 7. التشغيل المبدئي
    chrome.storage.local.get(['vaultPass', 'userLang'], (res) => {
        const lang = res.userLang || 'en';
        document.getElementById('langSelector').value = lang;
        applyLanguage(lang);
        if (!res.vaultPass) {
            showScreen('setupScreen');
        } else {
            showScreen('loginScreen');
        }
    });
});