// متغير لتتبع التبويب النشط حالياً
let activeTabData = {
  tabId: null,
  url: null,
  startTime: null // سيخزن بصيغة Timestamp رقمي
};

// دالة للتحقق من الحظر/السماح
async function checkSiteAccess(url) {
  try {
    const domain = new URL(url).hostname.replace(/^www\./, '');
    const res = await chrome.storage.local.get(['smartListsEnabled', 'listMode', 'blacklist', 'whitelist', 'userLang']);
    
    if (!res.smartListsEnabled) return { allowed: true };
    
    const blacklist = res.blacklist || [];
    const whitelist = res.whitelist || [];
    const mode = res.listMode || 'blacklist';
    const lang = res.userLang || 'ar';
    
    if (mode === 'blacklist') {
      // وضع القائمة السوداء: منع المواقع المحظورة فقط
      const isBlocked = blacklist.some(site => domain.includes(site) || site.includes(domain));
      if (isBlocked) {
        return { allowed: false, reason: 'blacklist', lang };
      }
    } else {
      // وضع القائمة البيضاء: السماح فقط للمواقع المحددة
      const isAllowed = whitelist.some(site => domain.includes(site) || site.includes(domain));
      if (!isAllowed) {
        return { allowed: false, reason: 'whitelist', lang };
      }
    }
    
    return { allowed: true };
  } catch (e) {
    return { allowed: true };
  }
}

// دالة نهائية لحساب مدة البقاء وتحديث السجل
async function finalizeDuration() {
  if (activeTabData.tabId && activeTabData.startTime && activeTabData.url) {
    const endTime = Date.now();
    const durationSeconds = Math.round((endTime - activeTabData.startTime) / 1000);

    if (durationSeconds > 0) {
      const res = await chrome.storage.local.get(['historyData']);
      let history = res.historyData || [];

      // نحدث السجل الأحدث إذا كان يطابق نفس الرابط
      if (history.length > 0 && history[0].fullUrl === activeTabData.url) {
        history[0].durationSeconds = (history[0].durationSeconds || 0) + durationSeconds;
        await chrome.storage.local.set({ historyData: history });
      }
    }
  }
}

// الاستماع عند تحديث الرابط (زيارة موقع جديد)
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.url && changeInfo.url.startsWith('http')) {
    // التحقق من الحظر أولاً
    const access = await checkSiteAccess(changeInfo.url);
    if (!access.allowed) {
      const blockedUrl = `blocked.html?url=${encodeURIComponent(changeInfo.url)}&reason=${access.reason}&lang=${access.lang}`;
      chrome.tabs.update(tabId, { url: chrome.runtime.getURL(blockedUrl) });
      return;
    }

    await finalizeDuration(); // إنهاء حساب مدة الموقع السابق

    const res = await chrome.storage.local.get(['isTracking', 'historyData']);
    if (res.isTracking !== false) {
      const domain = new URL(changeInfo.url).hostname;
      let history = res.historyData || [];

      // تسجيل كل زيارة للموقع (حتى لو متكررة)
      const currentTime = Date.now();
      history.unshift({
        fullUrl: changeInfo.url,
        domain: domain,
        icon: `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
        startTime: currentTime,
        durationSeconds: 0
      });
      await chrome.storage.local.set({ historyData: history.slice(0, 2000) });
      
      // تحديث بيانات التبويب النشط للعداد
      activeTabData = { tabId: tabId, url: changeInfo.url, startTime: currentTime };
    }
  }
});

// الاستماع عند تبديل التبويبات
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  await finalizeDuration();
  chrome.tabs.get(activeInfo.tabId, async (tab) => {
    if (tab && tab.url && tab.url.startsWith('http')) {
      // التحقق من الحظر
      const access = await checkSiteAccess(tab.url);
      if (!access.allowed) {
        const blockedUrl = `blocked.html?url=${encodeURIComponent(tab.url)}&reason=${access.reason}&lang=${access.lang}`;
        chrome.tabs.update(activeInfo.tabId, { url: chrome.runtime.getURL(blockedUrl) });
        return;
      }
      activeTabData = { tabId: activeInfo.tabId, url: tab.url, startTime: Date.now() };
    }
  });
});

// الاستماع عند إغلاق التبويب
chrome.tabs.onRemoved.addListener(async (tabId) => {
  if (activeTabData.tabId === tabId) {
    await finalizeDuration();
    activeTabData = { tabId: null, url: null, startTime: null };
  }
});