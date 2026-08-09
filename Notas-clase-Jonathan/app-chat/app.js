// ==========================================================================
// PASTEL CHAT - DEMO JAVASCRIPT LOGIC
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar Lucide Icons
    if (window.lucide) {
        lucide.createIcons();
    }

    // --- ESTADO INICIAL DE LA APLICACIÓN ---
    let currentUser = null;
    let activeChatId = 1;
    let currentFilter = 'all';

    // Base de datos simulada de contactos y mensajes
    const chatsData = [
        {
            id: 1,
            name: "Sofía Rivera",
            role: "Desarrolladora Lead",
            avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
            status: "online",
            statusText: "En línea",
            unread: 2,
            isGroup: false,
            messages: [
                { id: 101, sender: "them", text: "¡Hola Admin! ¿Cómo va la nueva interfaz pastel?", time: "10:30 AM" },
                { id: 102, sender: "me", text: "¡Hola Sofía! Quedó increíble, súper limpia y fluida.", time: "10:32 AM", read: true },
                { id: 103, sender: "them", text: "¡Qué genial! Me encantan los colores azul pastel y blanco.", time: "10:33 AM" },
                { id: 104, sender: "them", text: "Por cierto, ¿ya pudiste revisar la demo?", time: "10:34 AM" }
            ],
            autoReplies: [
                "¡Excelente! La estética azul pastel da una sensación súper relajante ✨",
                "¡Por supuesto! La respuesta adaptativa a móviles funciona genial.",
                "Totalmente de acuerdo. La combinación de blanco con azul es súper pulcra 🎨",
                "¡Genial! Si necesitas probar algo más, dime y te ayudo."
            ]
        },
        {
            id: 2,
            name: "Carlos Mendoza",
            role: "Diseñador UI/UX",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
            status: "offline",
            statusText: "Visto hace 15 min",
            unread: 0,
            isGroup: false,
            messages: [
                { id: 201, sender: "them", text: "Adjunté los nuevos componentes al sistema de diseño.", time: "Ayer" },
                { id: 202, sender: "me", text: "¡Recibido! Los reviso en un momento.", time: "Ayer", read: true }
            ],
            autoReplies: [
                "Estoy fuera del escritorio ahora mismo, pero te respondo en cuanto vuelva 👨‍💻",
                "¡Buenísimo! Quedo atento a tus comentarios."
            ]
        },
        {
            id: 3,
            name: "Equipo de Producto 🚀",
            role: "4 Miembros",
            avatar: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80",
            status: "online",
            statusText: "3 miembros activos",
            unread: 0,
            isGroup: true,
            messages: [
                { id: 301, sender: "them", senderName: "Ana Torres", text: "Recordatorio: Reunión de sprint a las 3:00 PM ⏰", time: "09:00 AM" },
                { id: 302, sender: "me", text: "Anotado en el calendario 👍", time: "09:15 AM", read: true }
            ],
            autoReplies: [
                "¡Perfecto! Nos vemos en la llamada.",
                "Ana: La presentación de diapositivas está lista."
            ]
        },
        {
            id: 4,
            name: "Ana Torres",
            role: "Product Owner",
            avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
            status: "online",
            statusText: "En línea",
            unread: 1,
            isGroup: false,
            messages: [
                { id: 401, sender: "them", text: "Admin, cuando puedas aprueba los avances del módulo de login.", time: "11:10 AM" }
            ],
            autoReplies: [
                "¡Gracias por la rápida respuesta! Quedo al pendiente.",
                "Perfecto, avanzamos con los siguientes requerimientos."
            ]
        }
    ];

    // --- ELEMENTOS DEL DOM ---
    const loginScreen = document.getElementById('loginScreen');
    const chatScreen = document.getElementById('chatScreen');
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const togglePasswordBtn = document.getElementById('togglePasswordBtn');
    const eyeIcon = document.getElementById('eyeIcon');
    const hintBtn = document.getElementById('hintBtn');

    const logoutBtn = document.getElementById('logoutBtn');
    const chatsList = document.getElementById('chatsList');
    const contactSearchInput = document.getElementById('contactSearchInput');
    const categoryTabs = document.querySelectorAll('.category-tab');

    const activeContactAvatar = document.getElementById('activeContactAvatar');
    const activeContactName = document.getElementById('activeContactName');
    const activeContactStatusDot = document.getElementById('activeContactStatusDot');
    const activeContactStatusText = document.getElementById('activeContactStatusText');
    const messagesContainer = document.getElementById('messagesContainer');
    const messageInput = document.getElementById('messageInput');
    const sendMessageBtn = document.getElementById('sendMessageBtn');
    const typingIndicator = document.getElementById('typingIndicator');
    const typingUserName = document.getElementById('typingUserName');

    const sidebar = document.getElementById('sidebar');
    const mobileBackBtn = document.getElementById('mobileBackBtn');
    const toggleDetailsBtn = document.getElementById('toggleDetailsBtn');
    const detailsPanel = document.getElementById('detailsPanel');
    const closeDetailsBtn = document.getElementById('closeDetailsBtn');
    const detailAvatar = document.getElementById('detailAvatar');
    const detailName = document.getElementById('detailName');
    const detailRole = document.getElementById('detailRole');
    const clearChatBtn = document.getElementById('clearChatBtn');

    const emojiBtn = document.getElementById('emojiBtn');
    const emojiPicker = document.getElementById('emojiPicker');
    const attachBtn = document.getElementById('attachBtn');
    const callAudioBtn = document.getElementById('callAudioBtn');
    const callVideoBtn = document.getElementById('callVideoBtn');

    // --- GESTIÓN DE LOGIN ---
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = usernameInput.value.trim();
        const pass = passwordInput.value.trim();

        if (user === 'admin' && pass === 'admin') {
            loginError.style.display = 'none';
            currentUser = { username: 'admin', name: 'Admin User' };

            // Transición suave
            loginScreen.classList.remove('active');
            setTimeout(() => {
                chatScreen.classList.add('active');
                renderChatsList();
                loadActiveChat(activeChatId);
                showToast('¡Bienvenido, Admin!');
            }, 200);
        } else {
            loginError.style.display = 'flex';
            usernameInput.classList.add('error');
            passwordInput.classList.add('error');
        }
    });

    // Mostrar/Ocultar Contraseña
    togglePasswordBtn.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        eyeIcon.setAttribute('data-lucide', type === 'password' ? 'eye' : 'eye-off');
        if (window.lucide) lucide.createIcons();
    });

    hintBtn.addEventListener('click', (e) => {
        e.preventDefault();
        showToast('Credenciales Demo -> Usuario: admin | Pass: admin');
    });

    // Logout
    logoutBtn.addEventListener('click', () => {
        currentUser = null;
        chatScreen.classList.remove('active');
        setTimeout(() => {
            loginScreen.classList.add('active');
            loginForm.reset();
            showToast('Has cerrado sesión correctamente');
        }, 200);
    });

    // --- FILTROS DE CATEGORÍA ---
    categoryTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            categoryTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentFilter = tab.dataset.filter;
            renderChatsList();
        });
    });

    // --- BÚSQUEDA DE CONTACTOS ---
    contactSearchInput.addEventListener('input', () => {
        renderChatsList();
    });

    // --- RENDERIZADO DE CHATS ---
    function renderChatsList() {
        chatsList.innerHTML = '';
        const searchTerm = contactSearchInput.value.toLowerCase().trim();

        const filteredChats = chatsData.filter(chat => {
            const matchesSearch = chat.name.toLowerCase().includes(searchTerm);
            if (!matchesSearch) return false;

            if (currentFilter === 'unread') return chat.unread > 0;
            if (currentFilter === 'groups') return chat.isGroup;
            return true;
        });

        if (filteredChats.length === 0) {
            chatsList.innerHTML = `<div style="text-align: center; padding: 20px; color: var(--color-text-muted); font-size: 0.85rem;">No se encontraron chats</div>`;
            return;
        }

        filteredChats.forEach(chat => {
            const lastMsg = chat.messages[chat.messages.length - 1];
            const chatItem = document.createElement('div');
            chatItem.className = `chat-item ${chat.id === activeChatId ? 'active' : ''}`;
            chatItem.addEventListener('click', () => {
                loadActiveChat(chat.id);
                if (window.innerWidth <= 900) {
                    sidebar.classList.add('hide-mobile');
                }
            });

            chatItem.innerHTML = `
                <div class="avatar-container">
                    <img src="${chat.avatar}" alt="${chat.name}" class="avatar">
                    <span class="status-indicator ${chat.status}"></span>
                </div>
                <div class="chat-item-content">
                    <div class="chat-item-header">
                        <span class="contact-name">${chat.name}</span>
                        <span class="chat-time">${lastMsg ? lastMsg.time : ''}</span>
                    </div>
                    <div class="chat-item-footer">
                        <span class="last-message">${lastMsg ? (lastMsg.sender === 'me' ? 'Tú: ' : '') + lastMsg.text : 'Sin mensajes'}</span>
                        ${chat.unread > 0 ? `<span class="unread-badge">${chat.unread}</span>` : ''}
                    </div>
                </div>
            `;
            chatsList.appendChild(chatItem);
        });
    }

    // --- CARGAR CHAT ACTIVO ---
    function loadActiveChat(id) {
        activeChatId = id;
        const chat = chatsData.find(c => c.id === id);
        if (!chat) return;

        // Limpiar unread badge
        chat.unread = 0;
        renderChatsList();

        // Actualizar Header
        activeContactAvatar.src = chat.avatar;
        activeContactName.textContent = chat.name;
        activeContactStatusDot.className = `status-indicator ${chat.status}`;
        activeContactStatusText.textContent = chat.statusText;

        // Actualizar Panel de Detalles
        detailAvatar.src = chat.avatar;
        detailName.textContent = chat.name;
        detailRole.textContent = chat.role;

        // Renderizar Mensajes
        renderMessages(chat.messages);
    }

    // --- RENDERIZAR MENSAJES ---
    function renderMessages(messages) {
        messagesContainer.innerHTML = '';
        
        // Divisor de Fecha Demo
        const dateDivider = document.createElement('div');
        dateDivider.className = 'date-divider';
        dateDivider.innerHTML = `<span>Hoy</span>`;
        messagesContainer.appendChild(dateDivider);

        const currentChat = chatsData.find(c => c.id === activeChatId);

        messages.forEach(msg => {
            const isMe = msg.sender === 'me';
            const msgWrapper = document.createElement('div');
            msgWrapper.className = `message-wrapper ${isMe ? 'sent' : 'received'}`;

            const avatarSrc = isMe ? 
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" : 
                currentChat.avatar;

            msgWrapper.innerHTML = `
                ${!isMe ? `<img src="${avatarSrc}" class="msg-avatar" alt="Avatar">` : ''}
                <div class="message-bubble">
                    ${msg.senderName ? `<div style="font-size:0.75rem; font-weight:700; color:var(--color-primary); margin-bottom:2px;">${msg.senderName}</div>` : ''}
                    <span>${escapeHTML(msg.text)}</span>
                    <div class="message-meta">
                        <span>${msg.time}</span>
                        ${isMe ? `<i data-lucide="check-check" class="read-icon" style="color: ${msg.read ? '#60A5FA' : '#94A3B8'}"></i>` : ''}
                    </div>
                </div>
            `;
            messagesContainer.appendChild(msgWrapper);
        });

        if (window.lucide) lucide.createIcons();
        scrollToBottom();
    }

    function scrollToBottom() {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // --- ENVIAR MENSAJE ---
    function sendMessage() {
        const text = messageInput.value.trim();
        if (!text) return;

        const currentChat = chatsData.find(c => c.id === activeChatId);
        if (!currentChat) return;

        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const newMsg = {
            id: Date.now(),
            sender: 'me',
            text: text,
            time: timeStr,
            read: true
        };

        currentChat.messages.push(newMsg);
        renderMessages(currentChat.messages);
        renderChatsList();

        messageInput.value = '';
        messageInput.style.height = 'auto';

        // Ocultar Emoji Picker
        emojiPicker.style.display = 'none';

        // Simular Respuesta Automática
        simulateAutoReply(currentChat);
    }

    sendMessageBtn.addEventListener('click', sendMessage);

    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Auto-resize de Textarea
    messageInput.addEventListener('input', () => {
        messageInput.style.height = 'auto';
        messageInput.style.height = (messageInput.scrollHeight) + 'px';
    });

    // --- SIMULACIÓN DE RESPUESTA AUTOMÁTICA DE BOT/CONTACTO ---
    function simulateAutoReply(chat) {
        // Mostrar indicador de escribiendo
        typingUserName.textContent = `${chat.name} está escribiendo...`;
        typingIndicator.style.display = 'flex';

        setTimeout(() => {
            typingIndicator.style.display = 'none';

            // Elegir respuesta aleatoria
            const replies = chat.autoReplies || ["¡Entendido!", "De acuerdo 😊"];
            const randomReply = replies[Math.floor(Math.random() * replies.length)];

            const now = new Date();
            const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            const replyMsg = {
                id: Date.now(),
                sender: 'them',
                text: randomReply,
                time: timeStr
            };

            chat.messages.push(replyMsg);

            if (chat.id === activeChatId) {
                renderMessages(chat.messages);
            } else {
                chat.unread++;
            }
            renderChatsList();
        }, 1800);
    }

    // --- EMOJI PICKER INTERACTIVO ---
    emojiBtn.addEventListener('click', () => {
        const isVisible = emojiPicker.style.display === 'grid';
        emojiPicker.style.display = isVisible ? 'none' : 'grid';
    });

    document.querySelectorAll('.emoji-item').forEach(emoji => {
        emoji.addEventListener('click', () => {
            messageInput.value += emoji.textContent;
            messageInput.focus();
        });
    });

    // --- ACCIONES ADICIONALES ---
    attachBtn.addEventListener('click', () => {
        showToast('Simulación: Seleccionar archivo adjunto');
    });

    callAudioBtn.addEventListener('click', () => {
        showToast('Iniciando llamada de voz pastel...');
    });

    callVideoBtn.addEventListener('click', () => {
        showToast('Iniciando videollamada HD...');
    });

    clearChatBtn.addEventListener('click', () => {
        const currentChat = chatsData.find(c => c.id === activeChatId);
        if (currentChat) {
            currentChat.messages = [];
            renderMessages([]);
            renderChatsList();
            showToast('Historial del chat eliminado');
        }
    });

    // Toggle Panel de Detalles
    toggleDetailsBtn.addEventListener('click', () => {
        detailsPanel.classList.toggle('open');
    });

    closeDetailsBtn.addEventListener('click', () => {
        detailsPanel.classList.remove('open');
    });

    // Mobile Back Navigation
    mobileBackBtn.addEventListener('click', () => {
        sidebar.classList.remove('hide-mobile');
    });

    // --- NOTIFICACIONES TOAST ---
    function showToast(message) {
        const toastContainer = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<i data-lucide="info" style="width:18px; height:18px; color:var(--color-primary)"></i> <span>${message}</span>`;
        toastContainer.appendChild(toast);
        if (window.lucide) lucide.createIcons();

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(50px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Helper para escapar HTML y prevenir XSS
    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
        );
    }
});
