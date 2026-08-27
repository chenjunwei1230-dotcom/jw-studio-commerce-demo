import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { AppShell } from './app/AppShell'
import { ScrollToTop } from './app/ScrollToTop'
import { CartProvider } from './features/cart/CartContext'
import { HomePage } from './features/creator/HomePage'
import { CartPage } from './pages/CartPage'
import { CheckoutPage } from './pages/CheckoutPage'
import { DemoResultPage } from './pages/DemoResultPage'
import { ProductDetailPage } from './pages/ProductDetailPage'
import { PlaceholderPage } from './pages/PlaceholderPage'
import { ShopPage } from './pages/ShopPage'

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <CartProvider>
        <AppShell>
          <Routes>
            <Route
              path="/"
              element={<HomePage />}
            />
            <Route
              path="/shop"
              element={<ShopPage />}
            />
            <Route
              path="/products/:productId"
              element={<ProductDetailPage />}
            />
            <Route
              path="/cart"
              element={<CartPage />}
            />
            <Route
              path="/checkout"
              element={<CheckoutPage />}
            />
            <Route
              path="/demo-result"
              element={<DemoResultPage />}
            />
            <Route
              path="*"
              element={
                <PlaceholderPage
                  eyebrow="FRAME / NOT FOUND"
                  title="This frame is not on the timeline."
                  description="The page you requested does not exist in the current studio shell."
                  actionLabel="Return to studio"
                  actionTo="/"
                  state="not-found"
                />
              }
            />
          </Routes>
        </AppShell>
      </CartProvider>
    </BrowserRouter>
  )
}

export default App
