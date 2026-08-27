import { expect, test } from '@playwright/test'

test('AI helper stays optional and recovers without a configured provider', async ({ page }) => {
  await page.goto('/shop')

  const assistant = page.getByRole('region', {
    name: 'Ask about the story behind the collection.',
  })
  await expect(assistant).toBeVisible()

  await assistant.getByLabel('Your question').fill("What is Jia Wei's creative journey?")
  await assistant.getByRole('button', { name: 'Ask the guide' }).click()
  await expect(assistant).toContainText('The learning assistant is unavailable right now.')
  const cartLink = page.getByRole('link', { name: 'Cart, 0 items' })
  if (!(await cartLink.isVisible())) {
    await page.getByRole('button', { name: 'Menu' }).click()
  }
  await expect(cartLink).toBeVisible()

  await assistant.getByLabel('Your question').fill('What is the quantum lantern schedule?')
  await assistant.getByRole('button', { name: 'Ask the guide' }).click()
  await expect(assistant).toContainText(
    'I do not have enough information in the approved learning content',
  )
  await expect(
    assistant.getByRole('list', { name: 'Assistant conversation' }).getByRole('listitem'),
  ).toHaveCount(2)
})
