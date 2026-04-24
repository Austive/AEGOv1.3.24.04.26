import { test, expect } from '@playwright/test';

test.describe('Aego Additional Pages', () => {
  test('should load Partner With Us page', async ({ page }) => {
    await page.goto('/partner');
    await expect(page.getByRole('heading', { name: /Partner With Aego/i })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In with Google' })).toBeVisible();
  });

  test('should open booking form when clicking Request Security in hero', async ({ page }) => {
    // Note: since this requires login, checking the login screen or Book Now text
    await page.goto('/');
    
    // Find Request Security button in Hero section
    const bookingBtn = page.getByRole('button', { name: 'Request Security Now', exact: true }).first();
    await bookingBtn.click();
    
    // As it stands, if user is not logged in, "Request Security Now" might just open login,
    // wait, does Hero check if user is logged in? Hero passes `onBookClick`.
    // Oh, `onBookClick` is in App.tsx `const [isBookingOpen, setIsBookingOpen] = useState(false);`
    // And `<BookingForm>` asks for login first if not logged in.
    await expect(page.getByText('Sign In Required')).toBeVisible();
  });
});
