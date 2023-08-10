import React, { useEffect } from "react";
import { Routes, Route, Outlet, Link } from "react-router-dom";
import './App.less';

const Home = React.lazy(() => import("./pages/Home"));
const About = React.lazy(() => import("./pages/About"));
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const NoMatch = React.lazy(() => import("./pages/NoMatch"));

function Layout() {
  return (
    <div>
      <nav>
        <div>
          <span className="router-link">
            <Link to="/">Home</Link>
          </span>
          <span className="router-link">
            <Link to="/about">About</Link>
          </span>
          <span className="router-link">
            <Link to="/dashboard/messages">Messages (Dashboard)</Link>
          </span>
        </div>
      </nav>
      <hr />
      <Outlet />
    </div>
  );
}

export default function App() {
  return (
    <div>
      <React.Suspense fallback={<>...</>}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route
              path="about"
              element={
                <React.Suspense fallback={<>...</>}>
                  <About />
                </React.Suspense>
              }
            />
            <Route
              path="dashboard/*"
              element={
                <React.Suspense fallback={<>...</>}>
                  <Dashboard />
                </React.Suspense>
              }
            />
            <Route path="*" element={<NoMatch />} />
          </Route>
        </Routes>
      </React.Suspense>
    </div>
  );
}