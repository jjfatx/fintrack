import React, { useState, useEffect } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  PlusCircle, 
  Trash2, 
  TrendingUp, 
  Calendar, 
  Tag, 
  DollarSign, 
  Layers 
} from 'lucide-react';

// Componentes de Ícones SVG puros (compatibilidade total e leve)
function GithubIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

function LinkedinIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.64 1.64 0 1 0 0-3.28 1.64 1.64 0 0 0 0 3.28m1.4 9.74v-8.37H5.06v8.37h2.8z" />
    </svg>
  );
}

export default function App() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [summary, setSummary] = useState({ total_income: 0, total_expense: 0, balance: 0 });
  const [loading, setLoading] = useState(true);

  // Formulário de Nova Transação
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Carregar Dados da API
  const fetchData = async () => {
    try {
      const [transRes, catRes, sumRes] = await Promise.all([
        fetch('/api/transactions'),
        fetch('/api/categories'),
        fetch('/api/summary')
      ]);

      if (transRes.ok) setTransactions(await transRes.json());
      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData);
        if (catData.length > 0 && !categoryId) {
          setCategoryId(catData[0].id);
        }
      }
      if (sumRes.ok) setSummary(await sumRes.json());
    } catch (err) {
      console.error('Erro ao buscar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Enviar Nova Transação
  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!title || !amount || !date) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          amount: parseFloat(amount),
          type,
          category_id: categoryId ? parseInt(categoryId) : null,
          date
        })
      });

      if (res.ok) {
        setTitle('');
        setAmount('');
        fetchData();
      }
    } catch (err) {
      console.error('Erro ao adicionar transação:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Excluir Transação
  const handleDeleteTransaction = async (id) => {
    try {
      const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error('Erro ao excluir transação:', err);
    }
  };

  // Formatação em Real (BRL)
  const formatMoney = (val) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Cabeçalho */}
        <header className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-600 rounded-lg text-white">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">FinTrack</h1>
              <span className="text-xs bg-indigo-950 text-indigo-400 border border-indigo-800 px-2 py-0.5 rounded-full font-medium">
                Postgres + Neon Realtime
              </span>
            </div>
            <p className="text-slate-400 text-sm mt-1">Gestão Financeira Pessoal Inteligente</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Links para Perfil do Desenvolvedor */}
            <a
              href="https://github.com/jjfatx"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 hover:text-white rounded-xl transition-all shadow-sm"
              title="Acessar GitHub de Adriel"
            >
              <GithubIcon className="w-4 h-4 text-indigo-400" />
              <span>GitHub</span>
            </a>

            <a
              href="https://www.linkedin.com/in/adriel-d-654285287/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-blue-950/40 border border-slate-800 hover:border-blue-800 text-xs text-slate-300 hover:text-blue-300 rounded-xl transition-all shadow-sm"
              title="Acessar LinkedIn de Adriel"
            >
              <LinkedinIcon className="w-4 h-4 text-blue-400" />
              <span>LinkedIn</span>
            </a>

            <div className="text-xs text-slate-400 bg-slate-900/80 border border-slate-800 px-3 py-2 rounded-xl flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="hidden sm:inline">Nuvem Conectada</span>
            </div>
          </div>
        </header>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Saldo Atual */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-400">Saldo Atual</span>
              <div className="p-2 bg-slate-800 rounded-xl text-indigo-400">
                <Wallet className="w-5 h-5" />
              </div>
            </div>
            <div className={`text-3xl font-extrabold mt-3 tracking-tight ${summary.balance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatMoney(summary.balance)}
            </div>
            <p className="text-xs text-slate-500 mt-2">Balanço líquido total</p>
          </div>

          {/* Receitas */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-400">Total de Receitas</span>
              <div className="p-2 bg-emerald-950/60 border border-emerald-800/50 rounded-xl text-emerald-400">
                <ArrowUpRight className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-100 mt-3 tracking-tight">
              {formatMoney(summary.total_income)}
            </div>
            <p className="text-xs text-emerald-500/80 mt-2">Entradas registradas</p>
          </div>

          {/* Despesas */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-400">Total de Despesas</span>
              <div className="p-2 bg-rose-950/60 border border-rose-800/50 rounded-xl text-rose-400">
                <ArrowDownRight className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-100 mt-3 tracking-tight">
              {formatMoney(summary.total_expense)}
            </div>
            <p className="text-xs text-rose-500/80 mt-2">Saídas acumuladas</p>
          </div>
        </div>

        {/* Layout Principal: Formulário + Lista de Transações */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Formulário de Nova Transação */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 h-fit">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <PlusCircle className="w-5 h-5 text-indigo-400" />
              Nova Transação
            </h2>
            <form onSubmit={handleAddTransaction} className="space-y-4">
              {/* Tipo: Receita ou Despesa */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  className={`py-2 text-sm font-medium rounded-lg transition-all ${
                    type === 'expense'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Despesa
                </button>
                <button
                  type="button"
                  onClick={() => setType('income')}
                  className={`py-2 text-sm font-medium rounded-lg transition-all ${
                    type === 'income'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Receita
                </button>
              </div>

              {/* Título / Descrição */}
              <div>
                <label className="text-xs text-slate-400 block mb-1">Descrição</label>
                <input
                  type="text"
                  placeholder="Ex: Almoço, Salário, Internet"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                  required
                />
              </div>

              {/* Valor */}
              <div>
                <label className="text-xs text-slate-400 block mb-1">Valor (R$)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-500 text-sm">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Categoria & Data */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Categoria</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
                  >
                    {categories
                      .filter((c) => c.type === type)
                      .map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Data</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium py-2.5 rounded-xl transition-colors shadow-lg shadow-indigo-600/20 text-sm"
              >
                {isSubmitting ? 'Salvando...' : 'Adicionar Transação'}
              </button>
            </form>
          </div>

          {/* Extrato / Histórico de Transações */}
          <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-400" />
                Histórico de Transações
              </h2>
              <span className="text-xs text-slate-500">
                {transactions.length} registros
              </span>
            </div>

            {loading ? (
              <div className="py-12 text-center text-slate-500 text-sm">Carregando dados...</div>
            ) : transactions.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-sm border border-dashed border-slate-800 rounded-xl">
                Nenhuma transação registrada ainda. Comece adicionando uma no formulário ao lado!
              </div>
            ) : (
              <div className="divide-y divide-slate-800/60 overflow-hidden">
                {transactions.map((t) => (
                  <div key={t.id} className="py-3.5 flex items-center justify-between group hover:bg-slate-900/30 px-2 rounded-xl transition-colors">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-xl text-sm ${
                          t.type === 'income'
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                            : 'bg-rose-950/60 text-rose-400 border border-rose-800/40'
                        }`}
                      >
                        {t.type === 'income' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="font-medium text-sm text-slate-200">{t.title}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(t.date).toLocaleDateString('pt-BR')}
                          </span>
                          {t.category_name && (
                            <span 
                              className="px-2 py-0.2 rounded-full text-[10px] font-medium"
                              style={{ 
                                backgroundColor: `${t.category_color}20`,
                                color: t.category_color || '#A5B4FC'
                              }}
                            >
                              {t.category_name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className={`font-semibold text-sm ${t.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {t.type === 'income' ? '+' : '-'} {formatMoney(t.amount)}
                      </span>
                      <button
                        onClick={() => handleDeleteTransaction(t.id)}
                        className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition-all p-1.5 hover:bg-rose-500/10 rounded-lg"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Rodapé com Informações do Desenvolvedor */}
        <footer className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>
            Desenvolvido por <span className="text-slate-300 font-medium">Adriel Dias Severino</span> • FATEC ADS
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/jjfatx"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-indigo-400 transition-colors flex items-center gap-1"
            >
              <GithubIcon className="w-3.5 h-3.5" />
              github.com/jjfatx
            </a>
            <a
              href="https://www.linkedin.com/in/adriel-d-654285287/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-400 transition-colors flex items-center gap-1"
            >
              <LinkedinIcon className="w-3.5 h-3.5" />
              linkedin/in/adriel-d
            </a>
          </div>
        </footer>

      </div>
    </div>
  );
}
