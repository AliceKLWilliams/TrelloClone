const board = document.querySelector(".board");

const originalCard = document.querySelector(".card--original");

const cardCopy = originalCard.cloneNode(true);
cardCopy.classList.remove("card--original");
originalCard.parentNode.removeChild(originalCard);

const listCopy = document.querySelector(".list__container").cloneNode(true);

window.onload = loadData;

let lastCard, shadowDiv, lastMovedCard;

document.addEventListener("dragend", () => {
	if(!lastMovedCard){
		return;
	}

	let element = document.querySelector(`div[data-time='${lastMovedCard}']`);

	shadowDiv.parentNode.removeChild(shadowDiv);
	element.classList.remove("card--hidden");

	lastMovedCard = null;
	
});


board.addEventListener("dragstart", (event) => {
	if(event.target.classList){
		if (event.target.classList.contains("card")) {

			let dragTime = (new Date()).getTime();
			event.target.dataset.time = dragTime;
			lastMovedCard = dragTime;

			event.dataTransfer.effectAllowed = "move";

			setTimeout(()=>{
				event.target.classList.add("card--hidden");
			},1);

			shadowDiv = document.createElement("div");
			shadowDiv.style.height = `${event.target.clientHeight}px`;
			shadowDiv.style.width = `${event.target.clientWidth}px`;

			shadowDiv.classList.add("card--shadow");
		}
	}
});

board.addEventListener("dragover", () => {
	event.preventDefault();
	event.dataTransfer.dropEffect = "move";
});


function addList(){
	let number = (new Date()).getTime();
	const numLists = document.querySelectorAll(".list").length;

	const newList = createList(`List ${numLists+1}`, [], number);

	newList.querySelector(".list__edit").click();
}


function addCard(e) {
	const list = e.target.closest(".list");

	if(list.querySelector(".card__input").value.length == 0){
		return;
	}

	let cardName = list.querySelector(".card__input").value;

	let radioButtons = Array.from(list.querySelector(".list__categories").querySelectorAll(".r-category"));

	let value = radioButtons.length && radioButtons.find(r => r.checked).value;

	createCard(cardName, value, list);

	list.querySelector(".card__input").value = "";
}

function contentDrop(event) {
	if(!lastMovedCard){
		return;
	}

	event.preventDefault();

	event.stopPropagation();

	let element = document.querySelector(`div[data-time='${lastMovedCard}']`);

	let numCards = event.currentTarget.querySelectorAll(".card").length;

	if(numCards == 0 || lastCard == null){
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
	
	lastMovedCard = null;

	saveData();

}

function dragOverList(event){
	if(!lastMovedCard){
		return;
	}

	if(!(event.target.classList.contains("card--shadow"))){
		event.currentTarget.querySelector(".list__content").appendChild(shadowDiv);
	}
}

function dropOnList(event){
	if(!lastMovedCard){
		return;
	}

	let element = document.querySelector(`div[data-time='${lastMovedCard}']`);

	event.currentTarget.querySelector(".list__content").appendChild(element);

	shadowDiv.parentNode.removeChild(shadowDiv);
	element.classList.remove("card--hidden");

	lastMovedCard = null;
}


function dragOverCard(event){
	if(!lastMovedCard){
		return;
	}

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
	let card = event.currentTarget.closest(".card");
	let cardNameElement = card.querySelector(".card__name");

	card.setAttribute("draggable", "false");

	let currValue = cardNameElement.textContent;

	cardNameElement.classList.add("hidden");

	let editText = document.createElement("input");
	editText.classList.add("card__input");
	editText.value = currValue;

	cardNameElement.parentNode.insertBefore(editText, cardNameElement.nextSibling);

	showEditButtons(card);
}

function confirmCardEdit(event){
	let card = event.currentTarget.closest(".card");
	let editText = card.querySelector(".card__input");

	let newVal = editText.value;

	editText.parentNode.removeChild(editText);

	let cardName = card.querySelector("p");
	cardName.textContent = newVal;

	cardName.classList.remove("hidden");

	showNormalButtons(card);

	card.setAttribute("draggable", "true");

	saveData();

}

function cancelCardEdit(event){
	let card = event.currentTarget.closest(".card");

	let editText = card.querySelector(".card__input");

	editText.parentNode.removeChild(editText);

	let cardName = card.querySelector("p");
	cardName.classList.remove("hidden");

	showNormalButtons(card);

	card.setAttribute("draggable", "true");
}

function saveData(){
	localStorage.clear();

	const lists = document.querySelectorAll(".list");

	let storageObj = [];

	lists.forEach(list => {
		const cards = list.querySelectorAll(".card");
		
		let listObj = {}; 
		let cardList = [];

		cards.forEach(card => {
			cardList.push({
				name: card.querySelector(".card__name").textContent,
				category: card.dataset.category
			});
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
		let originalList = document.querySelector(".list__container");
		originalList.parentNode.removeChild(originalList);

		let i = 1;
		listArr.forEach(listObj => {
			createList(listObj.name, listObj.cards, i);
			
			i++;
		});
	}

}

function renameCategories(list, number){
	const radios = Array.from(list.querySelectorAll('input[name*=category]'));
	radios.forEach(radio => {
		radio.setAttribute("name", radio.getAttribute("name") + `-${number}`);
	});

	radios.forEach(radio => {
		radio.setAttribute("id", radio.getAttribute("id") + `-${number}`);
	});

	const labels = [...list.querySelectorAll(".category")];
	labels.forEach(label => {
		label.setAttribute("for", label.getAttribute("for") + `-${number}`);
	});
}

function createList(listName, cards, number){
	const newList = listCopy.cloneNode(true);
	newList.querySelector(".card__add").addEventListener("click", addCard);

	newList.addEventListener("dragover", dragOverList);
	newList.addEventListener("drop", dropOnList);

	newList.querySelector(".list__content").addEventListener("drop", contentDrop);

	newList.querySelector(".list__name").textContent = listName;

	renameCategories(newList.querySelector(".list__footer"), number);

	const listAdd = document.querySelector(".list__add");
	board.insertBefore(newList, listAdd);

	let i = 0;
	cards.forEach(card => {
		createCard(card.name, card.category, newList, `${number}-${i}`);
		i++;
	});

	saveData();

	return newList;

}

function createCard(cardName, category, parentList, number = (new Date()).getTime()){
	const newCard = cardCopy.cloneNode(true);

	newCard.querySelector(".card__name").textContent = cardName;
	newCard.querySelector(".card__category").classList.add(`card__category--${category}`);

	newCard.dataset.category = category;

	let radios = newCard.querySelectorAll("input[name*=category]");
	[...radios].forEach(radio => {
		if(radio.value == category){
			radio.checked = true;
		}
	});

	newCard.addEventListener("dragover", dragOverCard);

	renameCategories(newCard, number);

	parentList.querySelector(".list__content").appendChild(newCard);

	saveData();
}

function deleteCard(event){
	let card = event.currentTarget.closest(".card");
	card.parentNode.removeChild(card);

	saveData();
}

function deleteList(event){
	const list = event.currentTarget.closest(".list__container");

	list.parentNode.removeChild(list);

	saveData();
}

function editList(event){
	const list = event.currentTarget.closest(".list");
	const listNameNode = list.querySelector(".list__name");
	const currName = listNameNode.textContent;

	listNameNode.classList.add("hidden");

	const textEdit = document.createElement("input");
	textEdit.className = "list__input-name";
	textEdit.value = currName;

	listNameNode.parentNode.insertBefore(textEdit, listNameNode.nextSibling);

	showEditButtons(list);
}

function cancelListEdit(event){
	const list = event.currentTarget.closest(".list");
	const listNameNode = list.querySelector(".list__name");
	
	listNameNode.classList.remove("hidden");

	const input = list.querySelector(".list__input-name");
	input.parentNode.removeChild(input);

	showNormalButtons(list);
}

function confirmListEdit(event){
	const list = event.currentTarget.closest(".list");
	const listNameNode = list.querySelector(".list__name");

	const input = list.querySelector(".list__input-name");
	input.parentNode.removeChild(input);

	listNameNode.textContent = input.value;
	listNameNode.classList.remove("hidden");

	showNormalButtons(list);

	saveData();
}

function showNormalButtons(element){
	element.querySelector(".bttns--normal").classList.remove("hidden");
	element.querySelector(".bttns--edit").classList.add("hidden");
}

function showEditButtons(element){
	element.querySelector(".bttns--normal").classList.add("hidden");
	element.querySelector(".bttns--edit").classList.remove("hidden");
}

function sortList(event){
	const list = event.currentTarget.closest(".list");
	const listContent = list.querySelector(".list__content");
	const cards = [...listContent.children];

	cards.sort(compareCards);

	while(listContent.firstChild){
		listContent.removeChild(listContent.firstChild);
	}

	cards.forEach(card => {
		listContent.appendChild(card);
	});

	saveData();
}

function compareCards(a, b){
	let priorities = {
		low:1,
		medium:2,
		high:3
	};

	if(priorities[a.dataset.category] > priorities[b.dataset.category]){
		return -1;
	}

	if(priorities[a.dataset.category] < priorities[b.dataset.category]){
		return 1;
	}

	return 0;
}

function selectPriority(event){
	let radioButton = event.currentTarget;
	let card = radioButton.closest(".card");

	let prevCategory = card.dataset.category;

	card.dataset.category = radioButton.value;

	let cardCategory = card.querySelector(".card__category");

	cardCategory.classList.remove(`card__category--${prevCategory}`);
	cardCategory.classList.add(`card__category--${radioButton.value}`);

	saveData();
}

function moveListLeft(event){
	let list = event.target.closest(".list__container");
	let prevList = list.previousSibling;

	if(prevList && prevList.classList && prevList.classList.contains("list__container")){
		list.parentNode.insertBefore(list, prevList);
	}
}

function moveListRight(event){
	let list = event.target.closest(".list__container");
	let nextList = list.nextSibling;

	if(nextList.classList.contains("list__container")){
		nextList.parentNode.insertBefore(nextList, list);
	}
}