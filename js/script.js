// script.js

// Variáveis globais para simular o banco de dados e o usuário logado
let loggedInUser = null; // Armazena o usuário logado
const USERS = [
    { id: 'CRM123', password: '123', profession: 'medico', name: 'Dr. João Silva' },
    { id: 'RQE3882', password: '123', profession: 'medico', name: 'Dra. Ana Laura Gonçalves Resende' },
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

                    <button onclick="imprimirDocumento('${patient.id}')"
                            class="text-purple-600 hover:text-purple-900 transition duration-150 ease-in-out p-1 rounded-md hover:bg-purple-100" title="Imprimir">
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm7-16V5a2 2 0 00-2-2H9a2 2 0 00-2 2v2m0 16h.01"></path></svg>
                    </button>
                    
                    <div class="relative inline-block text-left dropdown">
                        <button type="button" class="inline-flex justify-center rounded-md border border-gray-300 shadow-sm p-1 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out" id="options-menu-${patient.id}" aria-haspopup="true" aria-expanded="true" title="Outras Ações">
                            <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                        </button>
                        <div class="dropdown-menu origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 hidden" role="menu" aria-orientation="vertical" aria-labelledby="options-menu-${patient.id}">
                            <div class="py-1">
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


// ==================================================================
// === FUNÇÃO DE IMPRESSÃO ATUALIZADA (LÓGICA DE IFRAME) ===
// ==================================================================

/**
 * GERA E IMPRIME O LAYOUT ESTILO PDF.
 * Detecta se está no dashboard (e usa um iframe) ou
 * se está no form (e imprime direto).
 */
function imprimirDocumento(patientId) {
    
    // DETECTA SE ESTÁ NO DASHBOARD
    if (window.location.pathname.includes('dashboard.html')) {
        // --- ESTAMOS NO DASHBOARD ---
        console.log('Imprimindo do dashboard via iframe...');
        
        // 1. Remover iframes antigos
        const oldFrame = document.getElementById('printFrame');
        if (oldFrame) oldFrame.remove();

        // 2. Criar iframe oculto
        const printFrame = document.createElement('iframe');
        printFrame.id = 'printFrame';
        printFrame.style.position = 'absolute';
        printFrame.style.width = '0';
        printFrame.style.height = '0';
        printFrame.style.border = '0';

        // 3. Definir o source para a página de formulário com o ID e o novo parâmetro 'autoprint'
        printFrame.src = `patient_form.html?id=${patientId}&mode=view&autoprint=true`;
        
        document.body.appendChild(printFrame);
        
        // O iframe vai carregar e o script DENTRO DELE (em patient_form.html)
        // vai detectar o 'autoprint=true' e chamar a impressão.

    } else if (window.location.pathname.includes('patient_form.html')) {
        // --- ESTAMOS NA PÁGINA DO FORMULÁRIO ---
        // Esta é a lógica original de construção de HTML que já funciona
        
        console.log('Construindo HTML para impressão...');
        const form = document.getElementById('patientForm');
        if (!form) {
            console.error('Formulário não encontrado para impressão.');
            return;
        }
        
        // 1. Coletar TODOS os dados do formulário
        const data = {};
        const allElements = form.elements;
        for (let i = 0; i < allElements.length; i++) {
            const el = allElements[i];
            if (!el.name) continue;
            
            if (el.type === 'radio') {
                if (el.checked) data[el.name] = el.value;
            } else if (el.type === 'checkbox') {
                if (!data[el.name]) data[el.name] = [];
                if (el.checked) data[el.name].push(el.value);
            } else {
                data[el.name] = el.value || '';
            }
        }
        
        // 2. Helpers (Corrigidos)
        function printCheck(value, option) {
            return value === option ? '<span class="check">(X)</span>' : '<span class="check">()</span>';
        }
        function printMultiCheck(valueArray, option) {
            const arr = valueArray || [];
            return arr.includes(option) ? '<span class="check">(X)</span>' : '<span class="check">()</span>';
        }
        
        // 3. Lógica da Assinatura Digital
        // (Se você removeu outras profissões, esta lista deve estar correta)
        const signatureSlots = [
            { key: 'medico', label: 'MÉDICO' },
            // { key: 'enfermeiro', label: 'ENFERMEIRO' },
            // { key: 'fisioterapeuta', label: 'FISIOTERAPEUTA' },
            // { key: 'nutricionista', label: 'NUTRICIONISTA' },
            // { key: 'psicologo', label: 'PSICÓLOGO(A)' },
            // { key: 'odontologo', label: 'ODONTOLOGO' },
            // { key: 'farmaceutico', label: 'FARMACÊUTICO' },
            // { key: 'tecnico_enfermagem', label: 'TÉC. ENFERMAGEM' },
            // { key: 'fonoaudiologo', label: 'FONOAUDIÓLOGO' }
        ];

        const currentUser = loggedInUser; 
        let signatureHTML = '';
        for (const slot of signatureSlots) {
            if (currentUser && currentUser.profession === slot.key) {
                signatureHTML += `
                <div class="print-assinatura-item signed">
                    <span class="sig-name">${currentUser.name}</span><br>
                    <span class="sig-id">${slot.label} / ${currentUser.id}</span>
                </div>`;
            } else {
                // Se você deixou SÓ médico, pode comentar este 'else'
                // para não imprimir os campos vazios
                // signatureHTML += `
                // <div class="print-assinatura-item">
                //     ${slot.label}
                // </div>`;
            }
        }

        // 4. Construir o HTML do template de impressão
        const printHTML = `
        <div class="print-page">
            <div class="print-header">
                <div class="logo-left">SECRETARIA DA SAÚDE<br>TOCANTINS<br>GOVERNO DO ESTADO</div>
                <div class="logo-right">HRGURUPI<br>HOSPITAL REGIONAL DE GURUPI</div>
            </div>
            <div class="print-title">VISITA MULTIDISCIPLINAR UTI ADULTO</div>

            <div class="print-patient-info">
                <div class="print-item"><label>Nome:</label> ${data.name}</div>
                <div class="print-item"><label>Prontuário:</label> ${data.prontuario}</div>
                <div class="print-item"><label>Data:</label> ${data.data ? new Date(data.data.replace(/-/g, '/')).toLocaleDateString('pt-BR') : ''}</div>
                <div class="print-item"><label>Idade:</label> ${data.idade}</div>
                <div class="print-item"><label>Leito:</label> ${data.leito}</div>
            </div>

            <div class="print-section print-line-item-long">
                <div class="print-line-item"><span class="print-section-title">1. DIAGNÓSTICO:</span> <span class="print-plano">${data.diagnostico}</span></div>
                <div class="print-line-item"><span class="print-section-title">2. INTERCORRÊNCIAS NAS ÚLTIMAS 24 HORAS:</span> <span class="print-plano">${data.intercorrencias24h}</span></div>
                <div class="print-line-item"><span class="print-section-title">3. PENDÊNCIAS DE EXAMES E/OU AVALIAÇÃO DE ESPECIALISTAS:</span> <span class="print-plano">${data.pendenciasExames}</span></div>
            </div>

            <div class="print-section">
                <div class="print-section-title">4. EVENTOS ADVERSOS</div>
                <div class="print-grid">
                    <div class="print-line-item">4.1 EVENTO ADVERSO (<24h): ${printCheck(data.eventoAdverso, 'SIM')} SIM ${printCheck(data.eventoAdverso, 'NÃO')} NÃO</div>
                    <div class="print-line-item">4.2 NOTIFICADO: ${printCheck(data.eventoAdversoNotificado, 'SIM')} SIM ${printCheck(data.eventoAdversoNotificado, 'NÃO')} NÃO</div>
                    <div class="print-line-item-long">Tipos: 
                        ${printMultiCheck(data.tipoEventoAdverso, 'QUEDA')} QUEDA
                        ${printMultiCheck(data.tipoEventoAdverso, 'BRONCOASPIRAÇÃO')} BRONCOASPIRAÇÃO
                        ${printMultiCheck(data.tipoEventoAdverso, 'FLEBITE')} FLEBITE
                        ${printMultiCheck(data.tipoEventoAdverso, 'PERDA DE DISPOSITIVO')} PERDA DE DISPOSITIVO
                    </div>
                </div>
            </div>
            
            <div class="print-section">
                <div class="print-section-title">5. CONFORTO/ANALGESIA/DELIRIUM</div>
                <div class="print-grid">
                    <div class="print-line-item">5.1 SEDAÇÃO: ${printCheck(data.sedacao, 'SIM')} SIM ${printCheck(data.sedacao, 'NÃO')} NÃO</div>
                    <div class="print-line-item">5.2 DESPERTAR DIÁRIO: ${printCheck(data.despertarDiario, 'SIM')} SIM ${printCheck(data.despertarDiario, 'NÃO')} NÃO</div>
                    <div class="print-line-item-long">5.3 RASS: ${printCheck(data.rass, '0A-2')} 0A-2 ${printCheck(data.rass, 'FORA DO ALVO')} FORA DO ALVO
                        <span class="check-label">SE FORA DO ALVO, MOTIVO:</span> <div class="print-motivo">${data.rassForaDoAlvoMotivo}</div>
                    </div>
                </div>
            </div>
            
            <div class="print-section">
                <div class="print-section-title">6. PROTOCOLO DE DOR</div>
                <div class="print-grid">
                    <div class="print-line-item-long">6.1 ADEQUADO: ${printCheck(data.protocoloDorAdequado, 'SIM')} SIM ${printCheck(data.protocoloDorAdequado, 'NÃO')} NÃO
                        <span class="check-label">SE NÃO, MOTIVO:</span> <div class="print-motivo">${data.protocoloDorAdequadoMotivoNao}</div>
                    </div>
                    <div class="print-line-item">6.2 DELIRIUM NAS ULTIMAS 24h: ${printCheck(data.delirium24h, 'SIM')} SIM ${printCheck(data.delirium24h, 'NÃO')} NÃO</div>
                    <div class="print-line-item-long">6.3 PENSAMENTO DESORGANIZADO...: ${printCheck(data.pensamentoDesorganizado, 'SIM')} SIM ${printCheck(data.pensamentoDesorganizado, 'NÃO')} NÃO</div>
                </div>
            </div>

            <div class="print-section">
                <div class="print-section-title">7. LESÕES</div>
                <div class="print-grid">
                    <div class="print-line-item-long">7.1 LESÕES POR PRESSÃO: ${printCheck(data.lesoesPorPressao, 'SIM')} SIM ${printCheck(data.lesoesPorPressao, 'NÃO')} NÃO
                        <span class="check-label">SE SIM, LOCAL:</span> <div class="print-motivo">${data.lesoesPorPressaoLocal}</div>
                    </div>
                    <div class="print-line-item-long">7.2 OUTRAS: ${printCheck(data.outrasLesoesCheck, 'SIM')} SIM ${printCheck(data.outrasLesoesCheck, 'NÃO')} NÃO
                        <span class="check-label">Descreva Outras Lesões:</span> <div class="print-motivo">${data.outrasLesoes}</div>
                    </div>
                </div>
            </div>

            <div class="print-section">
                <div class="print-section-title">8. INFECÇÃO</div>
                <div class="print-grid">
                    <div class="print-line-item-long">8.1 CVC: ${printCheck(data.cvc, 'SIM')} SIM ${printCheck(data.cvc, 'NÃO')} NÃO
                        <span class="check-label">SE NÃO, MOTIVO:</span> <div class="print-motivo">${data.cvcMotivoNao}</div>
                    </div>
                    <div class="print-line-item-long">8.2 SVD: ${printCheck(data.svd, 'SIM')} SIM ${printCheck(data.svd, 'NÃO')} NÃO
                        <span class="check-label">SE NÃO, MOTIVO:</span> <div class="print-motivo">${data.svdMotivoNao}</div>
                    </div>
                </div>
            </div>

            <div class="print-section">
                <div class="print-section-title">9. FISIOTERAPIA</div>
                <div class="print-grid">
                    <div class="print-line-item">9.1 IOT NAS ÚLTIMAS 24h: ${printCheck(data.iot24h, 'SIM')} SIM ${printCheck(data.iot24h, 'NÃO')} NÃO</div>
                    <div class="print-line-item-long">9.2 FOI AVALIADA A POSSIBILIDADE DE VNI PARA EVITAR A IOT? ${printCheck(data.avaliadaVNIEvitarIOT, 'SIM')} SIM ${printCheck(data.avaliadaVNIEvitarIOT, 'NÃO')} NÃO
                        <span class="check-label">SE NÃO, MOTIVO:</span> <div class="print-motivo">${data.vniEvitarIotMotivoNao}</div>
                    </div>
                    <div class="print-line-item-long">9.3 VENTILAÇÃO ESPONTÂNEA: ${printCheck(data.ventilacaoEspontanea, 'SIM')} SIM ${printCheck(data.ventilacaoEspontanea, 'NÃO')} NÃO
                        <span class="check-label">SE SIM:</span>
                        ${printMultiCheck(data.ventilacaoEspontaneaTipo, 'AA')} AA
                        ${printMultiCheck(data.ventilacaoEspontaneaTipo, 'VNI')} VNI
                        ${printMultiCheck(data.ventilacaoEspontaneaTipo, 'O2')} O2
                        <span class="check-label">O2-L/MIN:</span> <span class="print-plano">${data.ventilacaoEspontaneaO2LMin}</span>
                    </div>
                    <div class="print-line-item-long">9.4 VENTILAÇÃO MECÂNICA INVASIVA: ${printCheck(data.ventilacaoMecanicaInvasiva, 'SIM')} SIM ${printCheck(data.ventilacaoMecanicaInvasiva, 'NÃO')} NÃO
                        <span class="check-label">SE SIM:</span>
                        ${printMultiCheck(data.ventilacaoMecanicaInvasivaTipo, 'TOT')} TOT
                        ${printMultiCheck(data.ventilacaoMecanicaInvasivaTipo, 'TQT')} TQT
                    </div>
                    <div class="print-line-item-long">9.5 DESMAME DA VM: ${printCheck(data.desmameVM, 'SIM')} SIM ${printCheck(data.desmameVM, 'NÃO')} NÃO
                        <span class="check-label">SE NÃO, MOTIVO:</span> <div class="print-motivo">${data.desmameVMMotivoNao}</div>
                    </div>
                    <div class="print-line-item-long">9.6 REALIZADO TRE: ${printCheck(data.realizadoTRE, 'SIM')} SIM ${printCheck(data.realizadoTRE, 'NÃO')} NÃO
                        <span class="check-label">SE NÃO, MOTIVO:</span> <div class="print-motivo">${data.realizadoTREMotivoNao}</div>
                    </div>
                    <div class="print-line-item-long">9.7 APTO À EXTUBAÇÃO: ${printCheck(data.aptoExtubacao, 'SIM')} SIM ${printCheck(data.aptoExtubacao, 'NÃO')} NÃO
                        <span class="check-label">SE INAPTO, MOTIVO:</span> <div class="print-motivo">${data.aptoExtubacaoMotivoInapto}</div>
                    </div>
                    <div class="print-line-item-long">9.8 ESCALA IMS: <span class="print-plano">${data.escalaIMS}</span></div>
                    <div class="print-line-item-long">9.9 META DE MOBILIZAÇÃO (Descrição Livre): <div class="print-motivo">${data.metaMobilizacaoLivre}</div></div>
                </div>
            </div>

            <div class="print-section">
                <div class="print-section-title">10. PROFILAXIAS</div>
                <div class="print-line-item-long">FOWLER:
                    ${printMultiCheck(data.fowler, '30°')} 30°
                    ${printMultiCheck(data.fowler, '60°')} 60°
                    ${printMultiCheck(data.fowler, '90°')} 90°
                </div>
                <div class="print-grid">
                    <div class="print-line-item">10.1 TEV: ${printCheck(data.tev, 'SIM')} SIM ${printCheck(data.tev, 'NÃO')} NÃO</div>
                    <div class="print-line-item">10.2 ÚLCERA GÁSTRICA: ${printCheck(data.ulceraGastrica, 'SIM')} SIM ${printCheck(data.ulceraGastrica, 'NÃO')} NÃO</div>
                    <div class="print-line-item">10.3 LESÃO POR PRESSÃO: ${printCheck(data.lesaoPorPressao, 'SIM')} SIM ${printCheck(data.lesaoPorPressao, 'NÃO')} NÃO</div>
                    <div class="print-line-item">10.4 TEMP. CORPORAL ADEQUADA: ${printCheck(data.temperaturaCorporalAdequada, 'SIM')} SIM ${printCheck(data.temperaturaCorporalAdequada, 'NÃO')} NÃO</div>
                </div>
            </div>

            <div class="print-section">
                <div class="print-section-title">11. NUTRIÇÃO</div>
                <div class="print-grid">
                    <div class="print-line-item">11.1 META NUTRICIONAL ADEQUADA: ${printCheck(data.metaNutricionalAdequada, 'SIM')} SIM ${printCheck(data.metaNutricionalAdequada, 'NÃO')} NÃO</div>
                    <div class="print-line-item">11.2 APORTE PROTEICO: ${printCheck(data.aporteProteico, 'SIM')} SIM ${printCheck(data.aporteProteico, 'NÃO')} NÃO</div>
                </div>
            </div>

            <div class="print-section">
                <div class="print-section-title">12. FARMÁCIA</div>
                <div class="print-grid">
                    <div class="print-line-item-long">12.1 ALGUM MEDICAMENTO PODE SER PASSADO PARA VO? ${printCheck(data.medicamentoVO, 'SIM')} SIM ${printCheck(data.medicamentoVO, 'NÃO')} NÃO
                        <span class="check-label">SE SIM, QUAL?</span> <div class="print-motivo">${data.medicamentoVOSimQual}</div>
                    </div>
                    <div class="print-line-item-long">12.2 ALGUM MEDICAMENTO PODE SER SUSPENSO? ${printCheck(data.medicamentoSuspenso, 'SIM')} SIM ${printCheck(data.medicamentoSuspenso, 'NÃO')} NÃO
                        <span class="check-label">SE SIM, QUAL?</span> <div class="print-motivo">${data.medicamentoSuspensoSimQual}</div>
                    </div>
                </div>
            </div>

            <div class="print-section">
                <div class="print-section-title">13. PLANO DO DIA</div>
                <div class="print-line-item-long">
                    <div class="print-motivo">${data.planoDoDia}</div>
                </div>
            </div>

            <div class="print-section">
                <div class="print-section-title">14. PREVISÃO DE ALTA DA UTI</div>
                <div class="print-grid">
                    <div class="print-line-item-long">PREVISÃO: ${printCheck(data.previsaoAltaUTI, 'SIM')} SIM ${printCheck(data.previsaoAltaUTI, 'NÃO')} NÃO
                        <span class="check-label">SETOR DE DESTINO:</span> <div class="print-motivo">${data.previsaoAltaUTISetorDestino}</div>
                    </div>
                </div>
            </div>

            <div class="print-assinaturas">
                ${signatureHTML}
            </div>

        </div> 
        `; // Fim do printHTML

        // 5. Injetar o HTML no body
        const oldContainer = document.getElementById('print-container');
        if (oldContainer) oldContainer.remove();

        const printContainer = document.createElement('div');
        printContainer.id = 'print-container';
        printContainer.innerHTML = printHTML;
        document.body.appendChild(printContainer);

        // 6. Chamar a impressão
        window.print();
        
        // A limpeza será feita pelo 'onafterprint'
        
    } else {
        console.warn('Função de impressão chamada em um local inesperado.');
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
    
    if (!isFormValid) {
        console.error('Erro de validação: Nome e Prontuário são obrigatórios.');
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

    console.log('Dados Coletados:', patientData); 
    
    try {
        savePatient(patientData);
        console.log('Paciente salvo com sucesso no localStorage.');
    } catch (e) {
        console.error('ERRO AO SALVAR O PACIENTE:', e);
        showTemporaryMessage('Erro ao salvar os dados. O armazenamento pode estar cheio ou bloqueado.', 'text-red-500');
        document.getElementById('formTitle').textContent = 'Erro ao Salvar!';
        return;
    }

    showTemporaryMessage('Dados salvos com sucesso!', 'text-green-500');
    document.getElementById('formTitle').textContent = 'Dados Salvos!';
    setTimeout(() => {
        console.log('Redirecionando para dashboard.html...');
        window.location.href = 'dashboard.html';
    }, 1000); 

    console.log('--- FIM DA SUBMISSÃO DO FORMULÁRIO ---');
}

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

        targetElement.classList.toggle('hidden', !shouldShow);
    };

    radios.forEach(radio => {
        radio.addEventListener('change', updateVisibility);
    });

    updateVisibility(); // Executa na carga inicial
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
        loadPatientFormData(); // Carrega os dados do paciente
        
        const patientForm = document.getElementById('patientForm');
        if (patientForm) {
            patientForm.addEventListener('submit', handlePatientFormSubmit);
        }

        // CONFIGURAÇÃO DE VISIBILIDADE CONDICIONAL
        toggleVisibility('rass', 'rassForaDoAlvoMotivoGroup', 'FORA DO ALVO');
        toggleVisibility('protocoloDorAdequado', 'protocoloDorAdequadoMotivoNaoGroup', 'NÃO');
        toggleVisibility('lesoesPorPressao', 'lesoesPorPressaoLocalGroup', 'SIM');
        toggleVisibility('outrasLesoesCheck', 'outrasLesoesInputGroup', 'SIM');
        toggleVisibility('cvc', 'cvcMotivoNaoGroup', 'NÃO');
        toggleVisibility('svd', 'svdMotivoNaoGroup', 'NÃO');
        toggleVisibility('avaliadaVNIEvitarIOT', 'vniEvitarIotMotivoNaoGroup', 'NÃO');
        toggleVisibility('ventilacaoEspontanea', 'ventilacaoEspontaneaDetails', 'SIM');
        toggleVisibility('ventilacaoMecanicaInvasiva', 'ventilacaoMecanicaInvasivaDetails', 'SIM');
        toggleVisibility('desmameVM', 'desmameVMMotivoNaoGroup', 'NÃO');
        toggleVisibility('realizadoTRE', 'realizadoTREMotivoNaoGroup', 'NÃO');
        toggleVisibility('aptoExtubacao', 'aptoExtubacaoMotivoInaptoGroup', 'NÃO');
        toggleVisibility('medicamentoVO', 'medicamentoVOSimQualGroup', 'SIM');
        toggleVisibility('medicamentoSuspenso', 'medicamentoSuspensoSimQualGroup', 'SIM');
        toggleVisibility('previsaoAltaUTI', 'previsaoAltaUTISetorDestinoGroup', 'SIM');
        
        
        // ===============================================
        // =   LÓGICA DE AUTOPRINT (PARA IFRAME)         =
        // ===============================================
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('autoprint') === 'true') {
            // Esconde o formulário real para o usuário não ver piscar
            const main = document.querySelector('main');
            const header = document.querySelector('header');
            if (main) main.style.display = 'none';
            if (header) header.style.display = 'none';
            
            // Chama a impressão.
            // Usamos um pequeno timeout para garantir que os dados (loggedInUser)
            // e a DOM estejam 100% prontos.
            setTimeout(() => {
                imprimirDocumento(); // Chama a função de impressão (sem ID, já estamos na página)
            }, 100); // 100ms de espera
        }
    });

    // ===============================================
    // =   BLOCO DE LIMPEZA onafterprint             =
    // ===============================================
    /**
     * Limpa o HTML de impressão DEPOIS que a impressão
     * (ou o cancelamento) for concluído.
     */
    window.onafterprint = () => {
        const printContainer = document.getElementById('print-container');
        if (printContainer) printContainer.remove();
        console.log('Container de impressão removido.');

        // Se for um autoprint de iframe, podemos remover o iframe
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('autoprint') === 'true') {
            // Tenta encontrar o iframe no 'pai' e removê-lo
            try {
                if (window.parent && window.parent.document) {
                    const frame = window.parent.document.getElementById('printFrame');
                    if (frame) frame.remove();
                }
            } catch (e) {
                console.warn('Não foi possível remover o iframe (provavelmente por cross-origin policy):', e);
            }
        }
    };
}