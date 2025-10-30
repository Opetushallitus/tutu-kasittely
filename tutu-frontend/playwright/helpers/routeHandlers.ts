import { Page, Route } from '@playwright/test';

/**
 * Creates a route handler for hakemus endpoints that:
 * - Returns provided hakemus data for GET requests
 * - Echoes back the request body for PUT requests
 *
 * @param hakemus - The hakemus object to return for GET requests
 */
export const createHakemusRouteHandler =
  (hakemus: unknown) => async (route: Route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(hakemus),
      });
      return;
    }

    if (route.request().method() === 'PUT') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(route.request().postDataJSON()),
      });
      return;
    }

    await route.continue();
  };

/**
 * Creates a route handler for perustelu endpoints that:
 * - Returns mock perustelu data for GET requests
 * - Echoes back the request body for PUT requests
 *
 * @param mockData - Optional mock data to return for GET requests
 */
export const createPerusteluRouteHandler =
  (mockData?: unknown) => async (route: Route) => {
    if (route.request().method() === 'PUT') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(route.request().postDataJSON()),
      });
      return;
    }

    // GET request - return mock data or default
    const defaultMock = {
      id: 'mock-perustelu-id',
      hakemusId: 'mock-hakemus-id',
      lahdeLahtomaanKansallinenLahde: false,
      lahdeLahtomaanVirallinenVastaus: false,
      lahdeKansainvalinenHakuteosTaiVerkkosivusto: false,
      selvitysTutkinnonMyontajastaJaTutkinnonVirallisuudesta: '',
      selvitysTutkinnonAsemastaLahtomaanJarjestelmassa: '',
      luotu: '2025-09-02T16:08:42.083643',
      luoja: 'Hakemuspalvelu',
      uoRoSisalto: {},
    };

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockData || defaultMock),
    });
  };

/**
 * Sets up standard hakemus route handler
 *
 * @param page - Playwright page object
 * @param hakemus - The hakemus object to use for mocking
 */
export const setupHakemusRoute = async (page: Page, hakemus: unknown) => {
  await page.route(
    '**/tutu-backend/api/hakemus/*',
    createHakemusRouteHandler(hakemus),
  );
};

/**
 * Sets up standard perustelu route handler
 *
 * @param page - Playwright page object
 * @param mockData - Optional mock data for GET requests
 */
export const setupPerusteluRoute = async (page: Page, mockData?: unknown) => {
  await page.route(
    '**/tutu-backend/api/perustelu/*',
    createPerusteluRouteHandler(mockData),
  );
};
