// Получаем элементы формы
const addForm = document.getElementById('add-form');
const amountInput = document.getElementById('amount');
const categoryInput = document.getElementById('category');
const descriptionInput = document.getElementById('description');
const dateInput = document.getElementById('date');
const incomeCategoryInput = document.getElementById('income-category');
const expenseCategoryInput = document.getElementById('expense-category');
const recordsContainer = document.getElementById('records-container');
const chartsContainer = document.getElementById('charts-container');
const showChartsButton = document.getElementById('show-charts');

// Массив для хранения данных
let records = [];

// Настройка графиков
const incomeChartCtx = document.getElementById('income-chart').getContext('2d');
const expenseChartCtx = document.getElementById('expense-chart').getContext('2d');

let incomeChart = new Chart(incomeChartCtx, {
    type: 'pie',
    data: {
        labels: ['Заработная плата', 'Перевод', 'Премия', 'Другое'],
        datasets: [{ data: [0, 0, 0, 0], backgroundColor: ['#4CAF50', '#FF9800', '#3F51B5', '#9E9E9E'] }]
    },
    options: { responsive: true }
});

let expenseChart = new Chart(expenseChartCtx, {
    type: 'pie',
    data: {
        labels: ['Здоровье', 'Отдых', 'Еда', 'Другое'],
        datasets: [{ data: [0, 0, 0, 0], backgroundColor: ['#E91E63', '#2196F3', '#FFC107', '#9E9E9E'] }]
    },
    options: { responsive: true }
});

// Обновление графиков
function updateCharts() {
    const incomeCategories = ['salary', 'transfer', 'bonus', 'other'];
    const expenseCategories = ['health', 'rest', 'food', 'other'];

    const incomeAmounts = incomeCategories.map(cat =>
        records.filter(r => r.category === 'income' && r.subcategory === cat).reduce((sum, r) => sum + r.amount, 0)
    );
    incomeChart.data.datasets[0].data = incomeAmounts;

    const expenseAmounts = expenseCategories.map(cat =>
        records.filter(r => r.category === 'expense' && r.subcategory === cat).reduce((sum, r) => sum + r.amount, 0)
    );
    expenseChart.data.datasets[0].data = expenseAmounts;

    incomeChart.update();
    expenseChart.update();
}

// Отображение записей
function renderRecords() {
    recordsContainer.innerHTML = '';

    // Сортировка записей по дате (от самой новой к самой старой)
    records.sort((a, b) => b.date - a.date);

    records.forEach((record, index) => {
        const recordElement = document.createElement('div');
        recordElement.classList.add('record', record.category === 'income' ? 'record-income' : 'record-expense');

        let categoryText = record.subcategory;
        if (categoryText === 'salary') categoryText = 'Заработная плата';
        if (categoryText === 'transfer') categoryText = 'Перевод';
        if (categoryText === 'bonus') categoryText = 'Премия';
        if (categoryText === 'other') categoryText = 'Другое';
        if (categoryText === 'health') categoryText = 'Здоровье';
        if (categoryText === 'rest') categoryText = 'Отдых';
        if (categoryText === 'food') categoryText = 'Еда';

        recordElement.innerHTML = `
            <p><strong>Сумма:</strong> ${record.amount} ₽</p>
            <p><strong>Категория:</strong> ${categoryText}</p>
            <p><strong>Описание:</strong> ${record.description || 'Нет описания'}</p>
            <p><strong>Дата:</strong> ${record.date.toLocaleDateString()}</p>
            <button class="edit-button" data-index="${index}">Редактировать</button>
            <button class="delete-button" data-index="${index}">Удалить</button>
        `;

        // Кнопка редактирования
        const editButton = recordElement.querySelector('.edit-button');
        editButton.addEventListener('click', () => editRecord(index));

        // Кнопка удаления
        const deleteButton = recordElement.querySelector('.delete-button');
        deleteButton.addEventListener('click', () => deleteRecord(index));

        recordsContainer.appendChild(recordElement);
    });
}

// Редактирование записи
function editRecord(index) {
    const record = records[index];
    amountInput.value = record.amount;
    categoryInput.value = record.category;
    descriptionInput.value = record.description || '';
    dateInput.value = record.date.toISOString().split('T')[0];
    
    if (record.category === 'income') {
        incomeCategoryInput.style.display = 'block';
        expenseCategoryInput.style.display = 'none';
        incomeCategoryInput.value = record.subcategory;
    } else {
        expenseCategoryInput.style.display = 'block';
        incomeCategoryInput.style.display = 'none';
        expenseCategoryInput.value = record.subcategory;
    }

    addForm.onsubmit = (event) => {
        event.preventDefault();
        const updatedRecord = {
            amount: parseFloat(amountInput.value),
            category: categoryInput.value,
            subcategory: (categoryInput.value === 'income' ? incomeCategoryInput : expenseCategoryInput).value,
            description: descriptionInput.value,
            date: new Date(dateInput.value)
        };

        records[index] = updatedRecord;
        renderRecords();
        updateCharts();
        addForm.reset();
        addForm.onsubmit = addRecord; // Возвращаем стандартное поведение формы
    };
}

// Удаление записи
function deleteRecord(index) {
    records.splice(index, 1);
    renderRecords();
    updateCharts();
}

// Добавление новой записи
function addRecord(event) {
    event.preventDefault();

    const amount = parseFloat(amountInput.value);
    const category = categoryInput.value;
    const description = descriptionInput.value;
    const date = new Date(dateInput.value || Date.now());
    const subcategory = (category === 'income' ? incomeCategoryInput : expenseCategoryInput).value;

    records.push({ amount, category, subcategory, description, date });
    renderRecords();
    updateCharts();

    addForm.reset();
    incomeCategoryInput.style.display = 'block';
    expenseCategoryInput.style.display = 'none';
}

// Переключение категорий
categoryInput.addEventListener('change', () => {
    const isIncome = categoryInput.value === 'income';
    incomeCategoryInput.style.display = isIncome ? 'block' : 'none';
    expenseCategoryInput.style.display = isIncome ? 'none' : 'block';
});

// Показать/скрыть графики
showChartsButton.addEventListener('click', () => {
    chartsContainer.style.display = chartsContainer.style.display === 'none' ? 'block' : 'none';
});

// Изначальный обработчик для добавления записи
addForm.onsubmit = addRecord;
