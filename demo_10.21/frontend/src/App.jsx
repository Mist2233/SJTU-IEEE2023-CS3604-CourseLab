import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import SearchResultsPage from './pages/SearchResultsPage'
import BookingPage from './pages/BookingPage'
import OrderConfirmationPage from './pages/OrderConfirmationPage'
import PaymentPage from './pages/PaymentPage'
import PaymentSuccessPage from './pages/PaymentSuccessPage'
import UserOrdersPage from './pages/UserOrdersPage'
import './App.css'

function App() {
  return (
    <div className="App">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/search" element={<SearchResultsPage />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
          <Route path="/payment/:orderId" element={<PaymentPage />} />
          <Route path="/payment-success/:orderId" element={<PaymentSuccessPage />} />
          <Route path="/my-orders" element={<UserOrdersPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App