const newList = document.createElement("div");
newList.className = "list";

const listHeader = document.createElement("div");
listHeader.className = "list__header";

const listName = document.createElement("h1");
listName.className = "list__name"
listName.setAttribute("contenteditable", "true");
listName.textContent = "Enter List Name";

const listContent = document.createElement("div");
listContent.className = "list__content";

const listBttn = document.createElement("button");
listBttn.innerText = "+ Add new Card";
listBttn.className = "card__add";

listHeader.appendChild(listName);
listContent.appendChild(listBttn);

newList.appendChild(listHeader);
newList.appendChild(listContent);


const board = document.querySelector(".board");

const listAddBttns = document.querySelectorAll(".list__add");

listAddBttns.forEach(bttn => {
	bttn.addEventListener("click", () => {
		board.insertBefore(newList.cloneNode(true), bttn);
	});
});

board.addEventListener("click", (event) => {
	if(event.target.classList.contains("card__add")){
		addCard(event);
	}
})

function addCard(e) {
	const bttn = e.target;

	const list = bttn.parentElement;

	const newCard = document.createElement("div");
	newCard.className = "card";
	newCard.setAttribute("draggable", "true");

	const cardTitle = document.createElement("h1");
	cardTitle.textContent = "Enter Card Title"
	cardTitle.setAttribute("contenteditable", "true");

	newCard.appendChild(cardTitle);

	list.insertBefore(newCard, bttn);
}