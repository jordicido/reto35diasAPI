export function Message({
  type,
  children
}: {
  type: "success" | "error" | "info";
  children: React.ReactNode;
}) {
  return <div className={`message ${type}`} role="status">{children}</div>;
}
