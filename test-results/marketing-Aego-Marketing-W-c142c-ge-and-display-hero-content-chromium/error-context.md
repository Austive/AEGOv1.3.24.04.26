# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: marketing.spec.ts >> Aego Marketing Website >> should load the homepage and display hero content
- Location: e2e-tests/marketing.spec.ts:4:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Services')
Expected: visible
Error: strict mode violation: getByText('Services') resolved to 2 elements:
    1) <a href="/#services" data-discover="true" class="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Services</a> aka getByRole('link', { name: 'Services', exact: true })
    2) <a href="#services" class="inline-flex items-center justify-center px-8 py-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white font-medium rounded-full transition-all">View Services</a> aka getByRole('link', { name: 'View Services' })

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText('Services')

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
  - main [ref=e19]:
    - generic [ref=e20]:
      - img "Security Professional" [ref=e23]
      - generic [ref=e26]:
        - generic [ref=e27]:
          - img [ref=e28]
          - generic [ref=e31]: Durban's Premier Security E-Hailing
        - heading "On-Demand Protection." [level=1] [ref=e32]:
          - text: On-Demand
          - text: Protection.
        - paragraph [ref=e33]: Connect instantly with vetted security professionals for close protection, events, and asset security. No long-term contracts. Just reliable safety when you need it.
        - generic [ref=e34]:
          - button "Request Security Now" [ref=e35]:
            - text: Request Security Now
            - img [ref=e36]
          - link "View Services" [ref=e38] [cursor=pointer]:
            - /url: "#services"
    - generic [ref=e40]:
      - generic [ref=e41]:
        - heading "Uncompromising Standards" [level=2] [ref=e42]
        - paragraph [ref=e43]: Built on a foundation of technology, privacy, and rapid response to meet the demands of Durban's dynamic environment.
      - generic [ref=e44]:
        - generic [ref=e45]:
          - img [ref=e47]
          - heading "Precision Geofencing" [level=3] [ref=e50]
          - paragraph [ref=e51]: Advanced location tracking ensures security personnel are dispatched to your exact coordinates instantly.
        - generic [ref=e52]:
          - img [ref=e54]
          - heading "Strict Privacy" [level=3] [ref=e57]
          - paragraph [ref=e58]: POPIA compliant data handling. Your personal information and security needs are kept strictly confidential.
        - generic [ref=e59]:
          - img [ref=e61]
          - heading "Rapid Response" [level=3] [ref=e63]
          - paragraph [ref=e64]: Our e-hailing algorithm matches you with the closest available vetted professionals for immediate deployment.
        - generic [ref=e65]:
          - img [ref=e67]
          - heading "Vetted Professionals" [level=3] [ref=e69]
          - paragraph [ref=e70]: All personnel are PSIRA registered, rigorously vetted, and continuously evaluated for top-tier service.
    - generic [ref=e72]:
      - generic [ref=e74]:
        - heading "Flexible Security Solutions" [level=2] [ref=e75]
        - paragraph [ref=e76]: Transparent, one-time fees. No long-term contracts. Request exactly what you need, when you need it.
      - generic [ref=e77]:
        - generic [ref=e78]:
          - img [ref=e80]
          - img [ref=e85]
          - heading "Close Protection" [level=3] [ref=e89]
          - paragraph [ref=e90]: Personalized security for high-net-worth individuals, executives, and VIPs requiring discreet, professional protection.
          - list [ref=e91]:
            - listitem [ref=e92]: PSIRA Registered Bodyguards
            - listitem [ref=e94]: Threat Assessment
            - listitem [ref=e96]: Secure Transportation Routing
          - button "Request Service" [ref=e98]
        - generic [ref=e99]:
          - img [ref=e101]
          - img [ref=e104]
          - heading "Event Security" [level=3] [ref=e106]
          - paragraph [ref=e107]: Comprehensive security management for private gatherings, corporate events, and high-profile functions.
          - list [ref=e108]:
            - listitem [ref=e109]: Crowd Control
            - listitem [ref=e111]: Access Management
            - listitem [ref=e113]: Emergency Response Planning
          - button "Request Service" [ref=e115]
        - generic [ref=e116]:
          - img [ref=e118]
          - img [ref=e122]
          - heading "Asset & Home" [level=3] [ref=e125]
          - paragraph [ref=e126]: Reliable protection for luxury properties, real estate showings, and valuable assets.
          - list [ref=e127]:
            - listitem [ref=e128]: Perimeter Securing
            - listitem [ref=e130]: Access Control
            - listitem [ref=e132]: Incident Reporting
          - button "Request Service" [ref=e134]
    - generic [ref=e136]:
      - generic [ref=e137]:
        - heading "Contact Us" [level=2] [ref=e138]
        - paragraph [ref=e139]: Have questions? We'd love to hear from you.
      - generic [ref=e140]:
        - generic [ref=e141]:
          - generic [ref=e142]:
            - img [ref=e144]
            - generic [ref=e147]:
              - heading "Office" [level=3] [ref=e148]
              - paragraph [ref=e149]:
                - text: 123 Security Blvd
                - text: Durban, South Africa
          - generic [ref=e150]:
            - img [ref=e152]
            - generic [ref=e155]:
              - heading "Email" [level=3] [ref=e156]
              - paragraph [ref=e157]: contact@aego.co.za
          - generic [ref=e158]:
            - img [ref=e160]
            - generic [ref=e162]:
              - heading "Phone" [level=3] [ref=e163]
              - paragraph [ref=e164]: +27 (0) 31 123 4567
        - generic [ref=e165]:
          - generic [ref=e166]:
            - generic [ref=e167]: Name
            - textbox "Name" [ref=e168]:
              - /placeholder: John Doe
          - generic [ref=e169]:
            - generic [ref=e170]: Email
            - textbox "Email" [ref=e171]:
              - /placeholder: john@example.com
          - generic [ref=e172]:
            - generic [ref=e173]: Message
            - textbox "Message" [ref=e174]:
              - /placeholder: How can we help?
          - button "Send Message" [ref=e175]:
            - img [ref=e176]
            - text: Send Message
  - contentinfo [ref=e179]:
    - generic [ref=e180]:
      - generic [ref=e181]:
        - generic [ref=e182]:
          - img [ref=e183]
          - generic [ref=e185]: AEGO
        - generic [ref=e186]:
          - link "Privacy Policy (POPIA)" [ref=e187] [cursor=pointer]:
            - /url: "#"
          - link "Terms of Service" [ref=e188] [cursor=pointer]:
            - /url: "#"
          - link "Provider Portal" [ref=e189] [cursor=pointer]:
            - /url: "#"
      - generic [ref=e190]: © 2026 Aego Security Solutions. Durban, South Africa. All rights reserved.
  - button [ref=e191]:
    - img [ref=e192]
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
  8  |     await expect(page.getByRole('link', { name: 'AEGO', exact: true })).toBeVisible();
  9  |     await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
  10 |     
  11 |     // Check marketing sections
  12 |     await expect(page.getByText('Features')).toBeVisible();
> 13 |     await expect(page.getByText('Services')).toBeVisible();
     |                                              ^ Error: expect(locator).toBeVisible() failed
  14 |   });
  15 | 
  16 |   test('should navigate to Partner With Us page', async ({ page }) => {
  17 |     await page.goto('/');
  18 |     
  19 |     // Click on partner with us link
  20 |     await page.getByRole('link', { name: 'Partner With Us' }).first().click();
  21 |     
  22 |     await expect(page).toHaveURL(/.*\/partner/);
  23 |     await expect(page.getByRole('heading', { name: 'Partner With Aego' })).toBeVisible();
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