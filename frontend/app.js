let userId = null;
let platform = 'web';
let currentUserName = 'Участник';
let allEvents = [];
let selectedDateStr = new Date().toISOString().split('T')[0]; // Выбранный день по умолчанию — сегодня
let currentEditingEventId = null;

// 1. НАСТРОЙКА И ИНИЦИАЛИЗАЦИЯ MESSENGER SDK
if (window.Telegram && window.Telegram.WebApp.initDataUnsafe.user) {
    const tg = window.Telegram.WebApp;
    tg.ready();
    tg.expand();
    userId = tg.initDataUnsafe.user.id;
    platform = 'tg';
    currentUserName = tg.initDataUnsafe.user.first_name || 'Участник TG';
    document.getElementById('user-name').innerText = currentUserName;
} else if (window.location.search.includes('vk_app_id')) {
    vkBridge.send('VKWebAppInit');
    vkBridge.send('VKWebAppGetUserInfo').then((user) => {
        userId = user.id;
        platform = 'vk';
        currentUserName = user.first_name || 'Участник VK';
        document.getElementById('user-name').innerText = currentUserName;
    }).catch(() => console.log("VK Bridge Auth Error"));
} else {
    document.getElementById('user-name').innerText = "Браузер";
}

// 2. ПОЛУЧЕНИЕ И ОБРАБОТКА ДАННЫХ КАЛЕНДАРЯ
async function fetchEvents() {
    try {
        const response = await fetch('/api/events');
        if (response.ok) {
            allEvents = await response.json();
            renderCalendarGrid();
            renderEventsForSelectedDay();
        }
    } catch (err) {
        console.error("Ошибка загрузки событий:", err);
    }
}

// Получение списка дат текущей недели (Пн-Вс)
function getCurrentWeekDays() {
    const current = new Date();
    const dayOfWeek = current.getDay(); // 0 (Вс) - 6 (Сб)
    const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(current.setDate(current.getDate() + distanceToMonday));
    
    const days = [];
    for (let i = 0; i < 7; i++) {
        const nextDay = new Date(monday);
        nextDay.setDate(monday.getDate() + i);
        days.push(nextDay);
    }
    return days;
}

// 3. ОТРИСОВКА ИНТЕРФЕЙСА (DOM)
function renderCalendarGrid() {
    const grid = document.getElementById('calendar-grid');
    grid.innerHTML = '';
    
    const weekDays = getCurrentWeekDays();
    const labels = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

    weekDays.forEach((date, index) => {
        const dateStr = date.toISOString().split('T')[0];
        const hasEvent = allEvents.some(e => e.event_date.split('T')[0] === dateStr);
        const isSelected = dateStr === selectedDateStr;
        
        const dayButton = document.createElement('button');
        dayButton.type = 'button';
        
        // Поиск цвета первого попавшегося события на этот день для закрашивания
        const dayEvent = allEvents.find(e => e.event_date.split('T')[0] === dateStr);
        const dayColor = dayEvent ? dayEvent.color_tag : null;

        // Базовая верстка Tailwind v4
        let baseClass = "flex flex-col items-center justify-center p-2 rounded-xl font-bold text-xs transition-all cursor-pointer h-14 ";
        
        if (isSelected) {
            baseClass += "bg-indigo-600 text-white ring-2 ring-indigo-300 ring-offset-2 scale-105 shadow-sm";
            if (dayColor) dayButton.style.backgroundColor = dayColor; // Приоритет кастомному цвету планов
        } else if (hasEvent && dayColor) {
            dayButton.style.backgroundColor = dayColor + "20"; // Полупрозрачный фон для дней с планами (HEX + Alpha 20)
            dayButton.style.color = dayColor;
            dayButton.style.border = `2px solid ${dayColor}`;
        } else {
            baseClass += "bg-white text-slate-600 hover:bg-slate-100 border border-slate-100";
        }
        
        dayButton.className = baseClass;
        dayButton.innerHTML = `<span class="opacity-60 text-[10px] font-medium">${labels[index]}</span><span class="text-sm mt-0.5">${date.getDate()}</span>`;
        
        dayButton.onclick = () => {
            selectedDateStr = dateStr;
            renderCalendarGrid();
            renderEventsForSelectedDay();
        };
        
        grid.appendChild(dayButton);
    });
}

function renderEventsForSelectedDay() {
    const list = document.getElementById('events-list');
    list.innerHTML = '';
    
    // Форматирование заголовка выбранного дня
    const d = new Date(selectedDateStr);
    document.getElementById('selected-day-title').innerText = `Планы на ${d.getDate()}.${d.getMonth() + 1}`;

    const dayEvents = allEvents.filter(e => e.event_date.split('T')[0] === selectedDateStr);

    if (dayEvents.length === 0) {
        list.innerHTML = `<div class="text-center py-8 text-sm text-slate-400 font-medium bg-white rounded-2xl border border-slate-100 border-dashed">На этот день планов нет</div>`;
        return;
    }

    dayEvents.forEach(event => {
        const time = new Date(event.event_date).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        const card = document.createElement('div');
        
        card.className = "bg-white p-4 rounded-2xl border-l-4 shadow-xs border-y border-r border-slate-100 flex justify-between items-center transition hover:shadow-sm";
        card.style.borderLeftColor = event.color_tag;
        
        card.innerHTML = `
            <div class="space-y-0.5 max-w-[75%]">
                <div class="flex items-center gap-2">
                    <span class="text-xs font-bold" style="color: ${event.color_tag}">${time}</span>
                    <h4 class="font-bold text-slate-800 text-sm truncate">${event.title}</h4>
                </div>
                <p class="text-xs text-slate-500 line-clamp-2">${event.description || 'Без описания'}</p>
                <div class="text-[10px] text-slate-400 font-semibold">👨‍💻 Добавил: ${event.creator_name}</div>
            </div>
            <button onclick='openEditModal(${JSON.stringify(event)})' class="text-slate-400 hover:text-indigo-600 p-2 text-xs font-bold transition">✏️ Изменить</button>
        `;
        list.appendChild(card);
    });
}

// 4. УПРАВЛЕНИЕ МОДАЛЬНЫМ ОКНОМ И ОТПРАВКА CRUD ФОРМЫ
function openCreateModal() {
    currentEditingEventId = null;
    document.getElementById('modal-title').innerText = "Новое событие";
    document.getElementById('event-form').reset();
    document.getElementById('form-date').value = `${selectedDateStr}T12:00`;
    document.getElementById('btn-delete').classList.add('hidden');
    document.getElementById('event-modal').classList.remove('hidden');
}

function openEditModal(event) {
    currentEditingEventId = event.id;
    document.getElementById('modal-title').innerText = "Редактировать план";
    document.getElementById('form-title').value = event.title;
    document.getElementById('form-desc').value = event.description || '';
    document.getElementById('form-date').value = event.event_date.substring(0, 16);
    document.getElementById('form-color').value = event.color_tag;
    
    const btnDel = document.getElementById('btn-delete');
    btnDel.classList.remove('hidden');
    btnDel.onclick = () => deleteEvent(event.id);
    
    document.getElementById('event-modal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('event-modal').classList.add('hidden');
}

document.getElementById('event-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = {
        title: document.getElementById('form-title').value,
        description: document.getElementById('form-desc').value,
        event_date: new Date(document.getElementById('form-date').value).toISOString(),
        color_tag: document.getElementById('form-color').value,
        creator_name: currentUserName
    };

    const url = currentEditingEventId ? `/api/events/${currentEditingEventId}` : '/api/events';
    const method = currentEditingEventId ? 'PUT' : 'POST';

    const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (response.ok) {
        closeModal();
        fetchEvents();
    }
});

async function deleteEvent(eventId) {
    if (!confirm("Вы уверены, что хотите удалить этот план вашей семьи?")) return;
    
    const response = await fetch(`/api/events/${eventId}?creator_name=${encodeURIComponent(currentUserName)}`, {
        method: 'DELETE'
    });

    if (response.ok) {
        closeModal();
        fetchEvents();
    }
}

// Стартовый вызов
fetchEvents();
