const board = document.querySelector(".board");
const listCopy = document.querySelector(".list").cloneNode(true);

document.querySelector(".card__add").addEventListener("click", addCard);


window.onload = loadData;

const listAdd = document.querySelector(".list__add");

let lastCard, shadowDiv;


listAdd.addEventListener("click", () => {
	const numLists = document.querySelectorAll(".list").length;

	createList(`List ${numLists+1}`, []);
});


board.addEventListener("dragstart", (event) => {
	if (event.target.classList.contains("card")) {

		let dragTime = (new Date()).getTime();
		event.target.dataset.time = dragTime;

		event.dataTransfer.setData("text", dragTime);
		event.dataTransfer.effectAllowed = "move";

		setTimeout(()=>{
			event.target.style.display = "none";
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

	element.style.display = "flex";
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
	element.style.display = "flex";
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

	card.querySelector("p").style.display = "none";

	let editText = document.createElement("input");
	editText.value = currValue;

	card.insertBefore(editText, card.querySelector(".card__bttns"));

	event.currentTarget.style.display = "none";

	card.querySelector(".card__delete").style.display = "none";
	card.querySelector(".card__confirm").style.display = "inline-block";
	card.querySelector(".card__cancel").style.display = "inline-block";
}

function confirmEdit(event){
	let card = event.currentTarget.parentElement.parentElement;
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
	let card = event.currentTarget.parentElement.parentElement;

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

	newList.addEventListener("dragover", dragList);
	newList.addEventListener("drop", handleDropList);
	newList.querySelector(".list__content").addEventListener("drop", contentDrop);

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

	const cardBtts = document.createElement("div");
	cardBtts.classList.add("card__bttns");

	newCard.appendChild(cardTitle);
	cardBtts.appendChild(editBttn);
	cardBtts.appendChild(deleteBttn);
	cardBtts.appendChild(confirmBttn);
	cardBtts.appendChild(cancelBttn);

	newCard.appendChild(cardBtts);

	newCard.addEventListener("dragover", cardDragOver);
	newCard.addEventListener("drop", cardDrop);

	parentList.querySelector(".list__content").appendChild(newCard);

	saveContent();
}

function cardDrop(){
	console.log("drop");
}

function deleteCard(event){
	let card = event.currentTarget.parentNode.parentNode;
	card.parentNode.removeChild(card);

	saveContent();
}

function deleteList(event){
	const list = event.currentTarget.parentNode.parentNode;

	list.parentNode.removeChild(list);

	saveContent();
}

function editList(event){
	const list = event.currentTarget.parentNode.parentNode.parentNode;
	const listNameNode = list.querySelector(".list__name");
	const currName = listNameNode.textContent;

	listNameNode.style.display = "none";

	const textEdit = document.createElement("input");
	textEdit.className = "list__input-name";
	textEdit.value = currName;

	list.querySelector(".list__header").insertBefore(textEdit, list.querySelector(".list__header").firstChild);

	list.querySelector(".list__delete").style.display = "none";
	list.querySelector(".list__edit").style.display = "none";

	list.querySelector(".list__confirm").style.display = "inline-block";
	list.querySelector(".list__cancel").style.display = "inline-block";
}

function cancelList(event){
	const list = event.currentTarget.parentNode.parentNode.parentNode;
	const listNameNode = list.querySelector(".list__name");
	
	listNameNode.style.display = "block";

	const input = list.querySelector(".list__input-name");
	input.parentNode.removeChild(input);

	list.querySelector(".list__delete").style.display = "inline-block";
	list.querySelector(".list__edit").style.display = "inline-block";

	list.querySelector(".list__confirm").style.display = "none";
	list.querySelector(".list__cancel").style.display = "none";
}

function confirmList(event){
	const list = event.currentTarget.parentNode.parentNode.parentNode;
	const listNameNode = list.querySelector(".list__name");

	const input = list.querySelector(".list__input-name");
	input.parentNode.removeChild(input);

	listNameNode.textContent = input.value;
	listNameNode.style.display = "block";
	
	list.querySelector(".list__delete").style.display = "inline-block";
	list.querySelector(".list__edit").style.display = "inline-block";

	list.querySelector(".list__confirm").style.display = "none";
	list.querySelector(".list__cancel").style.display = "none";

	saveContent();
}