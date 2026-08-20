import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ChatbotWidget from './components/chatbot/ChatbotWidget';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-brand-black text-gray-900 dark:text-gray-100 transition-colors">
      <Navbar />
      <main className="flex-1">
        <AppRoutes />
      </main>
      <Footer />
      <ChatbotWidget />
    </div>
  );
}
