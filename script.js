const board = document.querySelector(".board");
const listCopy = document.querySelector(".list").cloneNode(true);

document.querySelector(".card__add").addEventListener("click", addCard);
document.querySelector(".list").addEventListener("drop", handleDrop);

let srcCard = null;

window.onload = loadData;

const listAdd = document.querySelector(".list__add");


listAdd.addEventListener("click", () => {
	const numLists = document.querySelectorAll(".list").length;

	createList(`List ${numLists+1}`, []);
});


board.addEventListener("dragstart", (event) => {
	if (event.target.classList.contains("card")) {

		srcCard = event.target;

		let dragTime = (new Date()).getTime();
		event.target.dataset.time = dragTime;

		event.dataTransfer.setData("text", dragTime);
		event.dataTransfer.effectAllowed = "move";
	}
});

board.addEventListener("dragover", () => {
	event.preventDefault();
	event.dataTransfer.dropEffect = "move";
});

function addCard(e) {
	const bttn = e.target;

	const list = bttn.parentElement.parentElement;

	if(list.querySelector(".new__text").value.length == 0){
		return;
	}

	let cardName = list.querySelector(".new__text").value;

	createCard(cardName, list);

	list.querySelector(".new__text").value = "";
}

function handleDrop(event) {
	event.preventDefault();

	let data = event.dataTransfer.getData("text");
	let element = document.querySelector(`div[data-time='${data}']`);

	let list = event.currentTarget;

	if(event.target.classList.contains("card")){
		list.querySelector(".list__content").insertBefore(element, event.target);
		event.target.style.borderTop = "none";
	}

	saveContent();
}

function dragEnter(event){
	event.preventDefault();

	if(event.target.classList.contains("card")){
		let height = srcCard.getBoundingClientRect().height;

		event.target.style.borderTop = `${height}px solid white`;
	}
}

function dragLeave(event){
	event.target.style.borderTop = "none";
}

function editCard(){
	event.stopPropagation();
	let card = event.currentTarget.parentElement;

	card.setAttribute("draggable", "false");

	let currValue = card.querySelector("p").textContent;

	card.querySelector("p").style.display = "none";

	let editText = document.createElement("input");
	editText.value = currValue;

	card.insertBefore(editText, event.currentTarget);

	event.currentTarget.style.display = "none";

	card.querySelector(".card__delete").style.display = "none";
	card.querySelector(".card__confirm").style.display = "inline-block";
	card.querySelector(".card__cancel").style.display = "inline-block";
}

function confirmEdit(event){
	let card = event.currentTarget.parentElement;
	let editText = card.querySelector("input");

	let newVal = editText.value;

	card.removeChild(editText);

	let cardName = card.querySelector("p");
	cardName.textContent = newVal;

	cardName.style.display = "inline-block";

	event.currentTarget.style.display = "none";
	card.querySelector(".card__cancel").style.display = "none";
	card.querySelector(".card__edit").style.display = "inline-block";
	card.querySelector(".card__delete").style.display = "inline-block";

	card.setAttribute("draggable", "true");

	saveContent();

}

function cancelEdit(event){
	let card = event.currentTarget.parentElement;

	let editText = card.querySelector("input");

	card.removeChild(editText);

	let cardName = card.querySelector("p");
	cardName.style.display = "inline-block";

	event.currentTarget.style.display = "none";
	card.querySelector(".card__confirm").style.display = "none";
	card.querySelector(".card__edit").style.display = "inline-block";
	card.querySelector(".card__delete").style.display = "inline-block";

	card.setAttribute("draggable", "true");
}

function saveContent(){
	localStorage.clear();

	const lists = document.querySelectorAll(".list");

	let storageObj = [];

	lists.forEach(list => {
		const cards = list.querySelectorAll(".card");
		
		let listObj = {}; 
		let cardList = [];

		cards.forEach(card => {
			cardList.push(card.querySelector("p").textContent);
		});

		let listName = list.querySelector(".list__name").textContent;

		listObj.name = listName;
		listObj.cards = cardList;

		storageObj.push(listObj);
	});

	localStorage.setItem("board", JSON.stringify(storageObj));
}

function loadData(){
	let listArr = JSON.parse(localStorage.getItem("board"));
	
	if(listArr){
		let originalList = document.querySelector(".list");
		originalList.parentNode.removeChild(originalList);

		listArr.forEach(listObj => {
			createList(listObj.name, listObj.cards);
		});
	}

}

function createList(listName, cards){
	const newList = listCopy.cloneNode(true);
	newList.querySelector(".card__add").addEventListener("click", addCard);
	newList.addEventListener("drop", handleDrop);

	newList.querySelector(".list__name").textContent = listName;

	board.insertBefore(newList, listAdd);

	cards.forEach(card => {
		createCard(card, newList);
	});

	saveContent();

}

function createCard(cardName, parentList){
	const newCard = document.createElement("div");
	newCard.className = "card";
	newCard.setAttribute("draggable", "true");

	const cardTitle = document.createElement("p");
	cardTitle.textContent = cardName;

	const editBttn = document.createElement("button");
	editBttn.classList.add("card__edit");
	const editIcon = document.createElement("i");
	editIcon.classList.add("fa", "fa-pen");

	editBttn.appendChild(editIcon);
	editBttn.addEventListener("click", editCard);

	const deleteBttn = document.createElement("button");
	deleteBttn.classList.add("card__delete");
	const deleteIcon = document.createElement("i");
	deleteIcon.classList.add("fa", "fa-trash-alt");

	deleteBttn.appendChild(deleteIcon);
	deleteBttn.addEventListener("click", deleteCard);

	const confirmBttn = document.createElement("button");
	confirmBttn.classList.add("card__confirm");
	const confirmIcon = document.createElement("i");
	confirmIcon.classList.add("fa", "fa-check");

	confirmBttn.appendChild(confirmIcon);
	confirmBttn.addEventListener("click", confirmEdit);

	confirmBttn.style.display = "none";

	const cancelBttn = document.createElement("button");
	cancelBttn.classList.add("card__cancel");
	const cancelIcon = document.createElement("i");
	cancelIcon.classList.add("fa", "fa-times");

	cancelBttn.appendChild(cancelIcon);
	cancelBttn.addEventListener("click", cancelEdit);

	cancelBttn.style.display = "none";

	newCard.appendChild(cardTitle);
	newCard.appendChild(editBttn);
	newCard.appendChild(deleteBttn);
	newCard.appendChild(confirmBttn);
	newCard.appendChild(cancelBttn);

	newCard.addEventListener("dragenter", dragEnter);
	newCard.addEventListener("dragleave", dragLeave);

	parentList.querySelector(".list__content").appendChild(newCard);

	saveContent();
}

function deleteCard(event){
	let card = event.currentTarget.parentNode;
	card.parentNode.removeChild(card);

	saveContent();
}