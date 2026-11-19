"use client";

import { useState } from "react";
import { LogIn, LogOut, Plus, Search, UserPen } from "lucide-react";
import { useTranslations } from "next-intl";
import { AddMessageModal } from "./AddMessageModal";
import { AuthModal } from "./AuthModal";
import { MasonryGrid } from "./MasonryGrid";
import { ProfileModal } from "./ProfileModal";
import { useMessageWallStore } from "@/src/lib/message-wall/store";
import type {
  AuthUser,
  SignInInput,
  SignUpInput,
  UpdateProfileInput,
  WallMessage,
} from "@/src/lib/message-wall/types";
import { MainNav } from "@/components/shared/MainNav";

interface MessageWallLayoutProps {
  locale: string;
  initialMessages: WallMessage[];
  initialAuthUser: AuthUser | null;
  challengeEnabled: boolean;
}

export function MessageWallLayout({
  locale,
  initialMessages,
  initialAuthUser,
  challengeEnabled,
}: MessageWallLayoutProps) {
  const t = useTranslations("demo");
  const {
    isLoading,
    error,
    visibleMessages,
    authUser,
    searchQuery,
    positionFilter,
    availablePositions,
    setSearchQuery,
    setPositionFilter,
    clearError,
    signIn,
    signUp,
    updateProfile,
    signOut,
    addMessage,
    deleteMessage,
  } = useMessageWallStore(initialMessages, initialAuthUser);

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSearchPanel, setShowSearchPanel] = useState(false);

  const onAddSubmit = async (input: { text: string; color: string }) => {
    await addMessage(input);
    setShowAddModal(false);
  };

  const onSignIn = async (input: SignInInput) => {
    await signIn(input);
    setShowAuthModal(false);
  };

  const onSignUp = async (input: SignUpInput) => {
    await signUp(input);
    setShowAuthModal(false);
  };

  const onProfileSubmit = async (input: UpdateProfileInput) => {
    await updateProfile(input);
    setShowProfileModal(false);
  };

  const onDeleteMessage = async (messageId: number) => {
    try {
      await deleteMessage(messageId);
    } catch {
      // error already surfaced by store
    }
  };

  const onAuthClick = async () => {
    clearError();
    if (authUser) {
      try {
        await signOut();
      } catch {
        // error already surfaced by store
      }
      return;
    }
    setShowAuthModal(true);
  };

  return (
    <div className="presentation-bg min-h-screen text-white">
      <div className="pointer-events-none absolute inset-0 presentation-glow" />
      <MainNav locale={locale} challengeEnabled={challengeEnabled} />

      <main className="relative z-10 mx-auto max-w-6xl px-4 pt-24 pb-16 sm:pt-28 sm:pb-20">
        <header className="mb-8 text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-sb-green/30 bg-sb-green/10 px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-sb-green" />
            <span className="text-xs font-medium text-sb-green">
              {t("header.eyebrow")}
            </span>
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {t("header.title")}
          </h1>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-white/55 sm:text-base">
            {t("header.subtitle")}
          </p>
          {authUser?.email ? (
            <p className="mt-2 text-xs text-white/45">
              {t("authStatus", { email: authUser.email })}
            </p>
          ) : null}
        </header>

        <div className="mx-auto w-full max-w-5xl">
          {error ? (
            <div className="mb-4 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </div>
          ) : null}

          {isLoading ? (
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-8 text-center text-sm text-white/55">
              {t("loading")}
            </div>
          ) : (
            <MasonryGrid
              messages={visibleMessages}
              locale={locale}
              authUserId={authUser?.id ?? null}
              onDeleteMessage={(id) => void onDeleteMessage(id)}
            />
          )}
        </div>
      </main>

      {showSearchPanel ? (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
          onClick={() => setShowSearchPanel(false)}
        >
          <aside
            className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0f0f0f] p-5 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className="mb-1 text-lg font-semibold text-white">
              {t("search.title")}
            </h3>
            <p className="mb-4 text-xs text-white/45">
              {t("search.placeholder")}
            </p>
            <div className="space-y-2.5">
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => {
                  clearError();
                  setSearchQuery(event.target.value);
                }}
                placeholder={t("search.placeholder")}
                className="h-10 w-full rounded-lg border border-white/10 bg-black/35 px-3 text-sm text-white outline-none transition focus:border-sb-green/40"
              />
              <select
                value={positionFilter}
                onChange={(event) => {
                  clearError();
                  setPositionFilter(event.target.value);
                }}
                className="h-10 w-full rounded-lg border border-white/10 bg-black/35 px-3 text-sm text-white outline-none transition focus:border-sb-green/40"
              >
                <option value="All">{t("search.positions.all")}</option>
                {availablePositions.map((position) => (
                  <option key={position} value={position}>
                    {position}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={() => setShowSearchPanel(false)}
                className="h-9 rounded-lg border border-white/10 px-3 text-sm text-white/70 hover:text-white"
              >
                {t("addMessageModal.cancel")}
              </button>
            </div>
          </aside>
        </div>
      ) : null}

      <div className="fixed right-4 bottom-6 z-[66] flex flex-col gap-2">
        <button
          type="button"
          onClick={() => {
            clearError();
            setShowAddModal(true);
          }}
          className="group flex h-11 items-center justify-center gap-2 rounded-xl border border-sb-green/35 bg-sb-green/15 px-3 text-sm font-medium text-sb-green shadow-lg transition hover:border-sb-green/55"
          title={t("fab.addTitle")}
        >
          <Plus size={15} />
          {t("fab.add")}
        </button>

        <button
          type="button"
          onClick={() => setShowSearchPanel((previous) => !previous)}
          className={`group flex h-11 items-center justify-center gap-2 rounded-xl border px-3 text-sm font-medium shadow-lg transition ${
            showSearchPanel
              ? "border-cyan-300/45 bg-cyan-400/15 text-cyan-200"
              : "border-white/20 bg-black/55 text-white/80 hover:border-white/35"
          }`}
          title={t("fab.searchTitle")}
        >
          <Search size={15} />
          {t("fab.search")}
        </button>

        <button
          type="button"
          onClick={() => void onAuthClick()}
          className={`group flex h-11 items-center justify-center gap-2 rounded-xl border px-3 text-sm font-medium shadow-lg transition ${
            authUser
              ? "border-amber-300/45 bg-amber-300/12 text-amber-200 hover:border-amber-300/60"
              : "border-white/20 bg-black/55 text-white/80 hover:border-white/35"
          }`}
          title={authUser ? t("fab.logoutTitle") : t("fab.loginTitle")}
        >
          {authUser ? <LogOut size={15} /> : <LogIn size={15} />}
          {authUser ? t("fab.logout") : t("fab.login")}
        </button>
      </div>

      <AuthModal
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSignIn={onSignIn}
        onSignUp={onSignUp}
      />

      <AddMessageModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={onAddSubmit}
        externalError={error}
      />
    </div>
  );
}
