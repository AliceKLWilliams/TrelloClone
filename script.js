const board = document.querySelector(".board");

const originalCard = document.querySelector(".card--original");

const cardCopy = originalCard.cloneNode(true);
cardCopy.classList.remove(".card--original");
originalCard.parentNode.removeChild(originalCard);

const listCopy = document.querySelector(".list").cloneNode(true);

window.onload = loadData;

let lastCard, shadowDiv;

function addList(){
	const numLists = document.querySelectorAll(".list").length;

	const newList = createList(`List ${numLists+1}`, []);

	newList.querySelector(".list__edit").click();
}


board.addEventListener("dragstart", (event) => {
	if (event.target.classList.contains("card")) {

		let dragTime = (new Date()).getTime();
		event.target.dataset.time = dragTime;

		event.dataTransfer.setData("text", dragTime);
		event.dataTransfer.effectAllowed = "move";

		setTimeout(()=>{
			event.target.classList.add("card--hidden");
		},1);

		shadowDiv = document.createElement("div");
		shadowDiv.style.height = `${event.target.clientHeight}px`;
		shadowDiv.style.width = `${event.target.clientWidth}px`;

		shadowDiv.classList.add("card--shadow");
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

function contentDrop(event) {

	event.preventDefault();

	event.stopPropagation();

	let data = event.dataTransfer.getData("text");
	let element = document.querySelector(`div[data-time='${data}']`);

	if(event.currentTarget.querySelectorAll(".card").length == 0){
		event.currentTarget.appendChild(element);
	} else {

		let card = lastCard;

		let y = card.offsetTop;
		let offset = event.pageY - y;

		let height = card.clientHeight;
		let boundary = height/2;

		if(offset <= boundary){
			// Insert the card before
			card.parentNode.insertBefore(element, card);
		} else{
			// Insert the card after
			card.parentNode.insertBefore(element, card.nextSibling);
		}
	}

	element.classList.remove("card--hidden");
	shadowDiv.parentNode.removeChild(shadowDiv);
	
	saveContent();

}

function dragList(event){
	if(!(event.target.classList.contains("card--shadow"))){
		event.currentTarget.querySelector(".list__content").appendChild(shadowDiv);
	}
}

function handleDropList(event){

	let data = event.dataTransfer.getData("text");
	let element = document.querySelector(`div[data-time='${data}']`);

	event.currentTarget.querySelector(".list__content").appendChild(element);

	shadowDiv.parentNode.removeChild(shadowDiv);
	element.classList.remove("card--hidden");
}


function cardDragOver(event){
	event.stopPropagation();

	lastCard = event.currentTarget;
	
	let card = lastCard;

	let y = card.offsetTop;
	let offset = event.pageY - y;

	let height = card.clientHeight;
	let boundary = height/2;

	if(offset <= boundary){
		// Insert the card before
		card.parentNode.insertBefore(shadowDiv, card);
	} else{
		// Insert the card after
		card.parentNode.insertBefore(shadowDiv, card.nextSibling);
	}
}


function editCard(){
	event.stopPropagation();
	let card = event.currentTarget.parentElement.parentElement;

	card.setAttribute("draggable", "false");

	let currValue = card.querySelector("p").textContent;

	card.querySelector("p").classList.add("hidden");

	let editText = document.createElement("input");
	editText.value = currValue;

	card.insertBefore(editText, card.querySelector(".card__bttns"));

	card.querySelector(".card__edit").classList.add("hidden");
	card.querySelector(".card__delete").classList.add("hidden");
	card.querySelector(".card__confirm").classList.remove("hidden");
	card.querySelector(".card__cancel").classList.remove("hidden");
}

function confirmEdit(event){
	let card = event.currentTarget.parentElement.parentElement;
	let editText = card.querySelector("input");

	let newVal = editText.value;

	card.removeChild(editText);

	let cardName = card.querySelector("p");
	cardName.textContent = newVal;

	cardName.classList.remove("hidden");

	showCardNormalButtons(card);

	card.setAttribute("draggable", "true");

	saveContent();

}

function cancelEdit(event){
	let card = event.currentTarget.parentElement.parentElement;

	let editText = card.querySelector("input");

	card.removeChild(editText);

	let cardName = card.querySelector("p");
	cardName.classList.remove("hidden");

	showCardNormalButtons(card);

	card.setAttribute("draggable", "true");
}

function showCardNormalButtons(card){
	card.querySelector(".card__cancel").classList.add("hidden");
	card.querySelector(".card__confirm").classList.add("hidden");
	card.querySelector(".card__edit").classList.remove("hidden");
	card.querySelector(".card__delete").classList.remove("hidden");
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


	newList.addEventListener("dragover", dragList);
	newList.addEventListener("drop", handleDropList);

	newList.querySelector(".list__content").addEventListener("drop", contentDrop);

	newList.querySelector(".list__name").textContent = listName;

	const listAdd = document.querySelector(".list__add");
	board.insertBefore(newList, listAdd);

	cards.forEach(card => {
		createCard(card, newList);
	});

	saveContent();

	return newList;

}

function createCard(cardName, parentList){
	const newCard = cardCopy.cloneNode(true);
	newCard.querySelector(".card__name").textContent = cardName;

	newCard.addEventListener("dragover", cardDragOver);

	parentList.querySelector(".list__content").appendChild(newCard);

	saveContent();
}

function deleteCard(event){
	let card = event.currentTarget.parentNode.parentNode;
	card.parentNode.removeChild(card);

	saveContent();
}

function deleteList(event){
	const list = event.currentTarget.parentNode.parentNode.parentNode;

	list.parentNode.removeChild(list);

	saveContent();
}

function editList(event){
	const list = event.currentTarget.parentNode.parentNode.parentNode;
	const listNameNode = list.querySelector(".list__name");
	const currName = listNameNode.textContent;

	listNameNode.classList.add("hidden");

	const textEdit = document.createElement("input");
	textEdit.className = "list__input-name";
	textEdit.value = currName;

	list.querySelector(".list__header").insertBefore(textEdit, list.querySelector(".list__header").firstChild);

	list.querySelector(".list__delete").classList.add("hidden");
	list.querySelector(".list__edit").classList.add("hidden");

	list.querySelector(".list__confirm").classList.remove("hidden");
	list.querySelector(".list__cancel").classList.remove("hidden");
}

function cancelList(event){
	const list = event.currentTarget.parentNode.parentNode.parentNode;
	const listNameNode = list.querySelector(".list__name");
	
	listNameNode.classList.remove("hidden");

	const input = list.querySelector(".list__input-name");
	input.parentNode.removeChild(input);

	showListNormalButtons(list);
}

function confirmList(event){
	const list = event.currentTarget.parentNode.parentNode.parentNode;
	const listNameNode = list.querySelector(".list__name");

	const input = list.querySelector(".list__input-name");
	input.parentNode.removeChild(input);

	listNameNode.textContent = input.value;
	listNameNode.classList.remove("hidden");

	showListNormalButtons(list);

	saveContent();
}

function showListNormalButtons(list){
	list.querySelector(".list__delete").classList.remove("hidden");
	list.querySelector(".list__edit").classList.remove("hidden");

	list.querySelector(".list__confirm").classList.add("hidden");
	list.querySelector(".list__cancel").classList.add("hidden");
}