import { Routes, Route, Outlet, Link } from "react-router-dom";

function DashboardLayout() {
  return (
    <div>
      <nav>
        <div>
          <span className="router-link">
            <Link to="/dashboard">Dashboard Home</Link>
          </span>
          <span className="router-link">
            <Link to="/dashboard/messages">Messages</Link>
          </span>
        </div>
      </nav>

      <hr />

      <Outlet />
    </div>
  );
}

function DashboardIndex() {
  return (
    <div>
      <h2>Dashboard Index</h2>
    </div>
  );
}

function Messages() {
  return (
    <div>
      <h2>Messages</h2>
      <div>
        <span>Message 1</span>
        <span>Message 2</span>
      </div>
    </div>
  );
}


export default function Dashboard() {
  // These routes are defined when this component is loaded on demand via
  // dynamic import() on the home page!
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<DashboardIndex />} />
        <Route path="messages" element={<Messages />} />
      </Route>
    </Routes>
  );
}
