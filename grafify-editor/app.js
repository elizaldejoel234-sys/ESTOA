// Grafify Editor - Main Application
class GrafifyEditor {
    constructor() {
        this.canvas = document.getElementById('imageCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.overlay = document.getElementById('canvasOverlay');
        this.image = null;
        this.zoom = 1;
        this.offsetX = 0;
        this.offsetY = 0;
        this.currentTool = 'select';
        this.brushColor = '#ff0000';
        this.brushSize = 5;
        this.textItems = [];
        this.currentFont = 'Faculty Glyphic';
        this.textColor = '#000000';
        this.textSize = 24;
        this.frameStyle = 'none';
        this.frameColor = '#000000';
        this.frameWidth = 10;
        this.bgType = 'color';
        this.bgColor = '#ffffff';
        this.brightness = 1;
        this.contrast = 1;
        this.saturation = 1;
        this.currentFilter = 'none';
        this.filterIntensity = 1;
        this.isDrawing = false;
        this.lastPoint = null;
        this.isDragging = false;
        this.dragStart = { x: 0, y: 0 };
        this.selectedTextIndex = -1;
        this.init();
    }
    init() {
        this.setupCanvas();
        this.setupEvents();
        this.loadDefaultImage();
        this.updateUI();
    }
    setupCanvas() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    resizeCanvas() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth - 40;
        this.canvas.height = container.clientHeight - 40;
        this.render();
    }
    setupEvents() {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchSection(e.target.dataset.section));
        });
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.setTool(e.target.dataset.tool));
        });
        document.querySelectorAll('.filter-item').forEach(item => {
            item.addEventListener('click', (e) => this.setFilter(e.target.closest('.filter-item').dataset.filter));
        });
        document.querySelectorAll('.font-item').forEach(item => {
            item.addEventListener('click', (e) => this.setFont(e.target.closest('.font-item').dataset.font));
        });
        document.querySelectorAll('.frame-item').forEach(item => {
            item.addEventListener('click', (e) => this.setFrame(e.target.closest('.frame-item')));
        });
        document.querySelectorAll('.bg-type-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.setBGType(e.target.dataset.bgType));
        });
        document.querySelectorAll('.preset-bg-item').forEach(item => {
            item.addEventListener('click', (e) => this.setPresetBG(e.target.closest('.preset-bg-item').dataset.presetBg));
        });
        document.getElementById('brushColor').addEventListener('input', (e) => {
            this.brushColor = e.target.value;
            document.getElementById('brushColorSwatch').style.background = this.brushColor;
        });
        document.getElementById('textColor').addEventListener('input', (e) => {
            this.textColor = e.target.value;
            document.getElementById('textColorSwatch').style.background = this.textColor;
        });
        document.getElementById('frameColor').addEventListener('input', (e) => {
            this.frameColor = e.target.value;
            document.getElementById('frameColorSwatch').style.background = this.frameColor;
        });
        document.getElementById('bgColor').addEventListener('input', (e) => {
            this.bgColor = e.target.value; this.render();
        });
        document.getElementById('addTextBtn').addEventListener('click', () => this.addText());
        document.getElementById('zoomIn').addEventListener('click', () => this.setZoom(this.zoom + 0.1));
        document.getElementById('zoomOut').addEventListener('click', () => this.setZoom(this.zoom - 0.1));
        document.getElementById('resetZoom').addEventListener('click', () => this.setZoom(1));
        document.getElementById('saveBtn').addEventListener('click', () => this.saveImage());
        document.getElementById('exportBtn').addEventListener('click', () => this.exportImage());
        document.getElementById('undoBtn').addEventListener('click', () => this.undo());
        document.getElementById('redoBtn').addEventListener('click', () => this.redo());
        document.getElementById('imageUpload').addEventListener('change', (e) => this.loadImage(e));
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('mouseleave', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('wheel', (e) => this.handleWheel(e));
        this.canvas.addEventListener('dragover', (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; });
        this.canvas.addEventListener('drop', (e) => this.handleDrop(e));
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        this.setupSliders();
    }
    setupSliders() {
        const sliders = [
            { id: 'brightnessSlider', valueId: 'brightnessValue', prop: 'brightness', callback: () => this.render() },
            { id: 'contrastSlider', valueId: 'contrastValue', prop: 'contrast', callback: () => this.render() },
            { id: 'saturationSlider', valueId: 'saturationValue', prop: 'saturation', callback: () => this.render() },
            { id: 'brushSize', valueId: 'brushSizeValue', prop: 'brushSize', unit: 'px' },
            { id: 'textSize', valueId: 'textSizeValue', prop: 'textSize', unit: 'px' },
            { id: 'frameWidth', valueId: 'frameWidthValue', prop: 'frameWidth', unit: 'px', callback: () => this.render() },
            { id: 'filterIntensity', valueId: 'filterIntensityValue', prop: 'filterIntensity', callback: () => this.render() }
        ];
        sliders.forEach(s => {
            const slider = document.getElementById(s.id);
            const valueEl = document.getElementById(s.valueId);
            slider.addEventListener('input', (e) => {
                this[s.prop] = parseInt(e.target.value) / (s.id.includes('Intensity') ? 100 : 1);
                valueEl.textContent = e.target.value + (s.unit || '%');
                if (s.callback) s.callback();
            });
            valueEl.textContent = slider.value + (s.unit || '%');
        });
    }
    switchSection(section) {
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.section === section));
        document.querySelectorAll('.tool-section').forEach(s => s.classList.toggle('active', s.id === section + 'Section'));
        this.setTool('select');
    }
    setTool(tool) {
        this.currentTool = tool;
        document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.tool === tool));
    }
    setFilter(filter) {
        this.currentFilter = filter;
        document.querySelectorAll('.filter-item').forEach(item => item.classList.toggle('active', item.dataset.filter === filter));
        this.render();
    }
    setFont(font) {
        this.currentFont = font;
        document.querySelectorAll('.font-item').forEach(item => item.classList.toggle('active', item.dataset.font === font));
    }
    setFrame(frameItem) {
        this.frameStyle = frameItem.dataset.frame;
        this.frameColor = frameItem.dataset.frameColor || '#000000';
        this.frameWidth = parseInt(frameItem.dataset.frameWidth) || 10;
        document.querySelectorAll('.frame-item').forEach(item => item.classList.toggle('active', item === frameItem));
        this.render();
    }
    setBGType(type) {
        this.bgType = type;
        document.querySelectorAll('.bg-type-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.bgType === type));
        document.querySelectorAll('.bg-options').forEach(opt => opt.style.display = 'none');
        if (type === 'color') document.getElementById('colorBgOptions').style.display = 'block';
        else if (type === 'gradient') document.getElementById('gradientBgOptions').style.display = 'block';
        else if (type === 'image') document.getElementById('imageBgOptions').style.display = 'block';
        this.render();
    }
    setPresetBG(bg) {
        if (bg.startsWith('linear-gradient')) {
            this.bgType = 'gradient';
            document.querySelectorAll('.bg-type-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.bgType === 'gradient'));
            document.getElementById('gradientBgOptions').style.display = 'block';
            this.gradientColor1 = bg.match(/#\w+/g)[0] || '#ff0000';
            this.gradientColor2 = bg.match(/#\w+/g)[1] || '#0000ff';
        } else {
            this.bgType = 'color';
            document.querySelectorAll('.bg-type-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.bgType === 'color'));
            document.getElementById('colorBgOptions').style.display = 'block';
            this.bgColor = bg;
            document.getElementById('bgColor').value = bg;
        }
        this.render();
    }
    setZoom(zoom) {
        this.zoom = Math.max(0.1, Math.min(3, zoom));
        document.getElementById('zoomValue').textContent = Math.round(this.zoom * 100) + '%';
        this.render();
    }
    loadDefaultImage() {
        this.image = document.createElement('canvas');
        this.image.width = 800;
        this.image.height = 600;
        const ctx = this.image.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, this.image.width, this.image.height);
        this.render();
    }
    loadImage(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                this.image = img;
                this.render();
                this.showToast('Imagen cargada', 'success');
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
    handleMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left - this.offsetX) / this.zoom;
        const y = (e.clientY - rect.top - this.offsetY) / this.zoom;
        this.isDragging = false;
        switch (this.currentTool) {
            case 'select':
                this.isDragging = true;
                this.dragStart = { x: e.clientX, y: e.clientY };
                break;
            case 'brush':
                this.isDrawing = true;
                this.lastPoint = { x, y };
                this.drawPoint(x, y);
                break;
            case 'eraser':
                this.isDrawing = true;
                this.lastPoint = { x, y };
                this.erasePoint(x, y);
                break;
        }
        for (let i = this.textItems.length - 1; i >= 0; i--) {
            const text = this.textItems[i];
            if (this.isPointInText(x, y, text)) {
                this.selectedTextIndex = i;
                this.openTextEditModal(i);
                this.render();
                return;
            }
        }
        this.selectedTextIndex = -1;
        this.render();
    }
    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left - this.offsetX) / this.zoom;
        const y = (e.clientY - rect.top - this.offsetY) / this.zoom;
        document.getElementById('cursorPosition').textContent = `X: ${Math.round(x)}, Y: ${Math.round(y)}`;
        if (this.isDragging) {
            const dx = e.clientX - this.dragStart.x;
            const dy = e.clientY - this.dragStart.y;
            this.offsetX += dx;
            this.offsetY += dy;
            this.dragStart = { x: e.clientX, y: e.clientY };
            this.render();
            return;
        }
        if (this.isDrawing) {
            this.drawLine(this.lastPoint.x, this.lastPoint.y, x, y);
            this.lastPoint = { x, y };
        }
    }
    handleMouseUp() {
        this.isDragging = false;
        this.isDrawing = false;
    }
    handleWheel(e) {
        e.preventDefault();
        this.setZoom(this.zoom + (e.deltaY > 0 ? -0.1 : 0.1));
    }
    handleDrop(e) {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (!file || !file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                this.image = img;
                this.render();
                this.showToast('Imagen cargada', 'success');
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
    handleKeyDown(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); this.undo(); }
        if ((e.ctrlKey || e.metaKey) && e.key === 'y') { e.preventDefault(); this.redo(); }
        if (e.key === 'Delete' && this.selectedTextIndex >= 0) {
            this.textItems.splice(this.selectedTextIndex, 1);
            this.selectedTextIndex = -1;
            this.render();
        }
        if (e.key === 'Escape') {
            this.selectedTextIndex = -1;
            this.render();
        }
    }
    drawPoint(x, y) {
        if (!this.image) return;
        const ctx = this.image.getContext('2d');
        ctx.fillStyle = this.brushColor;
        ctx.beginPath();
        ctx.arc(x, y, this.brushSize / 2, 0, Math.PI * 2);
        ctx.fill();
        this.render();
    }
    drawLine(x1, y1, x2, y2) {
        if (!this.image) return;
        const ctx = this.image.getContext('2d');
        ctx.strokeStyle = this.brushColor;
        ctx.lineWidth = this.brushSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        this.render();
    }
    erasePoint(x, y) {
        if (!this.image) return;
        const ctx = this.image.getContext('2d');
        ctx.clearRect(x - this.brushSize / 2, y - this.brushSize / 2, this.brushSize, this.brushSize);
        this.render();
    }
    isPointInText(x, y, text) {
        const fontSize = text.size;
        const textWidth = text.text.length * fontSize * 0.6;
        const textHeight = fontSize * 1.2;
        const left = text.x - textWidth / 2;
        const right = text.x + textWidth / 2;
        const top = text.y - textHeight / 2;
        const bottom = text.y + textHeight / 2;
        return x >= left && x <= right && y >= top && y <= bottom;
    }
    addText() {
        const textInput = document.getElementById('textInput');
        const text = textInput.value.trim();
        if (!text) return;
        const textItem = {
            text, x: this.image.width / 2, y: this.image.height / 2,
            font: this.currentFont, size: this.textSize, color: this.textColor,
            bold: false, italic: false, underline: false, align: 'center'
        };
        this.textItems.push(textItem);
        this.selectedTextIndex = this.textItems.length - 1;
        textInput.value = '';
        this.render();
        this.showToast('Texto añadido', 'success');
    }
    openTextEditModal(index) {
        if (index < 0 || index >= this.textItems.length) return;
        this.editingTextIndex = index;
        const text = this.textItems[index];
        document.getElementById('editTextInput').value = text.text;
        document.getElementById('editTextFont').value = text.font;
        document.getElementById('editTextSize').value = text.size;
        document.getElementById('editTextSizeValue').textContent = text.size + 'px';
        document.getElementById('editTextColor').value = text.color;
        document.getElementById('textEditModal').classList.add('active');
    }
    applyTextEdit() {
        if (this.editingTextIndex < 0) return;
        const textItem = this.textItems[this.editingTextIndex];
        textItem.text = document.getElementById('editTextInput').value;
        textItem.font = document.getElementById('editTextFont').value;
        textItem.size = parseInt(document.getElementById('editTextSize').value);
        textItem.color = document.getElementById('editTextColor').value;
        this.closeTextEditModal();
        this.render();
        this.showToast('Texto actualizado', 'success');
    }
    closeTextEditModal() {
        document.getElementById('textEditModal').classList.remove('active');
        this.editingTextIndex = -1;
    }
    render() {
        if (!this.image) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            return;
        }
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        const scaledWidth = this.image.width * this.zoom;
        const scaledHeight = this.image.height * this.zoom;
        const x = this.canvas.width / 2 - scaledWidth / 2 + this.offsetX;
        const y = this.canvas.height / 2 - scaledHeight / 2 + this.offsetY;
        this.drawBackground(x, y, scaledWidth, scaledHeight);
        this.ctx.save();
        this.ctx.filter = `brightness(${this.brightness}) contrast(${this.contrast}) saturate(${this.saturation})`;
        this.applyFilter();
        this.ctx.drawImage(this.image, x, y, scaledWidth, scaledHeight);
        this.ctx.restore();
        this.drawFrame(x, y, scaledWidth, scaledHeight);
        this.textItems.forEach(text => this.drawText(text, x, y, scaledWidth, scaledHeight));
        if (this.selectedTextIndex >= 0) {
            this.drawTextSelection(x, y, scaledWidth, scaledHeight);
        }
    }
    drawBackground(x, y, width, height) {
        if (this.bgType === 'transparent') return;
        if (this.bgType === 'color') {
            this.ctx.fillStyle = this.bgColor;
            this.ctx.fillRect(x, y, width, height);
        } else if (this.bgType === 'gradient') {
            const angleRad = (45 * Math.PI) / 180;
            const x1 = x + width / 2 + Math.cos(angleRad) * width / 2;
            const y1 = y + height / 2 + Math.sin(angleRad) * height / 2;
            const x2 = x + width / 2 - Math.cos(angleRad) * width / 2;
            const y2 = y + height / 2 - Math.sin(angleRad) * height / 2;
            const gradient = this.ctx.createLinearGradient(x1, y1, x2, y2);
            gradient.addColorStop(0, this.gradientColor1);
            gradient.addColorStop(1, this.gradientColor2);
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(x, y, width, height);
        }
    }
    applyFilter() {
        switch (this.currentFilter) {
            case 'grayscale': this.ctx.filter += ` grayscale(${this.filterIntensity})`; break;
            case 'sepia': this.ctx.filter += ` sepia(${this.filterIntensity})`; break;
            case 'invert': this.ctx.filter += ` invert(${this.filterIntensity})`; break;
            case 'blur': this.ctx.filter += ` blur(${this.filterIntensity * 10}px)`; break;
            case 'vintage': this.ctx.filter += ` sepia(${this.filterIntensity * 0.5}) brightness(${1 - this.filterIntensity * 0.1})`; break;
            case 'warm': this.ctx.filter += ` hue-rotate(${-10 * this.filterIntensity}deg) saturate(${1 + this.filterIntensity * 0.2})`; break;
            case 'cool': this.ctx.filter += ` hue-rotate(${180 * this.filterIntensity}deg) saturate(${1 + this.filterIntensity * 0.2})`; break;
        }
    }
    drawFrame(x, y, width, height) {
        if (this.frameStyle === 'none') return;
        this.ctx.save();
        this.ctx.strokeStyle = this.frameColor;
        this.ctx.lineWidth = this.frameWidth * this.zoom;
        this.ctx.lineJoin = 'round';
        const halfWidth = this.frameWidth * this.zoom / 2;
        this.ctx.beginPath();
        this.ctx.rect(x - halfWidth, y - halfWidth, width + this.frameWidth * this.zoom, height + this.frameWidth * this.zoom);
        this.ctx.stroke();
        this.ctx.restore();
    }
    drawText(text, x, y, width, height) {
        this.ctx.save();
        const scaledX = x + text.x * this.zoom;
        const scaledY = y + text.y * this.zoom;
        let fontString = '';
        if (text.bold) fontString += 'bold ';
        if (text.italic) fontString += 'italic ';
        fontString += `${text.size * this.zoom}px ${text.font}`;
        this.ctx.font = fontString;
        this.ctx.fillStyle = text.color;
        this.ctx.textAlign = text.align;
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(text.text, scaledX, scaledY);
        if (text.underline) {
            const textWidth = this.ctx.measureText(text.text).width;
            const underlineY = scaledY + text.size * this.zoom / 4;
            this.ctx.strokeStyle = text.color;
            this.ctx.lineWidth = 1 * this.zoom;
            this.ctx.beginPath();
            if (text.align === 'left') { this.ctx.moveTo(scaledX, underlineY); this.ctx.lineTo(scaledX + textWidth, underlineY); }
            else if (text.align === 'center') { this.ctx.moveTo(scaledX - textWidth / 2, underlineY); this.ctx.lineTo(scaledX + textWidth / 2, underlineY); }
            else if (text.align === 'right') { this.ctx.moveTo(scaledX - textWidth, underlineY); this.ctx.lineTo(scaledX, underlineY); }
            this.ctx.stroke();
        }
        this.ctx.restore();
    }
    drawTextSelection(x, y, width, height) {
        const text = this.textItems[this.selectedTextIndex];
        if (!text) return;
        this.ctx.save();
        const scaledX = x + text.x * this.zoom;
        const scaledY = y + text.y * this.zoom;
        const textWidth = this.ctx.measureText(text.text).width;
        const textHeight = text.size * this.zoom * 1.2;
        this.ctx.strokeStyle = '#6c5ce7';
        this.ctx.lineWidth = 2 * this.zoom;
        this.ctx.setLineDash([5 * this.zoom, 5 * this.zoom]);
        let boxX, boxWidth;
        if (text.align === 'left') { boxX = scaledX; boxWidth = textWidth; }
        else if (text.align === 'center') { boxX = scaledX - textWidth / 2; boxWidth = textWidth; }
        else if (text.align === 'right') { boxX = scaledX - textWidth; boxWidth = textWidth; }
        const boxY = scaledY - textHeight / 2;
        this.ctx.strokeRect(boxX - 5 * this.zoom, boxY - 5 * this.zoom, boxWidth + 10 * this.zoom, textHeight + 10 * this.zoom);
        this.ctx.setLineDash([]);
        this.ctx.restore();
    }
    updateUI() {
        document.getElementById('brushColorSwatch').style.background = this.brushColor;
        document.getElementById('textColorSwatch').style.background = this.textColor;
        document.getElementById('frameColorSwatch').style.background = this.frameColor;
        if (this.image) {
            document.getElementById('imageSize').textContent = this.image.width + ' x ' + this.image.height + ' px';
        }
    }
    saveImage() {
        const format = document.getElementById('saveFormat').value;
        const quality = parseFloat(document.getElementById('saveQuality').value) / 100;
        const fileName = document.getElementById('saveFileName').value || 'grafify-image';
        const exportCanvas = this.createExportCanvas();
        let url;
        if (format === 'png') url = exportCanvas.toDataURL('image/png');
        else if (format === 'jpeg') url = exportCanvas.toDataURL('image/jpeg', quality);
        else if (format === 'webp') url = exportCanvas.toDataURL('image/webp', quality);
        const link = document.createElement('a');
        link.href = url; link.download = `${fileName}.${format}`;
        document.body.appendChild(link); link.click(); document.body.removeChild(link);
        this.showToast(`Imagen guardada`, 'success');
    }
    exportImage() {
        const format = document.getElementById('exportFormat').value;
        const quality = parseFloat(document.getElementById('exportQuality').value) / 100;
        let width = parseInt(document.getElementById('exportWidth').value) || this.image.width;
        let height = parseInt(document.getElementById('exportHeight').value) || this.image.height;
        const keepRatio = document.getElementById('exportKeepRatio').checked;
        if (keepRatio && width && height) {
            const ratio = this.image.width / this.image.height;
            if (width / height > ratio) width = height * ratio;
            else height = width / ratio;
        }
        const exportCanvas = this.createExportCanvas(width, height);
        let url;
        if (format === 'png') url = exportCanvas.toDataURL('image/png');
        else if (format === 'jpeg') url = exportCanvas.toDataURL('image/jpeg', quality);
        else if (format === 'webp') url = exportCanvas.toDataURL('image/webp', quality);
        else url = exportCanvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = url; link.download = `grafify-export.${format}`;
        document.body.appendChild(link); link.click(); document.body.removeChild(link);
        this.showToast(`Imagen exportada`, 'success');
    }
    createExportCanvas(width = null, height = null) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const exportWidth = width || this.image.width;
        const exportHeight = height || this.image.height;
        canvas.width = exportWidth; canvas.height = exportHeight;
        this.drawExportBackground(ctx, exportWidth, exportHeight);
        ctx.save();
        ctx.filter = `brightness(${this.brightness}) contrast(${this.contrast}) saturate(${this.saturation})`;
        this.applyFilter();
        ctx.drawImage(this.image, 0, 0, exportWidth, exportHeight);
        ctx.restore();
        this.drawExportFrame(ctx, exportWidth, exportHeight);
        this.textItems.forEach(text => this.drawExportText(ctx, text, exportWidth, exportHeight));
        return canvas;
    }
    drawExportBackground(ctx, width, height) {
        if (this.bgType === 'transparent') return;
        if (this.bgType === 'color') { ctx.fillStyle = this.bgColor; ctx.fillRect(0, 0, width, height); }
        else if (this.bgType === 'gradient') {
            const angleRad = (45 * Math.PI) / 180;
            const x1 = width / 2 + Math.cos(angleRad) * width / 2;
            const y1 = height / 2 + Math.sin(angleRad) * height / 2;
            const x2 = width / 2 - Math.cos(angleRad) * width / 2;
            const y2 = height / 2 - Math.sin(angleRad) * height / 2;
            const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
            gradient.addColorStop(0, this.gradientColor1);
            gradient.addColorStop(1, this.gradientColor2);
            ctx.fillStyle = gradient; ctx.fillRect(0, 0, width, height);
        }
    }
    drawExportFrame(ctx, width, height) {
        if (this.frameStyle === 'none') return;
        ctx.save();
        ctx.strokeStyle = this.frameColor;
        ctx.lineWidth = this.frameWidth;
        ctx.rect(0, 0, width, height);
        ctx.stroke();
        ctx.restore();
    }
    drawExportText(ctx, text, width, height) {
        ctx.save();
        let x, y;
        if (text.align === 'left') x = text.x; else if (text.align === 'center') x = width / 2; else if (text.align === 'right') x = width - text.x;
        y = height / 2 + text.y - this.image.height / 2;
        let fontString = ''; if (text.bold) fontString += 'bold '; if (text.italic) fontString += 'italic ';
        fontString += `${text.size}px ${text.font}`; ctx.font = fontString; ctx.fillStyle = text.color; ctx.textAlign = text.align; ctx.textBaseline = 'middle';
        ctx.fillText(text.text, x, y);
        if (text.underline) {
            const textWidth = ctx.measureText(text.text).width; const underlineY = y + text.size / 4;
            ctx.strokeStyle = text.color; ctx.lineWidth = 1; ctx.beginPath();
            if (text.align === 'left') { ctx.moveTo(x, underlineY); ctx.lineTo(x + textWidth, underlineY); }
            else if (text.align === 'center') { ctx.moveTo(x - textWidth / 2, underlineY); ctx.lineTo(x + textWidth / 2, underlineY); }
            else if (text.align === 'right') { ctx.moveTo(x - textWidth, underlineY); ctx.lineTo(x, underlineY); }
            ctx.stroke();
        }
        ctx.restore();
    }
    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`; toast.textContent = message;
        container.appendChild(toast);
        setTimeout(() => { toast.style.animation = 'slideIn 0.3s ease-out reverse'; setTimeout(() => toast.remove(), 300); }, 3000);
    }
    undo() { this.showToast('Deshacer', 'info'); }
    redo() { this.showToast('Rehacer', 'info'); }
}

document.addEventListener('DOMContentLoaded', () => { window.editor = new GrafifyEditor(); });
