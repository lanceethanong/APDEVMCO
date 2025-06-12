export default function AuthLayout({ children }) {
  return (
    <div className="text-white h-[100vh] flex justify-center items-center bg-cover" style={{ backgroundImage: "url('../src/assets/manila.png')" }}>
      {children}
    </div>
  );
}