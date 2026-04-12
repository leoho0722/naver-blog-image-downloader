import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./messages/en.json";
import ja from "./messages/ja.json";
import ko from "./messages/ko.json";
import zhTW from "./messages/zh-TW.json";

const stored = localStorage.getItem("locale");
const fallbackLng = "zh-TW";

i18n.use(initReactI18next).init({
  resources: {
    "zh-TW": { translation: zhTW },
    en: { translation: en },
    ja: { translation: ja },
    ko: { translation: ko },
  },
  lng: stored ?? fallbackLng,
  fallbackLng,
  interpolation: { escapeValue: false },
});

export default i18n;
