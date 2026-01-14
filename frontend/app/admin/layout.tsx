export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-wrapper bg-gray-50 min-h-screen">
      {children}
    </div>
  );
}