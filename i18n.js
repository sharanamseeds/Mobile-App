import * as Localization from "expo-localization";
import {I18n} from "i18n-js";

// Import translations
import en from "./localization/en.json";
import hi from "./localization/hi.json";
import gu from "./localization/gu.json";

// Set the translations
const i18n = new I18n({
  en,
  hi,
  gu,
});

// Set the locale once at the beginning of your app.
i18n.locale = 'en';

// If the current locale is not supported, fallback to English
i18n.fallbacks = true;
i18n.defaultLocale = 'en';

export default i18n;
