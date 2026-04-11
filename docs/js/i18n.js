/**
 * i18n — 多語系翻譯模組
 * 支援語言：zh-Hant（正體中文）、en（English）、ko（한국어）
 */

const translations = {
  'zh-Hant': {
    // Nav
    'nav.features': '功能特色',
    'nav.howItWorks': '使用方式',
    'nav.screenshots': '畫面預覽',
    'nav.download': '下載',

    // Hero
    'hero.title': 'Naver Blog 照片下載器',
    'hero.tagline': '輸入網址，一鍵下載所有照片',
    'hero.cta': '立即下載',
    'hero.learnMore': '了解更多',

    // Features
    'features.title': '功能特色',
    'features.subtitle': '簡單、快速、智慧的照片下載體驗',
    'features.batch.title': '批次下載',
    'features.batch.desc': '自動擷取 Naver Blog 文章中所有照片，一鍵批次下載至裝置',
    'features.gallery.title': '直存相簿',
    'features.gallery.desc': '下載完成的照片可直接儲存至裝置相簿，隨時瀏覽與分享',
    'features.cache.title': '智慧快取',
    'features.cache.desc': '已下載的照片自動快取於本機，重複開啟時秒速載入',
    'features.async.title': '非同步處理',
    'features.async.desc': '雲端非同步擷取照片，即使大量照片也不會逾時中斷',

    // How it works
    'howItWorks.title': '使用方式',
    'howItWorks.subtitle': '只需四個步驟，輕鬆下載所有照片',
    'howItWorks.step1.title': '貼上網址',
    'howItWorks.step1.desc': '複製 Naver Blog 文章網址並貼入 App',
    'howItWorks.step2.title': '取得列表',
    'howItWorks.step2.desc': '點選按鈕，自動擷取文章中的照片清單',
    'howItWorks.step3.title': '等待擷取',
    'howItWorks.step3.desc': '雲端非同步處理，即時顯示進度狀態',
    'howItWorks.step4.title': '儲存相簿',
    'howItWorks.step4.desc': '選擇照片並一鍵儲存至裝置相簿',

    // Screenshots
    'screenshots.title': '畫面預覽',
    'screenshots.subtitle': '簡潔直覺的 Material Design 介面',
    'screenshots.tab.ios': 'iOS',
    'screenshots.tab.android': 'Android',
    'screenshots.input.title': '網址輸入',
    'screenshots.input.desc': '貼上 Blog 網址',
    'screenshots.gallery.title': '照片列表',
    'screenshots.gallery.desc': '瀏覽所有照片',
    'screenshots.detail.title': '照片詳情',
    'screenshots.detail.desc': '檢視與儲存',
    'screenshots.settings.title': '設定',
    'screenshots.settings.desc': '自訂偏好設定',

    // Download
    'download.title': '立即下載',
    'download.subtitle': '支援 iOS 與 Android 雙平台',
    'download.comingSoon': '即將上架',
    'download.appStore': 'App Store',
    'download.googlePlay': 'Google Play',
    'download.reqIos': 'iOS 17.0 以上',
    'download.reqAndroid': 'Android 14.0 以上',

    // Footer
    'footer.copyright': '© 2026 Naver Blog 照片下載器',
    'footer.github': 'GitHub',
    'footer.builtWith': '以 Flutter 建構',
  },

  en: {
    // Nav
    'nav.features': 'Features',
    'nav.howItWorks': 'How It Works',
    'nav.screenshots': 'Screenshots',
    'nav.download': 'Download',

    // Hero
    'hero.title': 'Naver Blog Photo Downloader',
    'hero.tagline': 'Enter a URL, download all photos in one click',
    'hero.cta': 'Download Now',
    'hero.learnMore': 'Learn More',

    // Features
    'features.title': 'Features',
    'features.subtitle': 'Simple, fast, and smart photo downloading',
    'features.batch.title': 'Batch Download',
    'features.batch.desc': 'Automatically extract all photos from Naver Blog posts and download them in batch',
    'features.gallery.title': 'Save to Gallery',
    'features.gallery.desc': 'Downloaded photos can be saved directly to your device gallery for easy browsing and sharing',
    'features.cache.title': 'Smart Cache',
    'features.cache.desc': 'Downloaded photos are cached locally for instant loading on subsequent visits',
    'features.async.title': 'Async Processing',
    'features.async.desc': 'Cloud-based async extraction handles large photo sets without timeouts',

    // How it works
    'howItWorks.title': 'How It Works',
    'howItWorks.subtitle': 'Download all photos in just four simple steps',
    'howItWorks.step1.title': 'Paste URL',
    'howItWorks.step1.desc': 'Copy a Naver Blog post URL and paste it into the app',
    'howItWorks.step2.title': 'Get Photo List',
    'howItWorks.step2.desc': 'Tap the button to automatically extract the photo list',
    'howItWorks.step3.title': 'Wait for Extraction',
    'howItWorks.step3.desc': 'Cloud-based async processing with real-time status updates',
    'howItWorks.step4.title': 'Save to Gallery',
    'howItWorks.step4.desc': 'Select photos and save them to your device gallery in one tap',

    // Screenshots
    'screenshots.title': 'Screenshots',
    'screenshots.subtitle': 'Clean and intuitive Material Design interface',
    'screenshots.tab.ios': 'iOS',
    'screenshots.tab.android': 'Android',
    'screenshots.input.title': 'URL Input',
    'screenshots.input.desc': 'Paste blog URL',
    'screenshots.gallery.title': 'Photo Gallery',
    'screenshots.gallery.desc': 'Browse all photos',
    'screenshots.detail.title': 'Photo Detail',
    'screenshots.detail.desc': 'View & save',
    'screenshots.settings.title': 'Settings',
    'screenshots.settings.desc': 'Customize preferences',

    // Download
    'download.title': 'Download Now',
    'download.subtitle': 'Available on iOS and Android',
    'download.comingSoon': 'Coming Soon',
    'download.appStore': 'App Store',
    'download.googlePlay': 'Google Play',
    'download.reqIos': 'iOS 17.0 or later',
    'download.reqAndroid': 'Android 14.0 or later',

    // Footer
    'footer.copyright': '© 2026 Naver Blog Photo Downloader',
    'footer.github': 'GitHub',
    'footer.builtWith': 'Built with Flutter',
  },

  ko: {
    // Nav
    'nav.features': '기능',
    'nav.howItWorks': '사용 방법',
    'nav.screenshots': '스크린샷',
    'nav.download': '다운로드',

    // Hero
    'hero.title': 'Naver Blog 사진 다운로더',
    'hero.tagline': 'URL을 입력하고, 모든 사진을 한 번에 다운로드',
    'hero.cta': '지금 다운로드',
    'hero.learnMore': '자세히 보기',

    // Features
    'features.title': '기능',
    'features.subtitle': '간단하고, 빠르고, 스마트한 사진 다운로드',
    'features.batch.title': '일괄 다운로드',
    'features.batch.desc': 'Naver Blog 게시글의 모든 사진을 자동으로 추출하여 일괄 다운로드',
    'features.gallery.title': '갤러리 저장',
    'features.gallery.desc': '다운로드한 사진을 기기 갤러리에 직접 저장하여 쉽게 탐색 및 공유',
    'features.cache.title': '스마트 캐시',
    'features.cache.desc': '다운로드한 사진이 로컬에 캐시되어 다음 접속 시 즉시 로딩',
    'features.async.title': '비동기 처리',
    'features.async.desc': '클라우드 기반 비동기 추출로 대량 사진도 타임아웃 없이 처리',

    // How it works
    'howItWorks.title': '사용 방법',
    'howItWorks.subtitle': '네 단계로 모든 사진을 쉽게 다운로드',
    'howItWorks.step1.title': 'URL 붙여넣기',
    'howItWorks.step1.desc': 'Naver Blog 게시글 URL을 복사하여 앱에 붙여넣기',
    'howItWorks.step2.title': '사진 목록 가져오기',
    'howItWorks.step2.desc': '버튼을 눌러 사진 목록을 자동으로 추출',
    'howItWorks.step3.title': '추출 대기',
    'howItWorks.step3.desc': '클라우드 비동기 처리, 실시간 상태 업데이트',
    'howItWorks.step4.title': '갤러리 저장',
    'howItWorks.step4.desc': '사진을 선택하고 한 번의 탭으로 기기 갤러리에 저장',

    // Screenshots
    'screenshots.title': '스크린샷',
    'screenshots.subtitle': '깔끔하고 직관적인 Material Design 인터페이스',
    'screenshots.tab.ios': 'iOS',
    'screenshots.tab.android': 'Android',
    'screenshots.input.title': 'URL 입력',
    'screenshots.input.desc': '블로그 URL 붙여넣기',
    'screenshots.gallery.title': '사진 갤러리',
    'screenshots.gallery.desc': '모든 사진 탐색',
    'screenshots.detail.title': '사진 상세',
    'screenshots.detail.desc': '보기 및 저장',
    'screenshots.settings.title': '설정',
    'screenshots.settings.desc': '환경설정 사용자 지정',

    // Download
    'download.title': '지금 다운로드',
    'download.subtitle': 'iOS와 Android 모두 지원',
    'download.comingSoon': '출시 예정',
    'download.appStore': 'App Store',
    'download.googlePlay': 'Google Play',
    'download.reqIos': 'iOS 17.0 이상',
    'download.reqAndroid': 'Android 14.0 이상',

    // Footer
    'footer.copyright': '© 2026 Naver Blog 사진 다운로더',
    'footer.github': 'GitHub',
    'footer.builtWith': 'Flutter로 제작',
  },
};

/**
 * 取得使用者偏好語言
 * 優先順序：localStorage > navigator.language > 預設 zh-Hant
 */
function getPreferredLanguage() {
  const stored = localStorage.getItem('lang');
  if (stored && translations[stored]) return stored;

  const browserLang = navigator.language || navigator.userLanguage || '';
  if (browserLang.startsWith('ko')) return 'ko';
  if (browserLang.startsWith('en')) return 'en';
  if (browserLang.startsWith('zh')) return 'zh-Hant';

  return 'zh-Hant';
}

/**
 * 套用翻譯至所有含 data-i18n 屬性的元素
 */
function applyTranslations(lang) {
  const t = translations[lang];
  if (!t) return;

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (t[key]) {
      el.textContent = t[key];
    }
  });

  // 更新 <html lang> 屬性
  const langMap = { 'zh-Hant': 'zh-Hant', en: 'en', ko: 'ko' };
  document.documentElement.lang = langMap[lang] || 'zh-Hant';

  // 更新 <title>
  if (t['hero.title']) {
    document.title = t['hero.title'];
  }

  // 更新 meta description
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc && t['hero.tagline']) {
    metaDesc.setAttribute('content', t['hero.tagline']);
  }

  // 更新語言選單的 active 狀態
  document.querySelectorAll('.lang-menu__item').forEach((item) => {
    item.classList.toggle('active', item.getAttribute('data-lang') === lang);
  });

  localStorage.setItem('lang', lang);
}

/**
 * 切換語言
 */
function switchLanguage(lang) {
  if (!translations[lang]) return;
  applyTranslations(lang);
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  const preferredLang = getPreferredLanguage();
  applyTranslations(preferredLang);
});
