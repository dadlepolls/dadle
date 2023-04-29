import 'i18next';

//see https://www.i18next.com/overview/typescript#argument-of-type-defaulttfuncreturn-is-not-assignable-to-parameter-of-type-xyz
//this is a workaround, can be removed once https://github.com/i18next/i18next/issues/1884 is fixed
declare module 'i18next' {
  interface CustomTypeOptions {
    returnNull: false;
  }
}