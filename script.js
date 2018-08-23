const board = document.querySelector(".board");

let lastCardHovered, shadowDiv, lastMovedCard, cardCopy, listCopy;

window.onload = loadData;
copyElements();

function copyElements(){
	// Copy the card element
	const originalCard = document.querySelector(".card--original");
	cardCopy = originalCard.cloneNode(true);
	cardCopy.classList.remove("card--original");
	originalCard.parentNode.removeChild(originalCard);

	// Copy the list element
	listCopy = document.querySelector(".list__container").cloneNode(true);
}

//
// DRAG END HANDLER
//

// Event handler if the drag is cancelled
document.addEventListener("dragend", () => {
	if(!lastMovedCard){
		return;
	}

	let element = document.querySelector(`div[data-time='${lastMovedCard}']`);

	shadowDiv.parentNode.removeChild(shadowDiv);
	element.classList.remove("card--hidden");

	lastMovedCard = null;
});

//
// DRAG START HANDLER
//
board.addEventListener("dragstart", (event) => {
	if(event.target.classList){
		if (event.target.classList.contains("card")) {

			let dragTime = (new Date()).getTime();
			event.target.dataset.time = dragTime;
			lastMovedCard = dragTime;

			event.dataTransfer.effectAllowed = "move";

			// Hide original card
			setTimeout(()=>{
				event.target.classList.add("card--hidden");
			},1);

			// Create shadow div to show position
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


//
//	DROP HANDLERS
//


// Drop handler on '.list' element
function handleDropOnList(event){
	if(!lastMovedCard){
		return;
	}

	let element = document.querySelector(`div[data-time='${lastMovedCard}']`);
	event.currentTarget.querySelector(".list__content").appendChild(element);

	shadowDiv.parentNode.removeChild(shadowDiv);
	element.classList.remove("card--hidden");

	lastMovedCard = null;
}

// Drop event on the '.list__content' element
function handleDropOnContent(event) {
	if(!lastMovedCard){
		return;
	}

	event.preventDefault();
	event.stopPropagation();

	let element = document.querySelector(`div[data-time='${lastMovedCard}']`);
	let numCards = event.currentTarget.querySelectorAll(".card").length;

	if(numCards == 0 || lastCardHovered == null){
		event.currentTarget.appendChild(element);
	} else {

		// Determine cursor position
		let y = lastCardHovered.getBoundingClientRect().top;
		let offset = event.pageY - y;

		let height = lastCardHovered.clientHeight;
		let boundary = height/2;

		if(offset <= boundary){
			// Insert the card before
			lastCardHovered.parentNode.insertBefore(element, lastCardHovered);
		} else{
			// Insert the card after
			lastCardHovered.parentNode.insertBefore(element, lastCardHovered.nextSibling);
		}
	}

	element.classList.remove("card--hidden");
	shadowDiv.parentNode.removeChild(shadowDiv);
	
	lastMovedCard = null;

	saveData();
}

//
//	DRAG OVER HANDLERS
//

// Drag over handler on the '.list' element
function handleDragOverList(event){
	if(!lastMovedCard){
		return;
	}

	if(!(event.target.classList.contains("card--shadow"))){
		event.currentTarget.querySelector(".list__content").appendChild(shadowDiv);
	}
}

function handleDragOverCard(event){
	if(!lastMovedCard){
		return;
	}

	event.preventDefault();
	event.stopPropagation();

	// Keep track of the last card hovered over
	lastCardHovered = event.currentTarget;

	// Determine cursor position
	let y = lastCardHovered.getBoundingClientRect().top;
	let offset = event.pageY - y;

	let height = lastCardHovered.clientHeight;
	let boundary = height/2;


	if(offset <= boundary){
		// Insert the shadowDiv before
		lastCardHovered.parentNode.insertBefore(shadowDiv, lastCardHovered);
	} else{
		// Insert the shadowDiv after
		lastCardHovered.parentNode.insertBefore(shadowDiv, lastCardHovered.nextSibling);
	}
}

//
//	EDIT CARD HANDLERS
//


function editCard(){
	event.stopPropagation();

	const card = event.currentTarget.closest(".card");
	const cardNameElement = card.querySelector(".card__name");

	// Cannot drag card while editing
	card.setAttribute("draggable", "false");

	cardNameElement.classList.add("hidden");

	// Add input element
	const editText = document.createElement("input");
	const currValue = cardNameElement.textContent;
	editText.classList.add("card__input");
	editText.value = currValue;
	cardNameElement.parentNode.insertBefore(editText, cardNameElement.nextSibling);

	showEditButtons(card);
}

function confirmCardEdit(event){
	const card = event.currentTarget.closest(".card");
	const editTextElement = card.querySelector(".card__input");

	const newVal = editTextElement.value;

	editTextElement.parentNode.removeChild(editTextElement);

	// Rename card
	const cardName = card.querySelector("p");
	cardName.textContent = newVal;

	cardName.classList.remove("hidden");

	showNormalButtons(card);

	card.setAttribute("draggable", "true");

	saveData();
}

function cancelCardEdit(event){
	const card = event.currentTarget.closest(".card");
	const editText = card.querySelector(".card__input");

	editText.parentNode.removeChild(editText);

	const cardName = card.querySelector("p");
	cardName.classList.remove("hidden");

	showNormalButtons(card);

	card.setAttribute("draggable", "true");
}

//
//	EDIT LIST HANDLERS
//

function editList(event){
	const list = event.currentTarget.closest(".list");
	const listNameElement = list.querySelector(".list__name");
	const currName = listNameElement.textContent;

	listNameElement.classList.add("hidden");

	// Rename list
	const textEdit = document.createElement("input");
	textEdit.className = "list__input-name";
	textEdit.value = currName;
	listNameElement.parentNode.insertBefore(textEdit, listNameElement.nextSibling);

	showEditButtons(list);
}

function cancelListEdit(event){
	const list = event.currentTarget.closest(".list");
	const listNameElement = list.querySelector(".list__name");
	
	listNameElement.classList.remove("hidden");

	const input = list.querySelector(".list__input-name");
	input.parentNode.removeChild(input);

	showNormalButtons(list);
}

function confirmListEdit(event){
	const list = event.currentTarget.closest(".list");
	const listNameElement = list.querySelector(".list__name");

	const input = list.querySelector(".list__input-name");
	input.parentNode.removeChild(input);

	listNameElement.textContent = input.value;
	listNameElement.classList.remove("hidden");

	showNormalButtons(list);

	saveData();
}

//
// STORAGE FUNCTIONS
//


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
	const listArr = JSON.parse(localStorage.getItem("board"));
	
	if(listArr){
		// Remove original list used for copying
		const originalList = document.querySelector(".list__container");
		originalList.parentNode.removeChild(originalList);

		// Create lists
		let i = 1;
		listArr.forEach(listObj => {
			createList(listObj.name, listObj.cards, i);
			
			i++;
		});
	}

}



//
//	SORTING HANDLERS
//


function sortList(event){
	const list = event.currentTarget.closest(".list");
	const listContent = list.querySelector(".list__content");
	const cards = [...listContent.children];

	cards.sort(compareCards);

	// Remove all cards
	while(listContent.firstChild){
		listContent.removeChild(listContent.firstChild);
	}

	// Add cards in sorted order
	cards.forEach(card => {
		listContent.appendChild(card);
	});

	saveData();
}

// Sorting function for priority sort
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

//
// LIST MOVEMENT
//

function moveListLeft(event){
	const list = event.target.closest(".list__container");
	const prevList = list.previousSibling;

	if(prevList && prevList.classList && prevList.classList.contains("list__container")){
		list.parentNode.insertBefore(list, prevList);
	}
}

function moveListRight(event){
	const list = event.target.closest(".list__container");
	const nextList = list.nextSibling;

	if(nextList.classList.contains("list__container")){
		nextList.parentNode.insertBefore(nextList, list);
	}
}

//
// LIST CREATION / DELETION
//

function addList(){
	const identifier = (new Date()).getTime();
	const numLists = document.querySelectorAll(".list").length;

	const newList = createList(`List ${numLists+1}`, [], identifier);

	// Immediately prompt to rename list
	newList.querySelector(".list__edit").click();
}


function createList(listName, cards, number){
	const newList = listCopy.cloneNode(true);
	newList.querySelector(".card__add").addEventListener("click", addCard);

	// Add event listeners
	newList.addEventListener("dragover", handleDragOverList);
	newList.addEventListener("drop", handleDropOnList);
	newList.querySelector(".list__content").addEventListener("drop", handleDropOnContent);

	newList.querySelector(".list__name").textContent = listName;

	renameCategories(newList.querySelector(".list__footer"), number);

	// Add list to end of board
	const listAdd = document.querySelector(".list__add");
	board.insertBefore(newList, listAdd);

	// Create the list's cards
	let i = 0;
	cards.forEach(card => {
		createCard(card.name, card.category, newList, `${number}-${i}`);
		i++;
	});

	saveData();

	return newList;
}


function deleteList(event){
	const list = event.currentTarget.closest(".list__container");
	list.parentNode.removeChild(list);

	saveData();
}

//
// CARD CREATION / DELETION
//

function addCard(e) {
	const list = e.target.closest(".list");

	// Only continue if we have a card name
	if(list.querySelector(".card__input").value.length == 0){
		return;
	}

	let cardName = list.querySelector(".card__input").value;

	// Find the card priority
	let radioButtons = Array.from(list.querySelector(".list__categories").querySelectorAll(".r-category"));
	let value = radioButtons.length && radioButtons.find(r => r.checked).value;

	createCard(cardName, value, list);

	// Reset input element text
	list.querySelector(".card__input").value = "";
}


function createCard(cardName, category, parentList, number = (new Date()).getTime()){
	const newCard = cardCopy.cloneNode(true);

	newCard.querySelector(".card__name").textContent = cardName;
	newCard.querySelector(".card__category").classList.add(`card__category--${category}`);

	newCard.dataset.category = category;

	// Check appropriate priority radio button
	const radios = newCard.querySelectorAll("input[name*=category]");
	[...radios].forEach(radio => {
		if(radio.value == category){
			radio.checked = true;
		}
	});
	renameCategories(newCard, number);

	newCard.addEventListener("dragover", handleDragOverCard);

	parentList.querySelector(".list__content").appendChild(newCard);

	saveData();
}

function deleteCard(event){
	const card = event.currentTarget.closest(".card");
	card.parentNode.removeChild(card);

	saveData();
}

//
// PRIORITY FUNCTIONS
//

// Function to rename radio buttons attrs as they need to be unique
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

function selectPriority(event){
	const radioButton = event.currentTarget;
	const card = radioButton.closest(".card");

	const prevCategory = card.dataset.category;

	// Set new category on card
	card.dataset.category = radioButton.value;

	const cardCategory = card.querySelector(".card__category");

	cardCategory.classList.remove(`card__category--${prevCategory}`);
	cardCategory.classList.add(`card__category--${radioButton.value}`);

	saveData();
}


//
// OTHER FUNCTIONS
//

function showNormalButtons(element){
	element.querySelector(".bttns--normal").classList.remove("hidden");
	element.querySelector(".bttns--edit").classList.add("hidden");
}

function showEditButtons(element){
	element.querySelector(".bttns--normal").classList.add("hidden");
	element.querySelector(".bttns--edit").classList.remove("hidden");
}