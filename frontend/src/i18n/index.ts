import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { en, fa } from "./locales";

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources: { en, fa },
    lng: "en",
    fallbackLng: "en",

    interpolation: {
      escapeValue: false,
    },
  });
