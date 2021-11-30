(function () {

    let currentSource = "";
    /**
     * @type {HTMLCanvasElement}
     */
    let previewCanvas = document.querySelector(".previewer");
    /**
     * @type {CanvasRenderingContext2D}
     */
    let previewCanvasContext2d = previewCanvas.getContext("2d");

    let outputText = document.querySelector(".output-text");

    let inputPhotoFileField = document.querySelector(".input-photo-file-field");

    let widthInput = document.querySelector(".width-input");
    let heightInput = document.querySelector(".height-input");

    let normalizedCanvas = document.querySelector(".normalized-canvas");
    normalizedCanvas.width = widthInput.value;
    normalizedCanvas.height = heightInput.value;
    let normalizedCanvasContext2d = normalizedCanvas.getContext("2d");

    function charInputChangeHandler(e) {
        currentSource = e.target.value;

        refreshNormalizedResult();
    }

    function photoSelectedHandler(e) {
        var reader = new FileReader();
        reader.onload = () => {
            var img = new Image();
            img.onload = () => {
                currentSource = img;
                refreshNormalizedResult();
            };
            img.src = reader.result;
        };
        reader.readAsDataURL(e.target.files[0]);
    }

    function addListeners() {
        document.querySelector(".char-input").oninput = charInputChangeHandler;
        inputPhotoFileField.onchange = photoSelectedHandler;
        document.querySelector(".btn-select-a-photo").onclick = () => inputPhotoFileField.click();
    }

    function clearPreviewCanvas() {
        previewCanvasContext2d.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
    }

    function normalizePreviewCanvas() {
        normalizedCanvasContext2d.clearRect(0, 0, normalizedCanvas.width, normalizedCanvas.height);
        normalizedCanvasContext2d.fillStyle = "white";
        normalizedCanvasContext2d.fillRect(0, 0, normalizedCanvas.width, normalizedCanvas.height);
        normalizedCanvasContext2d.drawImage(previewCanvas, 0, 0, normalizedCanvas.width, normalizedCanvas.height);

        var imgData = normalizedCanvasContext2d.getImageData(0, 0, normalizedCanvas.width, normalizedCanvas.height);
        var resultArray = [];
        var pixelCount = -1;
        var currentString = "";
        for (let i = 0; i < imgData.data.length; i += 4) {
            let value0to1 = (imgData.data[i] + imgData.data[i + 1] + imgData.data[i + 2]) / 3 / 256;
            let value = 1 - Math.round(value0to1);
            pixelCount++;
            if (pixelCount % 8 === 0) {
                if (currentString) {
                    resultArray.push(currentString);
                }
                currentString = "0b";
            }
            currentString += value;
        }
        resultArray.push(currentString);

        outputText.value = resultArray.join(",");
    }

    function refreshNormalizedResult() {
        if (typeof currentSource == "string") {
            if (currentSource.length) {
                let firstChar = currentSource[0];
                clearPreviewCanvas();

                previewCanvasContext2d.fillStyle = "black";
                previewCanvasContext2d.font = `${previewCanvas.height}px sans-serif`;
                var measured = previewCanvasContext2d.measureText(firstChar);
                previewCanvasContext2d.fillText(firstChar, (previewCanvas.width - measured.width) / 2, previewCanvas.height * 0.85);
            } else {
                console.warn("Current source string is empty");
                return;
            }
        } else if (currentSource instanceof Image) {
            clearPreviewCanvas();

            previewCanvasContext2d.drawImage(currentSource, 0, 0, previewCanvas.width, previewCanvas.height);
        } else {
            console.warn("Unsupported source type");
            return;
        }

        normalizePreviewCanvas();
    }


    function main() {
        addListeners();
    }

    main();
})();