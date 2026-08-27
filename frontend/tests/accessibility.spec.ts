import { expect, test } from '@playwright/test'

test.use({ viewport: { width: 390, height: 844 } })

test('mobile navigation and product options support keyboard activation', async ({ page }) => {
  await page.goto('/shop')

  const menu = page.getByRole('button', { name: 'Menu' })
  await menu.focus()
  await menu.press('Enter')
  await expect(page.getByRole('link', { name: 'Collection' })).toBeVisible()

  await page.keyboard.press('Escape')
  await expect(page.getByRole('link', { name: 'Collection' })).toBeHidden()

  await page.goto('/products/keep-showing-up-keychain')
  const purpleOption = page.getByRole('radio', { name: 'Purple' })
  await purpleOption.focus()
  await purpleOption.press('Space')
  const addButton = page.getByRole('button', { name: 'Add to collection' })
  await expect(addButton).toBeEnabled()
  await addButton.press('Enter')

  const cartLink = page.getByRole('link', { name: 'Cart, 1 item' })
  const menuAfterAdd = page.getByRole('button', { name: 'Menu' })
  if (await menuAfterAdd.isVisible()) await menuAfterAdd.press('Enter')
  await cartLink.press('Enter')
  await expect(page).toHaveURL(/\/cart$/)

  await page.getByRole('link', { name: 'Continue to demo checkout' }).press('Enter')
  await expect(page).toHaveURL(/\/checkout$/)
  const submitButton = page.getByRole('button', { name: 'Run demo payment' })
  await submitButton.press('Enter')
  await expect(page.getByRole('alert')).toContainText('Choose a simulated payment path')

  const demoCard = page.getByRole('radio', { name: /Demo card simulation/ })
  await demoCard.press('Space')
  await submitButton.press('Enter')
  await expect(page).toHaveURL(/\/demo-result$/)
})

test('assistant form exposes keyboard-friendly validation and recovery', async ({ page }) => {
  await page.goto('/shop')

  const assistant = page.getByRole('region', {
    name: 'Ask about the story behind the collection.',
  })
  const question = assistant.getByLabel('Your question')
  const askButton = assistant.getByRole('button', { name: 'Ask the guide' })

  await question.fill('   ')
  await askButton.press('Enter')
  await expect(assistant.getByRole('alert')).toContainText('Write a question')
  await expect(question).toHaveAttribute('aria-invalid', 'true')
  await expect(question).toHaveAttribute('aria-describedby', /assistant-error/)

  await question.fill("What is Jia Wei's creative journey?")
  await askButton.press('Enter')
  await expect(assistant).toContainText('The learning assistant is unavailable right now.')
})

test('catalog images expose useful alternative text', async ({ page }) => {
  await page.goto('/shop')
  await expect(page.getByRole('heading', { name: 'Small pieces of creative practice.' })).toBeVisible()

  const emptyAlternativeText = await page.locator('img').evaluateAll((images) =>
    images.some((image) => !image.getAttribute('alt')?.trim()),
  )
  expect(emptyAlternativeText).toBe(false)
})
