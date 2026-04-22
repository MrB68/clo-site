import { useState } from "react";
import { Inbox, LayoutDashboard, Instagram, Facebook, Music2, ArrowUpRight } from "lucide-react";

export function SocialIntegration() {
  const [activeTab, setActiveTab] = useState<'control'>('control');

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10 space-y-10 max-w-7xl mx-auto">

      {/* HEADER */}
      <div className="space-y-3">
        <h1 className="text-2xl md:text-3xl tracking-[0.2em] uppercase">Social Control</h1>
        <p className="text-white/50 text-sm">
          Manage your social platforms and access Meta tools
        </p>
        <div className="h-px bg-white/10 mt-4" />
      </div>

      {/* SOCIAL CONTROL ACTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

        {/* META INBOX */}
        <a
          href="https://business.facebook.com/latest/inbox"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative bg-white text-black p-5 rounded-2xl text-sm tracking-widest transition-all hover:bg-gray-200 hover:scale-[1.02] shadow-sm hover:shadow-xl"
        >
          <div className="flex items-start justify-between">
            <Inbox className="w-5 h-5 opacity-80" />
            <ArrowUpRight className="w-4 h-4 opacity-60 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
          </div>
          <div className="flex flex-col gap-2 mt-4">
            <span className="text-[10px] uppercase text-black/60">Messaging</span>
            <span className="text-base font-semibold">Meta Inbox</span>
            <span className="text-xs text-black/60">View messages & conversations</span>
          </div>
          <span className="absolute top-3 right-3 text-[10px] px-2 py-0.5 rounded-full bg-black/10">Live</span>
        </a>

        {/* META BUSINESS SUITE */}
        <a
          href="https://business.facebook.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative bg-zinc-900 border border-zinc-800 p-5 rounded-2xl text-sm transition-all hover:border-white hover:scale-[1.02] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.15)]"
        >
          <div className="flex items-start justify-between">
            <LayoutDashboard className="w-5 h-5 text-white/80" />
            <ArrowUpRight className="w-4 h-4 text-white/60 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
          </div>
          <div className="flex flex-col gap-2 mt-4">
            <span className="text-[10px] uppercase text-white/40">Management</span>
            <span className="text-base font-semibold text-white">Meta Business Suite</span>
            <span className="text-xs text-white/40">Manage posts, insights & ads</span>
          </div>
          <span className="absolute top-3 right-3 text-[10px] px-2 py-0.5 rounded-full bg-white/10">Connected</span>
        </a>

        {/* INSTAGRAM */}
        <a
          href="https://www.instagram.com/clostudios.np?igsh=aG02dXJxdm5tcWVm&utm_source=qr"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative bg-zinc-900 border border-zinc-800 p-5 rounded-2xl text-sm transition-all hover:border-pink-500/80 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(236,72,153,0.15)]"
        >
          <div className="flex items-start justify-between">
            <Instagram className="w-5 h-5 text-white/80" />
            <ArrowUpRight className="w-4 h-4 text-white/60 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
          </div>
          <div className="flex flex-col gap-2 mt-4">
            <span className="text-[10px] uppercase text-white/40">Social</span>
            <span className="text-base font-semibold text-white">Instagram</span>
            <span className="text-xs text-white/40">Open profile & manage content</span>
          </div>
          <span className="absolute top-3 right-3 text-[10px] px-2 py-0.5 rounded-full bg-white/10">Connected</span>
        </a>

        {/* FACEBOOK */}
        <a
          href="https://www.facebook.com/YOUR_PAGE"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative bg-zinc-900 border border-zinc-800 p-5 rounded-2xl text-sm transition-all hover:border-blue-500/80 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]"
        >
          <div className="flex items-start justify-between">
            <Facebook className="w-5 h-5 text-white/80" />
            <ArrowUpRight className="w-4 h-4 text-white/60 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
          </div>
          <div className="flex flex-col gap-2 mt-4">
            <span className="text-[10px] uppercase text-white/40">Social</span>
            <span className="text-base font-semibold text-white">Facebook Page</span>
            <span className="text-xs text-white/40">View page & engagement</span>
          </div>
          <span className="absolute top-3 right-3 text-[10px] px-2 py-0.5 rounded-full bg-white/10">Connected</span>
        </a>

        {/* TIKTOK */}
        <a
          href="https://www.tiktok.com/@YOUR_USERNAME"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative bg-zinc-900 border border-zinc-800 p-5 rounded-2xl text-sm transition-all hover:border-white hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(255,255,255,0.08)]"
        >
          <div className="flex items-start justify-between">
            <Music2 className="w-5 h-5 text-white/80" />
            <ArrowUpRight className="w-4 h-4 text-white/60 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
          </div>
          <div className="flex flex-col gap-2 mt-4">
            <span className="text-[10px] uppercase text-white/40">Social</span>
            <span className="text-base font-semibold text-white">TikTok</span>
            <span className="text-xs text-white/40">Open profile & videos</span>
          </div>
          <span className="absolute top-3 right-3 text-[10px] px-2 py-0.5 rounded-full bg-white/10">Connected</span>
        </a>

      </div>

    </div>
  );
}
