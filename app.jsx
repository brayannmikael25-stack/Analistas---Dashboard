// Dados iniciais base de empresas representativos do ambiente contábil
const INITIAL_COMPANIES = [
  {
    id: 1,
    nome: "ALFA ENGENHARIA E CONSTRUCOES LTDA",
    cnpj: "14.285.912/0001-44",
    regime: "Lucro Real Mensal",
    colaborador: "Brayann",
    segmento: "Construção Civil",
    classe: "A",
    fechamento: "2026-08"
  },
  {
    id: 2,
    nome: "BETA DISTRIBUIDORA DE ALIMENTOS SA",
    cnpj: "23.491.018/0001-92",
    regime: "Lucro Real Trimestral",
    colaborador: "Brayann",
    segmento: "Comércio Atacadista",
    classe: "A",
    fechamento: "2026-08"
  },
  {
    id: 3,
    nome: "GAMMA LOGISTICA E TRANSPORTES LTDA",
    cnpj: "08.771.234/0001-15",
    regime: "Lucro Real Mensal",
    colaborador: "Carlos",
    segmento: "Transportes",
    classe: "B",
    fechamento: "2026-07"
  },
  {
    id: 4,
    nome: "DELTA SERVICOS TECNOLOGICOS LTDA",
    cnpj: "31.902.441/0001-09",
    regime: "Lucro Real Trimestral",
    colaborador: "Mariana",
    segmento: "Tecnologia",
    classe: "B",
    fechamento: "2026-08"
  },
  {
    id: 5,
    nome: "EPSILON INDUSTRIA METALURGICA SA",
    cnpj: "19.382.716/0001-50",
    regime: "Lucro Real Mensal",
    colaborador: "Brayann",
    segmento: "Indústria",
    classe: "A",
    fechamento: "2026-06"
  },
  {
    id: 6,
    nome: "ZETA FARMACEUTICA LTDA",
    cnpj: "05.123.987/0001-63",
    regime: "Lucro Presumido",
    colaborador: "Juliana",
    segmento: "Farmacêutico",
    classe: "C",
    fechamento: "2026-08"
  },
  {
    id: 7,
    nome: "THETA VAREJO E MODA LTDA",
    cnpj: "42.819.321/0001-77",
    regime: "Simples Nacional",
    colaborador: "Carlos",
    segmento: "Comércio Varejista",
    classe: "C",
    fechamento: "2026-05"
  },
  {
    id: 8,
    nome: "OMEGA CLINICA MEDICA INTEGRADA",
    cnpj: "27.654.321/0001-88",
    regime: "Lucro Real Trimestral",
    colaborador: "Mariana",
    segmento: "Saúde",
    classe: "B",
    fechamento: "2026-08"
  }
];

const INITIAL_TASKS = [
  {
    id: 1,
    titulo: "Conferir apuração de PIS/COFINS Alfa Engenharia",
    descricao: "Validar notas de entrada de materiais e créditos extemporâneos.",
    data: "2026-10-02",
    urgencia: "Alta",
    concluida: false
  },
  {
    id: 2,
    titulo: "Emitir DARF IRPJ Trimestral Beta Distribuidora",
    descricao: "Verificar se cliente optou por Quota Única ou 3 Parcelas.",
    data: "2026-10-05",
    urgencia: "Alta",
    concluida: false
  },
  {
    id: 3,
    titulo: "Solicitar extratos bancários pendentes Delta Tecnologia",
    descricao: "Contatar financeiro para conciliação da conta Santander.",
    data: "2026-10-10",
    urgencia: "Media",
    concluida: false
  },
  {
    id: 4,
    titulo: "Reunião de alinhamento com a diretoria",
    descricao: "Apresentação dos indicadores do fechamento do 3º trimestre.",
    data: "2026-10-15",
    urgencia: "Baixa",
    concluida: false
  }
];

// Competências para PIS/COFINS e IRPJ Mensal: 08/2026 até 12/2027
const MONTH_COMPETENCIES = [];
const years = [2026, 2027];
for (const yr of years) {
  const startM = yr === 2026 ? 8 : 1;
  const endM = 12;
  for (let m = startM; m <= endM; m++) {
    const padM = m.toString().padStart(2, '0');
    MONTH_COMPETENCIES.push(`${padM}/${yr}`);
  }
}

// Trimestres para IRPJ Trimestral
const QUARTERS = [
  "1º Trim 2026",
  "2º Trim 2026",
  "3º Trim 2026",
  "4º Trim 2026",
  "1º Trim 2027",
  "2º Trim 2027",
  "3º Trim 2027",
  "4º Trim 2027"
];

// Helper: Cálculo de status de fechamento
function getFechamentoStatus(mesFechamentoStr) {
  // mesFechamentoStr: "YYYY-MM"
  if (!mesFechamentoStr) return { status: 'critico', label: 'Sem Registro', color: 'red' };
  
  // Data atual no sistema: 2026-09
  const currentYear = 2026;
  const currentMonth = 9; // Setembro
  
  // Mês ideal é Mês Atual - 1 = Agosto 2026 (2026-08)
  const [fYear, fMonth] = mesFechamentoStr.split('-').map(Number);
  const diffMonths = (currentYear - fYear) * 12 + (currentMonth - fMonth);
  
  // Se diffMonths === 1 -> Fechou mês anterior (Em dia)
  // Se diffMonths === 2 ou 3 -> 1 a 2 meses de atraso
  // Se diffMonths > 3 -> Mais de 2 meses de atraso
  if (diffMonths <= 1) {
    return { status: 'em_dia', label: 'Em Dia (Mês Anterior)', color: 'green', class: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' };
  } else if (diffMonths <= 2) {
    return { status: 'atencao', label: '1 a 2 meses atraso', color: 'yellow', class: 'bg-amber-500/10 text-amber-400 border border-amber-500/30' };
  } else {
    return { status: 'critico', label: 'Mais de 2 meses atraso', color: 'red', class: 'bg-rose-500/10 text-rose-400 border border-rose-500/30' };
  }
}

// Componente do Ícone da Marca Control
function ControlLogo({ customLogoUrl, className = "h-10" }) {
  if (customLogoUrl) {
    return <img src={customLogoUrl} alt="Control Contabilidade" className={`${className} object-contain`} />;
  }
  return (
    <div className="flex items-center gap-3 select-none">
      <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-[#133E68] text-white shadow-md">
        {/* 'C' estilizado com checkmark dourado/laranja */}
        <span className="font-extrabold text-2xl tracking-tighter" style={{ fontFamily: 'Rethink Sans' }}>C</span>
        <svg className="absolute -bottom-0.5 -right-0.5 w-5 h-5 text-[#ECBD56] filter drop-shadow" viewBox="0 0 24 24" fill="currentColor">
          <path fillRule="evenodd" d="M19.707 6.293a1 1 0 010 1.414l-9.5 9.5a1 1 0 01-1.414 0l-4.5-4.5a1 1 0 111.414-1.414L9.5 14.086l8.793-8.793a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="flex flex-col">
        <span className="text-xl font-extrabold tracking-tight leading-none text-[#133E68] dark:text-white">
          control
        </span>
        <span className="text-[10px] tracking-[0.25em] uppercase font-bold text-[#ECBD56]">
          CONTABILIDADE
        </span>
      </div>
    </div>
  );
}

// Aplicação Principal
function App() {
  // Autenticação
  const [user, setUser] = React.useState(() => {
    return localStorage.getItem('control_auth_user') || null;
  });
  const [loginUser, setLoginUser] = React.useState('');
  const [loginPass, setLoginPass] = React.useState('');
  const [loginError, setLoginError] = React.useState('');

  // Tema Dark / Light
  const [theme, setTheme] = React.useState(() => {
    return localStorage.getItem('control_theme') || 'dark';
  });

  // Aba ativa
  const [activeTab, setActiveTab] = React.useState('dashboard');

  // Estado de Empresas
  const [companies, setCompanies] = React.useState(() => {
    const saved = localStorage.getItem('control_companies');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return INITIAL_COMPANIES;
  });

  // Estado de Tarefas
  const [tasks, setTasks] = React.useState(() => {
    const saved = localStorage.getItem('control_tasks');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return INITIAL_TASKS;
  });

  // Estado de DARFs PIS/COFINS (chave: `${companyId}_${competencia}`)
  const [pisCofinsData, setPisCofinsData] = React.useState(() => {
    const saved = localStorage.getItem('control_piscofins');
    return saved ? JSON.parse(saved) : {};
  });

  // Estado de IRPJ Trimestral (chave: `${companyId}_${trimestre}`)
  const [irpjTrimData, setIrpjTrimData] = React.useState(() => {
    const saved = localStorage.getItem('control_irpj_trim');
    return saved ? JSON.parse(saved) : {};
  });

  // Estado de IRPJ Mensal (chave: `${companyId}_${mes}`)
  const [irpjMensalData, setIrpjMensalData] = React.useState(() => {
    const saved = localStorage.getItem('control_irpj_mensal');
    return saved ? JSON.parse(saved) : {};
  });

  // Logo customizado
  const [customLogo, setCustomLogo] = React.useState(() => {
    return localStorage.getItem('control_custom_logo') || null;
  });

  // Busca global
  const [globalSearch, setGlobalSearch] = React.useState('');

  // Notificações
  const [isNotificationOpen, setIsNotificationOpen] = React.useState(false);

  // Modal de CRUD de Empresa
  const [companyModal, setCompanyModal] = React.useState({ isOpen: false, mode: 'create', company: null });

  // Competência selecionada nas abas
  const [selPisComp, setSelPisComp] = React.useState('09/2026');
  const [selTrim, setSelTrim] = React.useState('3º Trim 2026');
  const [selIrpjMes, setSelIrpjMes] = React.useState('09/2026');

  // Efeito para sincronizar tema na tag html
  React.useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      document.body.className = "bg-[#111116] text-gray-100 antialiased";
    } else {
      root.classList.remove('dark');
      document.body.className = "bg-[#EDEDE8] text-gray-900 antialiased";
    }
    localStorage.setItem('control_theme', theme);
  }, [theme]);

  // Persistência em localStorage
  React.useEffect(() => {
    localStorage.setItem('control_companies', JSON.stringify(companies));
  }, [companies]);

  React.useEffect(() => {
    localStorage.setItem('control_tasks', JSON.stringify(tasks));
  }, [tasks]);

  React.useEffect(() => {
    localStorage.setItem('control_piscofins', JSON.stringify(pisCofinsData));
  }, [pisCofinsData]);

  React.useEffect(() => {
    localStorage.setItem('control_irpj_trim', JSON.stringify(irpjTrimData));
  }, [irpjTrimData]);

  React.useEffect(() => {
    localStorage.setItem('control_irpj_mensal', JSON.stringify(irpjMensalData));
  }, [irpjMensalData]);

  // Atualizar ícones lucide
  React.useEffect(() => {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  });

  // Handler de Login
  const handleLogin = (e) => {
    e.preventDefault();
    if (loginUser === 'brayann' && loginPass === 'bra@7288') {
      setUser('brayann');
      localStorage.setItem('control_auth_user', 'brayann');
      setLoginError('');
    } else {
      setLoginError('Usuário ou senha inválidos. Utilize brayann / bra@7288');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('control_auth_user');
  };

  // Upload de Logo
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCustomLogo(event.target.result);
        localStorage.setItem('control_custom_logo', event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload de Planilha XLSX/CSV
  const handleSpreadsheetUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);

        if (json && json.length > 0) {
          const imported = json.map((row, idx) => ({
            id: Date.now() + idx,
            nome: row['Nome da Empresa'] || row['Nome'] || row['Razao Social'] || row['Empresa'] || `Empresa ${idx + 1}`,
            cnpj: row['CNPJ'] || '00.000.000/0001-00',
            regime: row['Regime'] || row['Regime Tributario'] || 'Lucro Real Mensal',
            colaborador: row['Colaborador'] || row['Responsavel'] || 'Brayann',
            segmento: row['Segmento'] || 'Serviços',
            classe: row['Classe'] || 'A',
            fechamento: row['Fechamento'] || '2026-08'
          }));
          setCompanies(imported);
          alert(`${imported.length} empresas carregadas com sucesso!`);
        }
      } catch (err) {
        alert('Erro ao processar a planilha. Verifique o formato.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Exportar Dados
  const handleExportData = () => {
    const ws = XLSX.utils.json_to_sheet(companies);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Empresas");
    XLSX.writeFile(wb, "Control_Contabilidade_Empresas.xlsx");
  };

  // Cálculo de Notificações / Alertas (Vencimentos no dia 25)
  // Data atual de referência: 29/09/2026
  // Faltam menos de 5 dias para o dia 25?
  // Se estivermos entre 20 e 25 do mês corrente.
  const today = new Date();
  const currentDay = today.getDate();
  const isNear25th = currentDay >= 20 && currentDay <= 25;

  const notifications = [];
  if (isNear25th) {
    notifications.push({
      id: 'alerta-dia-25',
      tipo: 'urgente',
      titulo: 'Atenção aos Vencimentos do dia 25!',
      mensagem: 'Faltam menos de 5 dias para a data limite de recolhimento dos DARFs de PIS, COFINS e IRPJ/CSLL.'
    });
  } else {
    notifications.push({
      id: 'alerta-proximo-fechamento',
      tipo: 'info',
      titulo: 'Vencimento Padrão: Dia 25',
      mensagem: 'Mantenha os DARFs do mês anterior conferidos e transmitidos até o dia 25.'
    });
  }

  // Verificar tarefas pendentes e vencidas
  const pendingTasks = tasks.filter(t => !t.concluida);
  const overdueTasks = pendingTasks.filter(t => new Date(t.data) < new Date('2026-09-29'));
  if (overdueTasks.length > 0) {
    notifications.push({
      id: 'tarefas-vencidas',
      tipo: 'alerta',
      titulo: `${overdueTasks.length} Tarefa(s) Vencida(s)`,
      mensagem: 'Existem tarefas prioritárias com prazo de conclusão ultrapassado.'
    });
  }

  // Filtragem global de empresas
  const filteredCompanies = companies.filter(c => {
    if (!globalSearch.trim()) return true;
    const q = globalSearch.toLowerCase();
    return c.nome.toLowerCase().includes(q) || c.cnpj.includes(q);
  });

  // Se não logado, exibe tela de login centralizada
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md p-8 rounded-3xl bg-white dark:bg-[#15151A] shadow-2xl border border-gray-200 dark:border-gray-800 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#133E68] via-[#ECBD56] to-[#133E68]"></div>
          
          <div className="flex flex-col items-center mb-8 mt-2">
            <ControlLogo customLogoUrl={customLogo} className="h-12" />
            <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">Acesso Restrito</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-1">
              Dashboard de Gestão e Controle Contábil
            </p>
          </div>

          {loginError && (
            <div className="mb-5 p-3 rounded-xl text-sm font-medium bg-rose-500/10 text-rose-500 border border-rose-500/30 flex items-center gap-2">
              <i data-lucide="alert-circle" className="w-5 h-5 flex-shrink-0"></i>
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                Usuário
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <i data-lucide="user" className="w-5 h-5"></i>
                </div>
                <input
                  type="text"
                  required
                  value={loginUser}
                  onChange={(e) => setLoginUser(e.target.value)}
                  placeholder="Seu usuário"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-gray-50 dark:bg-[#1C1C23] border border-gray-200 dark:border-gray-700/60 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ECBD56] transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <i data-lucide="lock" className="w-5 h-5"></i>
                </div>
                <input
                  type="password"
                  required
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-gray-50 dark:bg-[#1C1C23] border border-gray-200 dark:border-gray-700/60 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ECBD56] transition"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-full font-bold text-gray-950 bg-[#ECBD56] hover:bg-[#DEA93F] shadow-lg shadow-[#ECBD56]/20 transition flex items-center justify-center gap-2"
            >
              <span>Entrar no Sistema</span>
              <i data-lucide="arrow-right" className="w-5 h-5"></i>
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 text-center">
            <span className="text-xs text-gray-400">Control Contabilidade &bull; Versão 2.0</span>
          </div>
        </div>
      </div>
    );
  }

  // Aplicação Autenticada
  return (
    <div className="min-h-screen flex flex-col">
      {/* HEADER SUPERIOR */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-white/90 dark:bg-[#111116]/90 border-b border-gray-200 dark:border-gray-800/80 px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Logo e Titulo */}
          <div className="flex items-center gap-6">
            <div className="group relative cursor-pointer" title="Clique para alterar a logo da empresa">
              <ControlLogo customLogoUrl={customLogo} />
              <label className="absolute inset-0 flex items-center justify-center bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition cursor-pointer">
                <i data-lucide="camera" className="w-4 h-4"></i>
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              </label>
            </div>
          </div>

          {/* Barra de Pesquisa Global */}
          <div className="flex-1 max-w-md mx-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <i data-lucide="search" className="w-4 h-4"></i>
              </div>
              <input
                type="text"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder="Busca global por Nome ou CNPJ..."
                className="w-full pl-10 pr-4 py-2 rounded-full text-sm bg-gray-100 dark:bg-[#1C1C23] border border-transparent dark:border-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-[#ECBD56] focus:ring-1 focus:ring-[#ECBD56]"
              />
              {globalSearch && (
                <button
                  onClick={() => setGlobalSearch('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200"
                >
                  <i data-lucide="x" className="w-4 h-4"></i>
                </button>
              )}
            </div>
          </div>

          {/* Ações do Header (Sino, Tema, Perfil) */}
          <div className="flex items-center gap-3">
            
            {/* Botão de Notificações com Badge */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-[#1C1C23] text-gray-600 dark:text-gray-300 relative transition"
                title="Notificações e Vencimentos"
              >
                <i data-lucide="bell" className="w-5 h-5"></i>
                {notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#D94838] rounded-full ring-2 ring-white dark:ring-[#111116] animate-pulse"></span>
                )}
              </button>

              {/* Dropdown de Notificações */}
              {isNotificationOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-[#15151A] border border-gray-200 dark:border-gray-800 shadow-2xl p-4 z-50">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                      <i data-lucide="bell-ring" className="w-4 h-4 text-[#ECBD56]"></i>
                      Central de Alertas & Vencimentos
                    </h4>
                    <span className="text-xs text-gray-400">{notifications.length} novos</span>
                  </div>
                  <div className="mt-3 space-y-2.5 max-h-72 overflow-y-auto pr-1">
                    {notifications.map(n => (
                      <div
                        key={n.id}
                        className={`p-3 rounded-xl text-xs border ${
                          n.tipo === 'urgente' 
                            ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' 
                            : n.tipo === 'alerta'
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                            : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                        }`}
                      >
                        <div className="font-bold mb-1 flex items-center gap-1.5">
                          <i data-lucide="alert-triangle" className="w-3.5 h-3.5"></i>
                          {n.titulo}
                        </div>
                        <div className="text-gray-300 dark:text-gray-300 leading-relaxed">
                          {n.mensagem}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Alternador de Tema Dark/Light */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-[#1C1C23] text-gray-600 dark:text-gray-300 transition"
              title={theme === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
            >
              {theme === 'dark' ? (
                <i data-lucide="sun" className="w-5 h-5 text-[#ECBD56]"></i>
              ) : (
                <i data-lucide="moon" className="w-5 h-5 text-gray-700"></i>
              )}
            </button>

            {/* Botão de Carga de Dados (XLSX) */}
            <label className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-[#1C1C23] text-gray-600 dark:text-gray-300 cursor-pointer transition" title="Importar Planilha XLSX/CSV">
              <i data-lucide="upload-cloud" className="w-5 h-5 text-blue-500"></i>
              <input type="file" accept=".xlsx, .xls, .csv" onChange={handleSpreadsheetUpload} className="hidden" />
            </label>

            <button
              onClick={handleExportData}
              className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-[#1C1C23] text-gray-600 dark:text-gray-300 transition"
              title="Exportar Base de Empresas (XLSX)"
            >
              <i data-lucide="download" className="w-5 h-5"></i>
            </button>

            {/* Divisória */}
            <div className="h-6 w-px bg-gray-200 dark:bg-gray-800"></div>

            {/* Perfil & Logout */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 pl-1">
                <div className="w-8 h-8 rounded-full bg-[#ECBD56] text-gray-950 font-bold flex items-center justify-center text-sm">
                  B
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-xs font-bold leading-tight">{user}</div>
                  <div className="text-[10px] text-gray-400">Contábil</div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-full hover:bg-rose-500/10 text-gray-400 hover:text-rose-500 transition"
                title="Sair do Sistema"
              >
                <i data-lucide="log-out" className="w-4 h-4"></i>
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* BARRA DE NAVEGAÇÃO POR ABAS */}
      <nav className="bg-white dark:bg-[#15151A] border-b border-gray-200 dark:border-gray-800/80 px-6 py-2">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'dashboard', label: 'Dashboard Inicial', icon: 'layout-dashboard' },
            { id: 'fechamentos', label: 'Fechamentos', icon: 'calendar-check' },
            { id: 'piscofins', label: 'PIS / COFINS (Mensal)', icon: 'file-text' },
            { id: 'irpj_trim', label: 'IRPJ/CSLL Trimestral', icon: 'layers' },
            { id: 'irpj_mensal', label: 'IRPJ/CSLL Mensal', icon: 'calculator' },
            { id: 'tarefas', label: 'Tarefas', icon: 'check-square', badge: pendingTasks.length },
            { id: 'empresas', label: 'Empresas (CRUD)', icon: 'building-2', count: companies.length }
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition ${
                  isActive
                    ? 'bg-[#ECBD56] text-gray-950 shadow-md shadow-[#ECBD56]/20'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1C1C23] hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <i data-lucide={tab.icon} className="w-4 h-4"></i>
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${isActive ? 'bg-gray-950 text-white' : 'bg-[#D94838] text-white'}`}>
                    {tab.badge}
                  </span>
                )}
                {tab.count !== undefined && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${isActive ? 'bg-gray-950 text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-400'}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            companies={filteredCompanies}
            tasks={tasks}
            pisCofinsData={pisCofinsData}
            irpjTrimData={irpjTrimData}
            irpjMensalData={irpjMensalData}
            theme={theme}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'fechamentos' && (
          <FechamentosView
            companies={filteredCompanies}
            onUpdateFechamento={(id, newMonth) => {
              setCompanies(companies.map(c => c.id === id ? { ...c, fechamento: newMonth } : c));
            }}
          />
        )}

        {activeTab === 'piscofins' && (
          <PisCofinsView
            companies={filteredCompanies}
            pisCofinsData={pisCofinsData}
            selectedComp={selPisComp}
            onSelectComp={setSelPisComp}
            onUpdateStatus={(companyId, comp, status, darfEnviado) => {
              setPisCofinsData(prev => ({
                ...prev,
                [`${companyId}_${comp}`]: { status, darfEnviado }
              }));
            }}
            onResetMonth={(comp) => {
              if (confirm(`Deseja resetar o status de todas as empresas para 'Pendente' na competência ${comp}?`)) {
                setPisCofinsData(prev => {
                  const updated = { ...prev };
                  companies.forEach(c => {
                    updated[`${c.id}_${comp}`] = { status: 'Pendente', darfEnviado: false };
                  });
                  return updated;
                });
              }
            }}
          />
        )}

        {activeTab === 'irpj_trim' && (
          <IrpjTrimView
            companies={filteredCompanies}
            irpjTrimData={irpjTrimData}
            selectedTrim={selTrim}
            onSelectTrim={setSelTrim}
            onUpdateRecord={(companyId, trim, updateObj) => {
              setIrpjTrimData(prev => ({
                ...prev,
                [`${companyId}_${trim}`]: { ...(prev[`${companyId}_${trim}`] || {}), ...updateObj }
              }));
            }}
          />
        )}

        {activeTab === 'irpj_mensal' && (
          <IrpjMensalView
            companies={filteredCompanies}
            irpjMensalData={irpjMensalData}
            selectedMes={selIrpjMes}
            onSelectMes={setSelIrpjMes}
            onUpdateRecord={(companyId, mes, updateObj) => {
              setIrpjMensalData(prev => ({
                ...prev,
                [`${companyId}_${mes}`]: { ...(prev[`${companyId}_${mes}`] || {}), ...updateObj }
              }));
            }}
          />
        )}

        {activeTab === 'tarefas' && (
          <TarefasView
            tasks={tasks}
            onAddTask={(task) => setTasks([task, ...tasks])}
            onToggleComplete={(id) => {
              setTasks(tasks.map(t => t.id === id ? { ...t, concluida: !t.concluida } : t));
            }}
            onDeleteTask={(id) => {
              if (confirm('Deseja excluir permanentemente esta tarefa?')) {
                setTasks(tasks.filter(t => t.id !== id));
              }
            }}
          />
        )}

        {activeTab === 'empresas' && (
          <EmpresasCrudView
            companies={filteredCompanies}
            onOpenModal={(mode, company) => setCompanyModal({ isOpen: true, mode, company })}
            onDelete={(id) => {
              if (confirm('Confirma a exclusão desta empresa?')) {
                setCompanies(companies.filter(c => c.id !== id));
              }
            }}
          />
        )}
      </main>

      {/* MODAL DE CRUD DE EMPRESA */}
      {companyModal.isOpen && (
        <CompanyModal
          mode={companyModal.mode}
          company={companyModal.company}
          onClose={() => setCompanyModal({ isOpen: false, mode: 'create', company: null })}
          onSave={(companyData) => {
            if (companyModal.mode === 'create') {
              const newComp = { ...companyData, id: Date.now() };
              setCompanies([newComp, ...companies]);
            } else {
              setCompanies(companies.map(c => c.id === companyModal.company.id ? { ...c, ...companyData } : c));
            }
            setCompanyModal({ isOpen: false, mode: 'create', company: null });
          }}
        />
      )}
    </div>
  );
}

// ----------------------------------------------------
// ABA 1: DASHBOARD INICIAL
// ----------------------------------------------------
function DashboardView({ companies, tasks, pisCofinsData, irpjTrimData, irpjMensalData, theme, onNavigate }) {
  // Cálculos de Indicadores
  // 1. Total DARFs Pendentes PIS/COFINS (filtrar Lucro Real)
  const realCompanies = companies.filter(c => c.regime && c.regime.includes('Lucro Real'));
  let pendingPisCount = 0;
  realCompanies.forEach(c => {
    const record = pisCofinsData[`${c.id}_09/2026`];
    const status = record?.status || 'Pendente';
    if (status === 'Pendente') pendingPisCount++;
  });

  // 2. Total DARFs Pendentes IRPJ/CSLL (Trimestral e Mensal)
  const trimCompanies = companies.filter(c => c.regime === 'Lucro Real Trimestral');
  let pendingIrpjTrim = 0;
  trimCompanies.forEach(c => {
    const rec = irpjTrimData[`${c.id}_3º Trim 2026`];
    if (!rec?.prejuizo) {
      if (rec?.quotaUnica) {
        if (!rec?.darfUnica) pendingIrpjTrim++;
      } else {
        if (!rec?.p1 || !rec?.p2 || !rec?.p3) pendingIrpjTrim++;
      }
    }
  });

  const mensalCompanies = companies.filter(c => c.regime === 'Lucro Real Mensal');
  let pendingIrpjMensal = 0;
  mensalCompanies.forEach(c => {
    const rec = irpjMensalData[`${c.id}_09/2026`];
    const status = rec?.status || 'Pendente';
    if (!rec?.prejuizo && status === 'Pendente') pendingIrpjMensal++;
  });

  // 3. Métrica de Fechamentos (% Em Dia, % Atenção, % Crítico)
  let emDiaCount = 0;
  let atencaoCount = 0;
  let criticoCount = 0;
  companies.forEach(c => {
    const res = getFechamentoStatus(c.fechamento);
    if (res.status === 'em_dia') emDiaCount++;
    else if (res.status === 'atencao') atencaoCount++;
    else criticoCount++;
  });
  const total = companies.length || 1;
  const pctEmDia = Math.round((emDiaCount / total) * 100);
  const pctAtencao = Math.round((atencaoCount / total) * 100);
  const pctCritico = Math.round((criticoCount / total) * 100);

  // Renderização de Gráficos usando Canvas e Chart.js
  React.useEffect(() => {
    // Cores e tema
    const isDark = theme === 'dark';
    const textColor = isDark ? '#A1A1AA' : '#52525B';
    const gridColor = isDark ? '#27272A' : '#E4E4E7';

    // 1. Gráfico: Empresas por Colaborador
    const colabMap = {};
    companies.forEach(c => {
      const name = c.colaborador || 'Não Atribuído';
      colabMap[name] = (colabMap[name] || 0) + 1;
    });
    const ctx1 = document.getElementById('chartColab');
    let chart1;
    if (ctx1) {
      chart1 = new Chart(ctx1, {
        type: 'bar',
        data: {
          labels: Object.keys(colabMap),
          datasets: [{
            label: 'Empresas Atendidas',
            data: Object.values(colabMap),
            backgroundColor: '#ECBD56',
            borderRadius: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            x: { ticks: { color: textColor }, grid: { display: false } },
            y: { ticks: { color: textColor, precision: 0 }, grid: { color: gridColor } }
          }
        }
      });
    }

    // 2. Gráfico: Segmento de Atuação (Rosca)
    const segMap = {};
    companies.forEach(c => {
      const seg = c.segmento || 'Outros';
      segMap[seg] = (segMap[seg] || 0) + 1;
    });
    const ctx2 = document.getElementById('chartSegment');
    let chart2;
    if (ctx2) {
      chart2 = new Chart(ctx2, {
        type: 'doughnut',
        data: {
          labels: Object.keys(segMap),
          datasets: [{
            data: Object.values(segMap),
            backgroundColor: ['#ECBD56', '#133E68', '#22AC77', '#8B5CF6', '#D94838', '#0EA5E9'],
            borderWidth: isDark ? 2 : 1,
            borderColor: isDark ? '#15151A' : '#FFFFFF'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'right', labels: { color: textColor, boxWidth: 12 } }
          }
        }
      });
    }

    // 3. Gráfico: Status de Fechamento
    const ctx3 = document.getElementById('chartFechamento');
    let chart3;
    if (ctx3) {
      chart3 = new Chart(ctx3, {
        type: 'bar',
        data: {
          labels: ['Em Dia (Ideal)', 'Atenção (1-2m)', 'Crítico (>2m)'],
          datasets: [{
            data: [emDiaCount, atencaoCount, criticoCount],
            backgroundColor: ['#22AC77', '#F59E0B', '#D94838'],
            borderRadius: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { color: textColor }, grid: { display: false } },
            y: { ticks: { color: textColor, precision: 0 }, grid: { color: gridColor } }
          }
        }
      });
    }

    // 4. Gráfico: Categoria / Classe
    const classMap = { 'Classe A': 0, 'Classe B': 0, 'Classe C': 0 };
    companies.forEach(c => {
      const key = `Classe ${c.classe || 'C'}`;
      classMap[key] = (classMap[key] || 0) + 1;
    });
    const ctx4 = document.getElementById('chartClass');
    let chart4;
    if (ctx4) {
      chart4 = new Chart(ctx4, {
        type: 'doughnut',
        data: {
          labels: Object.keys(classMap),
          datasets: [{
            data: Object.values(classMap),
            backgroundColor: ['#ECBD56', '#133E68', '#5B5D64'],
            borderWidth: isDark ? 2 : 1,
            borderColor: isDark ? '#15151A' : '#FFFFFF'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'right', labels: { color: textColor, boxWidth: 12 } }
          }
        }
      });
    }

    // 5. Gráfico: PIS/COFINS (Pendentes vs Concluídos)
    const totalPis = realCompanies.length || 1;
    const concluidosPis = totalPis - pendingPisCount;
    const ctx5 = document.getElementById('chartPis');
    let chart5;
    if (ctx5) {
      chart5 = new Chart(ctx5, {
        type: 'pie',
        data: {
          labels: ['Pendentes', 'Concluídos'],
          datasets: [{
            data: [pendingPisCount, concluidosPis],
            backgroundColor: ['#D94838', '#22AC77'],
            borderWidth: isDark ? 2 : 1,
            borderColor: isDark ? '#15151A' : '#FFFFFF'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom', labels: { color: textColor, boxWidth: 12 } } }
        }
      });
    }

    // 6. Gráfico: IRPJ/CSLL (Pendentes vs Concluídos)
    const totalIrpj = (trimCompanies.length + mensalCompanies.length) || 1;
    const pendingTotalIrpj = pendingIrpjTrim + pendingIrpjMensal;
    const conclsTotalIrpj = Math.max(0, totalIrpj - pendingTotalIrpj);
    const ctx6 = document.getElementById('chartIrpj');
    let chart6;
    if (ctx6) {
      chart6 = new Chart(ctx6, {
        type: 'pie',
        data: {
          labels: ['Pendentes', 'Concluídos / Isentos'],
          datasets: [{
            data: [pendingTotalIrpj, conclsTotalIrpj],
            backgroundColor: ['#D94838', '#22AC77'],
            borderWidth: isDark ? 2 : 1,
            borderColor: isDark ? '#15151A' : '#FFFFFF'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom', labels: { color: textColor, boxWidth: 12 } } }
        }
      });
    }

    // 7. Gráfico: Tarefas (Aberto vs Concluídas)
    const abertasTasks = tasks.filter(t => !t.concluida).length;
    const concluidasTasks = tasks.filter(t => t.concluida).length;
    const ctx7 = document.getElementById('chartTasks');
    let chart7;
    if (ctx7) {
      chart7 = new Chart(ctx7, {
        type: 'doughnut',
        data: {
          labels: ['Em Aberto', 'Concluídas'],
          datasets: [{
            data: [abertasTasks, concluidasTasks],
            backgroundColor: ['#F59E0B', '#22AC77'],
            borderWidth: isDark ? 2 : 1,
            borderColor: isDark ? '#15151A' : '#FFFFFF'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom', labels: { color: textColor, boxWidth: 12 } } }
        }
      });
    }

    return () => {
      if (chart1) chart1.destroy();
      if (chart2) chart2.destroy();
      if (chart3) chart3.destroy();
      if (chart4) chart4.destroy();
      if (chart5) chart5.destroy();
      if (chart6) chart6.destroy();
      if (chart7) chart7.destroy();
    };
  }, [companies, tasks, pisCofinsData, irpjTrimData, irpjMensalData, theme]);

  return (
    <div className="space-y-6">
      {/* Título de Cabeçalho do Dashboard */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-2 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white uppercase">
            Dashboard de Gestão e Controle Contábil
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Visão consolidada de fechamentos fiscais, obrigações tributárias e produtividade da equipe
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 dark:bg-[#1C1C23] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800">
            Competência Base: 09/2026
          </span>
        </div>
      </div>

      {/* CARDS SUPERIORES DE INDICADORES (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Card 1: PIS / COFINS */}
        <div
          onClick={() => onNavigate('piscofins')}
          className="p-5 rounded-3xl bg-white dark:bg-[#15151A] border border-gray-200 dark:border-gray-800/80 shadow-sm hover:shadow-lg hover:border-[#ECBD56]/40 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              DARFs Pendentes PIS/COFINS
            </span>
            <div className="p-2.5 rounded-full bg-rose-500/10 text-rose-500">
              <i data-lucide="alert-circle" className="w-5 h-5"></i>
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
              {pendingPisCount}
            </span>
            <span className="text-xs font-semibold text-gray-400">
              de {realCompanies.length} empresas (Lucro Real)
            </span>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800/60 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Vencimento dia 25</span>
            <span className="text-[#ECBD56] font-bold group-hover:translate-x-1 transition flex items-center gap-1">
              Ver detalhes <i data-lucide="chevron-right" className="w-3.5 h-3.5"></i>
            </span>
          </div>
        </div>

        {/* Card 2: IRPJ / CSLL (Mensal e Trimestral) */}
        <div
          onClick={() => onNavigate('irpj_trim')}
          className="p-5 rounded-3xl bg-white dark:bg-[#15151A] border border-gray-200 dark:border-gray-800/80 shadow-sm hover:shadow-lg hover:border-[#ECBD56]/40 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              DARFs Pendentes IRPJ / CSLL
            </span>
            <div className="p-2.5 rounded-full bg-amber-500/10 text-amber-500">
              <i data-lucide="receipt" className="w-5 h-5"></i>
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-4">
            <div>
              <span className="text-3xl font-extrabold text-gray-900 dark:text-white">{pendingIrpjTrim}</span>
              <span className="text-[11px] font-bold uppercase text-gray-400 ml-1.5">Trimestrais</span>
            </div>
            <div className="w-px h-6 bg-gray-200 dark:bg-gray-800"></div>
            <div>
              <span className="text-3xl font-extrabold text-gray-900 dark:text-white">{pendingIrpjMensal}</span>
              <span className="text-[11px] font-bold uppercase text-gray-400 ml-1.5">Mensais</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800/60 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Acompanhamento Trimestral/Mensal</span>
            <span className="text-[#ECBD56] font-bold group-hover:translate-x-1 transition flex items-center gap-1">
              Gerenciar <i data-lucide="chevron-right" className="w-3.5 h-3.5"></i>
            </span>
          </div>
        </div>

        {/* Card 3: Métrica de Fechamentos */}
        <div
          onClick={() => onNavigate('fechamentos')}
          className="p-5 rounded-3xl bg-white dark:bg-[#15151A] border border-gray-200 dark:border-gray-800/80 shadow-sm hover:shadow-lg hover:border-[#ECBD56]/40 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Saúde dos Fechamentos
            </span>
            <div className="p-2.5 rounded-full bg-emerald-500/10 text-emerald-500">
              <i data-lucide="activity" className="w-5 h-5"></i>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="text-xl font-extrabold text-emerald-500">{pctEmDia}%</div>
              <div className="text-[10px] font-bold uppercase text-emerald-400">Em Dia</div>
            </div>
            <div className="p-2 rounded-2xl bg-amber-500/10 border border-amber-500/20">
              <div className="text-xl font-extrabold text-amber-500">{pctAtencao}%</div>
              <div className="text-[10px] font-bold uppercase text-amber-400">Atenção</div>
            </div>
            <div className="p-2 rounded-2xl bg-rose-500/10 border border-rose-500/20">
              <div className="text-xl font-extrabold text-rose-500">{pctCritico}%</div>
              <div className="text-[10px] font-bold uppercase text-rose-400">Crítico</div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800/60 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Ideal: Mês Anterior</span>
            <span className="text-[#ECBD56] font-bold group-hover:translate-x-1 transition flex items-center gap-1">
              Auditar <i data-lucide="chevron-right" className="w-3.5 h-3.5"></i>
            </span>
          </div>
        </div>

      </div>

      {/* GRID DE 7 GRÁFICOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* 1. Barras: Empresas por Colaborador Responsável */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#15151A] border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
              <i data-lucide="users" className="w-4 h-4 text-[#ECBD56]"></i>
              Empresas por Colaborador
            </h3>
          </div>
          <div className="h-56 relative">
            <canvas id="chartColab"></canvas>
          </div>
        </div>

        {/* 2. Rosca: Segmento de Atuação */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#15151A] border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
              <i data-lucide="pie-chart" className="w-4 h-4 text-[#ECBD56]"></i>
              Segmento de Atuação
            </h3>
          </div>
          <div className="h-56 relative">
            <canvas id="chartSegment"></canvas>
          </div>
        </div>

        {/* 3. Barras: Status Atual de Fechamento */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#15151A] border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
              <i data-lucide="bar-chart-3" className="w-4 h-4 text-[#ECBD56]"></i>
              Status de Fechamento
            </h3>
          </div>
          <div className="h-56 relative">
            <canvas id="chartFechamento"></canvas>
          </div>
        </div>

        {/* 4. Rosca: Categoria / Classe das Empresas */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#15151A] border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
              <i data-lucide="tag" className="w-4 h-4 text-[#ECBD56]"></i>
              Classificação por Classe
            </h3>
          </div>
          <div className="h-56 relative">
            <canvas id="chartClass"></canvas>
          </div>
        </div>

        {/* 5. Gráfico PIS/COFINS (Pendentes vs Concluídos) */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#15151A] border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
              <i data-lucide="file-check" className="w-4 h-4 text-[#ECBD56]"></i>
              PIS/COFINS (Mês Atual)
            </h3>
          </div>
          <div className="h-56 relative">
            <canvas id="chartPis"></canvas>
          </div>
        </div>

        {/* 6. Gráfico IRPJ/CSLL (Pendentes vs Concluídos) */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#15151A] border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
              <i data-lucide="coins" className="w-4 h-4 text-[#ECBD56]"></i>
              IRPJ/CSLL (Geral)
            </h3>
          </div>
          <div className="h-56 relative">
            <canvas id="chartIrpj"></canvas>
          </div>
        </div>

        {/* 7. Gráfico Tarefas (Aberto vs Vencidas/Concluídas) */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#15151A] border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
              <i data-lucide="check-circle-2" className="w-4 h-4 text-[#ECBD56]"></i>
              Índice de Tarefas da Equipe
            </h3>
            <span className="text-xs text-gray-400">Total: {tasks.length} cadastradas</span>
          </div>
          <div className="h-56 relative">
            <canvas id="chartTasks"></canvas>
          </div>
        </div>

      </div>
    </div>
  );
}

// ----------------------------------------------------
// ABA 2: FECHAMENTOS
// ----------------------------------------------------
function FechamentosView({ companies, onUpdateFechamento }) {
  const [filterStatus, setFilterStatus] = React.useState('all');

  const filtered = companies.filter(c => {
    if (filterStatus === 'all') return true;
    const res = getFechamentoStatus(c.fechamento);
    return res.status === filterStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-2 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white uppercase">
            Controle de Fechamentos Contábeis
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Competência ideal: mês anterior (2026-08). Acompanhe o avanço contábil por empresa.
          </p>
        </div>

        {/* Filtros de Status */}
        <div className="flex items-center gap-2 bg-white dark:bg-[#15151A] p-1.5 rounded-full border border-gray-200 dark:border-gray-800">
          {[
            { id: 'all', label: 'Todas' },
            { id: 'em_dia', label: '🟢 Em Dia' },
            { id: 'atencao', label: '🟡 Atenção' },
            { id: 'critico', label: '🔴 Crítico' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterStatus(f.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
                filterStatus === f.id
                  ? 'bg-[#ECBD56] text-gray-950'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabela de Fechamentos */}
      <div className="overflow-x-auto rounded-3xl bg-white dark:bg-[#15151A] border border-gray-200 dark:border-gray-800 shadow-sm">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800/80 bg-gray-50/50 dark:bg-[#1C1C23]/50 text-gray-400 uppercase text-[11px] font-bold tracking-wider">
              <th className="py-4 px-6">Empresa & CNPJ</th>
              <th className="py-4 px-4">Regime</th>
              <th className="py-4 px-4">Responsável</th>
              <th className="py-4 px-4">Último Fechamento</th>
              <th className="py-4 px-4">Status</th>
              <th className="py-4 px-6 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
            {filtered.map(c => {
              const st = getFechamentoStatus(c.fechamento);
              return (
                <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-[#1C1C23]/40 transition">
                  <td className="py-4 px-6">
                    <div className="font-bold text-gray-900 dark:text-white">{c.nome}</div>
                    <div className="text-xs text-gray-400 font-mono">{c.cnpj}</div>
                  </td>
                  <td className="py-4 px-4 text-xs font-semibold text-gray-600 dark:text-gray-300">
                    {c.regime}
                  </td>
                  <td className="py-4 px-4 text-xs font-medium text-gray-600 dark:text-gray-300">
                    {c.colaborador}
                  </td>
                  <td className="py-4 px-4">
                    <input
                      type="month"
                      value={c.fechamento || '2026-08'}
                      onChange={(e) => onUpdateFechamento(c.id, e.target.value)}
                      className="px-3 py-1.5 text-xs rounded-xl bg-gray-100 dark:bg-[#1C1C23] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#ECBD56]"
                    />
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${st.class}`}>
                      {st.label}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => onUpdateFechamento(c.id, '2026-08')}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[#22AC77]/10 text-[#22AC77] hover:bg-[#22AC77]/20 border border-[#22AC77]/30 transition"
                      title="Marcar como fechado no mês anterior"
                    >
                      Avançar para 08/2026
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// ABA 3: PIS / COFINS (MENSAL)
// ----------------------------------------------------
function PisCofinsView({ companies, pisCofinsData, selectedComp, onSelectComp, onUpdateStatus, onResetMonth }) {
  // Filtra apenas empresas do Lucro Real (Trimestral e Mensal)
  const realCompanies = companies.filter(c => c.regime && c.regime.includes('Lucro Real'));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-2 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white uppercase">
            Apuração PIS / COFINS (Mensal)
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Exclusivo para empresas do Regime de Lucro Real. Vencimento: dia 25.
          </p>
        </div>

        {/* Controles de Competência e Reset */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white dark:bg-[#15151A] px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-800">
            <span className="text-xs font-bold text-gray-400">Competência:</span>
            <select
              value={selectedComp}
              onChange={(e) => onSelectComp(e.target.value)}
              className="bg-transparent text-xs font-bold text-gray-900 dark:text-white focus:outline-none cursor-pointer"
            >
              {MONTH_COMPETENCIES.map(m => (
                <option key={m} value={m} className="bg-white dark:bg-[#15151A] text-gray-900 dark:text-white">
                  {m}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => onResetMonth(selectedComp)}
            className="px-4 py-2 rounded-full text-xs font-bold bg-[#D94838]/10 text-[#D94838] hover:bg-[#D94838]/20 border border-[#D94838]/30 transition flex items-center gap-1.5"
            title="Resetar todos os status para Pendente nesta competência"
          >
            <i data-lucide="rotate-ccw" className="w-3.5 h-3.5"></i>
            Resetar Mês
          </button>
        </div>
      </div>

      {/* Banner de Alerta dia 25 */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-amber-500 text-xs">
        <div className="flex items-center gap-2 font-medium">
          <i data-lucide="alert-triangle" className="w-5 h-5 flex-shrink-0"></i>
          <span>
            <strong>Atenção ao Prazo Legal:</strong> O DARF deve ser transmitido e pago até o dia 25 do mês subsequente (se dia não útil, antecipa-se para o dia útil anterior).
          </span>
        </div>
      </div>

      {/* Tabela de PIS/COFINS */}
      <div className="overflow-x-auto rounded-3xl bg-white dark:bg-[#15151A] border border-gray-200 dark:border-gray-800 shadow-sm">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800/80 bg-gray-50/50 dark:bg-[#1C1C23]/50 text-gray-400 uppercase text-[11px] font-bold tracking-wider">
              <th className="py-4 px-6">Empresa & CNPJ</th>
              <th className="py-4 px-4">Regime</th>
              <th className="py-4 px-4">Responsável</th>
              <th className="py-4 px-4">Situação</th>
              <th className="py-4 px-6 text-center">DARF Enviado?</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
            {realCompanies.map(c => {
              const record = pisCofinsData[`${c.id}_${selectedComp}`] || { status: 'Pendente', darfEnviado: false };
              return (
                <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-[#1C1C23]/40 transition">
                  <td className="py-4 px-6">
                    <div className="font-bold text-gray-900 dark:text-white">{c.nome}</div>
                    <div className="text-xs text-gray-400 font-mono">{c.cnpj}</div>
                  </td>
                  <td className="py-4 px-4 text-xs font-semibold text-gray-600 dark:text-gray-300">
                    {c.regime}
                  </td>
                  <td className="py-4 px-4 text-xs font-medium text-gray-600 dark:text-gray-300">
                    {c.colaborador}
                  </td>
                  <td className="py-4 px-4">
                    <select
                      value={record.status}
                      onChange={(e) => {
                        const newStatus = e.target.value;
                        const darf = newStatus === 'Concluída';
                        onUpdateStatus(c.id, selectedComp, newStatus, darf);
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold border focus:outline-none transition cursor-pointer ${
                        record.status === 'Concluída'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : record.status === 'Análise'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : record.status === 'Isenta'
                          ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      }`}
                    >
                      <option value="Pendente" className="bg-[#15151A] text-white">🔴 Pendente</option>
                      <option value="Análise" className="bg-[#15151A] text-white">🟡 Análise</option>
                      <option value="Concluída" className="bg-[#15151A] text-white">🟢 Concluída</option>
                      <option value="Isenta" className="bg-[#15151A] text-white">🟣 Isenta</option>
                    </select>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={record.darfEnviado || false}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          onUpdateStatus(c.id, selectedComp, checked ? 'Concluída' : 'Pendente', checked);
                        }}
                        className="w-5 h-5 rounded-md text-[#ECBD56] focus:ring-[#ECBD56] border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-[#1C1C23]"
                      />
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        {record.darfEnviado ? 'Enviado' : 'Não enviado'}
                      </span>
                    </label>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// ABA 4: IRPJ / CSLL (TRIMESTRAL)
// ----------------------------------------------------
function IrpjTrimView({ companies, irpjTrimData, selectedTrim, onSelectTrim, onUpdateRecord }) {
  // Filtro exclusivo para Lucro Real Trimestral
  const trimCompanies = companies.filter(c => c.regime === 'Lucro Real Trimestral');

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-2 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white uppercase">
            IRPJ / CSLL - Lucro Real Trimestral
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Apuração trimestral com opções de Quota Única ou Parcelamento em 3 Quotas.
          </p>
        </div>

        {/* Seletor de Trimestres */}
        <div className="flex items-center gap-2 bg-white dark:bg-[#15151A] px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-800">
          <span className="text-xs font-bold text-gray-400">Trimestre:</span>
          <select
            value={selectedTrim}
            onChange={(e) => onSelectTrim(e.target.value)}
            className="bg-transparent text-xs font-bold text-gray-900 dark:text-white focus:outline-none cursor-pointer"
          >
            {QUARTERS.map(q => (
              <option key={q} value={q} className="bg-white dark:bg-[#15151A] text-gray-900 dark:text-white">
                {q}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabela de IRPJ Trimestral */}
      <div className="overflow-x-auto rounded-3xl bg-white dark:bg-[#15151A] border border-gray-200 dark:border-gray-800 shadow-sm">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800/80 bg-gray-50/50 dark:bg-[#1C1C23]/50 text-gray-400 uppercase text-[11px] font-bold tracking-wider">
              <th className="py-4 px-6">Empresa & CNPJ</th>
              <th className="py-4 px-4">Responsável</th>
              <th className="py-4 px-4">Prejuízo Fiscal?</th>
              <th className="py-4 px-4">Modalidade de Pagamento</th>
              <th className="py-4 px-6 text-center">Status / DARFs</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
            {trimCompanies.map(c => {
              const record = irpjTrimData[`${c.id}_${selectedTrim}`] || {
                prejuizo: false,
                quotaUnica: true,
                darfUnica: false,
                p1: false,
                p2: false,
                p3: false
              };

              return (
                <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-[#1C1C23]/40 transition">
                  <td className="py-4 px-6">
                    <div className="font-bold text-gray-900 dark:text-white">{c.nome}</div>
                    <div className="text-xs text-gray-400 font-mono">{c.cnpj}</div>
                  </td>
                  <td className="py-4 px-4 text-xs font-medium text-gray-600 dark:text-gray-300">
                    {c.colaborador}
                  </td>
                  <td className="py-4 px-4">
                    <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={record.prejuizo || false}
                        onChange={(e) => onUpdateRecord(c.id, selectedTrim, { prejuizo: e.target.checked })}
                        className="w-5 h-5 rounded-md text-[#ECBD56] focus:ring-[#ECBD56]"
                      />
                      <span className={`text-xs font-bold ${record.prejuizo ? 'text-purple-400' : 'text-gray-400'}`}>
                        {record.prejuizo ? 'Sem DARF (Prejuízo)' : 'Não'}
                      </span>
                    </label>
                  </td>
                  <td className="py-4 px-4">
                    {record.prejuizo ? (
                      <span className="text-xs text-gray-400 italic">Dispensado</span>
                    ) : (
                      <div className="flex items-center gap-4 text-xs font-semibold">
                        <label className="inline-flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name={`mode_${c.id}`}
                            checked={record.quotaUnica}
                            onChange={() => onUpdateRecord(c.id, selectedTrim, { quotaUnica: true })}
                            className="text-[#ECBD56] focus:ring-[#ECBD56]"
                          />
                          <span>Quota Única</span>
                        </label>
                        <label className="inline-flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name={`mode_${c.id}`}
                            checked={!record.quotaUnica}
                            onChange={() => onUpdateRecord(c.id, selectedTrim, { quotaUnica: false })}
                            className="text-[#ECBD56] focus:ring-[#ECBD56]"
                          />
                          <span>3 Parcelas</span>
                        </label>
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-6 text-center">
                    {record.prejuizo ? (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30">
                        🟢 Concluído (Prejuízo)
                      </span>
                    ) : record.quotaUnica ? (
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={record.darfUnica || false}
                          onChange={(e) => onUpdateRecord(c.id, selectedTrim, { darfUnica: e.target.checked })}
                          className="w-5 h-5 rounded-md text-[#22AC77]"
                        />
                        <span className={`text-xs font-bold ${record.darfUnica ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {record.darfUnica ? 'DARF Única Paga' : 'DARF Pendente'}
                        </span>
                      </label>
                    ) : (
                      <div className="flex items-center justify-center gap-3">
                        <label className="inline-flex items-center gap-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={record.p1 || false}
                            onChange={(e) => onUpdateRecord(c.id, selectedTrim, { p1: e.target.checked })}
                            className="w-4 h-4 rounded text-[#22AC77]"
                          />
                          <span className={`text-xs ${record.p1 ? 'text-emerald-400 font-bold' : 'text-gray-400'}`}>1ª</span>
                        </label>
                        <label className="inline-flex items-center gap-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={record.p2 || false}
                            onChange={(e) => onUpdateRecord(c.id, selectedTrim, { p2: e.target.checked })}
                            className="w-4 h-4 rounded text-[#22AC77]"
                          />
                          <span className={`text-xs ${record.p2 ? 'text-emerald-400 font-bold' : 'text-gray-400'}`}>2ª</span>
                        </label>
                        <label className="inline-flex items-center gap-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={record.p3 || false}
                            onChange={(e) => onUpdateRecord(c.id, selectedTrim, { p3: e.target.checked })}
                            className="w-4 h-4 rounded text-[#22AC77]"
                          />
                          <span className={`text-xs ${record.p3 ? 'text-emerald-400 font-bold' : 'text-gray-400'}`}>3ª</span>
                        </label>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// ABA 5: IRPJ / CSLL (MENSAL)
// ----------------------------------------------------
function IrpjMensalView({ companies, irpjMensalData, selectedMes, onSelectMes, onUpdateRecord }) {
  // Filtro exclusivo para Lucro Real Mensal
  const mensalCompanies = companies.filter(c => c.regime === 'Lucro Real Mensal');

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-2 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white uppercase">
            IRPJ / CSLL - Lucro Real Mensal
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Apuração mensal por estimativa com opções de recolhimento ou prejuízo acumulado.
          </p>
        </div>

        {/* Seletor de Competência Mensal */}
        <div className="flex items-center gap-2 bg-white dark:bg-[#15151A] px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-800">
          <span className="text-xs font-bold text-gray-400">Mês:</span>
          <select
            value={selectedMes}
            onChange={(e) => onSelectMes(e.target.value)}
            className="bg-transparent text-xs font-bold text-gray-900 dark:text-white focus:outline-none cursor-pointer"
          >
            {MONTH_COMPETENCIES.map(m => (
              <option key={m} value={m} className="bg-white dark:bg-[#15151A] text-gray-900 dark:text-white">
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabela de IRPJ Mensal */}
      <div className="overflow-x-auto rounded-3xl bg-white dark:bg-[#15151A] border border-gray-200 dark:border-gray-800 shadow-sm">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800/80 bg-gray-50/50 dark:bg-[#1C1C23]/50 text-gray-400 uppercase text-[11px] font-bold tracking-wider">
              <th className="py-4 px-6">Empresa & CNPJ</th>
              <th className="py-4 px-4">Responsável</th>
              <th className="py-4 px-4">Prejuízo Fiscal?</th>
              <th className="py-4 px-4">Situação</th>
              <th className="py-4 px-6 text-center">Status Final</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
            {mensalCompanies.map(c => {
              const record = irpjMensalData[`${c.id}_${selectedMes}`] || { status: 'Pendente', prejuizo: false };

              return (
                <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-[#1C1C23]/40 transition">
                  <td className="py-4 px-6">
                    <div className="font-bold text-gray-900 dark:text-white">{c.nome}</div>
                    <div className="text-xs text-gray-400 font-mono">{c.cnpj}</div>
                  </td>
                  <td className="py-4 px-4 text-xs font-medium text-gray-600 dark:text-gray-300">
                    {c.colaborador}
                  </td>
                  <td className="py-4 px-4">
                    <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={record.prejuizo || false}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          onUpdateRecord(c.id, selectedMes, {
                            prejuizo: checked,
                            status: checked ? 'Concluída' : 'Pendente'
                          });
                        }}
                        className="w-5 h-5 rounded-md text-[#ECBD56] focus:ring-[#ECBD56]"
                      />
                      <span className={`text-xs font-bold ${record.prejuizo ? 'text-purple-400' : 'text-gray-400'}`}>
                        {record.prejuizo ? 'Sim (Sem DARF)' : 'Não'}
                      </span>
                    </label>
                  </td>
                  <td className="py-4 px-4">
                    {record.prejuizo ? (
                      <span className="text-xs text-purple-400 font-semibold">Concluído via Prejuízo</span>
                    ) : (
                      <select
                        value={record.status}
                        onChange={(e) => onUpdateRecord(c.id, selectedMes, { status: e.target.value })}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold border focus:outline-none transition cursor-pointer ${
                          record.status === 'Concluída'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : record.status === 'Análise'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : record.status === 'Estimativa'
                            ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        }`}
                      >
                        <option value="Pendente" className="bg-[#15151A] text-white">🔴 Pendente</option>
                        <option value="Análise" className="bg-[#15151A] text-white">🟡 Análise</option>
                        <option value="Concluída" className="bg-[#15151A] text-white">🟢 Concluída</option>
                        <option value="Estimativa" className="bg-[#15151A] text-white">🟣 Estimativa</option>
                      </select>
                    )}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      record.status === 'Concluída' || record.prejuizo
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                    }`}>
                      {record.status === 'Concluída' || record.prejuizo ? 'Concluído' : 'Pendente'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// ABA 6: TAREFAS (Estilo Google Tasks)
// ----------------------------------------------------
function TarefasView({ tasks, onAddTask, onToggleComplete, onDeleteTask }) {
  const [subTab, setSubTab] = React.useState('ativas'); // 'ativas' ou 'concluidas'
  const [newTitle, setNewTitle] = React.useState('');
  const [newDesc, setNewDesc] = React.useState('');
  const [newDate, setNewDate] = React.useState('2026-10-05');
  const [newUrgency, setNewUrgency] = React.useState('Alta');

  // Adicionar Tarefa
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddTask({
      id: Date.now(),
      titulo: newTitle.trim(),
      descricao: newDesc.trim(),
      data: newDate,
      urgencia: newUrgency,
      concluida: false
    });

    setNewTitle('');
    setNewDesc('');
  };

  // Ordenação inteligente:
  // 1. Alta Prioridade primeiro, depois Média, depois Baixa
  // 2. Data de vencimento mais próxima
  const urgencyWeight = { 'Alta': 3, 'Media': 2, 'Baixa': 1 };
  
  const activeTasks = tasks.filter(t => !t.concluida).sort((a, b) => {
    const diffUrg = (urgencyWeight[b.urgencia] || 1) - (urgencyWeight[a.urgencia] || 1);
    if (diffUrg !== 0) return diffUrg;
    return new Date(a.data) - new Date(b.data);
  });

  const completedTasks = tasks.filter(t => t.concluida);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-2 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white uppercase">
            Gestão de Tarefas (Google Tasks)
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Organize pendências com ordenação automática por urgência e proximidade de vencimento.
          </p>
        </div>

        {/* Abas Ativas / Concluídas */}
        <div className="flex items-center gap-2 bg-white dark:bg-[#15151A] p-1.5 rounded-full border border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setSubTab('ativas')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
              subTab === 'ativas'
                ? 'bg-[#ECBD56] text-gray-950'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            Pendentes ({activeTasks.length})
          </button>
          <button
            onClick={() => setSubTab('concluidas')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
              subTab === 'concluidas'
                ? 'bg-[#ECBD56] text-gray-950'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            Concluídas ({completedTasks.length})
          </button>
        </div>
      </div>

      {/* Formulário Rápido de Adicionar Tarefa */}
      <form onSubmit={handleSubmit} className="p-5 rounded-3xl bg-white dark:bg-[#15151A] border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <i data-lucide="plus-circle" className="w-5 h-5 text-[#ECBD56]"></i>
          <span className="font-bold text-sm text-gray-900 dark:text-white">Criar Nova Tarefa</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            required
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Título da tarefa..."
            className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-[#1C1C23] border border-gray-200 dark:border-gray-700/60 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#ECBD56]"
          />
          <input
            type="text"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder="Descrição ou observações (opcional)..."
            className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-[#1C1C23] border border-gray-200 dark:border-gray-700/60 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#ECBD56]"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-400">Data Limite:</span>
              <input
                type="date"
                required
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-[#1C1C23] border border-gray-200 dark:border-gray-700/60 text-gray-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-[#ECBD56]"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-400">Urgência:</span>
              <select
                value={newUrgency}
                onChange={(e) => setNewUrgency(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-[#1C1C23] border border-gray-200 dark:border-gray-700/60 text-gray-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#ECBD56]"
              >
                <option value="Alta">🔴 Alta</option>
                <option value="Media">🟡 Média</option>
                <option value="Baixa">🟢 Baixa</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="px-6 py-2 rounded-full font-bold text-xs text-gray-950 bg-[#ECBD56] hover:bg-[#DEA93F] transition shadow-md shadow-[#ECBD56]/20 flex items-center gap-1.5"
          >
            <i data-lucide="plus" className="w-4 h-4"></i>
            Adicionar Tarefa
          </button>
        </div>
      </form>

      {/* Lista de Tarefas */}
      <div className="space-y-3">
        {(subTab === 'ativas' ? activeTasks : completedTasks).map(task => (
          <div
            key={task.id}
            className={`p-4 rounded-2xl border transition flex items-start gap-4 ${
              task.concluida
                ? 'bg-gray-50/50 dark:bg-[#15151A]/40 border-gray-200 dark:border-gray-800/40 opacity-70'
                : 'bg-white dark:bg-[#15151A] border-gray-200 dark:border-gray-800 shadow-sm hover:border-[#ECBD56]/40'
            }`}
          >
            {/* Checkbox redonda com animação */}
            <button
              onClick={() => onToggleComplete(task.id)}
              className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                task.concluida
                  ? 'bg-[#22AC77] border-[#22AC77] text-white'
                  : 'border-gray-300 dark:border-gray-600 hover:border-[#ECBD56]'
              }`}
              title={task.concluida ? 'Reabrir tarefa' : 'Marcar como concluída'}
            >
              {task.concluida && <i data-lucide="check" className="w-3.5 h-3.5"></i>}
            </button>

            {/* Conteúdo da Tarefa */}
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h4 className={`font-bold text-sm ${task.concluida ? 'line-through text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                  {task.titulo}
                </h4>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  task.urgencia === 'Alta'
                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                    : task.urgencia === 'Media'
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {task.urgencia}
                </span>
              </div>
              {task.descricao && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {task.descricao}
                </p>
              )}
              <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-400">
                <span className="flex items-center gap-1">
                  <i data-lucide="calendar" className="w-3 h-3"></i>
                  Vencimento: {task.data}
                </span>
              </div>
            </div>

            {/* Botão de Excluir */}
            <button
              onClick={() => onDeleteTask(task.id)}
              className="p-1.5 rounded-full hover:bg-rose-500/10 text-gray-400 hover:text-rose-500 transition"
              title="Excluir tarefa"
            >
              <i data-lucide="trash-2" className="w-4 h-4"></i>
            </button>
          </div>
        ))}

        {(subTab === 'ativas' ? activeTasks : completedTasks).length === 0 && (
          <div className="p-8 text-center rounded-3xl bg-white dark:bg-[#15151A] border border-gray-200 dark:border-gray-800 text-gray-400">
            <i data-lucide="check-circle-2" className="w-10 h-10 mx-auto text-emerald-500/40 mb-2"></i>
            <p className="text-sm font-semibold">Nenhuma tarefa {subTab === 'ativas' ? 'pendente' : 'concluída'} no momento!</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ----------------------------------------------------
// ABA 7: EMPRESAS (CRUD COMPLETO)
// ----------------------------------------------------
function EmpresasCrudView({ companies, onOpenModal, onDelete }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-2 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white uppercase">
            Cadastro e Gestão de Empresas
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Base cadastral com {companies.length} empresas ativas e regimes tributários parametrizados.
          </p>
        </div>

        <button
          onClick={() => onOpenModal('create')}
          className="px-5 py-2.5 rounded-full font-bold text-xs text-gray-950 bg-[#ECBD56] hover:bg-[#DEA93F] transition shadow-md shadow-[#ECBD56]/20 flex items-center gap-2"
        >
          <i data-lucide="plus" className="w-4 h-4"></i>
          Cadastrar Empresa
        </button>
      </div>

      {/* Tabela de Empresas */}
      <div className="overflow-x-auto rounded-3xl bg-white dark:bg-[#15151A] border border-gray-200 dark:border-gray-800 shadow-sm">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800/80 bg-gray-50/50 dark:bg-[#1C1C23]/50 text-gray-400 uppercase text-[11px] font-bold tracking-wider">
              <th className="py-4 px-6">ID & Razão Social</th>
              <th className="py-4 px-4">CNPJ</th>
              <th className="py-4 px-4">Regime Tributário</th>
              <th className="py-4 px-4">Responsável</th>
              <th className="py-4 px-4">Segmento / Classe</th>
              <th className="py-4 px-6 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
            {companies.map(c => (
              <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-[#1C1C23]/40 transition">
                <td className="py-4 px-6">
                  <div className="font-bold text-gray-900 dark:text-white">{c.nome}</div>
                  <div className="text-[11px] text-gray-400">Código ID: #{c.id}</div>
                </td>
                <td className="py-4 px-4 font-mono text-xs text-gray-600 dark:text-gray-300">
                  {c.cnpj}
                </td>
                <td className="py-4 px-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    c.regime && c.regime.includes('Real')
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                      : 'bg-gray-500/10 text-gray-400 border border-gray-500/30'
                  }`}>
                    {c.regime}
                  </span>
                </td>
                <td className="py-4 px-4 text-xs font-medium text-gray-600 dark:text-gray-300">
                  {c.colaborador}
                </td>
                <td className="py-4 px-4 text-xs text-gray-500 dark:text-gray-400">
                  <div>{c.segmento}</div>
                  <span className="font-bold text-gray-700 dark:text-gray-200">Classe {c.classe}</span>
                </td>
                <td className="py-4 px-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onOpenModal('view', c)}
                      className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-[#1C1C23] text-gray-400 hover:text-white transition"
                      title="Visualizar Detalhes"
                    >
                      <i data-lucide="eye" className="w-4 h-4"></i>
                    </button>
                    <button
                      onClick={() => onOpenModal('edit', c)}
                      className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-[#1C1C23] text-gray-400 hover:text-[#ECBD56] transition"
                      title="Editar Empresa"
                    >
                      <i data-lucide="edit-3" className="w-4 h-4"></i>
                    </button>
                    <button
                      onClick={() => onDelete(c.id)}
                      className="p-1.5 rounded-full hover:bg-rose-500/10 text-gray-400 hover:text-rose-500 transition"
                      title="Excluir Empresa"
                    >
                      <i data-lucide="trash-2" className="w-4 h-4"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// MODAL: FORMULÁRIO DE EMPRESA (CRUD)
// ----------------------------------------------------
function CompanyModal({ mode, company, onClose, onSave }) {
  const isView = mode === 'view';
  const [formData, setFormData] = React.useState({
    nome: company?.nome || '',
    cnpj: company?.cnpj || '',
    regime: company?.regime || 'Lucro Real Mensal',
    colaborador: company?.colaborador || 'Brayann',
    segmento: company?.segmento || 'Serviços',
    classe: company?.classe || 'A',
    fechamento: company?.fechamento || '2026-08'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nome.trim()) return;
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#15151A] border border-gray-200 dark:border-gray-800 shadow-2xl p-6 relative">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="font-extrabold text-lg text-gray-900 dark:text-white flex items-center gap-2">
            <i data-lucide="building" className="w-5 h-5 text-[#ECBD56]"></i>
            {mode === 'create' ? 'Cadastrar Nova Empresa' : mode === 'edit' ? 'Editar Empresa' : 'Detalhes da Empresa'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-[#1C1C23] text-gray-400 hover:text-white"
          >
            <i data-lucide="x" className="w-5 h-5"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">Razão Social / Nome</label>
            <input
              type="text"
              required
              disabled={isView}
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-[#1C1C23] border border-gray-200 dark:border-gray-700/60 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#ECBD56]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">CNPJ</label>
              <input
                type="text"
                required
                disabled={isView}
                value={formData.cnpj}
                onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                placeholder="00.000.000/0001-00"
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-[#1C1C23] border border-gray-200 dark:border-gray-700/60 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#ECBD56]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Regime Tributário</label>
              <select
                disabled={isView}
                value={formData.regime}
                onChange={(e) => setFormData({ ...formData, regime: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-[#1C1C23] border border-gray-200 dark:border-gray-700/60 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#ECBD56]"
              >
                <option value="Lucro Real Mensal">Lucro Real Mensal</option>
                <option value="Lucro Real Trimestral">Lucro Real Trimestral</option>
                <option value="Lucro Presumido">Lucro Presumido</option>
                <option value="Simples Nacional">Simples Nacional</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Responsável</label>
              <input
                type="text"
                disabled={isView}
                value={formData.colaborador}
                onChange={(e) => setFormData({ ...formData, colaborador: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-[#1C1C23] border border-gray-200 dark:border-gray-700/60 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#ECBD56]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Segmento</label>
              <input
                type="text"
                disabled={isView}
                value={formData.segmento}
                onChange={(e) => setFormData({ ...formData, segmento: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-[#1C1C23] border border-gray-200 dark:border-gray-700/60 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#ECBD56]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Classe</label>
              <select
                disabled={isView}
                value={formData.classe}
                onChange={(e) => setFormData({ ...formData, classe: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-[#1C1C23] border border-gray-200 dark:border-gray-700/60 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#ECBD56]"
              >
                <option value="A">Classe A</option>
                <option value="B">Classe B</option>
                <option value="C">Classe C</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">Mês de Fechamento Atual</label>
            <input
              type="month"
              disabled={isView}
              value={formData.fechamento}
              onChange={(e) => setFormData({ ...formData, fechamento: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-[#1C1C23] border border-gray-200 dark:border-gray-700/60 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#ECBD56]"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full text-xs font-bold text-gray-400 hover:text-white transition"
            >
              Cancelar
            </button>
            {!isView && (
              <button
                type="submit"
                className="px-6 py-2.5 rounded-full font-bold text-xs text-gray-950 bg-[#ECBD56] hover:bg-[#DEA93F] transition shadow-md shadow-[#ECBD56]/20"
              >
                Salvar Empresa
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

// Renderiza a aplicação no elemento root
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
