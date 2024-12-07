export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width" />
      </head>
      <body>{children}</body>
    </html>
  );
}
