// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/dracula");

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Dadle Documenation",
  tagline: "Dadle Documentation",
  url: "https://dadlepolls.github.io",
  baseUrl: "/dadle/",
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",
  favicon: "img/favicon.ico",
  organizationName: "dadlepolls",
  deploymentBranch: "gh-pages",
  trailingSlash: false,
  projectName: "dadle",
  plugins: [],
  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
          editUrl: "https://github.com/dadlepolls/dadle/tree/dev/docs/",
          routeBasePath: "/",
        },
        blog: false,
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: "Dadle Documentation",
        /*logo: {
          alt: "Dadle Logo",
          src: "img/logo.svg",
        },*/
        items: [
          {
            type: "doc",
            docId: "configuration",
            position: "left",
            label: "Documentation",
          },
          {
            href: "https://github.com/dadlepolls/dadle",
            label: "GitHub",
            position: "right",
          },
        ],
      },
      footer: {
        style: "dark",
        links: [
          {
            title: "Docs",
            items: [
              {
                label: "Dadle Documentation",
                to: "/",
              },
            ],
          },

          {
            title: "More",
            items: [
              {
                label: "GitHub",
                href: "https://github.com/dadlepolls/dadle",
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Exanion UG (haftungsbeschränkt). Built with Docusaurus.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
