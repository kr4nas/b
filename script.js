document.getElementById('auth').addEventListener('click', function() {
    window.location.href = 'login.html';
});
if (sessionStorage.getItem('isAuthenticated') === 'true') {
    document.querySelector('.exit').style.display = 'block';
    document.querySelector('.edit').style.display = 'block';
    document.querySelector('.b').style.display = 'none'; 
    document.querySelector('button[type="submit"]').style.display = 'none';
}
document.getElementById('exit').addEventListener('click', function() {
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('isAdmin'); 
    window.location.reload();
});
const courseSelect = document.getElementById('c');
const groupSelect = document.getElementById('g');
const groups = {
    c1: ['11Д', '12П', '13Ф', '14К', '15Т'],
    c2: ['21Д', '22П', '23Ф', '24К', '25Т'],
    c3: ['31Д', '32П', '33Ф', '34К', '35Т'],
    c4: ['41Д', '42П', '43Ф', '44К', '45Т'],
    c5: ['54К']
};
courseSelect.addEventListener('change', function() {
    const selectedCourse = this.value;
    groupSelect.innerHTML = '<option value="">Выберите группу</option>';
    if (selectedCourse) {
        const availableGroups = groups[selectedCourse];
        availableGroups.forEach(function(group) {
            const option = document.createElement('option');
            option.value = group; 
            option.textContent = group; 
            groupSelect.appendChild(option);
        });
    }
});
function showSchedule () {
    const scheduleElement = document.getElementById('r');
    scheduleElement.classList.toggle('visible'); 
}
let toggleCount = 0; 
document.getElementById('r-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const group = groupSelect.value; 
    const date = document.getElementById('date').value; 
    const button = document.querySelector('button[type="submit"]');
    if (group && date) {
        const [year, month, day] = date.split('-');
        const formattedDate = `${day}.${month}.${year}`; 
        const folderPath = `https://kr4nas.github.io/b/${date}/`; 
        fetch(folderPath + `${group}.txt`)
            .then(response => {
                console.log('Response status:', response.status); 
                if (!response.ok) {
                    throw new Error('Сеть не в порядке');
                }
                return response.text();
            })
            .then(data => {
                if (sessionStorage.getItem('isAuthenticated') === 'true' && sessionStorage.getItem('isAdmin') === 'true') {
                    document.getElementById('save-textarea').value = data; 
                    document.querySelector('.save').style.display = 'block'; 
                } else {
                    const scheduleTable = document.getElementById('r');
                    scheduleTable.innerHTML = ''; 
                    const table = document.createElement('table');
                    const caption = document.createElement('caption');
                    caption.textContent = `Расписание для ${group} на ${formattedDate}:`;
                    table.appendChild(caption);
                    const rows = data.split('\n');
                    rows.forEach((row, index) => {
                        const tr = document.createElement('tr');
                        const td1 = document.createElement('td');
                        td1.textContent = index + 1; 
                        const td2 = document.createElement('td');
                        td2.textContent = row; 
                        tr.appendChild(td1);
                        tr.appendChild(td2);
                        table.appendChild(tr);
                    });
                    scheduleTable.appendChild(table);
                    showSchedule(); 
                    toggleCount++;
                    button.innerText = (toggleCount % 2 === 1) ? 'Скрыть расписание' : 'Показать расписание';
                }
            })
            .catch(error => {
                console.error('Ошибка:', error); 
                document.getElementById('r').innerText = 'Ошибка загрузки расписания.';
            });
    } else {
        document.getElementById('r').innerText = 'Пожалуйста, выберите группу и дату.';
    }
});
let nn = 0; 
document.getElementById('edit').addEventListener('click', function() {
    const group = groupSelect.value; 
    const date = document.getElementById('date').value; 
    const scheduleEditDiv = document.querySelector('.save');
    if (group && date ) {
        const [year, month, day] = date.split('-');
        const folderPath = `https://kr4nas.github.io/b/${date}/`; 
        fetch(folderPath + `${group}.txt`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Сеть не в порядке');
                }
                return response.text();
            })
            .then(data => {
                if (nn % 2 === 0) {
                    document.getElementById('save-textarea').value = data; 
                    scheduleEditDiv.style.display = 'block'; 
                    this.innerText = 'Отменить редактирование'; 
                } else {
                    scheduleEditDiv.style.display = 'none'; 
                    this.innerText = 'Редактировать расписание'; 
                }
                nn++; 
            })
            .catch(error => {
                console.error('Ошибка:', error); 
                alert('Ошибка загрузки расписания для редактирования.');
            });
    } else {
        alert('Пожалуйста, выберите группу и дату для редактирования расписания.');
    }
});
document.getElementById('save-button').addEventListener('click', function() {
    const group = groupSelect.value; 
    const date = document.getElementById('date').value; 
    const scheduleData = document.getElementById('save-textarea').value; 
    const folderPath = `https://kr4nas.github.io/b/${date}/`; 
    const filePath = `${folderPath}${group}.txt`;
    fetch(filePath, {
        method: 'PUT',
        body: scheduleData,
        headers: {
            'Content-Type': 'text/plain'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Ошибка при сохранении расписания.');
        }
        alert('Расписание успешно сохранено.');
    })
    .catch(error => {
        console.error('Ошибка:', error); 
        alert('Ошибка при сохранении расписания.');
    });

});
