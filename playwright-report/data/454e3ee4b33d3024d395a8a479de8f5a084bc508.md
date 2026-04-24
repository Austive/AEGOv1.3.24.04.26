# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: pages.spec.ts >> Aego Additional Pages >> should load Partner With Us page
- Location: e2e-tests/pages.spec.ts:4:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: /Join the Aego Network/i })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('heading', { name: /Join the Aego Network/i })

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - navigation [ref=e4]:
    - generic [ref=e6]:
      - link "AEGO" [ref=e7] [cursor=pointer]:
        - /url: /
        - img [ref=e8]
        - generic [ref=e10]: AEGO
      - generic [ref=e11]:
        - link "Features" [ref=e12] [cursor=pointer]:
          - /url: /#features
        - link "Services" [ref=e13] [cursor=pointer]:
          - /url: /#services
        - link "Partner With Us" [ref=e14] [cursor=pointer]:
          - /url: /partner
        - button "Sign In" [ref=e15]:
          - img [ref=e16]
          - text: Sign In
  - generic [ref=e20]:
    - generic [ref=e21]:
      - img [ref=e22]
      - heading "Partner With Aego" [level=1] [ref=e24]
      - paragraph [ref=e25]: Join Durban's premier on-demand security network. Grow your business by connecting with clients who need immediate, reliable protection.
    - generic [ref=e27]:
      - img [ref=e28]
      - heading "Sign In to Apply" [level=2] [ref=e32]
      - paragraph [ref=e33]: You need an Aego account to register your security company.
      - button "Sign In with Google" [ref=e34]
  - contentinfo [ref=e35]:
    - generic [ref=e36]:
      - generic [ref=e37]:
        - generic [ref=e38]:
          - img [ref=e39]
          - generic [ref=e41]: AEGO
        - generic [ref=e42]:
          - link "Privacy Policy (POPIA)" [ref=e43] [cursor=pointer]:
            - /url: "#"
          - link "Terms of Service" [ref=e44] [cursor=pointer]:
            - /url: "#"
          - link "Provider Portal" [ref=e45] [cursor=pointer]:
            - /url: "#"
      - generic [ref=e46]: © 2026 Aego Security Solutions. Durban, South Africa. All rights reserved.
  - button [ref=e47]:
    - img [ref=e48]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Aego Additional Pages', () => {
  4  |   test('should load Partner With Us page', async ({ page }) => {
  5  |     await page.goto('/partner');
> 6  |     await expect(page.getByRole('heading', { name: /Join the Aego Network/i })).toBeVisible();
     |                                                                                 ^ Error: expect(locator).toBeVisible() failed
  7  |     await expect(page.getByPlaceholder('Company Name')).toBeVisible();
  8  |     await expect(page.getByRole('button', { name: 'Submit Application' })).toBeVisible();
  9  |   });
  10 | 
  11 |   test('should open booking form when clicking Request Security in hero', async ({ page }) => {
  12 |     await page.goto('/');
  13 |     
  14 |     // Find Request Security button in Hero section
  15 |     const bookingBtn = page.getByRole('button', { name: 'Book Now', exact: true }).first();
  16 |     await bookingBtn.click();
  17 |     
  18 |     await expect(page.getByText('Select Service Type')).toBeVisible();
  19 |   });
  20 | });
  21 | 
```