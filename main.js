const svg = document.querySelector("svg");
const filter = document.getElementById("duoFilter");
const output = document.getElementById("filterOutput");
const handle = document.getElementById("handle");

function toggleFilterMode() {
	const btn = document.getElementById("modeBtn");
	const mode = btn.innerText;
	if (mode === "discrete")
		btn.innerText = "table";
	else
		btn.innerText = "discrete"
	filter.querySelector("feFuncR").setAttributeNS(null, "type", mode);
	filter.querySelector("feFuncG").setAttributeNS(null, "type", mode);
	filter.querySelector("feFuncB").setAttributeNS(null, "type", mode);
	
	updateFilterOutput();
}
function toggleFilterInterpolation() {
	const btn = document.getElementById("interpolationBtn");
	const mode = btn.innerText;
	if (mode === "linearRGB")
		btn.innerText = "sRGB"
	else if (mode === "sRGB")
		btn.innerText = "linearRGB"
	filter.setAttributeNS(null, "color-interpolation-filters", mode);
	updateFilterOutput();
}
function normalizedColor(rgbString) {
	const MAX = 255;
	return {
		r: (Number("0x" + rgbString.substr(1, 2))/MAX).toPrecision(6),
		g: (Number("0x" + rgbString.substr(3, 2))/MAX).toPrecision(6),
		b: (Number("0x" + rgbString.substr(5, 2))/MAX).toPrecision(6)
	}
}
function updateFilterColor() {
	const pickers = document.querySelectorAll("input[type=\"color\"]");
	const reds = [];
	const greens = [];
	const blues = [];
	for (const picker of Array.from(pickers)) {
		const color = normalizedColor(picker.value);
		reds.push(color.r);
		greens.push(color.g);
		blues.push(color.b);
	}
	filter.querySelector("feFuncR").setAttributeNS(null,
												   "tableValues",
												   reds.join(" "));
	filter.querySelector("feFuncG").setAttributeNS(null,
												   "tableValues",
												   greens.join(" "));
	filter.querySelector("feFuncB").setAttributeNS(null,
												   "tableValues",
												   blues.join(" "));
	updateFilterOutput();
}

function updateFilterOutput() {
	output.innerText = filter.outerHTML;
}

function updateHandle(event) {
	event.preventDefault();
	const handleWidth = handle.getAttributeNS(null, "width");
	const x = event.touches ?
		  event.touches[0].clientX : event.clientX;
	const y = event.touches ?
		  event.touches[0].clientY : event.clientY;
	const position = new DOMPoint(x, y, 0)
		  .matrixTransform(svg.getScreenCTM().inverse());
	position.x = Math.max(0, Math.min(position.x, 10));
	handle.setAttributeNS(null, "x", position.x - handleWidth/2);
}
function updateClipPath() {
	const path = document.getElementById("beforeAfterClipPath");
	const bBox = handle.getBBox();
	path.querySelector("rect").setAttributeNS(null, "x", (bBox.x + bBox.width/2));
}
function moveHandler(event) {
	updateHandle(event);
	updateClipPath();
}
function connectPickersToFilter() {
	const pickers = document.querySelectorAll("input[type=\"color\"]");
	for (const picker of Array.from(pickers))
		picker.addEventListener("input", updateFilterColor);
}

const userURL = document.getElementById("userURL");
function updateImages() {
	if (userURL.value === "")
		userURL.value = "https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Karnaval_Hasselt.jpg/1024px-Karnaval_Hasselt.jpg"
	const images = document.querySelectorAll("image");
	for (const image of Array.from(images))
		image.setAttributeNS(null, "href", userURL.value);
}
userURL.addEventListener("keydown", (event) => {
	if (event.key === "Enter")
		updateImages();
});

function removeColor() {
	const colors = document.getElementById("filterColors");
	if (colors.childElementCount === 2)
		return;
	colors.lastElementChild.removeEventListener("input", updateFilterColor)
	colors.lastElementChild.remove();
	updateFilterColor();
}
function addColor() {
	const newColor = document.createElement("input");
	newColor.setAttributeNS(null, "type", "color");
	const colors = document.getElementById("filterColors");
	colors.append(newColor);
	newColor.addEventListener("input", updateFilterColor);
	updateFilterColor();
}

document.getElementById("removeBtn").addEventListener("click", removeColor);
document.getElementById("addBtn").addEventListener("click", addColor);
document.getElementById("modeBtn").addEventListener("click", toggleFilterMode);
document.getElementById("interpolationBtn").addEventListener("click", toggleFilterInterpolation);
document.getElementById("copyBtn").addEventListener("click", () => {
	navigator.clipboard.writeText(output.innerText)
		.then(() => {})
		.catch(() => {console.error("Failed writing to clipboard")});
});

svg.addEventListener("mousedown", (event) => {
	updateHandle(event);
	updateClipPath();
	document.addEventListener("mousemove", moveHandler);
});
document.addEventListener("mouseup", (event) => {
	// updateHandle(event);
	// updateClipPath();
	document.removeEventListener("mousemove", moveHandler);
});

svg.addEventListener("touchstart", (event) => {
	updateHandle(event);
	updateClipPath();
	document.addEventListener("touchmove", moveHandler);
});
document.addEventListener("touchend", (event) => {
	// updateHandle(event);
	// updateClipPath();
	document.removeEventListener("touchmove", moveHandler);
});

updateFilterColor();
updateFilterOutput();
updateClipPath();
updateImages();
connectPickersToFilter();
