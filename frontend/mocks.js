// Переключатель режима тестирования 
const IS_MOCK_MODE = true;

// Список членов семьи для быстрого тестирования ролей
const MOCK_FAMILY = [
    { id: 101, name: "Папа 👨", platform: "tg" },
    { id: 102, name: "Мама 👩", platform: "vk" },
    { id: 103, name: "Сын 🧑", platform: "tg" },
    { id: 104, name: "Дочь 👧", platform: "max" }
];

// Функция безопасного получения текущего мок-пользователя из хранилища браузера
function getActiveMockUser() {
    const saved = localStorage.getItem("active_mock_user");
    if (saved) return JSON.parse(saved);
    // По умолчанию выбираем первого
    localStorage.setItem("active_mock_user", JSON.stringify(MOCK_FAMILY[0]));
    return MOCK_FAMILY[0];
}

// Функция смены роли на лету
function setActiveMockUser(userId) {
    const user = MOCK_FAMILY.find(u => u.id === parseInt(userId));
    if (user) {
        localStorage.setItem("active_mock_user", JSON.stringify(user));
        location.reload(); // Перезагружаем страницу для применения роли
    }
}
