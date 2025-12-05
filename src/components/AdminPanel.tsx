import React, { useState } from 'react';
import { Settings, Utensils, Zap, BookOpen, Trash2, Edit } from 'lucide-react';
import type { MenuItem } from '../types';

interface AdminPanelProps {
  menuItems: MenuItem[];
  generatedMenu: MenuItem[];
  onGenerateMenu: (concept: string) => void;
  // Faltaría: onApproveMenu, onUpdateItem, onDeleteItem
}

// Subcomponente para la Generación de Menú con IA
const AIGenerator: React.FC<{ onGenerate: (concept: string) => void }> = ({ onGenerate }) => {
  const [concept, setConcept] = useState('Un menú de 5 platillos de comida callejera mexicana, con nombres muy creativos.');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    await onGenerate(concept); // Llamamos a la función que inicia el proceso
    setLoading(false); 
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-700">
        <Zap className="text-primary" /> Generador de Menú IA
      </h3>
      <p className="text-slate-600 mb-4">Describe el concepto de tu restaurante y deja que la IA (Gemini) cree un menú completo para ti.</p>
      <textarea
        value={concept}
        onChange={(e) => setConcept(e.target.value)}
        rows={4}
        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition"
        placeholder="Ej: Menú de postres gourmet, 7 opciones, enfoque en chocolate y frutas de temporada."
      />
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="mt-4 w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:bg-slate-400 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            Generando...
          </>
        ) : (
          <>
            <BookOpen size={20} /> Generar Menú de Prueba
          </>
        )}
      </button>
    </div>
  );
};

// Componente Principal
const AdminPanel: React.FC<AdminPanelProps> = ({ menuItems, generatedMenu, onGenerateMenu }) => {
  const [activeTab, setActiveTab] = useState('ai'); // 'ai', 'menu', 'settings'

  const totalProducts = menuItems.length;

  return (
    <div className="p-6 h-full flex flex-col bg-slate-50">
      <h2 className="text-3xl font-extrabold text-slate-800 mb-6 border-b pb-4">
        <Settings className="inline-block mr-2 text-primary" size={28} /> Panel de Administración
      </h2>

      {/* Navegación de Pestañas */}
      <div className="flex gap-2 mb-6 border-b">
        <button
          onClick={() => setActiveTab('ai')}
          className={`px-4 py-3 font-bold transition-colors border-b-4 ${activeTab === 'ai' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <Zap size={18} className="inline-block mr-1" /> Generador IA
        </button>
        <button
          onClick={() => setActiveTab('menu')}
          className={`px-4 py-3 font-bold transition-colors border-b-4 ${activeTab === 'menu' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <Utensils size={18} className="inline-block mr-1" /> Menú ({totalProducts})
        </button>
      </div>

      {/* Contenido de Pestañas */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'ai' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AIGenerator onGenerate={onGenerateMenu} />
            
            {/* Vista Previa del Menú Generado */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
                <h3 className="text-xl font-bold mb-4 text-slate-700">Menú Sugerido (Revisión)</h3>
                
                {generatedMenu.length > 0 ? (
                  <>
                    <div className="space-y-3">
                      {generatedMenu.map((item) => (
                        <div key={item.id} className="flex justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                           <div className="font-semibold text-slate-700">
                               {item.name}
                               <p className="text-xs text-slate-500 italic font-normal">{item.description}</p>
                           </div>
                           <span className="font-bold text-blue-700">${item.price}</span>
                        </div>
                      ))}
                    </div>
                    <button /* onClick={onApproveMenu} */ className="mt-4 w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-orange-600 transition">
                      Aprobar y Agregar al Menú
                    </button>
                  </>
                ) : (
                  <p className="text-center text-slate-400 py-10 italic">El menú generado por la IA aparecerá aquí.</p>
                )}
            </div>
          </div>
        )}

        {activeTab === 'menu' && (
          <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
            <h3 className="text-xl font-bold mb-4 text-slate-700">Administración de Productos</h3>
            <div className="grid grid-cols-1 gap-4">
              {menuItems.map(item => (
                <div key={item.id} className="flex justify-between items-center p-3 border-b hover:bg-slate-50 rounded-lg">
                  <div className="font-medium text-slate-700">{item.name} <span className="text-xs text-primary font-bold">(${item.price})</span></div>
                  <div className="flex gap-2">
                    <button className="text-blue-500 hover:text-blue-700 p-2 rounded-full hover:bg-blue-100"><Edit size={18}/></button>
                    <button className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100"><Trash2 size={18}/></button>
                  </div>
                </div>
              ))}
              {menuItems.length === 0 && <p className="text-center text-slate-400 py-10">No hay productos en el menú.</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;