import React from 'react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { label: 'Documentation', href: '#docs', icon: '📖' },
    { label: 'Help Center', href: '#help', icon: '❓' },
    { label: 'Feedback', href: '#feedback', icon: '💬' },
    { label: 'API Status', href: '#status', icon: '🟢' },
  ];

  const socialLinks = [
    { label: 'GitHub', href: '#github', icon: '🐙' },
    { label: 'Twitter', href: '#twitter', icon: '🐦' },
    { label: 'Discord', href: '#discord', icon: '💬' },
  ];

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
      <div className="container mx-auto px-4 py-6">
        {/* Desktop Layout */}
        <div className="hidden md:grid md:grid-cols-3 gap-6 mb-4">
          {/* About */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Amazon PPC Keyword Genius
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              AI-Powered Keyword Research & Campaign Planning for Amazon sellers
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Quick Links
            </h3>
            <ul className="space-y-1">
              {footerLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-xs text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors inline-flex items-center gap-1"
                  >
                    <span>{link.icon}</span>
                    <span>{link.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social & Version */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Connect
            </h3>
            <div className="flex gap-3 mb-3">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-lg hover:scale-110 transition-transform"
                  title={link.label}
                  aria-label={link.label}
                >
                  {link.icon}
                </a>
              ))}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Version 1.4.0 | Powered by Google Gemini AI
            </p>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden space-y-3 mb-4">
          <div className="flex flex-wrap gap-3 justify-center">
            {footerLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-xs text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 inline-flex items-center gap-1"
              >
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </a>
            ))}
          </div>
          <div className="flex gap-4 justify-center">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-lg"
                title={link.label}
                aria-label={link.label}
              >
                {link.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center text-xs text-gray-600 dark:text-gray-400">
            <p className="mb-2 md:mb-0">
              © {currentYear} Amazon PPC Keyword Genius - Made with ❤️ for Amazon sellers
            </p>
            <p className="md:hidden">
              Version 1.4.0 | Powered by Google Gemini AI
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
