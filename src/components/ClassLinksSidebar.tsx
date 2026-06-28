import React from "react";
import { UserProfile } from "../types";
import { motion } from "motion/react";
import { Star, Award, Sparkles, BookOpen, Link, DollarSign, ExternalLink } from "lucide-react";

interface ClassLinksSidebarProps {
  user: UserProfile;
}

export default function ClassLinksSidebar({ user }: ClassLinksSidebarProps) {
  const quickLinks = [
    { name: "Google Drive Materi", url: "https://drive.google.com", color: "bg-emerald-500" },
    { name: "WhatsApp Group Kelas", url: "https://whatsapp.com", color: "bg-green-500" },
    { name: "SIAKAD Portal Akademik", url: "https://siakad.ac.id", color: "bg-amber-500" },
    { name: "Zoom Kuliah Utama", url: "https://zoom.us", color: "bg-rose-500" },
  ];

  return (
    <div className="flex flex-col gap-5 text-left">
      
      {/* Kas Kelas Box */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-premium">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            Kas Kelas Kita
          </h2>
          <span className="bg-emerald-50 text-emerald-700 text-[9px] font-extrabold px-2 py-0.5 rounded border border-emerald-100">
            TERTIB KAS
          </span>
        </div>

        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 mb-3.5">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Saldo Kas Angkatan</span>
          <p className="text-2xl font-extrabold text-slate-800 tracking-tight mt-0.5">
            Rp 1.420.000
          </p>
          <span className="text-[8.5px] font-semibold text-slate-400 block mt-1">
            *Dikelola Bendahara (Gita Lestari)
          </span>
        </div>

        <div className="space-y-2 text-[10.5px] font-bold text-slate-500">
          <div className="flex justify-between">
            <span>Fotokopi & Modul:</span>
            <span className="text-slate-700">Rp 150.000</span>
          </div>
          <div className="flex justify-between">
            <span>Kas Sosial (Duka/Sakit):</span>
            <span className="text-slate-700">Rp 400.000</span>
          </div>
          <div className="flex justify-between border-t border-slate-100 pt-2 text-slate-800 font-extrabold">
            <span>Kas Tersedia (Makrab):</span>
            <span>Rp 870.000</span>
          </div>
        </div>
      </div>

      {/* Quick Links Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-premium">
        <h2 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Link className="w-4 h-4 text-indigo-600" />
          Link Pintasan
        </h2>

        <ul className="space-y-2">
          {quickLinks.map((item) => (
            <li key={item.name}>
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="w-full text-left p-2.5 rounded-xl border border-slate-100 hover:border-slate-200 flex items-center justify-between transition-all bg-slate-50 hover:bg-slate-100/60 cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${item.color}`} />
                  <span className="font-semibold text-slate-600 text-[10.5px] group-hover:text-indigo-600 transition-colors">
                    {item.name}
                  </span>
                </div>
                <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-slate-700 transition-colors" />
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Class Slogan Card */}
      <div className="bg-gradient-to-tr from-slate-900 to-slate-950 p-5 rounded-2xl text-white relative overflow-hidden shadow-premium">
        <div className="relative z-10 space-y-1.5">
          <span className="bg-rose-500 text-white text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded tracking-widest leading-none">
            Motto Angkatan
          </span>
          <h3 className="text-xs font-bold mt-2 text-rose-400">
            "Satu Rasa, Satu Almamater"
          </h3>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            Saling menopang tugas kuliah, solid ngerayain kelulusan bareng! Jangan biarkan satu pun kawan tertinggal di jalan perjuangan S.Kom.
          </p>
        </div>
      </div>
    </div>
  );
}
