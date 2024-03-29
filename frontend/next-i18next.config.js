const path = require("path");

/** @type {import("next-i18next").UserConfig} */
module.exports = {
  i18n: {
    defaultLocale: "en",
    locales: ["en", "de"],
    localePath: path.resolve('./public/locales'),
    returnNull: false,  //this is a workaround, remove when https://github.com/i18next/i18next/issues/1884 is closed
  },
};
