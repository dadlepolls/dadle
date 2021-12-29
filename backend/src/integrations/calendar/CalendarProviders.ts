import { Router } from "express";

class CalendarProviders {
  private static router: Router | undefined;
  private static routerNames: Map<string, string> = new Map();

  private constructor() {}

  public static getProviderRouter() {
    if (!this.router) this.router = Router();
    return this.router;
  }

  public static registerProviderRouter(
    providerName: string,
    friendlyName: string,
    router: Router
  ) {
    if (this.routerNames.has(providerName))
      throw new Error(
        `Provider ${providerName} has already been registered before`
      );
    this.routerNames.set(providerName, friendlyName);

    this.getProviderRouter().use(`/${providerName}`, router);
  }

  public static getAvailableProviders(): Record<string, string> {
    return Array.from(this.routerNames).reduce(
      (obj, [key, value]) => Object.assign(obj, { [key]: value }),
      {}
    );
  }
}

export { CalendarProviders };
