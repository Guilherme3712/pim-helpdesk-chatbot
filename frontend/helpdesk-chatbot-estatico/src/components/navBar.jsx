import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="flex gap-4 p-4 bg-white shadow rounded-xl mb-8 pl-4">
      <Link to="/home" className="hover:text-blue-600 font-semibold">
        Home
      </Link>
      <Link to="/chamados" className="hover:text-blue-600 font-semibold">
        Chamados
      </Link>
    </nav>
  );
}
