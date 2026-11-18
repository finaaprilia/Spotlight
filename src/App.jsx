import { useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { useApp } from "./context/AppContext";
import TopNav from "./components/TopNav";
import BottomNav from "./components/BottomNav";
import OfflineBar from "./components/OfflineBar";
import Splash from "./components/Splash";
import Onboarding from "./components/Onboarding";
import Home from "./pages/Home";
import News from "./pages/News";
import Bookmarks from "./pages/Bookmarks";
import BookmarkFolder from "./pages/BookmarkFolder";
import History from "./pages/History"; // TAHAP 3
import Profile from "./pages/Profile";
import Detail from "./pages/Detail";

export default function App() {
  const { onboarded, setOnboarded } = useApp();
  // Pengguna lama melihat splash, pengguna baru melihat onboarding.
  const [phase, setPhase] = useState(onboarded ? "splash" : "onboarding");
  const { pathname } = useLocation();

  if (phase === "splash") return <Splash onDone={() => setPhase("app")} />;
  if (phase === "onboarding")
    return (
      <Onboarding
        onDone={() => {
          setOnboarded(true);
          setPhase("app");
        }}
      />
    );

  const hideNav = pathname.startsWith("/berita/");

  return (
    <div className="app">
      <OfflineBar />
      <TopNav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/berita" element={<News />} />
        <Route path="/berita/:id" element={<Detail />} />
        <Route path="/bookmark" element={<Bookmarks />} />
        <Route path="/bookmark/:kategori" element={<BookmarkFolder />} />
        <Route path="/riwayat" element={<History />} /> {/* TAHAP 3 */}
        <Route
          path="/profil"
          element={<Profile onReplayIntro={() => { setOnboarded(false); setPhase("onboarding"); }} />}
        />
        <Route path="*" element={<Home />} />
      </Routes>
      {!hideNav && <BottomNav />}
    </div>
  );
}
