# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: marketing.spec.ts >> Aego Marketing Website >> should navigate to Partner With Us page
- Location: e2e-tests/marketing.spec.ts:16:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Join the Aego Network')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText('Join the Aego Network')

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
  3  | test.describe('Aego Marketing Website', () => {
  4  |   test('should load the homepage and display hero content', async ({ page }) => {
  5  |     await page.goto('/');
  6  |     
  7  |     // Check if hero title is present
  8  |     await expect(page.getByText('AEGO', { exact: true })).toBeVisible();
  9  |     await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
  10 |     
  11 |     // Check marketing sections
  12 |     await expect(page.getByText('Features')).toBeVisible();
  13 |     await expect(page.getByText('Services')).toBeVisible();
  14 |   });
  15 | 
  16 |   test('should navigate to Partner With Us page', async ({ page }) => {
  17 |     await page.goto('/');
  18 |     
  19 |     // Click on partner with us link
  20 |     await page.getByRole('link', { name: 'Partner With Us' }).click();
  21 |     
  22 |     await expect(page).toHaveURL(/.*\/partner/);
> 23 |     await expect(page.getByText('Join the Aego Network', { exact: false })).toBeVisible();
     |                                                                             ^ Error: expect(locator).toBeVisible() failed
  24 |   });
  25 | 
  26 |   test('should have a contact form on the homepage', async ({ page }) => {
  27 |     await page.goto('/');
  28 |     
  29 |     // Check for the new contact section we will add
  30 |     await expect(page.getByRole('heading', { name: 'Contact Us' })).toBeVisible();
  31 |   });
  32 | });
  33 | 
```