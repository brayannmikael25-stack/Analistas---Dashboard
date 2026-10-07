// ==========================================
// CONTROL CONTABILIDADE - APLICAÇÃO SPA NATIVA v2.1
// ==========================================

// Dados iniciais base de empresas
const INITIAL_COMPANIES = [
  { id: 1, codigo: "001", grupo: "CONSTRUTORAS", nome: "ALFA ENGENHARIA E CONSTRUCOES LTDA", cnpj: "14.285.912/0001-44", classe: "A", regime: "Lucro Real Mensal", colaborador: "Brayann", segmento: "Construção Civil", fechamento: "2026-08" },
  { id: 2, codigo: "002", grupo: "ALIMENTOS", nome: "BETA DISTRIBUIDORA DE ALIMENTOS SA", cnpj: "23.491.018/0001-92", classe: "A", regime: "Lucro Real Trimestral", colaborador: "Brayann", segmento: "Comércio Atacadista", fechamento: "2026-08" },
  { id: 3, codigo: "003", grupo: "TRANSPORTES", nome: "GAMMA LOGISTICA E TRANSPORTES LTDA", cnpj: "08.771.234/0001-15", classe: "B", regime: "Lucro Real Mensal", colaborador: "Carlos", segmento: "Transportes", fechamento: "2026-07" },
  { id: 4, codigo: "004", grupo: "TECNOLOGIA", nome: "DELTA SERVICOS TECNOLOGICOS LTDA", cnpj: "31.902.441/0001-09", classe: "B", regime: "Lucro Real Trimestral", colaborador: "Mariana", segmento: "Tecnologia", fechamento: "2026-08" },
  { id: 5, codigo: "005", grupo: "METALURGIA", nome: "EPSILON INDUSTRIA METALURGICA SA", cnpj: "19.382.716/0001-50", classe: "A", regime: "Lucro Real Mensal", colaborador: "Brayann", segmento: "Indústria", fechamento: "2026-06" },
  { id: 6, codigo: "006", grupo: "SAUDE", nome: "ZETA FARMACEUTICA LTDA", cnpj: "05.123.987/0001-63", classe: "C", regime: "Lucro Presumido", colaborador: "Juliana", segmento: "Farmacêutico", fechamento: "2026-08" },
  { id: 7, codigo: "007", grupo: "VAREJO", nome: "THETA VAREJO E MODA LTDA", cnpj: "42.819.321/0001-77", classe: "C", regime: "Simples Nacional", colaborador: "Carlos", segmento: "Comércio Varejista", fechamento: "2026-05" },
  { id: 8, codigo: "008", grupo: "SAUDE", nome: "OMEGA CLINICA MEDICA INTEGRADA", cnpj: "27.654.321/0001-88", classe: "B", regime: "Lucro Real Trimestral", colaborador: "Mariana", segmento: "Saúde", fechamento: "2026-08" }
];

const INITIAL_USERS = [
  { id: 1, usuario: "brayann", email: "brayann@controlcontabilidade.com.br", senha: "bra@7288", nome: "Brayann Mikael" }
];

const INITIAL_TASKS = [
  { id: 1, titulo: "Conferir apuração de PIS/COFINS Alfa Engenharia", descricao: "Validar notas de entrada de materiais e créditos extemporâneos.", data: "2026-10-02", urgencia: "Alta", concluida: false },
  { id: 2, titulo: "Emitir DARF IRPJ Trimestral Beta Distribuidora", descricao: "Verificar se cliente optou por Quota Única ou 3 Parcelas.", data: "2026-10-05", urgencia: "Alta", concluida: false },
  { id: 3, titulo: "Solicitar extratos bancários pendentes Delta Tecnologia", descricao: "Contatar financeiro para conciliação da conta Santander.", data: "2026-10-10", urgencia: "Media", concluida: false },
  { id: 4, titulo: "Reunião de alinhamento com a diretoria", descricao: "Apresentação dos indicadores do fechamento do 3º trimestre.", data: "2026-10-15", urgencia: "Baixa", concluida: false }
];

const MONTH_COMPETENCIES = [];
for (const yr of [2026, 2027]) {
  const startM = yr === 2026 ? 8 : 1;
  for (let m = startM; m <= 12; m++) {
    MONTH_COMPETENCIES.push(`${m.toString().padStart(2, '0')}/${yr}`);
  }
}

const QUARTERS = [
  "1º Trim 2026", "2º Trim 2026", "3º Trim 2026", "4º Trim 2026",
  "1º Trim 2027", "2º Trim 2027", "3º Trim 2027", "4º Trim 2027"
];

// ---------------- NORMALIZAÇÃO DE REGIME E CLASSE (IMPORTAÇÃO E FILTROS) ----------------
function normalizeRegime(raw) {
  if (!raw) return 'Lucro Real Mensal';
  const s = raw.toString().trim().toLowerCase();
  if (s.includes('trimestral') || s.includes('trim')) {
    return 'Lucro Real Trimestral';
  }
  if (s.includes('mensal')) {
    return 'Lucro Real Mensal';
  }
  if (s.includes('presumido')) {
    return 'Lucro Presumido';
  }
  if (s.includes('simples')) {
    return 'Simples Nacional';
  }
  if (s.includes('real')) {
    return 'Lucro Real Mensal';
  }
  return raw.toString().trim();
}

function normalizeClasse(raw) {
  if (!raw) return 'A';
  const s = raw.toString().trim().toUpperCase();
  const match = s.match(/[A-E]/);
  return match ? match[0] : 'A';
}

// ---------------- REGRAS DE COMPETÊNCIA AUTOMÁTICA (CALENDÁRIO) ----------------
// Apuração Mensal: Mês corrente cobra mês anterior (Mês - 1). Ex: Outubro (10) cobra Setembro (09).
// Apuração Trimestral: Entregue no mês imediatamente subsequente ao encerramento do trimestre:
// 1º Trimestre -> Entregue em Abril (Mês 4)
// 2º Trimestre -> Entregue em Julho (Mês 7)
// 3º Trimestre -> Entregue em Outubro (Mês 10)
// 4º Trimestre -> Entregue em Janeiro do ano seguinte (Mês 1)
function getAutoCompetencies(refDate = new Date()) {
  const currentYear = refDate.getFullYear();
  const currentMonth = refDate.getMonth() + 1; // 1 a 12

  // Competência Mensal = Mês - 1
  let mensYear = currentYear;
  let mensMonth = currentMonth - 1;
  if (mensMonth === 0) {
    mensMonth = 12;
    mensYear = currentYear - 1;
  }
  const defaultMonthlyComp = `${mensMonth.toString().padStart(2, '0')}/${mensYear}`;
  const defaultFechamento = `${mensYear}-${mensMonth.toString().padStart(2, '0')}`;

  // Competência Trimestral vigente de cobrança/entrega
  let trimStr = '3º Trim 2026';
  if (currentMonth >= 4 && currentMonth < 7) {
    trimStr = `1º Trim ${currentYear}`;
  } else if (currentMonth >= 7 && currentMonth < 10) {
    trimStr = `2º Trim ${currentYear}`;
  } else if (currentMonth >= 10) {
    trimStr = `3º Trim ${currentYear}`;
  } else {
    // Mês 1, 2 ou 3: entrega o 4º Trimestre do ano anterior
    trimStr = `4º Trim ${currentYear - 1}`;
  }

  return {
    currentYear,
    currentMonth,
    monthlyComp: defaultMonthlyComp,
    fechamento: defaultFechamento,
    quarterComp: trimStr
  };
}

const autoComp = getAutoCompetencies();

// Estado Global da Aplicação
const state = {
  user: localStorage.getItem('control_auth_user') || null,
  authMode: 'login', // 'login' ou 'register'
  users: JSON.parse(localStorage.getItem('control_users') || 'null') || INITIAL_USERS,
  theme: (() => {
    const saved = localStorage.getItem('control_theme');
    if (saved === 'dark') return 'midnight';
    if (saved === 'light') return 'corporate';
    if (saved && ['midnight', 'corporate', 'emerald', 'ocean', 'sunset', 'cyberpunk', 'nordic', 'forest'].includes(saved)) return saved;
    return 'midnight';
  })(),
  activeTab: 'dashboard',
  globalSearch: '',
  isNotificationOpen: false,
  selPisComp: autoComp.monthlyComp,
  selTrim: autoComp.quarterComp,
  selIrpjMes: autoComp.monthlyComp,
  fechamentoFilter: 'all',
  taskFilter: 'ativas',
  customLogo: localStorage.getItem('control_custom_logo') || null,
  companies: (() => {
    const raw = JSON.parse(localStorage.getItem('control_companies') || 'null') || INITIAL_COMPANIES;
    return raw.map(c => ({
      ...c,
      regime: normalizeRegime(c.regime),
      classe: normalizeClasse(c.classe)
    }));
  })(),
  tasks: JSON.parse(localStorage.getItem('control_tasks') || 'null') || INITIAL_TASKS,
  pisCofinsData: JSON.parse(localStorage.getItem('control_piscofins') || '{}'),
  irpjTrimData: JSON.parse(localStorage.getItem('control_irpj_trim') || '{}'),
  irpjMensalData: JSON.parse(localStorage.getItem('control_irpj_mensal') || '{}'),
  modal: { isOpen: false, mode: 'create', company: null },
  // Filtros dedicados da tela de CRUD de Empresas
  crudFilters: {
    responsavel: 'todos',
    regime: 'todos',
    classe: 'todos',
    grupo: 'todos',
    segmento: 'todos'
  },
  // Filtro Rápido Global por Analista ("Meu Painel")
  selectedAnalista: 'todos',
  // Seleção Múltipla para Ações em Massa (Batch Actions)
  selectedPisIds: [],
  selectedMensalIds: [],
  selectedTrimIds: [],
  // URL do Backend / API de sincronização (configurável pelo usuário)
  backendUrl: localStorage.getItem('control_backend_url') || '',
  syncStatus: 'idle', // 'idle' | 'syncing' | 'saved' | 'error'
  lastSyncTime: localStorage.getItem('control_last_sync') || null,
  charts: {}
};

// Obter pacote consolidado de todos os dados do sistema
function getFullDataPackage() {
  return {
    version: '2.2',
    timestamp: new Date().toISOString(),
    user: state.user,
    users: state.users,
    companies: state.companies,
    tasks: state.tasks,
    pisCofinsData: state.pisCofinsData,
    irpjTrimData: state.irpjTrimData,
    irpjMensalData: state.irpjMensalData,
    customLogo: state.customLogo
  };
}

// Salvar no localStorage e sincronizar automaticamente com backend se configurado
function saveStorage() {
  localStorage.setItem('control_users', JSON.stringify(state.users));
  localStorage.setItem('control_companies', JSON.stringify(state.companies));
  localStorage.setItem('control_tasks', JSON.stringify(state.tasks));
  localStorage.setItem('control_piscofins', JSON.stringify(state.pisCofinsData));
  localStorage.setItem('control_irpj_trim', JSON.stringify(state.irpjTrimData));
  localStorage.setItem('control_irpj_mensal', JSON.stringify(state.irpjMensalData));

  // Sincronização automática com backend se configurado
  if (state.backendUrl) {
    syncToBackend();
  }
}

// Enviar dados para o Backend / API do servidor
async function syncToBackend(showFeedback = false) {
  if (!state.backendUrl) return;
  try {
    state.syncStatus = 'syncing';
    updateSyncIndicator();
    const dataPkg = getFullDataPackage();
    const res = await fetch(state.backendUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataPkg)
    });
    if (res.ok) {
      state.syncStatus = 'saved';
      state.lastSyncTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      localStorage.setItem('control_last_sync', state.lastSyncTime);
      if (showFeedback) alert('Dados sincronizados com o servidor com sucesso!');
    } else {
      state.syncStatus = 'error';
      if (showFeedback) alert('Erro ao sincronizar com o servidor: Status ' + res.status);
    }
  } catch (err) {
    state.syncStatus = 'error';
    if (showFeedback) alert('Erro de conexão com o servidor/backend: ' + err.message);
  } finally {
    updateSyncIndicator();
  }
}

// Carregar dados remotos do Backend
async function pullFromBackend() {
  if (!state.backendUrl) return;
  try {
    state.syncStatus = 'syncing';
    updateSyncIndicator();
    const res = await fetch(state.backendUrl);
    if (res.ok) {
      const data = await res.json();
      if (data && (data.companies || data.users)) {
        applyDataPackage(data);
        state.syncStatus = 'saved';
        state.lastSyncTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        localStorage.setItem('control_last_sync', state.lastSyncTime);
        render();
        alert('Dados atualizados do servidor com sucesso!');
      }
    } else {
      state.syncStatus = 'error';
      updateSyncIndicator();
    }
  } catch (err) {
    state.syncStatus = 'error';
    updateSyncIndicator();
  }
}

// Aplicar pacote de dados completo (importação/sync)
function applyDataPackage(data) {
  if (data.users && Array.isArray(data.users)) state.users = data.users;
  if (data.companies && Array.isArray(data.companies)) {
    state.companies = data.companies.map(c => ({
      ...c,
      regime: normalizeRegime(c.regime),
      classe: normalizeClasse(c.classe)
    }));
  }
  if (data.tasks && Array.isArray(data.tasks)) state.tasks = data.tasks;
  if (data.pisCofinsData) state.pisCofinsData = data.pisCofinsData;
  if (data.irpjTrimData) state.irpjTrimData = data.irpjTrimData;
  if (data.irpjMensalData) state.irpjMensalData = data.irpjMensalData;
  if (data.customLogo) {
    state.customLogo = data.customLogo;
    localStorage.setItem('control_custom_logo', data.customLogo);
  }
  saveStorage();
}

function updateSyncIndicator() {
  const el = document.getElementById('sync-indicator');
  if (!el) return;
  if (state.syncStatus === 'syncing') {
    el.innerHTML = '<span class="inline-block animate-spin">🔄</span> <span class="hidden sm:inline">Salvando...</span>';
    el.className = 'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30';
  } else if (state.syncStatus === 'saved') {
    el.innerHTML = `<span>☁️</span> <span class="hidden sm:inline">Salvo ${state.lastSyncTime ? '(' + state.lastSyncTime + ')' : ''}</span>`;
    el.className = 'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30';
  } else if (state.syncStatus === 'error') {
    el.innerHTML = '<span>⚠️</span> <span class="hidden sm:inline">Offline / Local</span>';
    el.className = 'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30';
  } else {
    el.innerHTML = state.backendUrl ? '<span>☁️</span> <span class="hidden sm:inline">Nuvem Conectada</span>' : '<span>💾</span> <span class="hidden sm:inline">Local</span>';
    el.className = 'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-gray-500/10 text-gray-400 border border-gray-500/30';
  }
}

function getFechamentoStatus(mesStr) {
  const current = getAutoCompetencies();
  if (!mesStr) return { status: 'critico', label: 'Sem Registro', color: 'red', css: 'bg-rose-500/10 text-rose-400 border border-rose-500/30' };
  const [fYear, fMonth] = mesStr.split('-').map(Number);
  const diff = (current.currentYear - fYear) * 12 + (current.currentMonth - fMonth);
  if (diff <= 1) {
    return { status: 'em_dia', label: `Em Dia (${current.monthlyComp})`, color: 'green', css: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' };
  } else if (diff <= 2) {
    return { status: 'atencao', label: '1 a 2 meses atraso', color: 'yellow', css: 'bg-amber-500/10 text-amber-400 border border-amber-500/30' };
  } else {
    return { status: 'critico', label: 'Mais de 2 meses atraso', color: 'red', css: 'bg-rose-500/10 text-rose-400 border border-rose-500/30' };
  }
}

// ---------------- SISTEMA DE TEMAS E PALETAS PROFISSIONAIS ----------------
const THEMES = {
  'midnight': {
    id: 'midnight',
    name: 'Midnight Dark',
    desc: 'Escuro elegante com fundo grafite e acentos em azul corporativo',
    mode: 'dark',
    dotColor: '#4E75F8',
    vars: {
      '--bg-main': '#0E0F17',
      '--bg-sidebar': '#12131F',
      '--bg-card': '#171825',
      '--bg-card-hover': '#1B1C2B',
      '--bg-input': '#11121C',
      '--border-color': 'rgba(255, 255, 255, 0.07)',
      '--border-accent': '#4E75F8',
      '--text-main': '#F3F4F6',
      '--text-muted': '#94A3B8',
      '--text-sidebar': '#A0AEC0',
      '--primary-accent': '#4E75F8',
      '--primary-hover': '#3B60E4',
      '--chart-text': '#94A3B8',
      '--chart-grid': 'rgba(255, 255, 255, 0.06)'
    },
    charts: {
      primary: '#4E75F8',
      primaryHover: '#3B60E4',
      success: '#2EB886',
      warning: '#E2A03F',
      danger: '#D9534F',
      palette: ['#4E75F8', '#38BDF8', '#34D399', '#A78BFA', '#F472B6', '#FBBF24'],
      classes: ['#4E75F8', '#38BDF8', '#A78BFA', '#F472B6', '#64748B']
    }
  },
  'corporate': {
    id: 'corporate',
    name: 'Clean Corporate',
    desc: 'Claro profissional com fundo cinza suave e cartões brancos puros',
    mode: 'light',
    dotColor: '#2563EB',
    vars: {
      '--bg-main': '#F4F5F8',
      '--bg-sidebar': '#1E293B',
      '--bg-card': '#FFFFFF',
      '--bg-card-hover': '#FAFAFC',
      '--bg-input': '#F1F5F9',
      '--border-color': 'rgba(226, 232, 240, 0.8)',
      '--border-accent': '#2563EB',
      '--text-main': '#1E293B',
      '--text-muted': '#64748B',
      '--text-sidebar': '#CBD5E1',
      '--primary-accent': '#2563EB',
      '--primary-hover': '#1D4ED8',
      '--chart-text': '#64748B',
      '--chart-grid': 'rgba(0, 0, 0, 0.06)'
    },
    charts: {
      primary: '#2563EB',
      primaryHover: '#1D4ED8',
      success: '#10B981',
      warning: '#F59E0B',
      danger: '#EF4444',
      palette: ['#2563EB', '#0EA5E9', '#10B981', '#8B5CF6', '#EC4899', '#F59E0B'],
      classes: ['#2563EB', '#0EA5E9', '#8B5CF6', '#F59E0B', '#64748B']
    }
  },
  'emerald': {
    id: 'emerald',
    name: 'Emerald Business',
    desc: 'Foco contábil e financeiro com toques em verde esmeralda e menta',
    mode: 'dark',
    dotColor: '#10B981',
    vars: {
      '--bg-main': '#0A1412',
      '--bg-sidebar': '#0F1E1B',
      '--bg-card': '#132420',
      '--bg-card-hover': '#172C27',
      '--bg-input': '#0B1715',
      '--border-color': 'rgba(16, 185, 129, 0.15)',
      '--border-accent': '#10B981',
      '--text-main': '#ECFDF5',
      '--text-muted': '#86EFAC',
      '--text-sidebar': '#A7F3D0',
      '--primary-accent': '#10B981',
      '--primary-hover': '#059669',
      '--chart-text': '#86EFAC',
      '--chart-grid': 'rgba(16, 185, 129, 0.08)'
    },
    charts: {
      primary: '#10B981',
      primaryHover: '#059669',
      success: '#34D399',
      warning: '#FBBF24',
      danger: '#F87171',
      palette: ['#10B981', '#14B8A6', '#06B6D4', '#3B82F6', '#6366F1', '#A3E635'],
      classes: ['#10B981', '#14B8A6', '#06B6D4', '#3B82F6', '#64748B']
    }
  },
  'ocean': {
    id: 'ocean',
    name: 'Deep Ocean',
    desc: 'Tons de azul meia-noite e ciano suave para um visual analítico',
    mode: 'dark',
    dotColor: '#06B6D4',
    vars: {
      '--bg-main': '#0B132B',
      '--bg-sidebar': '#1C2541',
      '--bg-card': '#141E3C',
      '--bg-card-hover': '#19264D',
      '--bg-input': '#0D1735',
      '--border-color': 'rgba(56, 189, 248, 0.15)',
      '--border-accent': '#06B6D4',
      '--text-main': '#F0F9FF',
      '--text-muted': '#7DD3FC',
      '--text-sidebar': '#BAE6FD',
      '--primary-accent': '#06B6D4',
      '--primary-hover': '#0891B2',
      '--chart-text': '#7DD3FC',
      '--chart-grid': 'rgba(56, 189, 248, 0.08)'
    },
    charts: {
      primary: '#06B6D4',
      primaryHover: '#0891B2',
      success: '#10B981',
      warning: '#F59E0B',
      danger: '#F43F5E',
      palette: ['#06B6D4', '#38BDF8', '#60A5FA', '#818CF8', '#A78BFA', '#2DD4BF'],
      classes: ['#06B6D4', '#38BDF8', '#60A5FA', '#818CF8', '#64748B']
    }
  },
  'sunset': {
    id: 'sunset',
    name: 'Sunset Warm',
    desc: 'Quente e sofisticado com laranjas suaves, bordôs discretos e tons terrosos',
    mode: 'dark',
    dotColor: '#F97316',
    vars: {
      '--bg-main': '#171113',
      '--bg-sidebar': '#21151A',
      '--bg-card': '#261920',
      '--bg-card-hover': '#2E1E26',
      '--bg-input': '#1A1116',
      '--border-color': 'rgba(249, 115, 22, 0.15)',
      '--border-accent': '#F97316',
      '--text-main': '#FFF1F2',
      '--text-muted': '#FDA4AF',
      '--text-sidebar': '#FECDD3',
      '--primary-accent': '#F97316',
      '--primary-hover': '#EA580C',
      '--chart-text': '#FDA4AF',
      '--chart-grid': 'rgba(249, 115, 22, 0.08)'
    },
    charts: {
      primary: '#F97316',
      primaryHover: '#EA580C',
      success: '#10B981',
      warning: '#F59E0B',
      danger: '#DB2777',
      palette: ['#F97316', '#EA580C', '#9A3412', '#DB2777', '#475569'],
      classes: ['#F97316', '#EA580C', '#DB2777', '#A855F7', '#64748B']
    }
  },
  'cyberpunk': {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    desc: 'Moderno e futurista com tons de roxo vibrante, rosa choque e ciano elétrico',
    mode: 'dark',
    dotColor: '#8B5CF6',
    vars: {
      '--bg-main': '#0A0A16',
      '--bg-sidebar': '#110E26',
      '--bg-card': '#161233',
      '--bg-card-hover': '#1D1745',
      '--bg-input': '#0E0B21',
      '--border-color': 'rgba(139, 92, 246, 0.22)',
      '--border-accent': '#8B5CF6',
      '--text-main': '#F5F3FF',
      '--text-muted': '#C4B5FD',
      '--text-sidebar': '#DDD6FE',
      '--primary-accent': '#8B5CF6',
      '--primary-hover': '#7C3AED',
      '--chart-text': '#C4B5FD',
      '--chart-grid': 'rgba(139, 92, 246, 0.1)'
    },
    charts: {
      primary: '#8B5CF6',
      primaryHover: '#7C3AED',
      success: '#10B981',
      warning: '#F59E0B',
      danger: '#EC4899',
      palette: ['#8B5CF6', '#EC4899', '#06B6D4', '#10B981', '#312E81'],
      classes: ['#8B5CF6', '#EC4899', '#06B6D4', '#10B981', '#F59E0B']
    }
  },
  'nordic': {
    id: 'nordic',
    name: 'Nordic Minimal',
    desc: 'Clean e escandinavo com pastéis frios, cinzas elegantes e azuis leves',
    mode: 'light',
    dotColor: '#64748B',
    vars: {
      '--bg-main': '#F1F5F9',
      '--bg-sidebar': '#1E293B',
      '--bg-card': '#FFFFFF',
      '--bg-card-hover': '#F8FAFC',
      '--bg-input': '#E2E8F0',
      '--border-color': 'rgba(148, 163, 184, 0.4)',
      '--border-accent': '#38BDF8',
      '--text-main': '#0F172A',
      '--text-muted': '#64748B',
      '--text-sidebar': '#E2E8F0',
      '--primary-accent': '#38BDF8',
      '--primary-hover': '#0284C7',
      '--chart-text': '#64748B',
      '--chart-grid': 'rgba(100, 116, 139, 0.08)'
    },
    charts: {
      primary: '#38BDF8',
      primaryHover: '#0284C7',
      success: '#10B981',
      warning: '#F59E0B',
      danger: '#F43F5E',
      palette: ['#64748B', '#38BDF8', '#94A3B8', '#CBD5E1', '#0F172A'],
      classes: ['#38BDF8', '#60A5FA', '#94A3B8', '#CBD5E1', '#64748B']
    }
  },
  'forest': {
    id: 'forest',
    name: 'Forest Mint',
    desc: 'Verde natureza refrescante com musgo, menta e foco em produtividade',
    mode: 'dark',
    dotColor: '#059669',
    vars: {
      '--bg-main': '#061712',
      '--bg-sidebar': '#09231B',
      '--bg-card': '#0E2E23',
      '--bg-card-hover': '#133D30',
      '--bg-input': '#071C16',
      '--border-color': 'rgba(16, 185, 129, 0.18)',
      '--border-accent': '#059669',
      '--text-main': '#ECFDF5',
      '--text-muted': '#6EE7B7',
      '--text-sidebar': '#A7F3D0',
      '--primary-accent': '#059669',
      '--primary-hover': '#047857',
      '--chart-text': '#6EE7B7',
      '--chart-grid': 'rgba(16, 185, 129, 0.08)'
    },
    charts: {
      primary: '#059669',
      primaryHover: '#047857',
      success: '#34D399',
      warning: '#FBBF24',
      danger: '#F87171',
      palette: ['#059669', '#10B981', '#34D399', '#6EE7B7', '#064E3B'],
      classes: ['#059669', '#10B981', '#34D399', '#6EE7B7', '#64748B']
    }
  }
};

function getCurrentTheme() {
  return THEMES[state.theme] || THEMES['midnight'];
}

// ---------------- INJEÇÃO DE ESTILOS DO DESIGN SYSTEM (PANZE REFERENCE) ----------------
function injectDesignSystemStyles() {
  let styleEl = document.getElementById('panze-design-system-styles');
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'panze-design-system-styles';
    document.head.appendChild(styleEl);
  }

  // Gera as CSS variables para cada tema
  let cssThemes = '';
  Object.values(THEMES).forEach(t => {
    cssThemes += `
      html[data-theme="${t.id}"] {
        ${Object.entries(t.vars).map(([k, v]) => `${k}: ${v};`).join('\n        ')}
      }
    `;
  });

  styleEl.innerHTML = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
    
    ${cssThemes}

    * {
      font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    }
    
    /* Fundo geral e texto guiados por CSS Custom Properties */
    body {
      background-color: var(--bg-main) !important;
      color: var(--text-main) !important;
      overflow-x: hidden;
      transition: background-color 0.3s ease, color 0.3s ease;
    }

    /* Cartões Flutuantes baseados em variáveis de tema */
    .panze-card {
      background-color: var(--bg-card) !important;
      border-radius: 20px;
      padding: 24px;
      border: 1px solid var(--border-color) !important;
      box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.15), 0 2px 8px -1px rgba(0, 0, 0, 0.08);
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .panze-card:hover {
      box-shadow: 0 10px 25px -4px rgba(0, 0, 0, 0.2), 0 4px 12px -2px rgba(0, 0, 0, 0.12);
    }

    /* Barra Lateral baseada em variáveis de tema */
    .panze-sidebar {
      background-color: var(--bg-sidebar) !important;
      color: var(--text-sidebar) !important;
      width: 260px;
      min-width: 260px;
      transition: width 0.3s ease, background-color 0.3s ease;
      border-right: 1px solid var(--border-color) !important;
    }

    .panze-nav-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 12px 18px;
      border-radius: 12px;
      font-size: 13.5px;
      font-weight: 500;
      color: var(--text-sidebar) !important;
      transition: all 0.2s ease;
      cursor: pointer;
      user-select: none;
      margin-bottom: 4px;
    }

    .panze-nav-item:hover {
      color: #FFFFFF !important;
      background: rgba(255, 255, 255, 0.08);
    }

    .panze-nav-item.active {
      color: #FFFFFF !important;
      background: rgba(255, 255, 255, 0.12) !important;
      border-left: 3px solid var(--border-accent);
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
      font-weight: 700;
    }

    .panze-nav-item .nav-icon {
      font-size: 16px;
      width: 22px;
      text-align: center;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .panze-chevron {
      opacity: 0.4;
      font-size: 12px;
      transition: opacity 0.2s ease, transform 0.2s ease;
    }

    .panze-nav-item:hover .panze-chevron,
    .panze-nav-item.active .panze-chevron {
      opacity: 0.9;
    }

    /* Topbar limpa */
    .panze-topbar {
      background-color: var(--bg-card) !important;
      border-bottom: 1px solid var(--border-color) !important;
      transition: background-color 0.3s ease, border-color 0.3s ease;
    }

    /* Custom scrollbar suave */
    ::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    ::-webkit-scrollbar-track {
      background: transparent;
    }
    ::-webkit-scrollbar-thumb {
      background: rgba(140, 150, 170, 0.25);
      border-radius: 9999px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: rgba(140, 150, 170, 0.45);
    }
    /* Estilos de Impressão Executiva (PDF) */
    @media print {
      body { background: #FFFFFF !important; color: #000000 !important; }
      .panze-sidebar, .panze-topbar, button, select, input, label[for], #sync-indicator, .no-print {
        display: none !important;
      }
      .panze-card {
        border: 1px solid #E2E8F0 !important;
        box-shadow: none !important;
        background: #FFFFFF !important;
        page-break-inside: avoid;
        margin-bottom: 16px;
      }
      #main-content {
        padding: 0 !important;
        margin: 0 !important;
        width: 100% !important;
      }
    }
  `;
}
injectDesignSystemStyles();

// ---------------- HELPERS: SEMÁFORO DE PRAZOS, WHATSAPP E RELATÓRIO ----------------
function getDeadlineBadge(diaVencimento = 25) {
  const now = new Date();
  const currentDay = now.getDate();
  const daysLeft = diaVencimento - currentDay;

  if (daysLeft < 0) {
    return `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-500 border border-rose-500/30 animate-pulse">
      🚨 Vencido (Dia ${diaVencimento})
    </span>`;
  } else if (daysLeft <= 3) {
    return `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30">
      ⚠️ Vence em ${daysLeft === 0 ? 'HOJE' : daysLeft + ' dias'}
    </span>`;
  } else {
    return `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
      ⏳ ${daysLeft} dias restantes
    </span>`;
  }
}

function openWhatsAppMessage(empresaNome, tributoTipo, competencia) {
  const mensagem = `Olá, equipe da *${empresaNome}*!%0A%0AInformamos que a apuração contábil/fiscal de *${tributoTipo}* referente à competência *${competencia}* foi concluída pela *Control Contabilidade*.%0A%0A📄 A guia DARF correspondente está disponível para liquidação.%0AQualquer dúvida estamos à inteira disposição!%0A%0A_Atenciosamente,_%0A*Equipe Control Contabilidade*`;
  window.open(`https://api.whatsapp.com/send?text=${mensagem}`, '_blank');
}

function triggerExecutiveReport() {
  window.print();
}

// ---------------- EXIBIÇÃO: NOME EM NEGRITO E GRUPO LOGO ABAIXO NORMAL ----------------
function renderCompanyCell(c) {
  const grupo = c.grupo && c.grupo !== '-' ? c.grupo : '';
  const subInfo = grupo ? `${grupo}${c.cnpj ? ' • ' + c.cnpj : ''}` : (c.cnpj || '');
  return `
    <div>
      <div class="font-bold text-gray-900 dark:text-white leading-tight">${c.nome}</div>
      ${subInfo ? `<div class="text-xs text-gray-500 dark:text-gray-400 font-normal mt-0.5 tracking-wide">${subInfo}</div>` : ''}
    </div>
  `;
}

// ---------------- ESTILIZAÇÃO POR CORES: REGIMES TRIBUTÁRIOS ----------------
function getRegimeBadge(regime) {
  if (!regime) return '<span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-500/10 text-gray-400 border border-gray-500/30">-</span>';
  const r = regime.toLowerCase();

  // Simples Nacional: Verde
  if (r.includes('simples')) {
    return `<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 dark:text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/10">
      <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
      ${regime}
    </span>`;
  }

  // Lucro Presumido: Laranja / Amarelo
  if (r.includes('presumido')) {
    return `<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-500 dark:text-amber-400 border border-amber-500/40 shadow-sm shadow-amber-500/10">
      <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
      ${regime}
    </span>`;
  }

  // Lucro Real (Mensal ou Trimestral): Azul com destaque
  if (r.includes('real')) {
    const isTrim = r.includes('trimestral');
    return `<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
      isTrim 
        ? 'bg-blue-500/15 text-blue-400 dark:text-blue-300 border border-blue-500/40 shadow-sm shadow-blue-500/10' 
        : 'bg-cyan-500/15 text-cyan-400 dark:text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10'
    }">
      <span class="w-1.5 h-1.5 rounded-full ${isTrim ? 'bg-blue-400' : 'bg-cyan-400'}"></span>
      ${regime}
    </span>`;
  }

  // Padrão Neutro
  return `<span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-500/10 text-gray-400 border border-gray-500/30">${regime}</span>`;
}

// Renderização fiel da Logomarca Oficial da Control Contabilidade (Imagem 1)
function renderLogo(heightClass = "h-10") {
  if (state.customLogo) {
    return `<img src="${state.customLogo}" alt="Control Contabilidade" class="${heightClass} object-contain" />`;
  }
  return `
    <div class="inline-flex items-center select-none" style="line-height: 1;">
      <svg class="${heightClass} w-auto" viewBox="0 0 540 130" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" style="display: block; max-height: 100%;">
        <!-- Símbolo C e Checkmark -->
        <g id="symbol">
          <!-- Anel Circular C (Azul Marinho #0D3B66) -->
          <path d="M 65 5 
                   A 60 60 0 1 0 107.4 107.4 
                   L 93.3 93.3 
                   A 40 40 0 1 1 65 25 
                   A 40 40 0 0 1 93.3 36.7 
                   L 107.4 22.6 
                   A 60 60 0 0 0 65 5 Z" 
                fill="#0D3B66" />
          
          <!-- Checkmark Laranja (#F58220) cortando o arco superior -->
          <path d="M 38 65 
                   L 68 95 
                   L 115 22 
                   L 98 12 
                   L 68 72 
                   L 52 53 Z" 
                fill="#F58220" />
        </g>

        <!-- Tipografia "control" -->
        <g id="brand-control">
          <!-- Letra c -->
          <path d="M 195 48 C 190 42 182 39 171 39 C 153 39 140 52 140 71 C 140 90 153 103 171 103 C 182 103 190 100 195 94 L 186 85 C 182 89 177 91 171 91 C 160 91 152 83 152 71 C 152 59 160 51 171 51 C 177 51 182 53 186 57 Z" fill="#0D3B66" />
          
          <!-- Letra o -->
          <path d="M 235 39 C 217 39 204 52 204 71 C 204 90 217 103 235 103 C 253 103 266 90 266 71 C 266 52 253 39 235 39 Z M 235 51 C 246 51 254 59 254 71 C 254 83 246 91 235 91 C 224 91 216 83 216 71 C 216 59 224 51 235 51 Z" fill="#0D3B66" />

          <!-- Letra n -->
          <path d="M 276 41 L 276 101 L 288 101 L 288 66 C 288 56 295 51 304 51 C 313 51 318 56 318 66 L 318 101 L 330 101 L 330 63 C 330 49 321 40 307 40 C 298 40 291 44 286 51 L 286 41 Z" fill="#0D3B66" />

          <!-- Letra t -->
          <path d="M 352 25 L 340 25 L 340 41 L 332 41 L 332 52 L 340 52 L 340 85 C 340 96 345 102 357 102 C 361 102 365 101 368 99 L 365 88 C 363 89 360 90 358 90 C 354 90 352 87 352 82 L 352 52 L 367 52 L 367 41 L 352 41 Z" fill="#0D3B66" />

          <!-- Letra r -->
          <path d="M 377 41 L 377 101 L 389 101 L 389 68 C 389 56 397 51 408 52 L 408 40 C 398 40 392 45 387 52 L 387 41 Z" fill="#0D3B66" />

          <!-- Letra o -->
          <path d="M 440 39 C 422 39 409 52 409 71 C 409 90 422 103 440 103 C 458 103 471 90 471 71 C 471 52 458 39 440 39 Z M 440 51 C 451 51 459 59 459 71 C 459 83 451 91 440 91 C 429 91 421 83 421 71 C 421 59 429 51 440 51 Z" fill="#0D3B66" />

          <!-- Letra l -->
          <path d="M 482 12 L 482 101 L 494 101 L 494 12 Z" fill="#0D3B66" />
        </g>

        <!-- Subtítulo "C O N T A B I L I D A D E" -->
        <g id="brand-subtitle" fill="#F58220" font-family="'Rethink Sans', 'Montserrat', Arial, sans-serif" font-weight="700" font-size="16" letter-spacing="0.48em">
          <text x="142" y="125">CONTABILIDADE</text>
        </g>
      </svg>
    </div>
  `;
}

// Renderizador Principal da SPA
function render() {
  const root = document.getElementById('app');
  if (!root) return;

  const curTheme = getCurrentTheme();

  // Sincronizar tema no elemento <html> via data-theme e classes dark/light
  document.documentElement.setAttribute('data-theme', curTheme.id);
  if (curTheme.mode === 'dark') {
    document.documentElement.classList.add('dark');
    document.body.className = "text-gray-100 antialiased selection:bg-[#ECBD56] selection:text-gray-950";
  } else {
    document.documentElement.classList.remove('dark');
    document.body.className = "text-gray-800 antialiased selection:bg-[#ECBD56] selection:text-gray-950";
  }

  // Se não autenticado -> Exibir Tela de Login ou Cadastro
  if (!state.user) {
    renderAuthScreen(root);
    return;
  }

  // Filtragem de empresas por busca global e por Analista ("Meu Painel")
  const filtered = state.companies.filter(c => {
    if (state.selectedAnalista !== 'todos' && c.colaborador !== state.selectedAnalista) return false;
    if (!state.globalSearch.trim()) return true;
    const q = state.globalSearch.toLowerCase();
    return (c.nome && c.nome.toLowerCase().includes(q)) ||
           (c.cnpj && c.cnpj.includes(q)) ||
           (c.codigo && c.codigo.toString().toLowerCase().includes(q)) ||
           (c.grupo && c.grupo.toLowerCase().includes(q));
  });

  const pendingTasksCount = state.tasks.filter(t => !t.concluida).length;

  root.innerHTML = `
    <div class="min-h-screen flex text-gray-800 dark:text-gray-100" style="background-color: var(--bg-main);">
      
      <!-- SIDEBAR LATERAL (ESTILO PANZE STUDIO COM VARIÁVEIS DE TEMA) -->
      <aside class="panze-sidebar hidden md:flex flex-col justify-between py-6 px-4 shrink-0 sticky top-0 h-screen select-none">
        <div>
          <!-- Marca / Logo no Topo da Sidebar -->
          <div class="px-3 mb-8 flex items-center justify-between cursor-pointer group" title="Control Contabilidade">
            <div class="flex items-center gap-2.5">
              <div class="w-9 h-9 rounded-xl bg-[#1E2032] flex items-center justify-center border border-white/10 shadow-inner">
                <span class="text-lg">⚡</span>
              </div>
              <div>
                <div class="text-white font-bold text-sm tracking-tight leading-tight flex items-center gap-1.5">
                  <span>Control</span>
                  <span class="text-[10px] font-semibold text-[#ECBD56] uppercase tracking-wider bg-[#ECBD56]/15 px-1.5 py-0.5 rounded">Pro</span>
                </div>
                <div class="text-[10px] text-gray-400 font-medium">Gestão Contábil</div>
              </div>
            </div>
            <label class="cursor-pointer text-gray-500 hover:text-white p-1 rounded-lg transition" title="Alterar Logomarca">
              ⚙️
              <input type="file" id="logo-input" accept="image/*" class="hidden" />
            </label>
          </div>

          <!-- Menu de Navegação Vertical (Itens estilo Panze) -->
          <nav class="space-y-1">
            <div class="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-gray-500">Menu Principal</div>
            ${[
              { id: 'dashboard', label: 'Dashboard', icon: '⊞' },
              { id: 'fechamentos', label: 'Fechamentos', icon: '📅' },
              { id: 'piscofins', label: 'PIS / COFINS', icon: '📄' },
              { id: 'irpj_trim', label: 'IRPJ Trimestral', icon: '📑' },
              { id: 'irpj_mensal', label: 'IRPJ Mensal', icon: '🧮' },
              { id: 'tarefas', label: 'Tarefas', icon: '✓', badge: pendingTasksCount },
              { id: 'empresas', label: 'Empresas', icon: '🏢', count: state.companies.length }
            ].map(tab => {
              const isActive = state.activeTab === tab.id;
              return `
                <div
                  data-tab="${tab.id}"
                  class="panze-nav-item tab-btn ${isActive ? 'active' : ''}"
                >
                  <div class="flex items-center gap-3">
                    <span class="nav-icon font-mono">${tab.icon}</span>
                    <span class="truncate">${tab.label}</span>
                  </div>
                  <div class="flex items-center gap-1.5">
                    ${tab.badge ? `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D94838] text-white">${tab.badge}</span>` : ''}
                    ${tab.count !== undefined ? `<span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/10 text-gray-300">${tab.count}</span>` : ''}
                    <span class="panze-chevron">›</span>
                  </div>
                </div>
              `;
            }).join('')}
          </nav>
        </div>

        <!-- Rodapé da Sidebar: Info de Persistência e Usuário -->
        <div class="pt-4 border-t border-gray-800/80 space-y-3">
          <!-- Nuvem / Sync Status -->
          <div class="px-3 py-2 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs">
            <div class="flex items-center gap-2">
              <span class="text-sm">${state.backendUrl ? '☁️' : '💾'}</span>
              <div class="text-[11px]">
                <div class="text-gray-200 font-medium">${state.backendUrl ? 'Nuvem Conectada' : 'Armazenamento Local'}</div>
                <div class="text-gray-500">${state.lastSyncTime ? 'Sync: ' + state.lastSyncTime : 'Dispositivo atual'}</div>
              </div>
            </div>
            <button id="config-sync-btn" class="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white transition" title="Configurar Servidor">
              ⚙️
            </button>
          </div>

          <!-- Perfil do Usuário Logado -->
          <div class="flex items-center justify-between px-2">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-[#E88A1A] to-[#ECBD56] text-gray-950 font-bold flex items-center justify-center text-xs shadow-md">
                ${state.user.charAt(0).toUpperCase()}
              </div>
              <div class="truncate max-w-[120px]">
                <div class="text-xs font-semibold text-white truncate leading-tight">${state.user}</div>
                <div class="text-[10px] text-gray-400">Contabilidade</div>
              </div>
            </div>
            <button id="logout-btn" class="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition" title="Sair do Sistema">
              🚪
            </button>
          </div>
        </div>
      </aside>

      <!-- ÁREA PRINCIPAL DIREITA (TOPBAR + CONTEÚDO) -->
      <div class="flex-1 flex flex-col min-w-0 min-h-screen">
        
        <!-- TOPBAR SUPERIOR MODERNA E LIMPA -->
        <header class="panze-topbar sticky top-0 z-30 px-6 py-4 flex items-center justify-between gap-4 backdrop-blur-md">
          
          <div class="flex items-center gap-4 flex-1 max-w-xl">
            <!-- Título do Contexto Atual -->
            <div class="hidden lg:block shrink-0">
              <h2 class="text-base font-bold text-gray-900 dark:text-white leading-tight">
                ${
                  state.activeTab === 'dashboard' ? 'Dashboard Overview' :
                  state.activeTab === 'fechamentos' ? 'Controle de Fechamentos' :
                  state.activeTab === 'piscofins' ? 'Apuração PIS / COFINS' :
                  state.activeTab === 'irpj_trim' ? 'IRPJ / CSLL Trimestral' :
                  state.activeTab === 'irpj_mensal' ? 'IRPJ / CSLL Mensal' :
                  state.activeTab === 'tarefas' ? 'Gestão de Tarefas' :
                  'Cadastro e Gestão de Empresas'
                }
              </h2>
              <p class="text-[11px] text-gray-400 font-medium">Control Contabilidade Integrada</p>
            </div>

            <!-- Barra de Busca Global Arredondada Estilo Panze -->
            <div class="relative flex-1">
              <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 text-sm">
                🔍
              </span>
              <input
                type="text"
                id="global-search-input"
                value="${state.globalSearch}"
                placeholder="Pesquisar empresas, CNPJ, código ou grupo..."
                class="w-full pl-9 pr-8 py-2 rounded-xl text-xs bg-[#F4F5F8] dark:bg-[#11121C] border border-gray-200/80 dark:border-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ECBD56]/40 transition shadow-inner"
              />
              ${state.globalSearch ? `
                <button id="clear-search-btn" class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-white text-xs">
                  ✕
                </button>
              ` : ''}
            </div>
          </div>

          <!-- Ações do Cabeçalho Superior -->
          <div class="flex items-center gap-2.5">
            <!-- Notificações -->
            <div class="relative">
              <button id="toggle-notif-btn" class="w-9 h-9 rounded-xl bg-[#F4F5F8] dark:bg-[#11121C] hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 relative flex items-center justify-center transition" title="Alertas de Vencimentos">
                <span class="text-sm">🔔</span>
                <span class="absolute top-2 right-2 w-2 h-2 bg-[#D94838] rounded-full animate-pulse"></span>
              </button>

              ${state.isNotificationOpen ? `
                <div class="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-[#15151A] border border-gray-200 dark:border-gray-800 shadow-2xl p-4 z-50">
                  <div class="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                    <h4 class="font-bold text-sm text-gray-900 dark:text-white">Central de Alertas</h4>
                    <span class="text-xs text-gray-400">2 alertas ativos</span>
                  </div>
                  <div class="mt-3 space-y-2.5 max-h-72 overflow-y-auto">
                    <div class="p-3 rounded-xl text-xs border bg-amber-500/10 border-amber-500/30 text-amber-500">
                      <div class="font-bold mb-1">⚠️ Prazo Padrão: Vencimento dia 25</div>
                      <div>Certifique-se de que os DARFs de PIS, COFINS e IRPJ/CSLL foram transmitidos até o dia 25.</div>
                    </div>
                    <div class="p-3 rounded-xl text-xs border bg-blue-500/10 border-blue-500/30 text-blue-500">
                      <div class="font-bold mb-1">ℹ️ Fechamento Mensal</div>
                      <div>Competência ideal de trabalho: Mês anterior (08/2026).</div>
                    </div>
                  </div>
                </div>
              ` : ''}
            </div>

            <!-- Seletor Visual de Temas / Paletas de Cores -->
            <div class="relative">
              <button id="theme-palette-btn" class="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/80 dark:bg-white/5 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-200 text-xs font-semibold hover:border-blue-500 transition shadow-xs" title="Selecionar Tema / Paleta de Cores">
                <span class="w-3 h-3 rounded-full" style="background-color: ${curTheme.dotColor};"></span>
                <span class="hidden sm:inline">${curTheme.name}</span>
                <span class="text-[10px] text-gray-400">▾</span>
              </button>

              <div id="theme-palette-dropdown" class="hidden absolute right-0 mt-2 w-80 rounded-2xl bg-white dark:bg-[#15151A] border border-gray-200 dark:border-gray-800 shadow-2xl p-2 z-50">
                <div class="px-3 py-2 border-b border-gray-100 dark:border-gray-800 text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Paletas de Cores</span>
                  <span class="text-[9px] lowercase font-semibold text-blue-500 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded-full">8 temas prontos</span>
                </div>
                
                <div class="py-1 space-y-1 max-h-[440px] overflow-y-auto pr-1">
                  ${Object.values(THEMES).map(t => {
                    const isSelected = state.theme === t.id;
                    return `
                      <button
                        onclick="setTheme('${t.id}')"
                        class="w-full text-left p-2.5 rounded-xl transition flex items-start gap-3 ${
                          isSelected ? 'bg-blue-50/80 dark:bg-blue-500/15 border border-blue-200 dark:border-blue-500/30' : 'hover:bg-gray-100 dark:hover:bg-white/5'
                        }"
                      >
                        <span class="w-3.5 h-3.5 rounded-full mt-0.5 shrink-0 shadow-xs" style="background-color: ${t.dotColor};"></span>
                        <div class="flex-1 min-w-0">
                          <div class="flex items-center justify-between">
                            <span class="font-bold text-xs text-gray-900 dark:text-white">${t.name}</span>
                            ${isSelected ? `<span class="text-xs text-blue-500 font-bold">✔</span>` : ''}
                          </div>
                          <p class="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1 leading-tight">${t.desc}</p>
                          <div class="flex items-center gap-1.5 mt-1.5">
                            ${t.charts.palette.map(c => `
                              <span class="w-3 h-3 rounded-full border border-black/10 dark:border-white/10" style="background-color: ${c};"></span>
                            `).join('')}
                          </div>
                        </div>
                      </button>
                    `;
                  }).join('')}
                </div>
              </div>
            </div>

            <!-- Dropdown Backup / Sincronização -->
            <div class="relative">
              <button id="backup-menu-btn" class="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-[#1E2032] border border-gray-200 dark:border-gray-700/80 text-gray-700 dark:text-gray-200 text-xs font-semibold hover:border-[#ECBD56] transition shadow-sm">
                <span>🔄</span>
                <span class="hidden sm:inline">Backup / Sync</span>
              </button>

              <div id="backup-dropdown" class="hidden absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-[#15151A] border border-gray-200 dark:border-gray-800 shadow-2xl p-2 z-50">
                <div class="px-3 py-2 border-b border-gray-100 dark:border-gray-800 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Sincronização & Backup
                </div>
                
                <button id="btn-export-backup-json" class="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#1C1C23] transition flex items-center gap-2">
                  <span>💾</span>
                  <div>
                    <div class="font-semibold">Exportar Backup Completo</div>
                    <div class="text-[10px] text-gray-400">Arquivo JSON com todas empresas e status</div>
                  </div>
                </button>

                <button id="btn-export-backup-csv" class="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#1C1C23] transition flex items-center gap-2">
                  <span>📊</span>
                  <div>
                    <div class="font-semibold">Exportar Empresas (Excel / CSV)</div>
                    <div class="text-[10px] text-gray-400">Tabela padrão com as 8 colunas</div>
                  </div>
                </button>

                <div class="my-1 border-t border-gray-100 dark:border-gray-800"></div>

                <label class="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#1C1C23] transition flex items-center gap-2 cursor-pointer">
                  <span>📥</span>
                  <div>
                    <div class="font-semibold">Importar Atualizações</div>
                    <div class="text-[10px] text-gray-400">Carregar backup gerado em outro PC</div>
                  </div>
                  <input type="file" id="universal-sync-file-input" accept=".json, .xlsx, .xls, .csv" class="hidden" />
                </label>

                ${state.backendUrl ? `
                  <div class="my-1 border-t border-gray-100 dark:border-gray-800"></div>
                  <button id="btn-force-sync" class="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-[#ECBD56] hover:bg-gray-100 dark:hover:bg-[#1C1C23] transition flex items-center gap-2">
                    <span>☁️</span>
                    <div>
                      <div>Sincronizar Nuvem Agora</div>
                      <div class="text-[10px] text-gray-400 font-normal">Enviar e receber do servidor</div>
                    </div>
                  </button>
                ` : ''}
              </div>
            </div>

            <!-- Botão de Cadastro Rápido de Empresa -->
            <button onclick="openCompanyModal('create')" class="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#12131F] to-[#1E2032] dark:from-[#ECBD56] dark:to-[#DEA93F] text-white dark:text-gray-950 font-bold text-xs shadow-md hover:opacity-95 transition">
              <span>+</span>
              <span>Nova Empresa</span>
            </button>
          </div>
        </header>

        <!-- NAVEGAÇÃO MOBILE (Para telas pequenas) -->
        <div class="md:hidden bg-[#12131F] px-4 py-2 border-b border-gray-800 flex items-center gap-2 overflow-x-auto">
          ${[
            { id: 'dashboard', label: 'Dashboard', icon: '⊞' },
            { id: 'fechamentos', label: 'Fechamentos', icon: '📅' },
            { id: 'piscofins', label: 'PIS/COFINS', icon: '📄' },
            { id: 'irpj_trim', label: 'IRPJ Trim', icon: '📑' },
            { id: 'irpj_mensal', label: 'IRPJ Mes', icon: '🧮' },
            { id: 'tarefas', label: 'Tarefas', icon: '✓' },
            { id: 'empresas', label: 'Empresas', icon: '🏢' }
          ].map(tab => `
            <button
              data-tab="${tab.id}"
              class="tab-btn px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                state.activeTab === tab.id ? 'bg-[#1E2032] text-white font-bold' : 'text-gray-400 hover:text-white'
              }"
            >
              <span>${tab.icon} ${tab.label}</span>
            </button>
          `).join('')}
        </div>

        <!-- CONTEÚDO PRINCIPAL (COM PADDING GENEROSO DE 24px E RESPIRO) -->
        <main class="flex-1 p-6 md:p-8 max-w-[1600px] w-full" id="main-content">
          ${renderActiveTab(filtered)}
        </main>

      </div>

      <!-- MODAL DE CRUD DE EMPRESA -->
      ${state.modal.isOpen ? renderCompanyModal() : ''}
    </div>
  `;

  attachEventHandlers();
  if (state.activeTab === 'dashboard') {
    setTimeout(() => {
      renderCharts(filtered);
    }, 20);
  }
}

// ----------------------------------------------------
// TELA DE AUTENTICAÇÃO: LOGIN OU REGISTRO DE CONTA
// ----------------------------------------------------
function renderAuthScreen(root) {
  const isLogin = state.authMode === 'login';

  root.innerHTML = `
    <div class="min-h-screen flex items-center justify-center p-4">
      <div class="w-full max-w-md p-8 rounded-3xl bg-white dark:bg-[#15151A] shadow-2xl border border-gray-200 dark:border-gray-800 relative overflow-hidden">
        <div class="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#133E68] via-[#E88A1A] to-[#133E68]"></div>
        
        <div class="flex flex-col items-center mb-6 mt-2">
          ${renderLogo("h-14")}
          <h2 class="mt-5 text-2xl font-extrabold text-gray-900 dark:text-white">
            ${isLogin ? 'Acesso Restrito' : 'Criar Nova Conta'}
          </h2>
          <p class="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
            Dashboard de Gestão e Controle Contábil
          </p>
        </div>

        <div id="auth-alert-container"></div>

        ${isLogin ? `
          <!-- Formulário de Login -->
          <form id="login-form" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Usuário ou E-mail</label>
              <input
                type="text"
                id="login-username"
                required
                placeholder="Seu usuário ou e-mail"
                class="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-[#1C1C23] border border-gray-200 dark:border-gray-700/60 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#ECBD56] transition"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Senha</label>
              <input
                type="password"
                id="login-password"
                required
                placeholder="••••••••"
                class="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-[#1C1C23] border border-gray-200 dark:border-gray-700/60 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#ECBD56] transition"
              />
            </div>

            <button
              type="submit"
              class="w-full py-3.5 px-6 rounded-full font-bold text-gray-950 bg-[#ECBD56] hover:bg-[#DEA93F] shadow-lg shadow-[#ECBD56]/20 transition flex items-center justify-center gap-2 mt-2"
            >
              <span>Entrar no Sistema</span>
            </button>
          </form>

          <div class="mt-6 pt-5 border-t border-gray-100 dark:border-gray-800 text-center flex flex-col gap-2">
            <p class="text-xs text-gray-400">Não tem uma conta cadastrada?</p>
            <button
              type="button"
              onclick="setAuthMode('register')"
              class="text-xs font-bold text-[#E88A1A] hover:underline"
            >
              Cadastre-se agora
            </button>
          </div>
        ` : `
          <!-- Formulário de Criação de Conta -->
          <form id="register-form" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Nome Completo</label>
              <input
                type="text"
                id="reg-fullname"
                required
                placeholder="Ex: Ana Silva"
                class="w-full px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-[#1C1C23] border border-gray-200 dark:border-gray-700/60 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#ECBD56] transition"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Nome de Usuário</label>
              <input
                type="text"
                id="reg-username"
                required
                placeholder="Ex: ana.silva"
                class="w-full px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-[#1C1C23] border border-gray-200 dark:border-gray-700/60 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#ECBD56] transition"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">E-mail Profissional</label>
              <input
                type="email"
                id="reg-email"
                required
                placeholder="ana@controlcontabilidade.com.br"
                class="w-full px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-[#1C1C23] border border-gray-200 dark:border-gray-700/60 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#ECBD56] transition"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Senha de Acesso</label>
              <input
                type="password"
                id="reg-password"
                required
                placeholder="Mínimo 6 caracteres"
                class="w-full px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-[#1C1C23] border border-gray-200 dark:border-gray-700/60 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#ECBD56] transition"
              />
            </div>

            <button
              type="submit"
              class="w-full py-3.5 px-6 rounded-full font-bold text-gray-950 bg-[#ECBD56] hover:bg-[#DEA93F] shadow-lg shadow-[#ECBD56]/20 transition flex items-center justify-center gap-2 mt-2"
            >
              <span>Finalizar Cadastro</span>
            </button>
          </form>

          <div class="mt-6 pt-5 border-t border-gray-100 dark:border-gray-800 text-center flex flex-col gap-2">
            <p class="text-xs text-gray-400">Já possui uma conta?</p>
            <button
              type="button"
              onclick="setAuthMode('login')"
              class="text-xs font-bold text-[#E88A1A] hover:underline"
            >
              Voltar para o Login
            </button>
          </div>
        `}

        <div class="mt-6 text-center">
          <span class="text-[11px] text-gray-500">Control Contabilidade &bull; Versão 2.1</span>
        </div>
      </div>
    </div>
  `;

  // Handler de Login
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const u = document.getElementById('login-username').value.trim().toLowerCase();
      const p = document.getElementById('login-password').value.trim();

      // Busca na lista de usuários cadastrados
      const found = state.users.find(usr => 
        (usr.usuario.toLowerCase() === u || (usr.email && usr.email.toLowerCase() === u)) && usr.senha === p
      );

      if (found) {
        state.user = found.usuario;
        localStorage.setItem('control_auth_user', found.usuario);
        render();
      } else {
        document.getElementById('auth-alert-container').innerHTML = `
          <div class="mb-4 p-3 rounded-xl text-xs font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/30">
            Usuário ou senha inválidos. Caso não tenha conta, clique em "Cadastre-se agora".
          </div>
        `;
      }
    });
  }

  // Handler de Registro
  const regForm = document.getElementById('register-form');
  if (regForm) {
    regForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nome = document.getElementById('reg-fullname').value.trim();
      const usuario = document.getElementById('reg-username').value.trim();
      const email = document.getElementById('reg-email').value.trim().toLowerCase();
      const senha = document.getElementById('reg-password').value.trim();

      // Validação de duplicidade
      if (state.users.some(u => u.usuario.toLowerCase() === usuario.toLowerCase() || u.email.toLowerCase() === email)) {
        document.getElementById('auth-alert-container').innerHTML = `
          <div class="mb-4 p-3 rounded-xl text-xs font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/30">
            Este usuário ou e-mail já está cadastrado. Tente outro.
          </div>
        `;
        return;
      }

      const newUser = { id: Date.now(), nome, usuario, email, senha };
      state.users.push(newUser);
      saveStorage();

      // Faz login automático com o novo usuário
      state.user = usuario;
      localStorage.setItem('control_auth_user', usuario);
      alert(`Conta criada com sucesso! Bem-vindo(a), ${nome}.`);
      render();
    });
  }
}

function renderActiveTab(filtered) {
  switch (state.activeTab) {
    case 'dashboard':
      return renderDashboardTab(filtered);
    case 'fechamentos':
      return renderFechamentosTab(filtered);
    case 'piscofins':
      return renderPisCofinsTab(filtered);
    case 'irpj_trim':
      return renderIrpjTrimTab(filtered);
    case 'irpj_mensal':
      return renderIrpjMensalTab(filtered);
    case 'tarefas':
      return renderTarefasTab();
    case 'empresas':
      return renderEmpresasTab(filtered);
    default:
      return '';
  }
}

// ---------------- DASHBOARD TAB ----------------
function renderDashboardTab(companies) {
  const currentComp = getAutoCompetencies();
  const realCompanies = companies.filter(c => {
    const r = normalizeRegime(c.regime);
    return r.includes('Lucro Real');
  });
  
  // PIS/COFINS (competência automática mensal: Mês - 1)
  let pendingPis = 0;
  let conclPis = 0;
  realCompanies.forEach(c => {
    const rec = state.pisCofinsData[`${c.id}_${state.selPisComp}`];
    if (!rec || rec.status === 'Pendente' || !rec.darfEnviado) {
      pendingPis++;
    } else {
      conclPis++;
    }
  });

  // IRPJ/CSLL Trimestral (competência trimestral automática)
  const trimCompanies = companies.filter(c => normalizeRegime(c.regime) === 'Lucro Real Trimestral');
  let pendingTrim = 0;
  let conclTrim = 0;
  trimCompanies.forEach(c => {
    const rec = state.irpjTrimData[`${c.id}_${state.selTrim}`];
    const isDone = rec && (rec.prejuizo || (rec.quotaUnica && rec.darfUnica) || (!rec.quotaUnica && rec.p1 && rec.p2 && rec.p3));
    if (isDone) {
      conclTrim++;
    } else {
      pendingTrim++;
    }
  });

  // IRPJ/CSLL Mensal (competência mensal automática)
  const mensalCompanies = companies.filter(c => normalizeRegime(c.regime) === 'Lucro Real Mensal');
  let pendingMensal = 0;
  let conclMensal = 0;
  mensalCompanies.forEach(c => {
    const rec = state.irpjMensalData[`${c.id}_${state.selIrpjMes}`];
    const isDone = rec && (rec.prejuizo || rec.status === 'Concluída');
    if (isDone) {
      conclMensal++;
    } else {
      pendingMensal++;
    }
  });

  let emDia = 0, atencao = 0, critico = 0;
  companies.forEach(c => {
    const s = getFechamentoStatus(c.fechamento).status;
    if (s === 'em_dia') emDia++;
    else if (s === 'atencao') atencao++;
    else critico++;
  });
  const tot = companies.length || 1;

  return `
    <div class="space-y-6">
      
      <!-- CABEÇALHO DO DASHBOARD COM ALINHAMENTO VERTICAL PERFEITO (TÍTULO, BUSCA E PERÍODOS) -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-gray-200/60 dark:border-gray-800/60">
        <!-- Título Principal -->
        <div class="shrink-0">
          <h1 class="text-xl md:text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-none">
            Painel Geral de Controle
          </h1>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Visão consolidada de fechamentos, impostos e produtividade
          </p>
        </div>

        <!-- Barra de Busca Perfeitamente Alinhada ao Centro -->
        <div class="flex-1 max-w-md mx-0 lg:mx-4">
          <div class="relative w-full">
            <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 text-sm">
              🔍
            </span>
            <input
              type="text"
              id="dash-search-input"
              value="${state.globalSearch}"
              placeholder="Filtrar dados do painel..."
              oninput="state.globalSearch = this.value; render(); const el = document.getElementById('dash-search-input'); if(el){ el.focus(); el.setSelectionRange(el.value.length, el.value.length); }"
              class="w-full pl-9 pr-8 py-2 rounded-xl text-xs bg-white dark:bg-[#15151A] border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition shadow-xs"
            />
            ${state.globalSearch ? `
              <button onclick="state.globalSearch = ''; render();" class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-white text-xs">
                ✕
              </button>
            ` : ''}
          </div>
        </div>

        <!-- Seletor de Analista ("Meu Painel") e Ações -->
        <div class="flex items-center gap-2 shrink-0">
          <!-- Filtro Rápido Meu Painel -->
          <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-[#1A1A22] border border-gray-200/80 dark:border-gray-800 shadow-xs">
            <span class="text-gray-400">👤 Analista:</span>
            <select
              onchange="state.selectedAnalista = this.value; render();"
              class="bg-transparent text-xs font-bold text-gray-900 dark:text-white focus:outline-none cursor-pointer"
            >
              <option value="todos" ${state.selectedAnalista === 'todos' ? 'selected' : ''} class="bg-[#15151A] text-white">Todos</option>
              ${Array.from(new Set(state.companies.map(c => c.colaborador).filter(Boolean))).sort().map(a => `
                <option value="${a}" ${state.selectedAnalista === a ? 'selected' : ''} class="bg-[#15151A] text-white">${a}</option>
              `).join('')}
            </select>
          </div>

          <!-- Botão Gerar Relatório Executivo -->
          <button
            onclick="triggerExecutiveReport()"
            class="px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition flex items-center gap-1.5"
            title="Gerar Relatório de Fechamento em PDF / Impressão para Diretoria"
          >
            <span>📄</span>
            <span class="hidden md:inline">Relatório Executivo</span>
          </button>
        </div>
      </div>

      <!-- 4 CARTÕES SUPERIORES DE INDICADORES COM BARRAS DE PROGRESSO E SEMÁFORO DE VENCIMENTO -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <!-- Card 1: PIS / COFINS -->
        <div onclick="switchTab('piscofins')" class="panze-card cursor-pointer group flex flex-col justify-between">
          <div>
            <div class="flex items-start justify-between">
              <div class="w-11 h-11 rounded-2xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center text-lg font-bold shadow-xs">
                📄
              </div>
              <span class="text-[11px] font-semibold text-blue-600 dark:text-blue-400 group-hover:underline transition flex items-center gap-1">
                Ver PIS/COFINS →
              </span>
            </div>
            <div class="mt-4">
              <div class="flex items-center justify-between">
                <span class="text-xs font-medium text-gray-500 dark:text-gray-400">Total DARFs Pendentes</span>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${conclPis === realCompanies.length && realCompanies.length > 0 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'}">
                  ${realCompanies.length ? Math.round((conclPis / realCompanies.length) * 100) : 0}% Concluído
                </span>
              </div>
              <div class="text-2xl font-extrabold text-gray-900 dark:text-white mt-1 tracking-tight">PIS / COFINS</div>
              <div class="flex items-baseline gap-2 mt-2">
                <span class="text-3xl font-black text-rose-500/90 dark:text-rose-400">${pendingPis}</span>
                <span class="text-xs text-gray-400 font-medium">de ${realCompanies.length} empresas</span>
              </div>
              
              <!-- Barra de Progresso Visual -->
              <div class="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden mt-3">
                <div class="bg-purple-500 h-full rounded-full transition-all duration-500" style="width: ${realCompanies.length ? Math.round((conclPis / realCompanies.length) * 100) : 0}%"></div>
              </div>
            </div>
          </div>
          <div class="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 text-[11px] text-gray-400 flex items-center justify-between">
            <span class="flex items-center gap-1">📅 Dia 25</span>
            ${getDeadlineBadge(25)}
          </div>
        </div>

        <!-- Card 2: IRPJ/CSLL Mensal -->
        <div onclick="switchTab('irpj_mensal')" class="panze-card cursor-pointer group flex flex-col justify-between">
          <div>
            <div class="flex items-start justify-between">
              <div class="w-11 h-11 rounded-2xl bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center text-lg font-bold shadow-xs">
                🧮
              </div>
              <span class="text-[11px] font-semibold text-blue-600 dark:text-blue-400 group-hover:underline transition flex items-center gap-1">
                Ver Mensal →
              </span>
            </div>
            <div class="mt-4">
              <div class="flex items-center justify-between">
                <span class="text-xs font-medium text-gray-500 dark:text-gray-400">Total DARFs Pendentes</span>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${conclMensal === mensalCompanies.length && mensalCompanies.length > 0 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-cyan-500/15 text-cyan-400'}">
                  ${mensalCompanies.length ? Math.round((conclMensal / mensalCompanies.length) * 100) : 0}% Concluído
                </span>
              </div>
              <div class="text-2xl font-extrabold text-gray-900 dark:text-white mt-1 tracking-tight">IRPJ Mensal</div>
              <div class="flex items-baseline gap-2 mt-2">
                <span class="text-3xl font-black text-rose-500/90 dark:text-rose-400">${pendingMensal}</span>
                <span class="text-xs text-gray-400 font-medium">de ${mensalCompanies.length} empresas</span>
              </div>
              
              <!-- Barra de Progresso Visual -->
              <div class="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden mt-3">
                <div class="bg-cyan-500 h-full rounded-full transition-all duration-500" style="width: ${mensalCompanies.length ? Math.round((conclMensal / mensalCompanies.length) * 100) : 0}%"></div>
              </div>
            </div>
          </div>
          <div class="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 text-[11px] text-gray-400 flex items-center justify-between">
            <span class="flex items-center gap-1">📅 Comp. ${currentComp.monthlyComp}</span>
            ${getDeadlineBadge(30)}
          </div>
        </div>

        <!-- Card 3: IRPJ/CSLL Trimestral -->
        <div onclick="switchTab('irpj_trim')" class="panze-card cursor-pointer group flex flex-col justify-between">
          <div>
            <div class="flex items-start justify-between">
              <div class="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-lg font-bold shadow-xs">
                📑
              </div>
              <span class="text-[11px] font-semibold text-blue-600 dark:text-blue-400 group-hover:underline transition flex items-center gap-1">
                Ver Trimestral →
              </span>
            </div>
            <div class="mt-4">
              <div class="flex items-center justify-between">
                <span class="text-xs font-medium text-gray-500 dark:text-gray-400">Total DARFs Pendentes</span>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${conclTrim === trimCompanies.length && trimCompanies.length > 0 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'}">
                  ${trimCompanies.length ? Math.round((conclTrim / trimCompanies.length) * 100) : 0}% Concluído
                </span>
              </div>
              <div class="text-2xl font-extrabold text-gray-900 dark:text-white mt-1 tracking-tight">IRPJ Trimestral</div>
              <div class="flex items-baseline gap-2 mt-2">
                <span class="text-3xl font-black text-rose-500/90 dark:text-rose-400">${pendingTrim}</span>
                <span class="text-xs text-gray-400 font-medium">de ${trimCompanies.length} empresas</span>
              </div>
              
              <!-- Barra de Progresso Visual -->
              <div class="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden mt-3">
                <div class="bg-amber-500 h-full rounded-full transition-all duration-500" style="width: ${trimCompanies.length ? Math.round((conclTrim / trimCompanies.length) * 100) : 0}%"></div>
              </div>
            </div>
          </div>
          <div class="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 text-[11px] text-gray-400 flex items-center justify-between">
            <span class="flex items-center gap-1">📅 ${currentComp.quarterComp}</span>
            ${getDeadlineBadge(31)}
          </div>
        </div>

        <!-- Card 4: Fechamentos Contábeis -->
        <div onclick="switchTab('fechamentos')" class="panze-card cursor-pointer group flex flex-col justify-between">
          <div>
            <div class="flex items-start justify-between">
              <div class="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-lg font-bold shadow-xs">
                📈
              </div>
              <span class="text-[11px] font-semibold text-blue-600 dark:text-blue-400 group-hover:underline transition flex items-center gap-1">
                Ver Fechamentos →
              </span>
            </div>
            <div class="mt-4">
              <div class="text-xs font-medium text-gray-500 dark:text-gray-400">Eficiência Geral</div>
              <div class="text-2xl font-extrabold text-gray-900 dark:text-white mt-1 tracking-tight">Fechamentos</div>
              <div class="flex items-center gap-3 mt-2">
                <div onclick="event.stopPropagation(); navigateToFechamentoFilter('em_dia')" class="cursor-pointer hover:opacity-80 transition p-1 -m-1 rounded-lg hover:bg-emerald-500/10" title="Ver empresas em dia">
                  <span class="text-xl font-black text-emerald-500">${Math.round((emDia/tot)*100)}%</span>
                  <span class="block text-[9px] uppercase font-bold text-gray-400">Em Dia</span>
                </div>
                <div class="w-px h-6 bg-gray-200 dark:bg-gray-800"></div>
                <div onclick="event.stopPropagation(); navigateToFechamentoFilter('atencao')" class="cursor-pointer hover:opacity-80 transition p-1 -m-1 rounded-lg hover:bg-amber-500/10" title="Ver empresas em atenção (1-2m)">
                  <span class="text-xl font-black text-amber-500">${Math.round((atencao/tot)*100)}%</span>
                  <span class="block text-[9px] uppercase font-bold text-gray-400">Atenção</span>
                </div>
                <div class="w-px h-6 bg-gray-200 dark:bg-gray-800"></div>
                <div onclick="event.stopPropagation(); navigateToFechamentoFilter('critico')" class="cursor-pointer hover:opacity-80 transition p-1 -m-1 rounded-lg hover:bg-rose-500/10" title="Ver empresas em estado crítico (>2m)">
                  <span class="text-xl font-black text-rose-500/90 dark:text-rose-400">${Math.round((critico/tot)*100)}%</span>
                  <span class="block text-[9px] uppercase font-bold text-gray-400">Crítico</span>
                </div>
              </div>

              <!-- Barra de Progresso Tripla -->
              <div class="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden mt-3 flex">
                <div class="bg-emerald-500 h-full transition-all duration-500" style="width: ${Math.round((emDia/tot)*100)}%"></div>
                <div class="bg-amber-500 h-full transition-all duration-500" style="width: ${Math.round((atencao/tot)*100)}%"></div>
                <div class="bg-rose-500 h-full transition-all duration-500" style="width: ${Math.round((critico/tot)*100)}%"></div>
              </div>
            </div>
          </div>
          <div class="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            ✓ ${companies.length} empresas monitoradas
          </div>
        </div>

      </div>

      <!-- SEÇÃO DE GRÁFICOS: GRADE SIMÉTRICA (2 CARTÕES DE DESTAQUE SUPERIOR + 2 COLUNAS HARMONIOSAS) -->
      
      <!-- Linha 1: Volume de Fechamento por Responsável (2/3) + Segmento de Mercado (1/3) -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="panze-card lg:col-span-2 flex flex-col justify-between">
          <div class="flex items-center justify-between mb-4">
            <div>
              <div class="flex items-center gap-2">
                <h3 class="font-bold text-sm md:text-base text-gray-900 dark:text-white">Empresas por Colaborador Responsável</h3>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">Interativo ↗</span>
              </div>
              <p class="text-xs text-gray-400 mt-0.5">Clique em qualquer barra para abrir as empresas atribuídas ao colaborador</p>
            </div>
            <button onclick="navigateToEmpresasFilter('responsavel', 'todos')" class="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200/50 dark:border-blue-500/20 hover:opacity-80 transition cursor-pointer">
              Ver Carteiras →
            </button>
          </div>
          <div class="h-64 relative w-full"><canvas id="chartColab"></canvas></div>
        </div>

        <div class="panze-card flex flex-col justify-between">
          <div class="flex items-center justify-between mb-4">
            <div>
              <div class="flex items-center gap-2">
                <h3 class="font-bold text-sm md:text-base text-gray-900 dark:text-white">Segmentos de Atuação</h3>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">Interativo ↗</span>
              </div>
              <p class="text-xs text-gray-400 mt-0.5">Clique em uma fatia para filtrar as empresas do segmento</p>
            </div>
          </div>
          <div class="h-64 relative w-full"><canvas id="chartSegment"></canvas></div>
        </div>
      </div>

      <!-- Linha 2: Status Fechamento (1/2) + Classificação por Classe (1/2) -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="panze-card flex flex-col justify-between">
          <div class="flex items-center justify-between mb-4">
            <div>
              <div class="flex items-center gap-2">
                <h3 class="font-bold text-sm md:text-base text-gray-900 dark:text-white">Status dos Fechamentos Mensais</h3>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Atalho ↗</span>
              </div>
              <p class="text-xs text-gray-400 mt-0.5">Clique em <em>Crítico</em>, <em>Atenção</em> ou <em>Em Dia</em> para abrir a lista filtrada</p>
            </div>
            <button onclick="navigateToTab('fechamentos')" class="text-xs font-semibold text-emerald-500 hover:underline cursor-pointer">Ideal: Mês Anterior →</button>
          </div>
          <div class="h-56 relative w-full"><canvas id="chartFechamento"></canvas></div>
        </div>

        <div class="panze-card flex flex-col justify-between">
          <div class="flex items-center justify-between mb-4">
            <div>
              <div class="flex items-center gap-2">
                <h3 class="font-bold text-sm md:text-base text-gray-900 dark:text-white">Classificação por Classe de Empresa</h3>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">Interativo ↗</span>
              </div>
              <p class="text-xs text-gray-400 mt-0.5">Clique em uma classe (A até E) para ver as empresas correspondentes</p>
            </div>
          </div>
          <div class="h-56 relative w-full"><canvas id="chartClass"></canvas></div>
        </div>
      </div>

      <!-- Linha 3: PIS/COFINS (1/3), IRPJ Mensal (1/3) e IRPJ Trimestral (1/3) - Perfeitamente Simétricos -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div class="panze-card flex flex-col justify-between cursor-pointer hover:border-purple-500/40 transition" onclick="navigateToTab('piscofins')" title="Clique para abrir apuração PIS / COFINS">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-1.5">
              <h3 class="font-bold text-sm text-gray-900 dark:text-white">PIS / COFINS</h3>
              <span class="text-[9px] font-bold text-purple-400">↗</span>
            </div>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400">
              ${state.selPisComp}
            </span>
          </div>
          <div class="h-48 relative w-full"><canvas id="chartPis"></canvas></div>
          <div class="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 text-center text-xs text-gray-500">
            <strong class="text-rose-500 font-bold">${pendingPis}</strong> pendentes &bull; <strong class="text-emerald-500 font-bold">${conclPis}</strong> concluídos
          </div>
        </div>

        <div class="panze-card flex flex-col justify-between cursor-pointer hover:border-cyan-500/40 transition" onclick="navigateToTab('irpj_mensal')" title="Clique para abrir apuração IRPJ / CSLL Mensal">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-1.5">
              <h3 class="font-bold text-sm text-gray-900 dark:text-white">IRPJ / CSLL Mensal</h3>
              <span class="text-[9px] font-bold text-cyan-400">↗</span>
            </div>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400">
              ${state.selIrpjMes}
            </span>
          </div>
          <div class="h-48 relative w-full"><canvas id="chartIrpjMensal"></canvas></div>
          <div class="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 text-center text-xs text-gray-500">
            <strong class="text-rose-500 font-bold">${pendingMensal}</strong> pendentes &bull; <strong class="text-emerald-500 font-bold">${conclMensal}</strong> concluídos
          </div>
        </div>

        <div class="panze-card flex flex-col justify-between cursor-pointer hover:border-amber-500/40 transition" onclick="navigateToTab('irpj_trim')" title="Clique para abrir apuração IRPJ / CSLL Trimestral">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-1.5">
              <h3 class="font-bold text-sm text-gray-900 dark:text-white">IRPJ / CSLL Trimestral</h3>
              <span class="text-[9px] font-bold text-amber-400">↗</span>
            </div>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
              ${state.selTrim}
            </span>
          </div>
          <div class="h-48 relative w-full"><canvas id="chartIrpjTrim"></canvas></div>
          <div class="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 text-center text-xs text-gray-500">
            <strong class="text-rose-500 font-bold">${pendingTrim}</strong> pendentes &bull; <strong class="text-emerald-500 font-bold">${conclTrim}</strong> concluídos
          </div>
        </div>

      </div>

      <!-- Linha 4: Índice de Tarefas da Equipe -->
      <div class="panze-card">
        <div class="flex items-center justify-between mb-4">
          <div>
            <div class="flex items-center gap-2">
              <h3 class="font-bold text-sm md:text-base text-gray-900 dark:text-white">Gestão e Produtividade em Tarefas</h3>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">Interativo ↗</span>
            </div>
            <p class="text-xs text-gray-400 mt-0.5">Clique nas barras ou no botão para ir direto às tarefas da equipe</p>
          </div>
          <button onclick="switchTab('tarefas')" class="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline transition">
            Ver Todas (${state.tasks.length}) →
          </button>
        </div>
        ${state.tasks.length === 0 ? `
          <div class="h-48 flex flex-col items-center justify-center text-center p-6 rounded-2xl bg-gray-50/50 dark:bg-white/[0.02] border border-dashed border-gray-200 dark:border-gray-800">
            <div class="w-12 h-12 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center text-xl font-bold mb-3 shadow-sm shadow-emerald-500/10">
              ✔
            </div>
            <div class="text-sm font-semibold text-gray-800 dark:text-gray-200">
              Tudo em dia! Nenhuma tarefa pendente no momento.
            </div>
            <p class="text-xs text-gray-400 mt-1 max-w-sm">
              Sua equipe contábil não possui pendências registradas para este ciclo.
            </p>
          </div>
        ` : `
          <div class="h-56 relative w-full"><canvas id="chartTasks"></canvas></div>
        `}
      </div>

    </div>
  `;
}

function renderCharts(companies) {
  Object.values(state.charts).forEach(c => { if (c) c.destroy(); });
  state.charts = {};

  const curTheme = getCurrentTheme();
  const textColor = curTheme.vars['--chart-text'];
  const gridColor = curTheme.vars['--chart-grid'];
  const isDark = curTheme.mode === 'dark';
  const cColors = curTheme.charts;

  // 1. Colaborador (Barras com cantos suaves arredondados e cor primária do tema)
  try {
    const colabMap = {};
    companies.forEach(c => { colabMap[c.colaborador || 'Outro'] = (colabMap[c.colaborador || 'Outro'] || 0) + 1; });
    const el1 = document.getElementById('chartColab');
    if (el1) {
      el1.style.cursor = 'pointer';
      state.charts.c1 = new Chart(el1, {
        type: 'bar',
        data: {
          labels: Object.keys(colabMap),
          datasets: [{
            label: 'Empresas Atribuídas',
            data: Object.values(colabMap),
            backgroundColor: cColors.primary,
            hoverBackgroundColor: cColors.primaryHover,
            borderRadius: 10,
            borderSkipped: false,
            barPercentage: 0.55
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          onClick: (evt, elements) => {
            if (elements && elements.length > 0) {
              const idx = elements[0].index;
              const colabNome = Object.keys(colabMap)[idx];
              if (colabNome) {
                navigateToEmpresasFilter('responsavel', colabNome);
              }
            }
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: isDark ? '#1E2032' : '#FFFFFF',
              titleColor: isDark ? '#FFFFFF' : '#1E293B',
              bodyColor: isDark ? '#E2E8F0' : '#475569',
              borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
              borderWidth: 1,
              padding: 12,
              cornerRadius: 10,
              titleFont: { weight: 'bold' },
              callbacks: {
                afterBody: () => '👉 Clique para filtrar empresas deste responsável'
              }
            }
          },
          scales: {
            x: { ticks: { color: textColor, font: { family: 'Rethink Sans', size: 12 } }, grid: { display: false } },
            y: { ticks: { color: textColor, precision: 0, font: { family: 'Rethink Sans' } }, grid: { color: gridColor, drawBorder: false } }
          }
        }
      });
    }
  } catch (err) {
    console.error('Erro chartColab:', err);
  }

  // 2. Segmento (Rosca com a paleta harmônica do tema selecionado)
  try {
    const segMap = {};
    companies.forEach(c => { segMap[c.segmento || 'Outros'] = (segMap[c.segmento || 'Outros'] || 0) + 1; });
    const el2 = document.getElementById('chartSegment');
    if (el2) {
      el2.style.cursor = 'pointer';
      state.charts.c2 = new Chart(el2, {
        type: 'doughnut',
        data: {
          labels: Object.keys(segMap),
          datasets: [{
            data: Object.values(segMap),
            backgroundColor: cColors.palette,
            borderWidth: 2,
            borderColor: isDark ? '#171825' : '#FFFFFF'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '70%',
          onClick: (evt, elements) => {
            if (elements && elements.length > 0) {
              const idx = elements[0].index;
              const segNome = Object.keys(segMap)[idx];
              if (segNome) {
                navigateToEmpresasFilter('segmento', segNome);
              }
            }
          },
          plugins: {
            legend: {
              position: 'right',
              labels: { color: textColor, boxWidth: 10, font: { family: 'Rethink Sans', size: 11, weight: '500' }, padding: 12 }
            },
            tooltip: {
              callbacks: {
                afterBody: () => '👉 Clique para filtrar empresas deste segmento'
              }
            }
          }
        }
      });
    }
  } catch (err) {
    console.error('Erro chartSegment:', err);
  }

  // 3. Status Fechamento (Verde sucesso, Âmbar atenção e Vermelho perigo do tema)
  try {
    let emDia = 0, atencao = 0, critico = 0;
    companies.forEach(c => {
      const s = getFechamentoStatus(c.fechamento).status;
      if (s === 'em_dia') emDia++;
      else if (s === 'atencao') atencao++;
      else critico++;
    });
    const el3 = document.getElementById('chartFechamento');
    if (el3) {
      el3.style.cursor = 'pointer';
      state.charts.c3 = new Chart(el3, {
        type: 'bar',
        data: {
          labels: ['Em Dia (Ideal)', 'Atenção (1-2m)', 'Crítico (>2m)'],
          datasets: [{
            data: [emDia, atencao, critico],
            backgroundColor: [cColors.success, cColors.warning, cColors.danger],
            borderRadius: 8,
            borderSkipped: false,
            barPercentage: 0.5
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          onClick: (evt, elements) => {
            if (elements && elements.length > 0) {
              const idx = elements[0].index;
              const statusKeys = ['em_dia', 'atencao', 'critico'];
              const chosen = statusKeys[idx];
              if (chosen) {
                navigateToFechamentoFilter(chosen);
              }
            }
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                afterBody: () => '👉 Clique para ver lista de fechamentos deste status'
              }
            }
          },
          scales: {
            x: { ticks: { color: textColor, font: { family: 'Rethink Sans', size: 11 } }, grid: { display: false } },
            y: { ticks: { color: textColor, precision: 0, font: { family: 'Rethink Sans' } }, grid: { color: gridColor, drawBorder: false } }
          }
        }
      });
    }
  } catch (err) {
    console.error('Erro chartFechamento:', err);
  }

  // 4. Classe (Doughnut com paleta de classes do tema: Classes A até E)
  try {
    const clsMap = { 'Classe A': 0, 'Classe B': 0, 'Classe C': 0, 'Classe D': 0, 'Classe E': 0 };
    companies.forEach(c => {
      const cl = normalizeClasse(c.classe);
      const key = `Classe ${cl}`;
      clsMap[key] = (clsMap[key] || 0) + 1;
    });
    const el4 = document.getElementById('chartClass');
    if (el4) {
      el4.style.cursor = 'pointer';
      state.charts.c4 = new Chart(el4, {
        type: 'doughnut',
        data: {
          labels: Object.keys(clsMap),
          datasets: [{
            data: Object.values(clsMap),
            backgroundColor: cColors.classes,
            borderWidth: 2,
            borderColor: isDark ? '#171825' : '#FFFFFF'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '68%',
          onClick: (evt, elements) => {
            if (elements && elements.length > 0) {
              const idx = elements[0].index;
              const label = Object.keys(clsMap)[idx]; // ex: "Classe A"
              const classLetter = label.replace('Classe ', '').trim();
              if (classLetter) {
                navigateToEmpresasFilter('classe', classLetter);
              }
            }
          },
          plugins: {
            legend: { position: 'right', labels: { color: textColor, boxWidth: 10, font: { family: 'Rethink Sans', size: 12 }, padding: 12 } },
            tooltip: {
              callbacks: {
                afterBody: () => '👉 Clique para filtrar empresas desta classe'
              }
            }
          }
        }
      });
    }
  } catch (err) {
    console.error('Erro chartClass:', err);
  }

  // 5. PIS/COFINS (competência dinâmica atual - Cores elegantes do tema)
  try {
    const realCos = companies.filter(c => normalizeRegime(c.regime).includes('Lucro Real'));
    let pendPis = 0;
    realCos.forEach(c => {
      const rec = state.pisCofinsData[`${c.id}_${state.selPisComp}`];
      if (!rec || rec.status === 'Pendente' || !rec.darfEnviado) pendPis++;
    });
    const el5 = document.getElementById('chartPis');
    if (el5) {
      el5.style.cursor = 'pointer';
      state.charts.c5 = new Chart(el5, {
        type: 'doughnut',
        data: {
          labels: ['Pendentes', 'Concluídos'],
          datasets: [{
            data: [pendPis, Math.max(0, realCos.length - pendPis)],
            backgroundColor: [cColors.danger, cColors.success],
            borderWidth: 2,
            borderColor: isDark ? '#171825' : '#FFFFFF'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '72%',
          onClick: () => {
            navigateToTab('piscofins');
          },
          plugins: {
            legend: { position: 'bottom', labels: { color: textColor, boxWidth: 10, font: { family: 'Rethink Sans', size: 11 } } },
            tooltip: {
              callbacks: {
                afterBody: () => '👉 Clique para abrir tela de PIS / COFINS'
              }
            }
          }
        }
      });
    }
  } catch (err) {
    console.error('Erro chartPis:', err);
  }

  // 6 & 7. IRPJ/CSLL: Apuração Mensal x Trimestral (Pendentes x Concluídos - Cores do tema)
  try {
    const trimCos = companies.filter(c => normalizeRegime(c.regime) === 'Lucro Real Trimestral');
    let pendTrim = 0;
    let conclTrim = 0;
    trimCos.forEach(c => {
      const rec = state.irpjTrimData[`${c.id}_${state.selTrim}`];
      const isDone = rec && (rec.prejuizo || (rec.quotaUnica && rec.darfUnica) || (!rec.quotaUnica && rec.p1 && rec.p2 && rec.p3));
      if (isDone) conclTrim++;
      else pendTrim++;
    });

    const mensalCos = companies.filter(c => normalizeRegime(c.regime) === 'Lucro Real Mensal');
    let pendMensal = 0;
    let conclMensal = 0;
    mensalCos.forEach(c => {
      const rec = state.irpjMensalData[`${c.id}_${state.selIrpjMes}`];
      const isDone = rec && (rec.prejuizo || rec.status === 'Concluída');
      if (isDone) conclMensal++;
      else pendMensal++;
    });

    // IRPJ/CSLL Mensal
    const el6Mensal = document.getElementById('chartIrpjMensal');
    if (el6Mensal) {
      el6Mensal.style.cursor = 'pointer';
      state.charts.c6_mensal = new Chart(el6Mensal, {
        type: 'doughnut',
        data: {
          labels: ['Pendentes', 'Concluídos'],
          datasets: [{
            data: [pendMensal, conclMensal],
            backgroundColor: [cColors.danger, cColors.success],
            borderWidth: 2,
            borderColor: isDark ? '#171825' : '#FFFFFF'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '72%',
          onClick: () => {
            navigateToTab('irpj_mensal');
          },
          plugins: {
            legend: { position: 'bottom', labels: { color: textColor, boxWidth: 10, font: { family: 'Rethink Sans', size: 11 } } },
            tooltip: {
              callbacks: {
                afterBody: () => '👉 Clique para abrir tela de IRPJ Mensal'
              }
            }
          }
        }
      });
    }

    // IRPJ/CSLL Trimestral
    const el6Trim = document.getElementById('chartIrpjTrim');
    if (el6Trim) {
      el6Trim.style.cursor = 'pointer';
      state.charts.c6_trim = new Chart(el6Trim, {
        type: 'doughnut',
        data: {
          labels: ['Pendentes', 'Concluídos'],
          datasets: [{
            data: [pendTrim, conclTrim],
            backgroundColor: [cColors.danger, cColors.success],
            borderWidth: 2,
            borderColor: isDark ? '#171825' : '#FFFFFF'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '72%',
          onClick: () => {
            navigateToTab('irpj_trim');
          },
          plugins: {
            legend: { position: 'bottom', labels: { color: textColor, boxWidth: 10, font: { family: 'Rethink Sans', size: 11 } } },
            tooltip: {
              callbacks: {
                afterBody: () => '👉 Clique para abrir tela de IRPJ Trimestral'
              }
            }
          }
        }
      });
    }
  } catch (err) {
    console.error('Erro charts IRPJ:', err);
  }

  // 8. Tarefas (Apenas renderiza se houver tarefas cadastradas)
  try {
    const abertas = state.tasks.filter(t => !t.concluida).length;
    const conc = state.tasks.filter(t => t.concluida).length;
    const el7 = document.getElementById('chartTasks');
    if (el7 && state.tasks.length > 0) {
      el7.style.cursor = 'pointer';
      state.charts.c7 = new Chart(el7, {
        type: 'bar',
        data: {
          labels: ['Pendências Ativas', 'Tarefas Concluídas'],
          datasets: [{
            label: 'Total de Tarefas',
            data: [abertas, conc],
            backgroundColor: [cColors.warning, cColors.success],
            borderRadius: 8,
            borderSkipped: false,
            barPercentage: 0.4
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          onClick: (evt, elements) => {
            if (elements && elements.length > 0) {
              const idx = elements[0].index;
              const filter = idx === 0 ? 'ativas' : 'concluidas';
              navigateToTab('tarefas', filter);
            }
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                afterBody: () => '👉 Clique para ir direto para as tarefas deste status'
              }
            }
          },
          scales: {
            x: { ticks: { color: textColor, precision: 0, font: { family: 'Rethink Sans' } }, grid: { color: gridColor, drawBorder: false } },
            y: { ticks: { color: textColor, font: { family: 'Rethink Sans', weight: 'bold' } }, grid: { display: false } }
          }
        }
      });
    }
  } catch (err) {
    console.error('Erro chartTasks:', err);
  }
}

// ---------------- FECHAMENTOS TAB ----------------
function renderFechamentosTab(companies) {
  const list = companies.filter(c => {
    if (state.fechamentoFilter === 'all') return true;
    return getFechamentoStatus(c.fechamento).status === state.fechamentoFilter;
  });

  const auto = getAutoCompetencies();

  return `
    <div class="space-y-6">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div>
          <h1 class="text-xl md:text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">Controle de Fechamentos Contábeis</h1>
          <p class="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-0.5">Competência ideal: mês anterior (${auto.monthlyComp}). Acompanhe o avanço contábil por empresa.</p>
        </div>

        <div class="flex items-center gap-1.5 bg-white dark:bg-[#171825] p-1.5 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-xs">
          ${[
            { id: 'all', label: 'Todas' },
            { id: 'em_dia', label: '🟢 Em Dia' },
            { id: 'atencao', label: '🟡 Atenção' },
            { id: 'critico', label: '🔴 Crítico' }
          ].map(f => `
            <button
              onclick="setFechamentoFilter('${f.id}')"
              class="px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${state.fechamentoFilter === f.id ? 'bg-[#12131F] dark:bg-[#ECBD56] text-white dark:text-gray-950 font-bold shadow-xs' : 'text-gray-500 hover:text-gray-800 dark:hover:text-white'}"
            >
              ${f.label}
            </button>
          `).join('')}
        </div>
      </div>

      ${state.fechamentoFilter !== 'all' ? `
        <div class="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-between text-xs text-blue-500 font-semibold animate-fadeIn">
          <div class="flex items-center gap-2">
            <span>⚡</span>
            <span>Exibindo apenas empresas com status <strong>${
              state.fechamentoFilter === 'critico' ? '🔴 Crítico (>2 meses)' :
              state.fechamentoFilter === 'atencao' ? '🟡 Atenção (1-2 meses)' :
              '🟢 Em Dia (Ideal)'
            }</strong> (${list.length} de ${companies.length} empresas)</span>
          </div>
          <button onclick="setFechamentoFilter('all')" class="underline hover:text-white text-xs font-bold">
            Ver Todas
          </button>
        </div>
      ` : ''}

      <div class="panze-card !p-0 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm border-collapse">
            <thead>
              <tr class="border-b border-gray-100 dark:border-gray-800/80 bg-gray-50/50 dark:bg-[#12131F]/50 text-gray-400 uppercase text-[11px] font-bold tracking-wider">
                <th class="py-4 px-6">Empresa & CNPJ</th>
                <th class="py-4 px-4">Regime</th>
                <th class="py-4 px-4">Responsável</th>
                <th class="py-4 px-4">Último Fechamento</th>
                <th class="py-4 px-4">Status</th>
                <th class="py-4 px-6 text-right">Ação</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-800/60">
            ${list.map(c => {
              const st = getFechamentoStatus(c.fechamento);
              return `
                <tr class="hover:bg-gray-50 dark:hover:bg-[#1C1C23]/40 transition">
                  <td class="py-4 px-6">
                    ${renderCompanyCell(c)}
                  </td>
                  <td class="py-4 px-4">${getRegimeBadge(c.regime)}</td>
                  <td class="py-4 px-4 text-xs font-medium text-gray-600 dark:text-gray-300">${c.colaborador}</td>
                  <td class="py-4 px-4">
                    <input
                      type="month"
                      value="${c.fechamento || auto.fechamento}"
                      onchange="updateCompanyFechamento(${c.id}, this.value)"
                      class="px-3 py-1.5 text-xs rounded-xl bg-gray-100 dark:bg-[#1C1C23] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#ECBD56]"
                    />
                  </td>
                  <td class="py-4 px-4">
                    <span class="px-3 py-1 rounded-full text-xs font-semibold ${st.css}">${st.label}</span>
                  </td>
                  <td class="py-4 px-6 text-right">
                    <button
                      onclick="updateCompanyFechamento(${c.id}, '${auto.fechamento}')"
                      class="px-3 py-1.5 rounded-full text-xs font-semibold bg-[#22AC77]/10 text-[#22AC77] hover:bg-[#22AC77]/20 border border-[#22AC77]/30 transition"
                    >
                      Avançar p/ ${auto.monthlyComp}
                    </button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// Funções de Ações em Massa (Batch Actions) PIS/COFINS
function toggleSelectAllPis(checked, listIds) {
  if (checked) {
    state.selectedPisIds = Array.from(new Set([...state.selectedPisIds, ...listIds]));
  } else {
    state.selectedPisIds = state.selectedPisIds.filter(id => !listIds.includes(id));
  }
  render();
}

function toggleSelectPisItem(id, checked) {
  if (checked) {
    if (!state.selectedPisIds.includes(id)) state.selectedPisIds.push(id);
  } else {
    state.selectedPisIds = state.selectedPisIds.filter(x => x !== id);
  }
  render();
}

function batchUpdatePisDarf(enviado) {
  if (!state.selectedPisIds.length) return alert('Selecione ao menos uma empresa.');
  state.selectedPisIds.forEach(id => {
    const key = `${id}_${state.selPisComp}`;
    state.pisCofinsData[key] = state.pisCofinsData[key] || { status: 'Pendente', darfEnviado: false };
    state.pisCofinsData[key].darfEnviado = enviado;
    if (enviado && state.pisCofinsData[key].status === 'Pendente') {
      state.pisCofinsData[key].status = 'Concluída';
    }
  });
  state.selectedPisIds = [];
  saveStorage();
  render();
}

function batchUpdatePisStatus(status) {
  if (!state.selectedPisIds.length) return alert('Selecione ao menos uma empresa.');
  state.selectedPisIds.forEach(id => {
    const key = `${id}_${state.selPisComp}`;
    state.pisCofinsData[key] = state.pisCofinsData[key] || { status: 'Pendente', darfEnviado: false };
    state.pisCofinsData[key].status = status;
    if (status === 'Concluída') state.pisCofinsData[key].darfEnviado = true;
  });
  state.selectedPisIds = [];
  saveStorage();
  render();
}

// ---------------- PIS / COFINS TAB ----------------
function renderPisCofinsTab(companies) {
  const realCos = companies.filter(c => normalizeRegime(c.regime).includes('Lucro Real'));
  const cosIds = realCos.map(c => c.id);
  const allSelected = cosIds.length > 0 && cosIds.every(id => state.selectedPisIds.includes(id));
  const someSelected = state.selectedPisIds.length > 0;

  return `
    <div class="space-y-6">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div>
          <h1 class="text-xl md:text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">Apuração PIS / COFINS (Mensal)</h1>
          <p class="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-0.5">Exclusivo para empresas do Regime de Lucro Real. Vencimento: dia 25.</p>
        </div>

        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2 bg-white dark:bg-[#171825] px-3.5 py-1.5 rounded-xl border border-gray-200/80 dark:border-gray-800 shadow-xs">
            <span class="text-xs font-semibold text-gray-400">Competência:</span>
            <select id="sel-pis-comp" onchange="setPisComp(this.value)" class="bg-transparent text-xs font-bold text-gray-900 dark:text-white focus:outline-none cursor-pointer">
              ${MONTH_COMPETENCIES.map(m => `<option value="${m}" ${state.selPisComp === m ? 'selected' : ''} class="bg-[#171825] text-white">${m}</option>`).join('')}
            </select>
          </div>

          <button onclick="resetPisMonth()" class="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-100 border border-rose-200 dark:border-rose-500/20 transition">
            Resetar Mês
          </button>
        </div>
      </div>

      <!-- Barra de Aviso com Semáforo de Vencimento -->
      <div class="p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-800 dark:text-amber-400 text-xs font-medium flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-2">
          <span class="text-base">⚠️</span>
          <span><strong>Atenção ao Prazo Legal:</strong> DARF deve ser transmitido e pago até o dia 25 do mês subsequente.</span>
        </div>
        <div>
          ${getDeadlineBadge(25)}
        </div>
      </div>

      <!-- BARRA DE AÇÕES EM MASSA (BATCH ACTIONS) -->
      ${someSelected ? `
        <div class="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex flex-wrap items-center justify-between gap-3 animate-fadeIn">
          <div class="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400">
            <span>✓</span>
            <span><strong>${state.selectedPisIds.length}</strong> empresa(s) selecionada(s)</span>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="batchUpdatePisDarf(true)" class="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-xs flex items-center gap-1">
              ✓ Marcar DARF Enviado (Lote)
            </button>
            <button onclick="batchUpdatePisStatus('Concluída')" class="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition shadow-xs">
              Marcar Concluídas
            </button>
            <button onclick="state.selectedPisIds = []; render();" class="px-3 py-1.5 rounded-xl text-xs font-medium text-gray-500 hover:text-gray-700 dark:hover:text-white transition">
              Desmarcar Todas
            </button>
          </div>
        </div>
      ` : ''}

      <div class="panze-card !p-0 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm border-collapse">
            <thead>
              <tr class="border-b border-gray-100 dark:border-gray-800/80 bg-gray-50/50 dark:bg-[#12131F]/50 text-gray-400 uppercase text-[11px] font-bold tracking-wider">
                <th class="py-4 px-4 w-10 text-center">
                  <input
                    type="checkbox"
                    ${allSelected ? 'checked' : ''}
                    onchange="toggleSelectAllPis(this.checked, ${JSON.stringify(cosIds)})"
                    class="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    title="Selecionar todas para ações em massa"
                  />
                </th>
                <th class="py-4 px-6">Empresa & CNPJ</th>
                <th class="py-4 px-4">Regime</th>
                <th class="py-4 px-4">Responsável</th>
                <th class="py-4 px-4">Situação</th>
                <th class="py-4 px-6 text-center">DARF Enviado?</th>
                <th class="py-4 px-4 text-center">Aviso</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-800/60">
              ${realCos.map(c => {
                const rec = state.pisCofinsData[`${c.id}_${state.selPisComp}`] || { status: 'Pendente', darfEnviado: false };
                const isSelected = state.selectedPisIds.includes(c.id);
                return `
                  <tr class="hover:bg-gray-50 dark:hover:bg-[#1C1C23]/40 transition ${isSelected ? 'bg-blue-50/40 dark:bg-blue-500/5' : ''}">
                    <td class="py-4 px-4 text-center">
                      <input
                        type="checkbox"
                        ${isSelected ? 'checked' : ''}
                        onchange="toggleSelectPisItem(${c.id}, this.checked)"
                        class="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>
                    <td class="py-4 px-6">
                      ${renderCompanyCell(c)}
                    </td>
                    <td class="py-4 px-4">${getRegimeBadge(c.regime)}</td>
                    <td class="py-4 px-4 text-xs font-medium text-gray-600 dark:text-gray-300">${c.colaborador}</td>
                    <td class="py-4 px-4">
                      <select
                        onchange="updatePisStatus(${c.id}, this.value)"
                        class="px-3 py-1.5 rounded-full text-xs font-bold border focus:outline-none transition cursor-pointer ${
                          rec.status === 'Concluída' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                          rec.status === 'Análise' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                          rec.status === 'Isenta' ? 'bg-purple-500/10 text-purple-400 border-purple-500/30' :
                          'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        }"
                      >
                        <option value="Pendente" ${rec.status === 'Pendente' ? 'selected' : ''} class="bg-[#15151A] text-white">🔴 Pendente</option>
                        <option value="Análise" ${rec.status === 'Análise' ? 'selected' : ''} class="bg-[#15151A] text-white">🟡 Análise</option>
                        <option value="Concluída" ${rec.status === 'Concluída' ? 'selected' : ''} class="bg-[#15151A] text-white">🟢 Concluída</option>
                        <option value="Isenta" ${rec.status === 'Isenta' ? 'selected' : ''} class="bg-[#15151A] text-white">🟣 Isenta</option>
                      </select>
                    </td>
                    <td class="py-4 px-6 text-center">
                      <label class="inline-flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          ${rec.darfEnviado ? 'checked' : ''}
                          onchange="togglePisDarf(${c.id}, this.checked)"
                          class="w-5 h-5 rounded-md text-[#ECBD56] focus:ring-[#ECBD56]"
                        />
                        <span class="text-xs font-semibold text-gray-300">${rec.darfEnviado ? 'Enviado' : 'Não enviado'}</span>
                      </label>
                    </td>
                    <td class="py-4 px-4 text-center">
                      <button
                        onclick="openWhatsAppMessage('${c.nome.replace(/'/g, "\\'")}', 'PIS/COFINS', '${state.selPisComp}')"
                        class="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 transition shadow-xs text-xs"
                        title="Enviar mensagem WhatsApp ao cliente"
                      >
                        💬 WhatsApp
                      </button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

// Funções de Ações em Massa (Batch Actions) IRPJ Trimestral
function toggleSelectAllTrim(checked, listIds) {
  if (checked) {
    state.selectedTrimIds = Array.from(new Set([...state.selectedTrimIds, ...listIds]));
  } else {
    state.selectedTrimIds = state.selectedTrimIds.filter(id => !listIds.includes(id));
  }
  render();
}

function toggleSelectTrimItem(id, checked) {
  if (checked) {
    if (!state.selectedTrimIds.includes(id)) state.selectedTrimIds.push(id);
  } else {
    state.selectedTrimIds = state.selectedTrimIds.filter(x => x !== id);
  }
  render();
}

function batchUpdateTrimDarf(darfPaga) {
  if (!state.selectedTrimIds.length) return alert('Selecione ao menos uma empresa.');
  state.selectedTrimIds.forEach(id => {
    const key = `${id}_${state.selTrim}`;
    state.irpjTrimData[key] = state.irpjTrimData[key] || { prejuizo: false, quotaUnica: true, darfUnica: false, p1: false, p2: false, p3: false };
    if (state.irpjTrimData[key].quotaUnica) {
      state.irpjTrimData[key].darfUnica = darfPaga;
    } else {
      state.irpjTrimData[key].p1 = darfPaga;
      state.irpjTrimData[key].p2 = darfPaga;
      state.irpjTrimData[key].p3 = darfPaga;
    }
  });
  state.selectedTrimIds = [];
  saveStorage();
  render();
}

// ---------------- IRPJ TRIMESTRAL TAB ----------------
function renderIrpjTrimTab(companies) {
  const trimCos = companies.filter(c => normalizeRegime(c.regime) === 'Lucro Real Trimestral');
  const trimIds = trimCos.map(c => c.id);
  const allTrimSelected = trimIds.length > 0 && trimIds.every(id => state.selectedTrimIds.includes(id));
  const someTrimSelected = state.selectedTrimIds.length > 0;

  return `
    <div class="space-y-6">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div>
          <h1 class="text-xl md:text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">IRPJ / CSLL - Lucro Real Trimestral</h1>
          <p class="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-0.5">Apuração trimestral com opções de Quota Única ou Parcelamento em 3 Quotas.</p>
        </div>

        <div class="flex items-center gap-2 bg-white dark:bg-[#171825] px-3.5 py-1.5 rounded-xl border border-gray-200/80 dark:border-gray-800 shadow-xs">
          <span class="text-xs font-semibold text-gray-400">Trimestre:</span>
          <select onchange="setTrim(this.value)" class="bg-transparent text-xs font-bold text-gray-900 dark:text-white focus:outline-none cursor-pointer">
            ${QUARTERS.map(q => `<option value="${q}" ${state.selTrim === q ? 'selected' : ''} class="bg-[#171825] text-white">${q}</option>`).join('')}
          </select>
        </div>
      </div>

      <!-- Barra de Aviso com Semáforo de Vencimento -->
      <div class="p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-800 dark:text-amber-400 text-xs font-medium flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-2">
          <span class="text-base">📅</span>
          <span><strong>Vencimento Trimestral:</strong> Transmissão e pagamento no último dia útil do mês subsequente ao trimestre.</span>
        </div>
        <div>
          ${getDeadlineBadge(31)}
        </div>
      </div>

      <!-- BARRA DE AÇÕES EM MASSA (BATCH ACTIONS) TRIMESTRAL -->
      ${someTrimSelected ? `
        <div class="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex flex-wrap items-center justify-between gap-3 animate-fadeIn">
          <div class="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400">
            <span>✓</span>
            <span><strong>${state.selectedTrimIds.length}</strong> empresa(s) selecionada(s)</span>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="batchUpdateTrimDarf(true)" class="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-xs flex items-center gap-1">
              ✓ Marcar Quotas/DARFs Pagas (Lote)
            </button>
            <button onclick="state.selectedTrimIds = []; render();" class="px-3 py-1.5 rounded-xl text-xs font-medium text-gray-500 hover:text-gray-700 dark:hover:text-white transition">
              Desmarcar Todas
            </button>
          </div>
        </div>
      ` : ''}

      <div class="panze-card !p-0 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm border-collapse">
            <thead>
              <tr class="border-b border-gray-100 dark:border-gray-800/80 bg-gray-50/50 dark:bg-[#12131F]/50 text-gray-400 uppercase text-[11px] font-bold tracking-wider">
                <th class="py-4 px-4 w-10 text-center">
                  <input
                    type="checkbox"
                    ${allTrimSelected ? 'checked' : ''}
                    onchange="toggleSelectAllTrim(this.checked, ${JSON.stringify(trimIds)})"
                    class="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    title="Selecionar todas para ações em massa"
                  />
                </th>
                <th class="py-4 px-6">Empresa & CNPJ</th>
                <th class="py-4 px-4">Responsável</th>
                <th class="py-4 px-4">Prejuízo Fiscal?</th>
                <th class="py-4 px-4">Modalidade de Pagamento</th>
                <th class="py-4 px-6 text-center">Status / DARFs</th>
                <th class="py-4 px-4 text-center">Aviso</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-800/60">
            ${trimCos.map(c => {
              const rec = state.irpjTrimData[`${c.id}_${state.selTrim}`] || { prejuizo: false, quotaUnica: true, darfUnica: false, p1: false, p2: false, p3: false };
              const isSelected = state.selectedTrimIds.includes(c.id);
              return `
                <tr class="hover:bg-gray-50 dark:hover:bg-[#1C1C23]/40 transition ${isSelected ? 'bg-blue-50/40 dark:bg-blue-500/5' : ''}">
                  <td class="py-4 px-4 text-center">
                    <input
                      type="checkbox"
                      ${isSelected ? 'checked' : ''}
                      onchange="toggleSelectTrimItem(${c.id}, this.checked)"
                      class="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </td>
                  <td class="py-4 px-6">
                    ${renderCompanyCell(c)}
                  </td>
                  <td class="py-4 px-4 text-xs font-medium text-gray-600 dark:text-gray-300">${c.colaborador}</td>
                  <td class="py-4 px-4">
                    <label class="inline-flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        ${rec.prejuizo ? 'checked' : ''}
                        onchange="toggleTrimPrejuizo(${c.id}, this.checked)"
                        class="w-5 h-5 rounded-md text-[#ECBD56] focus:ring-[#ECBD56]"
                      />
                      <span class="text-xs font-bold ${rec.prejuizo ? 'text-purple-400' : 'text-gray-400'}">${rec.prejuizo ? 'Sem DARF (Prejuízo)' : 'Não'}</span>
                    </label>
                  </td>
                  <td class="py-4 px-4">
                    ${rec.prejuizo ? '<span class="text-xs text-gray-400 italic">Dispensado</span>' : `
                      <div class="flex items-center gap-4 text-xs font-semibold">
                        <label class="inline-flex items-center gap-1.5 cursor-pointer">
                          <input type="radio" name="mode_${c.id}" ${rec.quotaUnica ? 'checked' : ''} onchange="setTrimQuotaMode(${c.id}, true)" />
                          <span>Quota Única</span>
                        </label>
                        <label class="inline-flex items-center gap-1.5 cursor-pointer">
                          <input type="radio" name="mode_${c.id}" ${!rec.quotaUnica ? 'checked' : ''} onchange="setTrimQuotaMode(${c.id}, false)" />
                          <span>3 Parcelas</span>
                        </label>
                      </div>
                    `}
                  </td>
                  <td class="py-4 px-6 text-center">
                    ${rec.prejuizo ? `
                      <span class="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30">🟢 Concluído (Prejuízo)</span>
                    ` : rec.quotaUnica ? `
                      <label class="inline-flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" ${rec.darfUnica ? 'checked' : ''} onchange="toggleTrimDarfUnica(${c.id}, this.checked)" class="w-5 h-5 rounded text-[#22AC77]" />
                        <span class="text-xs font-bold ${rec.darfUnica ? 'text-emerald-400' : 'text-rose-400'}">${rec.darfUnica ? 'DARF Única Paga' : 'DARF Pendente'}</span>
                      </label>
                    ` : `
                      <div class="flex items-center justify-center gap-3">
                        <label class="inline-flex items-center gap-1 cursor-pointer">
                          <input type="checkbox" ${rec.p1 ? 'checked' : ''} onchange="toggleTrimParcela(${c.id}, 1, this.checked)" class="w-4 h-4 rounded text-[#22AC77]" />
                          <span class="text-xs ${rec.p1 ? 'text-emerald-400 font-bold' : 'text-gray-400'}">1ª</span>
                        </label>
                        <label class="inline-flex items-center gap-1 cursor-pointer">
                          <input type="checkbox" ${rec.p2 ? 'checked' : ''} onchange="toggleTrimParcela(${c.id}, 2, this.checked)" class="w-4 h-4 rounded text-[#22AC77]" />
                          <span class="text-xs ${rec.p2 ? 'text-emerald-400 font-bold' : 'text-gray-400'}">2ª</span>
                        </label>
                        <label class="inline-flex items-center gap-1 cursor-pointer">
                          <input type="checkbox" ${rec.p3 ? 'checked' : ''} onchange="toggleTrimParcela(${c.id}, 3, this.checked)" class="w-4 h-4 rounded text-[#22AC77]" />
                          <span class="text-xs ${rec.p3 ? 'text-emerald-400 font-bold' : 'text-gray-400'}">3ª</span>
                        </label>
                      </div>
                    `}
                  </td>
                  <td class="py-4 px-4 text-center">
                    <button
                      onclick="openWhatsAppMessage('${c.nome.replace(/'/g, "\\'")}', 'IRPJ/CSLL Trimestral', '${state.selTrim}')"
                      class="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 transition shadow-xs text-xs"
                      title="Enviar mensagem WhatsApp ao cliente"
                    >
                      💬 WhatsApp
                    </button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  </div>
  `;
}

// Funções de Ações em Massa (Batch Actions) IRPJ Mensal
function toggleSelectAllMensal(checked, listIds) {
  if (checked) {
    state.selectedMensalIds = Array.from(new Set([...state.selectedMensalIds, ...listIds]));
  } else {
    state.selectedMensalIds = state.selectedMensalIds.filter(id => !listIds.includes(id));
  }
  render();
}

function toggleSelectMensalItem(id, checked) {
  if (checked) {
    if (!state.selectedMensalIds.includes(id)) state.selectedMensalIds.push(id);
  } else {
    state.selectedMensalIds = state.selectedMensalIds.filter(x => x !== id);
  }
  render();
}

function batchUpdateMensalStatus(status) {
  if (!state.selectedMensalIds.length) return alert('Selecione ao menos uma empresa.');
  state.selectedMensalIds.forEach(id => {
    const key = `${id}_${state.selIrpjMes}`;
    state.irpjMensalData[key] = state.irpjMensalData[key] || { status: 'Pendente', prejuizo: false };
    state.irpjMensalData[key].status = status;
  });
  state.selectedMensalIds = [];
  saveStorage();
  render();
}

// ---------------- IRPJ MENSAL TAB ----------------
function renderIrpjMensalTab(companies) {
  const mensalCos = companies.filter(c => normalizeRegime(c.regime) === 'Lucro Real Mensal');
  const mensalIds = mensalCos.map(c => c.id);
  const allMensalSelected = mensalIds.length > 0 && mensalIds.every(id => state.selectedMensalIds.includes(id));
  const someMensalSelected = state.selectedMensalIds.length > 0;

  return `
    <div class="space-y-6">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div>
          <h1 class="text-xl md:text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">IRPJ / CSLL - Lucro Real Mensal</h1>
          <p class="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-0.5">Apuração mensal por estimativa com opções de recolhimento ou prejuízo acumulado.</p>
        </div>

        <div class="flex items-center gap-2 bg-white dark:bg-[#171825] px-3.5 py-1.5 rounded-xl border border-gray-200/80 dark:border-gray-800 shadow-xs">
          <span class="text-xs font-semibold text-gray-400">Mês:</span>
          <select onchange="setIrpjMes(this.value)" class="bg-transparent text-xs font-bold text-gray-900 dark:text-white focus:outline-none cursor-pointer">
            ${MONTH_COMPETENCIES.map(m => `<option value="${m}" ${state.selIrpjMes === m ? 'selected' : ''} class="bg-[#171825] text-white">${m}</option>`).join('')}
          </select>
        </div>
      </div>

      <!-- Barra de Aviso com Semáforo de Vencimento -->
      <div class="p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-800 dark:text-amber-400 text-xs font-medium flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-2">
          <span class="text-base">📅</span>
          <span><strong>Vencimento Mensal:</strong> Último dia útil do mês subsequente ao período apurado.</span>
        </div>
        <div>
          ${getDeadlineBadge(30)}
        </div>
      </div>

      <!-- BARRA DE AÇÕES EM MASSA (BATCH ACTIONS) MENSAL -->
      ${someMensalSelected ? `
        <div class="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex flex-wrap items-center justify-between gap-3 animate-fadeIn">
          <div class="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400">
            <span>✓</span>
            <span><strong>${state.selectedMensalIds.length}</strong> empresa(s) selecionada(s)</span>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="batchUpdateMensalStatus('Concluída')" class="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-xs flex items-center gap-1">
              ✓ Marcar Concluídas (Lote)
            </button>
            <button onclick="batchUpdateMensalStatus('Análise')" class="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white transition shadow-xs">
              Mover p/ Análise
            </button>
            <button onclick="state.selectedMensalIds = []; render();" class="px-3 py-1.5 rounded-xl text-xs font-medium text-gray-500 hover:text-gray-700 dark:hover:text-white transition">
              Desmarcar Todas
            </button>
          </div>
        </div>
      ` : ''}

      <div class="panze-card !p-0 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm border-collapse">
            <thead>
              <tr class="border-b border-gray-100 dark:border-gray-800/80 bg-gray-50/50 dark:bg-[#12131F]/50 text-gray-400 uppercase text-[11px] font-bold tracking-wider">
                <th class="py-4 px-4 w-10 text-center">
                  <input
                    type="checkbox"
                    ${allMensalSelected ? 'checked' : ''}
                    onchange="toggleSelectAllMensal(this.checked, ${JSON.stringify(mensalIds)})"
                    class="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    title="Selecionar todas para ações em massa"
                  />
                </th>
                <th class="py-4 px-6">Empresa & CNPJ</th>
                <th class="py-4 px-4">Responsável</th>
                <th class="py-4 px-4">Prejuízo Fiscal?</th>
                <th class="py-4 px-4">Situação</th>
                <th class="py-4 px-6 text-center">Status Final</th>
                <th class="py-4 px-4 text-center">Aviso</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-800/60">
            ${mensalCos.map(c => {
              const rec = state.irpjMensalData[`${c.id}_${state.selIrpjMes}`] || { status: 'Pendente', prejuizo: false };
              const isSelected = state.selectedMensalIds.includes(c.id);
              return `
                <tr class="hover:bg-gray-50 dark:hover:bg-[#1C1C23]/40 transition ${isSelected ? 'bg-blue-50/40 dark:bg-blue-500/5' : ''}">
                  <td class="py-4 px-4 text-center">
                    <input
                      type="checkbox"
                      ${isSelected ? 'checked' : ''}
                      onchange="toggleSelectMensalItem(${c.id}, this.checked)"
                      class="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </td>
                  <td class="py-4 px-6">
                    ${renderCompanyCell(c)}
                  </td>
                  <td class="py-4 px-4 text-xs font-medium text-gray-600 dark:text-gray-300">${c.colaborador}</td>
                  <td class="py-4 px-4">
                    <label class="inline-flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        ${rec.prejuizo ? 'checked' : ''}
                        onchange="toggleMensalPrejuizo(${c.id}, this.checked)"
                        class="w-5 h-5 rounded-md text-[#ECBD56] focus:ring-[#ECBD56]"
                      />
                      <span class="text-xs font-bold ${rec.prejuizo ? 'text-purple-400' : 'text-gray-400'}">${rec.prejuizo ? 'Sim (Sem DARF)' : 'Não'}</span>
                    </label>
                  </td>
                  <td class="py-4 px-4">
                    ${rec.prejuizo ? '<span class="text-xs text-purple-400 font-semibold">Concluído via Prejuízo</span>' : `
                      <select
                        onchange="updateMensalStatus(${c.id}, this.value)"
                        class="px-3 py-1.5 rounded-full text-xs font-bold border focus:outline-none transition cursor-pointer ${
                          rec.status === 'Concluída' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                          rec.status === 'Análise' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                          rec.status === 'Estimativa' ? 'bg-purple-500/10 text-purple-400 border-purple-500/30' :
                          'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        }"
                      >
                        <option value="Pendente" ${rec.status === 'Pendente' ? 'selected' : ''} class="bg-[#15151A] text-white">🔴 Pendente</option>
                        <option value="Análise" ${rec.status === 'Análise' ? 'selected' : ''} class="bg-[#15151A] text-white">🟡 Análise</option>
                        <option value="Concluída" ${rec.status === 'Concluída' ? 'selected' : ''} class="bg-[#15151A] text-white">🟢 Concluída</option>
                        <option value="Estimativa" ${rec.status === 'Estimativa' ? 'selected' : ''} class="bg-[#15151A] text-white">🟣 Estimativa</option>
                      </select>
                    `}
                  </td>
                  <td class="py-4 px-6 text-center">
                    <span class="px-3 py-1 rounded-full text-xs font-bold ${
                      rec.status === 'Concluída' || rec.prejuizo ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                    }">
                      ${rec.status === 'Concluída' || rec.prejuizo ? 'Concluído' : 'Pendente'}
                    </span>
                  </td>
                  <td class="py-4 px-4 text-center">
                    <button
                      onclick="openWhatsAppMessage('${c.nome.replace(/'/g, "\\'")}', 'IRPJ/CSLL Mensal', '${state.selIrpjMes}')"
                      class="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 transition shadow-xs text-xs"
                      title="Enviar mensagem WhatsApp ao cliente"
                    >
                      💬 WhatsApp
                    </button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ---------------- TAREFAS TAB (GOOGLE TASKS) ----------------
function renderTarefasTab() {
  const urgencyWeight = { 'Alta': 3, 'Media': 2, 'Baixa': 1 };
  const activeTasks = state.tasks.filter(t => !t.concluida).sort((a, b) => {
    const diff = (urgencyWeight[b.urgencia] || 1) - (urgencyWeight[a.urgencia] || 1);
    if (diff !== 0) return diff;
    return new Date(a.data) - new Date(b.data);
  });
  const completedTasks = state.tasks.filter(t => t.concluida);
  const displayList = state.taskFilter === 'ativas' ? activeTasks : completedTasks;

  return `
    <div class="space-y-6 max-w-4xl mx-auto">
      <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-2 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h1 class="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white uppercase">Gestão de Tarefas (Google Tasks)</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400">Organize pendências com ordenação automática por urgência e proximidade de vencimento.</p>
        </div>

        <div class="flex items-center gap-2 bg-white dark:bg-[#15151A] p-1.5 rounded-full border border-gray-200 dark:border-gray-800">
          <button
            onclick="setTaskFilter('ativas')"
            class="px-4 py-1.5 rounded-full text-xs font-bold transition ${state.taskFilter === 'ativas' ? 'bg-[#ECBD56] text-gray-950' : 'text-gray-400'}"
          >
            Pendentes (${activeTasks.length})
          </button>
          <button
            onclick="setTaskFilter('concluidas')"
            class="px-4 py-1.5 rounded-full text-xs font-bold transition ${state.taskFilter === 'concluidas' ? 'bg-[#ECBD56] text-gray-950' : 'text-gray-400'}"
          >
            Concluídas (${completedTasks.length})
          </button>
        </div>
      </div>

      <!-- Formulário de Adicionar Tarefa -->
      <form id="new-task-form" class="panze-card space-y-4">
        <div class="flex items-center gap-2 font-bold text-sm text-gray-900 dark:text-white">
          <span class="text-[#ECBD56]">➕</span>
          <span>Criar Nova Tarefa</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            id="task-title-input"
            required
            placeholder="Título da tarefa..."
            class="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-[#11121C] border border-gray-200/80 dark:border-gray-800 text-gray-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#ECBD56]/40 transition"
          />
          <input
            type="text"
            id="task-desc-input"
            placeholder="Descrição ou observações (opcional)..."
            class="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-[#11121C] border border-gray-200/80 dark:border-gray-800 text-gray-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#ECBD56]/40 transition"
          />
        </div>

        <div class="flex flex-wrap items-center justify-between gap-4 pt-1">
          <div class="flex items-center gap-3">
            <div class="flex items-center gap-2">
              <span class="text-xs font-semibold text-gray-400">Data Limite:</span>
              <input
                type="date"
                id="task-date-input"
                required
                value="2026-10-05"
                class="px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-[#11121C] border border-gray-200/80 dark:border-gray-800 text-gray-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-[#ECBD56]"
              />
            </div>

            <div class="flex items-center gap-2">
              <span class="text-xs font-semibold text-gray-400">Urgência:</span>
              <select
                id="task-urgency-input"
                class="px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-[#11121C] border border-gray-200/80 dark:border-gray-800 text-gray-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#ECBD56]"
              >
                <option value="Alta">🔴 Alta</option>
                <option value="Media">🟡 Média</option>
                <option value="Baixa">🟢 Baixa</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            class="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-[#12131F] dark:bg-[#ECBD56] dark:text-gray-950 hover:opacity-90 transition shadow-sm"
          >
            Adicionar Tarefa
          </button>
        </div>
      </form>

      <!-- Lista de Tarefas -->
      <div class="space-y-3">
        ${displayList.map(t => `
          <div class="panze-card !p-4 transition flex items-start gap-4 ${
            t.concluida ? 'opacity-60 bg-gray-50/50 dark:bg-[#11121C]/50' : 'hover:border-[#ECBD56]/40'
          }">
            <button
              onclick="toggleTaskComplete(${t.id})"
              class="mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                t.concluida ? 'bg-[#10B981] border-[#10B981] text-white' : 'border-gray-400 hover:border-[#ECBD56]'
              }"
            >
              ${t.concluida ? '✓' : ''}
            </button>

            <div class="flex-1">
              <div class="flex items-center gap-3">
                <h4 class="font-bold text-sm ${t.concluida ? 'line-through text-gray-400' : 'text-gray-900 dark:text-white'}">
                  ${t.titulo}
                </h4>
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  t.urgencia === 'Alta' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/30' :
                  t.urgencia === 'Media' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30' :
                  'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                }">
                  ${t.urgencia}
                </span>
              </div>
              ${t.descricao ? `<p class="text-xs text-gray-500 dark:text-gray-400 mt-1">${t.descricao}</p>` : ''}
              <div class="flex items-center gap-3 mt-2 text-[11px] text-gray-400 font-medium">
                <span>📅 Prazo: ${t.data}</span>
              </div>
            </div>

            <button onclick="deleteTask(${t.id})" class="p-1.5 rounded-lg hover:bg-rose-500/10 text-gray-400 hover:text-rose-500 transition" title="Excluir">
              🗑️
            </button>
          </div>
        `).join('')}

        ${displayList.length === 0 ? `
          <div class="panze-card text-center p-8 text-gray-400">
            <p class="text-sm font-semibold">Nenhuma tarefa nesta categoria no momento!</p>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// ABA 7: CADASTRO E GESTÃO DE EMPRESAS (COM FILTROS COMPLETOS)
// ----------------------------------------------------
function renderEmpresasTab(companies) {
  // Obter listas únicas para popular os selects de filtro
  const allResponsaveis = Array.from(new Set(state.companies.map(c => c.colaborador).filter(Boolean))).sort();
  const allRegimes = Array.from(new Set(state.companies.map(c => c.regime).filter(Boolean))).sort();
  const allClasses = Array.from(new Set(state.companies.map(c => c.classe).filter(Boolean))).sort();
  const allGrupos = Array.from(new Set(state.companies.map(c => c.grupo).filter(Boolean))).sort();
  const allSegmentos = Array.from(new Set(state.companies.map(c => c.segmento).filter(Boolean))).sort();

  // Aplicação dos Filtros dedicados
  const fList = companies.filter(c => {
    if (state.crudFilters.responsavel !== 'todos' && c.colaborador !== state.crudFilters.responsavel) return false;
    if (state.crudFilters.regime !== 'todos' && c.regime !== state.crudFilters.regime) return false;
    if (state.crudFilters.classe !== 'todos' && c.classe !== state.crudFilters.classe) return false;
    if (state.crudFilters.grupo !== 'todos' && c.grupo !== state.crudFilters.grupo) return false;
    if (state.crudFilters.segmento !== 'todos' && c.segmento !== state.crudFilters.segmento) return false;
    return true;
  });

  return `
    <div class="space-y-6">
      <!-- Cabeçalho da Aba -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div>
          <h1 class="text-xl md:text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Cadastro e Gestão de Empresas
          </h1>
          <p class="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Base cadastral com ${state.companies.length} empresas. Utilize os filtros abaixo para conferência rápida.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button
            onclick="exportBackupJSON()"
            class="px-3.5 py-2 rounded-xl font-semibold text-xs text-gray-700 dark:text-gray-200 bg-white dark:bg-[#171825] hover:bg-gray-100 dark:hover:bg-gray-800 transition flex items-center gap-2 border border-gray-200/80 dark:border-gray-800 shadow-xs"
            title="Exportar arquivo de Backup completo"
          >
            <span>💾</span>
            <span class="hidden sm:inline">Exportar JSON</span>
          </button>

          <label
            class="px-3.5 py-2 rounded-xl font-semibold text-xs text-gray-700 dark:text-gray-200 bg-white dark:bg-[#171825] hover:bg-gray-100 dark:hover:bg-gray-800 transition flex items-center gap-2 border border-gray-200/80 dark:border-gray-800 shadow-xs cursor-pointer"
            title="Importar arquivo gerado em outro computador"
          >
            <span>📥</span>
            <span class="hidden sm:inline">Importar</span>
            <input type="file" onchange="handleUniversalImport(event)" accept=".json, .xlsx, .xls, .csv" class="hidden" />
          </label>

          <button
            onclick="openCompanyModal('create')"
            class="px-4 py-2 rounded-xl font-bold text-xs text-white bg-[#12131F] dark:bg-[#ECBD56] dark:text-gray-950 transition shadow-sm hover:opacity-95 flex items-center gap-1.5"
          >
            <span>+</span>
            <span>Cadastrar Empresa</span>
          </button>
        </div>
      </div>

      <!-- SEÇÃO DEDICADA DE FILTROS PARA CONFERÊNCIA RÁPIDA -->
      <div class="panze-card space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
            <span class="text-[#ECBD56]">🔍</span>
            <span>Filtros Rápidos para Conferência</span>
          </div>
          <button
            onclick="clearCrudFilters()"
            class="text-xs text-[#ECBD56] hover:underline font-semibold"
          >
            Limpar Filtros
          </button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <!-- Filtro Responsável -->
          <div>
            <label class="block text-[11px] font-semibold text-gray-400 mb-1">Responsável</label>
            <select
              onchange="setCrudFilter('responsavel', this.value)"
              class="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-[#11121C] border border-gray-200/80 dark:border-gray-800 text-gray-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#ECBD56]"
            >
              <option value="todos">Todos os Responsáveis</option>
              ${allResponsaveis.map(r => `<option value="${r}" ${state.crudFilters.responsavel === r ? 'selected' : ''}>${r}</option>`).join('')}
            </select>
          </div>

          <!-- Filtro Regime Tributário -->
          <div>
            <label class="block text-[11px] font-semibold text-gray-400 mb-1">Regime Tributário</label>
            <select
              onchange="setCrudFilter('regime', this.value)"
              class="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-[#11121C] border border-gray-200/80 dark:border-gray-800 text-gray-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#ECBD56]"
            >
              <option value="todos">Todos os Regimes</option>
              ${allRegimes.map(rg => `<option value="${rg}" ${state.crudFilters.regime === rg ? 'selected' : ''}>${rg}</option>`).join('')}
            </select>
          </div>

          <!-- Filtro Classe -->
          <div>
            <label class="block text-[11px] font-semibold text-gray-400 mb-1">Classe</label>
            <select
              onchange="setCrudFilter('classe', this.value)"
              class="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-[#11121C] border border-gray-200/80 dark:border-gray-800 text-gray-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#ECBD56]"
            >
              <option value="todos">Todas as Classes</option>
              ${allClasses.map(cl => `<option value="${cl}" ${state.crudFilters.classe === cl ? 'selected' : ''}>Classe ${cl}</option>`).join('')}
            </select>
          </div>

          <!-- Filtro Grupo -->
          <div>
            <label class="block text-[11px] font-semibold text-gray-400 mb-1">Grupo Empresarial</label>
            <select
              onchange="setCrudFilter('grupo', this.value)"
              class="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-[#11121C] border border-gray-200/80 dark:border-gray-800 text-gray-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#ECBD56]"
            >
              <option value="todos">Todos os Grupos</option>
              ${allGrupos.map(g => `<option value="${g}" ${state.crudFilters.grupo === g ? 'selected' : ''}>${g}</option>`).join('')}
            </select>
          </div>

          <!-- Filtro Segmento -->
          <div>
            <label class="block text-[11px] font-semibold text-gray-400 mb-1">Segmento</label>
            <select
              onchange="setCrudFilter('segmento', this.value)"
              class="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-[#11121C] border border-gray-200/80 dark:border-gray-800 text-gray-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#ECBD56]"
            >
              <option value="todos">Todos os Segmentos</option>
              ${allSegmentos.map(s => `<option value="${s}" ${state.crudFilters.segmento === s ? 'selected' : ''}>${s}</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="text-[11px] text-gray-400 pt-1 flex items-center justify-between">
          <span>Exibindo <strong>${fList.length}</strong> de <strong>${state.companies.length}</strong> empresas</span>
          ${Object.values(state.crudFilters).some(v => v !== 'todos') ? `
            <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-500 font-bold text-[10px]">
              ⚡ Filtrado via Atalho de Gráfico &bull; <button onclick="clearCrudFilters()" class="underline hover:text-white">Remover Filtro</button>
            </span>
          ` : ''}
        </div>
      </div>

      <!-- Tabela de Empresas -->
      <div class="panze-card !p-0 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm border-collapse">
            <thead>
              <tr class="border-b border-gray-100 dark:border-gray-800/80 bg-gray-50/50 dark:bg-[#12131F]/50 text-gray-400 uppercase text-[11px] font-bold tracking-wider">
                <th class="py-4 px-4">Cód.</th>
              <th class="py-4 px-4">Grupo</th>
              <th class="py-4 px-6">Empresa & CNPJ</th>
              <th class="py-4 px-3 text-center">Classe</th>
              <th class="py-4 px-4">Regime Tributário</th>
              <th class="py-4 px-4">Responsável</th>
              <th class="py-4 px-4">Segmento</th>
              <th class="py-4 px-6 text-right">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-800/60">
            ${fList.map(c => `
              <tr class="hover:bg-gray-50 dark:hover:bg-[#1C1C23]/40 transition">
                <td class="py-4 px-4 font-mono text-xs font-bold text-[#ECBD56]">
                  ${c.codigo || c.id}
                </td>
                <td class="py-4 px-4 text-xs font-semibold text-gray-400 uppercase">
                  ${c.grupo || '-'}
                </td>
                <td class="py-4 px-6">
                  ${renderCompanyCell(c)}
                </td>
                <td class="py-4 px-3 text-center">
                  <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#ECBD56]/10 text-[#ECBD56] border border-[#ECBD56]/30">
                    ${c.classe || 'A'}
                  </span>
                </td>
                <td class="py-4 px-4">
                  ${getRegimeBadge(c.regime)}
                </td>
                <td class="py-4 px-4 text-xs font-medium text-gray-600 dark:text-gray-300">
                  ${c.colaborador}
                </td>
                <td class="py-4 px-4 text-xs text-gray-400">
                  ${c.segmento}
                </td>
                <td class="py-4 px-6 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button onclick="openCompanyModal('view', ${c.id})" class="p-1.5 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition" title="Visualizar Detalhes">
                      👁️
                    </button>
                    <button onclick="openCompanyModal('edit', ${c.id})" class="p-1.5 rounded-full hover:bg-gray-800 text-gray-400 hover:text-[#ECBD56] transition" title="Editar Empresa">
                      ✏️
                    </button>
                    <button onclick="deleteCompany(${c.id})" class="p-1.5 rounded-full hover:bg-rose-500/10 text-gray-400 hover:text-rose-500 transition" title="Excluir Empresa">
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        ${fList.length === 0 ? `
          <div class="p-8 text-center text-gray-400 text-xs">
            Nenhuma empresa encontrada com os filtros selecionados.
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

// ---------------- MODAL DE CRUD DE EMPRESA ----------------
function renderCompanyModal() {
  const { mode, company } = state.modal;
  const isView = mode === 'view';
  const c = company || {
    codigo: '',
    grupo: '',
    nome: '',
    cnpj: '',
    classe: 'A',
    regime: 'Lucro Real Mensal',
    colaborador: 'Brayann',
    segmento: 'Serviços',
    fechamento: '2026-08'
  };

  return `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div class="w-full max-w-lg rounded-3xl bg-white dark:bg-[#15151A] border border-gray-200 dark:border-gray-800 shadow-2xl p-6 relative">
        <div class="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
          <h3 class="font-extrabold text-lg text-gray-900 dark:text-white">
            ${mode === 'create' ? 'Cadastrar Nova Empresa' : mode === 'edit' ? 'Editar Empresa' : 'Detalhes da Empresa'}
          </h3>
          <button onclick="closeCompanyModal()" class="p-1.5 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white">✕</button>
        </div>

        <form id="company-modal-form" class="mt-5 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-gray-400 mb-1">1. Código</label>
              <input
                type="text"
                id="modal-codigo"
                ${isView ? 'disabled' : ''}
                value="${c.codigo || ''}"
                placeholder="Ex: 001"
                class="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-[#1C1C23] border border-gray-200 dark:border-gray-700/60 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#ECBD56]"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-400 mb-1">2. Grupo Empresarial</label>
              <input
                type="text"
                id="modal-grupo"
                ${isView ? 'disabled' : ''}
                value="${c.grupo || ''}"
                placeholder="Ex: HOLDING"
                class="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-[#1C1C23] border border-gray-200 dark:border-gray-700/60 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#ECBD56]"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-400 mb-1">3. Razão Social / Empresa</label>
            <input
              type="text"
              id="modal-nome"
              required
              ${isView ? 'disabled' : ''}
              value="${c.nome}"
              placeholder="Nome da empresa"
              class="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-[#1C1C23] border border-gray-200 dark:border-gray-700/60 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#ECBD56]"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-gray-400 mb-1">4. CNPJ</label>
              <input
                type="text"
                id="modal-cnpj"
                required
                ${isView ? 'disabled' : ''}
                value="${c.cnpj}"
                placeholder="00.000.000/0001-00"
                class="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-[#1C1C23] border border-gray-200 dark:border-gray-700/60 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#ECBD56]"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-400 mb-1">5. Classe</label>
              <select
                id="modal-classe"
                ${isView ? 'disabled' : ''}
                class="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-[#1C1C23] border border-gray-200 dark:border-gray-700/60 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#ECBD56]"
              >
                <option value="A" ${(c.classe || 'A') === 'A' ? 'selected' : ''}>Classe A</option>
                <option value="B" ${c.classe === 'B' ? 'selected' : ''}>Classe B</option>
                <option value="C" ${c.classe === 'C' ? 'selected' : ''}>Classe C</option>
                <option value="D" ${c.classe === 'D' ? 'selected' : ''}>Classe D</option>
                <option value="E" ${c.classe === 'E' ? 'selected' : ''}>Classe E</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-gray-400 mb-1">6. Regime Tributário</label>
              <select
                id="modal-regime"
                ${isView ? 'disabled' : ''}
                class="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-[#1C1C23] border border-gray-200 dark:border-gray-700/60 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#ECBD56]"
              >
                <option value="Lucro Real Mensal" ${c.regime === 'Lucro Real Mensal' ? 'selected' : ''}>Lucro Real Mensal</option>
                <option value="Lucro Real Trimestral" ${c.regime === 'Lucro Real Trimestral' ? 'selected' : ''}>Lucro Real Trimestral</option>
                <option value="Lucro Presumido" ${c.regime === 'Lucro Presumido' ? 'selected' : ''}>Lucro Presumido</option>
                <option value="Simples Nacional" ${c.regime === 'Simples Nacional' ? 'selected' : ''}>Simples Nacional</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-400 mb-1">7. Responsável</label>
              <input
                type="text"
                id="modal-colaborador"
                ${isView ? 'disabled' : ''}
                value="${c.colaborador}"
                placeholder="Ex: Brayann"
                class="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-[#1C1C23] border border-gray-200 dark:border-gray-700/60 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#ECBD56]"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-gray-400 mb-1">8. Segmento</label>
              <input
                type="text"
                id="modal-segmento"
                ${isView ? 'disabled' : ''}
                value="${c.segmento}"
                placeholder="Ex: Comércio"
                class="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-[#1C1C23] border border-gray-200 dark:border-gray-700/60 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#ECBD56]"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-400 mb-1">Mês Fechamento Base</label>
              <input
                type="month"
                id="modal-fechamento"
                ${isView ? 'disabled' : ''}
                value="${c.fechamento || '2026-08'}"
                class="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-[#1C1C23] border border-gray-200 dark:border-gray-700/60 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#ECBD56]"
              />
            </div>
          </div>

          <div class="pt-4 flex items-center justify-end gap-3 border-t border-gray-100 dark:border-gray-800">
            <button type="button" onclick="closeCompanyModal()" class="px-5 py-2.5 rounded-full text-xs font-bold text-gray-400 hover:text-white transition">
              Cancelar
            </button>
            ${!isView ? `
              <button type="submit" class="px-6 py-2.5 rounded-full font-bold text-xs text-gray-950 bg-[#ECBD56] hover:bg-[#DEA93F] transition shadow-md shadow-[#ECBD56]/20">
                Salvar Empresa
              </button>
            ` : ''}
          </div>
        </form>
      </div>
    </div>
  `;
}

// ---------------- ATTACH EVENT HANDLERS ----------------
function attachEventHandlers() {
  // Troca de Abas
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.activeTab = btn.getAttribute('data-tab');
      render();
    });
  });

  // Busca Global
  const searchInput = document.getElementById('global-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.globalSearch = e.target.value;
      render();
      const updatedInput = document.getElementById('global-search-input');
      if (updatedInput) {
        updatedInput.focus();
        updatedInput.setSelectionRange(updatedInput.value.length, updatedInput.value.length);
      }
    });
  }

  const clearBtn = document.getElementById('clear-search-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      state.globalSearch = '';
      render();
    });
  }

  // Notificações
  const notifBtn = document.getElementById('toggle-notif-btn');
  if (notifBtn) {
    notifBtn.addEventListener('click', () => {
      state.isNotificationOpen = !state.isNotificationOpen;
      render();
    });
  }

  // Alternar Tema
  const themeBtn = document.getElementById('toggle-theme-btn');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('control_theme', state.theme);
      render();
    });
  }

  // Logout
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      state.user = null;
      localStorage.removeItem('control_auth_user');
      render();
    });
  }

  // Upload Logo
  const logoInput = document.getElementById('logo-input');
  if (logoInput) {
    logoInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          state.customLogo = ev.target.result;
          localStorage.setItem('control_custom_logo', ev.target.result);
          render();
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // -------------------------------------------------------------------
  // IMPORTAÇÃO DE PLANILHA EXCEL (MAPEAMENTO ESTRITO DAS 8 COLUNAS)
  // Coluna 1: Código
  // Coluna 2: Grupo
  // Coluna 3: Empresa
  // Coluna 4: CNPJ
  // Coluna 5: Classe
  // Coluna 6: Regime Tributário
  // Coluna 7: Responsável
  // Coluna 8: Segmento
  // -------------------------------------------------------------------
  const fileInput = document.getElementById('spreadsheet-file-input');
  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = new Uint8Array(ev.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheet];

          // Lê matriz de linhas (header: 1) para mapear fielmente as 8 colunas por índice ou por cabeçalho
          const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
          if (!rows || rows.length <= 1) {
            alert("A planilha selecionada está vazia ou sem dados válidos.");
            return;
          }

          // Descobrir se a primeira linha é cabeçalho
          const header = rows[0].map(h => (h ? h.toString().trim().toLowerCase() : ""));
          const hasNamedHeader = header.some(h => h.includes('empresa') || h.includes('cnpj') || h.includes('código') || h.includes('codigo'));
          const dataRows = hasNamedHeader ? rows.slice(1) : rows;

          const imported = [];
          dataRows.forEach((row, idx) => {
            if (!row || row.length === 0 || (!row[0] && !row[2] && !row[3])) return;

            // Mapeamento Estrito das 8 Colunas
            const codigo = row[0] ? row[0].toString().trim() : (idx + 1).toString();
            const grupo = row[1] ? row[1].toString().trim() : "GERAL";
            const empresa = row[2] ? row[2].toString().trim() : `Empresa ${codigo}`;
            const cnpj = row[3] ? row[3].toString().trim() : "00.000.000/0001-00";
            const classe = normalizeClasse(row[4]);
            const regime = normalizeRegime(row[5]);
            const responsavel = row[6] ? row[6].toString().trim() : "Brayann";
            const segmento = row[7] ? row[7].toString().trim() : "Serviços";

            imported.push({
              id: Date.now() + idx,
              codigo,
              grupo,
              nome: empresa,
              cnpj,
              classe,
              regime,
              colaborador: responsavel,
              segmento,
              fechamento: "2026-08"
            });
          });

          if (imported.length > 0) {
            state.companies = imported;
            saveStorage();
            render();
            alert(`Sucesso! ${imported.length} empresas importadas respeitando estritamente a ordem das 8 colunas:\n1. Código\n2. Grupo\n3. Empresa\n4. CNPJ\n5. Classe\n6. Regime Tributário\n7. Responsável\n8. Segmento`);
          } else {
            alert("Nenhuma empresa válida encontrada na planilha.");
          }
        } catch (err) {
          alert('Erro ao processar a planilha. Verifique o arquivo Excel.');
        }
      };
      reader.readAsArrayBuffer(file);
    });
  }

  // Exportar XLSX
  const exportBtn = document.getElementById('export-data-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      // Exporta no formato padronizado das 8 colunas
      const exportRows = state.companies.map(c => ({
        "Código": c.codigo || c.id,
        "Grupo": c.grupo || "GERAL",
        "Empresa": c.nome,
        "CNPJ": c.cnpj,
        "Classe": c.classe,
        "Regime Tributário": c.regime,
        "Responsável": c.colaborador,
        "Segmento": c.segmento
      }));

      const ws = XLSX.utils.json_to_sheet(exportRows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Empresas");
      XLSX.writeFile(wb, "Control_Contabilidade_Empresas_Padrao.xlsx");
    });
  }

  // Form de Tarefa
  const taskForm = document.getElementById('new-task-form');
  if (taskForm) {
    taskForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('task-title-input').value.trim();
      const desc = document.getElementById('task-desc-input').value.trim();
      const date = document.getElementById('task-date-input').value;
      const urg = document.getElementById('task-urgency-input').value;
      if (!title) return;
      state.tasks.unshift({ id: Date.now(), titulo: title, descricao: desc, data: date, urgencia: urg, concluida: false });
      saveStorage();
      render();
    });
  }

  // Form de Modal de Empresa (com as 8 colunas)
  const compForm = document.getElementById('company-modal-form');
  if (compForm) {
    compForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const codigo = document.getElementById('modal-codigo').value.trim();
      const grupo = document.getElementById('modal-grupo').value.trim();
      const nome = document.getElementById('modal-nome').value.trim();
      const cnpj = document.getElementById('modal-cnpj').value.trim();
      const classe = document.getElementById('modal-classe').value;
      const regime = document.getElementById('modal-regime').value;
      const colaborador = document.getElementById('modal-colaborador').value.trim();
      const segmento = document.getElementById('modal-segmento').value.trim();
      const fechamento = document.getElementById('modal-fechamento').value;

      if (state.modal.mode === 'create') {
        state.companies.unshift({
          id: Date.now(),
          codigo: codigo || (state.companies.length + 1).toString(),
          grupo: grupo || 'GERAL',
          nome,
          cnpj,
          classe,
          regime,
          colaborador,
          segmento,
          fechamento
        });
      } else if (state.modal.mode === 'edit' && state.modal.company) {
        const idx = state.companies.findIndex(x => x.id === state.modal.company.id);
        if (idx !== -1) {
          state.companies[idx] = {
            ...state.companies[idx],
            codigo,
            grupo,
            nome,
            cnpj,
            classe,
            regime,
            colaborador,
            segmento,
            fechamento
          };
        }
      }
      saveStorage();
      closeCompanyModal();
    });
  }

  // -------------------------------------------------------------------
  // CONFIGURAÇÃO DE SERVIDOR / SINCRONIZAÇÃO EM NUVEM
  // -------------------------------------------------------------------
  const configSyncBtn = document.getElementById('config-sync-btn');
  if (configSyncBtn) {
    configSyncBtn.addEventListener('click', () => {
      const currentUrl = state.backendUrl || '';
      const newUrl = prompt(
        "🌐 CONFIGURAÇÃO DE SERVIDOR / BACKEND EM NUVEM\n\n" +
        "Para sincronizar alterações automaticamente entre computadores diferentes em tempo real, insira a URL da API/Backend da sua hospedagem (ex: https://meuservidor.com/api/empresas):\n\n" +
        "Deixe em branco para utilizar apenas o modo offline/local com Backup manual.",
        currentUrl
      );
      if (newUrl !== null) {
        state.backendUrl = newUrl.trim();
        localStorage.setItem('control_backend_url', state.backendUrl);
        if (state.backendUrl) {
          syncToBackend(true);
        } else {
          state.syncStatus = 'idle';
          alert("Modo de sincronização em nuvem desativado. O sistema usará persistência local e backup.");
        }
        render();
      }
    });
  }

  // Menu Dropdown de Paletas de Tema
  const themePaletteBtn = document.getElementById('theme-palette-btn');
  const themePaletteDropdown = document.getElementById('theme-palette-dropdown');
  if (themePaletteBtn && themePaletteDropdown) {
    themePaletteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      themePaletteDropdown.classList.toggle('hidden');
    });

    document.addEventListener('click', (e) => {
      if (!themePaletteDropdown.contains(e.target) && e.target !== themePaletteBtn) {
        themePaletteDropdown.classList.add('hidden');
      }
    });
  }

  // Menu Dropdown de Backup / Sync
  const backupMenuBtn = document.getElementById('backup-menu-btn');
  const backupDropdown = document.getElementById('backup-dropdown');
  if (backupMenuBtn && backupDropdown) {
    backupMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      backupDropdown.classList.toggle('hidden');
    });

    document.addEventListener('click', (e) => {
      if (!backupDropdown.contains(e.target) && e.target !== backupMenuBtn) {
        backupDropdown.classList.add('hidden');
      }
    });
  }

  // Exportar Backup JSON
  const btnExportJson = document.getElementById('btn-export-backup-json');
  if (btnExportJson) {
    btnExportJson.addEventListener('click', () => {
      exportBackupJSON();
      if (backupDropdown) backupDropdown.classList.add('hidden');
    });
  }

  // Exportar Backup CSV / Excel
  const btnExportCsv = document.getElementById('btn-export-backup-csv');
  if (btnExportCsv) {
    btnExportCsv.addEventListener('click', () => {
      exportBackupCSV();
      if (backupDropdown) backupDropdown.classList.add('hidden');
    });
  }

  // Forçar Sincronização em Nuvem
  const btnForceSync = document.getElementById('btn-force-sync');
  if (btnForceSync) {
    btnForceSync.addEventListener('click', async () => {
      if (backupDropdown) backupDropdown.classList.add('hidden');
      await syncToBackend(true);
      await pullFromBackend();
    });
  }

  // Importar Arquivo Universal de Sincronização (JSON ou Planilha)
  const universalInput = document.getElementById('universal-sync-file-input');
  if (universalInput) {
    universalInput.addEventListener('change', (e) => {
      handleUniversalImport(e);
      if (backupDropdown) backupDropdown.classList.add('hidden');
    });
  }
}

// ---------------- FUNÇÕES GLOBAIS EXPOSTAS ----------------
window.setTheme = (themeId) => {
  if (THEMES[themeId]) {
    state.theme = themeId;
    localStorage.setItem('control_theme', themeId);
    render();
  }
};
window.setAuthMode = (mode) => { state.authMode = mode; render(); };
window.switchTab = (tab) => { state.activeTab = tab; render(); };
window.setFechamentoFilter = (f) => { state.fechamentoFilter = f; render(); };
window.updateCompanyFechamento = (id, val) => {
  const c = state.companies.find(x => x.id === id);
  if (c) { c.fechamento = val; saveStorage(); render(); }
};
window.setPisComp = (comp) => { state.selPisComp = comp; render(); };
window.updatePisStatus = (id, st) => {
  const darf = st === 'Concluída';
  state.pisCofinsData[`${id}_${state.selPisComp}`] = { status: st, darfEnviado: darf };
  saveStorage(); render();
};
window.togglePisDarf = (id, checked) => {
  state.pisCofinsData[`${id}_${state.selPisComp}`] = { status: checked ? 'Concluída' : 'Pendente', darfEnviado: checked };
  saveStorage(); render();
};
window.resetPisMonth = () => {
  if (confirm(`Resetar todas as empresas para Pendente em ${state.selPisComp}?`)) {
    state.companies.forEach(c => { state.pisCofinsData[`${c.id}_${state.selPisComp}`] = { status: 'Pendente', darfEnviado: false }; });
    saveStorage(); render();
  }
};
window.setTrim = (t) => { state.selTrim = t; render(); };
window.toggleTrimPrejuizo = (id, checked) => {
  const k = `${id}_${state.selTrim}`;
  state.irpjTrimData[k] = { ...(state.irpjTrimData[k] || {}), prejuizo: checked };
  saveStorage(); render();
};
window.setTrimQuotaMode = (id, isUnica) => {
  const k = `${id}_${state.selTrim}`;
  state.irpjTrimData[k] = { ...(state.irpjTrimData[k] || {}), quotaUnica: isUnica };
  saveStorage(); render();
};
window.toggleTrimDarfUnica = (id, checked) => {
  const k = `${id}_${state.selTrim}`;
  state.irpjTrimData[k] = { ...(state.irpjTrimData[k] || {}), darfUnica: checked };
  saveStorage(); render();
};
window.toggleTrimParcela = (id, pNum, checked) => {
  const k = `${id}_${state.selTrim}`;
  state.irpjTrimData[k] = { ...(state.irpjTrimData[k] || {}), [`p${pNum}`]: checked };
  saveStorage(); render();
};
window.setIrpjMes = (m) => { state.selIrpjMes = m; render(); };
window.toggleMensalPrejuizo = (id, checked) => {
  const k = `${id}_${state.selIrpjMes}`;
  state.irpjMensalData[k] = { ...(state.irpjMensalData[k] || {}), prejuizo: checked, status: checked ? 'Concluída' : 'Pendente' };
  saveStorage(); render();
};
window.updateMensalStatus = (id, st) => {
  const k = `${id}_${state.selIrpjMes}`;
  state.irpjMensalData[k] = { ...(state.irpjMensalData[k] || {}), status: st };
  saveStorage(); render();
};
window.setTaskFilter = (f) => { state.taskFilter = f; render(); };
window.toggleTaskComplete = (id) => {
  const t = state.tasks.find(x => x.id === id);
  if (t) { t.concluida = !t.concluida; saveStorage(); render(); }
};
window.deleteTask = (id) => {
  if (confirm('Deseja excluir esta tarefa?')) {
    state.tasks = state.tasks.filter(x => x.id !== id);
    saveStorage(); render();
  }
};

// Funções de CRUD e Filtros de Empresa
window.openCompanyModal = (mode, id) => {
  const comp = id ? state.companies.find(x => x.id === id) : null;
  state.modal = { isOpen: true, mode, company: comp };
  render();
};
window.closeCompanyModal = () => {
  state.modal = { isOpen: false, mode: 'create', company: null };
  render();
};
window.deleteCompany = (id) => {
  if (confirm('Confirma a exclusão desta empresa?')) {
    state.companies = state.companies.filter(x => x.id !== id);
    saveStorage(); render();
  }
};
window.setCrudFilter = (key, val) => {
  state.crudFilters[key] = val;
  render();
};
window.clearCrudFilters = () => {
  state.crudFilters = {
    responsavel: 'todos',
    regime: 'todos',
    classe: 'todos',
    grupo: 'todos',
    segmento: 'todos'
  };
  render();
};

// ---------------- SISTEMA DE ATALHOS / NAVEGAÇÃO INTERATIVA DE GRÁFICOS ----------------
window.navigateToEmpresasFilter = (filterKey, filterValue) => {
  state.crudFilters = {
    responsavel: 'todos',
    regime: 'todos',
    classe: 'todos',
    grupo: 'todos',
    segmento: 'todos'
  };
  state.selectedAnalista = 'todos';
  state.crudFilters[filterKey] = filterValue;
  state.activeTab = 'empresas';
  render();
  setTimeout(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, 50);
};

window.navigateToFechamentoFilter = (statusKey) => {
  state.fechamentoFilter = statusKey;
  state.activeTab = 'fechamentos';
  render();
  setTimeout(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, 50);
};

window.navigateToTab = (tabName, optFilter) => {
  if (optFilter && tabName === 'tarefas') {
    state.taskFilter = optFilter;
  }
  state.activeTab = tabName;
  render();
  setTimeout(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, 50);
};

// ---------------- FUNÇÕES DE BACKUP E SINCRONIZAÇÃO ENTRE DISPOSITIVOS ----------------
window.exportBackupJSON = () => {
  const pkg = getFullDataPackage();
  const blob = new Blob([JSON.stringify(pkg, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const d = new Date().toISOString().split('T')[0];
  a.href = url;
  a.download = `Control_Backup_Completo_${d}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

window.exportBackupCSV = () => {
  const exportRows = state.companies.map(c => ({
    "Código": c.codigo || c.id,
    "Grupo": c.grupo || "GERAL",
    "Empresa": c.nome,
    "CNPJ": c.cnpj,
    "Classe": c.classe || "A",
    "Regime Tributário": c.regime || "Lucro Real Mensal",
    "Responsável": c.colaborador || "Brayann",
    "Segmento": c.segmento || "Serviços",
    "Mês Fechamento": c.fechamento || "2026-08"
  }));

  const ws = XLSX.utils.json_to_sheet(exportRows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Empresas");
  const d = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `Control_Empresas_Backup_${d}.xlsx`);
};

window.handleUniversalImport = (event) => {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const fileName = file.name.toLowerCase();

  // Caso 1: Arquivo JSON de Backup Completo
  if (fileName.endsWith('.json')) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data && (data.companies || data.users)) {
          applyDataPackage(data);
          render();
          alert(`✅ SUCESSO!\n\nBackup completo importado com sucesso!\n• ${state.companies.length} empresas atualizadas\n• Tarefas, status de DARFs e usuários sincronizados.`);
        } else {
          alert('Arquivo JSON inválido ou não reconhecido como backup do Control Contabilidade.');
        }
      } catch (err) {
        alert('Erro ao ler arquivo JSON de backup: ' + err.message);
      }
    };
    reader.readAsText(file);
    return;
  }

  // Caso 2: Planilha Excel ou CSV
  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      const data = new Uint8Array(ev.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheet = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheet];
      const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });

      if (!rows || rows.length <= 1) {
        alert("A planilha selecionada está vazia ou sem dados válidos.");
        return;
      }

      const header = rows[0].map(h => (h ? h.toString().trim().toLowerCase() : ""));
      const hasNamedHeader = header.some(h => h.includes('empresa') || h.includes('cnpj') || h.includes('código') || h.includes('codigo'));
      const dataRows = hasNamedHeader ? rows.slice(1) : rows;

      const imported = [];
      dataRows.forEach((row, idx) => {
        if (!row || row.length === 0 || (!row[0] && !row[2] && !row[3])) return;
        const codigo = row[0] ? row[0].toString().trim() : (idx + 1).toString();
        const grupo = row[1] ? row[1].toString().trim() : "GERAL";
        const empresa = row[2] ? row[2].toString().trim() : `Empresa ${codigo}`;
        const cnpj = row[3] ? row[3].toString().trim() : "00.000.000/0001-00";
        const classe = normalizeClasse(row[4]);
        const regime = normalizeRegime(row[5]);
        const responsavel = row[6] ? row[6].toString().trim() : "Brayann";
        const segmento = row[7] ? row[7].toString().trim() : "Serviços";
        const fechamento = row[8] ? row[8].toString().trim() : "2026-08";

        imported.push({
          id: Date.now() + idx,
          codigo,
          grupo,
          nome: empresa,
          cnpj,
          classe,
          regime,
          colaborador: responsavel,
          segmento,
          fechamento
        });
      });

      if (imported.length > 0) {
        state.companies = imported;
        saveStorage();
        render();
        alert(`✅ SUCESSO!\n\n${imported.length} empresas atualizadas e sincronizadas no sistema!`);
      } else {
        alert("Nenhuma empresa válida encontrada na planilha.");
      }
    } catch (err) {
      alert('Erro ao processar arquivo: ' + err.message);
    }
  };
  reader.readAsArrayBuffer(file);
};

// Inicialização imediata
document.addEventListener('DOMContentLoaded', () => {
  render();
  if (state.backendUrl) {
    pullFromBackend();
  }
});
render();
