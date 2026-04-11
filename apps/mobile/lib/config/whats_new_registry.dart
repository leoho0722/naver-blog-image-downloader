import '../data/models/whats_new_item.dart';

/// 首次安裝時的操作引導（本地 fallback，繁體中文）。
const onboardingEntry = WhatsNewEntry(
  items: [
    WhatsNewTextItem(
      icon: 'content_paste',
      title: '貼上 Blog 網址',
      description: '複製 Naver Blog 網址並貼上（從 Naver Blog 小飛機分享按鈕取得）',
    ),
    WhatsNewTextItem(
      icon: 'photo_library',
      title: '取得所有照片',
      description: '點擊按鈕進行下載',
    ),
    WhatsNewTextItem(
      icon: 'download',
      title: '下載儲存',
      description: '選擇單張/全部照片儲存至手機相簿內',
    ),
    WhatsNewTextItem(icon: 'swipe', title: '照片瀏覽', description: '滑動照片，沈浸式瀏覽'),
  ],
);

/// 各版本的新功能列表（本地 fallback，繁體中文）。
///
/// 每次發版時只需在此 Map 新增一筆 entry，
/// 對應的文字內容由後端 API 提供，此處為離線 fallback。
const whatsNewRegistry = <String, WhatsNewEntry>{
  '1.4.2': WhatsNewEntry(
    items: [
      WhatsNewTextItem(
        icon: 'auto_awesome',
        title: '新功能介紹頁',
        description: '更新版本後自動顯示新功能介紹，首次安裝顯示操作引導。',
      ),
    ],
  ),
};
