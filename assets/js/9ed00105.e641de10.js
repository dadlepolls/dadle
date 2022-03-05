"use strict";(self.webpackChunkdadlex=self.webpackChunkdadlex||[]).push([[4],{3905:function(e,n,t){t.d(n,{Zo:function(){return u},kt:function(){return _}});var i=t(7294);function a(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function r(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);n&&(i=i.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,i)}return t}function o(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?r(Object(t),!0).forEach((function(n){a(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):r(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function l(e,n){if(null==e)return{};var t,i,a=function(e,n){if(null==e)return{};var t,i,a={},r=Object.keys(e);for(i=0;i<r.length;i++)t=r[i],n.indexOf(t)>=0||(a[t]=e[t]);return a}(e,n);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(i=0;i<r.length;i++)t=r[i],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(a[t]=e[t])}return a}var c=i.createContext({}),d=function(e){var n=i.useContext(c),t=n;return e&&(t="function"==typeof e?e(n):o(o({},n),e)),t},u=function(e){var n=d(e.components);return i.createElement(c.Provider,{value:n},e.children)},p={inlineCode:"code",wrapper:function(e){var n=e.children;return i.createElement(i.Fragment,{},n)}},s=i.forwardRef((function(e,n){var t=e.components,a=e.mdxType,r=e.originalType,c=e.parentName,u=l(e,["components","mdxType","originalType","parentName"]),s=d(t),_=a,f=s["".concat(c,".").concat(_)]||s[_]||p[_]||r;return t?i.createElement(f,o(o({ref:n},u),{},{components:t})):i.createElement(f,o({ref:n},u))}));function _(e,n){var t=arguments,a=n&&n.mdxType;if("string"==typeof e||a){var r=t.length,o=new Array(r);o[0]=s;var l={};for(var c in n)hasOwnProperty.call(n,c)&&(l[c]=n[c]);l.originalType=e,l.mdxType="string"==typeof e?e:a,o[1]=l;for(var d=2;d<r;d++)o[d]=t[d];return i.createElement.apply(null,o)}return i.createElement.apply(null,t)}s.displayName="MDXCreateElement"},9733:function(e,n,t){t.r(n),t.d(n,{assets:function(){return u},contentTitle:function(){return c},default:function(){return _},frontMatter:function(){return l},metadata:function(){return d},toc:function(){return p}});var i=t(3117),a=t(102),r=(t(7294),t(3905)),o=["components"],l={slug:"/configuration"},c="Configuration",d={unversionedId:"configuration",id:"configuration",title:"Configuration",description:"DadleX is configured by environment variables, either by setting them in the .env-File or by specifying them when running the frontend or backend service.",source:"@site/docs/configuration.md",sourceDirName:".",slug:"/configuration",permalink:"/configuration",editUrl:"https://github.com/exanion/dadlex/tree/dev/docs/docs/configuration.md",tags:[],version:"current",frontMatter:{slug:"/configuration"},sidebar:"defaultSidebar",previous:{title:"DadleX Documentation",permalink:"/"}},u={},p=[{value:"General config",id:"general-config",level:2},{value:"<code>PACKAGE_VERSION</code>",id:"package_version",level:3},{value:"<code>DADLEX_FRONTEND_PORT</code>",id:"dadlex_frontend_port",level:3},{value:"<code>DADLEX_BACKEND_PORT</code>",id:"dadlex_backend_port",level:3},{value:"<code>BACKEND_LOG_LEVEL</code>",id:"backend_log_level",level:3},{value:"<code>BACKEND_PUBLIC_URL</code>",id:"backend_public_url",level:3},{value:"<code>FRONTEND_PUBLIC_URL</code>",id:"frontend_public_url",level:3},{value:"Authentication settings",id:"authentication-settings",level:2},{value:"<code>AUTH_ISSUER_BASEURL</code>",id:"auth_issuer_baseurl",level:3},{value:"<code>AUTH_CLIENT_ID</code> and <code>AUTH_CLIENT_SECRET</code>",id:"auth_client_id-and-auth_client_secret",level:3},{value:"Calendar integration",id:"calendar-integration",level:2},{value:"Microsoft 365 Calendar",id:"microsoft-365-calendar",level:3},{value:"<code>CAL_MS_TENANT_ID</code>",id:"cal_ms_tenant_id",level:4},{value:"<code>CAL_MS_CLIENT_ID</code> and <code>CAL_MS_CLIENT_SECRET</code>",id:"cal_ms_client_id-and-cal_ms_client_secret",level:4},{value:"Google Calendar",id:"google-calendar",level:3},{value:"<code>CAL_GOOGLE_CLIENT_ID</code> and <code>CAL_GOOGLE_CLIENT_SECRET</code>",id:"cal_google_client_id-and-cal_google_client_secret",level:4}],s={toc:p};function _(e){var n=e.components,t=(0,a.Z)(e,o);return(0,r.kt)("wrapper",(0,i.Z)({},s,t,{components:n,mdxType:"MDXLayout"}),(0,r.kt)("h1",{id:"configuration"},"Configuration"),(0,r.kt)("p",null,"DadleX is configured by environment variables, either by setting them in the ",(0,r.kt)("inlineCode",{parentName:"p"},".env"),"-File or by specifying them when running the frontend or backend service."),(0,r.kt)("h2",{id:"general-config"},"General config"),(0,r.kt)("h3",{id:"package_version"},(0,r.kt)("inlineCode",{parentName:"h3"},"PACKAGE_VERSION")),(0,r.kt)("p",null,"Version of DadleX to be used. Default: ",(0,r.kt)("inlineCode",{parentName:"p"},"latest"),". Can be ",(0,r.kt)("inlineCode",{parentName:"p"},"latest")," for latest stable version, ",(0,r.kt)("inlineCode",{parentName:"p"},"dev")," for current development snapshot or any other tagged version."),(0,r.kt)("h3",{id:"dadlex_frontend_port"},(0,r.kt)("inlineCode",{parentName:"h3"},"DADLEX_FRONTEND_PORT")),(0,r.kt)("p",null,"Listening port of the frontend service. Default: ",(0,r.kt)("inlineCode",{parentName:"p"},"3000"),"."),(0,r.kt)("h3",{id:"dadlex_backend_port"},(0,r.kt)("inlineCode",{parentName:"h3"},"DADLEX_BACKEND_PORT")),(0,r.kt)("p",null,"Listening port of the backend service. Default: ",(0,r.kt)("inlineCode",{parentName:"p"},"3001"),"."),(0,r.kt)("h3",{id:"backend_log_level"},(0,r.kt)("inlineCode",{parentName:"h3"},"BACKEND_LOG_LEVEL")),(0,r.kt)("p",null,"Log level for the backend service, specifying verbosity. One of ",(0,r.kt)("inlineCode",{parentName:"p"},"error"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"warn"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"info"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"http"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"verbose"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"debug"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"silly")),(0,r.kt)("h3",{id:"backend_public_url"},(0,r.kt)("inlineCode",{parentName:"h3"},"BACKEND_PUBLIC_URL")),(0,r.kt)("p",null,"THe public URL that the backend is reachable at, without trailing slash. Example: ",(0,r.kt)("inlineCode",{parentName:"p"},"https://dadlex-backend-stable.example.com")," or ",(0,r.kt)("inlineCode",{parentName:"p"},"https://dadlex.example.com/backend")),(0,r.kt)("h3",{id:"frontend_public_url"},(0,r.kt)("inlineCode",{parentName:"h3"},"FRONTEND_PUBLIC_URL")),(0,r.kt)("p",null,"The public URL that the frontend service is reachable at, without trailing slash."),(0,r.kt)("h2",{id:"authentication-settings"},"Authentication settings"),(0,r.kt)("p",null,"Any OpenID provider (e.g. MS Azure, Google Sign-In, Keycloak etc.) can be used for allowing users to sign in to the instance."),(0,r.kt)("h3",{id:"auth_issuer_baseurl"},(0,r.kt)("inlineCode",{parentName:"h3"},"AUTH_ISSUER_BASEURL")),(0,r.kt)("p",null,"OpenID-Connect base URL of your OID provider"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},"Microsoft Azure: ",(0,r.kt)("inlineCode",{parentName:"li"},"https://login.microsoftonline.com/organizations/v2.0")),(0,r.kt)("li",{parentName:"ul"},"Google: ",(0,r.kt)("inlineCode",{parentName:"li"},"https://accounts.google.com"))),(0,r.kt)("h3",{id:"auth_client_id-and-auth_client_secret"},(0,r.kt)("inlineCode",{parentName:"h3"},"AUTH_CLIENT_ID")," and ",(0,r.kt)("inlineCode",{parentName:"h3"},"AUTH_CLIENT_SECRET")),(0,r.kt)("p",null,"Client ID and secret for app openid app registration"),(0,r.kt)("h2",{id:"calendar-integration"},"Calendar integration"),(0,r.kt)("p",null,"Currently, DadleX allows users to link their Microsoft 365 and Google calendars to show availability hints on date polls."),(0,r.kt)("p",null,"Therefore, you must register an app with Microsoft and/ or Google and configure it. See the chapters for setting up calendar integrations for further details and detailed explanations."),(0,r.kt)("h3",{id:"microsoft-365-calendar"},"Microsoft 365 Calendar"),(0,r.kt)("h4",{id:"cal_ms_tenant_id"},(0,r.kt)("inlineCode",{parentName:"h4"},"CAL_MS_TENANT_ID")),(0,r.kt)("p",null,"Azure tenant ID that the app registration was made with or ",(0,r.kt)("inlineCode",{parentName:"p"},"common")," in case you've configured your app as a multi-tenant application"),(0,r.kt)("h4",{id:"cal_ms_client_id-and-cal_ms_client_secret"},(0,r.kt)("inlineCode",{parentName:"h4"},"CAL_MS_CLIENT_ID")," and ",(0,r.kt)("inlineCode",{parentName:"h4"},"CAL_MS_CLIENT_SECRET")),(0,r.kt)("p",null,"Client ID and secret for the Azure app registration"),(0,r.kt)("h3",{id:"google-calendar"},"Google Calendar"),(0,r.kt)("h4",{id:"cal_google_client_id-and-cal_google_client_secret"},(0,r.kt)("inlineCode",{parentName:"h4"},"CAL_GOOGLE_CLIENT_ID")," and ",(0,r.kt)("inlineCode",{parentName:"h4"},"CAL_GOOGLE_CLIENT_SECRET")),(0,r.kt)("p",null,"Client ID and secret for the Google app registration."))}_.isMDXComponent=!0}}]);