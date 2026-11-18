export default function Logo({ size = 28 }) {
  return (
    <span className="logo" style={{ fontSize: size }} aria-label="coy">
      coy<span className="logo-dot" />
    </span>
  );
}
