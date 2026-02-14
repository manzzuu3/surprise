import './globals.css';

export const metadata = {
    title: '🌌 A Message From the Stars',
    description: 'Something special is waiting for you among the stars...',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
