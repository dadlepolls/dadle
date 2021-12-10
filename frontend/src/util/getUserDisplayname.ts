import { GetPollsOverview_getPolls_author } from "@operations/queries/__generated__/GetPollsOverview";

const getUserDisplayname = (userOrAnon?: GetPollsOverview_getPolls_author) => {
  if (!userOrAnon) return undefined;
  if (userOrAnon.user) return userOrAnon.user.name;
  if (
    typeof userOrAnon.anonName !== "undefined" &&
    userOrAnon.anonName !== null
  )
    return userOrAnon.anonName;
  return "Unbekannt";
};

export { getUserDisplayname };
