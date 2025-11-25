"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// --- ÖNEMLİ: CSS dosyasını yeni paketten çekiyoruz ---
import "react-quill-new/dist/quill.snow.css"; 

// ReactQuill'i dinamik olarak yüklüyoruz (SSR kapalı)
// 'react-quill-new' paketi React 19 uyumludur, bu yüzden 'as any' ile uğraşmaya gerek kalmaz ama
// TypeScript güvenliği için yine de basit bir cast kullanabiliriz.
const ReactQuill = dynamic(() => import("react-quill-new"), { 
  ssr: false,
  loading: () => (
    <div className="h-64 bg-gray-100 animate-pulse rounded-md flex items-center justify-center text-gray-400">
      Editör Yükleniyor...
    </div>
  )
});

type Props = {
  value: string;
  onChange: (value: string) => void;
  label: string;
};

export default function RichTextEditor({ value, onChange, label }: Props) {
  const [isSourceMode, setIsSourceMode] = useState(false);
  const [editorValue, setEditorValue] = useState(value || "");

  // Dışarıdan (Parent'tan) değer değişirse güncelle
  useEffect(() => {
    setEditorValue(value || "");
  }, [value]);

  const handleChange = (val: string) => {
    setEditorValue(val);
    onChange(val);
  };

  // Editör Araç Çubuğu Ayarları
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}],
      ['link', 'image', 'video'],
      ['clean']
    ],
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between items-end mb-2">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        
        {/* Mod Değiştirme Butonu */}
        <button
          type="button"
          onClick={() => setIsSourceMode(!isSourceMode)}
          className="text-xs font-bold uppercase tracking-wide text-teal-700 hover:text-teal-900 bg-teal-50 px-3 py-1 rounded border border-teal-200 hover:bg-teal-100 transition-colors flex items-center gap-2"
        >
          {isSourceMode ? (
            <>
              <span className="text-lg">👁️</span> Görsel Editöre Dön
            </>
          ) : (
            <>
              <span className="text-lg">code</span> HTML Kaynak Kodu
            </>
          )}
        </button>
      </div>

      <div className="border border-gray-300 rounded-md overflow-hidden bg-white shadow-sm">
        {isSourceMode ? (
          // HTML Kaynak Modu
          <textarea
            value={editorValue}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full h-96 p-4 font-mono text-sm bg-gray-900 text-green-400 outline-none resize-y block"
            placeholder="<p>HTML kodunuzu buraya yazın...</p>"
          />
        ) : (
          // Zengin Metin Editörü Modu (ReactQuill New)
          <div className="h-96 overflow-y-auto bg-white text-black">
             <ReactQuill 
               theme="snow" 
               value={editorValue} 
               onChange={handleChange} 
               modules={modules}
               className="h-full"
             />
             <style jsx global>{`
                /* Editörün yüksekliğini ve stilini ayarla */
                .ql-container { height: calc(100% - 42px) !important; font-size: 16px; font-family: sans-serif; }
                .ql-editor { min-height: 100%; }
                .ql-toolbar { border-top: none !important; border-left: none !important; border-right: none !important; background-color: #f9fafb; border-bottom: 1px solid #e5e7eb; }
                .ql-container.ql-snow { border: none !important; }
             `}</style>
          </div>
        )}
      </div>
      
      <p className="text-xs text-gray-500 mt-2 text-right italic">
        {isSourceMode ? "⚠️ HTML etiketlerini doğrudan düzenliyorsunuz." : "💡 Metni biçimlendirmek için araç çubuğunu kullanın."}
      </p>
    </div>
  );
}