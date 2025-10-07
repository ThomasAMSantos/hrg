// script.js

// Variáveis globais para simular o banco de dados e o usuário logado
let loggedInUser = null; // Armazena o usuário logado
const USERS = [
    { id: 'CRM123', password: '123', profession: 'medico', name: 'Dr. João Silva' },
    { id: 'COREN456', password: '123', profession: 'enfermeiro', name: 'Enf. Maria Souza' },
    { id: 'CREFITO789', password: '123', profession: 'fisioterapeuta', name: 'Fisio. Ana Costa' },
    { id: 'CRN101', password: '123', profession: 'nutricionista', name: 'Nutri. Carlos Pereira' },
    { id: 'CRP202', password: '123', profession: 'psicologo', name: 'Psic. Laura Mendes' },
    { id: 'CRO303', password: '123', profession: 'odontologo', name: 'Odonto. Pedro Lima' },
    { id: 'CRF404', password: '123', profession: 'farmaceutico', name: 'Farm. Sofia Costa' },
    { id: 'COREN505', password: '123', profession: 'tecnico_enfermagem', name: 'Téc. Enfermagem Bruno' },
    { id: 'CRFa606', password: '123', profession: 'fonoaudiologo', name: 'Fono. Gabriela Dias' },
    { id: 'OUTRO777', password: '123', profession: 'outro', name: 'Outro Profissional' },
];

// --- Funções de Autenticação ---

function handleLogin(event) {
    event.preventDefault();
    const identificationInput = document.getElementById('identification');
    const passwordInput = document.getElementById('password');
    const professionSelect = document.getElementById('profession');
    const errorMessage = document.getElementById('errorMessage');

    const identification = identificationInput.value.trim();
    const password = passwordInput.value.trim();
    const profession = professionSelect.value;

    errorMessage.textContent = '';

    if (!identification || !password || !profession) {
        errorMessage.textContent = 'Por favor, preencha todos os campos.';
        return;
    }

    const user = USERS.find(u =>
        u.id === identification &&
        u.password === password &&
        u.profession === profession
    );

    if (user) {
        localStorage.setItem('loggedInUser', JSON.stringify(user));
        window.location.href = 'dashboard.html';
    } else {
        errorMessage.textContent = 'Credenciais inválidas ou tipo de profissional incorreto.';
    }
}

function checkAuth() {
    const user = localStorage.getItem('loggedInUser');
    if (!user || user === 'null') {
        if (window.location.pathname.includes('dashboard.html') || window.location.pathname.includes('patient_form.html')) {
            window.location.href = 'index.html';
        }
    } else {
        try {
            loggedInUser = JSON.parse(user);
        } catch (e) {
            console.error('Erro ao fazer parse do usuário:', e);
            localStorage.removeItem('loggedInUser');
            window.location.href = 'index.html';
        }
    }
}

function logout() {
    localStorage.removeItem('loggedInUser');
    window.location.href = 'index.html';
}

// --- Funções de Gerenciamento de Pacientes (Seguras para localStorage) ---

function loadPatients() {
    try {
        const patientsJSON = localStorage.getItem('patients');
        return patientsJSON ? JSON.parse(patientsJSON) : [];
    } catch (e) {
        console.error('Erro ao carregar pacientes do localStorage:', e);
        return [];
    }
}

function savePatients(patients) {
    try {
        localStorage.setItem('patients', JSON.stringify(patients));
    } catch (e) {
        console.error('Erro ao salvar pacientes no localStorage. O armazenamento pode estar cheio ou bloqueado.', e);
        // Em um ambiente de produção real, usaríamos um mecanismo de fallback (e.g., banco de dados).
    }
}

function savePatient(patientData) {
    let patients = loadPatients();
    if (patientData.id) {
        patients = patients.map(p => p.id === patientData.id ? patientData : p);
    } else {
        patientData.id = Date.now().toString();
        patients.push(patientData);
    }
    savePatients(patients);
}

function deletePatient(patientId) {
    let patients = loadPatients();
    patients = patients.filter(p => p.id !== patientId);
    savePatients(patients);
}

function renderPatientsTable() {
    // Lógica da tabela...
    const patients = loadPatients();
    const patientListBody = document.getElementById('patientListBody');
    if (!patientListBody) return;

    patientListBody.innerHTML = ''; 

    if (patients.length === 0) {
        patientListBody.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                    Nenhum paciente cadastrado.
                </td>
            </tr>
        `;
        return;
    }

    patients.forEach(patient => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${patient.name || 'N/A'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${patient.prontuario || 'N/A'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${patient.leito || 'N/A'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${patient.diagnostico ? (patient.diagnostico.length > 50 ? patient.diagnostico.substring(0, 50) + '...' : patient.diagnostico) : 'N/A'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div class="flex items-center justify-center space-x-2">
                    <button onclick="viewPatient('${patient.id}')"
                            class="text-blue-600 hover:text-blue-900 transition duration-150 ease-in-out p-1 rounded-md hover:bg-blue-100" title="Visualizar">
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                    </button>
                    <button onclick="editPatient('${patient.id}')"
                            class="text-yellow-600 hover:text-yellow-900 transition duration-150 ease-in-out p-1 rounded-md hover:bg-yellow-100" title="Editar">
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                    </button>
                    <button onclick="confirmDeletePatient('${patient.id}')"
                            class="text-red-600 hover:text-red-900 transition duration-150 ease-in-out p-1 rounded-md hover:bg-red-100" title="Excluir">
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                    
                    <div class="relative inline-block text-left dropdown">
                        <button type="button" class="inline-flex justify-center rounded-md border border-gray-300 shadow-sm p-1 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out" id="options-menu-${patient.id}" aria-haspopup="true" aria-expanded="true" title="Outras Ações">
                            <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                        </button>
                        <div class="dropdown-menu origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 hidden" role="menu" aria-orientation="vertical" aria-labelledby="options-menu-${patient.id}">
                            <div class="py-1">
                                <a href="#" onclick="imprimirDocumento('${patient.id}')" class="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100" role="menuitem">Imprimir</a>
                                <a href="#" onclick="exportToPdf('${patient.id}')" class="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100" role="menuitem">Exportar PDF</a>
                                <a href="#" onclick="exportToCsv('${patient.id}')" class="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100" role="menuitem">Exportar CSV</a>
                                <a href="#" onclick="exportToMarkdown('${patient.id}')" class="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100" role="menuitem">Exportar Markdown</a>
                            </div>
                        </div>
                    </div>
                </div>
            </td>
        `;
        patientListBody.appendChild(row);
    });

    document.querySelectorAll('.dropdown').forEach(dropdown => {
        dropdown.addEventListener('click', (event) => {
            event.stopPropagation();
            const dropdownMenu = dropdown.querySelector('.dropdown-menu');
            dropdownMenu.classList.toggle('hidden');
        });
    });

    document.addEventListener('click', () => {
        document.querySelectorAll('.dropdown-menu').forEach(menu => {
            menu.classList.add('hidden');
        });
    });
}

function viewPatient(patientId) {
    window.location.href = `patient_form.html?id=${patientId}&mode=view`;
}

function editPatient(patientId) {
    window.location.href = `patient_form.html?id=${patientId}&mode=edit`;
}

function confirmDeletePatient(patientId) {
    const modal = document.getElementById('deleteConfirmationModal');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');

    if (modal && confirmDeleteBtn && cancelDeleteBtn) {
        modal.classList.remove('hidden'); 

        confirmDeleteBtn.onclick = null;
        cancelDeleteBtn.onclick = null;

        confirmDeleteBtn.onclick = () => {
            deletePatient(patientId);
            renderPatientsTable(); 
            modal.classList.add('hidden'); 
        };
        cancelDeleteBtn.onclick = () => {
            modal.classList.add('hidden'); 
        };
    } 
}

/**
 * Função para imprimir o conteúdo da página do formulário.
 * Usa window.print() para iniciar a caixa de diálogo de impressão.
 */
function imprimirDocumento(patientId) {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode') || 'new';
    
    if (window.location.pathname.includes('patient_form.html') && (mode === 'view' || mode === 'edit')) {
        // Se estivermos na página do formulário (que mostra os dados completos), chamamos a impressão nativa.
        window.print();
    } else {
        // Se for chamado do dashboard, direciona para o modo de visualização para impressão mais limpa.
        if (patientId) {
             window.location.href = `patient_form.html?id=${patientId}&mode=view`;
        } else {
            // Em caso de erro, apenas alerta.
            console.warn('Função de impressão chamada incorretamente.');
        }
    }
}


// --- Funções do Formulário do Paciente (Melhorada a coleta de dados) ---

function loadPatientFormData() {
    // Lógica de load mantida... (Preenchimento e desativação de campos)
    const urlParams = new URLSearchParams(window.location.search);
    const patientId = urlParams.get('id');
    const mode = urlParams.get('mode') || 'new';

    const formTitle = document.getElementById('formTitle');
    const patientForm = document.getElementById('patientForm');
    const saveButton = document.getElementById('savePatientBtn');

    if (!patientForm || !formTitle || !saveButton) { return; }

    if (mode === 'new') {
        formTitle.textContent = 'Novo Paciente';
        saveButton.textContent = 'Cadastrar Paciente';
        patientForm.reset();
        return;
    }

    const patients = loadPatients();
    const patient = patients.find(p => p.id === patientId);

    if (patient) {
        // Preenche o formulário com os dados do paciente
        for (const key in patient) {
            const element = patientForm.elements[key];
            if (element) {
                if (element.type === 'checkbox') {
                    if (Array.isArray(patient[key])) { 
                        patient[key].forEach(val => {
                            const checkbox = patientForm.querySelector(`[name="${key}"][value="${val}"]`);
                            if (checkbox) checkbox.checked = true;
                        });
                    }
                } else if (element.type === 'radio') {
                    const radio = patientForm.querySelector(`[name="${key}"][value="${patient[key]}"]`);
                    if (radio) radio.checked = true;
                } else { 
                    element.value = patient[key];
                }
            }
        }
        
        // Adiciona ID oculto para edição
        if (mode === 'edit') {
            formTitle.textContent = 'Editar Paciente';
            saveButton.textContent = 'Atualizar Paciente';
            const hiddenIdInput = document.createElement('input');
            hiddenIdInput.type = 'hidden';
            hiddenIdInput.name = 'id';
            hiddenIdInput.value = patient.id;
            patientForm.appendChild(hiddenIdInput);
        } else if (mode === 'view') {
             formTitle.textContent = 'Visualizar Paciente (Apenas Leitura)';
             saveButton.classList.add('hidden');
             // Desabilita campos para modo de visualização
             Array.from(patientForm.elements).forEach(element => {
                 element.disabled = true;
             });
        }
    } else {
        console.error('Paciente não encontrado para o ID:', patientId);
    }
}

function handlePatientFormSubmit(event) {
    event.preventDefault();
    console.log('--- INÍCIO DA SUBMISSÃO DO FORMULÁRIO ---'); // Log de Início
    
    const patientForm = document.getElementById('patientForm');
    const formData = new FormData(patientForm);
    const patientData = {};
    
    // Flag para verificar se campos obrigatórios (nome e prontuário) foram preenchidos
    let isFormValid = true;

    // Coleta dados, incluindo checkboxes múltiplos e textareas
    for (const [key, value] of formData.entries()) {
        const element = patientForm.elements[key];

        // Validação básica de campos obrigatórios (Nome e Prontuário)
        if ((key === 'name' || key === 'prontuario') && !value.trim()) {
            isFormValid = false;
        }

        if (element && (element.type === 'checkbox' || element.type === 'radio')) {
            if (element.type === 'checkbox') {
                if (!patientData[key]) patientData[key] = [];
                if (element.checked) patientData[key].push(value);
            } else if (element.type === 'radio' && element.checked) {
                patientData[key] = value;
            }
        } else if (element && element.tagName === 'SELECT' && element.multiple) {
            // Trata selects múltiplos se houver
            patientData[key] = Array.from(element.selectedOptions).map(option => option.value);
        } else if (element) {
            patientData[key] = value;
        }
    }
    
    // Se a validação básica falhar, interrompe
    if (!isFormValid) {
        console.error('Erro de validação: Nome e Prontuário são obrigatórios.');
        // Usamos a função de alerta temporário
        showTemporaryMessage('Nome e Prontuário são campos obrigatórios.', 'text-red-500');
        return; 
    }

    // Corrige para garantir que os campos de texto justificação/motivo estejam sempre no objeto
    const textFields = [
        'rassForaDoAlvoMotivo', 'protocoloDorAdequadoMotivoNao', 'lesoesPorPressaoLocal', 'outrasLesoes',
        'cvcMotivoNao', 'svdMotivoNao', 'vniEvitarIotMotivoNao', 'ventilacaoEspontaneaO2LMin', 
        'desmameVMMotivoNao', 'realizadoTREMotivoNao', 'aptoExtubacaoMotivoInapto', 
        'medicamentoVOSimQual', 'medicamentoSuspensoSimQual', 'previsaoAltaUTISetorDestino',
        'metaMobilizacaoLivre'
    ];
    textFields.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
             patientData[id] = element.value;
        }
    });

    console.log('Dados Coletados:', patientData); // Log dos dados
    
    // Tenta salvar o paciente
    try {
        savePatient(patientData);
        console.log('Paciente salvo com sucesso no localStorage.');
    } catch (e) {
        console.error('ERRO AO SALVAR O PACIENTE:', e);
        showTemporaryMessage('Erro ao salvar os dados. O armazenamento pode estar cheio ou bloqueado.', 'text-red-500');
        document.getElementById('formTitle').textContent = 'Erro ao Salvar!';
        return; // Sai da função se houver erro de salvamento
    }

    // Redirecionamento após salvar
    showTemporaryMessage('Dados salvos com sucesso!', 'text-green-500');
    document.getElementById('formTitle').textContent = 'Dados Salvos!';
    setTimeout(() => {
        console.log('Redirecionando para dashboard.html...');
        window.location.href = 'dashboard.html';
    }, 1000); 

    console.log('--- FIM DA SUBMISSÃO DO FORMULÁRIO ---'); // Log de Fim
}

// Função para mostrar mensagens temporárias na tela (Substitui alert)
function showTemporaryMessage(message, colorClass) {
    const titleElement = document.getElementById('formTitle');
    if (titleElement) {
        const originalText = titleElement.textContent;
        titleElement.textContent = message;
        titleElement.classList.add(colorClass);
        
        setTimeout(() => {
            titleElement.textContent = originalText;
            titleElement.classList.remove(colorClass);
        }, 3000);
    }
}


// --- Funções de Toggling de Visibilidade (Corrigida RASS) ---

/**
 * Controla a visibilidade de um elemento-alvo com base no valor selecionado de um rádio/checkbox.
 * Agora aceita o 'name' do grupo de rádio e o ID do elemento alvo.
 */
const toggleVisibility = (groupName, targetElementId, expectedValue) => {
    const radios = document.querySelectorAll(`input[name="${groupName}"][type="radio"]`); 
    const targetElement = document.getElementById(targetElementId);

    if (radios.length === 0 || !targetElement) {
        return; 
    }

    const updateVisibility = () => {
        let shouldShow = false;
        
        const checkedRadio = document.querySelector(`input[name="${groupName}"]:checked`);
        if (checkedRadio && checkedRadio.value === expectedValue) {
            shouldShow = true;
        }

        // Alterna a classe 'hidden'
        targetElement.classList.toggle('hidden', !shouldShow);
    };

    // Adiciona listeners a todos os rádios no grupo para garantir o update
    radios.forEach(radio => {
        radio.addEventListener('change', updateVisibility);
    });

    updateVisibility(); // Executa na carga inicial (para carregar dados existentes)
};


// --- Inicialização de Event Listeners ---

if (document.getElementById('loginForm')) {
    document.addEventListener('DOMContentLoaded', () => {
        document.getElementById('loginForm').addEventListener('submit', handleLogin);
    });
}

if (window.location.pathname.includes('dashboard.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        checkAuth(); 
        if (loggedInUser) {
             document.getElementById('loggedInUserName').textContent = loggedInUser.name;
             document.getElementById('loggedInUserProfession').textContent = loggedInUser.profession.charAt(0).toUpperCase() + loggedInUser.profession.slice(1);
             document.getElementById('loggedInUserId').textContent = loggedInUser.id;
        }
        renderPatientsTable();
        document.getElementById('logoutBtn').addEventListener('click', logout);
    });
}

if (window.location.pathname.includes('patient_form.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        checkAuth();
        loadPatientFormData();
        
        const patientForm = document.getElementById('patientForm');
        if (patientForm) {
            patientForm.addEventListener('submit', handlePatientFormSubmit);
        }

        // CONFIGURAÇÃO DE VISIBILIDADE CONDICIONAL
        
        // 5.3 RASS: FORA DO ALVO mostra justificativa
        toggleVisibility('rass', 'rassForaDoAlvoMotivoGroup', 'FORA DO ALVO');

        // 6.1 Protocolo Dor: NÃO mostra motivo
        toggleVisibility('protocoloDorAdequado', 'protocoloDorAdequadoMotivoNaoGroup', 'NÃO');

        // 7.1 Lesões por Pressão: SIM mostra local
        toggleVisibility('lesoesPorPressao', 'lesoesPorPressaoLocalGroup', 'SIM');

        // 7.2 Outras Lesões: SIM mostra campo de texto
        toggleVisibility('outrasLesoesCheck', 'outrasLesoesInputGroup', 'SIM');
        
        // 8.1 CVC: NÃO mostra motivo
        toggleVisibility('cvc', 'cvcMotivoNaoGroup', 'NÃO');
        
        // 8.2 SVD: NÃO mostra motivo
        toggleVisibility('svd', 'svdMotivoNaoGroup', 'NÃO');

        // 9.2 Avaliada VNI: NÃO mostra motivo
        toggleVisibility('avaliadaVNIEvitarIOT', 'vniEvitarIotMotivoNaoGroup', 'NÃO');

        // 9.3 Ventilação Espontânea: SIM mostra detalhes
        toggleVisibility('ventilacaoEspontanea', 'ventilacaoEspontaneaDetails', 'SIM');

        // 9.4 Ventilação Mecânica Invasiva: SIM mostra detalhes
        toggleVisibility('ventilacaoMecanicaInvasiva', 'ventilacaoMecanicaInvasivaDetails', 'SIM');

        // 9.5 Desmame VM: NÃO mostra motivo
        toggleVisibility('desmameVM', 'desmameVMMotivoNaoGroup', 'NÃO');

        // 9.6 Realizado TRE: NÃO mostra motivo
        toggleVisibility('realizadoTRE', 'realizadoTREMotivoNaoGroup', 'NÃO');

        // 9.7 Apto Extubação: NÃO mostra motivo
        toggleVisibility('aptoExtubacao', 'aptoExtubacaoMotivoInaptoGroup', 'NÃO');

        // 12.1 Medicamento VO: SIM mostra qual
        toggleVisibility('medicamentoVO', 'medicamentoVOSimQualGroup', 'SIM');
        
        // 12.2 Medicamento Suspenso: SIM mostra qual
        toggleVisibility('medicamentoSuspenso', 'medicamentoSuspensoSimQualGroup', 'SIM');

        // 14. Previsão Alta UTI: SIM mostra setor de destino
        toggleVisibility('previsaoAltaUTI', 'previsaoAltaUTISetorDestinoGroup', 'SIM');
    });
}
