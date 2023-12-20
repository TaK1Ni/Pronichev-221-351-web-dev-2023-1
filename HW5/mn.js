'use strict';

const BASE_URL = new URL("http://tasks-api.std-900.ist.mospolytech.ru/");
const API_KEY = "50d2199a-42dc-447d-81ed-d68a443b697e";

function varToString(varObj) {
  return Object.keys(varObj)[0].toLowerCase();
}

async function showMessage(title, message, type = "alert-success") {  
    const alert = document.getElementById("alert-template").content.firstElementChild.cloneNode(true);  
    const stitle = document.createElement("strong");  
    stitle.innerHTML = title;  
    alert.querySelector(".msg").innerHTML = `${stitle.outerHTML} ${message}`;  
    alert.classList.add(type);  
    setTimeout(()=>alert.remove(), 3000);  
    document.querySelector('.alerts').append(alert);  
}



async function dataShield(paket) { 
    let formBody = []; 
    for (let property in paket) { 
        let encodedKey = encodeURIComponent(property); 
        let encodedValue = encodeURIComponent(paket[property]); 
        formBody.push(encodedKey + "=" + encodedValue); 
    } 
    formBody = formBody.join("&"); 
    return formBody; 
}

async function getTasks() { 
    let endpoint = new URL("api/tasks", BASE_URL); 
    endpoint.searchParams.set(varToString({API_KEY}), API_KEY); 
    let response = await fetch(endpoint); 
    if (response.ok) { 
        let datas = await response.json(); 
        if ("error" in datas) throw new Error(datas.error); 
        else { 
            return datas; 
        } 
    } 
    else throw new Error(response.status); 
}



async function getTask(paket) { 
    let endpoint = new URL(`api/tasks/${paket}`, BASE_URL); 
    endpoint.searchParams.set(varToString({API_KEY}), API_KEY); 
    let response = await fetch(endpoint); 
    if (response.ok) { 
        let data = await response.json(); 
        if ("error" in data) throw new Error(data.error); 
        else { 
            return data; 
        } 
    } 
    else throw new Error(response.status); 
}



async function setTask(paket) { 
    let endpoint = new URL("api/tasks", BASE_URL); 
    endpoint.searchParams.set(varToString({API_KEY}), API_KEY); 
    let response = await fetch( 
        endpoint, 
        { 
            headers: new Headers( 
                { 
                    'content-type': 'application/x-www-form-urlencoded', 
                } 
            ), 
            method: "POST", 
            body: await dataShield(paket), 
            mode: "cors" 
        } 
    ); 
    if (response.ok) { 
        let data = await response.json(); 
        if ("error" in data) throw new Error(data.error); 
        else { 
            return data; 
        } 
    } 
    else throw new Error(response.status); 
}


async function editTask(taskIdVal, paket) { 
    let endpoint = new URL(`api/tasks/${taskIdVal}`, BASE_URL); 
    endpoint.searchParams.set(varToString({API_KEY}), API_KEY); 
    let response = await fetch( 
        endpoint, 
        { 
            headers: new Headers( 
                { 
                    'content-type': 'application/x-www-form-urlencoded', 
                } 
            ), 
            method: "PUT", 
            body: await dataShield(paket), 
            mode: "cors" 
        } 
    ); 
    if (response.ok) { 
        let data = await response.json(); 
        if ("error" in data) throw new Error(data.error); 
        else { 
            return data; 
        } 
    } 
    else throw new Error(response.status); 
}


async function deleteTask(taskIdVal) { 
    let endpoint = new URL(`api/tasks/${taskIdVal}`, BASE_URL); 
    endpoint.searchParams.set(varToString({API_KEY}), API_KEY); 
    let response = await fetch(endpoint, { 
        method: "DELETE" 
    }); 
    if (response.ok) { 
        let data = await response.json(); 
        if (Number.isInteger(data)) return data; 
        else { 
            throw new Error(data.error); 
        } 
    } 
    else throw new Error(response.status); 
}

async function getTasksData() { 
    try { 
        return await getTasks(); 
    } 
    catch (err) { 
        throw err; 
    } 
}

async function getTaskData(taskIdVal) { 
    try { 
        return await getTask(taskIdVal); 
    } 
    catch (err) { 
        throw err; 
    } 
}

async function setTaskData(paketAdd) { 
    try { 
        paketAdd = await setTask(paketAdd); 
        showMessage("Уведомление!", `Успешно добавлена задача ${paketAdd.name}`); 
        return paketAdd; 
    } 
    catch (err) { 
        throw err; 
    } 
}

async function editTaskData(taskIdVal, paketId) { 
    try { 
        paketId = await editTask(taskIdVal, paketId); 
        showMessage("Уведомление!", `Успешно изменена задача ${paketId.name}`); 
        return paketId; 
    } 
    catch (err) { 
        throw err; 
    } 
}

async function deleteTaskData(taskIdVal) { 
    try { 
        await deleteTask(taskIdVal); 
        showMessage("Уведомление!", "Успешно удалена задача"); 
    } 
    catch (err) { 
        throw err; 
    } 
}

async function changeListCounter(list, incOrDec = true) { 
    let todoList = document.querySelector('#to-do-list'); 
    let doneList = document.querySelector('#done-list'); 
    let listCounter = document.querySelector('.tasks-counter');

    if (list == 'to-do-list') {
        listCounter = todoList.closest('.card').querySelector('.tasks-counter');
    } 
    else if (list == 'done-list') {
        listCounter = doneList.closest('.card').querySelector('.tasks-counter');
    }
    
    listCounter.innerHTML = Number.parseInt(listCounter.innerHTML) + (incOrDec ? 1 : -1); 
}

async function onColumnChange(event) { 
    try { 
        let taskIdVal = event.target.closest('.task').id; 
        let paketId = await getTaskData(taskIdVal); 
        let paketStatus = paketId.status;
        if (paketStatus == 'to-do') {
            paketId.status = 'done';
        } else {
            paketId.status = 'to-do';
        }
                paketId = await editTaskData(paketId.id, paketId); 
        await window["editTaskNode"](paketId); 
    } 
    catch (err) { 
        showMessage("Ошибка", err.message, "alert-danger"); 
    } 
}

async function addTaskNode(data) { 
    try { 
        let taskNodeVal = document.querySelector('#task-template').content.firstElementChild.cloneNode(true); 
        let todoListVal = document.querySelector('#to-do-list'); 
        let doneListVal = document.querySelector('#done-list'); 
        taskNodeVal.querySelector('.task-name').innerHTML = data.name; 
        taskNodeVal.setAttribute('id', data.id); 

        if (data.status == 'to-do') {
            todoListVal.appendChild(taskNodeVal);
        } else {
            doneListVal.appendChild(taskNodeVal);
        }        
        taskNodeVal.querySelector('.move-to-do').onclick = onColumnChange; 
        document.querySelector('.move-done').onclick = onColumnChange; 
        await changeListCounter(`${data.status}-list`); 
    } 
    catch (err) { 
        throw err; 
    } 
}

async function deleteTaskNode(paketForDelet, currentList) { 
    try { 
        let taskNode = document.getElementById(paketForDelet.id); 
        taskNode.remove(); 
        await changeListCounter(currentList, false); 
    } catch (err) { 
        throw err; 
    } 
}

async function editTaskNode(paketForEdit) { 
    try { 
        let taskNodeVal = document.getElementById(paketForEdit.id); 
        let currentListValId = taskNodeVal.closest("ul").id; 
        if (currentListValId != `${paketForEdit.status}-list`) { 
            await deleteTaskNode(paketForEdit, currentListValId); 
            await addTaskNode(paketForEdit); 
        } else { 
            taskNodeVal.querySelector('.task-name').innerHTML = paketForEdit.name; 
        } 
    } catch (err) { 
        throw err; 
    } 
}

async function onAddClick(event) {
    try {
        let formFrom = event.target.closest('.modal').querySelector('form');
        let taskNameVal = formFrom.elements['taskName'].value;
        let taskDescVal = formFrom.elements['taskDesc'].value;
        let taskStateVal = formFrom.elements['taskState'].value;

        if (!taskNameVal) {
            throw new Error("Ошибка: Поле 'Название задачи' не может быть пустым");
        }

        if (!taskDescVal) {
            throw new Error("Ошибка: Поле 'Описание задачи' не может быть пустым");
        }
        let paketAdd = {
            name: taskNameVal,
            desc: taskDescVal,
            status: taskStateVal
        };
        formFrom.reset();
        paketAdd = await setTaskData(paketAdd);
        await addTaskNode(paketAdd);
    } 
    catch (err) {
        showMessage("Ошибка!", err.message, "alert-danger");
    }
}

async function onEditClick(event) { 
    try { 
        let form = event.target.closest('.modal').querySelector('form'); 
        const paketEdit = { 
            id: form.id, 
            name: form.elements['taskName'].value, 
            desc: form.elements['taskDesc'].value, 
            status: form.elements['taskState'].value 
        }; 
        form.reset(); 
        await editTaskNode(paketEdit); 
        await editTaskData(form.id, paketEdit); 
        form.id = ""; 
    } 
    catch (err) { 
        showMessage("Ошибка!", err.message, "alert-danger"); 
    } 
}

async function onDeleteClick(event) { 
    try { 
        let formFrom = event.target.closest('.modal').querySelector('form'); 
        formFrom.reset(); 
        let paketId = await getTaskData(formFrom.id); 
        await deleteTaskNode(paketId, `${paketId.status}-list`); 
        await deleteTaskData(formFrom.id); 
        formFrom.id = ""; 
    } 
    catch (err) { 
        showMessage("Ошибка!", err.message, "alert-danger"); 
    } 
}

async function onEditOpen(event) { 
    let formFrom = event.target.querySelector('form'); 
    let taskIdVal = event.relatedTarget.closest('.task').id; 
    formFrom.id = taskIdVal; 
    let pakerForEdit = await getTaskData(taskIdVal); 
    formFrom.elements['taskName'].value = pakerForEdit['name']; 
    formFrom.elements['taskDesc'].value = pakerForEdit['desc']; 
    formFrom.elements['taskState'].value = pakerForEdit['status']; 
}


async function onViewOpen(event) { 
    let formFrom = event.target.querySelector('form'); 
    let taskIdVal = event.relatedTarget.closest('.task').id; 
    let paketForView = await getTaskData(taskIdVal); 
    formFrom.elements['taskName'].value = paketForView['name']; 
    formFrom.elements['taskDesc'].value = paketForView['desc']; 
    formFrom.elements['taskState'].value = paketForView['status']; 
}

async function onDeleteOpen(event) { 
    let formFrom = event.target.querySelector('form'); 
    let taskIdVal = event.relatedTarget.closest('.task').id; 
    formFrom.id = taskIdVal; 
    let paketForDelet = await getTaskData(taskIdVal); 
    formFrom.elements['taskName'].value = paketForDelet['name']; 
    formFrom.elements['taskDesc'].value = paketForDelet['desc']; 
    formFrom.elements['taskState'].value = paketForDelet['status']; 
}

window.onload = async () => { 
    try { 
        let datas = await getTasksData(); 
        document.getElementById('task_add').onclick = onAddClick; 
        document.getElementById('task_edit').onclick = onEditClick; 
        document.getElementById('task_delete').onclick = onDeleteClick; 
        for (let i = 0; i < datas["tasks"]["length"]; i++) { 
            await addTaskNode(await getTaskData(datas.tasks[i].id)); 
        } 
        let modalEdit = document.getElementById('ModalEdit'); 
        modalEdit.addEventListener('show.bs.modal', onEditOpen); 
        let modalView = document.getElementById('ModalView'); 
        modalView.addEventListener('show.bs.modal', onViewOpen); 
        let modalDelete = document.getElementById('ModalDelete'); 
        modalDelete.addEventListener('show.bs.modal', onDeleteOpen); 
    } 
    catch (err) 
    {
        console.error(err); 
    } 
};