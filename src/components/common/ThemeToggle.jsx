import { useTheme } from '../../context/ThemeContext';
import { FiSun, FiMoon } from 'react-icons/fi';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="relative h-9 w-9 grid place-items-center rounded-full border border-gray-300 dark:border-brand-border
                 text-gray-600 dark:text-gray-300 hover:text-brand-green-500 hover:border-brand-green-500 transition-colors"
    >
      {theme === 'dark' ? <FiSun size={16} /> : <FiMoon size={16} />}
    </button>
  );
}
