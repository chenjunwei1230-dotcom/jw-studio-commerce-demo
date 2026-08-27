import { expect, test } from '@playwright/test'

const productName = 'Keep Showing Up Keychain'

test('VS-001 browse to simulated payment result', async ({ page }) => {
  const checkoutRequestBodies: Record<string, unknown>[] = []

  page.on('request', (request) => {
    if (request.url().endsWith('/api/demo/checkout')) {
      checkoutRequestBodies.push(JSON.parse(request.postData() ?? '{}') as Record<string, unknown>)
    }
  })

  await page.goto('/shop')
  await expect(page.getByRole('heading', { name: 'A little progress, made tangible.' })).toBeVisible()
  await page.getByRole('link', { name: `View details for ${productName}` }).click()

  await expect(page).toHaveURL(/\/products\/keep-showing-up-keychain$/)
  await expect(page.getByRole('heading', { name: productName })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Choose required options' })).toBeDisabled()
  await expect(page.locator('.product-options__status')).toHaveText('Choose: Colour')

  await page.locator('label[for="colour-purple"]').click()
  await expect(page.getByRole('button', { name: 'Add to collection' })).toBeEnabled()
  await page.getByRole('button', { name: 'Add to collection' }).click()
  await expect(page.locator('#product-action-note')).toContainText('Added to your collection')
  const cartLink = page.getByRole('link', { name: 'Cart, 1 item' })
  if (!(await cartLink.isVisible())) {
    await page.getByRole('button', { name: 'Menu' }).click()
    await expect(cartLink).toBeVisible()
  }

  await cartLink.click()
  await expect(page.getByRole('heading', { name: 'A few frames, moving forward.' })).toBeVisible()
  await expect(page.getByRole('heading', { name: productName })).toBeVisible()
  await expect(page.getByText('Purple', { exact: true })).toBeVisible()
  await expect(page.getByText('RM 12.00', { exact: true }).first()).toBeVisible()

  await page.getByRole('link', { name: 'Continue to demo checkout' }).click()
  await expect(page.getByRole('heading', { name: 'One more frame, for learning.' })).toBeVisible()
  await expect(page.getByText('No real payment will be processed.')).toBeVisible()
  expect(await page.locator('input[type="password"], input[name*="card"], input[name*="cvv"]').count()).toBe(0)
  await expect(page.getByRole('button', { name: 'Run demo payment' })).toBeEnabled()

  await page.getByRole('button', { name: 'Run demo payment' }).click()
  await expect(page.getByRole('alert')).toHaveText('Choose a simulated payment path before continuing.')

  await page.getByRole('radio', { name: /Demo card simulation/ }).check()
  await page.getByRole('button', { name: 'Run demo payment' }).click()
  await expect(page).toHaveURL(/\/demo-result$/)
  await expect(page.getByRole('heading', { name: 'The next frame is complete.' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'What the demo confirmed.' })).toBeVisible()
  await expect(page.getByText('No real payment was processed.').first()).toBeVisible()
  await expect(page.getByRole('heading', { name: productName })).toBeVisible()
  await expect(page.getByText('RM 12.00', { exact: true }).first()).toBeVisible()

  expect(checkoutRequestBodies[0]).toEqual({
    items: [
      {
        product_id: 'keep-showing-up-keychain',
        selected_options: { colour: 'Purple' },
        quantity: 1,
      },
    ],
    payment_method: 'demo_card',
  })

  await page.getByRole('link', { name: 'Review browser cart' }).click()
  await expect(page.getByRole('heading', { name: productName })).toBeVisible()
  await page.getByRole('link', { name: 'Continue to demo checkout' }).click()
  await page.getByRole('radio', { name: /Demo wallet simulation/ }).check()
  await page.getByRole('button', { name: 'Run demo payment' }).click()
  await expect(page).toHaveURL(/\/demo-result$/)
  await expect(page.getByText('No real payment was processed.').first()).toBeVisible()
  expect(checkoutRequestBodies).toHaveLength(2)
  expect(checkoutRequestBodies[1]).toMatchObject({ payment_method: 'demo_wallet' })
})

test('VS-001 empty-cart recovery returns to the collection', async ({ page }) => {
  await page.goto('/cart')
  await expect(page.getByRole('heading', { name: 'Your collection is waiting.' })).toBeVisible()
  await page.getByRole('link', { name: 'Browse the collection' }).click()
  await expect(page).toHaveURL(/\/shop$/)
  await expect(page.getByRole('heading', { name: 'A little progress, made tangible.' })).toBeVisible()
})
