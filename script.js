const board = document.querySelector(".board");
const listCopy = document.querySelector(".list").cloneNode(true);

const listAddBttns = document.querySelectorAll(".list__add");

document.querySelector(".card__add").addEventListener("click", addCard);
document.querySelector(".list").addEventListener("drop", handleDrop);

let srcCard = null;

listAddBttns.forEach(bttn => {
	bttn.addEventListener("click", () => {

		const newList = listCopy.cloneNode(true);
		newList.querySelector(".card__add").addEventListener("click", addCard);
		newList.addEventListener("drop", handleDrop);

		board.insertBefore(newList, bttn);
	});
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

	const footer = list.querySelector(".list__footer");

	const newCard = document.createElement("div");
	newCard.className = "card";
	newCard.setAttribute("draggable", "true");

	const children = list.children;
	const cards = [...children].filter(card => {
		return card.classList.contains("card");
	});
	
	newCard.dataset.order = cards.length + 1;

	const cardTitle = document.createElement("p");
	cardTitle.textContent = list.querySelector(".new__text").value;
	cardTitle.setAttribute("contenteditable", "true");

	newCard.appendChild(cardTitle);

	newCard.addEventListener("dragenter", dragEnter);
	newCard.addEventListener("dragleave", dragLeave);

	list.querySelector(".list__content").appendChild(newCard);

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